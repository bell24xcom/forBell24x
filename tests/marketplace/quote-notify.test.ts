// MA-01 Phase 4 — buyer quote alert. Runs the real notifyQuoteSubmitted() against an in-memory world, and audits
// (by reading source) that EVERY route that creates a quote alerts the buyer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { notifyQuoteSubmitted, timelineLabel } from '../../lib/quote-notify.ts';

function world(over: { rfq?: any; quote?: any; users?: Record<string, any>; notifyBehaviour?: 'ok' | 'throws' | 'silent' } = {}) {
  const state = {
    quotes: new Map<string, any>([
      ['q1', { id: 'q1', price: 50000, timeline: null, deliveryDays: 7, source: 'SELF_SUBMITTED', rfqId: 'r1', supplierId: 'sup1', ...over.quote }],
    ]),
    rfqs: new Map<string, any>([['r1', { id: 'r1', title: 'Steel bars', createdBy: 'buyer1', isSeeded: false, ...over.rfq }]]),
    users: new Map<string, any>(
      Object.entries({
        buyer1: { id: 'buyer1', name: 'Buyer', company: null, email: 'b@example.com' },
        sup1: { id: 'sup1', name: 'Sup', company: 'Acme Steel', email: 's@example.com' },
        ...over.users,
      }),
    ),
    notifications: [] as any[],
    notifyCalls: [] as any[],
  };
  const deps = {
    loadQuote: async (id: string) => state.quotes.get(id) ?? null,
    loadRfq: async (id: string) => state.rfqs.get(id) ?? null,
    loadUser: async (id: string) => state.users.get(id) ?? null,
    buyerAlreadyNotified: async (quoteId: string, buyerId: string) =>
      state.notifications.some((n) => n.userId === buyerId && n.type === 'QUOTE_RECEIVED' && n.data.quoteId === quoteId),
    notify: async (quote: any, rfq: any, supplier: any, buyer: any, opts: { staffSourced: boolean }) => {
      state.notifyCalls.push({ quote, rfq, supplier, buyer, opts });
      if (over.notifyBehaviour === 'throws') throw new Error('boom');
      if (over.notifyBehaviour === 'silent') return; // mimics createNotification swallowing a DB error
      state.notifications.push({ userId: buyer.id, type: 'QUOTE_RECEIVED', data: { quoteId: quote.id, staffSourced: opts.staffSourced } });
      if (!opts.staffSourced) state.notifications.push({ userId: supplier.id, type: 'SUCCESS', data: { quoteId: quote.id } });
    },
  };
  return { state, deps };
}
const buyerAlerts = (s: any) => s.notifications.filter((n: any) => n.type === 'QUOTE_RECEIVED');

test('a submitted quote produces exactly one QUOTE_RECEIVED for the RFQ owner and a supplier confirmation', async () => {
  const { state, deps } = world();
  const r = await notifyQuoteSubmitted('q1', deps);
  assert.deepEqual(r, { status: 'notified', quoteId: 'q1', buyerId: 'buyer1', staffSourced: false });
  assert.equal(buyerAlerts(state).length, 1);
  assert.equal(state.notifications.filter((n) => n.userId === 'sup1').length, 1);
  assert.equal(state.notifyCalls[0].quote.timeline, '7 days', 'timeline falls back to delivery days');
  assert.equal(state.notifyCalls[0].rfq.createdBy, 'buyer1');
});

test('idempotent: a retry or a double call never creates a second buyer notification', async () => {
  const { state, deps } = world();
  await notifyQuoteSubmitted('q1', deps);
  const again = await notifyQuoteSubmitted('q1', deps);
  assert.deepEqual(again, { status: 'skipped', quoteId: 'q1', reason: 'already_notified' });
  const parallel = await Promise.all([notifyQuoteSubmitted('q1', deps), notifyQuoteSubmitted('q1', deps)]);
  assert.ok(parallel.every((p) => p.status === 'skipped'));
  assert.equal(buyerAlerts(state).length, 1);
  assert.equal(state.notifyCalls.length, 1);
});

test('a staff-sourced (concierge) quote is labelled staff-sourced and the supplier is NOT told they submitted one', async () => {
  const { state, deps } = world({ quote: { source: 'CONCIERGE_SOURCED' } });
  const r = await notifyQuoteSubmitted('q1', deps);
  assert.equal(r.status === 'notified' && r.staffSourced, true);
  assert.equal(state.notifyCalls[0].opts.staffSourced, true);
  assert.equal(state.notifications.filter((n) => n.userId === 'sup1').length, 0);
});

