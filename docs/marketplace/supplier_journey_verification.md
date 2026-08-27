# Supplier Journey Verification
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-FIRST-TRANSACTION-01 — Phase 2  
**Date:** 2026-08-27  
**Mode:** Evidence-first — every claim cites a source route or schema field.

---

## Journey: Registration → First Quote Submitted

### Step 1 — Register (OTP)

**Route:** `POST /api/auth/send-otp` → `POST /api/auth/otp/verify`

**What happens:**
- Phone number normalized: strips `+91`, `91`, spaces, dashes
- OTP validated: checks `isVerified`, `expiresAt`, `attempts < 3`
- On new user: `User` row created with `role: 'SUPPLIER'` (or BUYER — depends on caller)
- `verificationStatus` defaults to `PHONE_VERIFIED`
- `ONBOARDING_CREDITS` credits granted automatically (default: 3)
- JWT returned in response body

**Verified:** `src/app/api/auth/otp/verify/route.ts` — OTP validation, user creation, credit grant

**Result:** Supplier has account, 3 credits, JWT in localStorage.

---

### Step 2 — Complete Profile

**Route:** `POST /api/supplier/onboarding`

**What happens:**
- JWT required (Bearer header)
- Updates: `company`, `location`, `gstNumber`, `udyamNumber`, `businessType`, `categories` (many fields)
- If `gstNumber` or `udyamNumber` submitted: sets `verificationStatus = 'GST_PENDING'`
- Triggers founder review queue

**profileComplete score (from `GET /api/supplier/stats`):**
```
name set:                   20 points
phone set:                  20 points
company set:                20 points
location set:               20 points
verificationStatus ≠ PHONE_VERIFIED: 20 points
Total:                     100 points
```

**Verified:** `src/app/api/supplier/stats/route.ts` — `profileComplete` computation

**Result:** Profile completeness score computable. GST submission creates review queue entry.

---

### Step 3 — Browse Requirements Feed

**Route:** `GET /api/supplier/leads`

**What happens:**
- JWT required
- Returns up to 50 RFQs: `isPublic: true, status: { in: ['OPEN', 'ACTIVE'] }`
- Each RFQ includes: `title`, `description`, `category`, `quantity`, `budget`, `urgency`, `location`, `createdAt`, `_count.quotes`
- Buyer identity: masked as `••• •••••` unless `LeadSupplier.unlocked = true`
- Credit balance included in each row for UI display

**Verified:** `src/app/api/supplier/leads/route.ts`

**Result:** Supplier can see all open requirements without spending credits.

---

### Step 4 — View Full Requirement Detail

**Route:** `GET /api/rfq/[id]`

**What happens:**
- NO auth required — fully public endpoint
- Returns full RFQ record including:
  - `user.name` (buyer's name — **exposed without auth**)
  - `user.company` (buyer's company)
  - `user.location` (buyer's location)
  - All RFQ fields
  - All quotes for this RFQ (with supplier info)
- `views` counter incremented fire-and-forget

**Verified:** `src/app/api/rfq/[id]/route.ts`

**Key finding (Phase 4 subject):** Buyer identity is **fully exposed** on the public detail page. The leads feed masks it as a credit gate, but the full page requires zero auth or credits. A supplier can navigate directly to `/rfq/[id]` to see buyer identity without unlocking.

**Result:** Supplier has full requirement context before committing to quote.

---

### Step 5 — Submit a Quotation

**Route:** `POST /api/quote`

**What happens:**
- JWT required
- Role check: must be `SUPPLIER` or `ADMIN`
- Required body: `rfqId`, `price`, `quantity`
- Optional: `description`, `terms`, `deliveryDays`
- Creates `Quote` row: `status: 'PENDING'`, `source: 'SELF_SUBMITTED'`
- **No credit check**

**Verified:** `src/app/api/quote/route.ts`

**Result:** Supplier can quote immediately after registration with 0 credits. No friction.

---

### Step 6 — Track Quote Status

**Route:** `GET /api/supplier/quotes`

**What happens:**
- JWT required
- Returns all quotes by this supplier
- Includes: `rfq.title`, `rfq.status`, `rfq.user.name`, `rfq.user.company`, `rfq.user.location`
- `QuoteStatus` states: `PENDING | ACCEPTED | REJECTED | EXPIRED`

**Verified:** `src/app/api/supplier/quotes/route.ts`

**Result:** Supplier can see all their quotes and the associated buyer info.

---

## Summary: Blockers Found

| Step | Blocker | Severity |
|------|---------|----------|
| Register | None | ✅ |
| Profile | None (GST pending is expected) | ✅ |
| Browse feed | Seeded RFQs may appear (no isSeeded filter) | ⚠️ Medium |
| View detail | None | ✅ |
| Submit quote | None — zero friction, no credits needed | ✅ |
| Track quote | None | ✅ |

**Critical path is clear.** A supplier can register and submit a quote in under 5 minutes with no credit purchases.

---

## Time-to-First-Quote Estimate

| Step | Time |
|------|------|
| OTP registration | 60–90 seconds |
| Browse feed (optional) | 2–5 minutes |
| View RFQ detail | 30 seconds |
| Submit quote (3 fields minimum) | 60 seconds |
| **Total** | **~5–8 minutes** |

---

## What Blocks Real Supplier Conversion

Based on the journey audit, the conversion is NOT blocked by the technical path. The blockers are:

1. **No real active RFQs** — If `realActiveRfqs = 0`, there is nothing to quote on. The supplier completes registration and sees an empty or demo-filled feed.
2. **Seeded RFQs in feed** — Supplier spends time on demo requirements that have no real buyer.
3. **Pending GST review** — Supplier with `GST_PENDING` status may be uncertain about their platform standing (UX issue, not technical blocker).
4. **Buyer masking in feed** — Minor (can view on full page), but erodes trust if supplier doesn't discover the workaround.
