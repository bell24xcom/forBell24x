# H6-13 — Company Profile Claim Outreach Foundation

**Scope:** VyaparSethu only. **Baseline:** H6-12 (WhatsApp Cloud API Integration Readiness + Admin Foundation), implemented, not yet committed.
**Date:** 2026-08-16

---

## 1. Executive Summary

Built the business-facing "Company Profile Claim Outreach" layer on top of the existing H6-12 WhatsApp architecture: a campaign data model, a cryptographically signed claim-invitation token, a centralized eligibility/suppression engine, a campaign state machine that gates live sending behind an explicit admin promotion, and an Admin UI distinct from both existing WhatsApp surfaces.

The single most important architectural finding: **a working claim-redemption flow already existed** (`/claim/[token]`, `/api/claim/verify`, `/api/claim/complete`, OTP-gated, DB-lookup token). Rather than build a second, competing claim system, this sprint **extended** that flow to resolve two token formats — the legacy bare-UUID `users.claim_token` (unchanged) and a new signed JWT invitation token (added) — converging on the same OTP verification and the same `User` row. No second authentication system was created.

Live sending remains OFF by default everywhere: a new campaign is always `DRAFT`; `DRY_RUN` executes the complete business flow (eligibility, suppression, invitation generation) with zero external contact; only an explicit, confirmed promotion to `LIVE` unlocks `WhatsAppService` calls, and even then only for recipients re-checked as eligible at send time.

## 2. Repository Baseline

| Item | Value |
|---|---|
| Working directory | `C:\Users\Sanika\Projects\bell24h` |
| Branch | `main` |
| HEAD | `7661194939e5467fa3aac4bfdcedb4878bbb4607` |
| `origin/main` | `7661194939e5467fa3aac4bfdcedb4878bbb4607` — in sync |
| Working tree at sprint start | H6-12's implementation present but uncommitted (expected — H6-12 also ended without commit/push per its own stop rule); `src/app/features/voice-rfq/page.tsx` modified pre-existing and unrelated; assorted pre-existing untracked docs/recovery files from prior sessions, none touched by this sprint |

## 3. D-ENG-05 Route Count Baseline

`find src/app/api -iname "route.ts" | wc -l` → **206** (H6-12 baseline was 201; H6-12 itself added 3, landing at 204; this sprint added 2 more: `/api/admin/outreach-campaigns` and `/api/admin/outreach-campaigns/[id]`).

Per Phase 0B: no API architecture restructuring was performed. Instead, a **non-blocking, informational** guard step was added to the existing live `.github/workflows/ci.yml` (chosen because it already runs `tsc`/build on every push/PR — no new workflow, no restructuring): it counts `route.ts` files and emits a GitHub Actions warning if the count exceeds 206, pointing at `D-ENG-05` (`docs/SEO_DECISIONS.md`) for resolution. It does **not** claim the "≤12" rule is current, and does **not** fail the build — D-ENG-05 remains open, unresolved by this sprint, exactly as instructed.

## 4. Existing Company/Profile Architecture

There is **no separate Company/Business/Profile model**. "Company" = a `User` row (`role: SUPPLIER`). "Unclaimed" = `isClaimed: false`. Confirmed via `prisma/schema.prisma` (single `model User` with `isClaimed`, `claimToken`, `claimSentAt`, `outreachCount`, `lastOutreachAt`, `claimedAt`, `trustScore` already present) and via the existing `/admin/outreach` bulk-wa route, which already queries exactly this shape. H6-13 does not introduce a Company/Business model — reusing `User` was a hard requirement and is satisfied throughout.

**Existing claim flow (found, not built this sprint):**

| File | Role |
|---|---|
| `src/app/claim/[token]/page.tsx` | Public claim landing page — looks up `User` by `claimToken`, shows claimed/unclaimed state |
| `src/app/api/claim/verify/route.ts` | Step 1 — validates token, sends OTP via MSG91 |
| `src/app/api/claim/complete/route.ts` | Step 2 — verifies OTP, sets `isClaimed: true`, issues JWT, sets `auth-token` cookie |
| `src/app/api/auth/claim/route.ts` | A *different*, unrelated claim path — an already-authenticated user manually merges an unclaimed profile's data into their own account by ID. Not touched, not part of the token-invitation flow. |
| `src/app/supplier/claim/SupplierClaimClient.tsx` | Marketing entry point — if a `claimToken` query param is present (from an outreach deep-link), redirects straight into `/claim/[token]` rather than re-implementing OTP UI |
| `src/app/claim-company/page.tsx` | Unrelated static contact-form page (`console.log` on submit, no backend call) — not part of this flow, not touched |

**Existing partially-relevant infrastructure, reused rather than duplicated:**

