/**
 * GET|POST /api/cron/onboarding-drip
 * ─────────────────────────────────────────────────────────────────────────────
 * Post-registration onboarding drip for suppliers who claimed their profile.
 * Runs once daily via /api/cron/daily.
 *
 * Drip schedule (days since account created / profile claimed):
 *   Day 0:  Send welcome email immediately after claim (handled by claim route — this
 *           cron catches any missed by checking InteractionMemory for welcome_sent).
 *   Day 3:  Profile incomplete → send profile completion reminder.
 *   Day 7:  No quote submitted → send first-quote nudge.
 *
 * Idempotent — each action is written to InteractionMemory and checked before send.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { storeInteraction } from '@/lib/memory-engine';
import { verifyCronSecret } from '@/lib/cronAuth';
import {
  supplierProfileReminderEmail,
  supplierFirstQuoteEmail,
} from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vyaparsethu.com';

async function run(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CRON_START] /api/cron/onboarding-drip');

  try {
    const now = Date.now();

    // Fetch claimed suppliers registered in the last 30 days with an email
    const thirtyDaysAgo = new Date(now - 30 * 86400000);
    const threeDaysAgo  = new Date(now - 3  * 86400000);
    const sevenDaysAgo  = new Date(now - 7  * 86400000);

    const recentSuppliers = await prisma.user.findMany({
      where: {
        isClaimed: true,
        isActive: true,
        email: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (recentSuppliers.length === 0) {
      console.log('[CRON_END] /api/cron/onboarding-drip — no recent suppliers');
      return NextResponse.json({ success: true, processed: 0, timestamp: new Date().toISOString() });
    }

    const supplierIds = recentSuppliers.map(s => s.id);

    // Fetch onboarding drip history and quote history in batch
    const [dripHistory, quotes] = await Promise.all([
      prisma.interactionMemory.findMany({
        where: {
          userId: { in: supplierIds },
          actionType: { in: ['onboarding_day3_sent', 'onboarding_day7_sent'] },
        },
        select: { userId: true, actionType: true },
      }),
      prisma.quote.findMany({
        where: { supplierId: { in: supplierIds } },
        select: { supplierId: true },
        distinct: ['supplierId'],
      }),
    ]);

    const dripSentSet = new Set(dripHistory.map(d => `${d.userId}:${d.actionType}`));
    const hasQuotedSet = new Set(quotes.map(q => q.supplierId));

    let day3Sent = 0;
    let day7Sent = 0;
    const errors: string[] = [];

    for (const supplier of recentSuppliers) {
      if (!supplier.email) continue;

      const prefs = supplier.preferences as Record<string, unknown> | null;
      const categories: string[] = Array.isArray(prefs?.categories) ? (prefs.categories as string[]) : [];
      const category = categories[0] || 'your category';
      const profileComplete = !!(prefs?.description && categories.length > 0);
      const createdMs = supplier.createdAt.getTime();

      // ── Day 3 — profile reminder ────────────────────────────────────────────
      const isDay3Window = createdMs <= threeDaysAgo.getTime() && createdMs > sevenDaysAgo.getTime();
      if (
        isDay3Window &&
        !profileComplete &&
        !dripSentSet.has(`${supplier.id}:onboarding_day3_sent`)
      ) {
        const profileUrl = `${SITE_URL}/supplier/profile/edit`;
        const { subject, html } = supplierProfileReminderEmail(
          supplier.name ?? '',
          supplier.company ?? '',
          category,
          profileUrl,
        );

        try {
          const result = await sendEmail(supplier.email, subject, html);
          if (result.success) {
            await storeInteraction({
              userId: supplier.id,
              actionType: 'onboarding_day3_sent',
              source: 'email',
              metadata: { category, sentAt: new Date().toISOString() },
            });
            day3Sent++;
          }
        } catch (err) {
          errors.push(`day3/${supplier.id}: ${err instanceof Error ? err.message : 'unknown'}`);
        }
        await new Promise(r => setTimeout(r, 1000));
        continue; // one email per supplier per run
      }

      // ── Day 7 — first quote nudge ───────────────────────────────────────────
      const isDay7Window = createdMs <= sevenDaysAgo.getTime() && createdMs > new Date(now - 14 * 86400000).getTime();
      if (
        isDay7Window &&
        !hasQuotedSet.has(supplier.id) &&
        !dripSentSet.has(`${supplier.id}:onboarding_day7_sent`)
      ) {
        const rfqUrl = `${SITE_URL}/supplier/browse-rfqs`;
        const { subject, html } = supplierFirstQuoteEmail(
          supplier.name ?? '',
          supplier.company ?? '',
          category,
          rfqUrl,
        );

        try {
          const result = await sendEmail(supplier.email, subject, html);
          if (result.success) {
            await storeInteraction({
              userId: supplier.id,
              actionType: 'onboarding_day7_sent',
              source: 'email',
              metadata: { category, sentAt: new Date().toISOString() },
            });
            day7Sent++;
          }
        } catch (err) {
          errors.push(`day7/${supplier.id}: ${err instanceof Error ? err.message : 'unknown'}`);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const totalSent = day3Sent + day7Sent;
    console.log('[CRON_END] /api/cron/onboarding-drip', { totalSent, day3Sent, day7Sent, errors: errors.length });

    return NextResponse.json({
      success: true,
      processed: recentSuppliers.length,
      totalSent,
      day3Sent,
      day7Sent,
      errors: errors.slice(0, 5),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API_ERROR] /api/cron/onboarding-drip', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) { return run(request); }
export async function POST(request: NextRequest) { return run(request); }
