import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { rfqId, message, type } = await req.json();
    if (!rfqId || !message) throw new Error('Missing rfqId or message');

    // 1. Trigger n8n outreach webhook (Placeholder for real URL)
    const n8nWebhookUrl = process.env.N8N_OUTREACH_WEBHOOK_URL || 'https://n8n.bell24h.com/webhook/outreach';

    // Simulated n8n call
    console.log(`[Outreach] Triggered ${type} for RFQ ${rfqId}: ${message}`);

    // 2. Update status in InsForge
    const { error: updateError } = await insforge.client!
      .from('rfqs')
      .update({ status: 'sent' })
      .eq('id', rfqId);

    if (updateError) throw updateError;

    // 3. Log to outreach_logs in InsForge
    const { error: logError } = await insforge.client!
      .from('outreach_logs')
      .insert([{
        rfq_id: rfqId,
        action_type: `outreach_${type}`,
        status: 'success',
        response: { message: 'Outreach triggered via n8n', type, simulated: true, webhook: n8nWebhookUrl }
      }]);

    if (logError) throw logError;

    return NextResponse.json({ 
      success: true, 
      message: 'Outreach triggered successfully',
      status: 'sent'
    });
  } catch (error: any) {
    console.error('[Outreach API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
