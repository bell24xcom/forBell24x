/**
 * Behavior Engine — User Behavior Intelligence
 * ─────────────────────────────────────────────
 * Analyzes InteractionMemory to detect drop-off patterns,
 * aggregates by category, and feeds insights back to Agent Zero.
 *
 * Event flow (ordered by funnel stage):
 *   page_view → rfq_viewed → rfq_created → quote_started → quote_submitted → payment_started → payment_success
 */

import { prisma } from '@/lib/prisma';

// Funnel stages in order — used for drop-off detection
export const FUNNEL_STAGES = [
  'page_view',
  'rfq_viewed',
  'rfq_created',
  'quote_started',
  'quote_submitted',
  'payment_started',
  'payment_success',
] as const;

export type FunnelStage = typeof FUNNEL_STAGES[number];

export interface BehaviorInsight {
  category: string;
  sessionCount: number;
  avgDropStage: string | null;
  dropRate: number;
  avgTimeToQuoteHours: number | null;
  conversionRate: number;
  topFailures: Record<string, number>;
}

/**
 * analyzeUserBehavior — runs daily
 * Reads InteractionMemory, builds session journeys, detects drop-offs,
 * aggregates per category, upserts into UserBehaviorMemory.
 */
export async function analyzeUserBehavior(days = 30): Promise<{ updated: number; errors: number }> {
  let updated = 0;
  let errors = 0;

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Pull all interactions from the period that have a sessionId
    const interactions = await prisma.interactionMemory.findMany({
      where: { createdAt: { gte: since }, sessionId: { not: null } },
      orderBy: { createdAt: 'asc' },
      select: {
        sessionId: true,
        userId: true,
        rfqId: true,
        actionType: true,
        createdAt: true,
        metadata: true,
      },
    });

    if (interactions.length === 0) return { updated: 0, errors: 0 };

    // Build session maps: sessionId → sorted event list
    const sessions = new Map<string, typeof interactions>();
    for (const event of interactions) {
      if (!event.sessionId) continue;
      if (!sessions.has(event.sessionId)) sessions.set(event.sessionId, []);
      sessions.get(event.sessionId)!.push(event);
    }

    // Get category for each rfqId mentioned in interactions
    const rfqIds = [...new Set(interactions.map(i => i.rfqId).filter(Boolean))] as string[];
    const rfqs = rfqIds.length > 0
      ? await prisma.rFQ.findMany({ where: { id: { in: rfqIds } }, select: { id: true, category: true } })
      : [];
    const rfqCategoryMap = new Map(rfqs.map(r => [r.id, r.category]));

    // Analyze each session — find the last stage reached and category
    interface SessionResult {
      lastStage: FunnelStage;
      category: string;
      timeToQuoteMs: number | null;
      converted: boolean;
    }

    const sessionResults: SessionResult[] = [];
    for (const [, events] of sessions) {
      const stagesReached = new Set(events.map(e => e.actionType as FunnelStage));
      const lastStage = [...FUNNEL_STAGES].reverse().find(s => stagesReached.has(s)) ?? 'page_view';
      const converted = stagesReached.has('quote_submitted') || stagesReached.has('payment_success');

      // Determine category from rfqId in events
      const rfqEvent = events.find(e => e.rfqId);
      const category = rfqEvent?.rfqId
        ? (rfqCategoryMap.get(rfqEvent.rfqId) ?? 'Unknown')
        : 'Unknown';

      // Time from rfq_viewed to quote_started
      const viewedEvent = events.find(e => e.actionType === 'rfq_viewed');
      const quoteEvent = events.find(e => e.actionType === 'quote_started');
      const timeToQuoteMs = viewedEvent && quoteEvent
        ? quoteEvent.createdAt.getTime() - viewedEvent.createdAt.getTime()
        : null;

      sessionResults.push({ lastStage, category, timeToQuoteMs, converted });
    }

    // Aggregate per category
    const byCategory = new Map<string, SessionResult[]>();
    for (const r of sessionResults) {
      if (r.category === 'Unknown') continue;
      if (!byCategory.has(r.category)) byCategory.set(r.category, []);
      byCategory.get(r.category)!.push(r);
    }

    // Upsert UserBehaviorMemory per category
    for (const [category, results] of byCategory) {
      try {
        const total = results.length;
        const converted = results.filter(r => r.converted).length;

        // Drop-off stage counts
        const dropCounts: Record<string, number> = {};
        for (const r of results) {
          if (!r.converted) {
            dropCounts[r.lastStage] = (dropCounts[r.lastStage] || 0) + 1;
          }
        }
        const avgDropStage = Object.entries(dropCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        const dropRate = total > 0 ? (total - converted) / total : 0;
        const conversionRate = total > 0 ? converted / total : 0;

        const timesMs = results.map(r => r.timeToQuoteMs).filter(Boolean) as number[];
        const avgTimeToQuoteHours = timesMs.length > 0
          ? timesMs.reduce((a, b) => a + b, 0) / timesMs.length / 3600000
          : null;

        await prisma.userBehaviorMemory.upsert({
          where: { category },
          update: {
            sessionCount: total,
            avgDropStage,
            dropRate,
            avgTimeToQuoteHours,
            conversionRate,
            topFailures: dropCounts,
            lastAnalyzed: new Date(),
          },
          create: {
            category,
            sessionCount: total,
            avgDropStage,
            dropRate,
            avgTimeToQuoteHours,
            conversionRate,
            topFailures: dropCounts,
          },
        });
        updated++;
      } catch (e) {
        console.error(`[Behavior] Error for category ${category}:`, e);
        errors++;
      }
    }
  } catch (e) {
    console.error('[Behavior] analyzeUserBehavior failed:', e);
    errors++;
  }

  return { updated, errors };
}

