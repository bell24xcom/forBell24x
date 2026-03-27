import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/funnel
 * Returns conversion funnel: RFQs created → viewed → quoted → deal closed
 */
export async function GET(request: NextRequest) {
  try {
    const days = parseInt(new URL(request.url).searchParams.get('days') || '30');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      rfqsCreated,
      rfqsWithViews,
      rfqsWithQuotes,
      dealsAccepted,
      categoryBreakdown,
    ] = await Promise.all([
      // Total RFQs in period
      prisma.rFQ.count({ where: { createdAt: { gte: since }, isSeeded: false } }),

      // RFQs that got at least 1 view
      prisma.rFQ.count({ where: { createdAt: { gte: since }, isSeeded: false, views: { gt: 0 } } }),

      // RFQs that received at least 1 quote
      prisma.rFQ.count({
        where: {
          createdAt: { gte: since },
          isSeeded: false,
          quotes: { some: {} },
        },
      }),

      // Quotes that were accepted (deals closed)
      prisma.quote.count({ where: { status: 'ACCEPTED', updatedAt: { gte: since } } }),

      // Breakdown by category
      prisma.rFQ.groupBy({
        by: ['category'],
        where: { createdAt: { gte: since }, isSeeded: false },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const toRate = (num: number, denom: number) =>
      denom === 0 ? 0 : Math.round((num / denom) * 100);

    return NextResponse.json({
      success: true,
      period: `${days} days`,
      funnel: {
        rfqsCreated,
        rfqsViewed: rfqsWithViews,
        rfqsQuoted: rfqsWithQuotes,
        dealsAccepted,
      },
      rates: {
        viewRate: `${toRate(rfqsWithViews, rfqsCreated)}%`,
        quoteRate: `${toRate(rfqsWithQuotes, rfqsWithViews)}%`,
        dealRate: `${toRate(dealsAccepted, rfqsWithQuotes)}%`,
        overallConversion: `${toRate(dealsAccepted, rfqsCreated)}%`,
      },
      topCategories: categoryBreakdown.map(c => ({
        category: c.category,
        rfqs: c._count.id,
      })),
    });
  } catch (error) {
    console.error('[Funnel] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to compute funnel' }, { status: 500 });
  }
}
