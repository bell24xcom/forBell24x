# Supplier Verification Model — Fix Report
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-02  
**Phase:** 4  
**Date:** 2026-08-27  
**Files changed:**
- `prisma/schema.prisma`
- `prisma/migrations/0011_verification_status/migration.sql`
- `src/app/api/auth/otp/verify/route.ts`
- `src/app/api/admin/users/route.ts`

---

## Problem

`isVerified: true` was set on ALL OTP registrations — including users who never submitted a GST number or Udyam certificate. The field conflated two distinct events:

1. **Phone verification** — OTP confirmed, the phone number is real
2. **Business verification** — Founder confirmed the supplier's GST/Udyam

This made it impossible to query "which suppliers have had their business documents reviewed by the founder" without additional manual tracking.

The SQL query `SELECT count(*) FROM users WHERE role='SUPPLIER' AND isVerified=true` returned ALL phone-registered suppliers, not just GST-verified ones.

---

## Fix Applied

### Schema: New Enum + Field

Added `VerificationStatus` enum to `prisma/schema.prisma`:

```prisma
enum VerificationStatus {
  PHONE_VERIFIED   // OTP registered only (default for all new users)
  GST_PENDING      // Supplier submitted GST/Udyam, awaiting admin review
  GST_VERIFIED     // Admin confirmed GST/Udyam number is valid
  MANUAL_VERIFIED  // Founder manually verified (no GST yet, e.g. Udyam-only)
  REJECTED         // Verification failed or fraudulent documents
}
```

Added `verificationStatus` column to `User` model:

```prisma
verificationStatus VerificationStatus @default(PHONE_VERIFIED) @map("verification_status")
```

Migration file: `prisma/migrations/0011_verification_status/migration.sql`

**Backward compatibility:** `isVerified` is unchanged. All existing logic that reads `isVerified` continues to work. The new field is additive.

### OTP Verify Route

`src/app/api/auth/otp/verify/route.ts` — new user creation now explicitly sets:

```typescript
verificationStatus: 'PHONE_VERIFIED',
```

### Admin Users Route

`src/app/api/admin/users/route.ts`:
- User list GET now returns `verificationStatus` in each user row
- User PUT whitelist now includes `verificationStatus` — admin can update it

---

## Using the New Field

### Promote a supplier to GST_VERIFIED (founder marks after document review):

```bash
PUT /api/admin/users
{
  "userId": "<supplierId>",
  "updates": {
    "verificationStatus": "GST_VERIFIED",
    "isVerified": true
  }
}
```

### Count genuinely business-verified suppliers:

```sql
SELECT count(*) FROM "users"
WHERE role = 'SUPPLIER'
  AND "verification_status" IN ('GST_VERIFIED', 'MANUAL_VERIFIED');
```

### Count founder-reviewed vs phone-only:

```sql
SELECT verification_status, count(*) as count
FROM "users"
WHERE role = 'SUPPLIER'
GROUP BY verification_status
ORDER BY count DESC;
```

---

## Valid `verificationStatus` Transitions

| From | To | Trigger |
|------|----|---------|
| `PHONE_VERIFIED` | `GST_PENDING` | Supplier submits GST via onboarding form (Phase 5) |
| `GST_PENDING` | `GST_VERIFIED` | Admin reviews and approves |
| `GST_PENDING` | `REJECTED` | Admin reviews and rejects |
| `PHONE_VERIFIED` | `MANUAL_VERIFIED` | Founder marks manually (no GST, e.g. street vendor) |
| `REJECTED` | `GST_PENDING` | Supplier resubmits |

---

## What isVerified Now Means (Post-Fix)

`isVerified` retains its original meaning: OTP phone-verified. All new users get `isVerified: true` on OTP registration. **Do not read `isVerified` to determine if a supplier's business documents were reviewed** — use `verificationStatus` for that.

For the first 10 cohort tracker query, use:

```sql
SELECT count(*) FROM "users"
WHERE role = 'SUPPLIER'
  AND "verification_status" IN ('GST_VERIFIED', 'MANUAL_VERIFIED');
```

Not: `WHERE isVerified = true` (returns everyone).
