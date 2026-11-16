/**
 * Regression tests for Task 39A-8: /api/outreach/drip was reachable with
 * zero authentication -- GET leaked every due supplier's PII and POST let
 * any caller mark any drip as sent. Both methods must now require an admin
 * session. Mocks `@/lib/admin-auth` and `@/lib/supplier-drip-engine` via
 * node:test's `mock.module` -- no real database call is possible. Requires
 * --experimental-test-module-mocks.
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest, NextResponse } from 'next/server';

let adminOk = true;
const logDripSentCalls: unknown[] = [];
let dueDrips: Array<{ supplierId: string; phone: string | null; dripType: string }> = [];

mock.module('@/lib/admin-auth', {
  namedExports: {
    requireAdmin: () =>
      adminOk
        ? { userId: 'admin', phone: '', role: 'ADMIN' }
        : NextResponse.json({ success: false, message: 'Admin authentication required' }, { status: 401 }),
    isErrorResponse: (v: unknown) => v instanceof NextResponse,
  },
});

mock.module('@/lib/supplier-drip-engine', {
  namedExports: {
    getDripsDue: async () => dueDrips,
    logDripSent: async (...args: unknown[]) => { logDripSentCalls.push(args); },
  },
});

let GET: (req: NextRequest) => Promise<Response>;
let POST: (req: NextRequest) => Promise<Response>;

before(async () => {
  ({ GET, POST } = await import('./route.ts'));
});

beforeEach(() => {
  adminOk = true;
  logDripSentCalls.length = 0;
  dueDrips = [{ supplierId: 's1', phone: '919999999999', dripType: 'day3' }];
});

test('GET rejects an unauthenticated caller and leaks nothing', async () => {
  adminOk = false;
  const res = await GET(new NextRequest('http://localhost/api/outreach/drip'));
  assert.equal(res.status, 401);
});

test('GET returns due drips for an authenticated admin', async () => {
  const res = await GET(new NextRequest('http://localhost/api/outreach/drip'));
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.total, 1);
});

test('POST rejects an unauthenticated caller and never marks anything sent', async () => {
  adminOk = false;
  const res = await POST(new NextRequest('http://localhost/api/outreach/drip', {
    method: 'POST',
    body: JSON.stringify({ supplierId: 's1', dripType: 'day3' }),
  }));
  assert.equal(res.status, 401);
  assert.equal(logDripSentCalls.length, 0, 'an unauthenticated POST must never call logDripSent');
});

test('POST marks a drip sent only for an authenticated admin', async () => {
  const res = await POST(new NextRequest('http://localhost/api/outreach/drip', {
    method: 'POST',
    body: JSON.stringify({ supplierId: 's1', dripType: 'day3' }),
  }));
  assert.equal(res.status, 200);
  assert.equal(logDripSentCalls.length, 1);
  assert.deepEqual(logDripSentCalls[0], ['s1', 'day3']);
});
