// PR63 security regression suite — PUT /api/admin/rfqs field whitelist.
//
// Tests the pure validateRfqUpdate() in lib/rfq-update-whitelist.ts
// directly, for the same reason as rfq-status-validation.test.ts: the
// route itself imports next/server and @/lib/prisma, neither resolvable
// under plain `node --test`. The route (src/app/api/admin/rfqs/route.ts)
// is now a thin caller of this function plus the actual DB write.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRfqUpdate, ALLOWED_RFQ_UPDATE_FIELDS } from '../../lib/rfq-update-whitelist.ts';

const VALID_STATUSES = [
  'OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED', 'DRAFT', 'ACTIVE',
  'QUOTED', 'ACCEPTED', 'IN_PROGRESS', 'EXPIRED', 'CLOSED_EXTERNAL',
];

test('whitelist acceptance: { status } alone, a value the UI\'s close button actually sends', () => {
  const result = validateRfqUpdate({ status: 'CANCELLED' }, VALID_STATUSES);
  assert.equal(result.ok, true);
  assert.deepEqual(result.ok && result.safeUpdates, { status: 'CANCELLED' });
});

test('whitelist acceptance: { expiresAt } alone, a value the UI\'s extend button actually sends', () => {
  const iso = new Date(Date.now() + 7 * 86400000).toISOString();
  const result = validateRfqUpdate({ expiresAt: iso }, VALID_STATUSES);
  assert.equal(result.ok, true);
  assert.ok(result.ok && result.safeUpdates.expiresAt instanceof Date);
});

test('whitelist rejection: an unknown field is rejected with 400, even alongside a valid one', () => {
  const result = validateRfqUpdate({ status: 'ACTIVE', createdBy: 'attacker-controlled-id' }, VALID_STATUSES);
  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.status, 400);
  assert.match(!result.ok ? result.error : '', /createdBy/);
});

test('whitelist rejection: every field the UI does NOT send is rejected', () => {
  for (const field of ['categoryId', 'title', 'description', 'isPublic', 'views', 'slug']) {
    const result = validateRfqUpdate({ [field]: 'x' }, VALID_STATUSES);
    assert.equal(result.ok, false, `${field} should be rejected`);
    assert.equal(!result.ok && result.status, 400);
  }
});

test('invalid status value: rejected with 400 even though "status" itself is an allowed key', () => {
  const result = validateRfqUpdate({ status: 'NOT_A_REAL_STATUS' }, VALID_STATUSES);
  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.status, 400);
});

test('non-object updates payload is rejected', () => {
  assert.equal(validateRfqUpdate(null, VALID_STATUSES).ok, false);
  assert.equal(validateRfqUpdate('status=ACTIVE', VALID_STATUSES).ok, false);
  assert.equal(validateRfqUpdate(['status', 'ACTIVE'], VALID_STATUSES).ok, false);
});

test('the allow-list itself is exactly {status, expiresAt} — a canary against silent expansion', () => {
  assert.deepEqual([...ALLOWED_RFQ_UPDATE_FIELDS].sort(), ['expiresAt', 'status']);
});
