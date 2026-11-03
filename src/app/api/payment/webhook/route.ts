import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAndCreditWalletTopup } from '@/src/lib/payments/razorpay-wallet-intent';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return NextResponse.json({ status: 'skipped', reason: 'not configured' });

    // Timing-safe comparison, ported from the fix/seo-indexing-issues branch
    // (mirrors the pattern in Bell24h-OS's own requireServiceAuth.ts) -- a
    // plain `!==` on hex strings leaks timing information proportional to
    // how many leading characters match. Reject anything that isn't a
    // well-formed SHA-256 hex digest before comparing anything (a malformed
    // header should never reach a crypto call at all), then compare
    // fixed-length digests of both strings rather than the raw hex directly,
    // since timingSafeEqual throws on unequal-length buffers -- hashing both
    // sides first makes the two buffers always exactly 32 bytes each,
    // so there is no length-mismatch case left to handle.
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
    const isWellFormedSha256Hex = (value: string) => /^[0-9a-f]{64}$/i.test(value);
    const digest = (value: string) => crypto.createHash('sha256').update(value, 'utf8').digest();
    const signaturesMatch =
      isWellFormedSha256Hex(signature) &&
      digest(expectedSignature).length === digest(signature).length &&
      crypto.timingSafeEqual(digest(expectedSignature), digest(signature));
    if (!signaturesMatch) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

    const event = JSON.parse(body);
    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const notes = paymentEntity?.notes || {};

    console.log(`[WEBHOOK] ${eventType} | Payment: ${paymentEntity?.id}`);

    if (eventType === 'payment.captured') {
      const paymentId = paymentEntity.id;
      const orderId = paymentEntity.order_id;

      // Wallet Credit (Neon/Prisma) — the only reachable path. An earlier
      // "marketplace deal via InsForge" branch lived here, keyed off
      // notes.deal_id; removed (H6-10A) after confirming no live order-
      // creation code ever sets that field — every real order created by
      // this app sets notes.userId (WALLET_DEPOSIT) instead, so that branch
      // could never execute.
      //
      // Phase 11 (2026-11-03): this now goes through the same
      // verifyAndCreditWalletTopup used by the two client-facing routes,
      // instead of its own ad hoc `findFirst`-then-write idempotency check.
      // That check was a read-then-write race (two near-simultaneous
      // deliveries of the same event — Razorpay does retry webhooks — could
      // both pass `findFirst` before either committed); the shared helper's
      // atomic `updateMany(status: PENDING -> PAID)` closes that race. The
      // credited amount is still the PaymentIntent's stored amount, not
      // paymentEntity.amount — if the two ever disagree, that's a signal
      // worth investigating, not something to silently average.
      if (notes.userId && orderId) {
        const userId = notes.userId;
        const result = await verifyAndCreditWalletTopup({
          userId,
          orderId,
          paymentId,
          signature: null,
          trustedSource: true,
        });

        if (result.outcome === 'CREDITED') {
          if (result.amount !== Number(paymentEntity.amount)) {
            console.error(
              `[WEBHOOK] Amount mismatch for order ${orderId}: intent=${result.amount} webhook=${paymentEntity.amount}`,
            );
          }
          return NextResponse.json({ status: 'wallet_credited' });
        }
        if (result.outcome === 'ALREADY_PROCESSED') {
          return NextResponse.json({ status: 'already_processed' });
        }
        console.error(`[WEBHOOK] payment.captured for order ${orderId} did not credit: ${result.outcome}`);
        return NextResponse.json({ status: 'not_credited', reason: result.outcome });
      }
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 200 }); // Always 200 for Razorpay
  }
}
