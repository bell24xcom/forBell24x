import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const { rfqId, quoteId, buyerId } = await req.json();

    // 1. Fetch Quote Details to get price and supplier
    const quoteRes = await fetch(`${INSFORGE_URL}/rest/v1/quotes?id=eq.${quoteId}`, {
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}` }
    });
    const quoteData = await quoteRes.json();
    const quote = quoteData[0];

    if (!quote) throw new Error('Quote not found');

    const dealValue = parseFloat(quote.price);
    const commRate = 5.00; // 5%
    const commAmount = (dealValue * commRate) / 100;
    const netPayout = dealValue - commAmount;

    // 2. Create Deal Record
    const dealRes = await fetch(`${INSFORGE_URL}/rest/v1/deals`, {
      method: 'POST',
      headers: { 
        'apikey': INSFORGE_API_KEY!, 
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([{
        rfq_id: rfqId,
        buyer_id: buyerId || 'unknown',
        supplier_id: quote.supplier_id,
        quote_id: quoteId,
        deal_value: dealValue,
        commission_rate: commRate,
        commission_amount: commAmount,
        net_payout: netPayout,
        status: 'pending'
      }])
    });

    const dealData = await dealRes.json();

    // 3. Update Existing Statuses (Status logic from previous stage)
    await fetch(`${INSFORGE_URL}/rest/v1/quotes?id=eq.${quoteId}`, {
      method: 'PATCH',
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' })
    });

    await fetch(`${INSFORGE_URL}/rest/v1/rfqs?id=eq.${rfqId}`, {
      method: 'PATCH',
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' })
    });

    return NextResponse.json({ success: true, dealId: dealData[0].id });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
