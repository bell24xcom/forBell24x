# VS-SPRINT-FIRST-TRANSACTION-01: First Transaction Readiness Report

**Date:** 2026-08-27  
**Branch:** `claude/vyaparsethu-outreach-channels-18ghlu`  
**Mode:** EVIDENCE-ONLY. No implementations committed.  
**Status:** 🔴 NOT READY — 3 blocking bugs prevent any first transaction.

---

## Phase 1: Journey Mapping

### Complete Supplier Journey — All Routes & APIs

#### 1.1 Registration & Authentication

| Step | Route | Method | Auth | Notes |
|------|-------|--------|------|-------|
| Send OTP | `/api/auth/send-otp` | POST | None | Delegates to `/api/auth/otp/send` |
| Send OTP (canonical) | `/api/auth/otp/send` | POST | None | Rate-limited: 3/phone/10min; pilot: OTP in response |
| Verify OTP | `/api/auth/verify-otp` | POST | None | Delegates to `/api/auth/otp/verify` |
| Verify OTP (canonical) | `/api/auth/otp/verify` | POST | None | Creates user; grants 3 starter credits; sets `auth-token` cookie |
| Supplier Onboarding | `/api/supplier/onboarding` | POST | JWT | Updates company, categories, city; advances verificationStatus |
| GST Verification | `/api/gst/verify` | POST | JWT | Called from onboarding UI |

**Tables touched:** `User`, `OTPVerification`, `UserCredits`

#### 1.2 Browsing & Leads

| Step | Route | Method | Auth | Notes |
|------|-------|--------|------|-------|
| Browse RFQs (supplier-facing) | `/api/marketplace/rfqs` | GET | None | No `isSeeded:false` filter — seeds leak |
| Browse Leads (locked/unlocked) | `/api/supplier/leads` | GET | JWT (cookie or Bearer) | Returns masked buyer info; includes credit balance |
| Unlock Lead | `/api/leads/unlock` | POST | **NONE** | supplierId from **request body** — critical security hole |

**Tables touched:** `RFQ`, `LeadSupplier`, `UserCredits`

#### 1.3 Quote Submission (Three Competing Endpoints)

| Route | Method | Auth | Updates RFQ status? | Sends email? | Duplicate guard |
|-------|--------|------|---------------------|--------------|------------------|
| `/api/quote` | POST | JWT (getAuthenticatedUser) | No | No | WITHDRAWN/REJECTED excluded |
| `/api/rfq/quotes` | POST | JWT (verifyToken) | No | No | Basic: no status filter |
| `/api/supplier/quotes` | POST | JWT (verifyToken) | Yes → QUOTED | Yes (buyer email) | Basic: no status filter |

**UI used by `browse-rfqs` page:** `/api/supplier/quotes` (correct, most complete)  
**UI used by `my-quotes` page:** `/api/supplier/quotes` GET  
**Tables touched:** `Quote`, `RFQ`, `User`

#### 1.4 Buyer Post-Quote (Quote Review → Deal)

