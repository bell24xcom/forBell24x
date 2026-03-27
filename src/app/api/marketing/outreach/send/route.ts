import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const { rfq_id, supplier, step, channel_override } = await req.json();

    // 1. Channel Selection Logic
    // Hierarchy: WhatsApp (if phone) -> Email (if email) -> Push (default)
    const channel = channel_override || (supplier.phone ? 'whatsapp' : 'email');

    // 2. Message Personalization (Templates)
    const templates: Record<number, string> = {
      0: `Hi ${supplier.name}, new RFQ for ${supplier.category}! View here: {{link}}`,
      1: `Gentle reminder: RFQ for ${supplier.category} is still open. Check details: {{link}}`,
      2: `URGENT: Buyer is making a decision soon for ${supplier.category}. Submit your quote: {{link}}`,
      3: `Last chance: Final request for quote. Don't miss this deal: {{link}}`
    };

    const token = btoa(JSON.stringify({ rfq_id, supplier_id: supplier.id }));
    const link = `${process.env.NEXTAUTH_URL}/quote/${token}`;
    const content = (templates[step] || templates[0]).replace('{{link}}', link);

    // 3. Update/Create Sequence State in InsForge
    const { data: seqData, error: seqErr } = await fetch(`${INSFORGE_URL}/rest/v1/outreach_sequences`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_API_KEY!,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([{
        rfq_id,
        supplier_id: supplier.id,
        current_step: step,
        status: 'active',
        updated_at: new Date().toISOString()
      }])
    }).then(r => r.json());

    // 4. Log Communication
    await fetch(`${INSFORGE_URL}/rest/v1/communication_logs`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_API_KEY!,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        sequence_id: seqData?.[0]?.id,
        channel,
        content,
        status: 'sent'
      }])
    });

    // 5. Trigger Real Execution (n8n or direct service)
    // Here we'd call the actual WhatsApp/Email API
    logger.info(`[Outreach] Sent ${channel} step ${step} to ${supplier.id}`);

    return NextResponse.json({ success: true, channel, step });

  } catch (error: any) {
    logger.error('Outreach API Error', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
