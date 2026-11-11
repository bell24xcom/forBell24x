/**
 * Regression tests for POST /api/payment/webhook.
 *
 * Phase 12B-2 (2026-11-03): ported and adapted from the fix/seo-indexing-issues
 * branch's route.test.ts (dated 2026-10-25, 13 tests, all against the
 * pre-PaymentIntent webhook). That file tested a `findFirst`-based
 * idempotency check and a client-trusted amount, neither of which exist in
 * this route anymore -- see src/lib/payments/razorpay-wallet-intent.ts.
 * Every test below is adapted to exercise the REAL PaymentIntent-based
 * idempotency/amount-trust logic via a full `@/lib/prisma` mock (same
 * in-memory-table pattern as src/app/api/payment/razorpay-wallet-lifecycle.test.ts),
 * not a shallow mock of the helper function -- mocking the helper itself
 * would stop these tests from proving anything about the PaymentIntent gate.
 *
 * The signature-comparison tests below prove the ROUTE correctly rejects
 * non-matching, missing, and malformed signatures. They do NOT, and cannot,
 * prove that crypto.timingSafeEqual executes in constant time -- that
 * guarantee comes from using the correct cryptographic primitive, not from
 * a unit test. No assertion here claims otherwise.
 *
 * IMPORTANT SCOPE NOTE, carried forward unchanged from the original file:
 * this route only handles `payment.captured` for wallet deposits
 * (notes.userId + a matching order_id). It has no handling for
 * `payment.failed`, `refund.*`, or Deal-payment `notes.deal_id` events --
 * all three currently fall through to {status:'ignored'}. The tests below
 * document that *current* behavior honestly; they do not invent handling
 * that does not exist (see PHASE_12B_1_RAZORPAY_WEBHOOK_BRANCH_RECONCILIATION.md
 * §6 for the full list of known, unfixed gaps this does not pretend to close).
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

const WEBHOOK_SECRET = 'test_webhook_secret';

interface IntentRow {
  id: string;
  userId: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
}

let intents: IntentRow[] = [];
let wallets: Array<{ id: string; userId: string; balance: number }> = [];
let walletTxns: Array<{ id: string; walletId: string; reference: string | null }> = [];
let intentIdCounter = 0;
let walletIdCounter = 0;
let txnIdCounter = 0;
let transactionThrows: Error | null = null;

mock.module('@/lib/prisma', {
  namedExports: {
    prisma: {
      paymentIntent: {
        findUnique: async ({ where }: { where: { orderId: string } }) =>
          intents.find((i) => i.orderId === where.orderId) ?? null,
        updateMany: async ({ where, data }: { where: { orderId: string; status: string }; data: Record<string, any> }) => {
          const matches = intents.filter((i) => i.orderId === where.orderId && i.status === where.status);
          for (const row of matches) Object.assign(row, data);
          return { count: matches.length };
        },
        create: async ({ data }: { data: Record<string, any> }) => {
          intentIdCounter += 1;
          const row: IntentRow = { id: `intent_${intentIdCounter}`, status: 'PENDING', ...data };
          intents.push(row);
          return row;
        },
      },
      wallet: {
        findUnique: async ({ where }: { where: { userId: string } }) =>
          wallets.find((w) => w.userId === where.userId) ?? null,
        create: async ({ data }: { data: { userId: string; balance: number } }) => {
          walletIdCounter += 1;
          const row = { id: `wallet_${walletIdCounter}`, ...data };
          wallets.push(row);
          return row;
        },
        update: async ({ where, data }: { where: { id: string }; data: { balance: { increment: number } } }) => {
          const row = wallets.find((w) => w.id === where.id);
          if (!row) throw new Error('wallet not found');
          row.balance += data.balance.increment;
          return row;
        },
      },
      walletTransaction: {
        create: async ({ data }: { data: Record<string, any> }) => {
          txnIdCounter += 1;
          const row = { id: `wtxn_${txnIdCounter}`, walletId: data.walletId, reference: data.reference ?? null };
          walletTxns.push(row);
          return row;
        },
      },
      $transaction: async (ops: Promise<unknown>[]) => {
        if (transactionThrows) throw transactionThrows;
        return Promise.all(ops);
      },
    },
  },
});

let POST: (req: NextRequest) => Promise<Response>;

before(async () => {
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  ({ POST } = await import('./route.ts'));
});

beforeEach(() => {
  intents = [];
  wallets = [];
  walletTxns = [];
  intentIdCounter = 0;
  walletIdCounter = 0;
  txnIdCounter = 0;
  transactionThrows = null;
});

function sign(body: string, secret = WEBHOOK_SECRET): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function webhookRequest(payload: unknown, signatureOverride?: string): NextRequest {
  const body = JSON.stringify(payload);
  const signature = signatureOverride ?? sign(body);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (signature !== undefined) headers['x-razorpay-signature'] = signature;
  return new NextRequest('http://localhost/api/payment/webhook', { method: 'POST', headers, body });
}

function capturedEvent(overrides: Record<string, unknown> = {}) {
  return {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_1',
          order_id: 'order_test_1',
          amount: 50000,
          notes: { userId: 'user-1' },
          ...overrides,
        },
      },
    },
  };
}

function seedPendingIntent(overrides: Partial<IntentRow> = {}): IntentRow {
  const row: IntentRow = {
    id: 'intent_seed', userId: 'user-1', orderId: 'order_test_1', paymentId: null,
    amount: 50000, currency: 'INR', status: 'PENDING', ...overrides,
  };
  intents.push(row);
  return row;
}

// ─── Signature validation ───────────────────────────────────────────────

test('missing signature header is rejected (400)', async () => {
  const res = await POST(new NextRequest('http://localhost/api/payment/webhook', {
    method: 'POST', body: JSON.stringify(capturedEvent()),
  }));
  assert.equal(res.status, 400);
});

test('invalid (well-formed hex, wrong value) signature is rejected (400), intent never touched', async () => {
  seedPendingIntent();
  const res = await POST(webhookRequest(capturedEvent(), 'deadbeef'.repeat(8)));
  assert.equal(res.status, 400);
  assert.equal(intents[0].status, 'PENDING');
});

test('malformed signature (not valid hex, not 64 chars) is rejected (400), not a crash in timingSafeEqual', async () => {
  seedPendingIntent();
  const res = await POST(webhookRequest(capturedEvent(), 'not-a-hex-signature!!'));
  assert.equal(res.status, 400);
  assert.equal(intents[0].status, 'PENDING');
});

test('a signature computed over a DIFFERENT body than the one received is rejected (confirms raw-body binding)', async () => {
  seedPendingIntent();
  const realBody = JSON.stringify(capturedEvent());
  const tamperedSignature = sign(JSON.stringify(capturedEvent({ amount: 999999 })));
  const req = new NextRequest('http://localhost/api/payment/webhook', {
    method: 'POST', headers: { 'x-razorpay-signature': tamperedSignature }, body: realBody,
  });
  const res = await POST(req);
  assert.equal(res.status, 400);
});

test('valid signature + a matching PENDING PaymentIntent: accepted, wallet credited exactly once', async () => {
  seedPendingIntent();
  const res = await POST(webhookRequest(capturedEvent()));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.status, 'wallet_credited');
  assert.equal(wallets[0].balance, 500); // 50000 paise -> ₹500
  assert.equal(intents[0].status, 'PAID');
});

test('missing RAZORPAY_WEBHOOK_SECRET fails safe: skipped, not a false "processed"', async () => {
  seedPendingIntent();
  const original = process.env.RAZORPAY_WEBHOOK_SECRET;
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
  const res = await POST(webhookRequest(capturedEvent()));
  const json = await res.json();
  assert.equal(json.status, 'skipped');
  assert.equal(intents[0].status, 'PENDING', 'nothing should be credited while skipped');
  process.env.RAZORPAY_WEBHOOK_SECRET = original;
});

// ─── Idempotency / duplicate delivery (PaymentIntent-based, Phase 11) ──────

test('a duplicate delivery of an already-processed payment is a no-op, not a double credit', async () => {
  seedPendingIntent({ status: 'PAID', paymentId: 'pay_test_1' });
  const res = await POST(webhookRequest(capturedEvent()));
  const json = await res.json();
  assert.equal(json.status, 'already_processed');
  assert.equal(wallets.length, 0, 'no credit should ever be attempted for an already-PAID intent');
});

test('two sequential deliveries for the same payment: the second sees the first\'s PAID state and does not double-credit', async () => {
  seedPendingIntent();
  const first = await POST(webhookRequest(capturedEvent()));
  assert.equal((await first.json()).status, 'wallet_credited');
  const second = await POST(webhookRequest(capturedEvent()));
  assert.equal((await second.json()).status, 'already_processed');
  assert.equal(wallets[0].balance, 500, 'exactly one credit across both deliveries');
});

test('two concurrent deliveries for the same payment (Promise.all): exactly one credit, the other sees ALREADY_PROCESSED', async () => {
  seedPendingIntent();
  const [a, b] = await Promise.all([POST(webhookRequest(capturedEvent())), POST(webhookRequest(capturedEvent()))]);
  const [ja, jb] = await Promise.all([a.json(), b.json()]);
  const statuses = [ja.status, jb.status].sort();
  assert.deepEqual(statuses, ['already_processed', 'wallet_credited']);
  assert.equal(wallets[0].balance, 500);
});

// ─── Unauthorized / invalid payment events (ignored, not errored) ─────────

test('an unknown order/payment reference (no notes.userId at all) is ignored, not errored', async () => {
  const res = await POST(webhookRequest(capturedEvent({ notes: {} })));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ignored');
});

test('webhook claims a userId that does NOT match the PaymentIntent\'s owner: not credited (FORBIDDEN path), never silently accepted', async () => {
  seedPendingIntent({ userId: 'real-owner' });
  const res = await POST(webhookRequest(capturedEvent({ notes: { userId: 'attacker' } })));
  const json = await res.json();
  assert.equal(res.status, 200); // always 200 for Razorpay
  assert.equal(json.status, 'not_credited');
  assert.equal(wallets.length, 0);
});

test('a Deal-payment event (notes.deal_id, no notes.userId) is currently ignored -- documents the confirmed reconciliation gap, not a new behavior', async () => {
  const res = await POST(webhookRequest(capturedEvent({ notes: { deal_id: 'deal-1', rfq_id: 'rfq-1', buyer_id: 'buyer-1' } })));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ignored');
  assert.equal(wallets.length, 0);
});

test('a payment.failed event is currently ignored -- no FAILED/CANCELLED transition exists for this path yet', async () => {
  const res = await POST(webhookRequest({ event: 'payment.failed', payload: { payment: { entity: { id: 'pay_x', order_id: 'order_test_1', amount: 1000, notes: { userId: 'user-1' } } } } }));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ignored');
});

test('a refund event is currently ignored -- no REFUNDED transition exists for this path yet', async () => {
  const res = await POST(webhookRequest({ event: 'refund.processed', payload: { payment: { entity: { id: 'pay_x', order_id: 'order_test_1', amount: 1000, notes: { userId: 'user-1' } } } } }));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ignored');
});

// ─── Error handling ──────────────────────────────────────────────────────

test('a transaction-write failure returns a safe error envelope, not a false "wallet_credited"', async () => {
  seedPendingIntent();
  transactionThrows = new Error('P2024: Timed out fetching a new connection from the pool at host db-internal.prod.local');
  const res = await POST(webhookRequest(capturedEvent()));
  // Always 200 for Razorpay (deliberate, documented in source) -- but the
  // body must say 'error', never claim success.
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.status, 'error');
  assert.ok(!JSON.stringify(json).includes('db-internal.prod.local'), 'raw DB error must never reach the response body');
});

test('a malformed JSON body is rejected safely, not a 500 crash', async () => {
  const body = 'not valid json{{{';
  const req = new NextRequest('http://localhost/api/payment/webhook', {
    method: 'POST', headers: { 'x-razorpay-signature': sign(body) }, body,
  });
  const res = await POST(req);
  assert.equal(res.status, 200); // reaches the catch block, always-200-for-Razorpay
  assert.equal((await res.json()).status, 'error');
});
