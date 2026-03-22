/**
 * POST /api/payment/webhook
 * Razorpay webhook handler — safety net for missed client-side verifications.
 * Does NOT require auth cookies (requests come from Razorpay servers).
 * Verifies x-razorpay-signature header instead.
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('[WEBHOOK] Missing x-razorpay-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[WEBHOOK] RAZORPAY_WEBHOOK_SECRET not set in env');
      // Return 200 so Razorpay does not retry endlessly
      return NextResponse.json({ status: 'skipped', reason: 'webhook not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('[WEBHOOK] Signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType: string = event.event;
    const paymentEntity = event.payload?.payment?.entity;

    console.log('[WEBHOOK] Event:', eventType, '| Payment ID:', paymentEntity?.id ?? 'n/a');

    // ── payment.captured ───────────────────────────────────────────────────
    if (eventType === 'payment.captured') {
      const paymentId: string = paymentEntity.id;
      const orderId: string = paymentEntity.order_id;
      const amountInRupees: number = paymentEntity.amount / 100; // paise → rupees
      const userId: string | undefined = paymentEntity.notes?.userId;

      if (!userId) {
        console.error('[WEBHOOK] No userId in payment notes. Order:', orderId);
        return NextResponse.json({ status: 'skipped', reason: 'no userId in notes' });
      }

      // Idempotency: skip if this payment was already credited
      const existing = await prisma.walletTransaction.findFirst({
        where: { reference: paymentId },
      });
      if (existing) {
        console.log('[WEBHOOK] Already processed:', paymentId);
        return NextResponse.json({ status: 'already_processed' });
      }

      // Find or create wallet
      let wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
      }

      // Credit wallet atomically — mirrors /api/payment/verify logic exactly
      await prisma.$transaction([
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: amountInRupees } },
        }),
        prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'CREDIT',
            amount: amountInRupees,
            description: `Razorpay deposit of ₹${amountInRupees.toLocaleString('en-IN')}`,
            reference: paymentId,
          },
        }),
      ]);

      console.log('[WEBHOOK] Wallet credited | userId:', userId, '| amount: ₹' + amountInRupees, '| paymentId:', paymentId);
      return NextResponse.json({ status: 'processed' });
    }

    // ── payment.failed ─────────────────────────────────────────────────────
    if (eventType === 'payment.failed') {
      console.log('[WEBHOOK] Payment failed:', paymentEntity?.id, '|', paymentEntity?.error_description);
      return NextResponse.json({ status: 'noted' });
    }

    // ── all other events ───────────────────────────────────────────────────
    console.log('[WEBHOOK] Unhandled event type:', eventType);
    return NextResponse.json({ status: 'ignored' });

  } catch (error) {
    console.error('[WEBHOOK] Unhandled error:', error);
    // Always return 200 — never let Razorpay retry due to our own errors
    return NextResponse.json({ status: 'error' });
  }
}
