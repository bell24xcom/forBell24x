/**
 * Regression tests for Task 39A-8: /api/marketing/outreach/send had no
 * authentication and wrote a hardcoded `status: 'sent'` InsForge record
 * despite never calling any messaging provider. It must now require an
 * admin session, never claim a send happened, and never make any network
 * call. Mocks `@/lib/admin-auth` and `@/lib/logger`, and asserts
 * `global.fetch` is never invoked. Requires --experimental-test-module-mocks.
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest, NextResponse } from 'next/server';

let adminOk = true;

mock.module('@/lib/admin-auth', {
  namedExports: {
    requireAdmin: () =>
      adminOk
        ? { userId: 'admin', phone: '', role: 'ADMIN' }
        : NextResponse.json({ success: false, message: 'Admin authentication required' }, { status: 401 }),
    isErrorResponse: (v: unknown) => v instanceof NextResponse,
  },
});

mock.module('@/lib/logger', {
  namedExports: { logger: { info: () => {}, error: () => {} } },
});

let POST: (req: NextRequest) => Promise<Response>;

before(async () => {
  ({ POST } = await import('./route.ts'));
});

beforeEach(() => {
  adminOk = true;
  mock.method(global, 'fetch', async () => {
    throw new Error('this route must never make a network call');
  });
});

function postReq(body: unknown) {
  return new NextRequest('http://localhost/api/marketing/outreach/send', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

test('rejects an unauthenticated caller', async () => {
  adminOk = false;
  const res = await postReq({ rfq_id: 'r1', supplier: { id: 's1', phone: '919999999999' }, step: 0 });
  const result = await POST(res);
  assert.equal(result.status, 401);
});

test('rejects a request missing supplier.id without claiming not_configured', async () => {
  const res = await POST(postReq({ rfq_id: 'r1', step: 0 }));
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.status, undefined);
});

test('never claims success and never writes a sent record when no provider is configured', async () => {
  const res = await POST(postReq({ rfq_id: 'r1', supplier: { id: 's1', name: 'Alice', category: 'Steel', phone: '919999999999' }, step: 0 }));
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.success, false, 'must not claim success when nothing was sent');
  assert.equal(body.status, 'not_configured');
  assert.equal(body.channel, 'whatsapp');
});

test('falls back to email channel when the supplier has no phone', async () => {
  const res = await POST(postReq({ rfq_id: 'r1', supplier: { id: 's2', name: 'Bob', category: 'Textiles' }, step: 1 }));
  const body = await res.json();
  assert.equal(body.channel, 'email');
  assert.equal(body.status, 'not_configured');
});
