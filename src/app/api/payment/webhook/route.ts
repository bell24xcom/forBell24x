import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return NextResponse.json({ status: 'skipped', reason: 'not configured' });

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
    if (expectedSignature !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

    const event = JSON.parse(body);
    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const notes = paymentEntity?.notes || {};

    console.log(`[WEBHOOK] ${eventType} | Payment: ${paymentEntity?.id}`);

    if (eventType === 'payment.captured') {
      const paymentId = paymentEntity.id;
      const amountInRupees = paymentEntity.amount / 100;

      // Wallet Credit (Neon/Prisma) — the only reachable path. An earlier
      // "marketplace deal via InsForge" branch lived here, keyed off
      // notes.deal_id; removed (H6-10A) after confirming no live order-
      // creation code ever sets that field — every real order created by
      // this app sets notes.userId (WALLET_DEPOSIT) instead, so that branch
      // could never execute. This branch, the actually-executing one, is
      // unchanged.
      if (notes.userId) {
        const userId = notes.userId;
        const existing = await prisma.walletTransaction.findFirst({ where: { reference: paymentId } });
        if (existing) return NextResponse.json({ status: 'already_processed' });

        let wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });

        await prisma.$transaction([
          prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amountInRupees } } }),
          prisma.walletTransaction.create({
            data: { walletId: wallet.id, type: 'CREDIT', amount: amountInRupees, reference: paymentId, description: 'Razorpay Wallet Deposit' }
          }),
        ]);

        return NextResponse.json({ status: 'wallet_credited' });
      }
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 200 }); // Always 200 for Razorpay
  }
}
