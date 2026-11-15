/**
 * Authorization and idempotency decisions for Razorpay wallet-deposit
 * verification (Phase 11, 2026-11-03).
 *
 * The defect this closes: /api/payment/create-order's PUT handler and
 * /api/payment/verify's POST handler both credited the wallet using a
 * client-supplied `amount` field, with the Razorpay signature covering only
 * `order_id|payment_id` (never amount) and no persisted record of what the
 * order was actually created for. A valid signature from any real payment
 * (e.g. a real ₹1 top-up) could be replayed with an inflated `amount` to
 * credit an arbitrary balance. Neither route checked whether a given
 * payment_id had already been used, so either route could also be called
 * repeatedly with the same real signature to credit the wallet more than
 * once.
 *
 * This module only encodes the *decision* logic — whether a PaymentIntent
 * row's state and the caller's identity justify crediting the wallet, and
 * for exactly which stored amount/currency. The route layer still owns the
 * actual Prisma `updateMany` (status: PENDING -> PAID) that makes this
 * atomic under concurrency: see src/lib/payments/razorpay-wallet-intent.ts.
 * Pure and framework-free, mirroring lib/payment-authorization.ts, so it is
 * testable under plain `node --test` without mocking next/server, Prisma,
 * or the razorpay SDK.
 */
import crypto from 'crypto';

export interface PaymentIntentRow {
  id: string;
  userId: string;
  orderId: string;
  paymentId: string | null;
  amount: number; // smallest currency unit (paise)
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
}

export interface VerificationRequest {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string | null;
  isTestMode: boolean;
  /**
   * True only for the Razorpay webhook call site, which has already
   * authenticated the entire request body via a separate whole-body HMAC
   * (RAZORPAY_WEBHOOK_SECRET) before this decision is ever reached -- the
   * per-checkout `order_id|payment_id` signature this module otherwise
   * checks does not apply there. Never set this from a client-facing route.
   */
  trustedSource?: boolean;
}

export type VerificationDecision =
  | { outcome: 'NOT_FOUND' }
  | { outcome: 'FORBIDDEN' }
  | { outcome: 'INVALID_SIGNATURE' }
  | { outcome: 'ALREADY_PROCESSED' }
  | { outcome: 'PAYMENT_ID_CONFLICT' }
  | { outcome: 'READY_TO_CREDIT'; amount: number; currency: string };

/**
 * Pure HMAC-SHA256 check of Razorpay's checkout signature
 * (`order_id|payment_id`, keyed on RAZORPAY_KEY_SECRET). Identical algorithm
 * to what was previously duplicated inline in both create-order/route.ts
 * and verify/route.ts — extracted once so both call sites (and the webhook,
 * which verifies the whole raw body under a *different* secret) can't drift.
 */
export function verifyRazorpayChecklistSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string,
): boolean {
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  // Constant-time comparison -- avoid a timing side-channel on signature length/prefix.
  const expectedBuf = Buffer.from(expected, 'hex');
  const actualBuf = Buffer.from(signature, 'hex');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Decide what a verification request may do, given the persisted
 * PaymentIntent row (or null if no such order was ever created by this
 * app) and the caller's identity. Does not touch the database or credit
 * anything — the route performs the actual atomic transition for the
 * `READY_TO_CREDIT` case and must re-check the DB result (a concurrent
 * request can still win the race between this decision and the write).
 */
export function decideIntentVerification(
  intent: PaymentIntentRow | null,
  req: VerificationRequest,
  keySecret: string | null,
): VerificationDecision {
  if (!intent) return { outcome: 'NOT_FOUND' };
  if (intent.orderId !== req.orderId) return { outcome: 'NOT_FOUND' };
  if (intent.userId !== req.userId) return { outcome: 'FORBIDDEN' };

  if (!req.isTestMode && !req.trustedSource) {
    if (!req.signature || !keySecret) return { outcome: 'INVALID_SIGNATURE' };
    const valid = verifyRazorpayChecklistSignature(req.orderId, req.paymentId, req.signature, keySecret);
    if (!valid) return { outcome: 'INVALID_SIGNATURE' };
  }

  if (intent.status === 'PAID') {
    // Same payment_id re-submitted (retry/double-click/duplicate webhook) is
    // a legitimate, idempotent no-op. A *different* payment_id trying to
    // reuse an already-paid order is suspicious -- reject rather than credit
    // again or silently ignore.
    if (intent.paymentId === req.paymentId) return { outcome: 'ALREADY_PROCESSED' };
    return { outcome: 'PAYMENT_ID_CONFLICT' };
  }

  if (intent.status === 'FAILED') return { outcome: 'PAYMENT_ID_CONFLICT' };

  // status === 'PENDING' -- the only state in which crediting is justified.
  // Amount/currency come from the STORED intent, never from request input.
  return { outcome: 'READY_TO_CREDIT', amount: intent.amount, currency: intent.currency };
}
