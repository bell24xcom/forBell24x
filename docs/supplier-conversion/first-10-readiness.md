# First 10 Supplier Readiness Audit
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-03  
**Date:** 2026-08-27  
**Mode:** Evidence-first — all claims cite source route or schema field.

---

## Complete Onboarding Journey

### Step 1 — Supplier Registration (OTP)

**Route:** `POST /api/auth/send-otp` → `POST /api/auth/otp/verify`  
**Status:** ✅ WORKING

What happens:
- Supplier enters phone number → MSG91 sends 6-digit OTP
- On verify: new User row created with `role: SUPPLIER`, `isVerified: true`, `trustScore: 30`, `verificationStatus: PHONE_VERIFIED`
- JWT issued, stored in `auth-token` cookie + localStorage
- **3 starter credits auto-granted** (ONBOARDING_CREDITS env var, default 3)

Friction points:
- Email defaults to `{phone}@bell24h.com` — not a real email; Brevo drip targeting is phone-based only
- `name` defaults to `User {last4digits}` — requires profile completion to be useful
- OTP expires after a short window (no retry timer shown to user)

---

### Step 2 — Profile Completion

**Route:** `POST /api/supplier/onboarding`  
**Status:** ✅ WORKING

Required fields: `company`, `categories` (≥1), `city`  
Optional: `businessType`, `gstNumber`, `udyamNumber`, `state`, `pinCode`, `description`

Trust score bonuses:
| Field | Bonus |
|-------|-------|
| GST + gstVerified=true | +30 |
| GST only (self-reported) | +15 |
| Udyam number | +10 |
| Description > 50 chars | +10 |
| ≥2 categories | +5 |

Verification status transition:
- If GST or Udyam submitted AND current status is `PHONE_VERIFIED` → advances to `GST_PENDING`
- Does NOT overwrite `GST_VERIFIED`, `MANUAL_VERIFIED`, or `REJECTED`

Friction points:
- No frontend form validation error messages from the API are surfaced to the UI (API returns 400 but UI may not display it)
- `state` not required at API level — `location` stored as `"{city}, {state}"` with undefined if state blank

**Profile completeness score** (`/api/supplier/stats`):
- 20 pts each for: name, company, GST number, location, phone → max 100

---

### Step 3 — Browse RFQs (Leads Feed)

**Route:** `GET /api/supplier/leads`  
**Auth required:** Yes (JWT)  
**Credits required:** Zero

Returns up to 50 public, OPEN/ACTIVE RFQs ordered by newest. Excludes supplier's own RFQs.

Fields visible with 0 credits:
- Category, product/title, quantity, budget, description, urgency, location, status, createdAt
- Buyer name: `••• •••••` (masked)
- Buyer company: `••••••• •••` (masked)
- Credit balance returned in response

Friction points:
- Limit: 50 RFQs hardcoded — no pagination
- No category filter in API — supplier sees all categories even if their preferences are set to 2 categories
- Buyer name masked in feed (intentional for credit unlock), but visible for free via the full RFQ URL

---

### Step 4 — View Full RFQ Detail

**Route:** `GET /api/rfq/[id]`  
**Auth required:** No (public)  
**Credits required:** Zero

All fields visible including buyer name, company, location.  
View count auto-increments on each fetch.

Friction points:
- Supplier must know/find the RFQ ID from the leads feed — not auto-linked in feed UI
- `isSeeded` RFQs visible if supplier navigates directly (no filter on this route)

---

### Step 5 — Submit a Quote

**Route:** `POST /api/quote`  
**Auth required:** Yes (JWT)  
**Credits required:** Zero  
**Role required:** SUPPLIER or ADMIN

Required fields: `rfqId`, `price`, `quantity`  
Optional: `description`, `terms`, `deliveryDays`

What happens:
- Quote created with `status: PENDING`
- Buyer receives email notification (if Brevo configured)

Friction points:
- No check that the RFQ is still OPEN/ACTIVE — supplier can quote on EXPIRED RFQs
- No duplicate quote guard — supplier can submit multiple quotes on the same RFQ
- No delivery timeline validation (any integer accepted)

---

### Step 6 — Track Quote Status

**Route:** `GET /api/supplier/stats`  
**Auth required:** Yes (JWT)  
**Credits required:** Zero

Returns: `activeQuotes` (PENDING), `wonQuotes` (ACCEPTED), `totalQuotes`, `dealsCompleted`.

Also: `GET /api/rfq/quotes?rfqId=xxx` — returns all quotes on a specific RFQ including supplier name, company, email, phone, trustScore.

Friction points:
- No "my quotes" feed — supplier cannot list all their own quotes with RFQ titles in one call
- Quote acceptance notification: email sent via Brevo (`quoteAcceptedEmail`) — dependent on Brevo being configured

---

## Friction Summary

| Step | Status | Blocker? | Fix Effort |
|------|--------|----------|------------|
| OTP registration | ✅ Works | No | — |
| Starter credits (3) | ✅ Fixed (sprint 02) | No | — |
| Profile completion | ✅ Works | No | — |
| GST → PENDING status | ✅ Fixed (sprint 02) | No | — |
| Browse RFQ feed | ✅ Works | No | — |
| Unlock buyer name in feed | ✅ Fixed (sprint 02) | No | Costs 1 credit |
| View full RFQ (buyer visible) | ✅ Works | No | Free forever |
| Submit quote | ✅ Works | No | — |
| Track quote status | ✅ Works | Limited | No "my quotes" list |
| GST admin verification | ✅ Fixed (sprint 02) | No | Manual by founder |
| Credit grant (admin) | ✅ Fixed (sprint 02) | No | Via /api/admin/credits |
| In-app notification on RFQ match | ❌ ABSENT | Soft | Email only |
| Pagination on leads feed | ❌ ABSENT | Soft | No |
| Category-filtered leads | ❌ ABSENT | Soft | No |
| Duplicate quote guard | ❌ ABSENT | Soft | No |

---

## What Ishwar (Supplier #1) Can Do Today Without Any SQL

1. Register via OTP → receives 3 credits automatically
2. Complete profile with GST → verificationStatus advances to GST_PENDING
3. Browse 50 most recent requirements — see all details except buyer name
4. Click through to any RFQ URL → see buyer name/company/location for free
5. Submit a quotation — no credits, no fees
6. Spend 1 credit to reveal buyer name in the feed itself
7. Track pending quotes via dashboard stats

**Remaining manual founder action:**
- Review GST and mark `GST_VERIFIED` via `POST /api/admin/users { action: "review-gst-verification" }`
