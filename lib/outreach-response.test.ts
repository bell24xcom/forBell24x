/**
 * Unit tests for the "mark as sent" response interpreter used by
 * src/app/dashboard/operator/page.tsx's markFollowUpSent()/markDripSent().
 * Before Task 39A-10, both functions removed the pending item from the UI
 * list unconditionally, without ever checking response.ok -- a 401, 403,
 * 500, or network failure looked identical to success. This helper is the
 * single place that decides "was this actually successful," and is plain
 * Node code with no React/DOM dependency, so it can run under node:test.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpretOutreachResponse } from './outreach-response.ts';

test('network failure (null response) is not ok, and keeps the pending item', async () => {
  const result = await interpretOutreachResponse(null);
  assert.equal(result.ok, false);
});

test('401 is not ok', async () => {
  const res = new Response(JSON.stringify({ success: false }), { status: 401 });
  const result = await interpretOutreachResponse(res);
  assert.equal(result.ok, false);
  assert.match(result.message ?? '', /admin session/i);
});

test('403 is not ok', async () => {
  const res = new Response(JSON.stringify({ success: false }), { status: 403 });
  const result = await interpretOutreachResponse(res);
  assert.equal(result.ok, false);
});

test('500 is not ok', async () => {
  const res = new Response(JSON.stringify({ success: false, error: 'boom' }), { status: 500 });
  const result = await interpretOutreachResponse(res);
  assert.equal(result.ok, false);
});

test('200 with success:false in the body is not ok (not just HTTP status)', async () => {
  const res = new Response(JSON.stringify({ success: false, error: 'Supplier not found' }), { status: 200 });
  const result = await interpretOutreachResponse(res);
  assert.equal(result.ok, false);
  assert.equal(result.message, 'Supplier not found');
});

test('200 with success:true is ok', async () => {
  const res = new Response(JSON.stringify({ success: true }), { status: 200 });
  const result = await interpretOutreachResponse(res);
  assert.equal(result.ok, true);
});
