# Task 39A-8: Supplier Drip False-Delivery Containment

Local-only containment. Nothing in this task was pushed, merged, or deployed.
Branch `fix/supplier-drip-false-delivery`, worktree
`C:\Users\Sanika\Projects\bell24h-supplier-drip-containment`, base
`origin/main` at `cbb2f0c7f6ce3252208df85822364680e80d2783`.

Claims below are labeled `VERIFIED` (read/ran it this session),
`HISTORICAL` (true as of a specific commit, not re-checked live), or
`NOT VERIFIED` (no database access, no way to check in this session).

## 1. Root cause

`VERIFIED`. Three routes recorded a supplier-outreach message as delivered
without ever calling a messaging provider:

- `src/app/api/cron/supplier-drip/route.ts` called `logDripSent()` for
  every drip `getDripsDue()` returned, unconditionally, inside the daily
  automated cron run. The only thing that had actually happened was wa.me
  link *generation* — a URL string, not a sent message.
- `src/app/api/outreach/drip/route.ts` POST called the same `logDripSent()`
  with **zero authentication**, so any caller (not just an operator who had
  sent anything) could mark any supplier's drip as sent.
- `src/app/api/marketing/outreach/send/route.ts` wrote a `communication_logs`
  row to InsForge with a hardcoded `status: 'sent'`, with **zero
  authentication**, while its own step-5 comment admitted the real
  WhatsApp/email API call was never implemented ("Here we'd call the actual
  WhatsApp/Email API").

## 2. The real engine vs. a dead-code duplicate

`VERIFIED`. The task named `src/lib/supplier-drip-engine.ts` as the file to
inspect, but that file is **not** the one the routes use. `tsconfig.json`
maps `"@/*": ["./*"]` (repo root, single unambiguous entry — confirmed by
reading the file), and both `cron/supplier-drip/route.ts` and
`outreach/drip/route.ts` import `getDripsDue`/`logDripSent` from
`@/lib/supplier-drip-engine`, which resolves to **`lib/supplier-drip-engine.ts`
at the repo root** — a different file with different logic (it windows off
`outreach_sent` InteractionMemory rows in 3-day/7-day/14-day bands, not
`claimSentAt` as the `src/lib/` version does). Nothing in the codebase
imports `@/src/lib/supplier-drip-engine` — grepped every `.ts` file for
`supplier-drip-engine`, only the two cron/outreach routes above import it,
both via the root path. `src/lib/supplier-drip-engine.ts` is unused dead
code; this containment did not touch it.

## 3. Call chain and schedule

`VERIFIED` from `vercel.json` and the route files.

- **Live automatic trigger**: `vercel.json`'s `crons` array runs
  `/api/cron/daily` at `30 3 * * *` (03:30 UTC daily). That dispatcher's
  job list included `/api/cron/supplier-drip` unconditionally (now removed
  — see §4A).
- **Secondary manual trigger**: `.github/workflows/daily-cron.yml` also has
  a `supplier-drip` job calling `/api/cron/supplier-drip` directly, but its
  `on:` is `workflow_dispatch` only ("schedule disabled to resolve 429") —
  not automatic today, but still reachable by anyone who manually runs it.
  Since the fix is at the route level, this path is covered too.
- Every other job in `/api/cron/daily`'s list (`expire-rfqs`,
  `follow-up-due`, `demand-loop`, `analyze-behavior`, `update-insights`,
  `trust-scores`, and the Monday-only `weekly-digest`/`churn-check`) is
  unrelated to this bug and was left untouched.

## 4. Changes made

### A. `src/app/api/cron/daily/route.ts`
Removed `/api/cron/supplier-drip` from the dispatched job list. Every other
job, the Monday-conditional, and the cron-secret auth are unchanged.

### B. `src/app/api/cron/supplier-drip/route.ts`
No longer imports or calls `logDripSent()`. It is now read-only: reports who
is due with their wa.me link and an explicit `status: 'not_configured'`,
writes nothing. Cron-secret auth (`verifyCronSecret`) unchanged.

### C. `src/app/api/outreach/drip/route.ts`
Both GET and POST now require `requireAdmin()` (same `admin-token`/
`auth-token` cookie or static M2M token every other `/api/admin/*` route
already uses). This is the **only** place a drip may still be recorded as
sent — by an authenticated human attesting they personally sent it, not an
automated guess.

### D. `src/app/api/marketing/outreach/send/route.ts`
Now requires `requireAdmin()`, validates `rfq_id`/`supplier.id`, and never
calls InsForge or writes any record. It returns
`{ success: false, status: 'not_configured', channel, step, content }` —
channel selection and message templating are computed and returned for
inspection, but nothing is sent and nothing is logged as sent. This route
has **zero callers anywhere in the codebase** (grepped `src/` for
`/api/marketing/outreach/send` and for direct string matches on the route
— only a docs file mentions it), so its contract was changed freely.

