/**
 * GET /api/admin/launch-metrics
 * Thin wrapper around outreach-stats that adds supplier pipeline counts
 * and the sprint's hard north-star metric (Trust Velocity).
 * The /admin/launch-metrics page calls /api/admin/outreach-stats directly;
 * this route is available for external tooling / future dashboard widgets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const days   = Math.min(90, Math.max(1, parseInt(req.nextUrl.searchParams.get('days') ?? '30')));
    const since  = new Date(Date.now() - days * 86400_000);
    const since7 = new Date(Date.now() - 7   * 86400_000);

    const [
      totalSuppliers, claimedSuppliers, pendingOutreach,
      totalRfqs, activeRfqs, closedDeals,
      dealsThisWeek,
      outreachActions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'SUPPLIER' } }),
      prisma.user.count({ where: { role: 'SUPPLIER', isClaimed: true } }),
      prisma.user.count({ where: { role: 'SUPPLIER', isClaimed: false, outreachCount: { lt: 3 }, phone: { not: null } } }),
      prisma.rFQ.count(),
      prisma.rFQ.count({ where: { status: 'ACTIVE' } }),
      prisma.deal.count(),
      prisma.deal.count({ where: { createdAt: { gte: since7 } } }),
      prisma.interactionMemory.groupBy({
        by: ['actionType'],
        where: {
          actionType: { in: ['outreach_sent', 'subscription_activated', 'whatsapp_click'] },
          createdAt:  { gte: since },
        },
        _count: { _all: true },
      }),
    ]);

    const actionMap = Object.fromEntries(
      outreachActions.map(a => [a.actionType, a._count._all])
    );

    return NextResponse.json({
      success: true,
      days,
      trustVelocity: {
        dealsThisWeek,
        unit: 'trades/week',
        note: 'North-star metric: Successful Transactions ÷ Time',
      },
      suppliers: {
        total:          totalSuppliers,
        claimed:        claimedSuppliers,
        claimRate:      totalSuppliers > 0 ? ((claimedSuppliers / totalSuppliers) * 100).toFixed(1) + '%' : '0%',
        pendingOutreach,
      },
      rfqs: {
        total:  totalRfqs,
        active: activeRfqs,
      },
      deals: {
        total:     closedDeals,
        thisWeek:  dealsThisWeek,
      },
      outreach: {
        sent:          actionMap['outreach_sent']          ?? 0,
        subscriptions: actionMap['subscription_activated'] ?? 0,
        waClicks:      actionMap['whatsapp_click']         ?? 0,
      },
    });
  } catch (error: any) {
    console.error('[Launch Metrics]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
