/**
 * GET /api/metrics/funnel?days=30
 * Returns the complete Bell24h business funnel:
 * Outreach → WA Click → Quote → Deal → Revenue
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
    const prev  = new Date(Date.now() - days * 2 * 86400000);

    const [
      // Current period
      rfqsCreated,
      rfqsActive,
      quotesSubmitted,
      dealsCreated,
      dealsCompleted,
      revenue,
      outreachSent,
      waClicks,
      subscriptions,
      followUp1,
      followUp2,
      drips,
      // Previous period for growth %
      prevRfqs,
      prevQuotes,
      prevDeals,
      prevRevenue,
      // Category breakdown of RFQs (top 8)
      categoryBreakdown,
      // Daily RFQ trend
      dailyRfqs,
    ] = await Promise.all([
      // Period counts
      prisma.rFQ.count({ where: { createdAt: { gte: since } } }),
      prisma.rFQ.count({ where: { status: 'ACTIVE' } }),
      prisma.quote.count({ where: { createdAt: { gte: since } } }),
      prisma.deal.count({ where: { createdAt: { gte: since } } }),
      prisma.deal.count({ where: { createdAt: { gte: since }, status: 'COMPLETED' } }),
      prisma.walletTransaction.aggregate({
        where: { type: 'CREDIT', createdAt: { gte: since } },
        _sum: { amount: true },
      }),
      prisma.interactionMemory.count({ where: { actionType: 'outreach_sent', createdAt: { gte: since } } }),
      prisma.interactionMemory.count({ where: { actionType: 'whatsapp_click', createdAt: { gte: since } } }),
      prisma.interactionMemory.count({ where: { actionType: 'subscription_activated', createdAt: { gte: since } } }),
      prisma.interactionMemory.count({ where: { actionType: 'follow_up_1_sent', createdAt: { gte: since } } }),
      prisma.interactionMemory.count({ where: { actionType: 'follow_up_2_sent', createdAt: { gte: since } } }),
      prisma.interactionMemory.count({
        where: {
          actionType: { in: ['drip_day3_sent', 'drip_day7_sent', 'drip_day14_sent'] },
          createdAt: { gte: since },
        },
      }),
      // Previous period
      prisma.rFQ.count({ where: { createdAt: { gte: prev, lt: since } } }),
      prisma.quote.count({ where: { createdAt: { gte: prev, lt: since } } }),
      prisma.deal.count({ where: { createdAt: { gte: prev, lt: since } } }),
      prisma.walletTransaction.aggregate({
        where: { type: 'CREDIT', createdAt: { gte: prev, lt: since } },
        _sum: { amount: true },
      }),
      // Category breakdown
      prisma.rFQ.groupBy({
        by: ['category'],
        where: { createdAt: { gte: since }, category: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { category: 'desc' } },
        take: 8,
      }),
      // Daily trend
      prisma.$queryRaw<Array<{ date: string; count: number }>>(
        Prisma.sql`
          SELECT
            TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS count
          FROM rfqs
          WHERE created_at >= NOW() - make_interval(days => ${days})
          GROUP BY date ORDER BY date ASC
        `
      ),
    ]);

    const revenueAmt     = revenue._sum.amount ?? 0;
    const prevRevenueAmt = prevRevenue._sum.amount ?? 0;

    const growth = (cur: number, prev: number) =>
      prev > 0 ? +((((cur - prev) / prev) * 100).toFixed(1)) : 0;

    // Conversion rates
    const quoteRate   = rfqsCreated > 0 ? +((quotesSubmitted / rfqsCreated) * 100).toFixed(1) : 0;
    const dealRate    = quotesSubmitted > 0 ? +((dealsCreated / quotesSubmitted) * 100).toFixed(1) : 0;
    const waClickRate = outreachSent > 0 ? +((waClicks / outreachSent) * 100).toFixed(1) : 0;
    const subRate     = outreachSent > 0 ? +((subscriptions / outreachSent) * 100).toFixed(1) : 0;

    return NextResponse.json({
      success: true,
      days,
      period: {
        rfqsCreated,
        rfqsActive,
        quotesSubmitted,
        dealsCreated,
        dealsCompleted,
        revenue: revenueAmt,
        outreachSent,
        waClicks,
        subscriptions,
        followUp1,
        followUp2,
        drips,
      },
      growth: {
        rfqs:     growth(rfqsCreated, prevRfqs),
        quotes:   growth(quotesSubmitted, prevQuotes),
        deals:    growth(dealsCreated, prevDeals),
        revenue:  growth(revenueAmt, prevRevenueAmt),
      },
      rates: {
        quoteRate,      // % of RFQs that got a quote
        dealRate,       // % of quotes that became deals
        waClickRate,    // % of outreach that got WA click
        subRate,        // % of outreach that subscribed
      },
      // Full funnel steps for visualisation
      funnel: [
        { step: 'Outreach Sent',   value: outreachSent,    color: 'bg-blue-500' },
        { step: 'WA Clicked',      value: waClicks,        color: 'bg-cyan-500' },
        { step: 'Quotes Posted',   value: quotesSubmitted, color: 'bg-indigo-500' },
        { step: 'Deals Created',   value: dealsCreated,    color: 'bg-purple-500' },
        { step: 'Subscribed',      value: subscriptions,   color: 'bg-green-500' },
      ],
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c.category ?? 'Unknown',
        count:    c._count._all,
      })),
      dailyRfqs: dailyRfqs.map(r => ({ date: r.date, count: Number(r.count) })),
    });
  } catch (error) {
    console.error('[Funnel API] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load funnel data' }, { status: 500 });
  }
}
