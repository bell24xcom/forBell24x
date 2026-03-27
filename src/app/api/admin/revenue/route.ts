/**
 * GET /api/admin/revenue?days=30
 * Returns wallet + subscription revenue data.
 * Protected — requires admin-token cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const days  = Math.min(90, Math.max(1, parseInt(req.nextUrl.searchParams.get('days') ?? '30')));
    const since = new Date(Date.now() - days * 86400000);

    const [
      allTimeDeposits,
      periodDeposits,
      planDistribution,
      recentTxns,
      monthlyRevenue,
      subscriptionEvents,
    ] = await Promise.all([

      // All-time wallet credits
      prisma.walletTransaction.aggregate({
        where: { type: 'CREDIT' },
        _sum: { amount: true },
        _count: { _all: true },
      }),

      // Period wallet credits
      prisma.walletTransaction.aggregate({
        where: { type: 'CREDIT', createdAt: { gte: since } },
        _sum: { amount: true },
        _count: { _all: true },
      }),

      // Users by plan
      prisma.user.groupBy({
        by: ['plan'],
        _count: { _all: true },
      }),

      // Recent 20 credit transactions with user info
      prisma.walletTransaction.findMany({
        where: { type: 'CREDIT' },
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: {
            include: {
              user: { select: { name: true, company: true, phone: true } },
            },
          },
        },
      }),

      // Monthly revenue (last 6 months)
      prisma.$queryRaw<Array<{ month: string; total: number; txn_count: number }>>(
        Prisma.sql`
          SELECT
            TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
            SUM(amount)::float                                  AS total,
            COUNT(*)::int                                       AS txn_count
          FROM wallet_transactions
          WHERE type = 'CREDIT'
            AND created_at >= NOW() - INTERVAL '6 months'
          GROUP BY month
          ORDER BY month ASC
        `
      ),

      // Subscription activations in period
      prisma.interactionMemory.findMany({
        where: {
          actionType: 'subscription_activated',
          createdAt: { gte: since },
        },
        select: { userId: true, metadata: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      success: true,
      days,
      allTimeRevenue:     allTimeDeposits._sum.amount ?? 0,
      allTimeDeposits:    allTimeDeposits._count._all,
      periodRevenue:      periodDeposits._sum.amount ?? 0,
      periodDeposits:     periodDeposits._count._all,
      avgTransaction:     allTimeDeposits._count._all > 0
        ? Math.round((allTimeDeposits._sum.amount ?? 0) / allTimeDeposits._count._all)
        : 0,
      planDistribution:   planDistribution.map(p => ({ plan: p.plan, count: p._count._all })),
      recentTransactions: recentTxns.map(t => ({
        id:          t.id,
        amount:      t.amount,
        description: t.description,
        reference:   t.reference,
        createdAt:   t.createdAt.toISOString(),
        user: {
          name:    t.wallet?.user?.name    ?? null,
          company: t.wallet?.user?.company ?? null,
          phone:   t.wallet?.user?.phone   ?? null,
        },
      })),
      monthlyRevenue:     monthlyRevenue.map(r => ({
        month:    r.month,
        total:    Number(r.total),
        txnCount: Number(r.txn_count),
      })),
      subscriptionEvents: subscriptionEvents.map(e => ({
        userId:    e.userId,
        metadata:  e.metadata,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Revenue API] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load revenue data' }, { status: 500 });
  }
}
