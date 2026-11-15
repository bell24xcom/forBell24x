import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  decideIntentVerification,
  verifyRazorpayChecklistSignature,
  type PaymentIntentRow,
} from './razorpay-payment-intent.ts';

const KEY_SECRET = 'test_secret_abc123';

function sign(orderId: string, paymentId: string, secret = KEY_SECRET): string {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

function pendingIntent(overrides: Partial<PaymentIntentRow> = {}): PaymentIntentRow {
  return {
    id: 'intent_1',
    userId: 'user-1',
    orderId: 'order_abc',
    paymentId: null,
    amount: 50000, // paise
    currency: 'INR',
    status: 'PENDING',
    ...overrides,
  };
}

// --- verifyRazorpayChecklistSignature ---

test('valid signature for the exact order/payment pair: accepted', () => {
  const sig = sign('order_abc', 'pay_xyz');
  assert.equal(verifyRazorpayChecklistSignature('order_abc', 'pay_xyz', sig, KEY_SECRET), true);
});

test('signature computed for a different payment id: rejected', () => {
  const sig = sign('order_abc', 'pay_other');
  assert.equal(verifyRazorpayChecklistSignature('order_abc', 'pay_xyz', sig, KEY_SECRET), false);
});

test('signature computed with the wrong secret: rejected', () => {
  const sig = sign('order_abc', 'pay_xyz', 'wrong_secret');
  assert.equal(verifyRazorpayChecklistSignature('order_abc', 'pay_xyz', sig, KEY_SECRET), false);
});

test('malformed (non-hex) signature of mismatched length: rejected, not a crash', () => {
  assert.equal(verifyRazorpayChecklistSignature('order_abc', 'pay_xyz', 'not-hex!!', KEY_SECRET), false);
});

// --- decideIntentVerification: core amount-trust and idempotency decisions ---

test('no PaymentIntent found for this order id: NOT_FOUND', () => {
  const result = decideIntentVerification(null, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_xyz', signature: sign('order_abc', 'pay_xyz'), isTestMode: false,
  }, KEY_SECRET);
  assert.deepEqual(result, { outcome: 'NOT_FOUND' });
});

test('intent exists but belongs to a different user: FORBIDDEN, never leaks amount/currency', () => {
  const intent = pendingIntent({ userId: 'user-1' });
  const result = decideIntentVerification(intent, {
    userId: 'attacker', orderId: 'order_abc', paymentId: 'pay_xyz', signature: sign('order_abc', 'pay_xyz'), isTestMode: false,
  }, KEY_SECRET);
  assert.deepEqual(result, { outcome: 'FORBIDDEN' });
});

test('valid signature, PENDING intent: READY_TO_CREDIT using the STORED amount, never request input', () => {
  const intent = pendingIntent({ amount: 100, currency: 'INR' }); // a real ₹1 order
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_xyz', signature: sign('order_abc', 'pay_xyz'), isTestMode: false,
  }, KEY_SECRET);
  // Even though nothing in the request claims a huge amount, the point is
  // the decision NEVER reads amount from the request at all -- it comes
  // only from the stored intent.
  assert.deepEqual(result, { outcome: 'READY_TO_CREDIT', amount: 100, currency: 'INR' });
});

test('REGRESSION: a real signature replayed with the stored amount being small (₹1 intent) is NOT inflated by anything the caller claims', () => {
  // This is the exact attack the old routes were vulnerable to: complete a
  // tiny real payment, then call verify with a large client-supplied
  // `amount`. The decision function doesn't even accept an `amount` field
  // in VerificationRequest -- there is no parameter through which a caller
  // could inflate the credited amount.
  const intent = pendingIntent({ amount: 100, currency: 'INR' });
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_xyz', signature: sign('order_abc', 'pay_xyz'), isTestMode: false,
  } as any, KEY_SECRET);
  assert.equal(result.outcome, 'READY_TO_CREDIT');
  assert.equal((result as any).amount, 100);
});

test('missing signature, not test mode, not a trusted source: INVALID_SIGNATURE', () => {
  const intent = pendingIntent();
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_xyz', signature: null, isTestMode: false,
  }, KEY_SECRET);
  assert.deepEqual(result, { outcome: 'INVALID_SIGNATURE' });
});

test('altered/wrong signature: INVALID_SIGNATURE, intent stays PENDING (caller must not be able to force PAID)', () => {
  const intent = pendingIntent();
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_xyz', signature: 'deadbeef'.repeat(8), isTestMode: false,
  }, KEY_SECRET);
  assert.deepEqual(result, { outcome: 'INVALID_SIGNATURE' });
});

test('no RAZORPAY_KEY_SECRET configured, not test mode: INVALID_SIGNATURE rather than crashing or trusting blindly', () => {
  const intent = pendingIntent();
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_xyz', signature: sign('order_abc', 'pay_xyz'), isTestMode: false,
  }, null);
  assert.deepEqual(result, { outcome: 'INVALID_SIGNATURE' });
});

test('test mode: no signature required at all', () => {
  const intent = pendingIntent({ orderId: 'order_test_123' });
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_test_123', paymentId: 'pay_test_1', signature: null, isTestMode: true,
  }, KEY_SECRET);
  assert.equal(result.outcome, 'READY_TO_CREDIT');
});

test('trustedSource (webhook call site): no checkout signature required even outside test mode', () => {
  const intent = pendingIntent();
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_xyz', signature: null, isTestMode: false, trustedSource: true,
  }, KEY_SECRET);
  assert.equal(result.outcome, 'READY_TO_CREDIT');
});

// --- Idempotency: already-PAID intents ---

test('intent already PAID with the SAME payment id (retry/duplicate webhook/double-click): ALREADY_PROCESSED, not a second credit', () => {
  const intent = pendingIntent({ status: 'PAID', paymentId: 'pay_xyz' });
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_xyz', signature: sign('order_abc', 'pay_xyz'), isTestMode: false,
  }, KEY_SECRET);
  assert.deepEqual(result, { outcome: 'ALREADY_PROCESSED' });
});

test('intent already PAID with a DIFFERENT payment id (suspicious reuse attempt): PAYMENT_ID_CONFLICT, rejected not credited', () => {
  const intent = pendingIntent({ status: 'PAID', paymentId: 'pay_original' });
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_different', signature: sign('order_abc', 'pay_different'), isTestMode: false,
  }, KEY_SECRET);
  assert.deepEqual(result, { outcome: 'PAYMENT_ID_CONFLICT' });
});

test('intent in FAILED status: PAYMENT_ID_CONFLICT, never credited', () => {
  const intent = pendingIntent({ status: 'FAILED' });
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_abc', paymentId: 'pay_xyz', signature: sign('order_abc', 'pay_xyz'), isTestMode: false,
  }, KEY_SECRET);
  assert.deepEqual(result, { outcome: 'PAYMENT_ID_CONFLICT' });
});

test('order id in the request does not match the looked-up intent (defense in depth): NOT_FOUND', () => {
  const intent = pendingIntent({ orderId: 'order_real' });
  const result = decideIntentVerification(intent, {
    userId: 'user-1', orderId: 'order_spoofed', paymentId: 'pay_xyz', signature: sign('order_spoofed', 'pay_xyz'), isTestMode: false,
  }, KEY_SECRET);
  assert.deepEqual(result, { outcome: 'NOT_FOUND' });
});
