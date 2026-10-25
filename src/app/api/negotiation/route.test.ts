/**
 * Regression test for POST /api/negotiation (P1 Handshake Repair, 2026-10-25).
 *
 * Before this fix, `accept` did a bare `prisma.quote.update` with no Deal,
 * no competing-quote rejection and no notification, gated only by the
 * generic buyer/supplier check; `reject`/`counter` never notified anyone.
 * This confirms: `accept` delegates entirely to the real `acceptQuote()`
 * (tests/security/quote-acceptance.test.ts covers its internal business
 * logic — this file only checks the route wires it correctly and returns
 * acceptQuote()'s result verbatim), `reject` notifies the supplier exactly
 * once and is idempotent on retry, and `counter` notifies the buyer and
 * still responds successfully even if that notification fails.
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';

let authResult: { userId: string; phone: string | null; role: string } | null = null;
let acceptQuoteCalls: unknown[] = [];
let acceptQuoteResult: any = null;
let quoteRow: any = null;
let updateManyCalls: any[] = [];
let updateManyResult = { count: 1 };
let onQuoteRejectedCalls: unknown[][] = [];
let onCounterOfferCalls: unknown[][] = [];
let onCounterOfferShouldThrow = false;
let aiOutcome: any = { status: 'OK', text: 'Split the difference.' };

mock.module('@/lib/jwt', {
  namedExports: { authenticate: async () => authResult },
});

mock.module('@/lib/quote-acceptance', {
  namedExports: {
    acceptQuote: async (input: unknown) => {
      acceptQuoteCalls.push(input);
      return acceptQuoteResult;
    },
  },
});

mock.module('@/lib/orchestration', {
  namedExports: {
    onQuoteRejected: async (...args: unknown[]) => {
      onQuoteRejectedCalls.push(args);
    },
    onCounterOffer: async (...args: unknown[]) => {
      onCounterOfferCalls.push(args);
      if (onCounterOfferShouldThrow) throw new Error('email provider down');
    },
  },
});

mock.module('@/src/lib/bell24h-os/client', {
  namedExports: {
    generateAiText: async () => aiOutcome,
  },
});

mock.module('@/lib/prisma', {
  namedExports: {
    prisma: {
      quote: {
        findUnique: async () => quoteRow,
        updateMany: async (args: any) => {
          updateManyCalls.push(args);
          return updateManyResult;
        },
        update: async ({ data }: any) => ({ ...quoteRow, ...data }),
      },
      user: {
        findUnique: async () => ({ name: 'Buyer One', email: 'buyer@x.com' }),
      },
    },
  },
});

let POST: (req: NextRequest) => Promise<Response>;

before(async () => {
  const routeUrl = pathToFileURL('C:/Users/Sanika/Projects/bell24h/src/app/api/negotiation/route.ts').href;
  ({ POST } = await import(routeUrl));
});

beforeEach(() => {
  authResult = { userId: 'buyer-1', phone: null, role: 'BUYER' };
  acceptQuoteCalls = [];
  acceptQuoteResult = null;
  updateManyCalls = [];
  updateManyResult = { count: 1 };
  onQuoteRejectedCalls = [];
  onCounterOfferCalls = [];
  onCounterOfferShouldThrow = false;
  aiOutcome = { status: 'OK', text: 'Split the difference.' };
  quoteRow = {
    id: 'q1',
    rfqId: 'rfq1',
    supplierId: 'sup1',
    price: 1000,
    quantity: '10',
    timeline: '2 weeks',
    description: null,
    terms: null,
    status: 'PENDING',
    notes: null,
    createdAt: new Date(0),
    rfq: { id: 'rfq1', title: 'Steel bars', maxBudget: 1200, createdBy: 'buyer-1' },
    supplier: { name: 'Supplier One', company: 'Supco', email: 'sup@x.com' },
  };
});

function req(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/negotiation', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('accept: unauthenticated request is rejected (401) before acceptQuote is ever called', async () => {
  authResult = null;
  const res = await POST(req({ quoteId: 'q1', action: 'accept' }));
  assert.equal(res.status, 401);
  assert.equal(acceptQuoteCalls.length, 0);
});

test('accept: delegates to acceptQuote() with the authenticated actor and source "negotiation"', async () => {
  acceptQuoteResult = {
    ok: true,
    deal: { id: 'deal1', price: 1000, status: 'ACTIVE' },
    quote: { id: 'q1', status: 'ACCEPTED' },
    rejectedQuotes: 1,
    escrowLocked: false,
    notified: true,
  };
  const res = await POST(req({ quoteId: 'q1', action: 'accept' }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.deal.id, 'deal1');
  assert.deepEqual(acceptQuoteCalls, [{ quoteId: 'q1', actor: { id: 'buyer-1', role: 'BUYER' }, source: 'negotiation' }]);
});

test('accept: a rejection from acceptQuote() (e.g. self-accept-forbidden) is passed through verbatim, not swallowed into a generic error', async () => {
  acceptQuoteResult = { ok: false, status: 403, code: 'self_accept_forbidden', error: 'Forbidden: a supplier cannot accept their own quote' };
  const res = await POST(req({ quoteId: 'q1', action: 'accept' }));
  assert.equal(res.status, 403);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.equal(json.code, 'self_accept_forbidden');
});

test('accept: never fetches the quote directly or runs the buyer/supplier gate — acceptQuote owns authorization entirely', async () => {
  acceptQuoteResult = { ok: true, deal: { id: 'd', price: 1, status: 'ACTIVE' }, quote: {}, rejectedQuotes: 0, escrowLocked: false, notified: true };
  // An actor who is neither buyer nor supplier (would fail the old shared
  // isNegotiationActionAuthorized gate) must still reach acceptQuote() —
  // only acceptQuote()'s own authorization decides the outcome.
  authResult = { userId: 'admin-1', phone: null, role: 'ADMIN' };
  const res = await POST(req({ quoteId: 'q1', action: 'accept' }));
  assert.equal(res.status, 200);
  assert.equal(acceptQuoteCalls.length, 1);
});

test('reject: a supplier may reject their own quote, which notifies them exactly once', async () => {
  authResult = { userId: 'sup1', phone: null, role: 'SUPPLIER' };
  const res = await POST(req({ quoteId: 'q1', action: 'reject' }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(onQuoteRejectedCalls.length, 1);
  const [, , supplier] = onQuoteRejectedCalls[0] as any[];
  assert.equal(supplier.id, 'sup1');
  assert.equal(supplier.email, 'sup@x.com');
});

test('reject: retrying against an already-rejected quote (count 0) returns success but fires no second notification', async () => {
  updateManyResult = { count: 0 };
  const res = await POST(req({ quoteId: 'q1', action: 'reject' }));
  assert.equal(res.status, 200);
  assert.equal(onQuoteRejectedCalls.length, 0);
});

test('reject: an unrelated user (neither buyer nor supplier) is forbidden and nothing is mutated', async () => {
  authResult = { userId: 'stranger', phone: null, role: 'BUYER' };
  const res = await POST(req({ quoteId: 'q1', action: 'reject' }));
  assert.equal(res.status, 403);
  assert.equal(updateManyCalls.length, 0);
  assert.equal(onQuoteRejectedCalls.length, 0);
});

test('counter: notifies the buyer with the counter price, and succeeds', async () => {
  const res = await POST(req({ quoteId: 'q1', action: 'counter', counterPrice: 950 }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(onCounterOfferCalls.length, 1);
  const [quoteArg, , buyerArg] = onCounterOfferCalls[0] as any[];
  assert.equal(quoteArg.price, 950);
  assert.equal(buyerArg.id, 'buyer-1');
});

test('counter: a failed buyer notification never fails the counter-offer response', async () => {
  onCounterOfferShouldThrow = true;
  const res = await POST(req({ quoteId: 'q1', action: 'counter', counterPrice: 950 }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(onCounterOfferCalls.length, 1);
});

test('counter: an AI-service failure still halts before any notification fires', async () => {
  aiOutcome = { status: 'ERROR', text: '' };
  const res = await POST(req({ quoteId: 'q1', action: 'counter', counterPrice: 950 }));
  assert.equal(res.status, 500);
  assert.equal(onCounterOfferCalls.length, 0);
});
