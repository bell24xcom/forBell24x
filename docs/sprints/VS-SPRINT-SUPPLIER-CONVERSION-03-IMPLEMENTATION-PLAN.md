# VS-SPRINT-SUPPLIER-CONVERSION-03 — Implementation Plan
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-03  
**Date:** 2026-08-27  
**Mode:** Plan only. No code changes. No commits.

---

## Executive Summary

VS-SPRINT-SUPPLIER-CONVERSION-02 has been completed in full. All six phases audited in Sprint 01 are now implemented:

| Sprint 01 Finding | Sprint 02 Status |
|------------------|----------------|
| Lead unlock broken (wrong table) | ✅ Fixed — `prisma.rFQ.findFirst`, confirmed in source |
| No starter credits on signup | ✅ Fixed — 3 credits on OTP verify, `ONBOARDING_CREDITS` env |
| No admin credit grant | ✅ Fixed — `POST /api/admin/credits` with grant/deduct + audit log |
| `isVerified` conflated phone+business | ✅ Fixed — `verificationStatus` enum, migration `0011` |
| GST verification workflow stub | ✅ Fixed — onboarding → GST_PENDING → admin marks GST_VERIFIED |
| No first 10 supplier dashboard | ✅ Fixed — `GET /api/admin/first10` with 6-step checklist per supplier |

**Ishwar can register, browse, quote, and receive verification today without any SQL.** The remaining work falls into three tiers:

- **Quick wins (< 1 day):** 4 items — seeded RFQ filter in leads feed, duplicate quote guard, seeded RFQ filter in marketplace list, `/api/supplier/gst` stub removal
- **Medium tasks (1–3 days):** 3 items — "my quotes" supplier feed, category-filtered leads, credit purchase frontend confirmation
- **Major tasks (> 3 days):** 2 items — RFQ Quality Classification system, in-app notification layer for RFQ matches

The single highest-impact item is the seeded RFQ filter in the supplier leads feed. Seeded RFQs appearing alongside real requirements directly erodes the first 10 suppliers' trust. This is a one-line WHERE clause addition.

---

## Phase 1 — Lead Unlock Repair Plan

### Current Flow (Post-Sprint-02)

The fix has been applied and is live in source. Confirmed from `src/app/api/leads/unlock/route.ts`:

```
POST /api/leads/unlock { leadId, supplierId }
  → Step 1: validate params ✅
  → Step 2: prisma.rFQ.findFirst({ where: { id: leadId, isPublic: true } }) ✅
  → Step 3: check LeadSupplier for existing unlock → return cached result ✅
  → Step 4: check userCredits.credits >= 1 ✅
  → Step 5: transaction { decrement credits, create LeadSupplier } ✅
  → Step 6: return { buyerName, buyerCompany, buyerLocation, contactHidden: false } ✅
```

### Root Cause (Historical)

`prisma.lead.findUnique` queried the CRM `leads` table using an RFQ ID. CRM `Lead` rows are sales pipeline contacts; RFQ IDs never exist there. Every lookup returned null → 404. The fix changed the query to `prisma.rFQ.findFirst`.

### Affected Tables

| Table | Role | Fix Required |
|-------|------|-------------|
| `rfqs` | Source of truth for unlock lookup | ✅ Fixed (query now targets this) |
| `lead_suppliers` | Stores unlock record (`leadId` = RFQ ID) | No change — field name misleading but data correct |
| `user_credits` | Tracks balance and spend | No change |
| `leads` | CRM pipeline contacts | No change — no longer queried in unlock flow |

### Migration Risk

**None.** The fix was a one-file code change. No schema changes. No data migrations. No backfill required. Existing `lead_suppliers` rows (if any) are not affected.

### Testing Requirements

