/**
 * Agent Zero — Bell24h Orchestrator
 * ─────────────────────────────────
 * Main decision engine that reads Memory + Knowledge to choose strategy.
 *
 * RULES (MUST FOLLOW):
 * - Memory FIRST, LLM LAST — never call LLM without checking memory
 * - Skip all seeded RFQs
 * - Never contact same supplier twice in 7 days
 * - If demandTrend is DECLINING → reduce outreach
 * - If budget < 10000 → skip outreach (low value)
 */

import { getMarketInsights, getSimilarRFQs } from '../memory-engine';
import { searchKnowledge } from '../knowledge-base';
import { findSuppliers } from './scout';
import { sendOutreach } from './messenger';

export type OutreachStrategy = 'aggressive' | 'quality_focus' | 'volume_push' | 'skip';

export interface AgentContext {
  rfqId: string;
  title: string;
  category: string;
  location: string;
  maxBudget?: number | null;
  quantity: string;
  timeline?: string;
  urgency: string;
}

export interface AgentResult {
  rfqId: string;
  strategy: OutreachStrategy;
  suppliersFound: number;
  messagesSent: number;
  insight: {
    avgPrice?: number | null;
    demandTrend?: string;
    conversionRate?: number;
    rfqCount: number;
  };
  errors: string[];
}

/**
 * decideStrategy — uses memory + knowledge to choose outreach approach
 */
export async function decideStrategy(ctx: AgentContext): Promise<{ strategy: OutreachStrategy; reason: string }> {
  // Skip seeded RFQs handled at entry point

  const insights = await getMarketInsights(ctx.category);

  // Low budget → skip outreach
  if (!ctx.maxBudget || ctx.maxBudget < 10000) {
    return { strategy: 'skip', reason: `Budget ${ctx.maxBudget ?? 0} below 10000 threshold` };
  }

  if (!insights) {
    // Cold start: no history, use volume approach
    return { strategy: 'volume_push', reason: 'No market history yet — default to volume' };
  }

  const { demandTrend, conversionRate } = insights;

  if (demandTrend === 'RISING') {
    return { strategy: 'aggressive', reason: `Demand trending RISING — maximize outreach` };
  }

  if (demandTrend === 'DECLINING') {
    return { strategy: 'skip', reason: `Demand trending DECLINING — suppress outreach` };
  }

  // STABLE
  if (conversionRate !== undefined && conversionRate > 0.6) {
    return { strategy: 'quality_focus', reason: `High conversion ${(conversionRate * 100).toFixed(0)}% — focus on quality suppliers` };
  }

  return { strategy: 'volume_push', reason: `Normal market — volume outreach` };
}

/**
 * process — main entry point for Agent Zero
 * Called after storeRFQ() on every new real RFQ
 */
export async function agentZero(rfq: {
  id: string;
  title: string;
  category: string;
  location?: string | null;
  maxBudget?: number | null;
  quantity: string;
  timeline?: string | null;
  urgency: string;
  isSeeded?: boolean;
}): Promise<AgentResult> {
  const errors: string[] = [];

  // Skip seeded RFQs — they are demo data
  if (rfq.isSeeded) {
    return {
      rfqId: rfq.id,
      strategy: 'skip',
      suppliersFound: 0,
      messagesSent: 0,
      insight: { rfqCount: 0 },
      errors: ['Skipped — seeded RFQ'],
    };
  }

  const ctx: AgentContext = {
    rfqId: rfq.id,
    title: rfq.title,
    category: rfq.category,
    location: rfq.location ?? 'Pan India',
    maxBudget: rfq.maxBudget,
    quantity: rfq.quantity,
    timeline: rfq.timeline ?? undefined,
    urgency: rfq.urgency,
  };

  // Step 1: Memory check
  console.log(`[SMOKE-TEST] Memory: checking insights for "${ctx.category}"`);
  const [insights, similar] = await Promise.all([
    getMarketInsights(ctx.category).catch(e => { errors.push(`Insights error: ${e}`); return null; }),
    getSimilarRFQs(ctx.category, 5).catch(e => { errors.push(`SimilarRFQ error: ${e}`); return []; }),
  ]);

  // Step 2: Knowledge search for relevant playbooks
  const relevantKnowledge = searchKnowledge(ctx.category, 3);
  if (relevantKnowledge.length > 0) {
    console.log(`[AgentZero] Found ${relevantKnowledge.length} knowledge entries for "${ctx.category}"`);
  }

  // Step 3: Decide strategy
  const { strategy, reason } = await decideStrategy(ctx);
  console.log(`[AgentZero] RFQ ${rfq.id} → strategy=${strategy}, reason=${reason}`);
  console.log(`[SMOKE-TEST] Strategy: ${strategy} for RFQ ${rfq.id}`);

  if (strategy === 'skip') {
    return {
      rfqId: rfq.id,
      strategy,
      suppliersFound: 0,
      messagesSent: 0,
      insight: {
        avgPrice: insights?.avgPrice ?? null,
        demandTrend: insights?.demandTrend ?? null,
        conversionRate: insights?.conversionRate ?? null,
        rfqCount: insights?.rfqCount ?? 0,
      },
      errors,
    };
  }

  // Step 4: Scout → find suppliers
  const suppliers = await findSuppliers(ctx).catch(e => {
    errors.push(`Scout error: ${String(e)}`);
    return [];
  });

  if (suppliers.length === 0) {
    return {
      rfqId: rfq.id,
      strategy,
      suppliersFound: 0,
      messagesSent: 0,
      insight: {
        avgPrice: insights?.avgPrice ?? null,
        demandTrend: insights?.demandTrend ?? null,
        conversionRate: insights?.conversionRate ?? null,
        rfqCount: insights?.rfqCount ?? 0,
      },
      errors,
    };
  }

  // Step 5: Messenger → send outreach
  const messageResults = await sendOutreach(ctx, suppliers).catch(e => {
    errors.push(`Messenger error: ${String(e)}`);
    return [];
  });

  const sent = messageResults.filter(r => r.sent).length;

  return {
    rfqId: rfq.id,
    strategy,
    suppliersFound: suppliers.length,
    messagesSent: sent,
    insight: {
      avgPrice: insights?.avgPrice ?? null,
      demandTrend: insights?.demandTrend ?? null,
      conversionRate: insights?.conversionRate ?? null,
      rfqCount: insights?.rfqCount ?? 0,
    },
    errors,
  };
}
