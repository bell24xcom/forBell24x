import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authorizePaymentInitiation, resolveExistingPaymentTransaction } from './payment-authorization.ts';

// --- authorizePaymentInitiation ---

test('buyer, ACTIVE deal: allowed', () => {
  const result = authorizePaymentInitiation({ buyerId: 'buyer-1', status: 'ACTIVE' }, 'buyer-1');
  assert.deepEqual(result, { allowed: true });
});

test('supplier (not the buyer) on an ACTIVE deal: forbidden — payment is a buyer-only action', () => {
  const result = authorizePaymentInitiation({ buyerId: 'buyer-1', status: 'ACTIVE' }, 'supplier-1');
  assert.deepEqual(result, { allowed: false, status: 403, error: 'Forbidden' });
});

test('an unrelated user (neither buyer nor supplier on the deal): forbidden', () => {
  const result = authorizePaymentInitiation({ buyerId: 'buyer-1', status: 'ACTIVE' }, 'unrelated-user');
  assert.deepEqual(result, { allowed: false, status: 403, error: 'Forbidden' });
});

test('the real buyer, but the deal is ESCROW_LOCKED (already paid via the wallet path): rejected', () => {
  const result = authorizePaymentInitiation({ buyerId: 'buyer-1', status: 'ESCROW_LOCKED' }, 'buyer-1');
  assert.equal(result.allowed, false);
  if (!result.allowed) {
    assert.equal(result.status, 400);
    assert.match(result.error, /ESCROW_LOCKED/);
  }
});

test('authorization is checked before the deal-state gate: a non-buyer on a non-ACTIVE deal still gets 403, not 400', () => {
  // Confirms ownership is not bypassed by also having an invalid state —
  // the 403 must win so a non-owner never learns the deal's actual status.
  const result = authorizePaymentInitiation({ buyerId: 'buyer-1', status: 'ESCROW_LOCKED' }, 'someone-else');
  assert.deepEqual(result, { allowed: false, status: 403, error: 'Forbidden' });
});

// --- resolveExistingPaymentTransaction ---

test('no existing transaction: proceed to create a new order', () => {
  const result = resolveExistingPaymentTransaction(null);
  assert.deepEqual(result, { reuseExisting: false, conflict: false });
});

test('an existing PENDING transaction with a recorded order id: reuse it, never create a second order', () => {
  const result = resolveExistingPaymentTransaction({ metadata: { razorpayOrderId: 'order_abc123' }, currency: 'INR' });
  assert.deepEqual(result, { reuseExisting: true, orderId: 'order_abc123', currency: 'INR' });
});

test('an existing PENDING transaction with no order id recorded: fail safe as a conflict, do not create a second order', () => {
  const result = resolveExistingPaymentTransaction({ metadata: {}, currency: 'INR' });
  assert.deepEqual(result, { reuseExisting: false, conflict: true });
});

test('an existing transaction with null metadata: treated the same as missing order id — conflict, not a crash', () => {
  const result = resolveExistingPaymentTransaction({ metadata: null, currency: 'INR' });
  assert.deepEqual(result, { reuseExisting: false, conflict: true });
});

test('an existing transaction with a non-string razorpayOrderId (malformed data): treated as missing, not trusted blindly', () => {
  const result = resolveExistingPaymentTransaction({ metadata: { razorpayOrderId: 12345 }, currency: 'INR' });
  assert.deepEqual(result, { reuseExisting: false, conflict: true });
});
