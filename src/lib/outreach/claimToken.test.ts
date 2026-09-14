import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Set the secret before importing the module under test, since it reads
// process.env.CLAIM_INVITATION_SECRET lazily on each call (not at import
// time), so setting it here first is sufficient either way.
const ORIGINAL_SECRET = process.env.CLAIM_INVITATION_SECRET;
process.env.CLAIM_INVITATION_SECRET = 'test-secret-do-not-use-in-prod-aaaaaaaaaaaaaaaaaaaa';

const { signClaimToken, verifyClaimToken, isClaimTokenConfigured, looksLikeClaimJwt } = await import('./claimToken.ts');

after(() => {
  process.env.CLAIM_INVITATION_SECRET = ORIGINAL_SECRET;
});

const payload = { companyId: 'comp_1', campaignId: 'camp_1', invitationId: 'inv_1' };

test('isClaimTokenConfigured reflects env var presence', () => {
  assert.equal(isClaimTokenConfigured(), true);
});

test('sign then verify round-trips the payload', () => {
  const token = signClaimToken(payload, '1h');
  const result = verifyClaimToken(token);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.payload, payload);
  }
});

test('tampered token is rejected as INVALID_SIGNATURE', () => {
  const token = signClaimToken(payload, '1h');
  const parts = token.split('.');
  // Flip one character in the middle of the payload segment — keeps the
  // base64url string structurally valid (so it still decodes to JSON,
  // reaching the signature check) while changing the decoded bytes, so
  // this exercises "well-formed but tampered" rather than "malformed".
  const mid = Math.floor(parts[1].length / 2);
  const flipped = parts[1][mid] === 'a' ? 'b' : 'a';
  const tamperedPayload = parts[1].slice(0, mid) + flipped + parts[1].slice(mid + 1);
  const tampered = [parts[0], tamperedPayload, parts[2]].join('.');
  const result = verifyClaimToken(tampered);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'INVALID_SIGNATURE');
});

test('expired token is rejected as EXPIRED', () => {
  const token = signClaimToken(payload, '-1s'); // already expired
  const result = verifyClaimToken(token);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'EXPIRED');
});

test('malformed token is rejected as MALFORMED', () => {
  const result = verifyClaimToken('not-a-jwt-at-all');
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'MALFORMED');
});

test('signature from a different secret is rejected', () => {
  const token = signClaimToken(payload, '1h');
  const savedSecret = process.env.CLAIM_INVITATION_SECRET;
  process.env.CLAIM_INVITATION_SECRET = 'a-completely-different-secret-bbbbbbbbbbbbbbbbbbbb';
  const result = verifyClaimToken(token);
  process.env.CLAIM_INVITATION_SECRET = savedSecret;
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'INVALID_SIGNATURE');
});

test('verifyClaimToken returns NOT_CONFIGURED when secret is unset (never throws)', () => {
  const token = signClaimToken(payload, '1h');
  const savedSecret = process.env.CLAIM_INVITATION_SECRET;
  delete process.env.CLAIM_INVITATION_SECRET;
  const result = verifyClaimToken(token);
  process.env.CLAIM_INVITATION_SECRET = savedSecret;
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'NOT_CONFIGURED');
});

test('looksLikeClaimJwt distinguishes JWT format from legacy bare-UUID tokens', () => {
  const token = signClaimToken(payload, '1h');
  assert.equal(looksLikeClaimJwt(token), true);
  assert.equal(looksLikeClaimJwt('550e8400-e29b-41d4-a716-446655440000'), false);
});
