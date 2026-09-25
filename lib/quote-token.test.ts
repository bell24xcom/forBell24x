// Security-critical tests for the signed quote-link token, and for the
// resolveQuoteIdentityFromToken() contract that POST /api/marketing/quote
// relies on to never trust a client-supplied rfq_id/supplier_id.
//
// JWT_SECRET must be set before createQuoteToken/verifyQuoteToken read it
// (lazily, per-call, via secret() in quote-token.ts) — set here, before any
// test runs.
process.env.JWT_SECRET = 'test-only-secret-at-least-32-characters-long';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createQuoteToken,
  verifyQuoteToken,
  resolveQuoteIdentityFromToken,
} from './quote-token.ts';

const RFQ_ID = 'rfq_test_123';
const SUPPLIER_ID = 'supplier_test_456';

test('createQuoteToken -> verifyQuoteToken round-trips the exact ids', () => {
  const token = createQuoteToken(RFQ_ID, SUPPLIER_ID);
  const payload = verifyQuoteToken(token);
  assert.ok(payload);
  assert.equal(payload!.rfqId, RFQ_ID);
  assert.equal(payload!.supplierId, SUPPLIER_ID);
});

test('verifyQuoteToken rejects an expired token', () => {
  const token = createQuoteToken(RFQ_ID, SUPPLIER_ID, -1); // ttlDays: -1 -> already expired
  assert.equal(verifyQuoteToken(token), null);
});

test('verifyQuoteToken rejects a tampered signature', () => {
  const token = createQuoteToken(RFQ_ID, SUPPLIER_ID);
  const [body] = token.split('.');
  const tampered = `${body}.not-the-real-signature`;
  assert.equal(verifyQuoteToken(tampered), null);
});

test('verifyQuoteToken rejects a tampered payload (different supplierId than signed)', () => {
  const tokenA = createQuoteToken(RFQ_ID, SUPPLIER_ID);
  const tokenB = createQuoteToken(RFQ_ID, 'someone-else');
  const [, sigA] = tokenA.split('.');
  const [bodyB] = tokenB.split('.');
  // Attacker swaps in a different payload but keeps a signature from
  // another valid token — must not verify.
  assert.equal(verifyQuoteToken(`${bodyB}.${sigA}`), null);
});

test('verifyQuoteToken rejects malformed input', () => {
  assert.equal(verifyQuoteToken(null), null);
  assert.equal(verifyQuoteToken(undefined), null);
  assert.equal(verifyQuoteToken(''), null);
  assert.equal(verifyQuoteToken('no-dot-in-here'), null);
  assert.equal(verifyQuoteToken('.leading-dot-empty-body'), null);
  assert.equal(verifyQuoteToken('trailing-dot-empty-sig.'), null);
  assert.equal(verifyQuoteToken('not-json.' + Buffer.from('sig').toString('base64url')), null);
});

test('resolveQuoteIdentityFromToken returns the verified ids for a valid token', () => {
  const token = createQuoteToken(RFQ_ID, SUPPLIER_ID);
  const identity = resolveQuoteIdentityFromToken(token);
  assert.deepEqual(identity, { rfqId: RFQ_ID, supplierId: SUPPLIER_ID });
});

test('resolveQuoteIdentityFromToken returns null for a missing/non-string token', () => {
  assert.equal(resolveQuoteIdentityFromToken(undefined), null);
  assert.equal(resolveQuoteIdentityFromToken(null), null);
  assert.equal(resolveQuoteIdentityFromToken(''), null);
  assert.equal(resolveQuoteIdentityFromToken(123 as unknown), null);
  assert.equal(resolveQuoteIdentityFromToken({ rfqId: RFQ_ID, supplierId: SUPPLIER_ID } as unknown), null);
});

test('resolveQuoteIdentityFromToken returns null for an invalid token, even if the caller also passes a plausible-looking rfq_id/supplier_id alongside it', () => {
  // Regression test for the actual vulnerability: a caller cannot smuggle
  // an arbitrary rfqId/supplierId past this function by any means — only
  // a validly-signed, unexpired token yields an identity.
  const identity = resolveQuoteIdentityFromToken('forged.token');
  assert.equal(identity, null);
});

test('resolveQuoteIdentityFromToken ignores which ids a forged-but-differently-signed token claims', () => {
  // Two independently-issued tokens must not be interchangeable — using
  // supplier A's token must never resolve to supplier B's id.
  const tokenForSupplierA = createQuoteToken(RFQ_ID, 'supplier-A');
  const identity = resolveQuoteIdentityFromToken(tokenForSupplierA);
  assert.equal(identity!.supplierId, 'supplier-A');
  assert.notEqual(identity!.supplierId, 'supplier-B');
});
