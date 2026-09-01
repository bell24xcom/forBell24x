# VS-ADMIN-FIX-IMPLEMENTATION-01

**Date:** 2026-09-01
**Base audit:** `docs/audits/VS-ADMIN-PRODUCTION-AUDIT-FIX-01.md`
**Branch:** `fix/admin-audit-phase1-4` (off `sprint/stdv-p3-p5-trust-and-lead-unlock`)
**Scope discipline:** only findings with source-code-level, high-confidence evidence were touched. No production data was deleted, no RFQs were deleted, no seeded records were modified, no auth logic changed, no payment logic changed, no business logic changed beyond the query/loading-strategy fixes described below. `prisma/schema.prisma` was **not** modified — Phase 4's index recommendation is documentation only, per instruction.

---

## PHASE 1 — System Health: graceful degradation

**File:** `src/app/api/admin/system/diagnostics/route.ts`

**Before:** all 8 health counts + 2 auxiliary Business-Operating-Memory queries ran in a single `Promise.all`. `Promise.all` fails fast — one rejected query (e.g. `businessLifeEvent` or `marketInsight`, the newest models) threw the whole block, and the `catch` left every count at its zero-initialized default, including `users` and `rfqs`, which are essentially guaranteed to be non-zero. That is the exact mechanism the audit's Finding 5 identified.

**After:**
- The connectivity probe (`SELECT 1`) stays isolated and unchanged — it alone decides `database.connected`/`database.error`.
- The 8 counts now run through `Promise.allSettled` over a small per-metric query table (`metricQueries`), so a rejection is attributed to exactly one key and defaults **only that key** to `0`.
- The 2 auxiliary BOM queries (distinct event types, latest event) are similarly isolated via their own `Promise.allSettled` calls, run in parallel with the 8 counts (no added latency vs. before).
- New, purely **additive** response fields: `health.degraded: boolean` and `health.countErrors: Record<string,string>` — a per-key error message for whatever failed. Existing fields (`health.counts`, `health.bom`, `health.database`) keep their exact prior shape and meaning, satisfying "preserve current UI contract."
- Frontend (`src/app/admin/system/page.tsx`): a metric that failed now renders `—` (amber, with a title tooltip carrying the error) instead of a bare `0`, and shows a small warning icon next to its label — additive rendering only, layout/labels/structure unchanged for the happy path.

**Requirement check:**
- ✅ One failing metric no longer blanks all metrics (verified by code path: each of the 8 counts is now independently `.allSettled`, not chained through a single fail-fast `Promise.all`).
- ✅ Graceful degradation — a failed metric defaults to `0` and is flagged in `countErrors`, not thrown.
- ✅ Partial results returned on partial failure.
- ✅ UI contract preserved — all prior fields present, unchanged shape; new fields are optional/additive.

---

## PHASE 2 — RFQ admin listing: lazy quote loading

**Files:** `src/app/api/admin/rfqs/route.ts`, `src/app/admin/rfqs/page.tsx`

**Before:** `GET /api/admin/rfqs` (the list endpoint, used on every page load/filter/search/refresh) included the **full** `quotes` relation — with nested `supplier` and `deal` sub-selects — for every RFQ on the page, unpaginated. That data was only ever displayed for one RFQ at a time, inside a drawer opened by clicking "View."

**After:**
- The list query (`GET /api/admin/rfqs` without an `id` param) no longer includes `quotes` at all — it keeps `_count: { quotes: true }`, which is all the table view ever renders.
- A new branch of the **same route file** (`GET /api/admin/rfqs?id=<rfqId>`) returns one RFQ with its full `quotes` (+ `supplier`, `deal`). This is a new query path, not a new serverless function — it lives in the existing `src/app/api/admin/rfqs/route.ts`, respecting the project's 12-function Vercel Hobby-tier cap (`CLAUDE.md`).
- Frontend: clicking "View" (`openDrawer`) opens the drawer immediately with the already-fetched list row (fast, no flash of empty UI) and fetches the quote detail in the background, showing a small spinner in the quotes section while it loads. A request-id ref guards against a slower, earlier fetch overwriting a newer one if the admin opens two RFQs in quick succession.
- The two actions that used to rely on the list response to refresh the drawer's quotes (submitting a concierge quote; marking a deal complete off-platform) now call a dedicated `refreshDrawerDetail()` that re-fetches just that one RFQ's detail, in parallel with the list refresh where applicable — so the drawer still updates correctly after either action.
- Also fixed while in this file, low-risk and directly adjacent: `sortBy` is now checked against a whitelist of actual RFQ scalar fields before being used as a Prisma `orderBy` key (previously any string was passed straight through, which would throw on an unrecognized field — audit Phase 5, item 6).