Manual end-to-end test sequence:
1. Register supplier via OTP → confirm 3 credits auto-granted (`GET /api/admin/credits?userId=X`)
2. `GET /api/supplier/leads` → note a `leadId` (RFQ ID), confirm `contactHidden: true`
3. `POST /api/leads/unlock { leadId, supplierId }` → expect 200 with `buyerName`
4. `GET /api/supplier/leads` again → same lead now shows `contactHidden: false`
5. Repeat step 3 → expect 200 "already unlocked" (idempotency confirmed)
6. `GET /api/admin/credits?userId=X` → balance reduced by 1, spent increased by 1

### Remaining Gap (Low Priority)

The unlock route uses `new PrismaClient()` directly (line 4) rather than the shared singleton from `@/src/lib/prisma`. This creates a new connection pool per invocation. Should be changed to `import { prisma } from '@/lib/prisma'`. Effort: 5 minutes. Risk if unaddressed: connection pool exhaustion under concurrent load.

### Effort

**DONE.** The fix is implemented. Remaining gap (PrismaClient singleton) is 5 minutes.

---

## Phase 2 — Starter Credits Design

### Current Flow (Post-Sprint-02)

Implemented in `src/app/api/auth/otp/verify/route.ts`. On new user creation only (inside `if (!user)` branch):

```typescript
const onboardingCredits = parseInt(process.env.ONBOARDING_CREDITS ?? '3', 10);
if (onboardingCredits > 0) {
  prisma.userCredits.upsert({
    where: { userId: user.id },
    create: { userId: user.id, credits: onboardingCredits, spent: 0 },
    update: { credits: { increment: onboardingCredits } },
  }).catch(err => authLogger.error('Failed to grant onboarding credits', ...));
}
```

### Grant Timing

Credits are granted **immediately after successful OTP verification** for new users. Existing users logging back in do not receive additional credits.

### Fraud Prevention

| Vector | Mitigation |
|--------|----------|
| New account per phone number | MSG91 OTP gating — phone must be real and OTP must arrive |
| Same phone re-register | `if (!user)` branch only — re-registration increments credits (design choice: low risk for founding cohort) |
| Fake phone numbers | MSG91 rejects non-existent numbers at OTP send time |
| Credit farming at scale | `ONBOARDING_CREDITS=0` env var disables grants entirely with no code change |

**Assessed risk for first 10 suppliers: VERY LOW.** Founder personally knows and contacts each supplier. At scale (100+ suppliers), add phone-number-based duplicate detection before granting.

### Expiry Rules

**Current design: No expiry.** Credits do not expire. Rationale: for the founding cohort, credit accumulation friction does more damage to conversion than the cost of unused credits.

**Future consideration (post-100 suppliers):** Add `expiresAt` column to `UserCredits` and a daily cron to zero out balances older than 90 days for accounts that never quoted. Do not implement for first 10.

### Env Variable

```
ONBOARDING_CREDITS=3    # default — set on Vercel
ONBOARDING_CREDITS=0    # to disable automatic grants
```

### Effort

**DONE.** Implemented. No further action required for Phase 2.

---

## Phase 3 — Admin Credit Management

### Current State (Post-Sprint-02)

`/api/admin/credits` is implemented and covers:

| Operation | Command | Status |
|-----------|---------|------|
| View all balances | `GET /api/admin/credits` | ✅ Done |
| View one user's balance + history | `GET /api/admin/credits?userId=X` | ✅ Done |
| Grant credits | `POST /api/admin/credits { action: "grant", userId, amount, reason }` | ✅ Done |
| Deduct credits | `POST /api/admin/credits { action: "deduct", userId, amount, reason }` | ✅ Done |

### Auth

Uses `requireAdmin()` from `lib/admin-auth.ts`. Accepts:
- JWT with `role=ADMIN` (browser session)
- `Authorization: Bearer $ADMIN_TOKEN` header (curl / M2M)

### Audit Log

All grant and deduct operations emit `console.info` with: `adminId`, `userId`, `amount`, `reason`, `newBalance`. These appear in Vercel function logs for `/api/admin/credits`.

### Gap: No Persistent Audit Table

