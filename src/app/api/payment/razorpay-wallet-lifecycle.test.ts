/**
 * Cross-route regression tests for the Razorpay wallet-deposit lifecycle
 * (Phase 11, 2026-11-03): POST /api/payment/create-order (order creation),
 * PUT /api/payment/create-order and POST /api/payment/verify (both
 * independently-reachable verify-and-credit paths), and POST
 * /api/payment/webhook's payment.captured handling.
 *
 * Mocks `@/lib/jwt`, `@/lib/prisma`, `razorpay`, `@/lib/memory-engine`, and
 * `@/lib/site-url` via node:test's `mock.module` -- no live database or
 * Razorpay call is possible. Requires `--experimental-test-module-mocks`.
 *
 * The in-memory tables below stand in for the real `payment_intents`,
 * `wallets`, and `wallet_transactions` tables, shared across all three
 * routes under test so a scenario can exercise create -> verify -> replay
 * -> webhook in one test, exactly as a real attacker or a real Razorpay
 * retry would. `paymentIntent.updateMany` reproduces Postgres's
 * `WHERE status = 'PENDING'` semantics (only rows matching the WHERE at
 * call time are updated) -- this is what the idempotency tests below
 * actually exercise, though a single-threaded mock cannot prove real
 * row-level-lock behavior under true concurrency (see this repo's own
 * src/app/api/monetization/pay/route.concurrency.test.ts for why that gap
 * is a documented environmental limitation, not an oversight, carried
 * forward into the final report's "remaining uncertainty" section).
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

interface MockAuthUser {
  userId: string;
  phone: string | null;
  role: string;
}

let authResult: MockAuthUser | null = null;

interface IntentRow {
  id: string;
  userId: string;
  purpose: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
}

let intents: IntentRow[] = [];
let wallets: Array<{ id: string; userId: string; balance: number }> = [];
let walletTxns: Array<{ id: string; walletId: string; type: string; amount: number; reference: string | null; description: string | null }> = [];
let intentIdCounter = 0;
let walletIdCounter = 0;
let txnIdCounter = 0;

let ordersCreateCalls: Array<Record<string, unknown>> = [];
let ordersCreateResult: Record<string, unknown> = { id: 'order_live_1', amount: 50000, currency: 'INR' };

mock.module('@/lib/jwt', {
  namedExports: {
    authenticate: async () => authResult,
  },
});

mock.module('@/lib/memory-engine', {
  namedExports: { storeInteraction: async () => {} },
});

mock.module('@/lib/site-url', {
  namedExports: { SITE_URL: 'https://test.invalid' },
});

mock.module('@/lib/prisma', {
  namedExports: {
    prisma: {
      paymentIntent: {
        create: async ({ data }: { data: Record<string, any> }) => {
          intentIdCounter += 1;
          const row: IntentRow = {
            id: `intent_${intentIdCounter}`,
            userId: data.userId,
            purpose: data.purpose,
            orderId: data.orderId,
            paymentId: data.paymentId ?? null,
            amount: data.amount,
            currency: data.currency,
            status: data.status ?? 'PENDING',
          };
          intents.push(row);
          return row;
        },
        findUnique: async ({ where }: { where: { orderId: string } }) =>
          intents.find((i) => i.orderId === where.orderId) ?? null,
        updateMany: async ({ where, data }: { where: { orderId: string; status: string }; data: Record<string, any> }) => {
          const matches = intents.filter((i) => i.orderId === where.orderId && i.status === where.status);
          for (const row of matches) Object.assign(row, data);
          return { count: matches.length };
        },
      },
      wallet: {
        findUnique: async ({ where }: { where: { userId: string } }) =>
          wallets.find((w) => w.userId === where.userId) ?? null,
        create: async ({ data }: { data: { userId: string; balance: number } }) => {
          walletIdCounter += 1;
          const row = { id: `wallet_${walletIdCounter}`, userId: data.userId, balance: data.balance };
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
          const row = { id: `wtxn_${txnIdCounter}`, walletId: data.walletId, type: data.type, amount: data.amount, reference: data.reference ?? null, description: data.description ?? null };
          walletTxns.push(row);
          return row;
        },
        findFirst: async ({ where }: { where: { reference: string } }) =>
          walletTxns.find((t) => t.reference === where.reference) ?? null,
      },
      // Array-form $transaction: Prisma evaluates each array item eagerly
      // (they're already-invoked promises by the time $transaction sees
      // them), so the mock just awaits them in order -- matching how
      // src/lib/payments/razorpay-wallet-intent.ts calls it.
      $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
    },
  },
});

class FakeRazorpay {
  orders: { create: (opts: Record<string, unknown>) => Promise<Record<string, unknown>> };
  constructor() {
    this.orders = {
      create: async (opts: Record<string, unknown>) => {
        ordersCreateCalls.push(opts);
        return ordersCreateResult;
      },
    };
  }
}

mock.module('razorpay', { defaultExport: FakeRazorpay });

let createOrderPOST: (req: NextRequest) => Promise<Response>;
let createOrderPUT: (req: NextRequest) => Promise<Response>;
let verifyPOST: (req: NextRequest) => Promise<Response>;
let webhookPOST: (req: NextRequest) => Promise<Response>;

before(async () => {
  process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_key_id';
  process.env.RAZORPAY_KEY_SECRET = 'mock_secret_not_real';
  process.env.RAZORPAY_WEBHOOK_SECRET = 'mock_webhook_secret_not_real';
  ({ POST: createOrderPOST, PUT: createOrderPUT } = await import('./create-order/route.ts'));
  ({ POST: verifyPOST } = await import('./verify/route.ts'));
  ({ POST: webhookPOST } = await import('./webhook/route.ts'));
});

beforeEach(() => {
  authResult = { userId: 'user-1', phone: null, role: 'BUYER' };
  intents = [];
  wallets = [];
  walletTxns = [];
  intentIdCounter = 0;
  walletIdCounter = 0;
  txnIdCounter = 0;
  ordersCreateCalls = [];
  ordersCreateResult = { id: 'order_live_1', amount: 50000, currency: 'INR' }; // ₹500
});

function jsonRequest(url: string, method: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function checkoutSignature(orderId: string, paymentId: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', 'mock_secret_not_real').update(`${orderId}|${paymentId}`).digest('hex');
}

function webhookBody(eventType: string, payload: Record<string, unknown>): string {
  return JSON.stringify({ event: eventType, payload });
}

function webhookSignature(body: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', 'mock_webhook_secret_not_real').update(body).digest('hex');
}

// ─── 1. Order creation ──────────────────────────────────────────────────────

test('1: valid order creation persists exactly one PENDING PaymentIntent for the authenticated user', async () => {
  const res = await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(intents.length, 1);
  assert.equal(intents[0].userId, 'user-1');
  assert.equal(intents[0].status, 'PENDING');
  assert.equal(intents[0].amount, 50000);
});

test('2: unauthenticated order creation is rejected (401), no intent created, Razorpay never called', async () => {
  authResult = null;
  const res = await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  assert.equal(res.status, 401);
  assert.equal(intents.length, 0);
  assert.equal(ordersCreateCalls.length, 0);
});

// ─── 2. Signature validation on verify ──────────────────────────────────────

test('3: valid signature + PENDING intent (PUT create-order): credited exactly once, using the STORED amount', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;
  const sig = checkoutSignature(orderId, 'pay_real_1');

  const res = await createOrderPUT(jsonRequest('http://localhost/api/payment/create-order', 'PUT', {
    razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', razorpay_signature: sig,
  }));
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(wallets[0].balance, 500);
  assert.equal(walletTxns.length, 1);
});

test('4: invalid signature (PUT create-order): rejected, wallet never touched', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;

  const res = await createOrderPUT(jsonRequest('http://localhost/api/payment/create-order', 'PUT', {
    razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', razorpay_signature: 'f'.repeat(64),
  }));
  assert.equal(res.status, 400);
  assert.equal(wallets.length, 0);
  assert.equal(intents[0].status, 'PENDING');
});

test('5: missing signature (POST verify): rejected, wallet never touched', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;

  const res = await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', {
    razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', amount: 500,
  }));
  assert.equal(res.status, 400);
  assert.equal(wallets.length, 0);
});

test('6: mismatched order id in signature (signature computed for a DIFFERENT order): rejected', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;
  const sigForWrongOrder = checkoutSignature('order_someone_else', 'pay_real_1');

  const res = await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', {
    razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', razorpay_signature: sigForWrongOrder,
  }));
  assert.equal(res.status, 400);
  assert.equal(wallets.length, 0);
});

test('7: REGRESSION — altered/inflated amount claimed by the client is ignored; credited amount is the STORED order amount', async () => {
  // This is the exact pre-Phase-11 vulnerability: a real ₹5 (500 paise) order
  // is created, a real signature is obtained for it, then verify is called
  // claiming a much larger amount. The old code trusted that claim; the new
  // code doesn't even read it for the wallet-deposit path.
  ordersCreateResult = { id: 'order_live_1', amount: 500, currency: 'INR' }; // ₹5
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 5 }));
  const orderId = intents[0].orderId;
  const sig = checkoutSignature(orderId, 'pay_real_1');

  const res = await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', {
    razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', razorpay_signature: sig,
    amount: 999999, // attacker-claimed amount — must be ignored
  }));
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(wallets[0].balance, 5, 'credited balance must equal the STORED order amount (₹5), not the claimed ₹999999');
});

// ─── 3. Duplicate / idempotency ────────────────────────────────────────────

test('8: duplicate verification of the same real payment (POST verify called twice): exactly one wallet credit', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;
  const sig = checkoutSignature(orderId, 'pay_real_1');
  const body = { razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', razorpay_signature: sig };

  const first = await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', body));
  const second = await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', body));

  assert.equal((await first.json()).success, true);
  const secondData = await second.json();
  assert.equal(secondData.success, true);
  assert.equal(secondData.alreadyProcessed, true);
  assert.equal(wallets[0].balance, 500, 'balance must reflect exactly one credit, not two');
  assert.equal(walletTxns.length, 1);
});

test('9: create-order PUT and payment/verify POST both targeting the same real payment: exactly one credit across BOTH endpoints', async () => {
  // Confirms the two independently-reachable client call sites
  // (dashboard/wallet/page.tsx uses PUT create-order; wallet/page.tsx uses
  // POST verify) cannot double-credit by racing each other.
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;
  const sig = checkoutSignature(orderId, 'pay_real_1');
  const body = { razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', razorpay_signature: sig };

  await createOrderPUT(jsonRequest('http://localhost/api/payment/create-order', 'PUT', body));
  const second = await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', body));

  assert.equal((await second.json()).alreadyProcessed, true);
  assert.equal(wallets[0].balance, 500);
  assert.equal(walletTxns.length, 1);
});

test('10: a DIFFERENT real payment id re-using an already-PAID order id: rejected (409), not credited again', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;
  const sig1 = checkoutSignature(orderId, 'pay_real_1');
  await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', {
    razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', razorpay_signature: sig1,
  }));

  const sig2 = checkoutSignature(orderId, 'pay_real_2');
  const res = await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', {
    razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_2', razorpay_signature: sig2,
  }));
  assert.equal(res.status, 409);
  assert.equal(wallets[0].balance, 500, 'only the original payment should ever be credited');
});

test('11: concurrent verification of the same payment (simulated via Promise.all): exactly one credit, one loses the race cleanly', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;
  const sig = checkoutSignature(orderId, 'pay_real_1');
  const body = { razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', razorpay_signature: sig };

  const [r1, r2] = await Promise.all([
    verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', body)),
    verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', body)),
  ]);
  const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
  assert.equal(d1.success, true);
  assert.equal(d2.success, true);
  assert.equal(wallets[0].balance, 500, 'exactly one credit regardless of which request "won"');
  assert.equal(walletTxns.length, 1);
});

// ─── 4. Webhook ─────────────────────────────────────────────────────────────

test('12: valid payment.captured webhook credits the wallet using the webhook amount via the SAME intent-based path', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;

  const body = webhookBody('payment.captured', { payment: { entity: { id: 'pay_wh_1', order_id: orderId, amount: 50000, notes: { userId: 'user-1' } } } });
  const sig = webhookSignature(body);
  const res = await webhookPOST(new NextRequest('http://localhost/api/payment/webhook', {
    method: 'POST', headers: { 'x-razorpay-signature': sig }, body,
  }));
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.status, 'wallet_credited');
  assert.equal(wallets[0].balance, 500);
});

test('13: invalid webhook signature: rejected (400), never credited', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;
  const body = webhookBody('payment.captured', { payment: { entity: { id: 'pay_wh_1', order_id: orderId, amount: 50000, notes: { userId: 'user-1' } } } });

  const res = await webhookPOST(new NextRequest('http://localhost/api/payment/webhook', {
    method: 'POST', headers: { 'x-razorpay-signature': 'deadbeef'.repeat(8) }, body,
  }));
  assert.equal(res.status, 400);
  assert.equal(wallets.length, 0);
});

test('14: duplicate webhook delivery for the same payment (Razorpay retries): exactly one credit, both deliveries report success', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;
  const body = webhookBody('payment.captured', { payment: { entity: { id: 'pay_wh_1', order_id: orderId, amount: 50000, notes: { userId: 'user-1' } } } });
  const sig = webhookSignature(body);

  const first = await webhookPOST(new NextRequest('http://localhost/api/payment/webhook', { method: 'POST', headers: { 'x-razorpay-signature': sig }, body }));
  const second = await webhookPOST(new NextRequest('http://localhost/api/payment/webhook', { method: 'POST', headers: { 'x-razorpay-signature': sig }, body }));

  assert.equal((await first.json()).status, 'wallet_credited');
  assert.equal((await second.json()).status, 'already_processed');
  assert.equal(wallets[0].balance, 500);
  assert.equal(walletTxns.length, 1);
});

test('15: webhook for a payment already credited via the client verify path: recognized as already_processed, not double-credited', async () => {
  await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 500 }));
  const orderId = intents[0].orderId;
  const sig = checkoutSignature(orderId, 'pay_real_1');
  await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', {
    razorpay_order_id: orderId, razorpay_payment_id: 'pay_real_1', razorpay_signature: sig,
  }));

  const body = webhookBody('payment.captured', { payment: { entity: { id: 'pay_real_1', order_id: orderId, amount: 50000, notes: { userId: 'user-1' } } } });
  const wsig = webhookSignature(body);
  const res = await webhookPOST(new NextRequest('http://localhost/api/payment/webhook', { method: 'POST', headers: { 'x-razorpay-signature': wsig }, body }));
  assert.equal((await res.json()).status, 'already_processed');
  assert.equal(wallets[0].balance, 500);
  assert.equal(walletTxns.length, 1);
});

test('16: webhook for an unknown order id (no PaymentIntent exists): not credited, reported not_credited', async () => {
  const body = webhookBody('payment.captured', { payment: { entity: { id: 'pay_unknown', order_id: 'order_never_created', amount: 50000, notes: { userId: 'user-1' } } } });
  const sig = webhookSignature(body);
  const res = await webhookPOST(new NextRequest('http://localhost/api/payment/webhook', { method: 'POST', headers: { 'x-razorpay-signature': sig }, body }));
  const data = await res.json();
  assert.equal(res.status, 200); // Razorpay expects 200 even on a logical no-op, to avoid retry storms
  assert.equal(data.status, 'not_credited');
  assert.equal(wallets.length, 0);
});

// ─── 5. Test mode (no Razorpay keys configured) ────────────────────────────

test('17: test-mode order creation + verification works end to end without any signature', async () => {
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  const createRes = await createOrderPOST(jsonRequest('http://localhost/api/payment/create-order', 'POST', { amount: 250 }));
  const createData = await createRes.json();
  assert.equal(createData.testMode, true);

  const verifyRes = await verifyPOST(jsonRequest('http://localhost/api/payment/verify', 'POST', {
    razorpay_order_id: createData.orderId, razorpay_payment_id: 'pay_test_1',
  }));
  const verifyData = await verifyRes.json();
  assert.equal(verifyData.success, true);
  assert.equal(wallets[0].balance, 250);

  process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_key_id';
  process.env.RAZORPAY_KEY_SECRET = 'mock_secret_not_real';
});
