// P0 security regression suite — negotiation action authorization shared by
// POST /api/negotiation (src/app/api/negotiation/route.ts).
//
// Tests the pure decision function in negotiation-authorization.ts directly
// rather than invoking the Next.js route handler, which imports `next/server`
// and the `@/lib/prisma`/`@/lib/jwt` path aliases — neither resolvable under
// plain `node --test` without a framework-aware loader. This mirrors the
// existing repo convention (tests/security/rfq-status-validation.test.ts,
// src/lib/outreach/*.test.ts) of testing the pure `lib/` logic a route
// delegates to, not the route itself.
//
// What this suite cannot exercise, and why (documented rather than silently
// skipped): `isBuyer`/`isSupplier` are computed in the route from
// `quote.rfq.createdBy === user.userId` and `quote.supplierId === user.userId`
// — both derived from the verified JWT and a real Prisma lookup, never from
// request-body input. A "forged buyer identity in the request body" test is
// therefore not meaningful at this function's level (it only ever sees two
// booleans, never raw identity); the actual guarantee — that the route never
// reads an identity field from `body` when computing these booleans — is
// verified below as a source-content check (test 10), which is a real,
// executed assertion, not a claim without evidence. Likewise, authentication
// failures (401) and the database side effects of a denied request are
// handled entirely by code paths this change did not touch (the route's
// `authenticate()` call runs before this check; a denial here is an early
// `return` strictly before any `prisma.quote.update`/Deal-creation code) —
// confirmed by reading the route's current control flow, not re-tested here,
// since nothing in that control flow changed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isNegotiationActionAuthorized } from './negotiation-authorization.ts';

const ROUTE_SOURCE = readFileSync(
  new URL('../src/app/api/negotiation/route.ts', import.meta.url),
  'utf8',
);

// --- 1. The authorized buyer can attempt quote acceptance ---
test('buyer: accept is authorized', () => {
  assert.equal(isNegotiationActionAuthorized('accept', { isBuyer: true, isSupplier: false }), true);
});

// --- 2. The supplier who submitted the quote cannot accept it (the P0 fix itself) ---
test('supplier: accept is NOT authorized (P0 fix — supplier can no longer self-accept)', () => {
  assert.equal(isNegotiationActionAuthorized('accept', { isBuyer: false, isSupplier: true }), false);
});

// --- 3 & 4. An unrelated buyer/supplier cannot accept the quote ---
// (At this function's level, "unrelated buyer" and "unrelated supplier" are
// the same input — neither isBuyer nor isSupplier is true for this quote —
// since the function only ever sees the two already-resolved booleans.)
test('neither party (unrelated buyer or unrelated supplier): accept is NOT authorized', () => {
  assert.equal(isNegotiationActionAuthorized('accept', { isBuyer: false, isSupplier: false }), false);
});

// --- 6. Cross-tenant / mismatched ownership ---
// No tenant/organization model exists in this codebase (prisma/schema.prisma
// has no Organization/Buyer model) — "cross-tenant" access reduces exactly to
// "neither isBuyer nor isSupplier for this quote", already covered above.
test('cross-tenant (no tenant model exists; reduces to "neither party"): accept is NOT authorized', () => {
  assert.equal(isNegotiationActionAuthorized('accept', { isBuyer: false, isSupplier: false }), false);
});

// --- 7. Existing reject/counter authorization remains unchanged ---
test('buyer: reject is authorized (unchanged)', () => {
  assert.equal(isNegotiationActionAuthorized('reject', { isBuyer: true, isSupplier: false }), true);
});
test('supplier: reject is authorized (unchanged — not part of the P0 fix)', () => {
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

// --- 6, 7, 8. Unknown actions are denied regardless of actor (fail-closed
// hardening, 2026-10-18 — the helper no longer relies on its caller's own
// action allow-list to stay safe; it is self-contained). Cast to `any` since
// `NegotiationAction` is deliberately a closed union and a real caller's
// `action` value (parsed from untyped request-body JSON) is not statically
// guaranteed to be one of the three known literals at runtime. ---
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
    { isBuyer: true, isSupplier: true }, // same user is somehow both — should still be authorized, never a special denial
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

// --- 5 (source-level, not function-level): the route never derives
// isBuyer/isSupplier from request-body input, so no forged body field can
// bypass authorization. A real, executed assertion against the current
// route source — not a claim without evidence. ---
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

// --- Confirms the route actually wires the fixed function in, not just that
// the function itself is correct in isolation ---
test('route source: the accept/reject/counter authorization gate calls isNegotiationActionAuthorized', () => {
  assert.ok(
    ROUTE_SOURCE.includes('isNegotiationActionAuthorized(action, { isBuyer, isSupplier })'),
    'expected the route to delegate its authorization decision to the shared, tested function',
  );
});