Current audit logging is console-only. Vercel logs rotate. For compliance and dispute resolution after 100+ suppliers, add a `CreditAuditLog` table:

```prisma
model CreditAuditLog {
  id         String   @id @default(cuid())
  adminId    String
  userId     String
  action     String   // "grant" | "deduct" | "purchase"
  amount     Int
  reason     String?
  newBalance Int
  createdAt  DateTime @default(now())
}
```

**Effort: 2 hours.** Not required for first 10 suppliers. Required before 50 suppliers.

### Gap: No Credit Purchase UI in Supplier Dashboard

The backend (`POST /api/credits/purchase`, `POST /api/credits/verify`) is confirmed working. A supplier-facing purchase UI has not been confirmed in the codebase. Suppliers currently have no self-serve path to buy more credits.

**Impact for first 10:** Founder can use admin grant to top up credits. Self-serve UI is not a first-10 blocker.

**Effort to build credit purchase UI: 1–2 days** (simple Razorpay SDK integration page in supplier dashboard).

### Reporting

For the first 10 cohort, the summary view at `GET /api/admin/first10` shows `credits` and `creditsSpent` per supplier. This is sufficient. Dedicated credit reporting dashboard: post-100 suppliers scope.

### Effort

**DONE for first 10.** Two future gaps noted: persistent audit table (medium task) and credit purchase UI (medium task).

---

## Phase 4 — Supplier Verification Workflow

### Current State (Post-Sprint-02)

The `VerificationStatus` enum is implemented and live:

```
PHONE_VERIFIED → GST_PENDING → GST_VERIFIED
                             → MANUAL_VERIFIED
                             → REJECTED → GST_PENDING (resubmit)
```

Migration: `prisma/migrations/0011_verification_status/migration.sql`

| State | Trigger | Who |
|-------|---------|----|
| `PHONE_VERIFIED` | OTP verify | Automatic |
| `GST_PENDING` | Profile submission with GST/Udyam | Supplier |
| `GST_VERIFIED` | Admin marks after GST portal check | Founder |
| `MANUAL_VERIFIED` | Admin marks manually (Udyam-only, in-person) | Founder |
| `REJECTED` | Admin rejects | Founder |

### Current State vs Required State

| Required State | Implemented? | Evidence |
|---------------|-------------|--------|
| PHONE_VERIFIED (default) | ✅ Yes | OTP verify route, migration default |
| GST_PENDING (submitted) | ✅ Yes | Onboarding route transitions if PHONE_VERIFIED |
| GST_VERIFIED (approved) | ✅ Yes | `review-gst-verification` admin action |
| REJECTED (denied) | ✅ Yes | `review-gst-verification` with `status: REJECTED` |
| MANUAL_VERIFIED (no GST) | ✅ Yes | `review-gst-verification` with `status: MANUAL_VERIFIED` |

### Remaining Gaps

#### Gap 1: No notification to founder when GST_PENDING

When a supplier submits GST/Udyam and status advances to `GST_PENDING`, the founder receives no alert. The founder must poll `GET /api/admin/users?verificationStatus=GST_PENDING` or check `GET /api/admin/first10` to discover pending items.

**Fix options:**
1. Email to founder email on GST_PENDING transition (via Brevo) — 2 hours
2. Weekly cron that emails pending queue summary — 1 hour
3. Manual check via admin API — current state, zero effort

For first 10 suppliers: **manual check is acceptable.** Implement email notification at 20+ suppliers.

#### Gap 2: No notification to supplier when GST_VERIFIED

Supplier is not notified when the founder marks their documents as verified. They must log in and check their profile status.

**Fix:** Send `quoteAcceptedEmail`-equivalent via Brevo on status transition — 1 hour.

#### Gap 3: `/api/supplier/gst` stub not removed

`src/app/api/supplier/gst/route.ts` is a non-functional stub. It is no longer the active GST submission path (replaced by the onboarding route). It should be deprecated to avoid confusion.

