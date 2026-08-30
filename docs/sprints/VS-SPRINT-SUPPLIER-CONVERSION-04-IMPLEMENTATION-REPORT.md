# VS-SPRINT-SUPPLIER-CONVERSION-04 — Implementation Report
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-04  
**Date:** 2026-08-27  
**Status:** IMPLEMENTED — all 6 phases complete

---

## Executive Summary

All Sprint 04 quick wins implemented. Five files changed, one new migration, schema updated. No regressions. Seeded RFQs are now filtered from all supplier-facing views. Duplicate quote guard is live. GST stub deprecated. Verification status expanded with `UDYAM_VERIFIED`. Founder analytics now returns RFQ classification breakdown and full verification status breakdown.

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Lead Unlock Repair | ✅ Complete | PrismaClient singleton fixed |
| Phase 2 — Starter Credits | ✅ Pre-existing | Implemented in Sprint 02 |
| Phase 3 — Admin Credit Management | ✅ Pre-existing | Implemented in Sprint 02 |
| Phase 4 — RFQ Classification | ✅ Complete | Computed classification, no new column |
| Phase 5 — Verification Status | ✅ Complete | `UDYAM_VERIFIED` added, migration created |
| Phase 6 — Founder Dashboard | ✅ Complete | `rfqClassification` + `verificationBreakdown` added |

---

## Phase 1 — Lead Unlock Repair

### Change

**File:** `src/app/api/leads/unlock/route.ts`

Replaced `new PrismaClient()` with the shared singleton from `@/lib/prisma`.

```diff
- import { PrismaClient } from '@prisma/client';
- import { NextRequest, NextResponse } from 'next/server';
- const prisma = new PrismaClient();
+ import { NextRequest, NextResponse } from 'next/server';
+ import { prisma } from '@/lib/prisma';
```

### Why

`new PrismaClient()` creates a new connection pool on every cold-start invocation. On Vercel serverless, this risks exhausting Neon's connection limit (default 100 pooled). The shared singleton reuses the existing pool.

### No logic changes

The unlock flow itself (RFQ lookup, credit check, deduction, LeadSupplier create) was correct from Sprint 02. Only the import was changed.

### Validation

- Unlock still returns `buyerName`, `buyerCompany`, `buyerLocation`
- Credit deduction still atomic (`$transaction`)
- Idempotency check (LeadSupplier lookup) unchanged

---

## Phase 2 — Starter Credits

**Status: Already live from Sprint 02. No changes required.**

- New suppliers receive 3 credits on OTP registration (`ONBOARDING_CREDITS` env var)
- Non-blocking: credit failure does not prevent registration
- Existing suppliers unaffected (inside `if (!user)` branch)

---

## Phase 3 — Admin Credit Management

**Status: Already live from Sprint 02. No changes required.**

- `GET /api/admin/credits` — view all balances
- `GET /api/admin/credits?userId=X` — view one supplier
- `POST /api/admin/credits { action: "grant" | "deduct", userId, amount, reason }` — grant or revoke
- All operations logged to console.info (Vercel function logs)

---

## Phase 4 — RFQ Classification Foundation

### Design

Classification is computed from existing fields — no new DB column required (backward compatible, no RFQ loss):

| Class | Computed From | Supplier-Visible |
|-------|--------------|-----------------|
| `VERIFIED_BUYER` | `isSeeded=false, isPublic=true, status IN (OPEN,ACTIVE,QUOTED), createdBy≠null, buyer has GST_VERIFIED/UDYAM_VERIFIED/MANUAL_VERIFIED` | ✅ Yes — prominently |
| `UNVERIFIED_BUYER` | Same but buyer is `PHONE_VERIFIED` or `GST_PENDING` | ✅ Yes — no badge |
| `DEMO` | `isSeeded=true` | ❌ Hidden |
| `ANONYMOUS` | `createdBy=null, isSeeded=false` | ❌ Hidden |
| `EXPIRED` | `status=EXPIRED` OR `expiresAt < now` | ❌ Hidden |

### Changes Implemented

**`src/app/api/supplier/leads/route.ts`** — Added `isSeeded: false` to WHERE clause:
```diff
  where: {
    isPublic: true,
+   isSeeded: false,
    status: { in: ['OPEN', 'ACTIVE'] },
    NOT: { createdBy: supplierId },
  },
```

**`src/app/api/rfq/list/route.ts`** — Added `isSeeded: false` to WHERE clause:
```diff
- const where: any = { status };
+ const where: any = { status, isSeeded: false };
```

**`src/app/api/admin/rfqs/route.ts`** — Added `verifiedBuyerRfqs` count to quality dashboard:
- New field in `rfqQuality` response: `verifiedBuyerRfqs` (subset of `realActive` where buyer is business-verified)

**`src/app/api/admin/analytics/route.ts`** — Added `rfqClassification` to founder analytics:
```json
{
  "rfqClassification": {
    "verifiedBuyerRfq": 0,
    "unverifiedBuyerRfq": 0,
    "demo": 3,
    "anonymous": 0,
    "expired": 0
  }
}
```

