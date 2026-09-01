# VS-ADMIN-PRODUCTION-AUDIT-FIX-01

**Date:** 2026-09-01
**Scope:** Verify a live admin audit's five findings against actual source code, then attempt local reproduction.
**Rule followed:** the audit report was not trusted — every claim below is checked against `src/`, `prisma/schema.prisma`, git history, and a locally-run dev server. No production code was modified. No data was deleted. No commits made.

---

## Environment note (read this before the findings)

Two blockers limited how far Phase 2 (reproduce) could go, and are disclosed here rather than papered over:

1. **No live DB query tooling.** The sandbox's permission classifier blocked every attempt to run a Node/Prisma script that opened a direct connection to the configured database (`DATABASE_URL`), even read-only. This is the same restriction — appropriately — described in `docs/smoke-test-2026-07-26.md` line 112 ("minting a local JWT programmatically was attempted and blocked by the Claude Code permission classifier, appropriately, since it resembles auth-token forgery even for dev-only use"). I hit the identical block from a different angle (raw DB script) and did not attempt to work around it.
2. **No admin credentials available locally.** `ADMIN_TOKEN` is not set in `.env` or `.env.local`. `EXPORT_API_KEY` is present as a key but set to `""` in both files. `ADMIN_EMAIL`/`ADMIN_PASSWORD` are absent from the active env files (a real value only exists in `.env.local.backup.1756844683945`, a stale backup — not the active config `next dev` loads). So `/api/admin/login` would itself return `503 Admin access not configured` locally, and I could not mint a valid `admin-token` JWT to drive the actual admin UI end-to-end.

What I *could* do, and did: start the real `next dev` server (`npm run dev`, port 3001, confirmed running), hit every route under audit unauthenticated to confirm the auth gate itself is fast and correct (all four routes below return `401` in 60–90ms once warm — the first hit of each was 200–900ms of Next.js dev-mode cold-compile, not app latency), and read every relevant file end-to-end. Where I could not independently reproduce a timing/error claim past the auth wall, that is stated plainly below as **PARTIALLY VERIFIED**, not overclaimed as VERIFIED.

```
revenue: HTTP 401  (warm: 0.07s, 0.06s)
crm:     HTTP 401  (warm: 0.06s)
rfqs:    HTTP 401  (warm: 0.06s)
diag:    HTTP 401  (warm: 0.06s)
```

---

## PHASE 1 — VERIFY (source inspection)

| Page (nav label) | Route file | API route(s) | Auth |
|---|---|---|---|
| Revenue | `src/app/admin/revenue/page.tsx` | `GET /api/admin/revenue` → `src/app/api/admin/revenue/route.ts` | `requireAdmin()` from `lib/admin-auth.ts` (repo-root `lib/`, resolved via the `@/*` → `./*` path alias — **not** `src/lib`) |
| CRM / Users (the only nav entry — `src/app/admin/layout.tsx:27`) | `src/app/admin/crm/page.tsx` | `GET /api/admin/crm` → `src/app/api/admin/crm/route.ts` | same |
| RFQs | `src/app/admin/rfqs/page.tsx` | `GET /api/admin/rfqs` → `src/app/api/admin/rfqs/route.ts` | same |
| System Health | `src/app/admin/system/page.tsx` | `GET /api/admin/system/diagnostics` → `src/app/api/admin/system/diagnostics/route.ts` | same |

Important disambiguation not in the original report: **`src/app/admin/users/page.tsx` and `/api/admin/users/route.ts` also exist**, but that page is **not linked anywhere in the admin nav** (`src/app/admin/layout.tsx`) — the "CRM / Users" sidebar entry points only at `/admin/crm` → `/api/admin/crm`. The two routes have materially different query shapes (see Finding 2). This matters for root-causing correctly — the report's "CRM/Users" wording could be misread as pointing at the wrong file.

### Actual API calls / DB queries / loading strategy per route

**`GET /api/admin/revenue`** (`src/app/api/admin/revenue/route.ts:21-89`)
- 6 queries in one `Promise.all`: 2×`walletTransaction.aggregate`, 1×`user.groupBy`, 1×`walletTransaction.findMany` (take 20, includes `wallet.user`), 1×`$queryRaw` (raw SQL against `wallet_transactions`, grouped by month), 1×`interactionMemory.findMany` (take 20).
- Pagination: N/A (fixed `take: 20` on the two list queries; no page param).
- On any exception, the catch block at line 125-128 returns exactly `{ success: false, error: 'Failed to load revenue data' }` — **this is a verbatim match to the audit's reported error string**, confirming the report is describing this exact code path, not a fabricated symptom.

