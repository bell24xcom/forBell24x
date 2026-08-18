import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateTokens, verifyToken, decodeToken, MissingJwtSecretError } from './jwt.ts';

// H6-16A — true fail-closed JWT behavior for src/lib/jwt.ts.
// Never a real production JWT_SECRET here — test-only literals only.

const ORIGINAL_SECRET = process.env.JWT_SECRET;
afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = ORIGINAL_SECRET;
});

const TEST_SECRET = 'test-only-secret-never-a-real-production-value';
const testUser = { id: 'user_1', email: 'test@example.com', role: 'BUYER' };

test('1. JWT_SECRET configured: signing succeeds', () => {
  process.env.JWT_SECRET = TEST_SECRET;
  const tokens = generateTokens(testUser);
  assert.equal(typeof tokens.accessToken, 'string');
  assert.ok(tokens.accessToken.length > 0);
  assert.ok(tokens.refreshToken.length > 0);
});

test('2. JWT_SECRET missing: signing fails', () => {
  delete process.env.JWT_SECRET;
  assert.throws(() => generateTokens(testUser), MissingJwtSecretError);
});

test('3. JWT_SECRET empty string: signing fails', () => {
  process.env.JWT_SECRET = '';
  assert.throws(() => generateTokens(testUser), MissingJwtSecretError);
});

test('4. JWT_SECRET missing: verification fails', () => {
  delete process.env.JWT_SECRET;
  assert.throws(() => verifyToken('irrelevant.token.value'), MissingJwtSecretError);
});

test('5. JWT_SECRET configured: existing verification behavior preserved', () => {
  process.env.JWT_SECRET = TEST_SECRET;
  const { accessToken } = generateTokens(testUser);
  const payload = verifyToken(accessToken);
  assert.equal(payload.userId, testUser.id);
  assert.equal(payload.email, testUser.email);
  assert.equal(payload.role, testUser.role);
});

test('decodeToken (non-throwing helper) returns null rather than propagating when secret is missing', () => {
  delete process.env.JWT_SECRET;
  assert.equal(decodeToken('irrelevant.token.value'), null);
});

test('no fallback secret: a token signed under one secret does not verify under a different one', () => {
  process.env.JWT_SECRET = 'secret-A';
  const { accessToken } = generateTokens(testUser);
  process.env.JWT_SECRET = 'secret-B';
  assert.throws(() => verifyToken(accessToken));
});

// 6. No fallback secret appears anywhere in active source (regression guard).
test('6. no hardcoded JWT fallback literal remains in the three H6-15/H6-16 source files', () => {
  const repoRoot = join(import.meta.dirname, '..', '..');
  const banned = ["'your-secret-key'", "'fallback-secret-key'", "'__MISSING_JWT_SECRET__'"];
  const files = [
    join(repoRoot, 'src', 'lib', 'jwt.ts'),
    join(repoRoot, 'lib', 'auth', 'agent-auth.ts'),
    join(repoRoot, 'src', 'app', 'api', 'claim', 'complete', 'route.ts'),
    join(repoRoot, 'lib', 'jwt.ts'),
  ];
  for (const file of files) {
    const contents = readFileSync(file, 'utf8');
    for (const literal of banned) {
      assert.ok(!contents.includes(literal), `${literal} must not appear in ${file}`);
    }
  }
});
