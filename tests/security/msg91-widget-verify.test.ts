// C1 P0 regression suite -- lib/msg91-widget.ts.
//
// Runs the real verifyMsg91AccessToken() with an injected fetch mock, so
// no real network call to MSG91 is ever made. This is pure-function
// testing (see rfq-status-validation.test.ts's own comment for why: the
// route file itself imports next/server and @/lib/prisma, neither
// resolvable under plain `node --test`), so the phone-mismatch behavior
// the route applies is exercised via the exported phonesMismatch()
// helper directly, not by invoking the route handler.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyMsg91AccessToken, phonesMismatch, normalizePhone } from '../../lib/msg91-widget.ts';

function fakeToken(): string {
  // Any three dot-separated, sufficiently long parts -- the shape the old
  // code accepted as "valid" on its own. verifyMsg91AccessToken() must not
  // trust this shape by itself; only a mocked MSG91 response decides.
  return 'aaaaaaaaaaaaaaaaaaaa.bbbbbbbbbbbbbbbbbbbb.cccccccccccccccccccc';
}

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

test('A. valid token: MSG91 confirms success and returns a resolvable phone', async () => {
  const fetchImpl = (async () => jsonResponse(200, { type: 'success', mobile: '+91 98765 43210' })) as unknown as typeof fetch;
  const result = await verifyMsg91AccessToken(fakeToken(), { fetchImpl, authKey: 'k' });
  assert.equal(result.ok, true);
  assert.equal(result.code, 'verified');
  assert.equal(result.phone, '9876543210');
});

test('A2. valid token: phone resolved from the response under alternate field names', async () => {
  for (const body of [
    { success: true, phone: '9876543210' },
    { status: 'success', data: { mobile: '9876543210' } },
    { type: 'success', identifier: '919876543210' },
  ]) {
    const fetchImpl = (async () => jsonResponse(200, body)) as unknown as typeof fetch;
    const result = await verifyMsg91AccessToken(fakeToken(), { fetchImpl, authKey: 'k' });
    assert.equal(result.ok, true, JSON.stringify(body));
    assert.equal(result.phone, '9876543210', JSON.stringify(body));
  }
});

test('A3. valid token: phone falls back to the token payload only after MSG91 confirms success', async () => {
  const payload = Buffer.from(JSON.stringify({ mobile: '9876543210' })).toString('base64');
  const token = `header.${payload}.sig`;
  const fetchImpl = (async () => jsonResponse(200, { type: 'success' })) as unknown as typeof fetch;
  const result = await verifyMsg91AccessToken(token, { fetchImpl, authKey: 'k' });
  assert.equal(result.ok, true);
  assert.equal(result.phone, '9876543210');
});

test('B. phone mismatch: body phone differs from the MSG91-verified phone', () => {
  assert.equal(phonesMismatch('9876543210', '9111111111'), true);
  assert.equal(phonesMismatch('9876543210', '9876543210'), false);
  assert.equal(phonesMismatch(null, '9876543210'), false); // absent, not a mismatch
});

test('C. forged token: MSG91 responds without a success shape (rejected)', async () => {
  const fetchImpl = (async () => jsonResponse(200, { type: 'error', message: 'Invalid access token' })) as unknown as typeof fetch;
  const result = await verifyMsg91AccessToken(fakeToken(), { fetchImpl, authKey: 'k' });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'invalid_token');
  assert.equal(result.phone, null);
});

test('D. MSG91 error: non-OK HTTP status', async () => {
  const fetchImpl = (async () => jsonResponse(500, { error: 'internal' })) as unknown as typeof fetch;
  const result = await verifyMsg91AccessToken(fakeToken(), { fetchImpl, authKey: 'k' });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'service_unavailable');
});

test('E. timeout: fetch aborts', async () => {
  const fetchImpl = (async (_url: any, init: any) => {
    return new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => {
        const err = new Error('aborted');
        err.name = 'AbortError';
        reject(err);
      });
    });
  }) as unknown as typeof fetch;
  const result = await verifyMsg91AccessToken(fakeToken(), { fetchImpl, authKey: 'k' });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'service_unavailable');
});

test('F. network error: fetch rejects', async () => {
  const fetchImpl = (async () => { throw new Error('ECONNRESET'); }) as unknown as typeof fetch;
  const result = await verifyMsg91AccessToken(fakeToken(), { fetchImpl, authKey: 'k' });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'service_unavailable');
});

test('G. malformed response: not valid JSON', async () => {
  const fetchImpl = (async () => ({
    ok: true,
    status: 200,
    json: async () => { throw new SyntaxError('Unexpected token'); },
  })) as unknown as typeof fetch;
  const result = await verifyMsg91AccessToken(fakeToken(), { fetchImpl, authKey: 'k' });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'invalid_token'); // null body has no success shape
});

test('H. missing phone: MSG91 confirms success but no phone-shaped field anywhere', async () => {
  const fetchImpl = (async () => jsonResponse(200, { type: 'success', foo: 'bar' })) as unknown as typeof fetch;
  const result = await verifyMsg91AccessToken(fakeToken(), { fetchImpl, authKey: 'k' });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'phone_unresolved');
  assert.equal(result.phone, null);
});

test('I. no auth key configured: fails closed without calling fetch', async () => {
  let called = false;
  const fetchImpl = (async () => { called = true; return jsonResponse(200, { type: 'success', mobile: '9876543210' }); }) as unknown as typeof fetch;
  const result = await verifyMsg91AccessToken(fakeToken(), { fetchImpl, authKey: undefined });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'service_unavailable');
  assert.equal(called, false);
});

test('J. normalizePhone: strips country code and formatting, rejects non-10-digit input', () => {
  assert.equal(normalizePhone('+91 98765 43210'), '9876543210');
  assert.equal(normalizePhone('919876543210'), '9876543210');
  assert.equal(normalizePhone('12345'), null);
  assert.equal(normalizePhone(undefined), null);
});