/**
 * getBehaviorInsight — returns aggregated behavior for a category
 * Used by Agent Zero to adjust strategy.
 */
export async function getBehaviorInsight(category: string): Promise<BehaviorInsight | null> {
  const row = await prisma.userBehaviorMemory.findUnique({ where: { category } }).catch(() => null);
  if (!row) return null;
  return {
    category: row.category,
    sessionCount: row.sessionCount,
    avgDropStage: row.avgDropStage,
    dropRate: row.dropRate ?? 0,
    avgTimeToQuoteHours: row.avgTimeToQuoteHours,
    conversionRate: row.conversionRate ?? 0,
    topFailures: (row.topFailures as Record<string, number>) ?? {},
  };
}

/**
 * getPlatformInsights — top-level summary for /api/insights
 */
export async function getPlatformInsights() {
  const [behavior, market, recentFeedback] = await Promise.all([
    prisma.userBehaviorMemory.findMany({ orderBy: { conversionRate: 'desc' } }),
    prisma.marketInsight.findMany({ orderBy: { rfqCount: 'desc' }, take: 10 }),
    prisma.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);

  const bestCategory = behavior[0];
  const worstDrop = [...behavior].sort((a, b) => (b.dropRate ?? 0) - (a.dropRate ?? 0))[0];

  const signals: string[] = [];
  if (bestCategory) signals.push(`"${bestCategory.category}" RFQs converting best (${((bestCategory.conversionRate ?? 0) * 100).toFixed(0)}% rate)`);
  if (worstDrop && (worstDrop.dropRate ?? 0) > 0.5) signals.push(`"${worstDrop.category}" has high drop-off at "${worstDrop.avgDropStage ?? 'unknown'}" stage`);
  market.filter(m => m.demandTrend === 'RISING').slice(0, 2).forEach(m => signals.push(`"${m.category}" demand is RISING — ${m.rfqCount} RFQs`));
  market.filter(m => m.demandTrend === 'DECLINING').slice(0, 1).forEach(m => signals.push(`"${m.category}" demand DECLINING — reduce outreach`));
  if (recentFeedback.filter(f => f.type === 'friction').length > 3) signals.push(`${recentFeedback.filter(f => f.type === 'friction').length} friction reports — review UX`);

  return {
    signals,
    behavior: behavior.map(b => ({
      category: b.category,
      sessions: b.sessionCount,
      dropRate: `${((b.dropRate ?? 0) * 100).toFixed(0)}%`,
      conversionRate: `${((b.conversionRate ?? 0) * 100).toFixed(0)}%`,
      avgDropStage: b.avgDropStage,
      avgTimeToQuoteHours: b.avgTimeToQuoteHours ? `${b.avgTimeToQuoteHours.toFixed(1)}h` : null,
    })),
    market: market.map(m => ({
      category: m.category,
      rfqCount: m.rfqCount,
      trend: m.demandTrend,
      conversionRate: m.conversionRate,
      avgPrice: m.avgPrice,
    })),
    feedbackSummary: {
      total: recentFeedback.length,
      friction: recentFeedback.filter(f => f.type === 'friction').length,
      bugs: recentFeedback.filter(f => f.type === 'bug').length,
      praise: recentFeedback.filter(f => f.type === 'praise').length,
    },
  };
}
