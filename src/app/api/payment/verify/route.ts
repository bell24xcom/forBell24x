import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { storeInteraction } from '@/lib/memory-engine';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

// Plan name → UserPlan enum value mapping
const PLAN_MAP: Record<string, 'FREE' | 'PRO' | 'ENTERPRISE'> = {
  starter:    'PRO',
  pro:        'PRO',
  growth:     'PRO',
  enterprise: 'ENTERPRISE',
};

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and either:
 *   (a) credits wallet — when type is 'WALLET_DEPOSIT' (default)
 *   (b) activates subscription plan — when plan is provided in request body
 * Also handles test-mode orders (order_test_*) without signature check.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, plan } = await request.json();

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

    // ── SUBSCRIPTION PLAN ACTIVATION ─────────────────────────────────────
    if (plan) {
      const planKey = plan.toLowerCase();
      const userPlan = PLAN_MAP[planKey] ?? 'PRO';
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

      await prisma.user.update({
        where: { id: user.userId },
        data: {
          plan: userPlan,
          planActivatedAt: now,
          planExpiresAt: expiresAt,
        },
      });

      // Log subscription activation to InteractionMemory
      storeInteraction({
        userId: user.userId,
        actionType: 'subscription_activated',
        source: 'razorpay',
        metadata: {
          plan: planKey,
          userPlan,
          amount,
          paymentId: razorpay_payment_id || razorpay_order_id,
          expiresAt: expiresAt.toISOString(),
          testMode: isTestMode,
        },
      }).catch(() => {});

      // Build WhatsApp confirmation link for operator to send
      const dbUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { phone: true, name: true, company: true },
      });
      const confirmMsg = `Hi ${dbUser?.name ?? dbUser?.company ?? 'there'},\n\nYour Bell24h ${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan is now active! 🎉\n\nValid until: ${expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n\nLog in to access your full supplier dashboard:\n${SITE_URL}/dashboard\n\n— Bell24h Team`;
      const waConfirm = dbUser?.phone
        ? `https://wa.me/${dbUser.phone.replace(/\D/g, '').replace(/^(?!91)/, '91')}?text=${encodeURIComponent(confirmMsg)}`
        : null;

      return NextResponse.json({
        success: true,
        type: 'subscription',
        plan: planKey,
        planExpiresAt: expiresAt.toISOString(),
        message: `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} plan activated until ${expiresAt.toLocaleDateString('en-IN')}`,
        waConfirm,
        testMode: isTestMode,
      });
    }

    // ── WALLET CREDIT ─────────────────────────────────────────────────────
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
      type: 'wallet',
      balance: updated?.balance ?? wallet.balance,
      message: `₹${amount.toLocaleString('en-IN')} added to wallet${isTestMode ? ' (test mode)' : ''}`,
      testMode: isTestMode,
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 500 });
  }
}