**`GET /api/admin/crm`** (`src/app/api/admin/crm/route.ts:13-65`)
- 2 queries in one `Promise.all`: `user.findMany` (paginated, `take` ≤100, default 25, `orderBy: [{trustScore:'desc'},{createdAt:'desc'}]`, `select` includes `_count:{rfqs,quotes}` and `wallet:{balance}`) + `user.count`.
- Pagination: yes — `page`/`limit` query params, default `limit=25`, capped at 100.
- Query count per request: **2**, not the 9 the sibling `/api/admin/users` route runs (see below) — the report's magnitude (15-20s) is not obviously explained by *query count* here; see Finding 2 root-cause discussion.

**`GET /api/admin/rfqs`** (`src/app/api/admin/rfqs/route.ts:130-243`)
- 6 queries: `rFQ.findMany` (paginated, default `limit=20`, `include`s `user`, **all** `quotes` for each RFQ with nested `supplier` and `deal` — no `take` on the `quotes` relation) + `rFQ.count`, then 4 more sequential-shape `rFQ.count` calls for stats (active/completed/cancelled/new-this-week), run in a second `Promise.all`.
- Pagination: yes on RFQs themselves, but the **nested `quotes` array is unbounded** — an RFQ with hundreds of quotes returns all of them, with supplier and deal sub-objects, on every list-page load.
- `orderBy: { [sortBy]: sortOrder }` builds the order key from a raw query param with no field whitelist — not a data-correctness bug today (default `sortBy=createdAt` is safe), but an unvalidated input worth flagging.

**`GET /api/admin/system/diagnostics`** (`src/app/api/admin/system/diagnostics/route.ts:78-221`)
- 1 `$queryRaw SELECT 1` (connectivity + latency probe) + 1 `Promise.all` of **10** queries (8 `count`s, 1 `findMany` distinct-eventType, 1 `findFirst`) covering `user`, `rFQ`, `rfqMemory`, `quoteMemory`, `deal`, `businessLifeEvent`, `marketInsight`.
- No pagination (all counts).
- **Structural defect confirmed by reading, not assumed:** `counts` is initialized to all-zero (lines 92-101) and only overwritten (lines 136-145) if the entire 10-query `Promise.all` resolves. `Promise.all` fails fast — if **any single one** of those 10 queries throws (e.g. `businessLifeEvent` or `marketInsight`, tables that are newer/less exercised than `users`/`rfqs`), the `catch` at line 146-148 sets `dbError` and **every count reverts to/stays 0**, including `users` and `rfqs`, which almost certainly have real data. The UI (`src/app/admin/system/page.tsx:316-322`) renders `counts[key] ?? 0`, so this presents as "0" across the board, not a JS-level blank — see Finding 5 for the exact wording caveat.

---

## PHASE 2 — REPRODUCE

### Revenue page
- **Does it fail?** Not independently reproducible here (no admin session available locally — see Environment note). **Code-confirmed:** the exact string reported, `"Failed to load revenue data"`, exists nowhere else in the codebase except this one catch block, and is only ever returned when the 6-query batch throws.
- **Exact error / stack trace:** Not obtainable — the route's `catch` (line 126) does `console.error('[Revenue API] error:', error)` to the server log and returns a generic client message. The real Postgres error is never surfaced to the client, and I have no access to the Vercel/production server log to read what `console.error` captured. **This is itself a fix-plan item** — the route should return enough detail (in server logs, structured) to diagnose without guessing.
- **Root cause (best-evidence hypothesis, not confirmed):** All tables the route touches (`wallet_transactions`, `interaction_memory`, `users`) exist in `prisma/migrations/0001_baseline/migration.sql`, so "table missing" is unlikely if that migration actually ran in production. Two more probable candidates, in order of likelihood: (a) the raw `$queryRaw` against `wallet_transactions` is the only hand-written SQL in the file — hand-written SQL is the most common source of a Prisma throw that a typed query wouldn't produce; (b) Neon connection-pool exhaustion/timeout under the 6-query fan-out (all 6 open near-simultaneously against a serverless Postgres pooler). Neither is confirmable without production log access.

