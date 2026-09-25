// Quote acceptance regression suite — lib/quote-acceptance.ts.
//
// Runs the real acceptQuote() against an in-memory fake database. The fake
// implements only the Prisma calls acceptQuote() makes, rolls a transaction
// back when it throws, and serialises transactions (as Postgres row locks do
// for the RFQ compare-and-set). It proves the acceptance LOGIC; it is not a
// substitute for a run against a real database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acceptQuote } from '../../lib/quote-acceptance.ts';

function makeWorld(opts: { rfqStatus?: string; failDealCreate?: boolean } = {}) {
  const state: any = {
    rfqs: new Map([['rfq1', { id: 'rfq1', title: 'Steel bars', status: opts.rfqStatus ?? 'QUOTED', createdBy: 'buyer1', acceptedAt: null }]]),
    quotes: new Map<string, any>([
      ['q1', { id: 'q1', rfqId: 'rfq1', supplierId: 'sup1', price: 1000, quantity: '10', timeline: null, description: null, terms: null, status: 'PENDING', isAccepted: false, createdAt: new Date(0) }],
      ['q2', { id: 'q2', rfqId: 'rfq1', supplierId: 'sup2', price: 900, quantity: '10', timeline: null, description: null, terms: null, status: 'PENDING', isAccepted: false, createdAt: new Date(0) }],
      ['q3', { id: 'q3', rfqId: 'rfq1', supplierId: 'sup3', price: 800, quantity: '10', timeline: null, description: null, terms: null, status: 'REJECTED', isAccepted: false, createdAt: new Date(0) }],
    ]),
    deals: [] as any[],
    users: new Map<string, any>([
      ['buyer1', { id: 'buyer1', name: 'Buyer One', email: 'b@x.com' }],
      ['sup1', { id: 'sup1', name: 'Supplier One', email: 's1@x.com' }],
      ['sup2', { id: 'sup2', name: 'Supplier Two', email: 's2@x.com' }],
      ['sup3', { id: 'sup3', name: 'Supplier Three', email: 's3@x.com' }],
    ]),
    wallets: new Map<string, any>([['buyer1', { id: 'w1', userId: 'buyer1', balance: 5000 }]]),
    walletTx: [] as any[],
  };
  const calls = { notified: [] as any[], lifeEvents: [] as any[] };

  const matches = (row: any, where: any) =>
    Object.entries(where).every(([k, v]: [string, any]) => {
      if (v && typeof v === 'object' && 'not' in v) return row[k] !== v.not;
      if (v && typeof v === 'object' && 'in' in v) return v.in.includes(row[k]);
      return row[k] === v;
    });

  const tx: any = {
    rFQ: {
      updateMany: async ({ where, data }: any) => {
        const rows = [...state.rfqs.values()].filter((r) => matches(r, where));
        rows.forEach((r) => Object.assign(r, data));
        return { count: rows.length };
      },
    },
    quote: {
      updateMany: async ({ where, data }: any) => {
        const rows = [...state.quotes.values()].filter((r) => matches(r, where));
        rows.forEach((r) => Object.assign(r, data));
        return { count: rows.length };
      },
    },
    deal: {
      findFirst: async ({ where }: any) => state.deals.find((d: any) => matches(d, where)) ?? null,
      create: async ({ data }: any) => {
        if (opts.failDealCreate) throw new Error('boom: deal insert failed');
        if (state.deals.some((d: any) => d.quoteId === data.quoteId)) {
          throw Object.assign(new Error('unique'), { code: 'P2002' });
        }
        const deal = { id: `deal${state.deals.length + 1}`, ...data };
        state.deals.push(deal);
        return { ...deal };
      },
      update: async ({ where, data }: any) => {
        const d = state.deals.find((x: any) => x.id === where.id);
        Object.assign(d, data);
        return { ...d };
      },
    },
    wallet: {
      findUnique: async ({ where }: any) => state.wallets.get(where.userId) ?? null,
      update: async ({ where, data }: any) => {
        state.wallets.get(where.userId).balance -= data.balance.decrement;
      },
    },
    walletTransaction: { create: async ({ data }: any) => void state.walletTx.push(data) },
  };

  let chain: Promise<unknown> = Promise.resolve();
  const db = {
    quote: {
      findUnique: async ({ where }: any) => {
        await Promise.resolve();
        const q = state.quotes.get(where.id);
        if (!q) return null;
        const rfq = state.rfqs.get(q.rfqId);
        return { ...q, rfq: { ...rfq }, supplier: { ...state.users.get(q.supplierId) } };
      },
    },
    user: { findUnique: async ({ where }: any) => ({ ...state.users.get(where.id) }) },
    $transaction: <T>(fn: (t: any) => Promise<T>) => {
      const run = chain.then(async () => {
        const snapshot = structuredClone({ rfqs: state.rfqs, quotes: state.quotes, deals: state.deals, wallets: state.wallets, walletTx: state.walletTx });
        try {
          return await fn(tx);
        } catch (e) {
          Object.assign(state, snapshot);
          throw e;
        }
      });
      chain = run.catch(() => undefined);
      return run;
    },
  };

  const deps = {
    db: db as any,
    onAccepted: async (quote: any, rfq: any, supplier: any, buyer: any) => void calls.notified.push({ quote, rfq, supplier, buyer }),
    recordLifeEvent: (input: any) => void calls.lifeEvents.push(input),
  };
  return { state, calls, deps };
}

