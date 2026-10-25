/**
 * Route-level regression tests for POST /api/monetization/pay (P0 security
 * fix 2026-10-19, concurrency fix 2026-10-19 Task 28).
 *
 * Mocks `@/lib/jwt` (authenticate), `@/lib/prisma` (prisma.$transaction /
 * prisma.transaction.update), and `razorpay` (orders.create) via node:test's
 * `mock.module` -- no live database, InsForge, or Razorpay call is possible.
 * Requires `--experimental-test-module-mocks` (see the "test:payment-route"
 * package.json script); without it, `mock.module` is not a function and
 * every test here fails at setup, not at an assertion -- a hard signal, not
 * a silent skip.
 *
 * This complements, not replaces, lib/payment-authorization.test.ts, which
 * covers the pure authorization/idempotency decision logic in isolation.
 * This file proves the ROUTE wires that logic in correctly, INCLUDING the
 * reserve-before-call / finalize-after-call pattern added for the
 * concurrent-duplicate-order fix. It still cannot prove real PostgreSQL
 * `SELECT ... FOR UPDATE` lock semantics -- Node's mocks run everything on
 * one thread, sequentially; see the final report's "remaining uncertainty"
 * section for why that gap is a genuine environmental limitation, not an
 * oversight.
 *
 * The in-memory `transactionsTable` below stands in for the real
 * `transactions` table: tx.transaction.findFirst/create and the top-level
 * prisma.transaction.update all read/write the same array, so a test can
 * exercise the full reserve -> (success | fail) -> retry lifecycle, not
 * just one isolated call.
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';

interface MockAuthUser {
  userId: string;
  phone: string | null;
  role: string;
}

let authResult: MockAuthUser | null = null;
let authThrows: Error | null = null;
let dealRow: Record<string, unknown> | null = null;
let dealLookupThrows: Error | null = null;

// Stands in for the real `transactions` table across tx.transaction.* and
// the top-level prisma.transaction.update.
let transactionsTable: Array<Record<string, any>> = [];
let txnIdCounter = 0;

const transactionCreateCalls: Array<Record<string, unknown>> = [];
const transactionUpdateCalls: Array<{ where: Record<string, unknown>; data: Record<string, unknown> }> = [];
const ordersCreateCalls: Array<Record<string, unknown>> = [];
const queryRawCalls: Array<string> = [];
let ordersCreateResult: Record<string, unknown> = { id: 'order_mock_1', amount: 500000, currency: 'INR' };
let ordersCreateThrows: Error | null = null;
let transactionCalls = 0;
// Number of times the top-level prisma.transaction.update() call should
// throw before succeeding -- simulates a transient DB error during the
// post-Razorpay finalize write (Task 29).
let transactionUpdateThrowsCount = 0;

mock.module('@/lib/jwt', {
  namedExports: {
    authenticate: async () => {
      if (authThrows) throw authThrows;
      return authResult;
    },
  },
});

mock.module('@/lib/prisma', {
  namedExports: {
    prisma: {
      $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
        transactionCalls += 1;
        const tx = {
          $queryRaw: async (strings: TemplateStringsArray, ..._values: unknown[]) => {
            queryRawCalls.push(strings.join(''));
            if (dealLookupThrows) throw dealLookupThrows;
            return dealRow ? [dealRow] : [];
          },
          transaction: {
            findFirst: async ({ where }: { where: { quoteId: string; status: { in: string[] } } }) => {
              const candidates = transactionsTable.filter(
                (t) => t.quoteId === where.quoteId && where.status.in.includes(t.status),
              );
              return candidates.length > 0 ? candidates[candidates.length - 1] : null;
            },
            create: async ({ data }: { data: Record<string, unknown> }) => {
              transactionCreateCalls.push(data);
              txnIdCounter += 1;
              const row = { id: `txn_mock_${txnIdCounter}`, ...data };
              transactionsTable.push(row);
              return row;
            },
          },
        };
        return fn(tx);
      },
      transaction: {
        update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          transactionUpdateCalls.push({ where, data });
          if (transactionUpdateThrowsCount > 0) {
            transactionUpdateThrowsCount -= 1;
            throw new Error('P2024: Timed out fetching a new connection from the pool');
          }
          const row = transactionsTable.find((t) => t.id === where.id);
          if (row) Object.assign(row, data);
          return row;
        },
      },
    },
  },
});

class FakeRazorpay {
  orders: { create: (opts: Record<string, unknown>) => Promise<Record<string, unknown>> };
  constructor() {
    this.orders = {
      create: async (opts: Record<string, unknown>) => {
        ordersCreateCalls.push(opts);
        if (ordersCreateThrows) throw ordersCreateThrows;
        return ordersCreateResult;
      },
    };
  }
}

mock.module('razorpay', { defaultExport: FakeRazorpay });

let POST: (req: NextRequest) => Promise<Response>;

before(async () => {
  process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_key_id';
  process.env.RAZORPAY_KEY_SECRET = 'mock_secret_not_real';
  const routeUrl = pathToFileURL(
    'C:/Users/Sanika/Projects/bell24h/src/app/api/monetization/pay/route.ts',
  ).href;
  ({ POST } = await import(routeUrl));
});

beforeEach(() => {
  authResult = { userId: 'buyer-1', phone: null, role: 'BUYER' };
  authThrows = null;
  dealRow = {
    id: 'deal-1',
    rfqId: 'rfq-1',
    quoteId: 'quote-1',
    buyerId: 'buyer-1',
    supplierId: 'supplier-1',
    price: 5000,
    status: 'ACTIVE',
  };
  dealLookupThrows = null;
  transactionsTable = [];
  txnIdCounter = 0;
  transactionCreateCalls.length = 0;
  transactionUpdateCalls.length = 0;
  ordersCreateCalls.length = 0;
  queryRawCalls.length = 0;
  ordersCreateResult = { id: 'order_mock_1', amount: 500000, currency: 'INR' };
  ordersCreateThrows = null;
  transactionCalls = 0;
  transactionUpdateThrowsCount = 0;
});

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/monetization/pay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// ─── 1. Unauthenticated ─────────────────────────────────────────────────────

test('1: unauthenticated request is rejected (401), Razorpay never called', async () => {
  authResult = null;
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 401);
  assert.equal(ordersCreateCalls.length, 0);
  assert.equal(transactionCalls, 0, 'the row-locking transaction must not even open for an unauthenticated request');
});

// ─── 2. Authenticated but not authorized for the deal ──────────────────────

test('2: authenticated user who is not the deal buyer is rejected (403), Razorpay never called', async () => {
  authResult = { userId: 'someone-else', phone: null, role: 'BUYER' };
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 403);
  assert.equal(ordersCreateCalls.length, 0);
  assert.equal(transactionCreateCalls.length, 0, 'no reservation should be created for an unauthorized caller');
});

test('2b: the deal supplier (not the buyer) is also rejected (403) -- payment is buyer-only', async () => {
  authResult = { userId: 'supplier-1', phone: null, role: 'SUPPLIER' };
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 403);
  assert.equal(ordersCreateCalls.length, 0);
});

// ─── 3. Missing or malformed dealId ─────────────────────────────────────────

test('3: missing dealId is rejected (400)', async () => {
  const res = await POST(postRequest({}));
  assert.equal(res.status, 400);
  assert.equal(ordersCreateCalls.length, 0);
  assert.equal(transactionCalls, 0);
});

test('3b: a non-string dealId is rejected (400)', async () => {
  const res = await POST(postRequest({ dealId: 12345 }));
  assert.equal(res.status, 400);
});

test('3c: a completely malformed (non-JSON) body is rejected (400), not a 500 crash', async () => {
  const req = new NextRequest('http://localhost/api/monetization/pay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: 'not valid json{{{',
  });
  const res = await POST(req);
  assert.equal(res.status, 400);
});

// ─── 4. Nonexistent deal ─────────────────────────────────────────────────────

test('4: a nonexistent deal is handled safely (404), Razorpay never called', async () => {
  dealRow = null;
  const res = await POST(postRequest({ dealId: 'deal-does-not-exist' }));
  assert.equal(res.status, 404);
  assert.equal(ordersCreateCalls.length, 0);
});

// ─── 5. Authorized success path ─────────────────────────────────────────────

test('5: an authorized buyer on an ACTIVE deal can initialize payment using the server-side amount', async () => {
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.orderId, 'order_mock_1');
  assert.equal(ordersCreateCalls.length, 1);
  // deal.price (5000) * 100 = 500000 paise -- never a caller-supplied amount.
  assert.equal(ordersCreateCalls[0].amount, 500000);
  assert.equal(ordersCreateCalls[0].currency, 'INR');
  // The transaction is reserved (inside the lock) BEFORE Razorpay is called,
  // then finalized with the real order id via a separate update.
  assert.equal(transactionCreateCalls.length, 1);
  assert.equal(transactionCreateCalls[0].status, 'PENDING');
  assert.equal(transactionCreateCalls[0].paymentMethod, 'razorpay');
  assert.equal(transactionUpdateCalls.length, 1);
  assert.equal((transactionUpdateCalls[0].data.metadata as any).razorpayOrderId, 'order_mock_1');
});

// ─── 6. Caller-supplied amount/currency/ownership cannot override trusted data ──

test('6: a caller-supplied amount, currency, and buyerId in the body are ignored entirely', async () => {
  const res = await POST(
    postRequest({
      dealId: 'deal-1',
      amount: 1,
      currency: 'USD',
      buyerId: 'attacker-controlled-id',
      deal_value: 999999,
    }),
  );
  assert.equal(res.status, 200);
  assert.equal(ordersCreateCalls[0].amount, 500000);
  assert.equal(ordersCreateCalls[0].currency, 'INR');
});

// ─── 7. InsForge no longer required ─────────────────────────────────────────

test('7: the route never references INSFORGE_URL/INSFORGE_API_KEY -- the deal lookup works with both unset', async () => {
  delete process.env.INSFORGE_URL;
  delete process.env.INSFORGE_API_KEY;
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 200);
});

// ─── 8. Database errors fail safely ─────────────────────────────────────────

test('8: a database error during the locked deal lookup returns 500 without leaking the internal error message', async () => {
  dealLookupThrows = new Error('P2024: Timed out fetching a new connection from the pool at host db-internal.prod.local');
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 500);
  const json = await res.json();
  assert.equal(json.error, 'Internal server error');
  assert.ok(!JSON.stringify(json).includes('db-internal.prod.local'));
  assert.ok(!JSON.stringify(json).includes('P2024'));
  assert.equal(ordersCreateCalls.length, 0);
});

// ─── 9. Razorpay is never called on auth/authz/validation failure ──────────

test('9: Razorpay is never invoked for any rejected request (401/403/400/404 combined check)', async () => {
  const scenarios: Array<[() => void, string]> = [
    [() => { authResult = null; }, 'unauthenticated'],
    [() => { authResult = { userId: 'someone-else', phone: null, role: 'BUYER' }; }, 'not authorized'],
    [() => { dealRow = null; }, 'deal not found'],
  ];
  for (const [setup, label] of scenarios) {
    setup();
    await POST(postRequest({ dealId: 'deal-1' }));
    assert.equal(ordersCreateCalls.length, 0, `Razorpay must not be called when: ${label}`);
  }
  const res = await POST(postRequest({})); // malformed dealId
  assert.equal(res.status, 400);
  assert.equal(ordersCreateCalls.length, 0, 'Razorpay must not be called for a malformed dealId');
});

// ─── 10. Duplicate initialization, against the actual mechanism available ──

test('10a: a second initialization attempt while an order is already PENDING reuses the existing order, never creates a second one', async () => {
  transactionsTable.push({
    id: 'txn_existing',
    quoteId: 'quote-1',
    status: 'PENDING',
    metadata: { razorpayOrderId: 'order_already_in_flight' },
    currency: 'INR',
  });
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.orderId, 'order_already_in_flight');
  assert.equal(ordersCreateCalls.length, 0, 'a second Razorpay order must never be created while one is already in flight');
  assert.equal(transactionCreateCalls.length, 0);
  assert.equal(transactionsTable.length, 1, 'no second row should be inserted');
});

test('10b: a PENDING transaction with no recorded order id (corrupt or in-flight state) fails safe as a conflict (409), never creates a second order', async () => {
  transactionsTable.push({
    id: 'txn_existing',
    quoteId: 'quote-1',
    status: 'PENDING',
    metadata: {},
    currency: 'INR',
  });
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 409);
  assert.equal(ordersCreateCalls.length, 0);
  assert.equal(transactionsTable.length, 1);
});

test('10c: a buyer retrying payment on a deal already ESCROW_LOCKED via the wallet path is rejected (400), not double-charged', async () => {
  dealRow!.status = 'ESCROW_LOCKED';
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 400);
  assert.equal(ordersCreateCalls.length, 0);
});

// ─── 11. Razorpay call failure is mapped safely, and FAILED-marking is
// gated on whether the SDK's own error shape proves a response was
// actually received (Task 29) ────────────────────────────────────────────

function definiteRejection(statusCode: number, message: string): Error {
  // Mirrors node_modules/razorpay/dist/api.js's `normalizeError`, which
  // rethrows `{ statusCode: err.response.status, error: ... }` only when
  // axios actually received an HTTP response. Using a real Error (not a
  // plain object) so `.message` still participates in the redaction check.
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  (err as any).error = { code: 'BAD_REQUEST_ERROR', description: message };
  return err;
}

test('11a: a definite provider rejection (has a normalized statusCode -- Razorpay responded) returns 500 without leaking its internal message, and marks the reservation FAILED', async () => {
  ordersCreateThrows = definiteRejection(401, 'Razorpay secret key_id=rzp_live_SHOULD_NEVER_APPEAR invalid');
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 500);
  const json = await res.json();
  assert.ok(!JSON.stringify(json).includes('rzp_live_SHOULD_NEVER_APPEAR'));
  // The intent IS reserved before the call (that's the fix), but a definite
  // rejection must not leave it stuck PENDING -- it's marked FAILED so the
  // deal isn't blocked behind a dead reservation forever.
  assert.equal(transactionsTable.length, 1);
  assert.equal(transactionsTable[0].status, 'FAILED');
});

test('11b: after a definite rejection is marked FAILED, a retry on the same deal is NOT blocked by a stale conflict, and succeeds with a fresh order', async () => {
  ordersCreateThrows = definiteRejection(502, 'transient Razorpay 5xx (but still a received HTTP response)');
  const first = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(first.status, 500);
  assert.equal(transactionsTable.length, 1);
  assert.equal(transactionsTable[0].status, 'FAILED');

  ordersCreateThrows = null;
  ordersCreateResult = { id: 'order_mock_retry', amount: 500000, currency: 'INR' };
  const second = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(second.status, 200);
  const json = await second.json();
  assert.equal(json.orderId, 'order_mock_retry');
  assert.equal(ordersCreateCalls.length, 2, 'the retry legitimately calls Razorpay again, exactly once');
  assert.equal(transactionsTable.length, 2, 'a new reservation row is created for the retry; the FAILED one is left as a record, not reused');
  const finalized = transactionsTable.find((t) => t.metadata?.razorpayOrderId === 'order_mock_retry');
  assert.ok(finalized, 'the new reservation must be finalized with the retry order id');
});

test('11c: an AMBIGUOUS failure (no statusCode -- no HTTP response was ever received, e.g. a timeout/connection reset) does NOT mark the reservation FAILED, and a retry fails safe as a 409 instead of risking a second real order', async () => {
  // No `.statusCode` -- this is what the SDK's error looks like when axios
  // never received a response at all (network timeout, ECONNRESET), per
  // node_modules/razorpay/dist/api.js: `normalizeError` would itself throw
  // a TypeError trying to read `err.response.status` on undefined, so the
  // SDK consumer never even sees a normalized `{statusCode, error}` shape.
  ordersCreateThrows = new Error('ETIMEDOUT: connect ETIMEDOUT 52.x.x.x:443');
  const first = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(first.status, 500);
  assert.equal(transactionsTable.length, 1);
  assert.equal(
    transactionsTable[0].status,
    'PENDING',
    'an ambiguous failure must NOT be marked FAILED -- we genuinely do not know if Razorpay created an order',
  );

  // A retry must not blindly create a second order against this ambiguity.
  ordersCreateThrows = null;
  const second = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(second.status, 409, 'fail safe as a conflict rather than risk a duplicate payable order');
  assert.equal(
    ordersCreateCalls.length,
    1,
    'still only the one (ambiguous) call from the first attempt -- the retry must not reach Razorpay again',
  );
});

// ─── 12. The locking mechanism itself ───────────────────────────────────────

test('12: the deal lookup is performed with SELECT ... FOR UPDATE inside prisma.$transaction, not a plain findUnique', async () => {
  await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(transactionCalls, 1, 'exactly one prisma.$transaction wraps the authorize+idempotency+reserve sequence');
  assert.equal(queryRawCalls.length, 1);
  assert.match(queryRawCalls[0], /FOR UPDATE/i);
  assert.match(queryRawCalls[0], /FROM deals/i);
});

// ─── 13-14. Finalize-write resilience (Task 29) ────────────────────────────

test('13: a transient failure persisting the order id retries and succeeds -- the order is returned and metadata is eventually recorded correctly', async () => {
  transactionUpdateThrowsCount = 2; // fails twice, succeeds on the 3rd attempt
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.orderId, 'order_mock_1');
  assert.equal(transactionUpdateCalls.length, 3, 'two failed attempts plus one successful attempt');
  assert.equal(transactionsTable.length, 1, 'exactly one reservation row -- retries target the same row, not a new one');
  assert.equal(transactionsTable[0].metadata.razorpayOrderId, 'order_mock_1');
});

test("14: if persisting the order id fails on every attempt, the buyer still gets the real order (not a 500) -- the Transaction row is left PENDING with no recorded order id, a known/logged gap, not a hidden one", async () => {
  transactionUpdateThrowsCount = 999; // never succeeds
  const res = await POST(postRequest({ dealId: 'deal-1' }));
  assert.equal(res.status, 200, 'an order genuinely exists at Razorpay; failing the response here would strand the buyer behind a 409 on retry for no reason');
  const json = await res.json();
  assert.equal(json.orderId, 'order_mock_1');
  assert.equal(json.amount, 500000);
  assert.equal(transactionUpdateCalls.length, 3, 'exactly 3 attempts, then give up -- not an unbounded retry loop');
  assert.equal(
    transactionsTable[0].metadata.razorpayOrderId,
    undefined,
    'the local row genuinely never got the order id recorded -- this is the documented residual gap, not silently papered over',
  );
});
