import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { sendEmail as _sendEmail } from '@/lib/email';
import { SITE_URL, SITE_HOST } from '@/lib/site-url';
const resendService = { sendEmail: ({ to, subject, html }: { to: string; subject: string; html: string }) => _sendEmail(to, subject, html) };

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    // Optional: target specific supplier IDs (from CRM invite button)
    const body = await req.json().catch(() => ({}));
    const supplierIds: string[] = Array.isArray(body.supplierIds) ? body.supplierIds : [];

    const where: Record<string, unknown> = {
      isClaimed: false,
      isActive: true,
    };
    if (supplierIds.length > 0) {
      where.id = { in: supplierIds };
    } else {
      // Bulk send: only those with email
      where.email = { not: null };
    }

    // Fetch unclaimed suppliers with email who haven't been invited recently
    const unclaimedWithEmail = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        location: true,
        preferences: true,
      },
      take: 100,
    });

    let sent = 0;

    for (const supplier of unclaimedWithEmail) {
      if (!supplier.email) continue;

      const prefs = supplier.preferences as Record<string, unknown> | null;
      const categories: string[] = Array.isArray(prefs?.categories) ? (prefs.categories as string[]) : [];
      const claimUrl = `${SITE_URL}/auth/phone-email?claim=${supplier.id}`;

      try {
        await resendService.sendEmail({
          to: supplier.email,
          subject: `${supplier.company || 'Your business'} — Claim your profile on VyaparSethu`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#EA580C,#F97316);padding:20px 24px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu</h1>
                <p style="color:#FED7AA;margin:4px 0 0;font-size:14px;">India's B2B Trade Network</p>
              </div>
              <div style="padding:28px 24px;background:#f8fafc;">
                <p style="font-size:16px;color:#1E293B;">Namaste,</p>
                <p style="color:#475569;">We've created a business profile for <strong>${supplier.company || 'your business'}</strong> on VyaparSethu${supplier.location ? ` in ${supplier.location}` : ''}${categories.length > 0 ? ` for <strong>${categories.join(', ')}</strong>` : ''}.</p>
                <p style="color:#475569;">We're building this with Indian suppliers. Your feedback shapes the product.</p>
                <p style="color:#475569;">Claim your free profile to start receiving Quotation Requests from buyers across India.</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${claimUrl}" style="display:inline-block;background:#F97316;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
                    Claim My Profile →
                  </a>
                </div>
                <p style="color:#94A3B8;font-size:13px;">This profile was created based on publicly available business information. Claiming is free and takes under 2 minutes.</p>
                <p style="color:#475569;margin-top:24px;">Regards,<br><strong>Vishal Pendharkar</strong><br>Founder, VyaparSethu</p>
              </div>
              <div style="background:#f1f5f9;padding:16px 24px;text-align:center;color:#64748b;font-size:12px;">
                VyaparSethu · Digitex Studio · ${SITE_HOST}<br>
                <a href="${claimUrl}" style="color:#F97316;text-decoration:none;">Claim your profile</a>
              </div>
            </div>
          `,
        });
        sent++;
        // Rate limit: 1 second between sends
        await new Promise(r => setTimeout(r, 1000));
      } catch {
        // fire-and-forget — one failure doesn't stop the rest
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      total: unclaimedWithEmail.length,
      message: `Sent ${sent} invitation emails`,
    });
  } catch (error) {
    console.error('Send invitations error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send invitations' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const count = await prisma.user.count({
    where: { isClaimed: false, email: { not: null }, isActive: true },
  });
  return NextResponse.json({ success: true, eligibleCount: count });
}