const BUYER = { id: 'buyer1', role: 'BUYER' };

test('A. accepting a PENDING quote creates a Deal, locks the RFQ as ACCEPTED and accepts the quote', async () => {
  const w = makeWorld();
  const r = await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps);
  assert.equal(r.ok, true);
  assert.equal(w.state.deals.length, 1);
  assert.equal(w.state.deals[0].quoteId, 'q1');
  assert.equal(w.state.deals[0].buyerId, 'buyer1');
  assert.equal(w.state.deals[0].supplierId, 'sup1');
  assert.equal(w.state.deals[0].price, 1000);
  assert.equal(w.state.quotes.get('q1').status, 'ACCEPTED');
  assert.equal(w.state.quotes.get('q1').isAccepted, true);
  assert.equal(w.state.rfqs.get('rfq1').status, 'ACCEPTED');
  assert.ok(w.state.rfqs.get('rfq1').acceptedAt instanceof Date);
});

test('B. accepting the same quote twice is blocked and creates no second Deal', async () => {
  const w = makeWorld();
  assert.equal((await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps)).ok, true);
  const again = await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps);
  assert.equal(again.ok, false);
  assert.equal(!again.ok && again.status, 409);
  assert.equal(w.state.deals.length, 1);
});

test('C. accepting a second quote for the same RFQ is blocked (RFQ already has a Deal)', async () => {
  const w = makeWorld();
  assert.equal((await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps)).ok, true);
  const second = await acceptQuote({ quoteId: 'q2', actor: BUYER, source: 'negotiation' }, w.deps);
  assert.equal(second.ok, false);
  assert.equal(!second.ok && second.status, 409);
  assert.equal(w.state.deals.length, 1);
  assert.equal(w.state.quotes.get('q2').status, 'REJECTED'); // rejected as a competitor, never accepted
});

test('C2. a legacy state (RFQ still open but a Deal exists) is also blocked by the existing-deal guard', async () => {
  const w = makeWorld();
  w.state.deals.push({ id: 'legacy', rfqId: 'rfq1', quoteId: 'qX', buyerId: 'buyer1', supplierId: 'supX', price: 1, status: 'ACTIVE' });
  const r = await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps);
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.code, 'deal_exists');
  assert.equal(w.state.quotes.get('q1').status, 'PENDING'); // rolled back
  assert.equal(w.state.rfqs.get('rfq1').status, 'QUOTED'); // rolled back
});

test('C3. two concurrent accepts of different quotes: exactly one wins, one Deal exists', async () => {
  const w = makeWorld();
  const [a, b] = await Promise.all([
    acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps),
    acceptQuote({ quoteId: 'q2', actor: BUYER, source: 'negotiation' }, w.deps),
  ]);
  assert.equal([a, b].filter((r) => r.ok).length, 1);
  assert.equal(w.state.deals.length, 1);
});

test('D. a supplier cannot accept their own quote (403) and nothing is written', async () => {
  const w = makeWorld();
  const r = await acceptQuote({ quoteId: 'q1', actor: { id: 'sup1', role: 'SUPPLIER' }, source: 'negotiation' }, w.deps);
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.status, 403);
  assert.equal(!r.ok && r.code, 'self_accept_forbidden');
  assert.equal(w.state.deals.length, 0);
  assert.equal(w.state.quotes.get('q1').status, 'PENDING');
  assert.equal(w.state.rfqs.get('rfq1').status, 'QUOTED');
  assert.equal(w.calls.notified.length, 0);
});

test('D2. an ADMIN who is also the quote\'s supplier still cannot self-accept', async () => {
  const w = makeWorld();
  const r = await acceptQuote({ quoteId: 'q1', actor: { id: 'sup1', role: 'ADMIN' }, source: 'admin-select-quote' }, w.deps);
  assert.equal(!r.ok && r.status, 403);
});

test('D3. a different supplier or non-owner buyer is forbidden (403); an ADMIN may accept', async () => {
  const w = makeWorld();
  const other = await acceptQuote({ quoteId: 'q1', actor: { id: 'sup2', role: 'SUPPLIER' }, source: 'negotiation' }, w.deps);
  assert.equal(!other.ok && other.status, 403);
  const stranger = await acceptQuote({ quoteId: 'q1', actor: { id: 'buyer2', role: 'BUYER' }, source: 'deal-select' }, w.deps);
  assert.equal(!stranger.ok && stranger.status, 403);
  assert.equal(w.state.deals.length, 0);
  const admin = await acceptQuote({ quoteId: 'q1', actor: { id: 'admin1', role: 'ADMIN' }, source: 'admin-select-quote' }, w.deps);
  assert.equal(admin.ok, true);
  assert.equal(w.state.deals[0].buyerId, 'buyer1'); // deal belongs to the RFQ owner, not the admin
});

