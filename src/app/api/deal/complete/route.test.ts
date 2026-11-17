/**
 * Regression tests for Task 39A-14: /api/deal/complete used to PATCH an
 * InsForge "deal" to completed and log a fabricated "escrow_released"
 * transaction, with zero authentication and zero confirmation that any
 * payment actually occurred. It had no caller anywhere in the repository
 * (Task 39A-13C-A). It is now retired (HTTP 410) rather than fixed.
 * Imports and executes the actual route handlers -- no separate mock
 * implementation. global.fetch is monitored (never mocked to succeed) so
 * any accidental outbound call would be caught, not hidden.
 */
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

const fetchCalls: unknown[] = [];

let GET: (req: NextRequest) => Promise<Response>;
let POST: (req: NextRequest) => Promise<Response>;
let PUT: (req: NextRequest) => Promise<Response>;
let PATCH: (req: NextRequest) => Promise<Response>;
let DELETE: (req: NextRequest) => Promise<Response>;
let OPTIONS: (req: NextRequest) => Promise<Response>;
let HEAD: () => Response;

before(async () => {
  global.fetch = (async (...args: unknown[]) => {
    fetchCalls.push(args);
    throw new Error('fetch must never be called by a retired route');
  }) as typeof fetch;

  ({ GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD } = await import('./route.ts'));
});

beforeEach(() => {
  fetchCalls.length = 0;
});

function request(method: string, body?: unknown): NextRequest {
  return new NextRequest('http://localhost/api/deal/complete', {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const DANGEROUS_BODY = { dealId: 'deal-1', buyerId: 'buyer-1' };

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const;

test('every supported method returns 410, with no financial-success wording, and no fetch', async () => {
  for (const method of METHODS) {
    const handler = { GET, POST, PUT, PATCH, DELETE, OPTIONS }[method];
    const body = method === 'GET' ? undefined : DANGEROUS_BODY;
    const res = await handler(request(method, body));
    assert.equal(res.status, 410, `${method} should return 410`);
    const text = await res.text();
    assert.doesNotMatch(text, /funds released/i, `${method} response must not claim funds were released`);
    assert.doesNotMatch(text, /finalized/i, `${method} response must not claim the deal was finalized`);
    assert.doesNotMatch(text, /success.*true/i, `${method} response must not claim success`);
    assert.equal(fetchCalls.length, 0, `${method} must never call fetch`);
  }
});

test('HEAD returns 410 and is not accidentally treated as success', async () => {
  const res = HEAD();
  assert.equal(res.status, 410);
  assert.notEqual(res.status, 200);
  assert.equal(fetchCalls.length, 0);
});

test('request body is never read or used to change anything -- malformed JSON still returns 410', async () => {
  const req = new NextRequest('http://localhost/api/deal/complete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{not valid json',
  });
  const res = await POST(req);
  assert.equal(res.status, 410);
  assert.equal(fetchCalls.length, 0);
});

test('an attacker-shaped body (arbitrary dealId/buyerId) still only gets a 410, never a success claim', async () => {
  const res = await POST(request('POST', { dealId: 'any-deal-id-at-all', buyerId: 'any-buyer-id-at-all' }));
  assert.equal(res.status, 410);
  const json = await res.json();
  assert.equal(json.error, 'This endpoint has been retired.');
  assert.equal(json.success, undefined);
  assert.equal(fetchCalls.length, 0);
});
