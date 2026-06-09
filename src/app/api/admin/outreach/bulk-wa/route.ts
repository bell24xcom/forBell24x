import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { randomUUID } from 'crypto';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

const DAILY_LIMIT = 50;

// IST midnight in UTC (IST = UTC+5:30, so midnight IST = 18:30 UTC prev day)
function istDayStart(): Date {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIst    = new Date(Date.now() + istOffset);
  nowIst.setUTCHours(0, 0, 0, 0);
  return new Date(nowIst.getTime() - istOffset);
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const sentToday = await prisma.user.count({
    where: { role: 'SUPPLIER', lastOutreachAt: { gte: istDayStart() } },
  });

  const remaining  = Math.max(0, DAILY_LIMIT - sentToday);
  const configured = !!(
    (process.env.MSG91_WA_AUTH_KEY || process.env.MSG91_AUTH_KEY) &&
    process.env.MSG91_WA_PHONE &&
    process.env.MSG91_WA_TEMPLATE
  );

  return NextResponse.json({
    success: true,
    sentToday,
    remaining,
    dailyLimit: DAILY_LIMIT,
    limitReached: remaining === 0,
    configured,
  });
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body      = await req.json().catch(() => ({}));
    const requested = Math.min(Math.max(1, Number(body.count) || DAILY_LIMIT), DAILY_LIMIT);

    // ── Daily cap check (IST) ──
    const todayStart = istDayStart();
    const sentToday  = await prisma.user.count({
      where: { role: 'SUPPLIER', lastOutreachAt: { gte: todayStart } },
    });

    if (sentToday >= DAILY_LIMIT) {
      return NextResponse.json({
        success: false,
        limitReached: true,
        sentToday,
        dailyLimit: DAILY_LIMIT,
        error: `Daily limit of ${DAILY_LIMIT} reached. Resets at midnight IST.`,
      }, { status: 429 });
    }

    const canSend = Math.min(requested, DAILY_LIMIT - sentToday);

    // ── Fetch eligible suppliers ──
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const suppliers  = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        isClaimed: false,
        outreachCount: { lt: 3 },
        phone: { not: null },
        OR: [
          { lastOutreachAt: null },
          { lastOutreachAt: { lt: twoDaysAgo } },
        ],
      },
      orderBy: { trustScore: 'desc' },
      take: canSend,
      select: {
        id: true, name: true, company: true, phone: true,
        email: true, location: true, trustScore: true,
      },
    });

    if (suppliers.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0, apiSent: 0, apiFailed: 0,
        suppliers: [],
        sentToday,
        dailyLimit: DAILY_LIMIT,
        remaining: canSend,
        message: 'No eligible suppliers — all contacted recently or none with phone numbers.',
      });
    }

    // ── MSG91 WhatsApp API config ──
    const waAuthKey  = process.env.MSG91_WA_AUTH_KEY || process.env.MSG91_AUTH_KEY || '';
    const waPhone    = process.env.MSG91_WA_PHONE    || '';   // e.g. "919004962871"
    const waTemplate = process.env.MSG91_WA_TEMPLATE || '';   // approved Meta template name
    const useApi     = !!(waAuthKey && waPhone && waTemplate);

    let apiSent   = 0;
    let apiFailed = 0;
    const results: {
      id: string; company: string; phone: string | null; location: string | null;
      trustScore: number; claimLink: string; waLink: string | null; apiSent: boolean;
    }[] = [];

    for (const s of suppliers) {
      const token       = randomUUID();
      const claimLink   = `${SITE_URL}/claim/${token}`;
      const rawPhone    = (s.phone || '').replace(/\D/g, '').slice(-10);
      const companyName = s.company || s.name || 'Your Business';

      // Mark as contacted (do this before API call so partial failures are still tracked)
      await prisma.user.update({
        where: { id: s.id },
        data: {
          claimToken:    token,
          claimSentAt:   new Date(),
          outreachCount: { increment: 1 },
          lastOutreachAt: new Date(),
        },
      });

      let thisSentViaApi = false;

      // ── Try MSG91 WhatsApp API ──
      if (useApi && rawPhone.length === 10) {
        try {
          const res = await fetch(
            'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/',
            {
              method: 'POST',
              headers: { authkey: waAuthKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                integrated_number: waPhone,
                content_type: 'template',
                payload: {
                  messaging_product: 'whatsapp',
                  to: `91${rawPhone}`,
                  type: 'template',
                  template: {
                    name: waTemplate,
                    language: { code: 'en' },
                    components: [{
                      type: 'body',
                      parameters: [
                        { type: 'text', text: companyName },
                        { type: 'text', text: claimLink },
                      ],
                    }],
                  },
                },
              }),
              signal: AbortSignal.timeout(8000),
            }
          );
          if (res.ok) { apiSent++; thisSentViaApi = true; }
          else         { apiFailed++; }
        } catch {
          apiFailed++;
        }
      }

      // Always generate wa.me link as fallback / confirmation
      const msg    = encodeURIComponent(
        `Namaste! 🙏\n\n` +
        `Your business "${companyName}" has a verified profile on VyaparSethu — ` +
        `India's B2B Supplier & Buyer Network.\n\n` +
        `Verified buyers are searching for your products right now.\n\n` +
        `Claim your FREE profile in 2 minutes:\n${claimLink}\n\n` +
        `— Team VyaparSethu\nvyaparsethu.com`
      );
      const waLink = rawPhone.length === 10 ? `https://wa.me/91${rawPhone}?text=${msg}` : null;

      results.push({
        id: s.id, company: companyName, phone: s.phone,
        location: s.location, trustScore: s.trustScore,
        claimLink, waLink, apiSent: thisSentViaApi,
      });
    }

    return NextResponse.json({
      success: true,
      sent:      results.length,
      apiSent,
      apiFailed,
      useApi,
      sentToday: sentToday + results.length,
      dailyLimit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - sentToday - results.length),
      suppliers: results,
    });
  } catch (error) {
    console.error('[bulk-wa]', error);
    return NextResponse.json(
      { success: false, error: 'Bulk send failed: ' + (error instanceof Error ? error.message : 'unknown') },
      { status: 500 },
    );
  }
}