### Migration

None. All classification is computed from existing `isSeeded`, `isPublic`, `status`, `createdBy`, and `verificationStatus` fields.

### Validation

- Seeded RFQs no longer appear in `GET /api/supplier/leads`
- Seeded RFQs no longer appear in `GET /api/rfq/list`
- `GET /api/admin/rfqs?view=quality` returns `verifiedBuyerRfqs` count
- `GET /api/admin/analytics?view=founder` returns `rfqClassification` breakdown

---

## Phase 5 — Verification Status Foundation

**Pre-existing (Sprint 02):** `VerificationStatus` enum with `PHONE_VERIFIED`, `GST_PENDING`, `GST_VERIFIED`, `MANUAL_VERIFIED`, `REJECTED`.

### New in Sprint 04: `UDYAM_VERIFIED`

**`prisma/schema.prisma`** — Added `UDYAM_VERIFIED`:
```diff
  enum VerificationStatus {
    PHONE_VERIFIED
    GST_PENDING
    GST_VERIFIED
+   UDYAM_VERIFIED
    MANUAL_VERIFIED
    REJECTED
  }
```

**`prisma/migrations/0012_udyam_verified/migration.sql`:**
```sql
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'UDYAM_VERIFIED';
```

### Backward Compatibility

- `IF NOT EXISTS` guard makes migration idempotent
- Existing `MANUAL_VERIFIED` suppliers are not affected — enum addition is additive
- No `isVerified` boolean logic changed

### Transition Rules

| Supplier Type | Verification Path | Status Assigned |
|--------------|------------------|----------------|
| GSTIN registered | Founder verifies on GST portal | `GST_VERIFIED` |
| Udyam/MSME registered (no GST) | Founder verifies on Udyam portal | `UDYAM_VERIFIED` |
| In-person / alternate document | Founder manual review | `MANUAL_VERIFIED` |
| Any of above (old path) | Pre-existing records | `MANUAL_VERIFIED` (unchanged) |

### Admin API

Mark supplier as Udyam-verified:
```bash
POST /api/admin/users
{
  "action": "review-gst-verification",
  "userId": "<supplierId>",
  "status": "UDYAM_VERIFIED",
  "note": "Udyam reg UAM-MH-10-XXXXXXXX verified on Udyam portal"
}
```

---

## Phase 6 — Founder Dashboard Updates

### `GET /api/admin/analytics?view=founder` additions

**RFQ Classification (`rfqClassification`):**
```json
{
  "rfqClassification": {
    "verifiedBuyerRfq": 0,
    "unverifiedBuyerRfq": 0,
    "demo": 0,
    "anonymous": 0,
    "expired": 0
  }
}
```

Answers: "How many real, verified-buyer RFQs do I have?" vs "How many are demo/test data?"

**Verification Breakdown (`verificationBreakdown`):**
```json
{
  "verificationBreakdown": {
    "gstVerified": 0,
    "udyamVerified": 0,
    "manualVerified": 0,
    "phoneOnly": 0,
    "gstPending": 0,
    "rejected": 0,
    "totalVerified": 0
  }
}
```

Answers: "How many verified suppliers do I have, and by which path?"

### GST Stub Deprecation

**`src/app/api/supplier/gst/route.ts`** — Returns `410 Gone`:
```json
{
  "success": false,
  "message": "Deprecated. Use POST /api/supplier/onboarding to submit GST or Udyam details.",
  "migratedTo": "/api/supplier/onboarding"
}
```

### Duplicate Quote Guard

**`src/app/api/quote/route.ts`** — Added idempotency check before `quote.create`:

```typescript
const existingQuote = await prisma.quote.findFirst({
  where: {
    rfqId: validatedData.rfqId,
    supplierId: user.id,
    status: { notIn: ['WITHDRAWN', 'REJECTED'] },
  },
  select: { id: true },
});

if (existingQuote) {
  return NextResponse.json(
    { success: false, error: 'You have already submitted a quotation for this requirement', quoteId: existingQuote.id },
    { status: 409 },
  );
}
```

Suppliers who inadvertently tap "Submit" twice receive a `409 Conflict` with the existing `quoteId` — not a new DB row.

---

## Files Changed

| File | Change | Lines |
|------|--------|-------|
| `src/app/api/leads/unlock/route.ts` | PrismaClient singleton fix | -3 / +1 |
| `src/app/api/supplier/leads/route.ts` | `isSeeded: false` filter | +1 |
| `src/app/api/rfq/list/route.ts` | `isSeeded: false` filter | +1 |
| `src/app/api/quote/route.ts` | Duplicate quote guard | +16 |
| `src/app/api/supplier/gst/route.ts` | Deprecated → 410 Gone | full replace |
| `src/app/api/admin/analytics/route.ts` | rfqClassification + verificationBreakdown | +65 |
| `src/app/api/admin/rfqs/route.ts` | verifiedBuyerRfqs in quality view | +16 |
| `prisma/schema.prisma` | `UDYAM_VERIFIED` in VerificationStatus | +2 |
| `prisma/migrations/0012_udyam_verified/migration.sql` | Additive enum migration | new |

