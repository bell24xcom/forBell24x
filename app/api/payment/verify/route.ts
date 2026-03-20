import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and credits wallet.
 * Also handles test-mode orders (order_test_*) without signature check.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await request.json();

    if (!razorpay_order_id || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const isTestMode =
      razorpay_order_id.startsWith('order_test_') &&
      process.env.NODE_ENV !== 'production';

    if (!isTestMode) {
      // Verify Razorpay signature
      if (!razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ success: false, error: 'Missing payment verification data' }, { status: 400 });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return NextResponse.json({ success: false, error: 'Payment gateway not configured' }, { status: 500 });
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ success: false, error: 'Payment verification failed — invalid signature' }, { status: 400 });
      }
    }

    // Ensure wallet exists before transaction block
    let wallet = await prisma.wallet.findUnique({ where: { userId: user.userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId: user.userId, balance: 0 } });
    }

    // Credit wallet + log transaction atomically — both succeed or both fail
    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount,
          description: isTestMode
            ? `Test deposit of ₹${amount.toLocaleString('en-IN')}`
            : `Razorpay deposit of ₹${amount.toLocaleString('en-IN')}`,
          reference: razorpay_payment_id || razorpay_order_id,
        },
      }),
    ]);

    // Re-fetch updated balance
    const updated = await prisma.wallet.findUnique({ where: { userId: user.userId } });

    return NextResponse.json({
      success: true,
      balance: updated?.balance ?? wallet.balance,
      message: `₹${amount.toLocaleString('en-IN')} added to wallet${isTestMode ? ' (test mode)' : ''}`,
      testMode: isTestMode,
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 500 });
  }
}
