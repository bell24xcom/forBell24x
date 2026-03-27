import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { rfq, candidates } = await req.json();

    // 1. Scoring Logic (Simulated for this stage)
    const scoredCandidates = candidates.map((s: any) => ({
      ...s,
      ai_score: (s.response_rate || 0) * 10 + (rfq.urgency === 'high' ? 2 : 0)
    })).sort((a: any, b: any) => b.ai_score - a.ai_score);

    // 2. AI Decision (In production, call NVIDIA/OpenAI here)
    // For now, we use high-confidence deterministic logic as fallback
    const topCandidates = scoredCandidates.slice(0, 5);

    const outreachPlan = topCandidates.map((s: any) => ({
      supplier_id: s.id,
      channel: 'whatsapp',
      message: `*Bell24h RFQ Alert*\nItem: ${rfq.text}\nCategory: ${rfq.category}\nReply to quote!`,
      delay_minutes: 0,
      auto_follow_up: rfq.urgency === 'high'
    }));

    const decision = {
      decision_id: `df_${Math.random().toString(36).substr(2, 9)}`,
      priority: rfq.urgency || 'normal',
      strategy: 'top_match_outreach',
      outreach_plan: outreachPlan,
      meta: {
        total_candidates: candidates.length,
        selected_count: topCandidates.length
      }
    };

    logger.info('DeerFlow Decision Generated', { rfq_id: rfq.id, decision_id: decision.decision_id });

    return NextResponse.json(decision);

  } catch (error: any) {
    logger.error('DeerFlow API Error', { error: error.message });
    return NextResponse.json({ error: 'Decision engine failure' }, { status: 500 });
  }
}