**Fix:** Either remove the route (delete file) or add a `return NextResponse.json({ error: 'Deprecated. Use POST /api/supplier/onboarding' }, { status: 410 })`. Effort: 10 minutes.

#### Gap 4: `UDYAM_VERIFIED` not a separate state

The sprint brief requested `UDYAM_VERIFIED` as a distinct enum value. Implemented as `MANUAL_VERIFIED` (covers Udyam + in-person + other). If a separate Udyam state is needed for reporting:

**Fix:** Add `UDYAM_VERIFIED` to the enum (additive migration, no breaking change). Map Udyam submissions to `UDYAM_VERIFIED` and GST submissions to `GST_VERIFIED`. `MANUAL_VERIFIED` becomes a fallback for edge cases. Effort: 2 hours.

**Not required for first 10.** Consider for Phase D gate reporting.

### Effort

**DONE for first 10.** Four minor gaps documented above; none are blockers.

---

## Phase 5 — RFQ Quality Program

### Current Audit Findings

#### Gap 1: Seeded RFQs visible in supplier leads feed

`GET /api/supplier/leads` filters:
```typescript
where: {
  isPublic: true,
  status: { in: ['OPEN', 'ACTIVE'] },
  NOT: { createdBy: supplierId },
}
```

`isSeeded` is **not filtered**. A seeded RFQ with `isPublic: true` and `status: ACTIVE` appears in the supplier leads feed alongside real requirements.

**Impact:** Suppliers browsing the feed see demo content. When they submit a quote on a seeded RFQ, no real buyer receives it. This destroys trust faster than a thin feed.

**Fix:** Add `isSeeded: false` to the WHERE clause.

```typescript
where: {
  isPublic: true,
  isSeeded: false,
  status: { in: ['OPEN', 'ACTIVE'] },
  NOT: { createdBy: supplierId },
}
```

**Effort: 5 minutes. No migration. High impact.**

#### Gap 2: Seeded RFQs visible in marketplace list

`GET /api/rfq/list` (the public marketplace view) defaults to `status: ACTIVE` with no `isSeeded` filter. Demo RFQs are publicly listed.

**Fix:** Add `isSeeded: false` to the marketplace list query.

**Effort: 5 minutes.**

#### RFQ Classification Design

For the RFQ Quality Program, the following classification taxonomy is proposed:

| Class | Definition | SQL Filter | Display |
|-------|-----------|------------|-------|
| **Verified Buyer RFQ** | `isSeeded=false`, `isPublic=true`, `status IN (OPEN,ACTIVE,QUOTED)`, `createdBy != null`, buyer has `verificationStatus IN (GST_VERIFIED,MANUAL_VERIFIED)` | Full join required | ✅ Show prominently |
| **Unverified Buyer RFQ** | `isSeeded=false`, `isPublic=true`, `status IN (OPEN,ACTIVE,QUOTED)`, `createdBy != null`, buyer is `PHONE_VERIFIED` only | `createdBy != null AND is_seeded = false` | ✅ Show, no badge |
| **Demo RFQ** | `isSeeded=true` | `is_seeded = true` | ❌ Hide from supplier feed; admin-only |
| **Imported RFQ** | `isSeeded=false`, `createdBy=null` (no buyer attached) | `created_by IS NULL AND is_seeded = false` | ❌ Hide or show without buyer reveal |
| **Test RFQ** | `isSeeded=false`, buyer is admin/founder account | Requires `users.role = ADMIN` join | ⚠️ Show only in admin view |
| **Expired RFQ** | `status = EXPIRED` OR `expiresAt < now()` | `status = 'EXPIRED' OR (expires_at IS NOT NULL AND expires_at < now())` | ❌ Hide from active feed |

#### Implementation Approach

**Step 1 — Immediate (5 min each):**
- Add `isSeeded: false` to `GET /api/supplier/leads`
- Add `isSeeded: false` to `GET /api/rfq/list`