### Delivery status vocabulary used above
`pending` / `queued` / `sent` (real provider confirmation) / `failed` /
`not_configured` (no provider connected). Generating a wa.me link is never
treated as `sent`.

## 5. Tests

`VERIFIED (test)`. 4 new files, 14 tests, all passing, run with
`tsx --test --experimental-test-module-mocks` (mocks `@/lib/cronAuth`,
`@/lib/admin-auth`, `@/lib/supplier-drip-engine`, `@/lib/logger`, and
`global.fetch` — no real database, cron secret, or provider call is
possible):

| File | Tests | Result |
|---|---|---|
| `src/app/api/cron/daily/route.test.ts` | 3 | 3/3 pass |
| `src/app/api/cron/supplier-drip/route.test.ts` | 3 | 3/3 pass |
| `src/app/api/outreach/drip/route.test.ts` | 4 | 4/4 pass |
| `src/app/api/marketing/outreach/send/route.test.ts` | 4 | 4/4 pass |

**Red/green check performed**: stashed the 4 route fixes, reran all 14
tests against the original buggy code — all 4 files failed (supplier-drip
still dispatched on Mondays, `logDripSent` still called twice by the cron
route, unauthenticated POST still returned 200 instead of 401, missing
`channel: 'email'` fallback). Popped the stash to restore the fix, reran —
14/14 pass again. This confirms the tests actually exercise the bug, not
just the new code's happy path.

