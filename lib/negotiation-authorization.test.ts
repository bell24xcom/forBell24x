// Route-entry authorization gate for POST /api/negotiation
// (src/app/api/negotiation/route.ts). See negotiation-authorization.ts's own
// header comment for why this exists as a second, independent layer rather
// than "the" fix — the actual self-accept guarantee for a Deal being created
// is enforced unconditionally inside lib/quote-acceptance.ts's acceptQuote(),
// verified directly (Phase 12B-5) to already reject
// `quote.supplierId === actor.id` before any Deal is created, regardless of
// this file.
//
// Tests the pure decision function directly rather than invoking the Next.js
// route handler, which imports `next/server` and the `@/lib/prisma`/`@/lib/jwt`
// path aliases — neither resolvable under plain `node --test` without a
// framework-aware loader. This mirrors this repo's existing convention
// (lib/payment-authorization.test.ts) of testing the pure `lib/` logic a
// route delegates to.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isNegotiationActionAuthorized } from './negotiation-authorization.ts';

const ROUTE_SOURCE = readFileSync(
  new URL('../src/app/api/negotiation/route.ts', import.meta.url),
  'utf8',
);

// --- The authorized buyer can attempt quote acceptance ---
test('buyer: accept is authorized', () => {
  assert.equal(isNegotiationActionAuthorized('accept', { isBuyer: true, isSupplier: false }), true);
});

// --- The supplier who submitted the quote cannot pass this route-level gate for accept ---
test('supplier: accept is NOT authorized at this route-level gate', () => {
  assert.equal(isNegotiationActionAuthorized('accept', { isBuyer: false, isSupplier: true }), false);
});

// --- Neither party to this specific quote ---
test('neither party (unrelated buyer or unrelated supplier): accept is NOT authorized', () => {
  assert.equal(isNegotiationActionAuthorized('accept', { isBuyer: false, isSupplier: false }), false);
});

// --- Cross-tenant / mismatched ownership ---
// No tenant/organization model exists in this codebase (prisma/schema.prisma
// has no Organization/Buyer model) — "cross-tenant" access reduces exactly to
// "neither party", already covered above.
test('cross-tenant (no tenant model exists; reduces to "neither party"): accept is NOT authorized', () => {
  assert.equal(isNegotiationActionAuthorized('accept', { isBuyer: false, isSupplier: false }), false);
});

// --- Existing reject/counter authorization remains unchanged ---
test('buyer: reject is authorized (unchanged)', () => {
  assert.equal(isNegotiationActionAuthorized('reject', { isBuyer: true, isSupplier: false }), true);
});
test('supplier: reject is authorized (unchanged — not part of this gate)', () => {
  assert.equal(isNegotiationActionAuthorized('reject', { isBuyer: false, isSupplier: true }), true);
});
test('neither party: reject is NOT authorized (unchanged)', () => {
  assert.equal(isNegotiationActionAuthorized('reject', { isBuyer: false, isSupplier: false }), false);
});
test('buyer: counter is authorized (unchanged)', () => {
  assert.equal(isNegotiationActionAuthorized('counter', { isBuyer: true, isSupplier: false }), true);
});
test('supplier: counter is authorized (unchanged — a supplier countering their own quote is a normal negotiation step)', () => {
  assert.equal(isNegotiationActionAuthorized('counter', { isBuyer: false, isSupplier: true }), true);
});
test('neither party: counter is NOT authorized (unchanged)', () => {
  assert.equal(isNegotiationActionAuthorized('counter', { isBuyer: false, isSupplier: false }), false);
});

// --- Unknown actions are denied regardless of actor (fail-closed hardening —
// this function does not rely on its caller's own action allow-list to stay
// safe; it is self-contained) ---
test('unknown action: denied for a buyer', () => {
  assert.equal(isNegotiationActionAuthorized('withdraw' as any, { isBuyer: true, isSupplier: false }), false);
});
test('unknown action: denied for a supplier', () => {
  assert.equal(isNegotiationActionAuthorized('withdraw' as any, { isBuyer: false, isSupplier: true }), false);
});
test('unknown action: denied for an unrelated party', () => {
  assert.equal(isNegotiationActionAuthorized('withdraw' as any, { isBuyer: false, isSupplier: false }), false);
});
test('unknown action: denied even for a user who is both buyer and supplier', () => {
  assert.equal(isNegotiationActionAuthorized('withdraw' as any, { isBuyer: true, isSupplier: true }), false);
});
test('empty-string action: denied for a buyer (not just a specific unknown literal)', () => {
  assert.equal(isNegotiationActionAuthorized('' as any, { isBuyer: true, isSupplier: false }), false);
});