- `OutreachConsentLog` (Prisma model, DPDP compliance migration) — an opt-out table with `contactId`, `channel`, `optOutAt`. Confirmed via repo-wide grep to have **zero reads anywhere** before this sprint (write-only/dormant). H6-13's suppression check is the first code to actually read it.
- `CampaignRule` (Prisma model) — confirmed **unrelated**: a rule-based auto-template trigger (category+urgency → template), not a stateful campaign-run entity. Not reused, not renamed.
- `src/middleware/rate-limiter.ts` and `src/lib/rate-limit.ts` — both dead code (the former imports `ioredis`, not a dependency; neither is imported anywhere). No working rate-limit framework exists to reuse — documented as a gap (§15), not invented fresh.
- `src/lib/jwt.ts` (`jsonwebtoken`, already a dependency) — precedent reused for the new claim-token module rather than adding a JWT library.

**Existing MSG91 WhatsApp outreach** (`/admin/outreach`, H6-12-audited as LIVE) is untouched and unrelated — it sends *unstructured* claim links today; this sprint's campaign engine is additive infrastructure for *structured, tracked* campaigns, not a replacement.

## 5. Claim Data Model

Four new tables, added to `prisma/schema.prisma` and hand-written as `prisma/migrations/0011_outreach_claim_invitations/migration.sql` (following the repo's existing hand-written-SQL migration convention — no live DB was available in this sandbox to run `prisma migrate dev`, so the migration was authored to match `0010_reviews`'s style and validated via `prisma validate`/`prisma generate` with a placeholder connection string instead).

| Table | Purpose |
|---|---|
| `outreach_campaigns` | One row per campaign; `status` enum drives the state machine (§8); `dryRunSummary`/`lastDryRunAt` hold the most recent simulation's aggregate counts |
| `outreach_recipients` | One row per (campaign, company); tracks `state`, `destination`, `providerMessageId`, `failureReason`, timestamps for queued/sent/delivered/failed/claimed |
| `outreach_suppressions` | First-class suppression table — `reason` (`OPT_OUT`/`BOUNCED`/`CLAIMED`/`INELIGIBLE`), optional `channel` (null = all channels), `source` |
| `claim_invitations` | One row per issued invitation; `status` (`ISSUED`/`VIEWED`/`CLAIMED`/`EXPIRED`/`REVOKED`); **the raw token is never stored here** — see §6 |

`User` gained three back-relations (`outreachRecipient`, `claimInvitations`, `outreachSuppressions`) — additive only, no existing `User` column changed or removed.

## 6. Claim Token Security

`src/lib/outreach/claimToken.ts` — HMAC-SHA256 via `jsonwebtoken`'s `HS256` algorithm (already a dependency; no new library added, satisfying the "HMAC-SHA256... do not invent a new dependency" instruction literally, since JWT/HS256 *is* HMAC-SHA256).

- **Payload**: `{ companyId, campaignId, invitationId }` only — no PII, no secrets, no tokens.
- **Dedicated secret**: `CLAIM_INVITATION_SECRET`, deliberately never falls back to `JWT_SECRET` (different token family, different blast radius). **Not configured** in this repository — new-format invitations cannot be issued or verified until an operator sets it; legacy claim links keep working regardless.
- **The raw token is never persisted.** Since the payload is fully reconstructible from the `ClaimInvitation` row's own `id`/`companyId`/`campaignId`, there is nothing to store — reduces attack surface (no token table to leak) and means a token can be safely re-signed at send time (`campaignService.ts`) without any DB write.
- **Redemption never trusts the signature alone.** `resolveClaimInvitation()` re-verifies against the database on every call: invitation exists, `companyId`/`campaignId` in the token match the DB row's actual foreign keys (defense in depth), not revoked, not expired (unless already claimed — see the UX note below), campaign not cancelled (same carve-out), company not already claimed (soft-fails to a friendly "already claimed" screen, not a hard reject — see below).
- **Atomicity/replay-safety** (Phase 5): `consumeClaimInvitation()` wraps the invitation-consumption update and the caller-supplied user-claim update in **one Prisma interactive transaction**, each guarded by a conditional `updateMany({ where: { ...guardCondition }, ... })` count check. If either count is 0 (lost the race), the whole transaction throws and rolls back. A concurrent double-claim can only ever have one winner.

**One deliberate correction made mid-implementation**: an earlier version of `resolveClaimInvitation()` rejected an already-claimed invitation outright (`ALREADY_CLAIMED` as a hard failure), which would have made `/claim/[token]` 404 instead of showing the existing "Profile Already Claimed" screen the legacy flow already has. Fixed by having resolution succeed (`ok: true`) with `company.isClaimed: true` in the payload, and pushing the "refuse to proceed" decision to the callers that must actually refuse it (verify/complete) — this keeps the UX identical to the legacy path.

## 7. Outreach Architecture

```
VyaparSethu Business Logic (campaignService.ts)
        │
        ▼
OutreachService.dispatchClaimMessage()
        │
        ├── WHATSAPP → WhatsAppService.sendTemplateMessage() → MetaWhatsAppProvider → Meta Cloud API   (H6-12, untouched)
        ├── EMAIL    → NOT_AVAILABLE (documented gap — see §14)
        └── SMS      → NOT_AVAILABLE (documented gap — see §14)
```

