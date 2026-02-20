import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Enforce admin auth
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const now        = new Date();
    const last24h    = new Date(now.getTime() - 24  * 60 * 60 * 1000);
    const last7days  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, activeUsers, newUsersToday, newUsersWeek,
      totalRFQs, activeRFQs, rfqsToday, rfqsWeek,
      acceptedRFQs, completedRFQs, cancelledRFQs,
      totalQuotes, quotesToday, acceptedQuotes,
      totalTx, completedTx,
      pendingNotifications,
      recentRFQs,
      recentQuotes,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: last24h } } }),
      prisma.user.count({ where: { createdAt: { gte: last7days } } }),

      // RFQs
      prisma.rFQ.count(),
      prisma.rFQ.count({ where: { status: 'ACTIVE' } }),
      prisma.rFQ.count({ where: { createdAt: { gte: last24h } } }),
      prisma.rFQ.count({ where: { createdAt: { gte: last7days } } }),
      prisma.rFQ.count({ where: { status: 'ACCEPTED' } }),
      prisma.rFQ.count({ where: { status: 'COMPLETED' } }),
      prisma.rFQ.count({ where: { status: 'CANCELLED' } }),

      // Quotes
      prisma.quote.count(),
      prisma.quote.count({ where: { createdAt: { gte: last24h } } }),
      prisma.quote.count({ where: { status: 'ACCEPTED' } }),

      // Transactions
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),

      // Unread notifications (system health proxy)
      prisma.notification.count({ where: { isRead: false } }),

      // Recent RFQ activity (last 24h)
      prisma.rFQ.findMany({
        where: { createdAt: { gte: last24h } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, title: true, status: true, category: true,
          createdAt: true,
          user: { select: { name: true, company: true } },
        },
      }),

      // Recent quotes (last 24h)
      prisma.quote.findMany({
        where: { createdAt: { gte: last24h } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, price: true, status: true, createdAt: true,
          rfq:      { select: { title: true } },
          supplier: { select: { name: true, company: true } },
        },
      }),
    ]);

    // Escrow / transaction volume
    const volumeResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });
    const completedVolume = Number(volumeResult._sum.amount ?? 0);

    // Health score: weighted across key ratios
    const rfqConversionRate = totalRFQs  > 0 ? (acceptedQuotes  / totalRFQs)  * 100 : 100;
    const txSuccessRate     = totalTx    > 0 ? (completedTx     / totalTx)    * 100 : 100;
    const userActivityRate  = totalUsers > 0 ? (activeUsers     / totalUsers) * 100 : 100;
    const systemHealth      = Math.round(((rfqConversionRate + txSuccessRate + userActivityRate) / 3) * 10) / 10;

    // Auto-alerts from real data
    const alerts: Array<{ type: string; message: string; timestamp: string }> = [];
    if (systemHealth < 80)        alerts.push({ type: 'warning',  message: 'System health below 80% — check conversion rates', timestamp: now.toISOString() });
    if (cancelledRFQs > totalRFQs * 0.3) alerts.push({ type: 'warning',  message: 'High RFQ cancellation rate (>30%)', timestamp: now.toISOString() });
    if (pendingNotifications > 500)       alerts.push({ type: 'info',     message: `${pendingNotifications} unread notifications pending`, timestamp: now.toISOString() });

    return NextResponse.json({
      success: true,
      systemHealth,
      metrics: {
        users: {
          total: totalUsers, active: activeUsers,
          newToday: newUsersToday, newThisWeek: newUsersWeek,
        },
        rfqs: {
          total: totalRFQs, active: activeRFQs,
          today: rfqsToday, thisWeek: rfqsWeek,
          accepted: acceptedRFQs, completed: completedRFQs, cancelled: cancelledRFQs,
        },
        quotes: {
          total: totalQuotes, today: quotesToday, accepted: acceptedQuotes,
          conversionRate: rfqConversionRate.toFixed(1),
        },
        transactions: {
          total: totalTx, completed: completedTx,
          completedVolume,
          successRate: txSuccessRate.toFixed(1),
        },
      },
      recentActivity: {
        rfqs: recentRFQs.map(r => ({
          id: r.id,
          title: r.title,
          status: r.status,
          category: r.category,
          buyer: r.user?.company || r.user?.name || 'Unknown',
          minutesAgo: Math.round((now.getTime() - r.createdAt.getTime()) / 60000),
        })),
        quotes: recentQuotes.map(q => ({
          id: q.id,
          rfqTitle: q.rfq.title,
          price: q.price,
          status: q.status,
          supplier: q.supplier.company || q.supplier.name || 'Unknown',
          minutesAgo: Math.round((now.getTime() - q.createdAt.getTime()) / 60000),
        })),
      },
      alerts,
      lastUpdated: now.toISOString(),
    });

  } catch (error) {
    console.error('Admin monitoring error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch monitoring data' }, { status: 500 });
  }
}
