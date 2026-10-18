/**
 * Single source of truth for which party may perform which negotiation
 * action on a quote. Shared by POST /api/negotiation (P0 security fix,
 * 2026-10-18).
 *
 * Extracted into a pure, framework-free function — rather than left inline
 * in the route handler — so it can be tested under plain `node --test`
 * without resolving `next/server`/`@/lib/prisma`, mirroring the existing
 * `lib/rfq-quotable-status.ts` convention for extracting a route's
 * authorization/eligibility decision into a testable `lib/` module.
 *
 * The defect this closes: the route previously used one check
 * (`isBuyer || isSupplier`) for accept, reject, AND counter alike, which let
 * a supplier accept their own quote with no action or consent from the
 * buyer who is supposed to decide whether to accept it. `reject` and
 * `counter` are intentionally left open to either party — a supplier
 * rejecting or countering their own quote is a normal negotiation action,
 * not the bug being fixed here.
 */
export type NegotiationAction = 'accept' | 'reject' | 'counter';

export interface NegotiationActorContext {
  /** Derived server-side from `quote.rfq.createdBy === authenticatedUserId` — never from request-body input. */
  isBuyer: boolean;
  /** Derived server-side from `quote.supplierId === authenticatedUserId` — never from request-body input. */
  isSupplier: boolean;
}

export function isNegotiationActionAuthorized(
  action: NegotiationAction,
  actor: NegotiationActorContext,
): boolean {
  if (!actor.isBuyer && !actor.isSupplier) {
    return false; // neither party to this quote — unchanged pre-existing rule
  }
  // Fail-closed: every supported action is listed explicitly below; anything
  // else falls through to the default `false`. This does not rely on the
  // caller (the route's own action allow-list) to keep an unknown action
  // from being authorized — this function is self-contained.
  switch (action) {
    case 'accept':
      return actor.isBuyer; // P0 fix: a supplier can no longer accept their own quote
    case 'reject':
    case 'counter':
      return true; // either party, unchanged
    default:
      return false;
  }
}