Covers 8 of the task's 9 required scenarios directly: daily dispatcher no
longer calls supplier-drip; other daily jobs (incl. Monday-only) remain
included; supplier-drip cannot write sent records without delivery;
unauthenticated outreach requests blocked (both GET and POST); marketing
send cannot record success without provider success; WhatsApp link
generation doesn't create a sent record; provider absence doesn't create a
sent record; no real message sent during testing (`global.fetch` throws if
called in the marketing-send test, and is mocked to a canned response in
the dispatcher test). The 9th ("authenticated operator workflows preserved
where verified") is deliberately **not** claimed — see §6.

`npx tsc --noEmit -p tsconfig.ci.json`: pre-existing failures only, all in
unrelated files (`src/lib/discovery/events.ts`,
`src/lib/outreach/{campaignService,claimInvitation,eligibility,
OutreachService,suppression}.ts` — Prisma-generated-type mismatches, not
touched by this fix). None of the 4 changed route files or their test files
produced any type error.

## 6. Known gap: operator-dashboard auth is not actually verified end-to-end

`NOT VERIFIED` — flagged rather than asserted, per the task's fail-closed
instruction.

`src/app/dashboard/operator/page.tsx` itself has **no admin-specific
authentication check of its own** — no login gate, no redirect, no role
check in the page or in `dashboard/layout.tsx`. However, the route is not
fully open: `src/middleware.ts` gates every `/dashboard/*` path (via
`PROTECTED_USER_PATHS`) on a valid `auth-token` cookie, redirecting to
`/auth/phone-email` otherwise. **This is not an admin-specific gate** — any
logged-in user, of any role, can reach this page; `requireAdmin()` on the
API side is what actually restricts the drip endpoints to admin role.

The realistic residual risk is therefore narrower than "anyone can reach
this with zero login": a non-admin user who is logged in, or an
administrator whose session has expired mid-use, can land on this page and
trigger its silent UI-clearing behaviour. `loadDrips()` checks `res?.ok`
before using the response (an unauthorized GET correctly just shows no
drips), but `markDripSent()` ignores the fetch response entirely
(`.catch(() => {})`, no `.ok` check) and unconditionally removes the row
from the UI — so a POST that was actually rejected by `requireAdmin` looks,
to that user, exactly like a successful send confirmation. The server
correctly rejects the unauthorized write, so **this UI behaviour does not
itself create a false database record** — the risk is confined to a
misleading UI state, not data integrity.

This fix does not edit `page.tsx` (out of scope — it wasn't one of the
named files, and changing it risks its own regressions). **Follow-up
needed, owner decision**: either (a) add an `.ok` check in `markDripSent`
(and the equivalent `loadFollowUps`/`markFollowUpSent` pair) before the
optimistic UI update, and/or restrict `/dashboard/operator` itself to admin
role, or (b) accept the current silent-failure risk as-is.

## 7. Other findings noticed but not fixed (explicitly out of scope)

- **`/api/outreach/follow-up`** (`src/app/api/outreach/follow-up/route.ts`)
  has the identical unauthenticated-GET/POST shape as the old
  `outreach/drip` bug — `VERIFIED` by reading the file; not named in this
  task, not touched. `src/app/api/cron/follow-up-due/route.ts` itself is
  already correct (it never calls `logFollowUpSent`, confirmed by grep —
  only reports counts), so the automatic cron path for follow-ups was never
  affected by this bug; only the manual `/api/outreach/follow-up` endpoint
  shares the drip route's auth gap.
- **Historical row ambiguity**: `logDripSent()` in `lib/supplier-drip-engine.ts`
  hardcodes `source: 'whatsapp'` on every call, regardless of caller — both
  the old cron path and the new operator-confirmed path write identical
  `InteractionMemory` rows (`actionType: 'drip_${type}_sent'`,
  `source: 'whatsapp'`), with no field distinguishing "cron fabricated this"
  from "an operator actually sent this." `NOT VERIFIED` whether any such rows
  exist in production (no database access in this session) — if they do, `getDripsDue()`'s
  already-logged exclusion means past false rows are silently suppressing
  real outreach to those suppliers today. This needs an owner-level
  decision: whether to audit/backfill-correct existing rows once database
  access is available, separate from this code fix.
- **Provenance tagging (recommendation, not implemented)**: a future
  change could add a `confirmedBy: 'operator'` vs. absent field to
  `logDripSent`'s metadata so operator-confirmed rows can be told apart
  from any future cron-era rows during an eventual data audit.
- `/api/admin/outreach-stats` counts a legacy `outreach_sent` action-type
  key alongside `day1_wa_sent`, noting in its own source it "may have 0
  rows" — `NOT VERIFIED` whether that's still true; not relevant to this
  fix's correctness either way.

## 8. Known follow-ups (not fixed in this task)

These are findings, not fixes. Recorded so an owner can decide what to do
with them; nothing below was changed as part of Task 39A-8.

- **`src/app/dashboard/operator/page.tsx`**: `markDripSent()` ignores
  `response.ok` and unconditionally clears the UI row regardless of what
  the server actually did (see §6).
- **`/api/outreach/follow-up`**: unauthenticated GET and POST — GET exposes
  due-follow-up supplier data to any caller, POST can fabricate a sent
  record exactly like the pre-fix drip bug did (see §7).
- **`/api/outreach/generate`**: unauthenticated GET exposes supplier PII
  (name, company, phone, email, location, trust score, message drafts) to
  any caller.
- **`/api/marketing/event`**: unauthenticated POST writes arbitrary
  client-supplied analytics events with no validation.
- **`src/app/admin/n8n/page.tsx`**: its manual trigger button references
  `NEXT_PUBLIC_CRON_SECRET`. Whether this variable is actually set in
  Vercel's environment configuration is `NOT VERIFIED` in this session. If
  it were ever set, `NEXT_PUBLIC_*` variables are inlined into client-side
  JavaScript by Next.js, which would expose the real cron secret to the
  browser — this describes a possible exposure contingent on that
  configuration, not a confirmed one.

## 9. How to restore real automated sending later

A real WhatsApp provider already exists in this codebase —
`src/lib/whatsapp/MetaWhatsAppProvider.ts` / `WhatsAppService.ts` — but it
is wired only into `/api/admin/whatsapp-meta/status` and `/test-send`, not
into the drip or marketing-outreach flows. To restore automated sending
safely: have `cron/supplier-drip`'s `run()` call that provider for each due
drip, record `status: 'sent'` **only** on the provider's own success
response (capturing its message ID/reference in metadata), record
`status: 'failed'` on a provider error, and remove the
`status: 'not_configured'` placeholder once the call is real.
`marketing/outreach/send` would need the same treatment, plus a decision on
whether to keep writing to InsForge (currently paused/unreachable per prior
audits — see `project_vyaparsethu_insforge_dependency_2026-10-18` in
memory) or move the log elsewhere.

## 10. How to verify this fix after deployment

1. Confirm the Vercel Cron run of `/api/cron/daily` no longer includes
   `/api/cron/supplier-drip` in its `results` array (check the function
   log line `[CRON/DAILY]`).
2. Hit `GET /api/cron/supplier-drip` directly with the real `CRON_SECRET`
   and confirm every item in `drips` has `status: 'not_configured'`, and
   confirm no new `InteractionMemory` row appears for any of them
   afterward.
3. Hit `GET /api/outreach/drip` and `POST /api/marketing/outreach/send`
   without any cookie/header and confirm both return 401.
4. Log in as admin, confirm `GET /api/outreach/drip` succeeds and
   `POST /api/outreach/drip` with a real `supplierId`/`dripType` creates
   exactly one `InteractionMemory` row.
