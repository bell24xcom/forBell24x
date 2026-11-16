/**
 * Regression tests for Task 39A-8: /api/cron/supplier-drip must never
 * create a "sent" record on its own -- it used to call logDripSent() for
 * every due drip on nothing more than wa.me link generation, with no
 * provider confirmation. Mocks `@/lib/supplier-drip-engine` and
 * `@/lib/cronAuth` via node:test's `mock.module` -- no real database or
 * provider call is possible. Requires --experimental-test-module-mocks.
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

let cronSecretOk = true;
const logDripSentCalls: unknown[] = [];
let dueDrips: Array<{ supplierId: string; name: string | null; company: string | null; phone: string | null; dripType: string; waLink: string | null }> = [];

mock.module('@/lib/cronAuth', {
  namedExports: { verifyCronSecret: () => cronSecretOk },
});

// logDripSent is exported for completeness, but the route must not import
// or call it at all -- if it ever does again, this mock makes that visible.
mock.module('@/lib/supplier-drip-engine', {
  namedExports: {
    getDripsDue: async () => dueDrips,
    logDripSent: async (...args: unknown[]) => { logDripSentCalls.push(args); },
  },
});

let GET: (req: NextRequest) => Promise<Response>;

before(async () => {
  ({ GET } = await import('./route.ts'));
});

beforeEach(() => {
  cronSecretOk = true;
  logDripSentCalls.length = 0;
  dueDrips = [
    { supplierId: 's1', name: 'Alice', company: 'Acme', phone: '919999999999', dripType: 'day3', waLink: 'https://wa.me/919999999999?text=hi' },
    { supplierId: 's2', name: 'Bob', company: null, phone: null, dripType: 'day7', waLink: null },
  ];
});

function req() {
  return new NextRequest('http://localhost/api/cron/supplier-drip', {
    headers: { authorization: 'Bearer test-secret' },
  });
}

test('rejects an unauthenticated request', async () => {
  cronSecretOk = false;
  const res = await GET(req());
  assert.equal(res.status, 401);
});

test('never records a drip as sent, even when drips are due', async () => {
  const res = await GET(req());
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(logDripSentCalls.length, 0, 'logDripSent must not be called by the cron route');
  assert.equal(body.total, 2);
  for (const d of body.drips) {
    assert.equal(d.status, 'not_configured');
  }
});

test('returns an empty, truthful report when nothing is due', async () => {
  dueDrips = [];
  const res = await GET(req());
  const body = await res.json();
  assert.equal(body.total, 0);
  assert.deepEqual(body.drips, []);
  assert.equal(logDripSentCalls.length, 0);
});
