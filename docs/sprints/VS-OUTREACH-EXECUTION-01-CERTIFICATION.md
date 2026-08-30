# VS-OUTREACH-EXECUTION-01-CERTIFICATION

**Date:** 2026-08-30  
**Branch:** `claude/vyaparsethu-outreach-channels-18ghlu`  
**Auditor:** Claude Code (autonomous execution sprint)  
**Method:** Static analysis of all funnel routes + runtime trace. One P0 defect found and fixed.

---

## Objective

Prove that the supplier acquisition funnel works end-to-end using **existing functionality only**. No new channels, no Bell24h-OS, no external integrations beyond what is already coded.

---

## Verdict

**CERTIFIED — with one P0 fix applied.**

The email-led supplier acquisition funnel is structurally complete. Every gate from CSV import through first quote is wired and idempotent. One critical defect (Day 3 drip silently never fired for any supplier) was found and fixed during this sprint. All other gates passed without code changes.

---

## Funnel Map

```
[CSV Import] → [Invitation Email] → [Supplier Claims Profile via OTP] → [Welcome Email]
     ↓                 ↓                           ↓
 InteractionMemory  outreach_sent           isClaimed=true, trustScore≥30
     ↓                 ↓                           ↓
[Email Drip Engine]                       [Onboarding Drip Cron]
  Day 3: profile     Day 7: browse RFQs   Day 3: profile reminder
  Day 14: re-engage                       Day 7: first-quote nudge
                                                   ↓
                                          [POST /api/quote → First Quote]
```

---

## Phase 1 — Environment Audit

| Env Var | Purpose | Status |
|---|---|---|
| `MSG91_AUTH_KEY` | Email send + OTP SMS | Documented in `.env.example`; required for both channels |
| `MSG91_SENDER_ID` | OTP SMS sender ID | Documented |
| `MSG91_TEMPLATE_ID` | OTP SMS template | Documented |
| `MSG91_WA_AUTH_KEY` | WA API via MSG91 BSP | Documented as empty; must be set to activate WA API mode |
| `MSG91_WA_PHONE` | WABA phone number | Documented as empty; required with WA_AUTH_KEY |
| `MSG91_WA_TEMPLATE` | Approved Meta WA template name | Documented as empty; required with WA_AUTH_KEY |
| `CRON_SECRET` | Auth all cron routes | Documented; fail-closed — routes return 401 without it |
| `ADMIN_TOKEN` / `EXPORT_API_KEY` | M2M admin auth | Documented |
| `JWT_SECRET` | JWT signing | Documented; fail-closed in claim route |
| `DATABASE_URL` / `DIRECT_URL` | Neon PostgreSQL | Required; documented |
| `PILOT_OTP_IN_RESPONSE` | Show OTP in response (pilot mode) | Optional; `true` bypasses SMS during controlled pilot |

**WA API gate:** `bulk-wa` route is coded and operational. If `MSG91_WA_AUTH_KEY` + `MSG91_WA_PHONE` + `MSG91_WA_TEMPLATE` are set in Vercel, it sends live. If not set, it falls back to `wa.me` links. Check Vercel env vars to determine current mode.

---

## Phase 2 — Supplier Import Validation

**Route:** `POST /api/admin/import-suppliers`  
**Auth:** `requireAdmin` (ADMIN_TOKEN / JWT role=ADMIN)

| Check | Result |
|---|---|
| CSV multipart (`csv` field) accepted via papaparse | ✅ |
| JSON body (`{ suppliers: [] }`) accepted | ✅ |
| Required fields enforced: `company`, `category`, `city` | ✅ |
| Optional: `phone`, `email`, `description`, `gstnumber`, `mobile` | ✅ |
| Deduplication by company+city | ✅ |
| Max 500/import cap enforced | ✅ |
| Upsert (no duplicate DB rows on re-import) | ✅ |
| `preferences.categories` written from `category` field | ✅ |

**P0 defects:** None.

---

## Phase 3 — Invitation Validation

Three invitation paths available:

### 3A — Email Invitation (`POST /api/admin/send-invitations`)

| Check | Result |
|---|---|
| Auth: requireAdmin | ✅ |
| Targets unclaimed suppliers with email | ✅ |
| Sends "Claim My Profile" email with `claimUrl = /auth/phone-email?claim={id}` | ✅ |
| Writes `outreach_sent` to InteractionMemory → suppliers enter drip engine | ✅ |
| Rate limit: 1s between sends | ✅ |
| Supports targeted send (`{ supplierIds: [...] }`) or bulk (no body) | ✅ |
| Max 100/call | ✅ |

**Note:** This is the primary invitation path. The `outreach_sent` event written here is the exact key the `supplier-drip-engine.ts` queries to build its candidate list.

### 3B — WA Link Generation (`POST /api/admin/outreach/daily-batch`)

