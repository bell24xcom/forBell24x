import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Create a Razorpay order for wallet top-up
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

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Test mode when keys aren't configured
    if (!keyId || !keySecret || keyId.includes('placeholder') || keyId === '') {
      return NextResponse.json({
        success: true,
        testMode: true,
        orderId: `order_test_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
        key: 'rzp_test_placeholder',
      });
    }

    // Live mode
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `wallet_${user.userId}_${Date.now()}`,
      notes: { userId: user.userId, type: 'WALLET_DEPOSIT', platform: 'Bell24h' },
    });

    return NextResponse.json({
      success: true,
      testMode: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}

// Verify payment and credit wallet
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment verification data' }, { status: 400 });
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    // Credit wallet
    const depositAmount = amount / 100; // Convert from paise to rupees

    let wallet = await prisma.wallet.findUnique({ where: { userId: user.userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId: user.userId, balance: 0 } });
    }

    // Create transaction and update balance atomically
    await prisma.$transaction([
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: depositAmount,
          description: `Razorpay deposit`,
          reference: razorpay_payment_id,
        },
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: depositAmount } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `₹${depositAmount.toLocaleString('en-IN')} added to wallet`,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