### CRM
- **API response time:** Not independently reproducible (auth wall). Warm, unauthenticated round-trip (401, no query execution) was 60-90ms — confirms the route itself and `requireAdmin()` add negligible overhead; **all** of any real latency happens inside the 2-query DB block once authenticated.
- **DB query time:** Not measurable without DB access. **Code-verified risk factor:** `prisma/schema.prisma`'s `User` model (lines 12-68) carries **zero `@@index` declarations** — not on `trustScore`, `createdAt`, `role`, or `plan`. The route's `orderBy: [{trustScore:'desc'},{createdAt:'desc'}]` (crm/route.ts:43) forces a sort with no supporting index, and the `role`/`plan`/`search` filters (lines 27-36) are unindexed `WHERE` clauses. `RFQ` and `Quote` (used via `_count`) also carry **zero indexes** on `createdBy`/`rfqId`/`supplierId`.
- **Frontend render time:** `src/app/admin/crm/page.tsx` renders a single paginated table off one fetch; no obvious client-side heaviness (not the bottleneck).
- **Caveat on magnitude:** per `CLAUDE.md`'s own gating language ("Phase D gate: 100 verified suppliers", "Investor view unlocks post 500 suppliers"), the live dataset is almost certainly small — tens to low hundreds of rows. A full scan+sort of a table that size, even fully unindexed, would not normally cost 15-20 seconds in Postgres. The missing indexes are a **real, confirmed defect** and a **genuine future-scale risk**, but at today's likely row counts they are probably not sufficient on their own to explain 15-20s. A more likely compounding factor at this scale is Neon serverless cold-start / connection latency, which cannot be measured without production APM access. **Recommend:** enable query logging (`prisma` client `log: ['query']` temporarily, or Vercel/Neon's own slow-query view) in production to get the real number before spending engineering time on an index migration that may not be the dominant cost.

### RFQs
- **API/DB/render time:** same reproduction limits as above.
- **Concretely confirmed defect (not a timing guess):** the `quotes` relation in `rFQ.findMany` (rfqs/route.ts:179-198) has no `take`/limit and includes nested `supplier` and `deal` objects per quote. This is a real, code-level "return everything" pattern — for any RFQ that has accumulated many quotes, the page-20-RFQs response balloons with fully-hydrated nested data that the UI (`src/app/admin/rfqs/page.tsx`) only shows inside a per-RFQ drawer opened one at a time, never as a list. That's unnecessary payload on every single admin RFQ list load, regardless of DB speed.
- **Also confirmed:** 6 total queries per request (2 in the main `Promise.all` + 4 more `count`s for header stats), all against the unindexed `rFQ` model.

### System Health
- **Why are some metrics blank?** Confirmed mechanism (see Phase 1): the 10-query `Promise.all` in `diagnostics/route.ts:112-134` is all-or-nothing. One failing sub-query (most likely `businessLifeEvent` or `marketInsight` — the two models newest to the schema, per `prisma/migrations/0004_business_life_events` and later) zeroes out the entire `counts` object, including `users` and `rfqs`, which are almost certainly non-zero in reality. **Wording nuance:** the UI renders `counts[key] ?? 0` (system/page.tsx:318), so the failure mode is literally "0" displayed, not an empty/blank cell — worth noting since "blank" and "zero" read as the same problem to a non-engineer looking at a dashboard expecting real numbers, but they are different bugs with different fixes.

---

## PHASE 3 — FIX PLAN

| # | Issue | Severity | Root Cause | Proposed Fix | Risk | Est. Effort |
|---|---|---|---|---|---|---|
| 1 | Revenue page: `Failed to load revenue data` | **High** — page is unusable | Unconfirmed exact trigger (no prod log access); code review narrows it to either the hand-written `$queryRaw` against `wallet_transactions` or connection-pool pressure from firing 6 queries at once. Generic catch swallows the real Postgres error. | (a) First: change `console.error('[Revenue API] error:', error)` to also log `error.message`/`error.code` distinctly (or temporarily return it to a founder-only admin client) so the *next* occurrence is diagnosable in one shot, instead of guessing again. (b) Replace the raw `$queryRaw` monthly-revenue query with a typed `groupBy`-based equivalent if Postgres `TO_CHAR`/interval syntax is the actual culprit — typed queries fail in more predictable, more debuggable ways. (c) Reduce the `Promise.all` fan-out from 6 to a smaller number, or sequence the raw-SQL query separately, if pool exhaustion is confirmed. | Low — read-only route, no data-shape change if (a) is done first and used to actually pinpoint the cause before touching (b)/(c). | (a): 15 min. (b)/(c): 1-2 hrs, contingent on what (a) reveals. |
| 2 | CRM/Users page: 15-20s load | **High** — borderline unusable, but exact cause unconfirmed | Confirmed contributing defect: zero indexes on `User.trustScore`/`createdAt`/`role`/`plan` and on `RFQ.createdBy`/`Quote.supplierId` (used by the `_count` sub-selects). Unconfirmed whether this alone explains 15-20s at current (likely small) row counts, or whether Neon connection latency dominates. | (a) Add indexes: `@@index([trustScore, createdAt])`, `@@index([role])`, `@@index([plan])` on `User`; `@@index([createdBy])` on `RFQ`; `@@index([supplierId])`, `@@index([rfqId])` on `Quote`. (b) Before writing the migration, capture one real production timing trace (Vercel function duration + a `prisma` query-log run) to confirm indexes are actually the bottleneck and not Neon cold-start — otherwise (a) ships with no measured improvement. (c) Note: do **not** confuse this with `/api/admin/users` (orphan page, 9 queries incl. one un-batched trailing `await prisma.user.count()` outside any `Promise.all`) — that route has an even clearer defect but isn't reachable from the nav today; low priority unless it gets linked. | Low for the index migration itself (additive, no data change) — standard `prisma migrate` risk (brief lock on index build, negligible at current table size). | Indexes: 30 min + migration review. Production trace capture: 30 min. |
| 3 | RFQ page loads slowly | **Medium-High** | Confirmed: unpaginated `quotes` (+ nested `supplier`, `deal`) on every RFQ row, every page load, only ever displayed one-at-a-time in a drawer. Plus same missing-index issue as #2 on `RFQ`/`Quote`. | (a) Drop the nested `quotes` include from the list query entirely — the list only needs `_count.quotes` (already fetched). (b) Fetch the full `quotes` (with `supplier`/`deal`) lazily, only when the admin opens a specific RFQ's drawer (`GET /api/admin/rfqs/[id]` or a `?include=quotes` param on click) instead of eagerly on every list page. (c) Same indexes as #2. | Low-Medium — requires a small frontend change to fetch quotes on drawer-open instead of expecting them already present in `rfq.quotes`; must confirm `submitConciergeQuote`'s refresh-drawer flow (rfqs/page.tsx:172) still works against the new shape. | Backend: 30 min. Frontend (lazy-load drawer data): 1-1.5 hrs. Indexes: shared with #2. |
| 4 | Production RFQ table contains "TEST - DO NOT USE" entries | **Low** (data hygiene, not a functional bug) | **Root cause fully identified — see Phase 4.** One documented, intentional QA row (`cms1q3s4o0001id04ik1xk2na`) created 2026-07-26 during a live production smoke test of the RFQ-creation bug fix (`docs/smoke-test-2026-07-26.md`), already soft-cancelled via the real admin UI. Not a seed-script or data-integrity defect — the app has no hard-delete path by design (`docs/smoke-test-2026-07-26.md:104`). | No code fix needed. Optional: add an `isSeeded`-style `isTestData: Boolean @default(false)` flag (or reuse `isSeeded`) so admin list/count views can filter test rows out of public-facing or investor-facing aggregates by default, and retroactively flag this one row. | Low if added as an optional, default-false column with a manual backfill of the one known row. | 30-45 min if pursued; can also just be closed as "known, already cancelled, no action needed." |
| 5 | System Health shows blank/zero metrics | **Medium** | Confirmed: `Promise.all` of 10 unrelated count queries is all-or-nothing — one failing query (most likely `businessLifeEvent` or `marketInsight`, the newest models) zeroes every metric including unrelated, healthy ones (`users`, `rfqs`). | Replace the single `Promise.all` with `Promise.allSettled`, defaulting each individual count to `0` **only for the queries that actually failed**, and surface which specific sub-query failed (e.g. an `errors: string[]` field per count) so "0 users" (real DB problem) is distinguishable from "0 life events" (just an unpopulated newer feature). | Low — purely additive error handling, no schema change. | 45 min - 1 hr. |

---

## PHASE 4 — TEST DATA REVIEW

Direct DB access to enumerate current rows was not available in this session (see Environment note). What follows is everything determinable from the repo itself — git history and committed documentation — which is authoritative for provenance even without a live query.

### `TEST` / `DO NOT USE`
- **One confirmed, exact row**, from `docs/smoke-test-2026-07-26.md` (still present in the working tree, introduced in commit `d72a231a`, dated 2026-07-26):
  - **ID:** `cms1q3s4o0001id04ik1xk2na`
  - **Title:** `TEST - DO NOT USE - Smoke Test RFQ (corrected types)`
  - **Category:** `steel-metal`
  - **Provenance:** created live via `POST https://www.vyaparsethu.com/api/rfq/create` during an isolated, intentional production smoke test proving a validation-schema fix (string-vs-number budgets, lowercase-vs-uppercase urgency enum).
  - **Status:** confirmed changed `ACTIVE → CANCELLED` via the real admin UI ("Close RFQ" action) as documented cleanup. **Still exists as a row** — the app has no hard-delete path anywhere (`DELETE /api/admin/rfqs` and the admin "Close RFQ" button both only soft-cancel), by explicit design decision, not an oversight.
  - **Classification: test, not seeded, not organic production data.** Already inactive (`CANCELLED`).
- No other literal `"TEST"` or `"DO NOT USE"` strings appear in any seed script, migration, or committed test-data generator (`grep`-checked across `src/`, `prisma/`, `scripts/`) — the legitimate seed mechanism (`src/app/api/admin/seed-rfqs/route.ts`) generates realistic, non-test-labeled titles (e.g. "Cotton Fabric — Bulk Supply Required") and is a separate, intentional data source, unrelated to this finding.
- Several load/integration-test *code* files (`src/lib/integration-testing-executor.ts`, `src/lib/load-testing-system.ts`, `src/lib/real-integration-testing.ts`, `scripts/test-user-dashboard.js`) construct RFQs titled `"Test RFQ"` (no "DO NOT USE") as part of their test payloads. **Could not confirm or rule out** whether any of these have ever been run against the production API — if so, they would leave additional, differently-titled test rows. Requires a live DB query (`SELECT id, title, status FROM rfqs WHERE title ILIKE '%test%'`) to fully enumerate — recommended as a same-day follow-up by someone with production DB access.

### `verification`
- No git-history or seed-script evidence of an RFQ titled/described with "verification" as test data. Several *documentation* files use the word (`BUYER_VERIFICATION_POLICY.md`, `TRUST_AND_NOTIFICATION_VERIFICATION_REPORT.md`) but none reference a specific leftover RFQ row.
- **Not verifiable from the repo alone** — requires a live DB text search.

### `slug fix`
- No commit or doc uses this exact phrase for RFQ data. The closest match is commit `7af8313b` (`fix(rfq): resolve categoryId by slug, not name, on RFQ creation`, 2026-07-28) — a **code** fix for category-slug resolution on RFQ creation, not a data-cleanup event, and it does not document creating or leaving behind any test RFQ row.
- **Not verifiable from the repo alone** — requires a live DB text search.

**Bottom line for Phase 4:** one exact, fully-documented, already-inactive test row is confirmed by name and ID. The other two keyword categories (`verification`, `slug fix`) have no supporting evidence in the codebase and cannot be confirmed or denied without direct database read access, which this session did not have. **No rows were deleted or modified.**

---

## PHASE 5 — PERFORMANCE REVIEW

Ranked by expected impact, all confirmed by direct code reading (not inferred):

1. **Zero indexes on `User`, `RFQ`, `Quote`, `WalletTransaction`, `InteractionMemory`.** Confirmed via `prisma/schema.prisma` — a full-text grep for `@@index` across the file shows these five models have none, while newer models (`BusinessLifeEvent`, `KycDocument`, `OutreachRecipient`, etc.) do. This is the single highest-leverage, lowest-risk fix: additive indexes on `User(trustScore, createdAt)`, `User(role)`, `User(plan)`, `RFQ(createdBy)`, `RFQ(status)`, `RFQ(createdAt)`, `Quote(rfqId)`, `Quote(supplierId)`, `WalletTransaction(type, createdAt)`. Directly reduces cost of Finding 2, Finding 3, and (for the raw monthly-revenue query) Finding 1.
2. **Unbounded nested include on `/api/admin/rfqs`.** Every RFQ's full `quotes` array (with nested `supplier`/`deal`) is fetched on every list page load, for data only ever shown one RFQ at a time in a drawer. Straightforward win: drop from the list query, fetch on drawer-open.
3. **All-or-nothing `Promise.all` in three of the four audited routes** (revenue's 6-query batch, diagnostics' 10-query batch, rfqs' first 2-query batch) means one slow or failing query stalls/breaks unrelated ones. `Promise.allSettled` with per-query fallbacks (already recommended for Finding 5) is the general-purpose fix and should be considered for revenue and rfqs too, not just diagnostics.
4. **`/api/admin/users` (orphan route, not linked in nav) runs 9 total queries per request**, including a `await prisma.user.count()` for `totalUsers` that sits **outside** any `Promise.all` (`src/app/api/admin/users/route.ts:72`), forcing a fully sequential extra round-trip after the other 8 have already resolved. Not currently reachable from the admin nav, so lower priority than the other findings — but the exact same class of bug as Finding 2, and worth fixing in the same pass if this file stays in the codebase.
5. **Client-side rendering is not a meaningful contributor to any of the four pages.** All four (`revenue`, `crm`, `rfqs`, `system`) are simple, single-fetch, paginated-table client components with no redundant re-fetching loops, no missing memoization causing visible thrash, and no obviously expensive client computation. `src/app/admin/rfqs/page.tsx:204-208` does an extra client-side `.filter()` over the already-server-filtered `rfqs` array, which is redundant but operates on at most 50 rows (`LIMIT = 50`) — negligible.
6. **`orderBy: { [sortBy]: sortOrder }` in `/api/admin/rfqs`** builds a dynamic Prisma sort key straight from a query param with no field whitelist (`src/app/api/admin/rfqs/route.ts:141,169`). Not a performance issue at present (default value is safe), but flagged here since an unrecognized/invalid `sortBy` would currently throw a Prisma error rather than fail gracefully — worth a small whitelist guard alongside the other RFQ fixes.

---

## OUTPUT — Verification status of each original audit finding

1. **Revenue page shows "Failed to load revenue data"** — **PARTIALLY VERIFIED**. The exact error string is confirmed to originate from a single, real code path (`src/app/api/admin/revenue/route.ts:127`) that is only reachable when the route's 6-query DB batch throws. Could not reproduce the live exception or obtain the underlying Postgres error — no admin credentials or DB access were available in this session (see Environment note). The claim is consistent with the code; the specific trigger is unconfirmed.

2. **CRM/Users page loads in approximately 15-20 seconds** — **PARTIALLY VERIFIED**. Confirmed the nav-reachable "CRM / Users" page is `/admin/crm` → `/api/admin/crm` (2 DB queries), and confirmed a real, code-level defect (zero indexes on the sorted/filtered/counted columns) that would degrade with scale. Could not independently measure 15-20s — no admin session available — and at the dataset's likely current small size, missing indexes alone may not fully explain that magnitude; Neon connection latency is a plausible additional factor that needs a production trace to confirm.

3. **RFQ page loads slowly** — **PARTIALLY VERIFIED**. Confirmed a real, unambiguous over-fetching defect (unbounded nested `quotes`+`supplier`+`deal` on every list-page load, 6 total unindexed queries per request). Could not measure actual load time without an admin session, so the reported "slow" cannot be pinned to an exact number, but the code-level cause is solid and independent of any timing measurement.

4. **Production RFQ table contains "TEST - DO NOT USE" entries** — **VERIFIED**. One exact row confirmed by ID (`cms1q3s4o0001id04ik1xk2na`) via committed documentation (`docs/smoke-test-2026-07-26.md`) and its introducing commit (`d72a231a`). Confirmed already soft-cancelled (`status: CANCELLED`), not deleted (app has no hard-delete path by design). Whether additional, differently-worded test rows exist could not be confirmed or ruled out without live DB access.

5. **System Health page shows several blank metrics** — **PARTIALLY VERIFIED**. Confirmed the exact structural cause in code: an all-or-nothing `Promise.all` of 10 unrelated count queries means one failing query zeroes every metric, including healthy/unrelated ones. Note the precise failure mode is "0" rendered, not a literally empty/blank UI element — a real bug either way, but worth distinguishing when scoping the fix. Which specific sub-query fails in production (if any currently do) is unconfirmed without server log or DB access.
