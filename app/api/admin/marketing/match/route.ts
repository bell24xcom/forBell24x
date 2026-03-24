import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { rfqId } = await req.json();
    if (!rfqId) throw new Error('Missing rfqId');

    // 1. Fetch RFQ data from InsForge
    const { data: rfq, error: rfqError } = await insforge.client!
      .from('rfqs')
      .select('*')
      .eq('id', rfqId)
      .single();

    if (rfqError || !rfq) throw new Error('RFQ not found in InsForge');

    // 2. Trigger n8n matching webhook (Placeholder for real URL)
    const n8nWebhookUrl = process.env.N8N_MATCH_WEBHOOK_URL || 'https://n8n.bell24h.com/webhook/match-vendors';
    
    // In production, you'd call the real webhook:
    // const matchRes = await fetch(n8nWebhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     rfqId: rfq.id,
    //     rfq_text: rfq.rfq_text,
    //     category: rfq.category,
    //     urgency: rfq.urgency
    //   })
    // });

    // 3. Update status in InsForge
    const { error: updateError } = await insforge.client!
      .from('rfqs')
      .update({ status: 'matched' })
      .eq('id', rfqId);

    if (updateError) throw updateError;

    // 4. Log the action
    await insforge.client!
      .from('outreach_logs')
      .insert([{
        rfq_id: rfqId,
        action_type: 'matching_triggered',
        status: 'success',
        response: { message: 'Sent to n8n for vendor matching', webhook: n8nWebhookUrl }
      }]);

    return NextResponse.json({ 
      success: true, 
      message: 'Vendor matching triggered',
      status: 'matched'
    });
  } catch (error: any) {
    console.error('[Match API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