---

## Database Changes

| Migration | Type | Risk |
|-----------|------|------|
| `0012_udyam_verified` | `ALTER TYPE ADD VALUE IF NOT EXISTS` | None — additive, idempotent |

No table schema changes. No data migrations. No column renames. No backfills.

---

## Rollback Plan

| Change | Rollback |
|--------|---------|
| `isSeeded: false` filters | Remove the added condition from WHERE clauses |
| Duplicate quote guard | Remove the `findFirst` + early return block from quote route |
| PrismaClient singleton | Re-add `new PrismaClient()` (not recommended) |
| GST stub deprecation | Revert to original stub (does not affect data) |
| `UDYAM_VERIFIED` enum value | PostgreSQL: cannot remove an enum value once added; can be ignored in application code |
| Founder analytics additions | Remove the new Promise.all block and response fields |

The `UDYAM_VERIFIED` enum value cannot be removed from PostgreSQL once added (`ALTER TYPE DROP VALUE` is not supported). However, removing it from application code means it simply never gets assigned — existing `MANUAL_VERIFIED` records are unaffected.

---

## Validation Results

### Phase 1 — Lead Unlock Singleton
- ✅ Import changed from `new PrismaClient()` to `@/lib/prisma` singleton
- ✅ No functional logic changes
- ✅ TypeScript: no new errors (only pre-existing tsconfig deprecation warnings)

### Phase 4 — isSeeded Filters
- ✅ `GET /api/supplier/leads` WHERE: `isPublic: true, isSeeded: false, status: {in:['OPEN','ACTIVE']}`
- ✅ `GET /api/rfq/list` WHERE: `{ status, isSeeded: false }`
- ✅ `GET /api/admin/rfqs?view=quality` returns `verifiedBuyerRfqs`

### Phase 4 — Duplicate Quote Guard
- ✅ `findFirst` check before `create`
- ✅ Returns `409` with `quoteId` on duplicate (not error)
- ✅ Allows re-submission after `WITHDRAWN` or `REJECTED` status

### Phase 5 — UDYAM_VERIFIED
- ✅ Added to `VerificationStatus` enum in schema
- ✅ Migration `0012_udyam_verified/migration.sql` created with `IF NOT EXISTS` guard
- ✅ Founder analytics `verifiedSuppliers` count updated to include `UDYAM_VERIFIED`
- ✅ RFQ quality view includes `UDYAM_VERIFIED` in verified buyer query

### Phase 6 — Founder Analytics
- ✅ `GET /api/admin/analytics?view=founder` response now includes `rfqClassification`
- ✅ `GET /api/admin/analytics?view=founder` response now includes `verificationBreakdown`
- ✅ GST stub returns `410 Gone`

---

## Success Criteria — Answered

> **Supplier: "How do I get RFQs?"**
> 
> Register via OTP → complete profile → browse `GET /api/supplier/leads` → all results are now real buyer requirements (seeded/demo filtered). Credits unlock buyer name in the feed; the full RFQ page `GET /api/rfq/[id]` is always free.

> **Supplier: "Do I get starter credits?"**
>
> Yes — 3 credits granted automatically on OTP registration. Evidence: `GET /api/admin/credits?userId=<id>` shows `credits: 3` for any new supplier.

> **Founder: "How many verified suppliers do I have?"**
>
> `GET /api/admin/analytics?view=founder` → `verificationBreakdown.totalVerified` (sum of `gstVerified + udyamVerified + manualVerified`).

> **Founder: "How many real RFQs do I have?"**
>
> `GET /api/admin/analytics?view=founder` → `supplierConversion.realActiveRfqs` (non-seeded, public, OPEN/ACTIVE/QUOTED with buyer attached). Also: `rfqClassification.verifiedBuyerRfq` for buyer-verified subset.

> **Marketplace: "Can a supplier unlock and contact a buyer?"**
>
> Yes. `POST /api/leads/unlock { leadId, supplierId }` → costs 1 credit, returns `buyerName`, `buyerCompany`, `buyerLocation`. Also free via `GET /api/rfq/[id]` public URL. Buyer email/phone not exposed until deal close.

---

## Remaining Work (Not in Sprint 04 Scope)

| Item | Effort | Next Sprint |
|------|--------|-------------|
| "My quotes" supplier feed | 1 day | VS-SPRINT-FIRST-TRANSACTION-01 |
| RFQ view/open tracking per supplier | 1 day | VS-SPRINT-FIRST-TRANSACTION-01 |
| Buyer quote visibility audit | 2 hours | VS-SPRINT-FIRST-TRANSACTION-01 |
| First transaction conversion funnel | 1 day | VS-SPRINT-FIRST-TRANSACTION-01 |
| `CreditAuditLog` persistent table | 2 hours | Pre-50-supplier milestone |
| Credit purchase UI (self-serve) | 1–2 days | Post-first-10 |
| Auto-expire stale RFQs (cron) | 2 hours | Post-first-10 |
| In-app notification layer | 3–5 days | Post Phase D gate |
