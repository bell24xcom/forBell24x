/**
 * Single source of truth for which party may perform which negotiation
 * action on a quote, at the route-entry level, for POST /api/negotiation
 * (src/app/api/negotiation/route.ts).
 *
 * Ported from commit 642c95cb (2026-10-18) during Phase 12B-5, with the
 * justification corrected rather than carried over unchanged: that commit
 * was written when `action === 'accept'` still updated the quote inline in
 * this route. `origin/main` has since introduced `lib/quote-acceptance.ts`'s
 * `acceptQuote()` as the single shared acceptance path for every route that
 * can accept a quote (deal/select, negotiation, rfq/quotes PUT,
 * admin/marketing/select-quote) -- and `acceptQuote()` already contains its
 * own unconditional, verified check (`if (quote.supplierId === actor.id)
 * return fail(403, 'self_accept_forbidden', ...)`), so a supplier calling
 * POST /api/negotiation with action=accept today is already rejected by
 * that inner check before any Deal is ever created, independent of this
 * file. This function is added here as a SECOND, independent layer at the
 * route's own entry point -- not because the self-accept path is currently
 * exploitable, but because the route's own pre-existing gate
 * (`isBuyer || isSupplier`) still lets a supplier reach the `accept` branch
 * at all, which is misleading to read and would leave this route with zero
 * protection of its own if `acceptQuote()` were ever changed without this
 * route's maintainer noticing. See
 * docs/audits/PHASE_12B_5_QUOTE_ACCEPTANCE_AUTHORIZATION_FIX.md for the full
 * trace that established this.
 *
 * Extracted into a pure, framework-free function so it can be tested under
 * plain `node --test` without resolving `next/server`/`@/lib/prisma`,
 * mirroring this codebase's existing `lib/payment-authorization.ts`
 * convention.
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
      return actor.isBuyer; // buyer-only at this route's own entry gate
    case 'reject':
    case 'counter':
      return true; // either party, unchanged
    default:
      return false;
  }
}