| Step | Route | Method | Auth | Notes |
|------|-------|--------|------|-------|
| Buyer lists their RFQs | `/api/dashboard/rfqs` | GET | JWT | Own RFQs only |
| Buyer views quotes on RFQ | `/api/rfq/[id]/quotes` | GET | JWT | **SCHEMA BUG**: selects `supplier.city` (field doesn't exist) |
| Buyer accepts/rejects quote (path A) | `/api/rfq/quotes` | PUT | JWT | Creates Deal, escrow-locks wallet, sends supplier email |
| Buyer selects deal (path B) | `/api/deal/select` | POST | JWT (getAuthenticatedUser) | Creates Deal, updates quote/RFQ status, records BOM events |
| Checkout / payment | `/checkout/[id]` | Page | n/a | Called after `/api/deal/select` per buyer UI |

**Tables touched:** `Quote`, `Deal`, `Wallet`, `WalletTransaction`, `BusinessLifeEvent`

#### 1.5 Dashboard & Stats

| Route | Notes |
|-------|-------|
| `/api/supplier/stats` | Auth'd; returns activeQuotes, wonQuotes, totalEarned, trustScore, profileComplete |
| `/api/supplier/quotes` GET | Auth'd; supplier's own quotes with RFQ + masked buyer details |
| `/api/dashboard/rfqs` GET | Auth'd; buyer's own RFQs with quote counts |
| `/api/dashboard/quotes` GET | Exists (not deep-read) |
| `/api/dashboard/deals` GET | Exists (not deep-read) |

---

## Phase 2: First Supplier Simulation

### Can a new supplier complete registration?

**Registration flow:** ✅ Structurally functional
- Phone OTP send → verify → JWT → user created with `role: SUPPLIER`, `verificationStatus: PHONE_VERIFIED`, `trustScore: 30`
- Pilot mode (`PILOT_OTP_IN_RESPONSE=true`) enables testing without MSG91
- Auth-token cookie set (httpOnly, 7 days)
- JWT also returned in response body (usable with localStorage)

**Starter credits:** ⚠️ Fragile
- 3 credits granted via fire-and-forget `prisma.userCredits.upsert().catch(...)` — non-blocking
- If Neon DB is slow or errored at grant time, supplier starts with 0 credits and cannot unlock any leads
- No retry mechanism; no UI feedback if credits fail to grant

**Onboarding:** ✅ Structurally functional
- 3-step wizard: Business Details → Categories + Location → Description
- GST verification calls `/api/gst/verify`; failure is non-fatal (saved as self-reported)
- AI description generation calls `/api/ai/sparkle` with fallback
- Completion redirects to `/dashboard?onboarded=1`

### Can a new supplier browse RFQs?

**Via Browse RFQs page (`/supplier/browse-rfqs`):** ⚠️ Functional but shows seed data
- Calls `/api/marketplace/rfqs` — no auth required, no `isSeeded: false` filter
- All seeded/demo RFQs appear in supplier's browse view
- Category filtering by supplier's own categories works

**Via Leads page (`/supplier/leads`):** ✅ Functional (browsing, not unlocking)
- Correctly filters `isSeeded: false`, `isPublic: true`
- Buyer name/company masked until unlocked
- Credit balance shown alongside leads

### Can a new supplier submit a quote?

**Via Browse RFQs modal:** ✅ Structurally functional
- Posts to `/api/supplier/quotes`
- Required fields: `rfqId`, `price`, `deliveryDays`
- Optional: `notes`, `terms`
- Updates RFQ status to QUOTED + sends buyer email notification
- Duplicate guard present (basic — no WITHDRAWN/REJECTED exclusion)
- Success: quote appears in "My Quotes" immediately

---

## Phase 3: RFQ-to-Quote Audit

### Text RFQ (manually posted)
- **Status:** ✅ Quote submission works end-to-end via `/api/supplier/quotes`
- **Gap:** Quote endpoint doesn't exclude WITHDRAWN/REJECTED quotes from duplicate check

### Voice RFQ
- **Status:** ✅ Transcribed via Groq Whisper; saved to `rfqs` table as type `VOICE`
- **Appears in browse?** Yes, same feed as text RFQs
- **Quoting:** Same `/api/supplier/quotes` endpoint — no difference

### Video RFQ  
- **Status:** Architecture exists (type `VIDEO` in enum); same quote flow

### Urgency Filtering
- UI shows urgency badges; API doesn't filter by urgency by default — suppliers see all urgency levels

---

## Phase 4: Buyer Interaction Audit

### Buyer views quotes on their RFQ

**Route:** `GET /api/rfq/[id]/quotes`  
**Status:** 🔴 **RUNTIME BUG — WILL CRASH**

```typescript
// src/app/api/rfq/[id]/quotes/route.ts, line ~45
include: {
  supplier: {
    select: {
      id: true,
      name: true,
      company: true,
      city: true,      // ← User model has no `city` field; field is `location`
      trustScore: true,
    }
  }
}
```

Prisma will throw at runtime when this select executes. The buyer **cannot view quotes on any RFQ** through this endpoint.

### Buyer accepts a quote → Deal creation

**Path A — `PUT /api/rfq/quotes`:** ✅ Functional  
- Validates buyer owns the RFQ  
- Creates `Deal`, updates Quote status to ACCEPTED, updates RFQ to ACCEPTED  
- Escrow-locks wallet: deducts quote price from `Wallet.balance`, creates `WalletTransaction`  
- Sends supplier notification email  

**Path B — `POST /api/deal/select`:** ✅ Functional  
- Auth: `getAuthenticatedUser` (Sprint-04 helper)  
- Validates buyer owns the RFQ  
- Creates Deal, updates Quote to ACCEPTED + `isAccepted: true`, updates RFQ to ACCEPTED  
- Records BOM life events for both buyer and supplier (non-blocking)  
- Does NOT lock wallet / no escrow step  

**⚠️ Two competing paths create Deal with different side-effects.** Path A locks wallet; Path B does not. No wallet balance check on Path B — buyer could accept without funds.

### Buyer quotes page (`/dashboard/quotes`)
- Calls `/api/dashboard/rfqs` → works (returns buyer's RFQs with quote counts)  
- Calls `/api/deal/select` (Path B) on quote acceptance → redirects to `/checkout/:id`
- **Critical dependency:** Buyer must first view quotes via `/api/rfq/[id]/quotes` → crashes (see above)

---

## Phase 5: First Transaction Readiness — Evidence-Based Answers

### Q1: Can a supplier register without issues?
**A: YES** — registration, OTP, and JWT flow are functional. Starter credits are non-blocking; 3 credits granted under normal conditions.

### Q2: Can a supplier complete onboarding?
**A: YES** — 3-step wizard is functional. GST verification is optional/non-blocking.

### Q3: Does the supplier see real (non-seeded) RFQs?
**A: PARTIAL**  
- Browse RFQs (`/supplier/browse-rfqs`) → `/api/marketplace/rfqs` → **NO `isSeeded:false` filter** → seed data appears  
- Leads page (`/supplier/leads`) → `/api/supplier/leads` → has `isSeeded:false` filter ✅

### Q4: Can the supplier submit a quote?
**A: YES** — `/api/supplier/quotes` POST works; updates RFQ status; sends buyer email.

### Q5: Can the buyer view incoming quotes?
**A: NO** — `GET /api/rfq/[id]/quotes` crashes at runtime due to `supplier.city` Prisma select on a field that doesn't exist. **Blocking.**

### Q6: Can the buyer accept a quote?
**A: BLOCKED** — buyer must see the quotes first. If `/api/rfq/[id]/quotes` is bypassed (direct API call), Path A (`PUT /api/rfq/quotes`) and Path B (`POST /api/deal/select`) both create a deal successfully.

### Q7: Can the supplier unlock a lead?
**A: NO (UI never works)**  
- The unlock UI sends `{ leadId }` only  
- The API requires `{ leadId, supplierId }` and reads supplierId from body  
- Result: every unlock returns `400 — leadId and supplierId are required`  
- Additionally: even if supplierId were sent, the API has **no authentication** — any caller can drain any supplier's credits

### Q8: Does the credit system work end-to-end?
**A: PARTIALLY**  
- Credit grant on registration: functional but fire-and-forget  
- Credit check on unlock: logic exists in API  
- Credit deduction: atomic via `$transaction`  
- Unlock UI→API handshake: **broken** (supplierId not sent by UI)  
- Phone/email display after unlock: **always null** (API returns `buyerName`, `buyerCompany`, `buyerLocation` only — no phone/email)

### Q9: Is there a complete deal-to-payment flow?
**A: PARTIAL**  
- Deal creation: ✅ (two paths, different side-effects)  
- Deal ID returned to buyer UI for checkout  
- Checkout page exists at `/checkout/[id]`  
- Payment via Razorpay is implemented (`/api/payment/`)  
- End-to-end not verified; wallet locking differs between two deal paths  

---

## Phase 6: Conversion Friction Points — Top 10 Ranked

### 🔴 BLOCKER 1 — Buyer Cannot View Quotes (Schema Bug)
**File:** `src/app/api/rfq/[id]/quotes/route.ts`  
**Issue:** `supplier.city` selected in Prisma include; `User` model field is `location`, not `city`  
**Impact:** Every attempt by a buyer to view quotes on their RFQ crashes the API  
**Severity:** HIGH — completely blocks first transaction  

### 🔴 BLOCKER 2 — Lead Unlock Permanently Broken (UI-API Mismatch)
**File:** `src/app/supplier/leads/page.tsx` + `src/app/api/leads/unlock/route.ts`  
**Issue:** UI posts `{ leadId }` only; API requires `{ leadId, supplierId }` and reads supplierId from body  
**Impact:** Every lead unlock attempt returns 400; the credit purchase UX exists but the unlock never executes  
**Severity:** HIGH — blocks the leads → quote conversion path  

### 🔴 BLOCKER 3 — Lead Unlock Has No Authentication
**File:** `src/app/api/leads/unlock/route.ts`  
**Issue:** No token verification; any unauthenticated caller can POST with any `supplierId` to drain credits  
**Impact:** Critical security hole; once supplierId mismatch is fixed this becomes an attack vector  
**Severity:** HIGH — security + functional  

### 🟠 FRICTION 4 — Seed RFQs Leak Into Supplier Browse
**File:** `src/app/api/marketplace/rfqs/route.ts`  
**Issue:** No `isSeeded: false` in WHERE clause  
**Impact:** Suppliers browse fake demand; quote on non-existent buyers; erodes trust  
**Severity:** HIGH — trust-destroying  

### 🟠 FRICTION 5 — Phantom Phone/Email After Lead Unlock
**File:** `src/app/supplier/leads/page.tsx` + `src/app/api/leads/unlock/route.ts`  
**Issue:** UI renders `lead.buyerPhone` and `lead.buyerEmail` after unlock; API never returns these fields (returns `buyerName`, `buyerCompany`, `buyerLocation` only)  
**Impact:** Supplier unlocks a lead (costs 1 credit), sees "Lead Unlocked" banner, but phone and email are always blank  
**Severity:** HIGH — waste of credits + trust destruction  

### 🟠 FRICTION 6 — Two Competing Deal Creation Paths with Inconsistent Side-Effects
**Files:** `src/app/api/rfq/quotes/route.ts` (PUT) + `src/app/api/deal/select/route.ts`  
**Issue:** Path A locks wallet escrow; Path B does not. Two paths can create two `Deal` records for the same quote.  
**Impact:** Accounting inconsistency; supplier could get paid twice or funds not locked  
**Severity:** MEDIUM — data integrity risk  

### 🟠 FRICTION 7 — Three Competing Quote Endpoints
**Files:** `/api/quote`, `/api/rfq/quotes` POST, `/api/supplier/quotes` POST  
**Issue:** Only `/api/supplier/quotes` updates RFQ status and sends buyer email. Others are silently incomplete.  
**Impact:** Developer confusion; if frontend ever calls wrong endpoint, buyer never gets notified  
**Severity:** MEDIUM — maintenance/reliability risk  

### 🟡 FRICTION 8 — Starter Credits Are Fire-and-Forget
**File:** `src/app/api/auth/otp/verify/route.ts`  
**Issue:** `prisma.userCredits.upsert().catch(...)` — failure is silently ignored  
**Impact:** Supplier may register with 0 credits despite platform promise; no recovery path  
**Severity:** MEDIUM — trust + retention impact  

### 🟡 FRICTION 9 — No Onboarding Redirect After Registration
**File:** `src/app/api/auth/otp/verify/route.ts`  
**Issue:** OTP verify returns user data + token but does not signal whether user is new or returning. UI must detect first-login and route to `/supplier/onboarding` independently.  
**Impact:** New suppliers likely land on generic dashboard; onboarding completion rate will be low  
**Severity:** MEDIUM — conversion impact  

### 🟡 FRICTION 10 — No Duplicate Check on WITHDRAWN/REJECTED in `/api/rfq/quotes` POST
**File:** `src/app/api/rfq/quotes/route.ts`  
**Issue:** Duplicate guard checks `where: { rfqId, supplierId }` without excluding WITHDRAWN/REJECTED statuses — unlike the Sprint-04 endpoint `/api/quote`  
**Impact:** Supplier who withdrew a quote cannot resubmit through this path  
**Severity:** LOW — UX issue; workaround is the canonical `/api/quote` endpoint  

---

## Phase 7: Founder Evidence Dashboard

### System Readiness Matrix

| Layer | Status | Blocker |
|-------|--------|---------|
| Registration | ✅ Ready | — |
| Onboarding | ✅ Ready | — |
| RFQ Browse (seeded filter) | ❌ Broken | Seed filter missing in marketplace/rfqs |
| Lead Unlock (UI→API) | ❌ Broken | UI sends wrong payload |
| Lead Unlock (Security) | ❌ Broken | No auth check |
| Quote Submission | ✅ Ready | — |
| Buyer Quote View | ❌ Broken | `supplier.city` Prisma crash |
| Deal Creation | ⚠️ Partial | Two inconsistent paths |
| Payment Flow | ⚠️ Partial | End-to-end unverified |
| First Transaction | ❌ Blocked | Buyer cannot view quotes |

### Readiness Score: 4/10 layers fully functional

### Critical Path to First Transaction

```
Supplier registers ✅
→ Supplier browses RFQs ⚠️ (seeds visible)
→ Supplier submits quote ✅
→ Buyer notified by email ✅
→ Buyer clicks "View Quotes" → CRASH ❌
→ [BLOCKED — cannot proceed]
```

### Minimum Fixes Required Before First Transaction

| Fix | File | Complexity |
|-----|------|------------|
| Replace `supplier.city` → `supplier.location` | `src/app/api/rfq/[id]/quotes/route.ts` | 1 line |
| Add `isSeeded: false` to marketplace RFQs | `src/app/api/marketplace/rfqs/route.ts` | 1 line |
| Add supplierId from JWT in unlock API | `src/app/api/leads/unlock/route.ts` | 5 lines |
| Pass supplierId in unlock UI (or remove body param) | `src/app/supplier/leads/page.tsx` | Not needed if API reads from JWT |
| Return phone/email from unlock API or note N/A | `src/app/api/leads/unlock/route.ts` | Design decision |

**Estimated fix time for blockers: < 2 hours.**

### North Star Metric Baseline
- Trust Velocity (Trades/Week): **0** — no completed transactions in system
- Phase D Gate (100 verified suppliers): **not met** — Intelligence layer stays off

---

*Report generated by VS-SPRINT-FIRST-TRANSACTION-01. No code was modified. Evidence gathered from source file reads across 20+ routes and UI pages.*
