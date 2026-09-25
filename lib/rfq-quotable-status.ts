/**
 * Single source of truth for which RFQ statuses may still accept a new
 * quote. Shared by POST /api/quote and POST /api/marketing/quote (PR63).
 *
 * ACTIVE/OPEN are the create-time defaults (text and voice RFQs
 * respectively). QUOTED means at least one quote already exists but the
 * RFQ still accepts more — see src/app/api/supplier/quotes/route.ts,
 * which already relies on QUOTED remaining quoteable (it fetches with
 * `status: { in: ['OPEN', 'ACTIVE', 'QUOTED'] }` and transitions a
 * newly-quoted RFQ to QUOTED itself). This list matches that existing,
 * already-shipped precedent rather than introducing a narrower one that
 * would have silently broken multi-quote RFQs.
 *
 * Deliberately an ALLOW-list, not a deny-list: every other RFQStatus value
 * (CANCELLED, CLOSED, COMPLETED, DRAFT, EXPIRED, ACCEPTED, IN_PROGRESS,
 * CLOSED_EXTERNAL) is rejected by default, including any future status
 * value added to the enum later.
 */
export const QUOTABLE_RFQ_STATUSES = ['ACTIVE', 'OPEN', 'QUOTED'] as const;
export type QuotableRfqStatus = (typeof QUOTABLE_RFQ_STATUSES)[number];

export function isQuotableRfqStatus(status: string): status is QuotableRfqStatus {
  return (QUOTABLE_RFQ_STATUSES as readonly string[]).includes(status);
}
