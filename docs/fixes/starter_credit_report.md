# Starter Credits on Registration — Fix Report
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-02  
**Phase:** 2  
**Date:** 2026-08-27  
**File changed:** `src/app/api/auth/otp/verify/route.ts`

---

## Problem

New suppliers registered with 0 credits. The `UserCredits` row was never created on registration. This meant:
- Suppliers could not unlock buyer names in the leads feed even if they wanted to
- Every first-time credit check returned "Insufficient credits"
- The founder had to run raw SQL to grant credits for every supplier in the first 10 cohort

---

## Fix Applied

After successful user creation (new users only — not existing users logging back in), the route now calls `prisma.userCredits.upsert` to grant starter credits:

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

**Design decisions:**

- **Env-configurable:** `ONBOARDING_CREDITS` env var. Defaults to `3`. Set to `0` to disable grants without code changes.
- **Non-blocking:** Credit upsert failure does NOT prevent registration. Auth still returns 200. Error is logged.
- **Idempotent via upsert:** If the `UserCredits` row somehow already exists, it increments rather than fails.
- **New users only:** The credit grant is inside the `if (!user)` branch. Existing users logging in do not receive additional credits.
- **Uses `authLogger`:** Failures surface in the auth log for visibility.

---

## Environment Variable

Add to `.env.local` and Vercel environment settings:

```
ONBOARDING_CREDITS=3
```

Valid values:
- `3` — default; 3 free unlock credits per new supplier
- `0` — disables automatic grants entirely
- Any positive integer — grants that many credits

---

## Impact

- Every new supplier who registers via OTP now receives 3 credits automatically
- No SQL required for first 10 supplier cohort
- Combined with the Phase 1 unlock fix: a new supplier can immediately unlock 3 buyer names in the leads feed after registering

---

## Manual SQL (No Longer Required)

The SQL from `first10_supplier_readiness.md` is now automated:
```sql
-- No longer needed for new registrations:
INSERT INTO "user_credits" ...
ON CONFLICT ("user_id") DO UPDATE SET "credits" = "user_credits"."credits" + 3 ...
```

This SQL remains valid for retroactively crediting existing suppliers registered before this fix.

---

## Remaining Gaps

- Admin credit management UI (Phase 3) — for manual grants to existing suppliers and adjustments
- `isVerified` conflation (Phase 4)
