/**
 * GET /api/admin/heatmap?days=30
 * Returns interaction heatmap data from InteractionMemory.
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
    const days = Math.min(90, Math.max(1, parseInt(req.nextUrl.searchParams.get('days') ?? '30')));

    const [timeGrid, categoryGrid, actionTotals, sourceTotals, dailyTrend] = await Promise.all([

      // Hour × Day-of-week activity grid (0=Sun … 6=Sat)
      prisma.$queryRaw<Array<{ hour: number; dow: number; count: number }>>(
        Prisma.sql`
          SELECT
            EXTRACT(HOUR FROM created_at)::int   AS hour,
            EXTRACT(DOW  FROM created_at)::int   AS dow,
            COUNT(*)::int                         AS count
          FROM interaction_memory
          WHERE created_at >= NOW() - make_interval(days => ${days})
          GROUP BY hour, dow
          ORDER BY dow, hour
        `
      ),

      // Category × ActionType grid (via RFQ join)
      prisma.$queryRaw<Array<{ category: string; action_type: string; count: number }>>(
        Prisma.sql`
          SELECT
            r.category,
            im.action_type,
            COUNT(*)::int AS count
          FROM interaction_memory im
          JOIN rfqs r ON r.id = im.rfq_id
          WHERE im.created_at >= NOW() - make_interval(days => ${days})
            AND r.category IS NOT NULL
            AND r.category <> ''
          GROUP BY r.category, im.action_type
          ORDER BY count DESC
          LIMIT 300
        `
      ),

      // Action type totals
      prisma.interactionMemory.groupBy({
        by: ['actionType'],
        where: { createdAt: { gte: new Date(Date.now() - days * 86400000) } },
        _count: { _all: true },
        orderBy: { _count: { actionType: 'desc' } },
      }),

      // Source totals
      prisma.interactionMemory.groupBy({
        by: ['source'],
        where: {
          createdAt: { gte: new Date(Date.now() - days * 86400000) },
          source: { not: null },
        },
        _count: { _all: true },
        orderBy: { _count: { source: 'desc' } },
      }),

      // Daily interaction counts (last N days)
      prisma.$queryRaw<Array<{ date: string; count: number }>>(
        Prisma.sql`
          SELECT
            TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS count
          FROM interaction_memory
          WHERE created_at >= NOW() - make_interval(days => ${days})
          GROUP BY date
          ORDER BY date ASC
        `
      ),
    ]);

    return NextResponse.json({
      success: true,
      days,
      timeGrid:      timeGrid.map(r => ({ hour: r.hour, dow: r.dow, count: Number(r.count) })),
      categoryGrid:  categoryGrid.map(r => ({ category: r.category, actionType: r.action_type, count: Number(r.count) })),
      actionTotals:  actionTotals.map(r => ({ actionType: r.actionType, count: r._count._all })),
      sourceTotals:  sourceTotals.map(r => ({ source: r.source ?? 'unknown', count: r._count._all })),
      dailyTrend:    dailyTrend.map(r => ({ date: r.date, count: Number(r.count) })),
    });
  } catch (error) {
    console.error('[Heatmap API] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load heatmap data' }, { status: 500 });
  }
}