test('skips, with a stated reason, everything that must not notify', async () => {
  const cases: [string, any, string][] = [
    ['unknown quote', { quote: undefined }, 'quote_not_found'],
    ['seeded/demo RFQ', { rfq: { isSeeded: true } }, 'rfq_seeded'],
    ['RFQ without an owner', { rfq: { createdBy: null } }, 'no_buyer'],
    ['owner is the supplier', { rfq: { createdBy: 'sup1' } }, 'buyer_is_supplier'],
    ['quote without an RFQ', { quote: { rfqId: null } }, 'no_rfq'],
    ['quote without a supplier', { quote: { supplierId: null } }, 'no_supplier'],
    ['RFQ row missing', { quote: { rfqId: 'ghost' } }, 'no_rfq'],
    ['buyer row missing', { rfq: { createdBy: 'ghost' } }, 'no_buyer'],
  ];
  for (const [label, over, reason] of cases) {
    const { state, deps } = world(over);
    const id = label === 'unknown quote' ? 'nope' : 'q1';
    const r = await notifyQuoteSubmitted(id, deps);
    assert.deepEqual(r, { status: 'skipped', quoteId: id, reason }, label);
    assert.equal(state.notifyCalls.length, 0, label);
  }
});

test('never throws, and reports failure truthfully', async () => {
  const boom = await notifyQuoteSubmitted('q1', world({ notifyBehaviour: 'throws' }).deps);
  assert.deepEqual(boom, { status: 'failed', quoteId: 'q1', error: 'boom' });
  // the orchestration layer swallows its own DB errors: no exception, but no row either -> NOT "notified"
  const silent = await notifyQuoteSubmitted('q1', world({ notifyBehaviour: 'silent' }).deps);
  assert.deepEqual(silent, { status: 'failed', quoteId: 'q1', error: 'buyer notification was not recorded' });
  const { deps } = world();
  const loadFails = await notifyQuoteSubmitted('q1', { ...deps, loadQuote: async () => { throw new Error('db down'); } });
  assert.deepEqual(loadFails, { status: 'failed', quoteId: 'q1', error: 'db down' });
});

test('timelineLabel prefers the stated timeline, then delivery days, then says it is unspecified', () => {
  assert.equal(timelineLabel({ timeline: ' 2 weeks ', deliveryDays: 3 }), '2 weeks');
  assert.equal(timelineLabel({ timeline: null, deliveryDays: 3 }), '3 days');
  assert.equal(timelineLabel({ timeline: '', deliveryDays: null }), 'Timeline not specified');
});

// ---------------------------------------------------------------------------------------------------------------
// Route coverage audit — reads the source. A new route that creates a quote fails this test until it is wired.
// ---------------------------------------------------------------------------------------------------------------
const ROOT = join(import.meta.dirname, '..', '..');
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '_archive', '.next', '.netlify'].includes(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}
const files = ['src', 'lib'].flatMap((d) => walk(join(ROOT, d)));
const rel = (p: string) => relative(ROOT, p).split(sep).join('/');
const CREATE = /\b(?:prisma|tx)\.quote\.(?:create|createMany|createManyAndReturn|upsert)\s*\(/;

test('route coverage audit: every file that creates a quote calls notifyQuoteCreated AFTER the create', () => {
  const creators = files.filter((f) => CREATE.test(readFileSync(f, 'utf8'))).map(rel).sort();
  assert.deepEqual(creators, [
    'src/app/api/admin/rfqs/route.ts',
    'src/app/api/marketing/quote/route.ts',
    'src/app/api/quote/route.ts',
    'src/app/api/rfq/quotes/route.ts',
    'src/app/api/supplier/quotes/route.ts',
  ], 'the set of quote-creating files changed: wire the new one to notifyQuoteCreated and add it here');
  for (const f of creators) {
    const src = readFileSync(join(ROOT, f), 'utf8');
    const created = src.search(CREATE);
    const notified = src.indexOf('notifyQuoteCreated(');
    assert.ok(notified > created, `${f}: notifyQuoteCreated must be called after the quote is created`);
    assert.match(src, /from '@\/lib\/quote-notify-runtime'/, `${f}: missing import`);
  }
});

test('route coverage audit: onQuoteSubmitted has exactly one production caller (the runtime binding) and every route uses the helper', () => {
  const callers = files
    .filter((f) => /\bonQuoteSubmitted\s*\(/.test(readFileSync(f, 'utf8')))
    .map(rel)
    .filter((f) => f !== 'lib/orchestration.ts')
    .sort();
  assert.deepEqual(callers, ['lib/quote-notify-runtime.ts']);
});

test('route coverage audit: the supplier route no longer sends its own duplicate buyer email', () => {
  const src = readFileSync(join(ROOT, 'src/app/api/supplier/quotes/route.ts'), 'utf8');
  assert.ok(!/quoteReceivedEmail|resendService/.test(src), 'the helper alone alerts the buyer (in-app + email); a second email would be a duplicate');
});

test('the email button points at the RFQ page, not a hardcoded /negotiation URL', () => {
  const src = readFileSync(join(ROOT, 'lib/orchestration.ts'), 'utf8');
  const start = src.indexOf('export async function onQuoteSubmitted');
  const end = src.indexOf('export async function onQuoteAccepted');
  const body = src.slice(start, end);
  assert.ok(!body.includes('https://bell24h.com/negotiation'));
  assert.ok(body.includes('${SITE_URL}/rfq/${rfq.id}'));
});