**Requirement check:**
- ✅ Unnecessary eager loading removed from the list query.
- ✅ Quote details are not loaded on initial page load — confirmed via the list branch's `include` (no `quotes` key) vs. the separate `id`-scoped branch.
- ✅ Quote details load only when the drawer opens (`openDrawer` → `fetchRFQDetail`).
- ✅ All existing functionality preserved: search, filter, pagination, export CSV (unaffected — uses only list-row fields), Extend/Close RFQ, concierge quote submission, off-platform deal settlement. Verified by re-reading every call site that touched `drawer.quotes` or relied on the old list-carries-quotes refresh pattern and updating each one deliberately (not just the render path).

---

## PHASE 3 — Revenue: root-cause investigation + fix

**File:** `src/app/api/admin/revenue/route.ts`

### Every path that can trigger `"Failed to load revenue data"`

There is exactly **one** place this string exists in the codebase: the `catch` block of this route (previously line 127). Tracing what could reach it: the route ran 6 Prisma queries in a single `Promise.all` — 2 `aggregate`s, 1 `groupBy`, 2 `findMany`s, and 1 hand-written `$queryRaw`. **Any** of the 6 throwing would land in that one `catch` and produce this exact message, with the real Postgres error going only to `console.error` (server-side log, not accessible in this session — see the base audit's Environment note on why live reproduction was blocked).

Root-cause candidates, ranked by how the code narrows them:
1. **The `$queryRaw` monthly-revenue query** (highest suspicion) — the *only* hand-written SQL in the route. Hand-written SQL is categorically more fragile than a typed Prisma query: it depends on exact Postgres function behavior (`TO_CHAR`, `AT TIME ZONE`), exact column names surviving independently of the Prisma schema's `@map`, and isn't type-checked against the schema the way `aggregate`/`groupBy`/`findMany` are.
2. **Neon connection-pool pressure** from firing all 6 queries at once against a serverless Postgres pooler.
3. **Malformed `days` query param.** `parseInt(searchParams.get('days') ?? '30')` on a non-numeric input (e.g. `?days=abc`) produces `NaN`; the original code's `Math.max(1, NaN)` / `Math.min(90, NaN)` both evaluate to `NaN`, producing an `Invalid Date` for `since` — which Prisma may reject when serializing the `createdAt: { gte: since }` filter. The frontend itself always sends a valid `7|30|90`, so this would only trigger from a direct/malformed API call (e.g. a monitoring probe or manual testing), not normal page use — but it's real and cheap to close.

**I did not guess which of these is the actual live cause** — I could not reach the authenticated code path in this session (no working admin credentials in `.env`/`.env.local`, and the sandbox correctly blocks minting one — same restriction documented in `docs/smoke-test-2026-07-26.md`). What I implemented instead is a fix that is:
- **Obvious and low-risk** per the instruction to only fix what's obvious-and-low-risk, or otherwise document the blocker (documented above), and
- **Structural, not a guess** — it removes the single highest-suspicion component (the raw SQL) entirely and makes every remaining failure mode non-fatal to the page, rather than betting on one specific cause.

**Fix implemented:**
1. **Removed the raw SQL.** The monthly-revenue query is now a typed `walletTransaction.findMany({ where: { type: 'CREDIT', createdAt: { gte: sixMonthsAgo } }, select: { amount, createdAt } })`, grouped into per-month totals in JS. Identical output shape (`{ month, total, txnCount }[]`), UTC month truncation preserved (`.toISOString().slice(0,7)` matches the old query's `AT TIME ZONE 'UTC'`).
2. **Per-query isolation**, mirroring the Phase 1 fix: each of the 6 queries runs through a `safeQuery(key, fallback, run)` helper — a failure defaults just that one metric (to `0`/`[]`) and is recorded in a new, additive `errors: Record<string,string>` field, logged server-side with `error.name`/`error.code`/`error.message` (previously only a bare `error.message` via generic `console.error`, with no code/name — the exact detail needed to diagnose *next* time was being discarded).
3. **`success: false` is now reserved for total failure** (all 6 queries failed — the strong signal of a real outage, not one flaky query). Any partial failure (1-5 of 6) now returns `success: true` with real data for whatever succeeded, a `degraded: true` flag, and the specific `errors`. **This directly resolves the reported symptom in the most likely scenario** (one query intermittently failing) — the page renders instead of showing nothing.
4. **Malformed `days` param fixed**: `Number.isFinite(parsedDays) ? parsedDays : 30` guards against the `NaN`/`Invalid Date` path in candidate #3 above.
5. Frontend (`src/app/admin/revenue/page.tsx`): added an additive amber banner shown only when `data.degraded` is true, naming which metrics failed — the rest of the page (whatever did load) still renders underneath it.

**If the live cause turns out to be #2 (pool pressure) and not #1 (raw SQL):** the per-query isolation in this fix still helps — a pool-timeout on one query no longer takes down the whole response — but the underlying pressure isn't reduced. **Exact blocker for closing this with full certainty:** no access to production server logs or an authenticated admin session in this environment. **Recommended next step for whoever has that access:** deploy this fix, then if `degraded: true` / `errors` ever appears in a real response, the `errors` object names the exact failing query and its Postgres error code — closing the loop this investigation couldn't close alone.

---

## PHASE 4 — CRM performance audit (documentation only — no migration applied)

**File audited:** `src/app/api/admin/crm/route.ts` (the actual nav-reachable "CRM / Users" route — see the base audit's disambiguation of this from the separate, unlinked `/api/admin/users`).

**Profiling constraint (disclosed, not glossed over):** no live database access was available in this session (see base audit's Environment note — the sandbox blocks direct DB scripts and synthetic admin-JWT minting). What follows is `EXPLAIN`-style reasoning from the schema and query shape, not a measured query plan. Recommend running actual `EXPLAIN ANALYZE` against production/staging before applying anything below.

### Missing indexes — confirmed via `prisma/schema.prisma`

A full grep for `@@index` in the schema shows the following models used by the CRM route carry **zero** non-unique indexes:

| Model | Column(s) used by the CRM route | Used for |
|---|---|---|
| `User` | `trustScore`, `createdAt` | `orderBy: [{trustScore:'desc'},{createdAt:'desc'}]` — every request sorts the *entire* `users` table on these two columns before paging |
| `User` | `role` | optional `where.role` filter |
| `User` | `plan` | optional `where.plan` filter |
| `RFQ` | `createdBy` | `_count: { select: { rfqs: true } }` per returned user |
| `Quote` | `supplierId` | `_count: { select: { quotes: true } }` per returned user |

### Proposed migration (recommendation only — not applied)

```prisma
model User {
  // ...existing fields...
  @@index([trustScore, createdAt])
  @@index([role])
  @@index([plan])
}

model RFQ {
  // ...existing fields...
  @@index([createdBy])
}

model Quote {
  // ...existing fields...
  @@index([supplierId])
  @@index([rfqId])   // also benefits the Phase 2 RFQ-detail lookup (GET ?id=)
}
```

Equivalent raw SQL, for reference (what `prisma migrate dev` would generate):

```sql
CREATE INDEX "users_trustScore_createdAt_idx" ON "users" ("trustScore" DESC, "created_at" DESC);
CREATE INDEX "users_role_idx" ON "users" ("role");
CREATE INDEX "users_plan_idx" ON "users" ("plan");
CREATE INDEX "rfqs_created_by_idx" ON "rfqs" ("created_by");
CREATE INDEX "quotes_supplier_id_idx" ON "quotes" ("supplier_id");
CREATE INDEX "quotes_rfq_id_idx" ON "quotes" ("rfq_id");
```

### Why this is not applied in this PR

1. The instruction for this phase is explicit: "Do NOT apply schema migrations yet."
2. The base audit already flagged (Phase 2 reproduction notes) that the live dataset is likely small (`CLAUDE.md`'s own gating language — "100 verified suppliers" gate, "500 suppliers" investor-view gate) — at that scale, these indexes are a **correctness/scale investment**, not a guaranteed fix for today's reported 15-20s. Applying them without a production trace risks the team crediting the index migration for a fix that was actually something else (Neon cold-start latency, most likely — see the base audit).
3. **Recommended sequencing for whoever applies this:** capture one real production timing trace first (Vercel function duration for `/api/admin/crm`, or a temporary `prisma` client `log: ['query']`) to confirm where the 15-20s actually goes, *then* apply this migration and re-measure. That turns this from a guess into a verified fix.

No other CRM-route defect was found worth flagging beyond what's already indexed above — the route's own query shape (2 queries in one `Promise.all`: `findMany` + `count`) is already sound; it is not the 9-query, partially-un-batched pattern found in the separate, nav-unreachable `/api/admin/users` route (out of scope here — not linked from the admin nav, so not the page users actually hit).

---

## Deliverables

### 1. Code changes — summary

| File | Change |
|---|---|
| `src/app/api/admin/system/diagnostics/route.ts` | Replaced fail-fast `Promise.all` of 8 counts + 2 BOM queries with per-metric `Promise.allSettled` isolation; added additive `health.degraded` / `health.countErrors`. |
| `src/app/admin/system/page.tsx` | Render a failed metric as `—` + warning icon (additive; happy path unchanged). Added optional `degraded`/`countErrors` to the `Diagnostics` type. |
| `src/app/api/admin/rfqs/route.ts` | List query no longer includes `quotes`; added an `?id=` branch returning one RFQ's full detail on demand; added a `sortBy` whitelist. |
| `src/app/admin/rfqs/page.tsx` | Drawer now lazy-loads quote detail on open (`openDrawer`/`fetchRFQDetail`/`refreshDrawerDetail`); `RFQ.quotes` is now optional; loading spinner in the quotes section; race-guarded via a request-id ref. |
| `src/app/api/admin/revenue/route.ts` | Removed the route's only raw SQL (JS-side month grouping instead); each of the 6 queries isolated via a `safeQuery` helper; `success:false` reserved for total failure; added additive `degraded`/`errors`; fixed `NaN`/`Invalid Date` on a malformed `days` param. |
| `src/app/admin/revenue/page.tsx` | Added an additive amber "degraded" banner naming which metrics failed to load; optional `degraded`/`errors` added to the `RevenueData` type. |
| `docs/audits/VS-ADMIN-FIX-IMPLEMENTATION-01.md` | This report. |

### 2. Files changed

```
src/app/api/admin/system/diagnostics/route.ts
src/app/admin/system/page.tsx
src/app/api/admin/rfqs/route.ts
src/app/admin/rfqs/page.tsx
src/app/api/admin/revenue/route.ts
src/app/admin/revenue/page.tsx
docs/audits/VS-ADMIN-FIX-IMPLEMENTATION-01.md   (new)
```
`prisma/schema.prisma` — **not modified** (Phase 4 is a recommendation only, per instruction).

### 3. Performance impact

- **System Health:** same query count and shape as before (8 + 2, all parallel) — no latency change. The fix is correctness (no more false "0"s), not speed.
- **RFQ list:** every list page load now returns strictly less data — no more full `quotes` (+ `supplier` + `deal`) payload for every RFQ on the page. For an RFQ with many quotes, this removes a payload that used to scale with quote count from a request that only ever needed a count. Opening a drawer adds one small, targeted request (a single-row `findUnique` by primary key) that didn't exist before, in exchange.
- **Revenue:** query count unchanged (still 6, still parallel); the raw SQL was replaced with a typed `findMany` + in-memory grouping over at most 6 months of `CREDIT` transactions — at the dataset scale implied by `CLAUDE.md`'s supplier-count gating, this is not expected to be materially slower than the SQL-side `GROUP BY` it replaces, and removes a class of failure (raw-SQL/schema-drift errors) outright.
- **CRM:** no code change in this PR — Phase 4 is a recommendation. Expected impact of the proposed indexes (not yet applied): faster `ORDER BY trustScore, createdAt` and faster per-row `_count` sub-selects once table size grows past what an unindexed scan handles comfortably; magnitude unverified without a production trace (see Phase 4 caveats).

### 4. Risks

- **Revenue route behavior change:** the route now returns HTTP 200 with `success: true` in more cases (partial failure) than before (which returned 500 on any failure). Any external caller that specifically branches on HTTP status rather than the `success` field would see different behavior. Grep of the codebase found no other consumer of this route besides `src/app/admin/revenue/page.tsx`, which already branches on `json.success`, not status code — risk assessed as low, but worth a final check by someone with access to search production logs/analytics for other callers.
- **RFQ drawer race condition:** guarded with a request-id ref (see Phase 2), but not exhaustively tested against a live backend in this session (no admin credentials available — see base audit). Recommend a manual smoke test (open RFQ A, immediately open RFQ B, confirm B's quotes — not stale A data — end up displayed) before merging.
- **`sortBy` whitelist:** narrows accepted values to known RFQ scalar fields. If any other part of the codebase relies on sorting the admin RFQ list by a field not in the whitelist, that request would now silently fall back to `createdAt` instead of erroring. Grepped for other callers of `GET /api/admin/rfqs` with a `sortBy` param — none found outside `src/app/admin/rfqs/page.tsx`, which never sends one (relies on the default).
- **None of the four changed API routes were tested against a live authenticated session** in this environment (see Environment/reproduction constraints in the base audit — same sandbox restriction applies here). All four were verified via: (a) `tsc --noEmit` — zero new type errors introduced by these files (grep-diffed against the full-repo baseline, which has only pre-existing, unrelated errors), (b) `eslint` — zero new errors, one pre-existing warning pattern unchanged, (c) a running local `next dev` server hit unauthenticated on all four routes — clean `401`s (not `500`s), confirming the code compiles and runs up to the auth boundary. Authenticated end-to-end verification is the responsibility of whoever has production/staging admin access.

### 5. Rollback plan

Each phase is an independent, single-file-pair change and can be reverted independently via `git revert` of this PR's commits, or by reverting individual files:

- **System Health:** `git checkout <pre-PR-sha> -- src/app/api/admin/system/diagnostics/route.ts src/app/admin/system/page.tsx` — restores the fail-fast `Promise.all` behavior. No data migration involved; safe to revert at any time.
- **RFQ listing:** `git checkout <pre-PR-sha> -- src/app/api/admin/rfqs/route.ts src/app/admin/rfqs/page.tsx` — restores eager quote-loading on the list. No data migration involved; safe to revert at any time.
- **Revenue:** `git checkout <pre-PR-sha> -- src/app/api/admin/revenue/route.ts src/app/admin/revenue/page.tsx` — restores the raw-SQL monthly query and fail-fast `Promise.all`. No data migration involved; safe to revert at any time.
- **CRM indexes:** not applied — nothing to roll back. If a future PR applies the Phase 4 migration and needs to roll back, standard `prisma migrate` down/drop-index procedure applies (indexes are additive and non-destructive to drop).

No database schema was touched by this PR, so there is no migration to roll back for Phases 1-3 — every change is application-code-only.

### 6. PR

Branch `fix/admin-audit-phase1-4` → target `main`. See PR description for the summary; this document is linked from it as the full technical record.
