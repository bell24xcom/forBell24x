# Supplier Journey Walkthrough
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-01  
**Date:** 2026-08-26  
**Test case:** Ishwar (warm lead, WhatsApp active)

---

## Journey Map

```
Registration → Profile Completion → Browse RFQs → Submit Quote → Track Quote → Deal → Payment
```

---

## Step 1 — Registration

**Route:** `POST /api/auth/otp/send` → `POST /api/auth/otp/verify`  
**Status: WORKING**

### What happens:
1. Supplier enters phone number
2. MSG91 sends 6-digit OTP
3. On correct OTP, route creates (or updates) a `User` record:

```typescript
user = await prisma.user.create({
  data: {
    phone,
    name: `User ${phone.slice(-4)}`,        // ← generic default name
    email: `${phone}@bell24h.com`,           // ← auto-generated placeholder
    company: '',
    role: 'SUPPLIER',
    isActive: true,
    isVerified: true,                        // ← set to true on OTP (important: see below)
    trustScore: 30,                          // ← base score
    lastLoginAt: new Date(),
  },
});
```

4. JWT stored in `auth-token` cookie (7 days)
5. `UserCredits` row: **not created** — balance defaults to 0

### Blockers: None  
### Notes:
- **`isVerified: true` is set on ALL phone-OTP registrations**, not just GST-verified suppliers. The field name is misleading — it means "phone number verified", not "business verified."
- `email` defaults to `{phone}@bell24h.com` — placeholder, will be replaced when supplier fills profile

---

## Step 2 — Claim Flow (for pre-imported suppliers only)

**Route:** `POST /api/auth/claim`  
**Status: WORKING (but limited)**

Applies only when the supplier was pre-imported by admin (has `isClaimed: false` and a `claimToken`).

