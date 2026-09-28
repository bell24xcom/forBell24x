# MA-01 Marketplace Activation — Implementation Report

**Date:** 2026-09-28 · **Repo:** VyaparSethu site (`Projects/bell24h`) · **Work tree:** `C:\Users\Sanika\Projects\bell24h-ma01` on new local branch `sprint/ma-01-activation`, cut from `origin/main` @ `299f60fe`
**Not committed. Not pushed. No PR. No database write. No message sent.** Your dirty checkout (`fix/seo-indexing-issues`, 55 changed files, 22 commits behind `main`) was not touched.
**Source of truth:** the five MA-01 plans. **PR #59 was not used.** Constraints honoured: no Twilio, no MSG91 WhatsApp, no Apify, no scraping, no RFQ-matching / Trust / SHAP-LIME / MiroFish work (matcher untouched).

## 1. Verdict

**Phases 2, 3, 4 and 5 are implemented, unit-tested, and their read-model was run against the real data (read-only) — but nothing has been deployed or executed end to end.** The new admin API blocks and pages were type-checked but never run in a browser or against a live admin session. The marketplace is **not certified**.

| Certification asked for | Verdict | Basis |
|---|---|---|
| **Marketplace Activation** | **Logic verified; NOT production-certified** | 27 fixture tests + 6 mutation checks; the stage rules were run on the 1,351 real supplier rows and reproduce the plan baselines (§4). Routes/pages were not executed; nothing deployed. |
| **Communication Hub** | **NOT certified** | Unchanged from CH-02 in Bell24h-OS (no real provider send, migrations unapplied, no scheduler). This sprint sent nothing. |
| **Supabase** | **NOT certified — not verifiable here** | This site uses **Neon**, not Supabase. Bell24h-OS's Supabase vault cause is still waiting on your SQL result. |

| Gate | Result |
|---|---|
| New tests `npm run test:marketplace` | **27 / 27** |
| Existing suites `test:security` / `test:outreach` / `test:quote-token` / `test:jwt-fail-closed` | **51 / 25 / 9 / 8 pass** (no regression) |
| Mutation checks (break → tests must fail → restore) | **6 / 6 caught** (route stops alerting ×2, seeded-RFQ guard, idempotency, seed exclusion, "not measurable" marker) |
| Type-check of every new/changed file | **No errors in code I wrote.** 4 errors remain on untouched lines (`orchestration.ts:102`, `api/quote/route.ts:67`, `onboarding/route.ts:89,96` — pre-existing; the repo builds with `ignoreBuildErrors: true`). |
| `next build` | **NOT RUN.** `npm run build` executes `prisma migrate deploy` (a database action); `build:ci` runs `prisma generate` into a `node_modules` shared with your other checkout. Run it in CI. |
| Read-only Prisma query shapes of `pipeline.ts` and the quote-notify loaders against the live schema | **All execute** (incl. the JSON-path idempotency filter); counts match the plan (86 RFQs, 19 quotes, 0 buyer alerts, 3 deals) |

## 2. Corrections to the plans and the brief (found in the code — please read)

1. **`claimed_at` is not null because of `claim/complete`.** That route already sets `claimedAt`. The **30 seed accounts** are created claimed with no `claimedAt` by `POST /api/admin/seed-suppliers` (fixed for future runs). The **other 24** claimed accounts have **no writer in current code** — a historic path I cannot identify. So WI-4's "fix the cause of null `claimed_at`" is only partly possible; existing rows are **not** backfilled (that would fabricate timing).
2. **Five quote-creating routes, not four.** `POST /api/admin/rfqs` (`submit-concierge-quote`, staff-sourced) is the fifth. All five are wired and a test now fails if a sixth appears unwired.
3. **`POST /api/supplier/quotes` already emailed the buyer** (non-seeded RFQs) but never created the in-app `QUOTE_RECEIVED`. Its inline email was replaced by the shared helper (which does both) — otherwise the buyer would get two emails.
4. **The "New Quote — Bell24h" brand defect in the plan does not exist on `main`** (header already says VyaparSethu). The hardcoded `https://bell24h.com/negotiation` button **did** exist and now points to `${SITE_URL}/rfq/{id}`.
5. **Signed invitations already stamp `claim_invitations.viewed_at`** when resolved; only legacy bare-token links were untracked, so only those get the new `claim_link_opened` event.
6. **"Fix Admin Diagnostics: Direct DB Connection (Admin) = unauthenticated"** is a **Bell24h-OS** page, not part of this site. It was fixed and committed in the OS repo during CH-02 (commit `361a0f6`, branch `sprint/ch-02-campaigns`).
7. **Buyer alerts for the 19 existing quotes are not backfilled** and will keep showing "0 of 19"; the dashboard says so instead of hiding it.