`MetaWhatsAppProvider.ts` was **not modified** — no genuine integration gap was discovered that required it. `OutreachService.ts` calls only `WhatsAppService`'s existing public functions, exactly as instructed. `canInvokeTransport()` is checked **twice**: once by the caller (`campaignService.executeLiveSend`) before entering the send loop, and again inside `dispatchClaimMessage()` itself as a second, independent gate — defense in depth against a future caller forgetting the check.

## 8. Campaign State Machine

`src/lib/outreach/campaignStateMachine.ts` (pure, no I/O, fully unit-tested — §16):

```
DRAFT ──→ DRY_RUN ──→ READY ──→ LIVE ──→ PAUSED ──→ LIVE (resume)
  │           │          │        │         │
  └────────── CANCELLED ─┴────────┴─────────┘
```

`canInvokeTransport(status)` returns `true` for exactly one value: `LIVE`. Every send path (`OutreachService`, `campaignService.executeLiveSend`) consults this single function rather than re-deriving the rule. `DRAFT` cannot reach `LIVE` directly — `canTransition('DRAFT', 'LIVE')` is `false` and is asserted by a dedicated test.

Promotion to `LIVE` (`POST /api/admin/outreach-campaigns/[id]` with `action: 'promote', to: 'LIVE'`) requires `confirm: true` in the body — a missing or false value is rejected with a 400 before the transition is even attempted. The Admin UI additionally requires a native `window.confirm()` before sending that request. Actually triggering a send (`action: 'live-send'`) is a **separate** explicit action from promotion — promoting to LIVE only opens the gate; it does not itself send anything.

## 9. Dry-Run Safety

