import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { createWalletTopupIntent, verifyAndCreditWalletTopup } from '@/src/lib/payments/razorpay-wallet-intent';

export const dynamic = 'force-dynamic';

// Create a Razorpay order for wallet top-up. Persists a server-trusted
// PaymentIntent (Phase 11) so the PUT handler below never has to trust a
// client-supplied amount again.
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { amount, currency = 'INR' } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ success: false, error: 'Minimum amount is ₹1' }, { status: 400 });
    }

    if (amount > 500000) {
      return NextResponse.json({ success: false, error: 'Maximum amount is ₹5,00,000' }, { status: 400 });
    }

    const result = await createWalletTopupIntent(user.userId, amount, currency);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// Verify payment and credit wallet. Amount/currency are read from the
// PaymentIntent persisted by POST above, never from this request body —
// see src/lib/payments/razorpay-wallet-intent.ts for why.
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ success: false, error: 'Missing payment verification data' }, { status: 400 });
    }

    const result = await verifyAndCreditWalletTopup({
      userId: user.userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature ?? null,
    });

    switch (result.outcome) {
      case 'CREDITED':
        return NextResponse.json({
          success: true,
          message: `₹${(result.amount / 100).toLocaleString('en-IN')} added to wallet`,
          paymentId: razorpay_payment_id,
          balance: result.balance,
        });
      case 'ALREADY_PROCESSED':
        return NextResponse.json({ success: true, message: 'Payment already processed', alreadyProcessed: true });
      case 'NOT_FOUND':
        return NextResponse.json({ success: false, error: 'No matching order found' }, { status: 404 });
      case 'FORBIDDEN':
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      case 'INVALID_SIGNATURE':
        return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
      case 'PAYMENT_ID_CONFLICT':
        return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 409 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