## 3. DATABASE_URL / DIRECT_URL diagnosis (read-only, credentials never printed)

| Source | Endpoint | Result |
|---|---|---|
| `.env` `DATABASE_URL` | Neon **pooler** (`ep-super-wind-a1c1ni4n-pooler…`, `sslmode=require&channel_binding=require`) | **FAIL — Postgres 28P01 "password authentication failed"** |
| `.env.local` `DIRECT_URL` | same Neon project, non-pooler | **OK** (`SELECT 1`) |
| `.env.production` `DATABASE_URL` / `DIRECT_URL` | same project | **both FAIL 28P01** (these two share one credential) |

**Root cause: stale credentials, not a URL/format/network problem.** Three different credential sets exist for the same Neon database; only the one in `.env.local` is current (consistent with a password rotation — see the untracked rotation/exposure reports in your checkout). `.env` and `.env.production` were not updated. Because Prisma's CLI reads only `.env` while Next reads `.env.local` over `.env`, `prisma migrate` fails while some app reads work.
**Fix (yours — I will not handle credentials):** put the current credential into `.env` `DATABASE_URL` (pooled host, `-pooler`) and `DIRECT_URL` (non-pooled), and **check Vercel Production's `DATABASE_URL`/`DIRECT_URL`** — if they match the stale `.env.production`, production reads are failing. I cannot see Vercel's values from here. `.env.preview.pulled` (untracked) points at a **different** database (a Supabase pooler) and holds credentials: never commit it.

## 4. Completed

**Phase 2 — Supplier Onboarding Pipeline (derived, no schema change, no new route)**
- `src/lib/discovery/pipeline-core.ts` (pure): the nine stages, duplicate groups (normalised company / phone-10 / email / GST, deterministic canonical member), suppression by id **and** phone, the matcher's newest-200 window for RFQ_ELIGIBLE, seed exclusion with a visible banner, "not measurable" markers, data-quality counters.
- `src/lib/discovery/pipeline.ts`: read-only DB reader (one row per supplier account; fine at ~1.4k, move to SQL if it grows to tens of thousands).
- **Events:** `claim_link_opened` (legacy claim page), `profile_completed` (first onboarding completion only) added to the existing event list; seed route now sets `claimedAt`.
- **Admin visibility:** `GET /api/admin/discovery/invitation?include=pipeline[&includeSeed=1]` and the existing Invitation Engine page now show the pipeline (legacy discovery-only panels kept, labelled).

**Phase 3 — Conversion dashboard:** funnel with step rates; **by source** and **by category** cohort tables; claimed-after-invite; invitation performance (campaign vs legacy, cadence exhausted); all on the same page.

**Phase 4 — RFQ remediation (from current `main`)**
- `lib/quote-notify.ts` (pure, injected deps) + `lib/quote-notify-runtime.ts`: never throws; **idempotent per quote**; skips seeded RFQs / self-quotes / missing buyers with a stated reason; reports `notified` only after **verifying the notification row exists** (orchestration swallows its own DB errors); staff-sourced quotes are labelled and the supplier is not told they "submitted"; one structured log line per outcome.
- Wired into all **five** routes (fire-and-forget, after the create). `onQuoteSubmitted` fixed (staff label, RFQ link).
- **Route coverage audit** is a test: it fails if a quote-creating file is added without the helper, if `onQuoteSubmitted` gains a second caller, or if the duplicate email returns.

**Phase 5 — Marketplace Activation Dashboard:** new `/admin/cockpit/marketplace-activation` (linked from the cockpit) reading `GET /api/admin/launch-metrics?include=activation[&includeSeed=1]` (existing fields unchanged; on failure `activation:null` + `activationError`). KPI strip, supplier health, RFQ readiness, outreach performance, RFQ lifecycle, supply coverage vs the 50-per-category target, and the four alerts from the spec (+ a buyer-alert gap alert). Thresholds/targets are labelled **proposals**.

**Real-data check (read-only; live rows through `pipeline-core`)** — reproduces the plan: 1,351 discovered · 30 seed · **272 invited** · **54 / 24 claimed** (all / excl. seed) · **33 / 3 completed** · **187 RFQ-eligible** · 0 claimed after an invite · **271 cadence-exhausted** · per-source table identical (mjp 169/152, wagle 52/52, mpcb 45/43, public_search 12/9, null 39/15/24/3, admin_import 1,003/0) · pilot categories TEXTILES 2, PACKAGING 3, others 0 · **0 fresh**.
**Differences from the plan, not hidden:** invitation-ready **258 vs 256** and duplicate groups **14 vs 13** (my grouping unions company/GST/phone/email; the plan's exact rule isn't recorded); **STEEL BARS**: no bar-specific category exists in the data (values are slugs like `iron-steel` ×97, `Steel & Metals` ×20), so the exact match is 0 and the tile shows the broader-steel figure separately instead of a misleading 15 or a green 95.