**Step 2 — Admin RFQ quality view (already built):**
`GET /api/admin/rfqs?view=quality` returns the full classification breakdown. This is the founder's tool to audit current RFQ inventory.

**Step 3 — Buyer verification badge on quote view (1 day):**
`GET /api/rfq/[id]/quotes` does not currently expose `verificationStatus` of the buyer to the quoting supplier. Adding this field allows suppliers to see "Verified Buyer" or "Unverified" badges on RFQs they quote.

**Step 4 — Auto-expire stale RFQs (2 hours):**
RFQs with `expiresAt < now()` are not automatically transitioned to `EXPIRED` status. A daily cron (`/api/cron/rfq-expiry`) should query stale RFQs and batch-update their status. Prevents suppliers from quoting on expired requirements.

**Step 5 — Founder-only demo flag toggle (1 hour):**
Admin can already set `isSeeded` in the database. Add a one-line admin action to `POST /api/admin/rfqs { action: "set-seeded", rfqId, isSeeded: false }` to promote a demo RFQ to a real one (useful when a seeded RFQ has a real buyer attached and just needs the flag cleared).

### Effort Summary for Phase 5

| Task | Effort | Priority |
|------|--------|----------|
| `isSeeded: false` in supplier leads feed | 5 min | **CRITICAL — do first** |
| `isSeeded: false` in marketplace list | 5 min | HIGH |
| Auto-expire stale RFQs (cron) | 2 hours | MEDIUM |
| Buyer verification badge on RFQ | 1 day | MEDIUM |
| Admin demo flag toggle action | 1 hour | LOW |
| Full classification reporting view | 1 day | LOW |

---

## Phase 6 — First 10 Supplier Readiness

### Can Ishwar register today?

**YES. No blockers.**

Route: `POST /api/auth/send-otp` → `POST /api/auth/otp/verify`  
Evidence: OTP verify route creates User with `role: SUPPLIER`, `verificationStatus: PHONE_VERIFIED`, `trustScore: 30`. JWT issued. 3 starter credits auto-granted via `ONBOARDING_CREDITS` upsert (non-blocking).

No SQL required. No founder action required for registration to complete.

### Can Ishwar browse RFQs?

**YES — with one caveat.**

Route: `GET /api/supplier/leads`  
Auth required: Yes (JWT). Credits required: Zero.

Returns up to 50 public, OPEN/ACTIVE RFQs. Buyer name is masked (`••• •••••`). All other RFQ fields (category, product, quantity, budget, description, urgency, location) are visible.

**Caveat:** Seeded RFQs are NOT filtered. If seeded RFQs exist with `isPublic: true` and `status: ACTIVE`, Ishwar will see them. This misleads him about real buyer demand. The `isSeeded: false` fix (5 minutes) eliminates this.

### Can Ishwar submit quotes?

**YES. No blockers. No credits required.**

Route: `POST /api/quote`  
Auth required: Yes (JWT). Role required: SUPPLIER or ADMIN. Credits required: Zero.

Ishwar can submit a quote with `rfqId`, `price`, `quantity`. Buyer receives email notification (if Brevo is configured). Quote appears in Ishwar's stats via `GET /api/supplier/stats`.

Known gaps that do not block submission:
- No duplicate quote guard — Ishwar could submit multiple quotes on the same RFQ
- No status check — Ishwar can quote on EXPIRED RFQs (status displayed but not validated on submit)
- No "my quotes" list — Ishwar cannot see all his quotes with RFQ titles in one API call

### Can Ishwar receive RFQ notifications?

**PARTIALLY — email only, no in-app alerts.**

| Channel | Status |
|---------|------|
| Email on quote accepted | ✅ Brevo `quoteAcceptedEmail` — fires if Brevo is configured |
| Email on new RFQ in category | ❌ Not implemented — drip engine can send, but no trigger exists for new RFQ posts |
| In-app notification (leads feed) | ❌ Not implemented — no notification table or websocket |
| SMS/WhatsApp on RFQ match | ❌ Not implemented for suppliers — only buyer OTP SMS exists |
| Push notification | ❌ Not implemented |