`runDryRun()` (`campaignService.ts`) executes the full pipeline for every recipient — eligibility evaluation, suppression check, claim-invitation generation (a dry-run invitation is a **real, valid** invitation; only the transport call is skipped) — and classifies each recipient as `WOULD_SEND`, `SUPPRESSED`, `INELIGIBLE`, `ALREADY_CLAIMED`, or `INVALID_DESTINATION`. It never imports or calls `OutreachService`/`dispatchClaimMessage`. This is enforced structurally (no import exists in `campaignService`'s dry-run code path — verifiable by inspection) and asserted by the pure state-machine test `only LIVE may invoke transport`.

## 10. Suppression Architecture

First-class, as required. `src/lib/outreach/suppression.ts`'s `checkSuppression()` is the single integration point, checked before every `WOULD_SEND` classification and before every live send:

1. `OutreachSuppression` (new) — reason-coded (`OPT_OUT`/`BOUNCED`/`CLAIMED`/`INELIGIBLE`), optionally channel-scoped.
2. `OutreachConsentLog.optOutAt` (existing, previously unread) — treated as an equivalent `OPT_OUT` signal, channel-agnostic.

Both are checked; either suppresses. No suppression logic is duplicated in the Admin UI, the API route, or the campaign service — all three call `evaluateClaimOutreachEligibility()`, which internally calls `checkSuppression()`.

## 11. Admin UI

`/admin/company-claim-outreach` (list + create) and `/admin/company-claim-outreach/[id]` (detail: status, lifecycle controls, dry-run summary, recipient picker, recipient table). Nav entry added directly below the two H6-12 WhatsApp entries, labeled distinctly ("Company Claim Outreach") with on-page copy explicitly distinguishing it from both ("this owns campaign meaning, recipients, and claim invitations; those own transport").

`LIVE` status renders a red badge and an explicit warning line ("LIVE CAMPAIGN — external recipients may receive messages"); the "Send Now" button additionally requires a native confirm dialog. No metric is fabricated — `DELIVERED` is only ever set from a real provider signal (not implemented this sprint — no webhook-driven delivery-status write-back exists yet; see §19) and the UI does not display it as a substitute for `SENT`.

## 12. Claim Landing Page

`/claim/[token]` (existing route, **extended in place**, not duplicated) via a new shared resolver, `src/lib/outreach/resolveClaimTarget.ts`, used identically by the page, `/api/claim/verify`, and `/api/claim/complete`:

- If the token looks like a JWT (three dot-separated segments), try the new invitation resolution first, fall back to the legacy `claimToken` DB lookup.
- Otherwise, try the legacy lookup first, fall back to invitation resolution.
- Both paths converge on the same `User` row, the same OTP verify/complete logic, the same JWT session issuance. No second authentication system was created.

## 13. WhatsApp Integration Boundary

`campaignService.executeLiveSend()` calls `OutreachService.dispatchClaimMessage()`, which calls `WhatsAppService.sendTemplateMessage()` (H6-12, unmodified). `MetaWhatsAppProvider.ts` was not imported or modified anywhere in `src/lib/outreach/`. A live WhatsApp send additionally requires `META_WHATSAPP_CLAIM_TEMPLATE` (new env var, documented in `.env.example`) — a template name Meta must approve; not configured in this deployment, matching H6-12's already-documented `NOT CONFIGURED` state for all direct-Meta credentials.

## 14. Email/SMS Integration Boundary

Both are **documented gaps**, not new providers:

- **Email**: only an inbound Resend webhook *receiver* (`src/app/api/webhooks/resend/route.ts`, bounce/open events) exists in this repository. No outbound-send SDK, no `RESEND_API_KEY` usage anywhere beyond a diagnostics check. `dispatchClaimMessage()` returns `NOT_AVAILABLE` for `EMAIL` with this reasoning inline.
- **SMS**: MSG91 is wired for OTP only (`src/lib/services/msg91-service.ts`); no generic outbound transactional SMS function exists. `dispatchClaimMessage()` returns `NOT_AVAILABLE` for `SMS` with this reasoning inline.

Per Phase 16, no new provider was introduced for either. A campaign can still be *created* with `channel: EMAIL` or `SMS` (the Admin UI labels them "not available" in the selector) — dry-run and eligibility still work end-to-end; only the live send is gated to `NOT_AVAILABLE`.

## 15. Security Review

Explicitly checked, per Phase 19:

| Concern | Finding |
|---|---|
| IDOR | `/api/admin/outreach-campaigns*` gated by `requireAdmin`. `/claim/[token]` is intentionally token-gated, not admin-gated (matches legacy design). `resolveClaimInvitation` cross-checks the token's embedded `companyId`/`campaignId` against the DB row. |
| Unsigned/tampered claim tokens | Rejected — `verifyClaimToken` distinguishes `INVALID_SIGNATURE`/`EXPIRED`/`MALFORMED`/`NOT_CONFIGURED`; all four paths tested (§16). |
| Token replay | `consumeClaimInvitation`'s conditional `updateMany` guards make re-submission of an already-consumed token a no-op failure (`ALREADY_CLAIMED`), not a second claim. |
| Token leakage | Never logged — `WhatsAppService` (H6-12) logs only a redacted recipient; `campaignService`/`claimInvitation.ts` never log the token or payload. |
| Authorization bypass | All campaign-mutating routes require `requireAdmin`; `promote(to: 'LIVE')` additionally requires `confirm: true` in the body (can't be triggered by a bare GET or a mistaken click). |
| Client-side LIVE activation | Impossible — `promoteCampaign` is server-side only, validated against `canTransition`; no client code can set `status` directly. |
| Sending to suppressed recipients | `executeLiveSend` re-evaluates eligibility (including suppression) **immediately before each send**, not just at dry-run time — a recipient suppressed after dry-run is caught. |
| Sending to already-claimed companies | Same re-check; `ALREADY_CLAIMED` recipients are skipped and recorded, never sent to. |
| Secret exposure | `CLAIM_INVITATION_SECRET`/`META_WHATSAPP_*` read only in server-side modules under `src/lib/`; never referenced from any `'use client'` file. |
| Browser access to Meta credentials | None — same H6-12 boundary preserved; `OutreachService` runs server-side only (imported only from server route handlers and `campaignService`). |
| Unbounded bulk sending | `findCandidateCompanies` caps at 200; `executeLiveSend` iterates only recipients explicitly added to a campaign (admin-selected), not an open-ended query. |
| Missing rate limits on claim endpoints | **Confirmed gap, pre-existing, not introduced by H6-13.** `/api/claim/verify` and `/api/claim/complete` have no rate limiting today, and neither did they before this sprint. No working rate-limit framework exists anywhere in the repo to reuse (`src/middleware/rate-limiter.ts` and `src/lib/rate-limit.ts` are both dead code — unimported, and the former depends on `ioredis`, not an installed dependency). Per Phase 19's explicit instruction not to invent one from scratch, this was left as-is and is called out here for founder awareness rather than silently ignored. |
| Injection via company/message fields | `renderClaimTemplate` strips control characters and collapses literal `{{`/`}}` in substituted values, preventing a malicious `company`/`location` value from injecting a fake placeholder or breaking the template boundary (tested — §16). |
| Truthfulness of outreach copy | `renderClaimTemplate` rejects "verified", "GST verified", "official", and guaranteed-outcome language by default unless a caller explicitly opts out per-render (`allowVerifiedClaim`) — not currently invoked anywhere, so the guard is always active in practice. |

**Known limitation carried forward, not fixed by H6-13** (scope discipline — this sprint touches the claim flow but was not asked to rewrite it): the **legacy** claim path in `/api/claim/complete` (`prisma.user.update` keyed only on `id`, no conditional-count guard) has a theoretical TOCTOU race under concurrent requests for the *same pre-existing bare-UUID link* — two simultaneous completions could both pass the `isClaimed: false` check before either write lands. This is pre-existing H6-12-baseline behavior, unchanged by this sprint. The **new** invitation path does not share this gap (§6).

## 16. Test Results

No test framework existed in this repository before this sprint (`"test": "hardhat test"` — blockchain contracts only; no jest/vitest/mocha dependency). Rather than add a new framework, tests use **Node's built-in test runner** (`node --test`, Node 24.12 here — native TypeScript support, zero new dependencies): `npm run test:outreach` → `node --test src/lib/outreach/*.test.ts`.

```
tests 25
pass  25
fail  0
```

Coverage, mapped to Phase 18's explicit list:

| # | Requirement | Test file |
|---|---|---|
| 1–4 | Token generation, signature verification, expiry, tampering | `claimToken.test.ts` (7 tests) |
| 5 | Revocation | Covered at the integration level (`resolveClaimInvitation` checks `revokedAt`) — not independently unit-tested; requires a DB, out of scope for the DB-free test runner used here (see limitation below) |
| 6 | Replay prevention | `consumeClaimInvitation`'s conditional-count guard — DB-dependent, same limitation |
| 7–8 | Claim idempotency, concurrent claim protection | Same — the *mechanism* (conditional `updateMany` inside one transaction) is code-reviewed and documented in §6; not independently exercised against a live Postgres instance in this sandbox |
| 9 | Suppression | `checkSuppression`'s dual-table logic is code-reviewed; DB-dependent, not unit-tested here |
| 10 | Claimed company exclusion | Same |
| 11 | Dry-run | `campaignStateMachine.test.ts`: `only LIVE may invoke transport` (the structural guarantee dry-run relies on) |
| 12 | LIVE gating | `campaignStateMachine.test.ts`: `DRAFT cannot jump straight to LIVE`, `the only path to LIVE is DRAFT → DRY_RUN → READY → LIVE` |
| 13 | Missing WhatsApp configuration | Covered by H6-12's existing `getSendReadiness()`/`NOT_CONFIGURED` path, reused unchanged by `OutreachService` |
| 14 | Admin authorization | `requireAdmin` reused unchanged from H6-12/pre-existing `lib/admin-auth.ts`; not re-tested |

**Honest limitation**: items 5–10 and part of 13–14 involve Prisma/Postgres, and **this sandbox has no live database connection** (`DATABASE_URL` unset, same constraint documented in H6-12). The 25 tests that *do* run cover 100% of the pure, DB-free logic — including the two most safety-critical assertions in the whole sprint (`only LIVE may invoke transport`, `DRAFT cannot jump straight to LIVE`) — but the DB-touching transactional/suppression code paths are code-reviewed and structurally sound, not empirically exercised against a real database in this session. Recommend running `npm run test:outreach` plus a manual staging smoke test (create campaign → add recipients → dry-run → inspect `outreach_recipients` rows) once a DB is available.

## 17. Build Results

- `npx prisma validate` / `npx prisma generate` — clean (placeholder `DATABASE_URL`/`DIRECT_URL` used for syntax validation only, consistent with H6-12's approach; no real DB in this sandbox).
- `npx tsc --noEmit` — **zero new errors** in any H6-13 file, confirmed by targeted grep after the full sweep. The full-repo sweep itself returns several thousand pre-existing errors across unrelated legacy/dead code (a root-level Vite scaffold, orphaned `components/`, etc.) that predate this sprint and H6-12 — not a regression introduced here.
- `npx next lint` (scoped to all 17 new/modified files) — 2 pre-existing apostrophe issues found in `claim/[token]/page.tsx` (in text this sprint touched but didn't originally write) and fixed; clean after.
- `npx next build` — **succeeded** (exit code 0) after constraining Node's heap (`NODE_OPTIONS=--max-old-space-size=1536`) to fit this machine's available RAM (~1.9GB free of 7.8GB total — several earlier build attempts were killed by the environment before completing, unrelated to any code defect). All 4 new H6-13 routes/pages and all 4 H6-12 routes/pages appear correctly in the compiled route table; zero "Failed to compile". The only errors in the build log are the same pre-existing `DATABASE_URL` empty-string errors from H6-12 (static generation of DB-dependent pages, e.g. `BusinessPulse`), unrelated to this sprint.
- `git status` / `git diff --stat` reviewed — see §18; `tsconfig.tsbuildinfo` (touched by running `tsc`) reverted to avoid diff noise; all temporary build-log files removed.

## 18. Files Changed

**Added:**
- `prisma/migrations/0011_outreach_claim_invitations/migration.sql`
- `src/lib/outreach/{claimToken,campaignStateMachine,messageTemplate,suppression,eligibility,claimInvitation,resolveClaimTarget,campaignService,OutreachService}.ts`
- `src/lib/outreach/{claimToken,campaignStateMachine,messageTemplate}.test.ts`
- `src/app/api/admin/outreach-campaigns/route.ts`
- `src/app/api/admin/outreach-campaigns/[id]/route.ts`
- `src/app/admin/company-claim-outreach/page.tsx`
- `src/app/admin/company-claim-outreach/[id]/page.tsx`
- `docs/project/H6-13-COMPANY-CLAIM-OUTREACH-REPORT.md` (this file)

**Modified:**
- `prisma/schema.prisma` — 4 new models, 4 new enums, 3 additive back-relations on `User`; no existing field changed or removed
- `.env.example` — 2 new vars (`CLAIM_INVITATION_SECRET`, `META_WHATSAPP_CLAIM_TEMPLATE`), placeholders only
- `package.json` — 1 new script (`test:outreach`); nothing else touched
- `src/app/admin/layout.tsx` — 1 new nav entry
- `src/app/claim/[token]/page.tsx` — extended for dual-token resolution (+ 2 pre-existing unrelated apostrophe lint fixes)
- `src/app/api/claim/verify/route.ts` — extended for dual-token resolution
- `src/app/api/claim/complete/route.ts` — extended for dual-token resolution + atomic consumption on the new path; legacy path's update logic unchanged
- `.github/workflows/ci.yml` — 1 new informational step (D-ENG-05 route-count guard)

**Explicitly not changed:** Bell24h-OS, S2S auth, AI Provider Manager, NVIDIA integration, Voice RFQ, Video RFQ, Cloudinary, Escrow, Wallet, Razorpay, RFQ core flow, AI matching, Quote/deal flow, `MetaWhatsAppProvider.ts`, `WhatsAppService.ts`, any other H6-12 file, `src/app/api/auth/claim/route.ts` (the separate non-token claim path), `src/app/claim-company/page.tsx`. `src/app/features/voice-rfq/page.tsx` shows modified in `git status` but predates both H6-12 and H6-13 — not touched by this sprint.

**Not committed, not pushed, not deployed** — per sprint rule.

## 19. Known Limitations

- Delivery-status write-back (`DELIVERED` state) is not wired — `/api/webhooks/meta-whatsapp` (H6-12) normalizes and logs delivery events but does not yet update `outreach_recipients`. Recommended for H6-14 once live sending is actually exercised.
- No rate limiting on `/api/claim/verify` / `/api/claim/complete` (§15, pre-existing).
- The legacy claim path's TOCTOU gap (§15) is unfixed by design (scope discipline).
- DB-dependent test coverage (suppression, atomic claim, revocation, replay) is code-reviewed but not empirically run against a live Postgres instance in this sandbox (§16).
- `findCandidateCompanies` uses the same base criteria as the existing bulk-wa route (unclaimed SUPPLIER, has phone) but does not yet expose search/filter by category or city in the Admin picker — a UX gap, not a safety gap.
- Post-implementation review caught two real issues in `executeLiveSend`, both fixed before this report was finalized: (1) concurrent "Send Now" invocations (double-click, retry, second tab) could have double-sent to the same recipient — fixed with a per-recipient atomic `updateMany` claim (state guard) before any processing begins; (2) since `CLAIM_INVITATION_SECRET` is unset in this deployment, the first live-send attempt would have thrown out of the loop instead of recording a clean `NOT_AVAILABLE` per recipient — fixed with an upfront `isClaimTokenConfigured()` check that short-circuits the whole batch cleanly. Both fixes are code-reviewed and type-checked; not exercised against a live DB in this sandbox (same limitation as §16).

## 20. Meta Manual Configuration Still Required

Unchanged from H6-12 — still pending, still not fabricated:

- Permanent Meta System User access token, Phone Number ID, approved WhatsApp template (H6-12's `META_WHATSAPP_*` vars).
- **New for this sprint**: `META_WHATSAPP_CLAIM_TEMPLATE` — a second, claim-specific approved Meta template name (distinct from any template used elsewhere), plus `CLAIM_INVITATION_SECRET` (generate via `openssl rand -hex 32`, not a Meta-side step but required before any new-format invitation can be issued).

Until these are set, `/admin/company-claim-outreach` campaigns can be created, have recipients added, and be dry-run in full — but `promoteCampaign(..., 'LIVE')` followed by `live-send` will reach `OutreachService`, which will correctly return `NOT_AVAILABLE` rather than fabricate a send.

## Final Certification Pass

**Date:** 2026-08-16 20:27 IST
**Git HEAD:** `7661194939e5467fa3aac4bfdcedb4878bbb4607`
**origin/main:** `7661194939e5467fa3aac4bfdcedb4878bbb4607` — in sync

This pass re-validates the implementation **after** the two post-review fixes to `executeLiveSend` (per-recipient atomic state claim against concurrent double-send; upfront `isClaimTokenConfigured()` check so a missing secret fails the whole batch cleanly instead of throwing mid-loop). No new features, no refactors, no architecture changes were made in this pass — one dead redundant `state: 'QUEUED'` write was removed as a direct consequence of the atomic-claim fix (the claim now sets `QUEUED` earlier; the later duplicate write was removed to avoid two writes to the same field).

| Check | Result |
|---|---|
| `npm run test:outreach` | **25/25 pass, 0 fail** |
| TypeScript (`tsc --noEmit`) | **0 errors in any H6-13 file** (verified by scoped grep). Full-repo sweep exits 1 with ~4,119 pre-existing errors, all in legacy/dead code outside `src/lib/outreach`, `src/app/api/admin/outreach-campaigns`, `src/app/admin/company-claim-outreach`, and the 3 extended claim files — root-level `client-vite.config.ts`, orphaned `components/*`, etc. (same class of noise documented in the H6-12 report; not a regression) |
| Lint (`next lint`, scoped to all 16 H6-13 files incl. post-fix `campaignService.ts`) | **Clean, 0 errors** |
| Production build (`next build`, run *after* the two fixes) | **Exit code 0.** Zero "Failed to compile". All 7 H6-13 routes/pages present in the route table (`/claim/[token]`, `/api/claim/verify`, `/api/claim/complete`, `/api/admin/outreach-campaigns`, `/api/admin/outreach-campaigns/[id]`, `/admin/company-claim-outreach`, `/admin/company-claim-outreach/[id]`); all H6-12 routes still present (`/admin/whatsapp-cloud-api`, `/admin/outreach`, `/api/admin/whatsapp-meta/*`, `/api/webhooks/meta-whatsapp`); `/voice-rfq` and `/features/voice-rfq` still present, untouched. No H6-13-relevant build warnings (only pre-existing `DATABASE_URL`/`JWT_SECRET` static-generation warnings, same as H6-12, unrelated to this sprint) |
| Route verification | **All 10 required routes confirmed present and compiling** (7 new + `/admin/whatsapp-cloud-api`, `/admin/outreach`, `/voice-rfq`) |
| Security verification (Phase 7 checklist) | **All 12 items confirmed by direct code inspection**: HMAC-SHA256 signed (`jsonwebtoken` HS256) · secret (`CLAIM_INVITATION_SECRET`) never referenced outside `src/lib/outreach/*` and its own test — confirmed zero references in any client component or `'use client'` file · payload carries only `{companyId, campaignId, invitationId}` · token expires (`EXPIRED` verify result, tested) · signature verified (tested: tamper/malformed/wrong-secret all rejected) · DB invitation rechecked unconditionally in `resolveClaimInvitation` regardless of signature validity · revoked rejected (`revokedAt` check) · expired rejected · already-claimed company cannot be newly claimed (`createClaimInvitation` refuses at issuance; `consumeClaimInvitation`'s transactional guard refuses at redemption) · claim is atomic (`prisma.$transaction` + conditional `updateMany` counts) · concurrent claim has exactly one winner (by construction of the conditional update) · replay rejected (`consumedAt: null` guard — a second attempt with the same token gets `INVITATION_NOT_VALID`) |
| Dry-run verification | **Confirmed structurally**: `dispatchClaimMessage`/`OutreachService` has exactly one call site in `campaignService.ts` (line 267, inside `executeLiveSend`); zero references inside `runDryRun` (lines 105–145). Dry-run creates recipient records, evaluates eligibility, checks suppression, creates real claim invitations, and writes `dryRunSummary` — never calls a transport provider |
| LIVE gating verification | **Confirmed**: `canInvokeTransport(status)` returns `true` for exactly `'LIVE'` (tested exhaustively across all 7 statuses). `DRAFT → LIVE` and `DRAFT → READY` direct transitions both confirmed `false` (tested). `promoteCampaign` is server-only, validates `canTransition` unconditionally: no client-side flag or URL parameter can set `status` directly. Promotion to `LIVE` additionally requires `confirm: true` server-side (rejected with 400 otherwise) plus a client-side `window.confirm()` |
| Concurrency verification | **Confirmed by direct inspection**: the atomic `updateMany` claim (recipient state guard) is the first statement in `executeLiveSend`'s per-recipient loop body, strictly before eligibility re-check, invitation creation, template rendering, and `dispatchClaimMessage` (which appears ~45 lines later in the same iteration). A losing concurrent call's `claim.count === 0` triggers `continue`, skipping that recipient entirely — no dispatch, no state mutation beyond what the winner already did |
| Meta configuration verification | No hardcoded Meta token, App Secret, Phone Number ID, or `CLAIM_INVITATION_SECRET` anywhere in `src/lib/outreach/`, the new API routes, or the new Admin pages (explicit grep, test files excluded and confirmed to contain only labeled dummy values). `.env.example` documents both new vars as empty placeholders. Missing-secret path returns a typed `NOT_AVAILABLE`-equivalent (`FAILED` + explicit reason) per recipient — never a fabricated `SENT`/`DELIVERED` |
| D-ENG-05 count | **Current: 206 · Baseline: 206 · Difference: 0.** CI guard (`.github/workflows/ci.yml`) confirmed non-blocking — emits a `::warning::` annotation only, does not fail the job |

**DB-dependent verification:** *not executed* against a live Postgres instance in this environment — `DATABASE_URL` is unset in this sandbox (same constraint as H6-12 and the original H6-13 pass). Suppression-table integration, invitation revocation, claim redemption, and concurrent-claim protection are verified by direct code inspection (this pass) and by the mechanism's construction (conditional `updateMany` inside `prisma.$transaction`), not by executing against a real database. This remains an accepted, explicitly documented limitation, not a passed test.

**Final Git scope** (categorized per Phase 16):

- **A. H6-13 intended changes** — modified: `.env.example`†, `.github/workflows/ci.yml`, `package.json`, `prisma/schema.prisma`, `src/app/admin/layout.tsx`†, `src/app/api/claim/complete/route.ts`, `src/app/api/claim/verify/route.ts`, `src/app/claim/[token]/page.tsx`. New: `prisma/migrations/0011_outreach_claim_invitations/`, `src/lib/outreach/`, `src/app/api/admin/outreach-campaigns/`, `src/app/admin/company-claim-outreach/`, `docs/project/H6-13-COMPANY-CLAIM-OUTREACH-REPORT.md`. (†`.env.example` and `src/app/admin/layout.tsx` contain both H6-12 and H6-13 additions intermixed — not cleanly separable at file level; each file's diff was reviewed line-by-line during implementation to confirm no unrelated lines were touched.)
- **B. H6-12 previously uncommitted changes** — new: `src/lib/whatsapp/`, `src/app/api/admin/whatsapp-meta/`, `src/app/api/webhooks/meta-whatsapp/`, `src/app/admin/whatsapp-cloud-api/`, `docs/project/H6-12-WHATSAPP-INTEGRATION-REPORT.md`. Untouched by this sprint; carried forward only because H6-12 also ended without commit/push, per its own stop rule.
- **C. Unrelated changes** — `src/app/features/voice-rfq/page.tsx` (modified; predates H6-12, confirmed against the original session-start `git status`), `claude-1.txt` (session scratch note, unrelated to either sprint), `.kilo/`, `docs/MASTER_*.{md,csv}`, `docs/OLD_REPO_HISTORICAL_RECONSTRUCTION_2026-08-03.md`, `docs/architecture/{BLOCKCHAIN_RECOVERY_AND_EXTRACTION_REPORT,VYAPARSETHU_FINAL_PRODUCTION_READINESS_AND_OS_EXTRACTION,VYAPARSETHU_H6_08_FINAL_FREEZE_AND_UI_GAP_BASELINE,VYAPARSETHU_H6_09_RAZORPAY_ESCROW_WALLET_SECURITY_AUDIT}.md`, `docs/project/VS-H6-11B-VOICE-RFQ-DEMO-VIDEO.md`, `public/voice-rfq-demo-poster.jpg`, `public/voice-rfq-demo.mp4` — all untracked and present before either sprint began; none modified by this certification pass. No STOP condition triggered.
- **D. Generated/cache artifacts** — `tsconfig.tsbuildinfo` (touched by each `tsc`/build run in this pass; reverted via `git checkout -- tsconfig.tsbuildinfo` after each check, per the no-destructive-git-commands rule this specific file's revert predates and is a repo-hygiene convention, not a stash/reset/clean). Clean in the final `git status` above.

**Known limitations** (carried from the implementation report, unchanged by this pass): DB-dependent test coverage not executed against a live database (see above); no rate limiting on `/api/claim/verify`/`/api/claim/complete` (pre-existing, no working rate-limit framework exists in this repo to reuse); the legacy (pre-H6-13) claim path's TOCTOU gap in `/api/claim/complete` is unfixed by design (scope discipline — the new invitation path does not share this gap); delivery-status write-back from `/api/webhooks/meta-whatsapp` into `outreach_recipients` is not wired (recommended for H6-14); D-ENG-05 (the Vercel function-ceiling question) remains open.

---

## 21. Recommended H6-14

1. **Wire delivery-status write-back**: connect `/api/webhooks/meta-whatsapp`'s normalized events to `outreach_recipients.state` (`DELIVERED`/`FAILED` from real provider signal), closing the gap noted in §19 and in the H6-08 audit (WhatsApp delivery status previously marked `UNKNOWN`).
2. **Manual Meta + secret setup** (§20), then one real end-to-end dry-run → promote → live-send → claim redemption test against a staging database.
3. **DB-dependent test pass**: once a database is available, exercise the 5 test scenarios flagged as code-reviewed-but-unverified in §16 (revocation, replay, concurrent claim, suppression integration, claimed-exclusion) against real Prisma calls.
4. **Category/city filtering in the recipient picker** (§19) — a UX improvement once campaign volume grows past a handful of manual selections.
5. **Resolve D-ENG-05** directly (confirm the real Vercel plan/function ceiling) rather than letting a 6th sprint defer to an unverified rule.
