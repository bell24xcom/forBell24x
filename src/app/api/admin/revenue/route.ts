/**
 * GET /api/admin/revenue?days=30
 * Returns wallet + subscription revenue data.
 * Protected — requires admin-token cookie.
 *
 * Each metric below is fetched and isolated independently (see
 * docs/audits/VS-ADMIN-PRODUCTION-AUDIT-FIX-01.md, Finding 1 and Phase 3 of
 * VS-ADMIN-FIX-IMPLEMENTATION-01). Previously all 6 queries ran in one
 * Promise.all — any single failure (a transient Neon pool timeout, or the
 * hand-written $queryRaw hitting a Postgres error) threw the whole route
 * into a generic 500 with the message "Failed to load revenue data" and no
 * way to tell which query actually failed. Now a failing metric defaults to
 * an empty/zero value and is recorded in `errors`; the page still renders
 * with whatever did succeed instead of going fully blank. `success` is only
 * false when every metric failed (the strongest signal of a real DB outage
 * rather than one flaky query).
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    return code ? `${err.name}[${code}]: ${err.message}` : `${err.name}: ${err.message}`;
  }
  return 'Unknown error';
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const errors: Record<string, string> = {};

  // Runs one query in isolation: a failure here never affects the other 5.
  // Logs full detail server-side (so the next occurrence is diagnosable in
  // one shot) and records a short message per key in `errors`.
  async function safeQuery<T>(key: string, fallback: T, run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (err) {
      errors[key] = describeError(err);
      console.error(`[Revenue API] "${key}" query failed:`, err);
      return fallback;
    }
  }

  try {
    const parsedDays = parseInt(req.nextUrl.searchParams.get('days') ?? '30');
    const days = Math.min(90, Math.max(1, Number.isFinite(parsedDays) ? parsedDays : 30));
    const since = new Date(Date.now() - days * 86400000);
    const sixMonthsAgo = new Date(Date.now() - 183 * 86400000);

    const [allTimeDeposits, periodDeposits, planDistribution, recentTxns, monthlyTxns, subscriptionEvents] =
      await Promise.all([
        // All-time wallet credits
        safeQuery(
          'allTimeDeposits',
          { _sum: { amount: null as number | null }, _count: { _all: 0 } },
          () =>
            prisma.walletTransaction.aggregate({
              where: { type: 'CREDIT' },
              _sum: { amount: true },
              _count: { _all: true },
            }),
        ),

        // Period wallet credits
        safeQuery(
          'periodDeposits',
          { _sum: { amount: null as number | null }, _count: { _all: 0 } },
          () =>
            prisma.walletTransaction.aggregate({
              where: { type: 'CREDIT', createdAt: { gte: since } },
              _sum: { amount: true },
              _count: { _all: true },
            }),
        ),

        // Users by plan
        safeQuery('planDistribution', [] as Awaited<ReturnType<typeof fetchPlanDistribution>>, fetchPlanDistribution),

        // Recent 20 credit transactions with user info
        safeQuery('recentTransactions', [] as Awaited<ReturnType<typeof fetchRecentTxns>>, () =>
          fetchRecentTxns(),
        ),

        // Monthly revenue (last 6 months) — grouped in JS below, not in SQL.
        // This used to be the route's only hand-written $queryRaw, and the
        // prime suspect for "Failed to load revenue data" (raw SQL is more
        // fragile than a typed query — Postgres date-function/column-casing
        // drift fails here in ways a typed query can't). Replaced with a
        // plain typed findMany; same output shape once grouped below.
        safeQuery('monthlyRevenue', [] as Array<{ amount: number; createdAt: Date }>, () =>
          prisma.walletTransaction.findMany({
            where: { type: 'CREDIT', createdAt: { gte: sixMonthsAgo } },
            select: { amount: true, createdAt: true },
          }),
        ),

        // Subscription activations in period
        safeQuery(
          'subscriptionEvents',
          [] as Array<{ userId: string | null; metadata: unknown; createdAt: Date }>,
          () =>
            prisma.interactionMemory.findMany({
              where: {
                actionType: 'subscription_activated',
                createdAt: { gte: since },
              },
              select: { userId: true, metadata: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 20,
            }),
        ),
      ]);

    // Group the flat 6-month transaction list into per-month totals — the
    // in-memory equivalent of the old raw SQL's GROUP BY. `.slice(0, 7)` on
    // an ISO string gives the UTC year-month, matching the old query's
    // `AT TIME ZONE 'UTC'` truncation.
    const monthlyMap = new Map<string, { total: number; txnCount: number }>();
    for (const t of monthlyTxns) {
      const month = t.createdAt.toISOString().slice(0, 7);
      const entry = monthlyMap.get(month) ?? { total: 0, txnCount: 0 };
      entry.total += t.amount;
      entry.txnCount += 1;
      monthlyMap.set(month, entry);
    }
    const monthlyRevenue = Array.from(monthlyMap.entries())
      .map(([month, v]) => ({ month, total: v.total, txnCount: v.txnCount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const failedCount = Object.keys(errors).length;

    if (failedCount === 6) {
      // Every metric failed — almost certainly a real DB/connectivity
      // problem, not one flaky query. Preserve the original contract
      // (success:false, generic client-facing error) but log + return full
      // per-query detail so the next occurrence doesn't require
      // re-diagnosing from scratch.
      console.error('[Revenue API] all 6 queries failed:', errors);
      return NextResponse.json(
        { success: false, error: 'Failed to load revenue data', errors },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      days,
      allTimeRevenue: allTimeDeposits._sum.amount ?? 0,
      allTimeDeposits: allTimeDeposits._count._all,
      periodRevenue: periodDeposits._sum.amount ?? 0,
      periodDeposits: periodDeposits._count._all,
      avgTransaction:
        allTimeDeposits._count._all > 0
          ? Math.round((allTimeDeposits._sum.amount ?? 0) / allTimeDeposits._count._all)
          : 0,
      planDistribution: planDistribution.map((p) => ({ plan: p.plan, count: p._count._all })),
      recentTransactions: recentTxns.map((t) => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        reference: t.reference,
        createdAt: t.createdAt.toISOString(),
        user: {
          name: t.wallet?.user?.name ?? null,
          company: t.wallet?.user?.company ?? null,
          phone: t.wallet?.user?.phone ?? null,
        },
      })),
      monthlyRevenue,
      subscriptionEvents: subscriptionEvents.map((e) => ({
        userId: e.userId,
        metadata: e.metadata,
        createdAt: e.createdAt.toISOString(),
      })),
      // Additive — existing consumers reading only the fields above are
      // unaffected. `degraded` is true when the page rendered successfully
      // but one or more (not all) of the 6 metrics failed.
      degraded: failedCount > 0,
      errors,
    });
  } catch (error) {
    // Last-resort net for anything outside the per-query isolation above
    // (e.g. a bug in this handler itself, or param parsing throwing
    // unexpectedly).
    console.error('[Revenue API] unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load revenue data', errors: { unexpected: describeError(error) } },
      { status: 500 },
    );
  }
}

function fetchPlanDistribution() {
  return prisma.user.groupBy({ by: ['plan'], _count: { _all: true } });
}

function fetchRecentTxns() {
  return prisma.walletTransaction.findMany({
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
  });
}
