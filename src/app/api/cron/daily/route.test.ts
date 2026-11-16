/**
 * Regression tests for Task 39A-8: /api/cron/daily must no longer dispatch
 * to /api/cron/supplier-drip (it recorded false "sent" records), while every
 * other job and the Monday-only jobs stay included on their existing
 * schedule. Mocks `@/lib/cronAuth` and `global.fetch` via node:test's
 * `mock.module`/`mock.method` -- no real network call, cron secret, or
 * database is touched. Requires --experimental-test-module-mocks.
 */
import { test, mock, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

let cronSecretOk = true;

mock.module('@/lib/cronAuth', {
  namedExports: {
    verifyCronSecret: () => cronSecretOk,
    getCronHeaders: () => ({ Authorization: 'Bearer test-secret' }),
  },
});

let GET: (req: NextRequest) => Promise<Response>;

before(async () => {
  ({ GET } = await import('./route.ts'));
});

const fetchedPaths: string[] = [];

beforeEach(() => {
  cronSecretOk = true;
  fetchedPaths.length = 0;
  mock.method(global, 'fetch', async (url: string) => {
    fetchedPaths.push(new URL(url).pathname);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  });
});

function req() {
  return new NextRequest('http://localhost/api/cron/daily', {
    headers: { authorization: 'Bearer test-secret' },
  });
}

test('rejects an unauthenticated request without calling any job', async () => {
  cronSecretOk = false;
  const res = await GET(req());
  assert.equal(res.status, 401);
  assert.equal(fetchedPaths.length, 0);
});

test('non-Monday: dispatches every job except supplier-drip, and never supplier-drip', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-17T03:30:00Z').getTime() }); // Tuesday
  await GET(req());
  assert.ok(!fetchedPaths.includes('/api/cron/supplier-drip'), 'supplier-drip must never be dispatched');
  assert.deepEqual(fetchedPaths, [
    '/api/cron/expire-rfqs',
    '/api/cron/follow-up-due',
    '/api/cron/demand-loop',
    '/api/cron/analyze-behavior',
    '/api/cron/update-insights',
    '/api/cron/trust-scores',
  ]);
});

test('Monday: weekly-digest and churn-check are still included, supplier-drip still is not', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-16T03:30:00Z').getTime() }); // Monday
  await GET(req());
  assert.ok(!fetchedPaths.includes('/api/cron/supplier-drip'), 'supplier-drip must never be dispatched');
  assert.deepEqual(fetchedPaths, [
    '/api/cron/expire-rfqs',
    '/api/cron/weekly-digest',
    '/api/cron/churn-check',
    '/api/cron/follow-up-due',
    '/api/cron/demand-loop',
    '/api/cron/analyze-behavior',
    '/api/cron/update-insights',
    '/api/cron/trust-scores',
  ]);
});
