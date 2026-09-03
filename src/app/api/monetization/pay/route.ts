import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

// Constructed lazily, inside the handler — NOT at module scope. Next.js
// evaluates route modules during `next build`'s page-data-collection step;
// a top-level `new Razorpay(...)` with a missing key throws at build time,
// not just at request time, and fails the whole build (confirmed: this is
// exactly what broke the fix/admin-audit-phase1-4 Vercel build — "Error:
// `key_id` or `oauthToken` is mandatory" during "Collecting page data").
// Every other Razorpay call site in this codebase already does it this way
// (see src/app/api/payment/create-order/route.ts, .../subscribe/route.ts).
function getRazorpay(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 });
    }

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
