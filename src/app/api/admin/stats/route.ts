import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '7d';
  const rangeMap: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
  const days  = rangeMap[range] || 7;
  const since = new Date(Date.now() - days * 86400000);

  try {
    const now          = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const threeDays    = new Date(Date.now() + 3 * 86400000);
    const oneDayAgo    = new Date(Date.now() - 86400000);

    const [
      totalUsers, buyers, suppliers,
      newToday, newThisWeek,
      totalRFQs, activeRFQs, completedRFQs, cancelledRFQs,
      totalQuotes, acceptedQuotes, pendingQuotes,
      totalTx, completedTx,
      highTrustSuppliers,
      // Quick action counts
      pendingKyc,
      unansweredRfqs,
      expiringSoon,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BUYER'    } }),
      prisma.user.count({ where: { role: 'SUPPLIER' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek  } } }),
      prisma.rFQ.count(),
      prisma.rFQ.count({ where: { status: 'ACTIVE'    } }),
      prisma.rFQ.count({ where: { status: 'COMPLETED' } }),
      prisma.rFQ.count({ where: { status: 'CANCELLED' } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'ACCEPTED' } }),
      prisma.quote.count({ where: { status: 'PENDING'  } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { role: 'SUPPLIER', trustScore: { gte: 70 } } }),
      // Quick actions
      prisma.user.count({ where: { isVerified: false, isActive: true } }),
      prisma.rFQ.count({ where: { status: 'ACTIVE', quotes: { none: {} } } }),
      prisma.rFQ.count({ where: { status: 'ACTIVE', expiresAt: { lte: threeDays, gt: now } } }),
    ]);

    const [seededRfqs, realRfqs] = await Promise.all([
      prisma.rFQ.count({ where: { isSeeded: true } }),
      prisma.rFQ.count({ where: { isSeeded: false } }),
    ]);

    const volumeResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });
    const completedVolume = Number(volumeResult._sum.amount ?? 0);

    const planDist = await prisma.user.groupBy({ by: ['plan'], _count: { _all: true } });
    const plans    = Object.fromEntries(planDist.map(p => [p.plan, p._count._all]));

    // Activity feed — last 24h events
    const [recentUsers, recentRFQs, recentQuotes] = await Promise.all([
      prisma.user.findMany({
        where:   { createdAt: { gte: oneDayAgo } },
        select:  { name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.rFQ.findMany({
        where:   { createdAt: { gte: oneDayAgo } },
        select:  { title: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.quote.findMany({
        where:   { createdAt: { gte: oneDayAgo } },
        select:  { price: true, createdAt: true, rfq: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const activity = [
      ...recentUsers.map(u => ({ type: 'user',  label: `New user joined: ${u.name || 'unknown'}`, time: timeAgo(new Date(u.createdAt)), ts: u.createdAt })),
      ...recentRFQs.map(r  => ({ type: 'rfq',   label: `New RFQ: ${r.title}`,                      time: timeAgo(new Date(r.createdAt)), ts: r.createdAt })),
      ...recentQuotes.map(q => ({ type: 'quote', label: `Quote ₹${q.price.toLocaleString('en-IN')} on "${q.rfq?.title || 'RFQ'}"`, time: timeAgo(new Date(q.createdAt)), ts: q.createdAt })),
    ]
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 15)
      .map(({ ts: _ts, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      stats: {
        range,
        users:        { total: totalUsers, buyers, suppliers, newToday, newThisWeek },
        rfqs:         { total: totalRFQs, active: activeRFQs, completed: completedRFQs, cancelled: cancelledRFQs, seeded: seededRfqs, real: realRfqs },
        quotes:       { total: totalQuotes, accepted: acceptedQuotes, pending: pendingQuotes },
        transactions: { total: totalTx, completed: completedTx, completedVolume },
        funnel: {
          rfqsCreated:     totalRFQs,
          quotesSubmitted: totalQuotes,
          quotesAccepted:  acceptedQuotes,
          dealsCompleted:  completedTx,
          conversionRate:  totalRFQs > 0 ? ((completedTx / totalRFQs) * 100).toFixed(1) : '0',
        },
        trust: { highTrustSuppliers },
        plans: { FREE: plans['FREE'] ?? 0, PRO: plans['PRO'] ?? 0, ENTERPRISE: plans['ENTERPRISE'] ?? 0 },
        pendingKyc,
        unansweredRfqs,
        expiringSoon,
        activity,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 });
  }
}
