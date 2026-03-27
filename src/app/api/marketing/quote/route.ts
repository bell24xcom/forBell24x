import { NextRequest, NextResponse } from 'next/server';
import { generateSecureId } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

  try {
    const body = await req.json();
    const { rfq_id, supplier_id, price, delivery_days, message } = body;

    if (!rfq_id || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Save Quote to InsForge
    const quotePayload = {
      rfq_id,
      supplier_id,
      price,
      delivery_days: parseInt(delivery_days),
      message,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const insforgeRes = await fetch(`${INSFORGE_URL}/rest/v1/quotes`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_API_KEY!,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([quotePayload])
    });

    if (!insforgeRes.ok) throw new Error('InsForge Quote storage failed');

    const insertedQuote = await insforgeRes.json();

    // 2. Update RFQ status to 'quoted' if it was 'sent' or 'matched'
    await fetch(`${INSFORGE_URL}/rest/v1/rfqs?id=eq.${rfq_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': INSFORGE_API_KEY!,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'quoted' })
    });

    // 3. Trigger Notification Webhook (Notify Admin/Buyer)
    if (N8N_WEBHOOK_URL) {
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'quote_submitted',
          rfq_id,
          quote_id: insertedQuote[0].id,
          price
        })
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, quote_id: insertedQuote[0].id });

  } catch (error: any) {
    console.error('[Quote-API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
