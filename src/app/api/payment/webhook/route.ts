import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

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

      // ─── ROUTE A: Marketplace Deal (InsForge) ──────────────────────────────
      if (notes.deal_id) {
        console.log(`[WEBHOOK] Processing Marketplace Deal: ${notes.deal_id}`);
        
        // 1. Update Deal Status
        await fetch(`${INSFORGE_URL}/rest/v1/deals?id=eq.${notes.deal_id}`, {
          method: 'PATCH',
          headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'escrow_funded', updated_at: new Date().toISOString() })
        });

        // 2. Update Transaction Record
        await fetch(`${INSFORGE_URL}/rest/v1/transactions?provider_payment_id=eq.${paymentEntity.order_id}`, {
          method: 'PATCH',
          headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'captured', metadata: { razorpay_payment_id: paymentId } })
        });

        // 3. Trigger Notification (Notify Supplier to start work)
        if (N8N_WEBHOOK_URL) {
          fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'payment_success', deal_id: notes.deal_id, amount: amountInRupees })
          }).catch(console.error);
        }

        return NextResponse.json({ status: 'marketplace_deal_processed' });
      }

      // ─── ROUTE B: Wallet Credit (Neon) ─────────────────────────────────────
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
