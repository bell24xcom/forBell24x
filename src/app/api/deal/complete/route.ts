import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const { dealId, buyerId } = await req.json();

    // 1. Update Deal to 'completed'
    await fetch(`${INSFORGE_URL}/rest/v1/deals?id=eq.${dealId}`, {
      method: 'PATCH',
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', updated_at: new Date().toISOString() })
    });

    // 2. Log Final Transaction
    await fetch(`${INSFORGE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        deal_id: dealId,
        provider: 'system',
        amount: 0,
        status: 'escrow_released'
      }])
    });

    return NextResponse.json({ success: true, message: 'Deal finalized. Funds released to supplier.' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