test('E. competing PENDING quotes become REJECTED; already-REJECTED stays REJECTED; count is reported', async () => {
  const w = makeWorld();
  const r = await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps);
  assert.equal(r.ok && r.rejectedQuotes, 1);
  assert.equal(w.state.quotes.get('q2').status, 'REJECTED');
  assert.equal(w.state.quotes.get('q3').status, 'REJECTED');
});

test('E2. quotes that are not PENDING (REJECTED / ACCEPTED / EXPIRED) cannot be accepted', async () => {
  for (const status of ['REJECTED', 'ACCEPTED', 'EXPIRED']) {
    const w = makeWorld();
    w.state.quotes.get('q1').status = status;
    const r = await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps);
    assert.equal(!r.ok && r.code, 'quote_not_pending', status);
    assert.equal(w.state.deals.length, 0);
  }
});

test('E3. RFQs that are not open (ACCEPTED, CLOSED, CANCELLED, EXPIRED, COMPLETED, CLOSED_EXTERNAL) reject acceptance', async () => {
  for (const status of ['ACCEPTED', 'CLOSED', 'CANCELLED', 'EXPIRED', 'COMPLETED', 'CLOSED_EXTERNAL', 'DRAFT']) {
    const w = makeWorld({ rfqStatus: status });
    const r = await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps);
    assert.equal(!r.ok && r.code, 'rfq_not_open', status);
    assert.equal(w.state.deals.length, 0);
  }
});

test('F. notifications and life events are triggered for buyer and supplier, with the RFQ owner as buyer', async () => {
  const w = makeWorld();
  await acceptQuote({ quoteId: 'q1', actor: { id: 'admin1', role: 'ADMIN' }, source: 'admin-select-quote' }, w.deps);
  assert.equal(w.calls.notified.length, 1);
  const n = w.calls.notified[0];
  assert.equal(n.supplier.id, 'sup1');
  assert.equal(n.buyer.id, 'buyer1');
  assert.equal(n.buyer.name, 'Buyer One');
  assert.equal(n.rfq.id, 'rfq1');
  assert.equal(n.quote.price, 1000);
  assert.equal(w.calls.lifeEvents.length, 2);
  assert.deepEqual(w.calls.lifeEvents.map((e: any) => e.companyId).sort(), ['buyer1', 'sup1']);
  assert.ok(w.calls.lifeEvents.every((e: any) => e.metadata.source === 'admin-select-quote' && e.metadata.dealId));
});

test('F2. a notification failure never fails or undoes the acceptance', async () => {
  const w = makeWorld();
  w.deps.onAccepted = async () => { throw new Error('smtp down'); };
  const r = await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps);
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.notified, false);
  assert.equal(w.state.deals.length, 1);
});

test('G. a failure while creating the Deal rolls the whole acceptance back (no ACCEPTED quote without a Deal)', async () => {
  const w = makeWorld({ failDealCreate: true });
  await assert.rejects(() => acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, w.deps), /deal insert failed/);
  assert.equal(w.state.quotes.get('q1').status, 'PENDING');
  assert.equal(w.state.quotes.get('q2').status, 'PENDING');
  assert.equal(w.state.rfqs.get('rfq1').status, 'QUOTED');
  assert.equal(w.state.deals.length, 0);
  assert.equal(w.calls.notified.length, 0);
});

test('H. lockEscrow deducts the wallet in the same transaction and marks the Deal ESCROW_LOCKED; without it the wallet is untouched', async () => {
  const locked = makeWorld();
  const r = await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'rfq-quotes', lockEscrow: true }, locked.deps);
  assert.equal(r.ok && r.escrowLocked, true);
  assert.equal(locked.state.wallets.get('buyer1').balance, 4000);
  assert.equal(locked.state.deals[0].status, 'ESCROW_LOCKED');
  assert.equal(locked.state.walletTx.length, 1);

  const plain = makeWorld();
  await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'deal-select' }, plain.deps);
  assert.equal(plain.state.wallets.get('buyer1').balance, 5000);
  assert.equal(plain.state.deals[0].status, 'ACTIVE');
});

test('I. edge cases: unknown quote 404, wrong expectedRfqId 404, RFQ without buyer 400', async () => {
  const w = makeWorld();
  const missing = await acceptQuote({ quoteId: 'nope', actor: BUYER, source: 'deal-select' }, w.deps);
  assert.equal(!missing.ok && missing.status, 404);
  const wrongRfq = await acceptQuote({ quoteId: 'q1', actor: BUYER, source: 'admin-select-quote', expectedRfqId: 'other' }, w.deps);
  assert.equal(!wrongRfq.ok && wrongRfq.status, 404);
  w.state.rfqs.get('rfq1').createdBy = null;
  const noBuyer = await acceptQuote({ quoteId: 'q1', actor: { id: 'admin1', role: 'ADMIN' }, source: 'admin-select-quote' }, w.deps);
  assert.equal(!noBuyer.ok && noBuyer.status, 400);
  assert.equal(w.state.deals.length, 0);
});
