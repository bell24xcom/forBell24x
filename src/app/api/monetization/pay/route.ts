import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

// Lazy init — do NOT instantiate at module scope.
// next build evaluates modules without runtime env vars, causing Razorpay
// to throw "key_id is mandatory" and fail page-data collection.
function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function POST(req: NextRequest) {
  const razorpay = getRazorpay();
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const { dealId } = await req.json();

    // 1. Fetch Deal from InsForge
    const dealRes = await fetch(`${INSFORGE_URL}/rest/v1/deals?id=eq.${dealId}`, {
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}` }
    });
    const dealData = await dealRes.json();
    const deal = dealData[0];

    if (!deal) throw new Error('Deal not found');

    // 2. Create Razorpay Order
    const options = {
      amount: Math.round(deal.deal_value * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${dealId.substring(0, 8)}`,
      notes: {
        deal_id: dealId,
        rfq_id: deal.rfq_id
      }
    };

    const order = await razorpay.orders.create(options);

    // 3. Log Transaction as 'created'
    await fetch(`${INSFORGE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: { 
        'apikey': INSFORGE_API_KEY!, 
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        deal_id: dealId,
        provider: 'razorpay',
        provider_payment_id: order.id,
        amount: deal.deal_value,
        status: 'created'
      }])
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: any) {
    console.error('[Payment-API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