| Check | Result |
|---|---|
| Auth: requireAdmin | ✅ |
| Returns wa.me links for unclaimed suppliers with phone | ✅ |
| Respects `outreachCount < 3` and 2-day cooldown | ✅ |
| Sets `claimToken`, `claimSentAt`, increments `outreachCount` | ✅ |
| Does NOT write to InteractionMemory | ℹ️ Design choice — manual WA outreach stays outside automated drip engine |

### 3C — WA API Send (`POST /api/admin/outreach/bulk-wa`)

| Check | Result |
|---|---|
| Auth: requireAdmin | ✅ |
| MSG91 WA API (`api.msg91.com/api/v5/whatsapp/...`) | ✅ |
| Falls back to wa.me links if `useApi=false` or env vars missing | ✅ |
| Daily cap: 50 per IST day | ✅ |
| Writes `day1_wa_sent` to InteractionMemory | ✅ |
| PATCH endpoint for operator to log manual WA sends | ✅ |

**P0 defects:** None.

---

## Phase 4 — Registration Validation (OTP Auth)

**Routes:** `POST /api/auth/otp/send` + `POST /api/auth/otp/verify`

| Check | Result |
|---|---|
| Phone normalization: strips +91, spaces, dashes → 10 digits | ✅ |
| Rate limit: max 3 OTPs per phone per 10 minutes | ✅ |
| Pilot mode (`PILOT_OTP_IN_RESPONSE=true`): OTP returned in response, no SMS sent | ✅ |
| OTP stored in `OTPVerification`, expires in 10 minutes | ✅ |
| Verify: max 3 attempts, expiry check, already-used check | ✅ |
| New user created with `role=SUPPLIER`, `verificationStatus=PHONE_VERIFIED`, `trustScore=30` | ✅ |
| Returning user: `isVerified=true`, `lastLoginAt` updated | ✅ |
| JWT generated via `lib/jwt.ts`, set as 7-day cookie | ✅ |
| Onboarding credits granted non-blocking (`ONBOARDING_CREDITS`, default 3) | ✅ |
| Consent recorded via `recordSignupConsent` | ✅ |
| BOM `company_joined` life event fired (non-blocking) | ✅ |

**P0 defects:** None.

---

## Phase 5 — Onboarding Validation

### 5A — Profile Claim (`POST /api/claim/complete`)

| Check | Result |
|---|---|
| OTP verify (max 3 attempts, expiry check) | ✅ |
| Sets `isClaimed=true`, `claimedAt` | ✅ |
| `trustScore = max(current, 30)` | ✅ |
| JWT issued, 7-day cookie set | ✅ |
| Fail-closed on missing `JWT_SECRET` | ✅ |

### 5B — Onboarding Drip (`GET|POST /api/cron/onboarding-drip`)

| Check | Result |
|---|---|
| Auth: verifyCronSecret | ✅ |
| Day 3 window: `createdAt` between 3–7 days ago, profile incomplete | ✅ |
| Day 7 window: `createdAt` between 7–14 days ago, no quote submitted | ✅ |
| Idempotent: checks `onboarding_day3_sent` / `onboarding_day7_sent` in InteractionMemory | ✅ |
| `profileComplete` = `preferences.description && preferences.categories.length > 0` | ✅ |
| Rate limit: 1s between sends | ✅ |
| Uses `supplierProfileReminderEmail` / `supplierFirstQuoteEmail` from `lib/emailTemplates` | ✅ |

**P0 defects:** None.

---

## Phase 6 — First Quote Validation

**Route:** `POST /api/quote`

| Check | Result |
|---|---|
| Zod validation on body | ✅ |
| Requires `SUPPLIER` or `ADMIN` role (JWT or cookie) | ✅ |
| Deduplication: no second quote on same RFQ from same supplier | ✅ |
| Writes to `Quote` table, fires BOM life event | ✅ |

**P0 defects:** None.

---

## P0 Defect Register

### P0-01 — Day 3 drip email never fires for any supplier

**File:** `lib/supplier-drip-engine.ts`  
**Commit:** `7a9dfce` (2026-08-30)

**Bug (before fix):**
```typescript
if (isDay3) {
  if (dripSentSet.has(`${supplierId}:drip_day3_sent`)) continue;
  // Skip if profile is already complete
  if (!!supplier.company) continue;   // ← always true; company is required on import
```

Every supplier imported via CSV has `company` set (it is a required field in `import-suppliers`). The condition `!!supplier.company` was therefore always `true`, meaning the Day 3 "complete your profile" drip email was silently skipped for every candidate. The drip had never fired since the route was written.

**Fix (after):**
```typescript
if (isDay3) {
  if (dripSentSet.has(`${supplierId}:drip_day3_sent`)) continue;
  // Skip if profile is already complete (has description + categories set)
  const prefs3 = supplier.preferences as Record<string, unknown> | null;
  const profileComplete = !!(prefs3?.description && Array.isArray(prefs3?.categories) && (prefs3.categories as string[]).length > 0);
  if (profileComplete) continue;
```

