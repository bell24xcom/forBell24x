import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// Subscription plan pricing (in INR)
export const PLANS: Record<string, { name: string; amount: number; label: string }> = {
  starter:    { name: 'starter',    amount: 999,  label: 'Starter'    },
  growth:     { name: 'growth',     amount: 2999, label: 'Growth'     },
  enterprise: { name: 'enterprise', amount: 7999, label: 'Enterprise' },
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
    const planConfig = PLANS[planKey];

    if (!planConfig) {
      return NextResponse.json(
        { success: false, error: `Invalid plan. Choose: ${Object.keys(PLANS).join(', ')}` },
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
        amount: planConfig.amount * 100,
        currency: 'INR',
        plan: planKey,
        key: 'rzp_test_placeholder',
      });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: planConfig.amount * 100, // paise
      currency: 'INR',
      receipt: `sub_${planKey}_${user.userId}_${Date.now()}`,
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
      key: keyId,
    });
  } catch (error) {
    console.error('[Subscribe] create-order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create subscription order' }, { status: 500 });
  }
}
