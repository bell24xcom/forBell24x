// PR63 security regression suite — quote-link token verification.
// Complements lib/quote-token.test.ts (kept in place and still run in CI);
// this file focuses specifically on the identity-spoofing scenarios PR61's
// certification run found in POST /api/marketing/quote.
process.env.JWT_SECRET = 'test-only-secret-at-least-32-characters-long';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createQuoteToken,
  verifyQuoteToken,
  resolveQuoteIdentityFromToken,
} from '../../lib/quote-token.ts';

const RFQ_ID = 'rfq_pr63_test';
const SUPPLIER_ID = 'supplier_pr63_test';
const ATTACKER_ID = 'attacker_pr63_test';

test('valid token: resolves to the exact rfqId/supplierId it was signed for', () => {
  const token = createQuoteToken(RFQ_ID, SUPPLIER_ID);
  const identity = resolveQuoteIdentityFromToken(token);
  assert.deepEqual(identity, { rfqId: RFQ_ID, supplierId: SUPPLIER_ID });
});

test('invalid token: a garbage string is rejected, not defaulted to any identity', () => {
  assert.equal(resolveQuoteIdentityFromToken('not-a-real-token'), null);
  assert.equal(verifyQuoteToken('not-a-real-token'), null);
});

test('invalid token: tampering with the signature is rejected', () => {
  const token = createQuoteToken(RFQ_ID, SUPPLIER_ID);
  const [body] = token.split('.');
  assert.equal(verifyQuoteToken(`${body}.forged-signature`), null);
});

test('expired token: rejected even though it was validly signed', () => {
  const expiredToken = createQuoteToken(RFQ_ID, SUPPLIER_ID, -1);
  assert.equal(verifyQuoteToken(expiredToken), null);
  assert.equal(resolveQuoteIdentityFromToken(expiredToken), null);
});

test('identity spoofing regression: a client cannot smuggle its own supplierId past a stolen/forged token', () => {
  // This is the exact PR61-found vulnerability shape: an attacker who does
  // not possess supplier B's real token cannot cause the resolved identity
  // to be their own id, no matter what they attach the forged token to.
  const supplierBToken = createQuoteToken(RFQ_ID, SUPPLIER_ID);
  const identity = resolveQuoteIdentityFromToken(supplierBToken);
  assert.equal(identity!.supplierId, SUPPLIER_ID);
  assert.notEqual(identity!.supplierId, ATTACKER_ID);

  // And a token minted for a different rfq/supplier pair never resolves to
  // this rfq/supplier pair, however similar the ids look.
  const otherToken = createQuoteToken('other-rfq', ATTACKER_ID);
  const otherIdentity = resolveQuoteIdentityFromToken(otherToken);
  assert.notEqual(otherIdentity!.rfqId, RFQ_ID);
  assert.notEqual(otherIdentity!.supplierId, SUPPLIER_ID);
});

test('missing token: absent, null, empty-string, and non-string all resolve to null (never a default identity)', () => {
  assert.equal(resolveQuoteIdentityFromToken(undefined), null);
  assert.equal(resolveQuoteIdentityFromToken(null), null);
  assert.equal(resolveQuoteIdentityFromToken(''), null);
  assert.equal(resolveQuoteIdentityFromToken(42 as unknown), null);
});
