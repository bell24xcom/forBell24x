# Trust Score Consolidation Report — VS-FINAL Sprint 1

**Compiled:** 2026-08-03. Scope: Trust Score only, per the sprint's explicit boundary. Nothing else touched.

---

## Task 1 — Complete Inventory

A full repo-wide search of every `trustScore` reference surfaced a more precise picture than earlier recovery passes had — worth stating plainly since it changes the fix from "reconcile three formulas" to something narrower and safer.

**Write sites — all mutate the same `User.trustScore` Prisma field, using different rules:**

| File | Function/Route | Rule |
|---|---|---|
| `src/app/api/auth/otp/verify/route.ts:91` | New user creation | Flat `30` (base: phone verified) |
| `src/app/api/auth/otp/widget-verify/route.ts:59` | New user creation | Flat `30` |
| `src/app/api/auth/claim/route.ts:49` | Merge unclaimed profile | `min(100, current + min(unclaimed.trustScore, 20))` — capped increment |
| `src/app/api/claim/complete/route.ts:77` | Claim-link completion | `max(supplier.trustScore, 30)` — floor |
| `src/app/api/supplier/onboarding/route.ts:58` | Onboarding completion | `increment` by GST(+15 self-reported/+30 verified)+Udyam(+10), then capped at 100 |
| `src/app/api/auth/kyc/route.ts:19-40,110` | KYC submission | A local (unexported) `calculateTrustScore()` function — **absolute recalculation**: base 30 + name/company/location bonuses + GST(+25) + Udyam(+20) + both-bonus(+5), capped at 100 |
| `src/app/api/review/submit/route.ts:76-82` | Review submission (this session's own earlier addition) | `increment` by `(rating - 3)`, clamped to `[0, 100]` |
| `src/app/api/admin/import-suppliers/route.ts:73` | Bulk import | Flat `0` |
| `src/app/api/admin/seed-suppliers/route.ts` | Test/demo seed data | Flat hardcoded values (72, 65, 58, ...) — not production logic |
| `src/app/api/admin/pull-v2/route.ts:187` | External lead pull | Flat `10` |

**Read-only duplicate calculations — computed their own number from scratch, never read or wrote the stored field:**

| File | What it computed | Consumer-facing surface |
|---|---|---|
| `src/app/api/supplier/[id]/route.ts:48-52` | `gstVerified?30:0 + profileComplete*0.25 + winRate-bonus(max 25) + deals*4(max 20)` | **Public Supplier Profile** |
| `src/app/api/supplier/stats/route.ts:41-45` | Byte-identical formula to the above | **Supplier Dashboard** |

**Pure consumers — read `user.trustScore` directly, no calculation, ~15+ call sites confirmed:** `admin/analytics`, `admin/control-panel`, `admin/crm`, `admin/outreach/bulk-wa`, `admin/outreach/daily-batch`, `admin/seo/supplier-profiles`, `admin/stats`, `admin/suppliers`, `admin/users`, `ai/rfq-matching`, `ai/smart-matching`, `dashboard/quotes`, `outreach/generate`, `rfq/match-suppliers`, `rfq/quotes`, `rfq/[id]/quotes`, `supplier/profile`, `suppliers/route.ts`.

**Not a Trust Score implementation, despite earlier recovery documents grouping it in:** the admin diagnostics "Business Memory" score (`src/app/api/admin/system/diagnostics/route.ts`) is a platform-wide BOM life-event-coverage metric, unrelated to any individual supplier's trust. This report does not touch it, and a correction is worth noting for the historical record: earlier passes in this recovery project characterized Trust Score as having "three disagreeing implementations," counting that diagnostics score as the third. On closer inspection this pass, it measures something conceptually different (platform readiness, not supplier trust) and was miscategorized. The real problem was always narrower: two duplicate, non-persisted read-time calculations, not three competing philosophies.

## Task 2 — Dependency Graph

```
                     ┌─────────────────────────────────────────┐
Event sources ──────►│  User.trustScore (Prisma field, Neon)    │◄────── ~15 consumers read directly
(OTP verify,          │  — the one persisted value —            │        (admin pages, matching algorithms,
 onboarding, KYC,      └─────────────────────────────────────────┘         dashboard/quotes, etc.)
 claim, reviews)                    ▲
  each writes via                  │  BEFORE this sprint:
  its own rule                      │  these two routes ignored the
  (see Task 1 table,                │  field entirely and computed
  left unchanged                    │  their own number instead:
  this sprint)                      │
                          ┌─────────┴──────────┐
                          │ supplier/[id]        │  Public Supplier Profile
                          │ supplier/stats       │  Supplier Dashboard
                          └──────────────────────┘
```

**Duplicate calculations found:** exactly 2 (`supplier/[id]`, `supplier/stats`), byte-identical to each other.
**Conflicting formulas:** the *write side* has 6 different rules contributing to the same field — this is a real design inconsistency, but each rule fires on a different, non-overlapping life event (signup, onboarding, KYC, claim, review) and none of them contradicts another in the sense of "same event, different outcome." Consolidating the write-side rules into one formula would be a scoring-model redesign, explicitly out of scope for this sprint.
**Dead implementations:** none found — every write site is reachable from a real, live route.
**Unused services:** none — there was no pre-existing shared trust-score service to be unused; that's precisely the gap this sprint closes for the read side.

## Task 3 — Authoritative Implementation

**Recommendation: the persisted `User.trustScore` Prisma field is the single source of truth.** Not a new formula — the field that already exists, is already written to by six real business events, and is already read directly by roughly fifteen other parts of the application. The inconsistency wasn't "which formula is right," it was that exactly two routes never consulted this already-authoritative value in the first place.

Classification of every alternative found:
- `User.trustScore` (the field itself): **VERIFIED ACTIVE** — now the sole source, as it already was for the ~15 other consumers
- `supplier/[id]`'s local formula: **VERIFIED DUPLICATE** → removed this sprint
- `supplier/stats`'s local formula: **VERIFIED DUPLICATE** → removed this sprint
- `kyc/route.ts`'s local `calculateTrustScore()`: **VERIFIED ACTIVE** — this is a *write-side* rule (one of the six), not a duplicate of the two read-side calculations; left untouched, in scope for a future write-side consolidation sprint if one is ever commissioned, not this one
- Admin diagnostics "Business Memory" score: **not a Trust Score implementation at all** (see Task 1) — no action needed

## Task 4 — Safe Migration Plan (as executed)

1. Add a one-line shared getter, `getTrustScore()`, in a new file (`src/lib/trust-score.ts`) — purely so future code has one obvious import instead of re-deriving the value again.
2. Add `trustScore: true` to the Prisma `select` in both duplicate-formula routes.
3. Delete the local 4-line ad-hoc calculation in each.
4. Replace the local variable with `getTrustScore(userRecord)`.
5. Leave every other field in both routes' responses (`profileComplete`, `gstVerified`, `responseRate`, `dealsCompleted`, etc.) completely untouched — those are legitimate, separate signals shown alongside trust score, not part of the duplicate calculation.

No formula was redesigned. No write-side rule was touched. No unrelated route was modified.

## Task 5 — Implementation

**Files changed (1 new, 2 modified):**
- `src/lib/trust-score.ts` (new) — `getTrustScore(user: { trustScore: number }): number`
- `src/app/api/supplier/[id]/route.ts` — added `trustScore: true` to select, replaced 4-line calculation with `getTrustScore(userRecord)`
- `src/app/api/supplier/stats/route.ts` — same treatment, with a null-safe fallback (`userRecord ? getTrustScore(userRecord) : 0`) matching the file's existing optional-chaining style

**Diff, `supplier/[id]/route.ts`:**
```diff
+import { getTrustScore } from '@/src/lib/trust-score';
...
+          trustScore: true,
...
-    let trustScore = 0;
-    trustScore += gstVerified ? 30 : 0;
-    trustScore += Math.round(profileComplete * 0.25);
-    trustScore += totalQuotes > 0 ? Math.min(Math.round((wonQuotes / totalQuotes) * 25), 25) : 0;
-    trustScore += Math.min(dealsCompleted * 4, 20);
+    const trustScore = getTrustScore(userRecord);
```

**Diff, `supplier/stats/route.ts`:** identical shape, plus the null-safe fallback noted above.

## Task 6 — Validation

- **TypeScript:** initial run surfaced a real error — `@/lib/trust-score` doesn't resolve, because `@/` maps to the repo root, not `src/` (per CLAUDE.md's own documented alias gotcha), and the new file lives in `src/lib/`. Fixed by importing `@/src/lib/trust-score` instead, matching the sibling `supplier-products` import already in the same file. Re-run: **5848 total errors, identical to today's baseline everywhere else in the repo, zero in any file this sprint touched.**
- **ESLint:** ran directly against all three changed files — no errors, no warnings (one unrelated deprecation notice about a personal `~/.eslintrc.*` file, not from this change).
- **Build:** `✓ Compiled successfully`.
- **Existing pages still work:** both routes' non-trust-score fields (`profileComplete`, `gstVerified`, `responseRate`, `dealsCompleted`, `wonQuotes`, `totalQuotes`, products, preferences, etc.) are untouched — confirmed via direct diff review, not just build success.
- **Public profile score matches dashboard:** both now read the identical `userRecord.trustScore` value via the same shared function — by construction, they cannot diverge again for the same user, since there's only one number, retrieved one way.
- **API returns identical score:** same reasoning — this is now structurally guaranteed rather than something that has to be separately tested for drift.

## Task 7 — Remaining Risks

- **The write side's six different bonus rules are unreviewed and untouched.** This sprint fixed *reading* the score consistently; it did not audit whether the six *writing* rules are individually correct, fair, or free of edge cases (e.g., whether a user's score can currently be re-lowered if they remove their GST number — none of the increment-based rules appear to support that). That's explicitly out of scope here and would be its own, separate sprint.
- **`getTrustScore()` is intentionally trivial** (a one-line passthrough). If a future sprint decides trust score needs anything more than "return the stored field" (e.g., a real-time-vs-cached distinction, or per-context weighting), this function is the correct single place to change — but it does not currently do anything beyond what direct field access already did for the other 15 consumers.
- **Live-execution re-verification not performed.** Consistent with this session's established constraint (no test account credentials, no local DB access), this fix was validated via source trace, `tsc`, `eslint`, and `next build` — not by hitting the live public profile and dashboard endpoints for a real supplier and diffing the numbers. Recommend a quick manual check the next time either page is opened with real data.

---

Committed as one isolated commit, per the sprint's requirement. Not pushed — stopping here per today's standing practice of confirming before anything goes to origin.