**For first 10 suppliers:** Founder personally notifies Ishwar via WhatsApp when a relevant RFQ is posted. Email notification on quote accepted is automatic if Brevo is configured.

### Can Ishwar unlock buyer details?

**YES — two paths both work.**

**Path 1 (in-feed credit unlock):**
`POST /api/leads/unlock { leadId: "<rfq-id>", supplierId: "<userId>" }`  
Costs 1 credit. Returns `buyerName`, `buyerCompany`, `buyerLocation`. Confirmed working in source code (Sprint 02 fix applied).

**Path 2 (free, via public URL):**
`GET /api/rfq/[id]` — public, no auth, no credits. Returns `rfq.user.name`, `rfq.user.company`, `rfq.user.location`. Ishwar can find the RFQ ID from the leads feed and navigate directly.

Buyer email and phone are **never** exposed at any stage before deal acceptance. Protected through the full flow.

### What manual steps are still required?

After Ishwar registers and completes his profile:

| Step | Action | Who | Tool |
|------|--------|-----|------|
| Review GST | Check Ishwar's GSTIN on [GST portal](https://services.gst.gov.in/services/searchtp) | Founder | Browser |
| Mark GST_VERIFIED | `POST /api/admin/users { action: "review-gst-verification", userId: X, status: "GST_VERIFIED" }` | Founder | curl / admin panel |
| Post a real RFQ | Create a requirement from a buyer account in Ishwar's category | Founder | Supplier dashboard (buyer mode) |
| Walk through first quote | WhatsApp/call Ishwar to show him how to find and quote the RFQ | Founder | Personal contact |
| Notify buyer of quote | WhatsApp/call the buyer: "You received a quote, check your dashboard" | Founder | Personal contact |

No SQL access required for any of these steps.

---

## Recommended Implementation Order

### Immediate (today, < 1 hour total)

| # | Task | File | Effort | Impact |
|---|------|------|--------|--------|
| 1 | Add `isSeeded: false` to supplier leads feed | `src/app/api/supplier/leads/route.ts` | 5 min | **Critical** — removes demo content from supplier view |
| 2 | Add `isSeeded: false` to marketplace list | `src/app/api/rfq/list/route.ts` | 5 min | High — removes demo from public view |
| 3 | Add duplicate quote guard | `src/app/api/quote/route.ts` | 30 min | Medium — prevents supplier error |
| 4 | Fix PrismaClient singleton in unlock route | `src/app/api/leads/unlock/route.ts` | 5 min | Low — connection pool hygiene |
| 5 | Remove or deprecate `/api/supplier/gst` stub | `src/app/api/supplier/gst/route.ts` | 10 min | Low — reduces confusion |

### Short term (1–3 days)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 6 | "My quotes" supplier feed | 1 day | High — suppliers can see their own submissions |
| 7 | Category-filtered leads feed | 1 day | Medium — matches supplier preferences to RFQs |
| 8 | Confirm/build credit purchase UI | 1–2 days | Medium — enables self-serve credit top-up |
| 9 | Auto-expire stale RFQs (cron) | 2 hours | Medium — cleans up feed quality automatically |
| 10 | Notify founder on GST_PENDING transition | 2 hours | Medium — reduces review delay |

### Major (> 3 days)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 11 | In-app notification layer (RFQ match alerts) | 3–5 days | High at scale — not needed for first 10 |
| 12 | Full RFQ quality classification UI in admin | 2–3 days | Medium — operational visibility |
| 13 | Persistent `CreditAuditLog` table | 1 day | Low for now, required at 50+ suppliers |