Fix matches the identical check already present in `src/app/api/cron/onboarding-drip/route.ts:97`. The `preferences` field is already selected in the Prisma query at line 221 of `getDripsDue()`.

**Blast radius:** All Day 3 supplier-drip emails since initial deployment. Day 7 and Day 14 drip logic was unaffected.

---

## Non-P0 Observations (No Fix Required)

| Issue | Severity | Notes |
|---|---|---|
| `InteractionMeta.actionType` TypeScript union excludes drip/outreach action types | Low | Runtime OK — Prisma accepts any string. `ignoreBuildErrors: true` prevents build failure. Named in VS-LEGACY-SERVICES-AUDIT-01. |
| `daily-batch` WA outreach does not write `outreach_sent` | Informational | Intentional design — manual WA outreach bypasses automated email drip. Suppliers invited this way can be re-invited via `send-invitations` to enter the drip. |
| `send-invitations` sends welcome email to at most 100 unclaimed suppliers per call | Informational | Pagination needed for large batches. Not a blocker for initial pilots. |
| `claim/complete` does not yet write a WhatsApp consent acknowledgment | Low | TODO comment exists in code. Does not block claim or login flow. |

---

## Funnel Connectivity Summary

```
Supplier import → send-invitations (email) → outreach_sent in InteractionMemory
                                         ↓
                          supplier-drip-engine reads outreach_sent
                          Day 3 (48–96h): profile completion nudge  ← P0-01 FIXED
                          Day 7 (6–8d):   browse RFQs nudge
                          Day 14 (13–15d): re-engagement nudge
                                         ↓
                          /claim route → OTP verify → isClaimed=true
                                         ↓
                          onboarding-drip cron
                          Day 3 (3–7d post-registration): profile reminder
                          Day 7 (7–14d post-registration): first-quote nudge
                                         ↓
                          /api/quote → first quote submitted
```

All links verified via static analysis. No broken import chains, no missing handlers, no missing DB fields.

---

## Operator Runbook (Minimum Viable Pilot)

To run a real pilot with 10–50 suppliers:

1. **Import suppliers** (admin panel or API):
   ```
   POST /api/admin/import-suppliers
   Authorization: Bearer {ADMIN_TOKEN}
   Content-Type: multipart/form-data
   [csv file with: company, category, city, email, phone]
   ```

2. **Send invitation emails**:
   ```
   POST /api/admin/send-invitations
   Authorization: Bearer {ADMIN_TOKEN}
   ```
   → Sends "Claim My Profile" email. Writes `outreach_sent` to InteractionMemory.

3. **Optional — generate WA links** (manual sends):
   ```
   POST /api/admin/outreach/daily-batch
   Authorization: Bearer {ADMIN_TOKEN}
   ```
   → Returns wa.me links. Open each link to send a personal WhatsApp.

4. **Drip emails fire automatically** via cron:
   - `POST /api/cron/supplier-drip` (triggered from `/api/cron/daily`) — handles outreach drips
   - `POST /api/cron/onboarding-drip` (triggered from `/api/cron/daily`) — handles post-claim drips
   - Both require `Authorization: Bearer {CRON_SECRET}` header

5. **Verify funnel metrics**:
   ```
   GET /api/admin/outreach-stats
   Authorization: Bearer {ADMIN_TOKEN}
   ```

6. **Pilot mode for OTP** (recommended for first 10 claims):
   - Set `PILOT_OTP_IN_RESPONSE=true` in Vercel env
   - OTP appears in API response body — no SMS cost, no SMS configuration required
   - Remove this flag before general rollout

---

## Pre-Conditions for Live WA API

The email funnel is fully operational. WA API requires three additional Vercel env vars:

```
MSG91_WA_AUTH_KEY=<your MSG91 auth key>
MSG91_WA_PHONE=<WABA number without +, e.g. 919004962871>
MSG91_WA_TEMPLATE=<approved Meta template name, e.g. supplier_claim_invite>
```

Without these, `bulk-wa` route operates in wa.me link mode (manual send). No code changes required to activate WA API — it is already implemented and guarded.

---

## Certification

| Phase | Status |
|---|---|
| Phase 1: Environment Audit | ✅ All required vars documented; Vercel state not verified |
| Phase 2: Supplier Import | ✅ PASS |
| Phase 3: Invitation | ✅ PASS (3 paths operational) |
| Phase 4: Registration (OTP) | ✅ PASS |
| Phase 5: Onboarding (Claim + Drip) | ✅ PASS |
| Phase 6: First Quote | ✅ PASS |
| P0 Defects Found | 1 — Day 3 drip never fired (FIXED, committed `7a9dfce`) |
| Non-P0 Observations | 4 — none blocking |

**The supplier acquisition funnel is certified operational. The Day 3 drip fix is the only code change made. All other components passed without modification.**

---

*Sprint complete. No uncommitted changes remain.*
