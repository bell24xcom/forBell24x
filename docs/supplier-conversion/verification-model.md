# Supplier Verification Model
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-03  
**Date:** 2026-08-27  
**Status:** IMPLEMENTED (sprint 02 Phase 4)

---

## Problem Statement

`isVerified: true` was set on ALL users immediately upon OTP registration. The field conflated two distinct events:

1. **Phone verification** — OTP confirmed, number is real
2. **Business verification** — GST/Udyam checked by founder

`SELECT count(*) FROM users WHERE role='SUPPLIER' AND isVerified=true` returned ALL registered suppliers, not just founder-reviewed ones.

---

## Implemented Model

### Enum: `VerificationStatus`

```prisma
enum VerificationStatus {
  PHONE_VERIFIED    // Default. OTP registered only.
  GST_PENDING       // Supplier submitted GST/Udyam; awaiting admin review.
  GST_VERIFIED      // Admin confirmed GST number via govt portal.
  MANUAL_VERIFIED   // Founder verified (no GST; e.g. Udyam-only or in-person).
  REJECTED          // Documents invalid or fraudulent.
}
```

Column: `users.verification_status` (default: `PHONE_VERIFIED`)  
Migration: `prisma/migrations/0011_verification_status/migration.sql`

### Backward Compatibility

`isVerified` (boolean) is **unchanged**. All existing code that reads `isVerified` continues to work. The new field is additive.

| Old field | Meaning | Use |
|-----------|---------|-----|
| `isVerified = true` | Phone-OTP verified | Backwards compat only |
| `verificationStatus` | Business verification level | All new queries |

---

## State Transitions

```
OTP Registration
       ↓
 PHONE_VERIFIED  (default for all new users)
       ↓  (supplier submits GST or Udyam via profile)
   GST_PENDING
       ↓                  ↓                  ↓
 GST_VERIFIED      MANUAL_VERIFIED        REJECTED
                                              ↓  (resubmit)
                                          GST_PENDING
```

Special case: founder can set `PHONE_VERIFIED → MANUAL_VERIFIED` directly (for suppliers verified without GST, e.g. street vendors, using Udyam only).

---

## How Each Transition Is Triggered

| Transition | Trigger | Route |
|------------|---------|-------|
| `→ PHONE_VERIFIED` | OTP registration | `POST /api/auth/otp/verify` |
| `PHONE_VERIFIED → GST_PENDING` | Supplier submits GST/Udyam in profile | `POST /api/supplier/onboarding` |
| `GST_PENDING → GST_VERIFIED` | Founder approves via admin | `POST /api/admin/users { action: "review-gst-verification", status: "GST_VERIFIED" }` |
| `GST_PENDING → MANUAL_VERIFIED` | Founder approves without GST | Same route, `status: "MANUAL_VERIFIED"` |
| `GST_PENDING → REJECTED` | Founder rejects documents | Same route, `status: "REJECTED"` |
| `PHONE_VERIFIED → MANUAL_VERIFIED` | Founder manually verifies | Same route |
| `REJECTED → GST_PENDING` | Supplier resubmits profile | `POST /api/supplier/onboarding` |

---

## Correct Query for "Founder-Reviewed Suppliers"

```sql
-- Business-verified suppliers (founder confirmed documents):
SELECT count(*) FROM "users"
WHERE role = 'SUPPLIER'
  AND "verification_status" IN ('GST_VERIFIED', 'MANUAL_VERIFIED');

-- Full breakdown:
SELECT verification_status, count(*) as count
FROM "users"
WHERE role = 'SUPPLIER'
GROUP BY verification_status
ORDER BY count DESC;

-- Pending review queue:
SELECT id, name, phone, company, gst_number, udyam_number
FROM "users"
WHERE role = 'SUPPLIER'
  AND verification_status = 'GST_PENDING'
ORDER BY created_at ASC;
```

---

## Admin API Operations

### Mark supplier GST verified (after manual check on govt portal):
```bash
POST /api/admin/users
{
  "action": "review-gst-verification",
  "userId": "<supplierId>",
  "status": "GST_VERIFIED",
  "note": "GSTIN 24XXXXX verified — matches company name"
}
```

### View pending review queue:
```bash
GET /api/admin/users?verificationStatus=GST_PENDING&role=SUPPLIER
```

### View verification status in user list:
`verificationStatus` is now returned in every user row in `GET /api/admin/users`.

---

## Manual GST Verification Process (No Paid API)

1. Open [GST Search Portal](https://services.gst.gov.in/services/searchtp)
2. Enter the supplier's GSTIN from `gstNumber` field
3. Confirm: legal name matches `company` field, status is "Active"
4. Call `review-gst-verification` with `status: GST_VERIFIED`

For Udyam:
1. Open [Udyam Verification Portal](https://udyamregistration.gov.in/UdyamSearch)
2. Verify the registration number
3. Call `review-gst-verification` with `status: GST_VERIFIED` or `MANUAL_VERIFIED`

---

## Requested vs Implemented Enum Difference

The sprint brief requested: `UNVERIFIED | PHONE_VERIFIED | GST_VERIFIED | UDYAM_VERIFIED`

What was implemented: `PHONE_VERIFIED | GST_PENDING | GST_VERIFIED | MANUAL_VERIFIED | REJECTED`

**Rationale for differences:**

| Requested | Implemented | Reason |
|-----------|-------------|--------|
| `UNVERIFIED` | (absent — use `PHONE_VERIFIED` default) | All OTP-registered users are phone-verified; "unverified" would only apply to imported leads before they claim — tracked separately via `isClaimed` |
| `UDYAM_VERIFIED` | `MANUAL_VERIFIED` | Udyam + in-person + other non-GST verifications share the same business outcome: founder confirmed identity. Splitting by document type adds complexity with no operational benefit |
| (absent) | `GST_PENDING` | Critical intermediate state: captures "supplier submitted documents, founder has not yet reviewed" — without this state the review queue is unqueryable |
| (absent) | `REJECTED` | Needed for fraudulent/mismatched document cases; without it there is no recoverable error state |

If a clean `UDYAM_VERIFIED` state is needed separately, it can be added to the enum without a breaking migration (additive only).
