import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Create a Razorpay order for wallet top-up
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    console.log("USER SESSION:", user ? `userId=${user.userId}` : "null — auth failed");
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

    console.log("RAZORPAY KEY:", keyId ? `${keyId.slice(0, 8)}...` : "MISSING");

    if (!keyId || !keySecret) {
      return NextResponse.json({ success: false, error: 'Razorpay env missing' }, { status: 500 });
    }

    // Test mode when keys aren't configured
    if (keyId.includes('placeholder') || keyId === '') {
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
      receipt: `wal_${Date.now()}`,
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
  } catch (error: any) {
    console.error('RAZORPAY FULL ERROR:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown error', details: error },
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

    // VS-SECURITY-P0-CLOSE-01: runtime null guard — replaces unsafe non-null assertion.
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('[payment/create-order PUT] RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json({ success: false, error: 'Payment gateway not configured' }, { status: 500 });
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
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
