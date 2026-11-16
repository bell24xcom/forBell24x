/**
 * Regression tests for Task 39A-10: /api/outreach/follow-up was reachable
 * with zero authentication -- GET leaked every due supplier's PII and POST
 * let any caller fabricate a "follow-up sent" record for any supplier/RFQ
 * pair. Both methods must now require an admin session. Uses real signed
 * JWTs through the actual requireAdmin()/verifyToken() code path (not a
 * mocked admin-auth layer) -- only @/lib/prisma and @/lib/follow-up-engine
 * are mocked. Requires --experimental-test-module-mocks.
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const TEST_JWT_SECRET = 'test-only-jwt-secret-not-used-anywhere-real';

let findUniqueUserResult: { id: string } | null = { id: 'supplier-1' };
let findUniqueRfqResult: { id: string } | null = { id: 'rfq-1' };
const prismaCalls: string[] = [];

let followUpsDueResult: Array<Record<string, unknown>> = [];
const logFollowUpSentCalls: Array<{ supplierId: string; rfqId: string; type: string }> = [];

mock.module('@/lib/prisma', {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => {
          prismaCalls.push('user.findUnique');
          return findUniqueUserResult;
        },
      },
      rFQ: {
        findUnique: async () => {
          prismaCalls.push('rFQ.findUnique');
          return findUniqueRfqResult;
        },
      },
    },
  },
});

mock.module('@/lib/follow-up-engine', {
  namedExports: {
    getFollowUpsDue: async () => followUpsDueResult,
    logFollowUpSent: async (supplierId: string, rfqId: string, type: string) => {
      logFollowUpSentCalls.push({ supplierId, rfqId, type });
    },
  },
});

let GET: (req: NextRequest) => Promise<Response>;
let POST: (req: NextRequest) => Promise<Response>;

before(async () => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  delete process.env.ADMIN_TOKEN;
  delete process.env.EXPORT_API_KEY;
  ({ GET, POST } = await import('./route.ts'));
});

beforeEach(() => {
  findUniqueUserResult = { id: 'supplier-1' };
  findUniqueRfqResult = { id: 'rfq-1' };
  prismaCalls.length = 0;
  followUpsDueResult = [
    { rfqId: 'rfq-1', title: 'Need 500 widgets', userId: 'buyer-1', category: 'Electronics', followUpType: 'day2', quoteCount: 0 },
  ];
  logFollowUpSentCalls.length = 0;
  delete process.env.ADMIN_TOKEN;
  delete process.env.EXPORT_API_KEY;
});

function adminJwt(role = 'ADMIN'): string {
  return jwt.sign({ userId: 'admin-1', phone: '', role, type: 'access' }, TEST_JWT_SECRET);
}

function getRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/outreach/follow-up', { headers });
}

function postRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/outreach/follow-up', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// ─── GET ─────────────────────────────────────────────────────────────────

test('GET: no Authorization header is rejected (401), no PII returned', async () => {
  const res = await GET(getRequest());
  assert.equal(res.status, 401);
});

test('GET: invalid JWT is rejected (401)', async () => {
  const res = await GET(getRequest({ authorization: 'Bearer garbage' }));
  assert.equal(res.status, 401);
});

test('GET: valid JWT, non-ADMIN role is rejected (403)', async () => {
  const res = await GET(getRequest({ authorization: `Bearer ${adminJwt('SUPPLIER')}` }));
  assert.equal(res.status, 403);
});

test('GET: valid ADMIN JWT succeeds (200) and returns the due follow-ups', async () => {
  const res = await GET(getRequest({ authorization: `Bearer ${adminJwt()}` }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.total, 1);
});

// ─── POST ────────────────────────────────────────────────────────────────

test('POST: unauthenticated request is rejected (401), zero writes, zero DB lookups', async () => {
  const res = await POST(postRequest({ supplierId: 'supplier-1', rfqId: 'rfq-1', type: 'day2' }));
  assert.equal(res.status, 401);
  assert.equal(logFollowUpSentCalls.length, 0);
  assert.equal(prismaCalls.length, 0, 'auth must be checked before any DB lookup');
});

test('POST: authenticated non-admin request is rejected (403), zero writes', async () => {
  const res = await POST(
    postRequest({ supplierId: 'supplier-1', rfqId: 'rfq-1', type: 'day2' }, { authorization: `Bearer ${adminJwt('BUYER')}` }),
  );
  assert.equal(res.status, 403);
  assert.equal(logFollowUpSentCalls.length, 0);
});

test('POST: missing rfqId is rejected (400), zero writes', async () => {
  const res = await POST(postRequest({ supplierId: 'supplier-1', type: 'day2' }, { authorization: `Bearer ${adminJwt()}` }));
  assert.equal(res.status, 400);
  assert.equal(logFollowUpSentCalls.length, 0);
});

test('POST: invalid type is rejected (400), zero writes -- enum is not invented', async () => {
  const res = await POST(
    postRequest({ supplierId: 'supplier-1', rfqId: 'rfq-1', type: 'day999' }, { authorization: `Bearer ${adminJwt()}` }),
  );
  assert.equal(res.status, 400);
  assert.equal(logFollowUpSentCalls.length, 0);
});

test('POST: nonexistent supplierId is rejected (404), zero writes', async () => {
  findUniqueUserResult = null;
  const res = await POST(
    postRequest({ supplierId: 'nope', rfqId: 'rfq-1', type: 'day2' }, { authorization: `Bearer ${adminJwt()}` }),
  );
  assert.equal(res.status, 404);
  assert.equal(logFollowUpSentCalls.length, 0);
});

test('POST: nonexistent rfqId is rejected (404), zero writes', async () => {
  findUniqueRfqResult = null;
  const res = await POST(
    postRequest({ supplierId: 'supplier-1', rfqId: 'nope', type: 'day2' }, { authorization: `Bearer ${adminJwt()}` }),
  );
  assert.equal(res.status, 404);
  assert.equal(logFollowUpSentCalls.length, 0);
});

test('POST: authorized, valid request succeeds (200) and logs exactly once', async () => {
  const res = await POST(
    postRequest({ supplierId: 'supplier-1', rfqId: 'rfq-1', type: 'day2' }, { authorization: `Bearer ${adminJwt()}` }),
  );
  assert.equal(res.status, 200);
  assert.equal(logFollowUpSentCalls.length, 1);
  assert.deepEqual(logFollowUpSentCalls[0], { supplierId: 'supplier-1', rfqId: 'rfq-1', type: 'day2' });
});

test('POST: malformed JSON body with valid auth returns 400, not a 500 crash', async () => {
  const req = new NextRequest('http://localhost/api/outreach/follow-up', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminJwt()}` },
    body: 'not valid json{{{',
  });
  const res = await POST(req);
  assert.equal(res.status, 400);
});
