# First 10 Supplier Program — Platform Readiness
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-01  
**Date:** 2026-08-26  

---

## Readiness Summary

| Capability | Status | Manual Work Required? |
|-----------|--------|----------------------|
| Supplier can register via OTP | ✅ READY | No |
| Supplier can complete profile | ✅ READY | No |
| Supplier can browse RFQs | ✅ READY | No |
| Supplier can view full RFQ detail | ✅ READY | No |
| Supplier can submit a quote | ✅ READY | No |
| Supplier gets email on quote accepted | ✅ READY (if Brevo configured) | No |
| GST verification (auto) | ❌ NOT READY | Yes — founder marks manually |
| Founder marks supplier as verified | ✅ READY (admin PUT) | Yes |
| Credit grant to supplier | ❌ NOT READY (no admin UI) | Yes — SQL only |
| Supplier can unlock buyer identity | ❌ BROKEN (wrong table) | Yes — DB fix needed |
| Credit purchase (supplier self-serve) | ❓ UNKNOWN (no frontend confirmed) | Possibly |
| In-app notification on RFQ match | ❌ ABSENT | — |
| Drip engine (Days 3/7/14) | ✅ READY | No |

---

## Per-Supplier Manual Steps (Current Reality)

For each of the first 10 suppliers, the founder must do:

### On Day 0
1. Send wa.me outreach message (from `first_10_supplier_program.md` template)
2. Create claim link if supplier was pre-imported (`/claim/{claimToken}`)

### On Day 1 (after claim/registration)
3. Verify supplier registered: check admin panel (`/api/admin/users?search={phone}`)
4. Walk supplier through profile completion (`/api/supplier/onboarding`)
5. Grant 3 free credits (SQL — see below)
6. Manually set `isVerified: true` after GST/Udyam check:
   ```
   PUT /api/admin/users
   body: { userId: '{supplierId}', updates: { isVerified: true } }
   ```

### On Day 2–3
7. Create a real RFQ in the supplier's category (using founder's buyer account)
8. Walk supplier through quote submission
9. Confirm quote appears in system

### Credit Grant SQL (run in Neon console):
```sql
INSERT INTO "user_credits" ("id", "user_id", "credits", "spent", "created_at", "updated_at")
VALUES (gen_random_uuid()::text, '{supplierId}', 3, 0, now(), now())
ON CONFLICT ("user_id") DO UPDATE 
SET "credits" = "user_credits"."credits" + 3, 
    "updated_at" = now();
```

---

## What "Verified" Actually Means (Code vs Business Intent)

**Code behavior:** `isVerified: true` is set automatically on OTP registration. Every phone-verified user has this flag.

**Business intent:** `isVerified = true` should mean "GST or Udyam checked by founder."

**Current state:** These two meanings are conflated. The query from the program doc:
```sql
SELECT count(*) FROM "User" WHERE role='SUPPLIER' AND "isVerified"=true
```
Returns ALL phone-registered suppliers, not just GST-verified ones.

**Recommendation for first 10:** Add a second flag or use `trustScore >= 50` as the meaningful verification threshold. For now, the founder should maintain a manual spreadsheet of which suppliers have GST confirmed (this is the tracker table in `first_10_supplier_program.md`).

---

## Supplier-Facing Capability Truth

**What a supplier CAN do today with 0 credits:**
- Register (OTP)
- Complete profile
- Browse the RFQ feed (buyer names masked)
- View full RFQ details including buyer name/company (via direct URL)
- Submit a quote

**What a supplier CANNOT do today:**
- Unlock buyer names IN the leads feed (broken)
- See buyer email or phone at any stage before deal acceptance
- Self-serve credit purchase (no confirmed frontend)

**What requires founder manual action:**
- GST verification (set `isVerified: true` via admin)
- Credit grant (SQL)

---

## Recommended Minimum Build Before Supplier #1

The platform can support Ishwar TODAY as-is. But the following 3 fixes reduce manual work significantly:

| Fix | Effort | Impact |
|-----|--------|--------|
| Fix `/api/leads/unlock` (wrong table) | 1 hour | Unlock works via credits |
| Grant 3 credits on OTP registration | 30 min | No SQL for each new supplier |
| Add admin credit grant route | 2 hours | No SQL needed |

These are implementation recommendations. Per sprint rules: **stop here, present findings first.**

---

## Tracking Template for First 10

| # | Supplier | Phone | OTP Verified | Profile Done | isVerified Set | Credits Granted | Quote Submitted | Notes |
|---|----------|-------|--------------|--------------|----------------|-----------------|-----------------|-------|
| 1 | Ishwar | — | — | — | — | — | — | Warm lead, WhatsApp active |
| 2–10 | — | — | — | — | — | — | — | — |

Update this table after each interaction.
