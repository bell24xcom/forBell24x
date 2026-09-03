# VS-FIRST-REAL-TRANSACTION-01

**Objective:** get one real supplier through invite → claim → onboarding → match → quote → accept → completed transaction, using only what is already built. This is an operating checklist, not an audit. Every step below cites the exact file/route that already implements it — nothing here requires new code.

---

## Required preconditions (check these first, in order — stop at the first "NO")

| # | Precondition | How to check | Evidence file |
|---|---|---|---|
| 1 | At least one real, unclaimed, phone-reachable supplier exists in `users` | `GET /api/admin/import-suppliers` → `unclaimedCount`, or `/admin/suppliers` filtered `phone: not null` | `src/app/api/admin/import-suppliers/route.ts`, `src/app/api/admin/suppliers/route.ts` |
| 2 | `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID` configured in production (OTP send — required for claim step) | `/admin/system` → Environment tab → "Auth & OTP" group both green | `src/app/api/admin/system/diagnostics/route.ts` (env check keys `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`) |
| 3 | `NEXT_PUBLIC_SITE_URL` configured in production (claim links must point at the real domain) | `/admin/system` → Environment tab → "Core" group | same file, key `NEXT_PUBLIC_SITE_URL` |
| 4 | Founder has a working admin session in **production** (not local — local has no `ADMIN_EMAIL`/`ADMIN_PASSWORD` configured in this sandbox's `.env`/`.env.local`) | Log in at `/admin/login` on the live domain | `src/app/api/admin/login/route.ts` |
| 5 | At least one active `Category` row whose `slug` matches the chosen supplier's real product line | `/admin/control-panel` or direct DB check on `categories` where `isActive: true` | `src/app/api/rfq/create/route.ts` lines ~55-77 (category resolved by slug) |
| 6 | A real buyer account exists (a real person, phone-verified via normal OTP signup) willing to post one real requirement | Any phone number can self-serve via the normal signup flow — no special setup | `src/contexts/AuthContext.tsx` + `/api/auth/otp/send`, `/api/auth/otp/verify` |

**Do not proceed past a "NO" on 1-4.** Steps 5-6 can be resolved in parallel with steps 1-4.

**Two things NOT required, contrary to what an earlier sprint's docs might imply:**
- `CLAIM_INVITATION_SECRET` — only needed for the *new*, structured campaign-invitation format. The **legacy claim-link format** (`User.claimToken`, a bare UUID) works today with zero additional config and is what `/admin/outreach`'s bulk-WhatsApp tool already uses (`src/app/api/admin/outreach/bulk-wa/route.ts`). Use that path — see Step 1 below.
- `MSG91_WA_AUTH_KEY` / `MSG91_WA_PHONE` / `MSG91_WA_TEMPLATE` (auto-send WhatsApp API) — **not required**. The same route always generates a `wa.me` click-to-chat link as a fallback, requiring zero API credentials — the founder opens the link and sends the message from their own WhatsApp. This is the fastest usable path today; see Step 1.

---

## Real supplier selection criteria

Use `/admin/suppliers` (or `GET /api/admin/suppliers`) and pick a candidate matching **all** of:

- `role: 'SUPPLIER'`
- `isClaimed: false` (hasn't claimed yet — this is the whole point of a first-invite test)
- `phone` is not null and is a real, reachable 10-digit Indian mobile number (verify manually — a placeholder/import artifact number will fail OTP)
- `gstNumber` is not null, **or** `importedFrom` is not null (evidence the record came from a real sourcing/import step, not synthetic test data — `src/app/api/admin/import-suppliers/route.ts` sets `importedFrom: 'admin_import'` on every real import)
- `outreachCount < 3` (not already over-contacted — matches the eligibility check `src/app/api/admin/outreach/bulk-wa/route.ts` line ~81 uses for its own candidate pool)
- Prefer higher `trustScore` — `bulk-wa`'s own query orders by `trustScore desc`

**Explicitly avoid:** any row you cannot independently verify is a real business (no company name, no phone, or a company name that looks like test/placeholder data — see the base audit `docs/audits/VS-ADMIN-PRODUCTION-AUDIT-FIX-01.md` Phase 4 for the one confirmed test row, `cms1q3s4o0001id04ik1xk2na`, to make sure it's not accidentally reused).

**Fastest way to get the right one:** `POST /api/admin/outreach/bulk-wa` with `{ "dryRun": true, "count": 1, "minTrustScore": 0 }` — returns the exact candidate the system would pick, with `claimLink` and `waLink` already built, before anything is sent or written to the DB.

---

## Real RFQ selection criteria

The automated matcher (`src/app/api/rfq/match-suppliers/route.ts`) scores on **location, trust, KYC, and quote-win-rate — it does NOT check category at all**. This is real, confirmed behavior, not a gap to fix right now — it means a "good match" today is whatever the founder manually verifies makes sense. For the first RFQ, choose or create one where:

- `category` is a real, active `Category.slug` (see precondition 5) — matches the chosen supplier's actual product line, verified by the founder, not by the matcher
- `location` is set and, ideally, contains (case-insensitive substring) the chosen supplier's `location` — this is worth **+25** of the matcher's 100-point score (`match-suppliers/route.ts` line ~112-116) and is the single biggest lever for a clean, explainable first match
- `status: 'ACTIVE'` and `isPublic: true` (the default on creation via `POST /api/rfq/create` — `src/app/api/rfq/create/route.ts` line ~96)
- `minBudget`/`maxBudget` are realistic numbers a real supplier would actually quote against — not a placeholder like `1000`/`5000` (those exact values are the ones used in the documented test smoke-test RFQ, `docs/smoke-test-2026-07-26.md` — avoid reusing them so this RFQ is unambiguously real, not confusable with that known test row)
- Created by a real, distinct buyer account — **not** the same admin account that will later record settlement (keeps the audit trail clean: buyer ≠ settler, even though `POST /api/deal/select` technically allows an admin to accept on the RFQ owner's behalf — reserve that for the failure-recovery path only, see below)

**Do not use `/admin/seed-rfqs`** for this — that tool exists specifically to generate `isSeeded: true` synthetic listings for marketplace density, the opposite of what this objective needs.

---

## End-to-end transaction checklist

Each step names the exact route/page that does it. Check the box, record the evidence in the tracking table below, then move to the next step.

### Step 1 — Invite a real supplier
- [ ] Pick the candidate per the selection criteria above.
- [ ] Go to `/admin/outreach`, or call `POST /api/admin/outreach/bulk-wa` with `{ "dryRun": true, "count": 1 }` first to confirm the exact recipient and message.
- [ ] Re-run with `dryRun: false` (or use the Admin UI's send button). This writes `claimToken`, `claimSentAt`, increments `outreachCount` on the `User` row (`bulk-wa/route.ts` line ~141-150), and returns a `waLink`.
- [ ] Open the returned `waLink` and send it from your own WhatsApp (no API credentials required — see preconditions note above). If `MSG91_WA_TEMPLATE` ever gets configured, this step becomes automatic (`apiSent: true` in the response) — check the response's `useApi` field to know which happened.

### Step 2 — Real supplier claims profile
- [ ] Supplier opens the link → `${SITE_URL}/claim/{claimToken}` → `src/app/claim/[token]/page.tsx`.
- [ ] Supplier enters their phone → `POST /api/claim/verify` → real OTP sent via MSG91 (`src/app/api/claim/verify/route.ts`).
- [ ] Supplier enters the OTP → `POST /api/claim/complete` → sets `isClaimed: true`, `isVerified: true`, `isActive: true`, `trustScore: max(current, 30)`, issues a 7-day JWT, sets the `auth-token` cookie, redirects to `/dashboard` (`src/app/api/claim/complete/route.ts` lines ~70-166).

### Step 3 — Real supplier completes onboarding
- [ ] There is **no separate mandatory onboarding gate** for a claimed profile — `claim/complete` redirects straight to `/dashboard`, not `/onboarding` (that page is for fresh OTP signups with no prior profile — `src/app/onboarding/page.tsx`). "Onboarding complete" here means: supplier's dashboard shows their real `company`, `location`, `category` (already set from import, in `preferences.categories`), and `phone` (now OTP-verified). Confirm this by having the supplier open `/dashboard?tab=supplier` and check nothing is missing/wrong.

### Step 4 — Real supplier receives matching RFQ
- [ ] Founder or a real buyer posts the RFQ per the selection criteria above, via `/rfq/create` (not the admin seed tool).
- [ ] Confirm the supplier appears in the match list: `POST /api/rfq/match-suppliers { rfqId }` → check the claimed supplier's `id` is in `matches`, with a non-trivial `matchScore` (location match alone should put them well above a 10-point baseline).
- [ ] Supplier can independently discover the RFQ via the live RFQ list even without being algorithmically "matched" — `GET /api/rfq/live` / `/api/rfq/list` (both public, no matching required) — this is a valid alternate path if match-suppliers doesn't surface them for any reason.

### Step 5 — Real supplier submits a quote
- [ ] Supplier, logged in (role is already `SUPPLIER` from import — `hasRole` check in `src/app/api/quote/route.ts` line ~25 requires exactly `SUPPLIER` or `ADMIN`), submits via the normal quote-submission UI → `POST /api/quote { rfqId, price, quantity, ... }` → creates a `Quote` row, `status: 'PENDING'`.
- [ ] **Fallback if the supplier is more comfortable on a phone call than the web UI**: admin can record the same real quote on the supplier's behalf via `/admin/rfqs` → open the RFQ's drawer → "Submit Concierge Quote" → `POST /api/admin/rfqs { action: 'submit-concierge-quote', ... }`. This is a legitimate, already-built path *by design* for exactly this bootstrapping scenario (`src/app/api/admin/rfqs/route.ts` lines ~8-21 doc-comment: "for bootstrapping liquidity before a supplier is actively self-serving on the platform"). It requires the real supplier's `id`, a real price, and a mandatory `sourcingNote` describing how the quote was actually obtained (e.g. "Phone call 2026-09-01 with [name], [company], +91XXXXXXXXXX") — never use it for a fabricated price.

### Step 6 — Buyer accepts the quote
- [ ] Real buyer (the RFQ's `createdBy`), logged in, accepts via `POST /api/deal/select { quoteId }` → in one transaction: creates `Deal` (`status: 'ACTIVE'`), sets `Quote.status: 'ACCEPTED'`, sets `RFQ.status: 'ACCEPTED'` (`src/app/api/deal/select/route.ts` lines ~38-65). Also fires non-blocking BOM life-events for both buyer and supplier (`quote_accepted`).
- [ ] Fallback (document if used, don't default to it): the same route allows `user.role === 'ADMIN'` to accept on the RFQ owner's behalf (line ~34) — only use this if the real buyer is genuinely unable to click "Accept" themselves; record why in the tracking table.

### Step 7 — Transaction completes
Two real, already-built paths exist. **Use the off-platform path for the first transaction** — it's simpler, has no payment-gateway/KYC dependency, and is explicitly designed for exactly this situation.

- [ ] **Off-platform (recommended for #1):** Admin calls `POST /api/deal/{dealId}/complete { settlementMethod, reference }` after the buyer and supplier have actually settled payment directly (bank transfer/UPI/cash — VyaparSethu holds no funds here). This is admin-only, idempotent, requires `Deal.status === 'ACTIVE'` and zero prior wallet-escrow touch, and — in one transaction — creates a `Transaction` row (`status: 'COMPLETED'`, `paymentMethod: 'OFF_PLATFORM: <method>'`), sets `Deal.status: 'COMPLETED'`, sets `RFQ.status: 'COMPLETED'`, bumps the supplier's trust score +10, creates in-app notifications for both parties, and emails both parties if they have an email on file (`src/app/api/deal/[id]/complete/route.ts`). **This is the actual finish line for this objective.**
- [ ] **In-platform wallet escrow (alternative, more steps, requires real wallet funds):** `POST /api/dashboard/deals` with actions `pay_wallet` → `mark_shipped` → `confirm_delivery` → `complete`, in that order (`src/app/api/dashboard/deals/route.ts` lines ~133-211+). Only pursue this for transaction #1 if the buyer specifically wants to test Protected Payment end-to-end and already has wallet balance (top-up via `POST /api/payment/create-order`, Razorpay — `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are configured).

---

## Evidence required at each step

| Step | Evidence to capture (screenshot or DB row ID) |
|---|---|
| 1. Invite | The `bulk-wa` response JSON (`suppliers[0].id`, `claimLink`, `waLink`, `apiSent`) |
| 2. Claim | `User.isClaimed = true`, `User.claimedAt` timestamp, for that exact `id` |
| 3. Onboarding | Screenshot of `/dashboard?tab=supplier` showing the real company/phone |
| 4. Match | The `match-suppliers` response showing the supplier's `matchScore` and `reasons` |
| 5. Quote | `Quote.id`, `Quote.price`, `Quote.status = 'PENDING'`; if concierge, the `sourcingNote` text |
| 6. Accept | `Deal.id`, `Deal.status = 'ACTIVE'`, `Quote.status = 'ACCEPTED'`, `RFQ.status = 'ACCEPTED'` |
| 7. Complete | `Transaction.id`, `Transaction.status = 'COMPLETED'`, `Deal.status = 'COMPLETED'`, `RFQ.status = 'COMPLETED'` |

A completed run has all seven rows traceable by ID, referencing the same `RFQ.id` → `Quote.id` → `Deal.id` → `Transaction.id` chain.

---

## Failure recovery procedure

| Failure point | Real, evidenced recovery |
|---|---|
| OTP SMS doesn't arrive (Step 2) | `src/app/api/claim/verify/route.ts` logs the failure via `logProviderFailure` (visible in `/admin/errors` / `ProviderFailure` table) and returns a clear 500 rather than a silent failure. Retry `POST /api/claim/verify` — it's an idempotent upsert on the phone's OTP record. If `PILOT_OTP_IN_RESPONSE=true` or running in `development`, the OTP is returned directly in the response — use only for this controlled first test, never in a real production send to a real supplier who expects a real SMS. |
| Supplier claims but the invitation/token turns out invalid | `resolveClaimTarget` (`src/lib/outreach/resolveClaimTarget.ts`) resolves the legacy `User.claimToken` path independently of the newer signed-invitation path — if one is broken, re-issue a fresh `claimToken` via another `bulk-wa` dry-run/send cycle for the same supplier `id` (each send overwrites `claimToken` with a fresh `randomUUID()` — `bulk-wa/route.ts` line ~125,144). |
| No supplier appears in `match-suppliers` for the RFQ | Not a hard blocker — the matcher's own candidate pool is `role: SUPPLIER, isActive: true` with no category filter, so an eligible claimed supplier should always appear if `isActive: true`. If they don't, check `User.isActive` directly; the claim flow sets it `true` unconditionally (Step 2), so a `false` value here means something else deactivated the account — check `/admin/errors` and `InteractionMemory` for that user's `id` for what happened. |
| Quote submission fails with 403 | `POST /api/quote` requires `role` exactly `SUPPLIER` or `ADMIN` (`src/app/api/quote/route.ts` line ~25). A claimed import always has `role: SUPPLIER` by default (`prisma/schema.prisma` `User.role @default(SUPPLIER)`), so a 403 here means the role was changed elsewhere — check `/admin/crm` for that user and fall back to the concierge-quote path (Step 5 fallback) rather than debugging role state on the critical path. |
| Buyer never accepts (Step 6) | Don't let the transaction stall waiting indefinitely on a real buyer's convenience. Recovery order: (1) follow up with the buyer directly (this is a manually-run first test, not a marketing funnel); (2) if truly necessary, use the documented admin-accept fallback (`user.role === 'ADMIN'` bypass in `/api/deal/select`) and note it plainly in the tracking table — don't hide that the founder accepted on the buyer's behalf. |
| Off-platform completion route returns 409 ("used wallet escrow") | Means `pay_wallet` was accidentally called on this deal at some point. Don't fight the guard — finish via the wallet-escrow action sequence instead (`mark_shipped` → `confirm_delivery` → `complete` on `/api/dashboard/deals`), which is exactly what that 409 message tells you to do. |
| Any step 500s with no clear reason | Check `/admin/errors` (`ErrorLog` table) and `/admin/system` (Health tab — now shows per-metric failures individually instead of blanking everything, per `VS-ADMIN-FIX-IMPLEMENTATION-01`) before re-attempting blindly. |

---

## Daily founder tracking table

One row per calendar day until step 7 is reached once. Update at end of day; a blank "Blocker" cell means that day made forward progress.

| Date | Furthest step reached (1-7) | Supplier ID | RFQ ID | Blocker (if stalled) | Next concrete action |
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |

**Rule for this table:** "furthest step reached" only advances when the evidence for that step (per the table above) actually exists — not on intent or a message sent. If a step's evidence can't be produced, the tracked step is the last one that *can* be evidenced, and that day's blocker is exactly what evidence is missing.
