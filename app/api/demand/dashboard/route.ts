import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActivityStats } from '@/lib/demand-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/demand/dashboard
 * Returns the full demand pipeline overview for the operator.
 */
export async function GET() {
  try {
    const [activityStats, leadPipeline, recentConversions, rfqsByCategory] = await Promise.all([
      getActivityStats(),
      // Lead pipeline
      Promise.all([
        prisma.externalLead.count(),
        prisma.externalLead.count({ where: { status: 'new' } }),
        prisma.externalLead.count({ where: { status: 'converted' } }),
        prisma.externalLead.groupBy({
          by: ['source'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 8,
        }),
      ]),
      // Recent lead → RFQ conversions
      prisma.externalLead.findMany({
        where: { status: 'converted' },
        orderBy: { processedAt: 'desc' },
        take: 10,
        select: { id: true, source: true, category: true, requirement: true, rfqId: true, processedAt: true },
      }),
      // RFQs by category (last 30 days)
      prisma.rFQ.groupBy({
        by: ['category'],
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) }, isSeeded: false },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const [totalLeads, pendingLeads, convertedLeads, leadsBySource] = leadPipeline;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),

      // Live activity
      activity: activityStats,

      // Lead pipeline
      leads: {
        total: totalLeads,
        pending: pendingLeads,
        converted: convertedLeads,
        conversionRate: `${conversionRate}%`,
        bySource: leadsBySource.map(s => ({ source: s.source, count: s._count.id })),
      },

      // Recent conversions
      recentConversions: recentConversions.map(c => ({
        leadId: c.id,
        source: c.source,
        category: c.category,
        requirement: c.requirement?.slice(0, 80),
        rfqId: c.rfqId,
        convertedAt: c.processedAt,
      })),

      // RFQ demand by category
      demandByCategory: rfqsByCategory.map(c => ({
        category: c.category,
        rfqs: c._count.id,
      })),
    });
  } catch (error) {
    console.error('[Demand Dashboard] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load dashboard' }, { status: 500 });
  }
}