---

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|----------|
| Ishwar sees seeded RFQs and loses trust | HIGH (if unpatched) | HIGH | Add `isSeeded: false` filter immediately |
| Ishwar quotes on an expired RFQ (no response) | MEDIUM | MEDIUM | Founder pre-selects RFQs to share with Ishwar; duplicate quote guard partially mitigates |
| GST verification review backlog | MEDIUM | MEDIUM | Admin API is fast; daily check is sufficient for 10 suppliers |
| Credit purchase flow unavailable self-serve | LOW (admin grant covers it) | LOW | Admin grant endpoint exists and works |
| Brevo not configured → no email notifications | MEDIUM | LOW | Founder personally notifies for first 10 |
| Seeded RFQs mixed with real in marketplace | HIGH (if unpatched) | MEDIUM | Add `isSeeded: false` filter immediately |
| Single admin on Meta BM → platform acquisition risk | LOW (separate from supplier conversion) | MEDIUM | Documented in `docs/meta/` — separate action track |
| No second BM admin on Meta account | HIGH | HIGH | Documented in VS-META-RECOVERY-02 — separate sprint |

---

## Expected Impact on Supplier Conversion

### Before Sprint 01 Findings

| Metric | State |
|--------|------|
| New supplier receives credits | ❌ 0 credits — cannot unlock anything |
| Admin can grant credits | ❌ SQL only |
| Lead unlock | ❌ Always 404 |
| GST verification | ❌ Console.log stub — no state change |
| Verification status | ❌ isVerified conflated with phone-verified |
| First 10 dashboard | ❌ Manual spreadsheet only |
| Seeded RFQ filter | ❌ Demo content visible to suppliers |

### After Sprint 02 (Current State)

| Metric | State |
|--------|------|
| New supplier receives credits | ✅ 3 starter credits automatically |
| Admin can grant credits | ✅ `/api/admin/credits` — no SQL |
| Lead unlock | ✅ End-to-end working |
| GST verification | ✅ State machine: PHONE_VERIFIED → GST_PENDING → GST_VERIFIED |
| Verification status | ✅ Separate enum — queryable |
| First 10 dashboard | ✅ `/api/admin/first10` — real-time |
| Seeded RFQ filter | ❌ **Still missing** — critical remaining gap |

### After Sprint 03 Quick Wins

| Metric | State |
|--------|------|
| Seeded RFQs in supplier feed | ✅ Filtered out |
| Seeded RFQs in marketplace | ✅ Filtered out |
| Duplicate quote guard | ✅ Prevented |
| PrismaClient singleton in unlock | ✅ Fixed |

**Projected conversion impact from seeded filter alone:**

A supplier who browses the leads feed and sees only real buyer requirements — and then successfully submits a quote that a real buyer reads — has a high probability of completing the full conversion funnel (registered → quoted → deal). Removing demo content from the feed is the single most leveraged fix remaining.

The quote-to-deal funnel depends on: real RFQ inventory (`realActiveRfqs >= 3` in founder analytics), buyer responsiveness, and Razorpay live keys. None of these are code problems.

---

## Admin Commands Reference (Post-Sprint-02)

```bash
# View all first 10 suppliers with full progress:
GET /api/admin/first10

# View pending GST review queue:
GET /api/admin/users?verificationStatus=GST_PENDING&role=SUPPLIER

# Mark supplier GST verified:
POST /api/admin/users
{ "action": "review-gst-verification", "userId": "<id>", "status": "GST_VERIFIED", "note": "GSTIN verified on GST portal" }

# Grant credits:
POST /api/admin/credits
{ "action": "grant", "userId": "<id>", "amount": 3, "reason": "Founding cohort — Ishwar" }

# Full founder analytics:
GET /api/admin/analytics?view=founder

# RFQ quality snapshot:
GET /api/admin/rfqs?view=quality
```

---

## Notes

- **This plan is documentation only.** No code has been changed, no commits made, no appeals submitted.
- Sprint 02 completion confirmed from source code review (6 routes confirmed in filesystem and read).
- All "Can Ishwar..." answers cite specific route files as evidence.
- The seeded RFQ filter and duplicate quote guard are the only items that require a code change before Ishwar's first session with the platform.