// --- Exhaustiveness: every action x actor-combination explicitly classified ---
test('exhaustiveness: all 3 actions x 4 actor-combinations match the documented rule exactly', () => {
  const actions = ['accept', 'reject', 'counter'] as const;
  const combos = [
    { isBuyer: true, isSupplier: false },
    { isBuyer: false, isSupplier: true },
    { isBuyer: true, isSupplier: true }, // same user is somehow both — still authorized, never a special denial
    { isBuyer: false, isSupplier: false },
  ];
  for (const action of actions) {
    for (const combo of combos) {
      const expected = !combo.isBuyer && !combo.isSupplier
        ? false
        : action === 'accept'
          ? combo.isBuyer
          : true;
      assert.equal(
        isNegotiationActionAuthorized(action, combo),
        expected,
        `action=${action} combo=${JSON.stringify(combo)}`,
      );
    }
  }
});

// --- Source-level: the route never derives isBuyer/isSupplier from request-
// body input, so no forged body field can bypass this gate. A real, executed
// assertion against the current route source — not a claim without evidence. ---
test('route source: isBuyer/isSupplier are derived only from quote/rfq/user data, never from request body', () => {
  const authLines = ROUTE_SOURCE
    .split('\n')
    .filter(l => l.includes('const isBuyer') || l.includes('const isSupplier'));
  assert.equal(authLines.length, 2, 'expected exactly one isBuyer and one isSupplier declaration');
  for (const line of authLines) {
    assert.ok(!line.includes('body'), `expected no reference to the request body in: ${line}`);
    assert.ok(/quote\.(rfq\.createdBy|supplierId)/.test(line), `expected a quote/rfq-derived comparison in: ${line}`);
  }
});

// --- Confirms the route actually wires this function in, not just that the
// function itself is correct in isolation ---
test('route source: the accept/reject/counter authorization gate calls isNegotiationActionAuthorized', () => {
  assert.ok(
    ROUTE_SOURCE.includes('isNegotiationActionAuthorized(action, { isBuyer, isSupplier })'),
    'expected the route to delegate its gate decision to the shared, tested function',
  );
});

// --- Closes the "spoofed identity" question (task Part D #6) as an executed
// assertion rather than a claim backed only by manual reading: the route
// must pass acceptQuote() the authenticated user's OWN id/role, never a
// value read from the request body (which this route parses into
// `counterPrice`/`counterTerms`/`message`, but never a buyer/supplier/role
// override). ---
test('route source: acceptQuote() is called with the authenticated user\'s own id/role, never a body-derived value', () => {
  assert.ok(
    ROUTE_SOURCE.includes('actor: { id: user.userId, role: user.role }'),
    'expected acceptQuote() to receive only user.userId/user.role (authenticate()\'s own return value), not any field parsed from the request body',
  );
  // Negative check: no body-destructured field is ever passed as part of the
  // `actor` object. The request body is destructured as
  // `{ quoteId, action, counterPrice, counterTerms, message }`; none of
  // those identifiers should ever appear inside an `actor: { ... }` literal.
  const actorLiteralMatch = ROUTE_SOURCE.match(/actor:\s*\{[^}]*\}/g) ?? [];
  for (const literal of actorLiteralMatch) {
    for (const bodyField of ['counterPrice', 'counterTerms', 'message', 'quoteId']) {
      assert.ok(!literal.includes(bodyField), `expected no body field "${bodyField}" inside an actor literal: ${literal}`);
    }
  }
});

// --- Confirms acceptQuote() is still the thing that actually creates the
// Deal, i.e. this route-level gate is additive, not a replacement for the
// real enforcement point (Phase 12B-5's own core finding, pinned as a test
// so a future refactor that removes acceptQuote() without noticing is caught) ---
test('route source: action=accept still delegates Deal creation to acceptQuote(), not an inline update', () => {
  assert.ok(
    ROUTE_SOURCE.includes('await acceptQuote('),
    'expected the accept branch to call the shared acceptQuote() helper, which independently enforces self-accept rejection',
  );
});
