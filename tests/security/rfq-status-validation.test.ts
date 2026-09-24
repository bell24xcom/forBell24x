// PR63 security regression suite — RFQ status guard shared by
// POST /api/quote and POST /api/marketing/quote.
//
// Tests the pure allow-list in lib/rfq-quotable-status.ts directly rather
// than invoking the Next.js route handlers, which import `next/server` and
// the `@/lib/prisma` path alias — neither resolvable under plain
// `node --test` without a framework-aware loader. This mirrors the
// existing repo convention (src/lib/outreach/*.test.ts) of testing the
// pure `lib/` logic a route delegates to, not the route itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUOTABLE_RFQ_STATUSES, isQuotableRfqStatus } from '../../lib/rfq-quotable-status.ts';

// Full RFQStatus enum (prisma/schema.prisma) — kept as a literal list here,
// deliberately not imported from @prisma/client, so this test doesn't
// depend on a generated client and stays framework-agnostic like the
// module it's testing.
const ALL_RFQ_STATUSES = [
  'OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED', 'DRAFT', 'ACTIVE',
  'QUOTED', 'ACCEPTED', 'IN_PROGRESS', 'EXPIRED', 'CLOSED_EXTERNAL',
] as const;

test('RFQ ACTIVE: quoteable', () => {
  assert.equal(isQuotableRfqStatus('ACTIVE'), true);
});

test('RFQ OPEN: quoteable', () => {
  assert.equal(isQuotableRfqStatus('OPEN'), true);
});

test('RFQ QUOTED: still quoteable (multi-quote precedent — src/app/api/supplier/quotes/route.ts already relies on this)', () => {
  assert.equal(isQuotableRfqStatus('QUOTED'), true);
});

test('RFQ CANCELLED: rejected', () => {
  assert.equal(isQuotableRfqStatus('CANCELLED'), false);
});

test('RFQ CLOSED: rejected', () => {
  assert.equal(isQuotableRfqStatus('CLOSED'), false);
});

test('RFQ COMPLETED, DRAFT, EXPIRED, ACCEPTED, IN_PROGRESS, CLOSED_EXTERNAL: all rejected', () => {
  for (const status of ['COMPLETED', 'DRAFT', 'EXPIRED', 'ACCEPTED', 'IN_PROGRESS', 'CLOSED_EXTERNAL']) {
    assert.equal(isQuotableRfqStatus(status), false, `${status} should not be quoteable`);
  }
});

test('exhaustiveness: every RFQStatus enum member is explicitly classified, none silently missing from either list', () => {
  for (const status of ALL_RFQ_STATUSES) {
    const allowed = (QUOTABLE_RFQ_STATUSES as readonly string[]).includes(status);
    assert.equal(isQuotableRfqStatus(status), allowed);
  }
  // And nothing in the allow-list is a status the schema doesn't actually have.
  for (const status of QUOTABLE_RFQ_STATUSES) {
    assert.ok((ALL_RFQ_STATUSES as readonly string[]).includes(status), `${status} is not a real RFQStatus value`);
  }
});

test('unknown/future status value: rejected by default (allow-list, not a deny-list)', () => {
  assert.equal(isQuotableRfqStatus('SOME_FUTURE_STATUS_NOT_YET_INVENTED'), false);
  assert.equal(isQuotableRfqStatus('ARCHIVED'), false); // not a real enum value; must not be treated as quoteable either
});
