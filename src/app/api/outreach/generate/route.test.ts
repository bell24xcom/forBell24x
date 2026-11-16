/**
 * Regression tests for Task 39A-10: /api/outreach/generate was reachable
 * with zero authentication -- GET exposed up to 200 real suppliers' name,
 * company, phone, email, location, trustScore, plus ready-to-send WhatsApp
 * and email content, to any caller. GET must now require an admin session.
 * Uses real signed JWTs through the actual requireAdmin()/verifyToken()
 * code path -- only @/lib/prisma and @/lib/log-event are mocked. Requires
 * --experimental-test-module-mocks.
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const TEST_JWT_SECRET = 'test-only-jwt-secret-not-used-anywhere-real';

let rfqFindManyResult: Array<Record<string, unknown>> = [];
let userFindManyResult: Array<Record<string, unknown>> = [];
const logEventCalls: unknown[] = [];

mock.module('@/lib/prisma', {
  namedExports: {
    prisma: {
      rFQ: { findMany: async () => rfqFindManyResult },
      user: { findMany: async () => userFindManyResult },
    },
  },
});

mock.module('@/lib/log-event', {
  namedExports: {
    logEvent: (...args: unknown[]) => { logEventCalls.push(args); },
  },
});

let GET: (req: NextRequest) => Promise<Response>;

before(async () => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  delete process.env.ADMIN_TOKEN;
  delete process.env.EXPORT_API_KEY;
  ({ GET } = await import('./route.ts'));
});

beforeEach(() => {
  logEventCalls.length = 0;
  delete process.env.ADMIN_TOKEN;
  delete process.env.EXPORT_API_KEY;
  rfqFindManyResult = [
    { id: 'rfq-1', title: 'Need 500 widgets', category: 'Electronics', location: 'Mumbai', maxBudget: null, quantity: 500, urgency: 'HIGH' },
  ];
  userFindManyResult = [
    { id: 'supplier-1', name: 'Real Supplier', company: 'Real Co', phone: '919999999999', email: 'real@example.com', location: 'Pune', trustScore: 80 },
  ];
});

function adminJwt(role = 'ADMIN'): string {
  return jwt.sign({ userId: 'admin-1', phone: '', role, type: 'access' }, TEST_JWT_SECRET);
}

function getRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/outreach/generate', { headers });
}

test('GET: no Authorization header is rejected (401), no supplier PII returned, no DB query made', async () => {
  const res = await GET(getRequest());
  assert.equal(res.status, 401);
  const text = await res.text();
  assert.doesNotMatch(text, /Real Supplier/);
  assert.doesNotMatch(text, /919999999999/);
  assert.doesNotMatch(text, /real@example\.com/);
});

test('GET: invalid JWT is rejected (401)', async () => {
  const res = await GET(getRequest({ authorization: 'Bearer garbage' }));
  assert.equal(res.status, 401);
});

test('GET: valid JWT, non-ADMIN role is rejected (403), no PII returned', async () => {
  const res = await GET(getRequest({ authorization: `Bearer ${adminJwt('BUYER')}` }));
  assert.equal(res.status, 403);
  const text = await res.text();
  assert.doesNotMatch(text, /Real Supplier/);
});

test('GET: valid ADMIN JWT succeeds (200) and returns the outreach packets', async () => {
  const res = await GET(getRequest({ authorization: `Bearer ${adminJwt()}` }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.totalSuppliers, 1);
  assert.equal(json.outreach[0].suppliers[0].company, 'Real Co');
});

test('GET: the static ADMIN_TOKEN M2M credential also succeeds (200)', async () => {
  process.env.ADMIN_TOKEN = 'static-test-admin-token';
  const res = await GET(getRequest({ authorization: 'Bearer static-test-admin-token' }));
  assert.equal(res.status, 200);
});
