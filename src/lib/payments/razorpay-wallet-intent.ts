/**
 * Route-level IO for Razorpay wallet-deposit PaymentIntents (Phase 11,
 * 2026-11-03). Pairs with the pure decision logic in
 * lib/razorpay-payment-intent.ts. Shared by the two existing live call
 * sites (/api/payment/create-order and /api/payment/verify) plus the
 * webhook handler, so there is exactly one place that creates a
 * PaymentIntent and exactly one place that atomically marks one PAID.
 */
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import {
  decideIntentVerification,
  type PaymentIntentRow,
  type VerificationDecision,
} from '../../../lib/razorpay-payment-intent';

// Constructed lazily inside each call -- a top-level `new Razorpay(...)`
// with a missing key throws during `next build`'s page-data-collection
// step and fails the whole build. Same convention as every other Razorpay
// call site in this codebase (src/app/api/monetization/pay/route.ts).
function getRazorpay(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

export interface CreateWalletTopupResult {
  success: true;
  testMode: boolean;
  orderId: string;
  amount: number; // paise
  currency: string;
  key: string;
}

export interface CreateWalletTopupError {
  success: false;
  status: number;
  error: string;
}

/**
 * Create a Razorpay order for a wallet top-up AND persist the server-trusted
 * PaymentIntent row before returning anything to the client. This is the
 * one place `amount`/`currency` are ever trusted from client input --
 * verification never reads them from the request again.
 */
export async function createWalletTopupIntent(
  userId: string,
  amountRupees: number,
  currency: string,
): Promise<CreateWalletTopupResult | CreateWalletTopupError> {
  const amountPaise = Math.round(amountRupees * 100);
  const razorpay = getRazorpay();

  if (!razorpay) {
    // Test mode: no real order, but still persist an intent so verification
    // has something trustworthy to check against -- the previous test-mode
    // branch returned a fabricated order id with NO persisted record at all.
    const orderId = `order_test_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await prisma.paymentIntent.create({
      data: {
        userId,
        purpose: 'WALLET_DEPOSIT',
        orderId,
        amount: amountPaise,
        currency,
        status: 'PENDING',
      },
    });
    return {
      success: true,
      testMode: true,
      orderId,
      amount: amountPaise,
      currency,
      key: 'rzp_test_placeholder',
    };
  }

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency,
    receipt: `wal_${Date.now()}`,
    notes: { userId, type: 'WALLET_DEPOSIT', platform: 'Bell24h' },
  });

  await prisma.paymentIntent.create({
    data: {
      userId,
      purpose: 'WALLET_DEPOSIT',
      orderId: order.id,
      amount: Number(order.amount),
      currency: String(order.currency),
      status: 'PENDING',
    },
  });

  return {
    success: true,
    testMode: false,
    orderId: order.id,
    amount: Number(order.amount),
    currency: String(order.currency),
    key: process.env.RAZORPAY_KEY_ID!,
  };
}

export interface VerifyWalletTopupParams {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string | null;
  /** See VerificationRequest.trustedSource in lib/razorpay-payment-intent.ts. */
  trustedSource?: boolean;
}

export type VerifyWalletTopupResult =
  | { outcome: 'CREDITED'; amount: number; currency: string; balance: number }
  | { outcome: 'ALREADY_PROCESSED' }
  | VerificationDecision & { outcome: 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID_SIGNATURE' | 'PAYMENT_ID_CONFLICT' };

/**
 * Verify a wallet-deposit payment and credit the wallet exactly once.
 * Idempotency is enforced by a single conditional `updateMany` (status:
 * PENDING in the WHERE clause) -- if two requests race, Postgres's
 * row-level locking on the UPDATE ensures only one `count === 1` result,
 * and the loser falls through to re-reading the now-PAID row rather than
 * crediting a second time.
 */
export async function verifyAndCreditWalletTopup(
  params: VerifyWalletTopupParams,
): Promise<VerifyWalletTopupResult> {
  const intent = await prisma.paymentIntent.findUnique({ where: { orderId: params.orderId } });
  const isTestMode = params.orderId.startsWith('order_test_') && process.env.NODE_ENV !== 'production';
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? null;

  const intentRow: PaymentIntentRow | null = intent
    ? {
        id: intent.id,
        userId: intent.userId,
        orderId: intent.orderId,
        paymentId: intent.paymentId,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
      }
    : null;

  const decision = decideIntentVerification(
    intentRow,
    {
      userId: params.userId,
      orderId: params.orderId,
      paymentId: params.paymentId,
      signature: params.signature,
      isTestMode,
      trustedSource: params.trustedSource,
    },
    keySecret,
  );

  if (decision.outcome !== 'READY_TO_CREDIT') {
    return decision as VerifyWalletTopupResult;
  }

  // Atomic PENDING -> PAID transition. Only one concurrent caller can ever
  // see `count === 1` for a given order_id.
  const { count } = await prisma.paymentIntent.updateMany({
    where: { orderId: params.orderId, status: 'PENDING' },
    data: { status: 'PAID', paymentId: params.paymentId },
  });

  if (count === 0) {
    // Lost the race to a concurrent verification of the same order -- not an
    // error, just not the one that gets to credit. Re-read to confirm it's
    // genuinely now PAID (not FAILED) before telling the caller it's fine.
    const settled = await prisma.paymentIntent.findUnique({ where: { orderId: params.orderId } });
    if (settled?.status === 'PAID') return { outcome: 'ALREADY_PROCESSED' };
    return { outcome: 'PAYMENT_ID_CONFLICT' };
  }

  const amountRupees = decision.amount / 100;
  let wallet = await prisma.wallet.findUnique({ where: { userId: params.userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId: params.userId, balance: 0 } });
  }

  const [, updatedWallet] = await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amount: amountRupees,
        description: isTestMode ? 'Test deposit' : 'Razorpay deposit',
        reference: params.paymentId,
      },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amountRupees } },
    }),
  ]);

  return {
    outcome: 'CREDITED',
    amount: decision.amount,
    currency: decision.currency,
    balance: updatedWallet.balance,
  };
}
