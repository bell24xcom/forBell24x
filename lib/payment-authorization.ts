/**
 * Authorization, deal-state, and idempotency decisions for
 * POST /api/monetization/pay (P0 security fix, 2026-10-19).
 *
 * Extracted into pure, framework-free functions — rather than left inline in
 * the route handler — so they can be tested under plain `node --test`
 * without resolving `next/server`/`@/lib/prisma`/`razorpay`, mirroring the
 * existing `lib/negotiation-authorization.ts` / `lib/smart-matching-ai-response.ts`
 * convention already used for a similar P0 fix.
 *
 * The defect this closes: the route previously trusted a caller-supplied
 * `dealId` with no authentication and no ownership check at all, fetching
 * deal data from a paused InsForge project instead of this application's own
 * Prisma/Neon database. This module only encodes the *decision* logic
 * (who may pay, when, and whether a payment is already in flight) — the
 * route itself still owns loading the deal and creating the Razorpay order.
 */

export interface DealForPayment {
  buyerId: string;
  status: string;
}

export type PaymentAuthorizationResult =
  | { allowed: true }
  | { allowed: false; status: 403; error: 'Forbidden' }
  | { allowed: false; status: 400; error: string };

/**
 * Payment initiation is a buyer-only action — mirroring this codebase's
 * existing convention that accept-type deal/quote actions are buyer-only
 * (src/app/api/rfq/quotes/route.ts, lib/negotiation-authorization.ts's
 * `accept` case), distinct from merely *viewing* a deal (GET /api/deal/[id]),
 * which is open to buyer or supplier. A supplier has no business triggering
 * a payment order on the buyer's behalf.
 */
export function authorizePaymentInitiation(deal: DealForPayment, userId: string): PaymentAuthorizationResult {
  if (deal.buyerId !== userId) {
    return { allowed: false, status: 403, error: 'Forbidden' };
  }
  if (deal.status !== 'ACTIVE') {
    return { allowed: false, status: 400, error: `Deal is not payable in its current state (${deal.status})` };
  }
  return { allowed: true };
}

export interface ExistingPaymentTransaction {
  metadata: unknown;
  currency: string;
}

export type ExistingPaymentDecision =
  | { reuseExisting: true; orderId: string; currency: string }
  | { reuseExisting: false; conflict: true }
  | { reuseExisting: false; conflict: false };

/**
 * Idempotency: given any existing PENDING/PROCESSING Transaction row already
 * found for this deal's quote, decide whether to reuse its recorded Razorpay
 * order (a legitimate retry before the original order completed), reject as
 * a conflict (a pending transaction exists but has no recorded order id —
 * should not normally happen; fail safe rather than silently create a
 * second order), or proceed to create a new order (no existing transaction
 * at all).
 */
export function resolveExistingPaymentTransaction(
  existing: ExistingPaymentTransaction | null,
): ExistingPaymentDecision {
  if (!existing) {
    return { reuseExisting: false, conflict: false };
  }
  const orderId = (existing.metadata as Record<string, unknown> | null)?.razorpayOrderId;
  if (typeof orderId === 'string' && orderId.length > 0) {
    return { reuseExisting: true, orderId, currency: existing.currency };
  }
  return { reuseExisting: false, conflict: true };
}