### What happens:
1. Supplier authenticates via OTP (Step 1)
2. Client POSTs `{ claimId }` (the pre-imported supplier's user ID)
3. Route copies `company`, `location`, `gstNumber`, preferences from imported profile to the authenticated user
4. Sets imported profile `isClaimed: true, isActive: false` (deactivated)
5. Boosts trust score by up to 20 points from the imported profile

### Blockers: None for this flow  
### Gap: Credits are not granted on claim. New claimed supplier has 0 credits.

---

## Step 3 — Profile Completion

**Route:** `POST /api/supplier/onboarding`  
**Status: WORKING**

Required fields: `company`, `categories` (≥1), `city`

### What happens:
- Updates `User.company`, `User.gstNumber`, `User.udyamNumber`, `User.location`
- Merges into `User.preferences` JSON: `businessType`, `categories`, `pinCode`, `yearsInBusiness`, `description`
- Sets `preferences.onboardingComplete: true`
- Trust score delta:
  - GST number + verified: +30
  - GST number only: +15
  - Udyam number: +10
  - Description > 50 chars: +10
  - ≥2 categories: +5

### Blockers: None  

### Note: `/api/supplier/register` is a STUB
`POST /api/supplier/register` (used by the older registration page) does NOT write to the database. It logs to console and returns a fake supplier ID. Do not use this route. Use OTP auth + onboarding.

---

## Step 4 — GST Verification

**Route:** `POST /api/supplier/gst`  
**Status: BROKEN (stub)**

### What actually happens:
The route validates length (15 chars for GSTIN, 10 for PAN) then:
```typescript
// TODO: Save GST info to database
// TODO: Trigger GST verification via external API
console.log('GST information saved:', { gstin, ... });
return NextResponse.json({ success: true, gst: { status: 'pending_verification' } });
```

**No database write. No external API call. No `isVerified` update.**

### Actual GST verification path:
- `/api/supplier/onboarding` accepts `gstNumber` and `gstVerified` boolean
- If `gstVerified: true` is passed, trust score +30
- `gstVerified` is client-supplied — no server-side validation against GST portal

### Blockers:
- External GST validation API not integrated
- Founder must manually set `isVerified: true` via admin panel for GST-verified suppliers

### Workaround for first 10 suppliers:
```
Admin Panel → Users → [supplier] → PUT { isVerified: true }
Route: PUT /api/admin/users  body: { userId, updates: { isVerified: true } }
```

---

## Step 5 — Browse RFQs

**Route:** `GET /api/supplier/leads`  
**Status: WORKING**

### What supplier sees:
- Auth: JWT required
- Returns up to 50 most recent `OPEN` or `ACTIVE` public RFQs
- Excludes supplier's own RFQs
- Each RFQ: `category`, `title` (product), `quantity`, `budget`, `description`, `urgency`, `location`, `createdAt`
- Buyer name: masked as `••• •••••`
- Buyer company: masked as `••••••• •••`
- Credit balance returned: `credits: userCredits?.credits ?? 0`

### Blockers: None

---

## Step 6 — View Individual RFQ

**Route:** `GET /api/rfq/[id]`  
**Status: WORKING**

### What supplier sees (public, no auth required):
- Full RFQ details including buyer name, company, location
- **No credit needed, no auth needed**
- This means the credit unlock for buyer identity is bypassed for any supplier who knows (or can guess) the RFQ ID

### Blockers: None

---

## Step 7 — Submit Quote

**Route:** `POST /api/rfq/quotes` (or `POST /api/quote`)  
**Status: WORKING — NO credit required**

### Two functional routes:

**`POST /api/rfq/quotes`:**
- Auth required (JWT)
- No role check (any authenticated user)
- Required: `rfqId`, `price`
- Optional: `quantity`, `timeline`, `description`, `terms`, `deliveryDays`, `notes`
- Validates RFQ exists and `isPublic: true`
- Creates `Quote` record with `status: 'PENDING'`

**`POST /api/quote`:**
- Auth required (JWT)
- Role check: `SUPPLIER` or `ADMIN` only
- Validates using Zod schema: `rfqId`, `price`, `quantity` required
- Creates `Quote` record

### Credit check: NONE — suppliers with 0 credits can submit quotes freely.

### Blockers: None for quote submission

---

## Step 8 — Track Quote

**Route:** `GET /api/supplier/quotes`  
**Status: (not read in this audit — lower priority)**

Supplier can check quote status via their dashboard.

---

## Step 9 — Quote Acceptance (Buyer action)

**Route:** `PUT /api/rfq/quotes` body `{ quoteId, action: 'accept' }`  
**Status: WORKING**

On acceptance:
1. Quote → `ACCEPTED`
2. All other quotes for this RFQ → `REJECTED`
3. `Deal` created with `buyerId`, `supplierId`, `rfqId`, `quoteId`, `price`
4. RFQ status → `ACCEPTED`
5. If buyer wallet balance ≥ quote price: amount locked in escrow → Deal status → `ESCROW_LOCKED`
6. Supplier notified via `quoteAcceptedEmail`

### Blockers: None (email depends on Brevo SMTP being configured)

---

## Step 10 — Payment / Protected Payment

**Route:** `POST /api/monetization/pay` (deal payment initiation)  
**Status: WORKING**

- Creates Razorpay order for the deal amount
- Logs transaction with `status: 'created'` to InsForge (if configured)

---

## Journey Summary

| Step | Status | Blocker |
|------|--------|---------|
| 1. OTP Registration | ✅ WORKING | None |
| 2. Claim imported profile | ✅ WORKING | No credits granted on claim |
| 3. Profile completion (onboarding) | ✅ WORKING | None |
| 4. GST verification | ❌ BROKEN | Stub — no DB write, no GST API |
| 5. Browse RFQ feed | ✅ WORKING | None |
| 6. View individual RFQ | ✅ WORKING | None (buyer identity visible without auth) |
| 7. Submit quote | ✅ WORKING | None — no credits needed |
| 8. Track quote | ❓ NOT AUDITED | — |
| 9. Quote accepted (buyer) | ✅ WORKING | Requires buyer to use accept flow |
| 10. Payment / Protected Payment | ✅ WORKING | Requires Razorpay + InsForge env vars |

---

## Critical Findings for Ishwar

1. Ishwar can register via OTP and see RFQs immediately — no blockers.
2. Ishwar can submit a quote without any credits.
3. Ishwar can view buyer company/name on the public RFQ page without spending a credit.
4. GST verification is a stub — founder must manually set `isVerified: true` via admin after Udyam/GST check.
5. Credits are only needed to unlock buyer name on the leads feed — which is already visible free via the direct RFQ URL.
