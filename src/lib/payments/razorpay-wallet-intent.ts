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

  const amountRupees = decision.amount / 100;

  // Single interactive transaction: the PENDING -> PAID claim, the
  // find-or-create wallet, and the balance credit all commit or roll back
  // together. This matters beyond the wallet-creation race itself -- if the
  // claim is a separate auto-committing statement (as it was before) and
  // anything after it throws, the intent is stranded as PAID with no
  // credit ever applied, and a retry sees `count === 0` and reports
  // ALREADY_PROCESSED instead of actually crediting. Wrapping all three
  // steps together means a thrown error rolls the claim back to PENDING too,
  // so a retry can re-claim and credit cleanly.
  //
  // The wallet step uses `upsert` (not findUnique + create) because
  // `wallets.user_id` carries a real DB-level unique index
  // (`wallets_user_id_key`, present since migration 0001_baseline and never
  // dropped) -- Postgres, not just Prisma, is the thing preventing two
  // concurrent callers for the same user from ever creating two wallet rows.
  const result = await prisma.$transaction(async (tx) => {
    // Only one concurrent caller can ever see `count === 1` for a given
    // order_id -- Postgres row-level locking on this UPDATE serializes
    // concurrent verifications of the same order.
    const { count } = await tx.paymentIntent.updateMany({
      where: { orderId: params.orderId, status: 'PENDING' },
      data: { status: 'PAID', paymentId: params.paymentId },
    });

    if (count === 0) {
      return { outcome: 'RACE_LOST' as const };
    }

    // `prisma.wallet.upsert()` is NOT used here -- confirmed empirically
    // (real Postgres, query logging enabled, see TASK 38B's probe) that
    // inside an interactive `$transaction` callback, Prisma's query engine
    // compiles `upsert` down to a plain SELECT -> INSERT -> SELECT
    // sequence, not a single `INSERT ... ON CONFLICT` statement, and gives
    // the engine no retry-as-update path of its own. Under genuine
    // concurrency this still can't create two wallet rows (the second
    // caller's INSERT blocks on the real `wallets_user_id_key` unique
    // index until the first commits), but the second caller's INSERT then
    // raises P2002 -- and Postgres aborts the ENTIRE transaction on any
    // statement error (so much as a later SELECT fails with `25P02: current
    // transaction is aborted` once that happens), which would also roll
    // back the PENDING -> PAID claim above for an otherwise-legitimate,
    // distinct payment. A `catch`-and-retry inside the same transaction
    // cannot recover from that -- it would need its own SAVEPOINT.
    //
    // A raw `INSERT ... ON CONFLICT (user_id) DO NOTHING` has no error path
    // at all: the conflict is handled inside Postgres itself, and the
    // statement simply returns zero rows instead of raising. That is the
    // genuine atomic primitive `wallets_user_id_key` was created to support,
    // and what Task 38A's review assumed was already happening.
    const inserted = await tx.$queryRaw<{ id: string }[]>`
      INSERT INTO wallets (id, user_id, balance, currency, "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${params.userId}, 0, 'INR', now(), now())
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `;
    const wallet = inserted[0]
      ? inserted[0]
      : await tx.wallet.findUniqueOrThrow({ where: { userId: params.userId } });

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amountRupees } },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amount: amountRupees,
        description: isTestMode ? 'Test deposit' : 'Razorpay deposit',
        reference: params.paymentId,
      },
    });

    return {
      outcome: 'CREDITED' as const,
      amount: decision.amount,
      currency: decision.currency,
      balance: updatedWallet.balance,
    };
  });

  if (result.outcome === 'RACE_LOST') {
    // Lost the race to a concurrent verification of the same order -- not an
    // error, just not the one that gets to credit. Re-read to confirm it's
    // genuinely now PAID (not FAILED) before telling the caller it's fine.
    const settled = await prisma.paymentIntent.findUnique({ where: { orderId: params.orderId } });
    if (settled?.status === 'PAID') return { outcome: 'ALREADY_PROCESSED' };
    return { outcome: 'PAYMENT_ID_CONFLICT' };
  }

  return result;
}
