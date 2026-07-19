import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { PLANS } from '@/lib/plans';

export const dynamic = 'force-dynamic';

// Maps the lowercase plan key the client sends to the canonical plan
// defined in lib/plans.ts (the same source the pricing page renders from).
// FREE has no payment flow, so it isn't in this map — it's rejected explicitly below.
const PAYABLE_PLANS: Record<string, 'PRO' | 'ENTERPRISE'> = {
  pro: 'PRO',
  enterprise: 'ENTERPRISE',
};

/**
 * POST /api/payment/subscribe
 * Creates a Razorpay order for a subscription plan.
 * The plan name is returned in the response so the verify endpoint can
 * activate the subscription after payment confirmation.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { plan } = await request.json();
    const planKey = plan?.toLowerCase();

    if (planKey === 'free' || planKey === 'starter') {
      return NextResponse.json(
        { success: false, error: 'Free plan does not require payment' },
        { status: 400 }
      );
    }

    const planName = planKey ? PAYABLE_PLANS[planKey] : undefined;
    const planConfig = planName ? PLANS[planName] : undefined;

    if (!planConfig) {
      return NextResponse.json(
        { success: false, error: `Invalid plan. Choose: ${Object.keys(PAYABLE_PLANS).join(', ')}` },
        { status: 400 }
      );
    }

    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Test mode when Razorpay keys aren't configured
    if (!keyId || !keySecret || keyId.includes('placeholder') || keyId === '') {
      return NextResponse.json({
        success: true,
        testMode: true,
        orderId: `order_test_sub_${planKey}_${Date.now()}`,
        amount: planConfig.monthlyPriceINR * 100,
        currency: 'INR',
        plan: planKey,
        keyId: 'rzp_test_placeholder',
      });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: planConfig.monthlyPriceINR * 100, // paise
      currency: 'INR',
      receipt: `sub_${planKey}_${Date.now()}`.slice(0, 40),
      notes: {
        userId: user.userId,
        type: 'SUBSCRIPTION',
        plan: planKey,
        platform: 'Bell24h',
      },
    });

    return NextResponse.json({
      success: true,
      testMode: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: planKey,
      planLabel: planConfig.label,
      keyId,
    });
  } catch (error) {
    console.error('[Subscribe] create-order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create subscription order' }, { status: 500 });
  }
}
