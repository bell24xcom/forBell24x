/**
 * Regression tests for Task 39A-10: /api/marketing/event was reachable
 * with zero authentication, accepted arbitrary rfq_id/supplier_id/event_type
 * writes to InsForge, and returned `success: true` without ever checking
 * InsForge's actual HTTP response -- a non-2xx response or a network
 * failure both still reported success. Must now require an admin session
 * and must never claim success unless InsForge actually accepted the write.
 * Uses real signed JWTs through the actual requireAdmin()/verifyToken()
 * code path. global.fetch is mocked so this can never make a real InsForge
 * call. Requires --experimental-test-module-mocks.
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const TEST_JWT_SECRET = 'test-only-jwt-secret-not-used-anywhere-real';
const fetchCalls: string[] = [];

// This route has no direct Prisma usage, but requireAdmin() (lib/admin-auth.ts)
// statically imports lib/jwt.ts, which statically imports lib/prisma.ts to
// support authenticate() -- so PrismaClient would otherwise be instantiated
// at module load time even though this route never queries it.
mock.module('@/lib/prisma', { namedExports: { prisma: {} } });

type FetchBehavior = 'ok' | 'rejected' | 'network-error';
let fetchBehavior: FetchBehavior = 'ok';

let POST: (req: NextRequest) => Promise<Response>;

before(async () => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.INSFORGE_URL = 'https://insforge.test';
  process.env.INSFORGE_API_KEY = 'test-insforge-key';
  delete process.env.ADMIN_TOKEN;

  global.fetch = (async (url: string) => {
    fetchCalls.push(String(url));
    if (fetchBehavior === 'network-error') {
      throw new TypeError('fetch failed');
    }
    if (fetchBehavior === 'rejected') {
      return new Response(JSON.stringify({ error: 'insforge rejected' }), { status: 500 });
    }
    return new Response(JSON.stringify([{ id: 'seq-1' }]), { status: 200 });
  }) as typeof fetch;

  ({ POST } = await import('./route.ts'));
});

beforeEach(() => {
  fetchCalls.length = 0;
  fetchBehavior = 'ok';
  delete process.env.ADMIN_TOKEN;
});

function adminJwt(role = 'ADMIN'): string {
  return jwt.sign({ userId: 'admin-1', phone: '', role, type: 'access' }, TEST_JWT_SECRET);
}

function postRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/marketing/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const VALID_BODY = { rfq_id: 'rfq-1', supplier_id: 'supplier-1', event_type: 'viewed' };

test('unauthenticated request is rejected (401), InsForge is never called', async () => {
  const res = await POST(postRequest(VALID_BODY));
  assert.equal(res.status, 401);
  assert.equal(fetchCalls.length, 0);
});

test('authenticated non-admin request is rejected (403), InsForge is never called', async () => {
  const res = await POST(postRequest(VALID_BODY, { authorization: `Bearer ${adminJwt('BUYER')}` }));
  assert.equal(res.status, 403);
  assert.equal(fetchCalls.length, 0);
});

test('missing event_type is rejected (400), InsForge is never called', async () => {
  const res = await POST(
    postRequest({ rfq_id: 'rfq-1', supplier_id: 'supplier-1' }, { authorization: `Bearer ${adminJwt()}` }),
  );
  assert.equal(res.status, 400);
  assert.equal(fetchCalls.length, 0);
});

test('non-string supplier_id is rejected (400), InsForge is never called', async () => {
  const res = await POST(
    postRequest({ rfq_id: 'rfq-1', supplier_id: 12345, event_type: 'viewed' }, { authorization: `Bearer ${adminJwt()}` }),
  );
  assert.equal(res.status, 400);
  assert.equal(fetchCalls.length, 0);
});

test('a valid ADMIN JWT with valid data succeeds (200) and the event is forwarded', async () => {
  const res = await POST(postRequest(VALID_BODY, { authorization: `Bearer ${adminJwt()}` }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(fetchCalls.length, 1);
});

test('InsForge returning a non-2xx response never produces success:true', async () => {
  fetchBehavior = 'rejected';
  const res = await POST(postRequest(VALID_BODY, { authorization: `Bearer ${adminJwt()}` }));
  assert.notEqual(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, false);
});

test('InsForge network failure never produces success:true, and no internal error details leak', async () => {
  fetchBehavior = 'network-error';
  const res = await POST(postRequest(VALID_BODY, { authorization: `Bearer ${adminJwt()}` }));
  assert.notEqual(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.doesNotMatch(JSON.stringify(json), /test-insforge-key/);
});

test('missing INSFORGE_URL/INSFORGE_API_KEY fails safely without ever calling fetch', async () => {
  const savedUrl = process.env.INSFORGE_URL;
  delete process.env.INSFORGE_URL;
  try {
    const res = await POST(postRequest(VALID_BODY, { authorization: `Bearer ${adminJwt()}` }));
    assert.equal(res.status, 503);
    assert.equal(fetchCalls.length, 0);
    const json = await res.json();
    assert.equal(json.success, false);
  } finally {
    process.env.INSFORGE_URL = savedUrl;
  }
});