## 5. Pending

- **Not built:** WI-3 (extract the matcher predicate — touches matching, deferred by your constraint 9; RFQ_ELIGIBLE currently **re-implements** the gates and can drift), WI-6 (dry-run WOULD_SEND/SUPPRESSED/INVALID counts in the campaign UI), R2/R3/R7 (matcher window, category taxonomy, reachability ranking — the RFQ Matching sprint), R4 (truthful "N reachable" wording to buyers), R5/R6 (loud email failures, WhatsApp template config consistency), R8 (broader RFQ tests, e2e workflow), R9 (tag internal RFQs/quotes).
- **Optional, unapplied:** `scripts/ma01/backfill-profile-completed-events.sql` (WI-7). Dry run against the live DB: **33 rows would be written**. It writes data → needs your approval. It does **not** touch `claimed_at`.
- **Known limits:** idempotency is check-then-act (fine at one call per request; not safe against two truly simultaneous identical calls); `claim_link_opened` also fires for link-preview bots; legacy `invited` = "an admin ran the send" (labelled *sent, unverified*); pilot-category coverage is keyword-based until a taxonomy exists; the read-model loads all suppliers per request.
- **Never exercised:** the pages and both extended routes under a real admin session; `next build`; a real quote submission producing a real `QUOTE_RECEIVED` row.

## 6. Blocked

| Item | Blocked on |
|---|---|
| Any live invitation send | A claim template (Meta template with exactly one body variable), a consent basis, STOP handling (`MARKETPLACE_READINESS_REPORT.md` P0-1/P0-2) |
| Sourcing 50 ready suppliers/category | `SCRAPEGRAPH_API_KEY` and a source decision; **no scraping was built (your constraint)** |
| Running the app / integration tests locally | The stale `DATABASE_URL` (§3) |
| Knowing whether production DB reads work | Vercel Production env values (not visible to me) |
| Supabase certification | Your result of the vault SQL query from the CH-02 report |

## 7. Requires Credentials (names only)
Current Neon password in `.env` `DATABASE_URL` / `DIRECT_URL` (and Vercel Production) · `META_WHATSAPP_CLAIM_TEMPLATE` (+ approved template) · `SCRAPEGRAPH_API_KEY` (only if you later approve discovery) · an **admin session** to smoke-test the two pages and routes.

## 8. Ready For Git Push — **NOT READY**
Gates before anyone pushes:
1. Review the diff in the work tree (`git -C ..\bell24h-ma01 diff` + the untracked files below).
2. Fix `DATABASE_URL` (§3), then run `next build` / `typecheck:ci` in CI.
3. Deploy to a **staging** environment; open both dashboards as an admin; confirm the funnel matches §4.
4. On staging, submit **one real quote** through `/api/marketing/quote` and confirm one `QUOTE_RECEIVED` row + one buyer email, then repeat through the concierge route.
5. Decide on WI-7 (backfill) separately.

**If approved, commit only these 25 paths** (branch `sprint/ma-01-activation`, PR against `main`; do **not** use #59): modified — `lib/orchestration.ts`, `package.json`, `src/app/admin/cockpit/page.tsx`, `src/app/admin/discovery/invitation/page.tsx`, `src/app/api/admin/{discovery/invitation,launch-metrics,rfqs,seed-suppliers}/route.ts`, `src/app/api/{marketing/quote,quote,rfq/quotes,supplier/onboarding,supplier/quotes}/route.ts`, `src/app/claim/[token]/page.tsx`, `src/lib/discovery/events.ts`; new — `lib/quote-notify.ts`, `lib/quote-notify-runtime.ts`, `src/lib/discovery/pipeline-core.ts`, `src/lib/discovery/pipeline.ts`, `src/components/admin/marketplace/PipelinePanels.tsx`, `src/app/admin/cockpit/marketplace-activation/page.tsx`, `tests/marketplace/{pipeline-core,quote-notify}.test.ts`, `scripts/ma01/backfill-profile-completed-events.sql`, this report. **Never stage** any `.env*` file, `.env.preview.pulled`, or the other untracked reports in your main checkout. The work tree also holds a `node_modules` junction to your main checkout (git-ignored) — remove it with `rmdir node_modules` (not `rm -r`) when done.
