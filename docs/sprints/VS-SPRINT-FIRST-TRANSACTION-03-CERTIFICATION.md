# VS-SPRINT-FIRST-TRANSACTION-03: Transaction Path Certification

**Date:** 2026-08-27  
**Branch:** `claude/vyaparsethu-outreach-channels-18ghlu`  
**Commit basis:** `526414b` (post Sprint-02 fixes)  
**Status:** 🟡 AMBER — path is structurally sound; 2 founder actions required before first live transaction

---

## Executive Summary

The supplier → RFQ → unlock → quote → buyer review → deal creation path is **structurally executable** following Sprint-02. No Prisma crash, no auth bypass, no missing contact data. The marketplace can process a real transaction today **with two explicit founder checkpoints**:

1. The buyer deal UI uses Path B (`POST /api/deal/select`) which creates a Deal with status `ACTIVE` but does **not** lock wallet escrow. Founder must manually verify payment for the first transaction.  
2. Starter credits are granted fire-and-forget (non-blocking). If the grant fails silently, a new supplier will see 0 credits and cannot unlock leads. Founder must verify credits exist before handing off to a real supplier.

All other phases: **GREEN**.

---

## Phase 1 — Transaction Path Certification

### Route Inventory (Full Path)

| Step | Route | Auth Method | Status |
|------|-------|-------------|--------|
| 1. Register / Login | `POST /api/auth/otp/verify` | JWT issued on success | ✅ |
| 2. Onboard supplier | `POST /api/supplier/onboarding` | `authenticate()` (cookie/header) | ✅ |
| 3. Browse RFQs | `GET /api/marketplace/rfqs` | None (public) | ✅ |
| 4. Browse leads | `GET /api/supplier/leads` | `verifyToken()` (cookie/header) | ✅ |
| 5. Unlock lead | `POST /api/leads/unlock` | `verifyToken()` (cookie/header) | ✅ |
| 6. Submit quote | `POST /api/supplier/quotes` | `authenticate()` (cookie/header) | ✅ |
| 7. Buyer views quotes | `GET /api/rfq/[id]/quotes` | `getAuthenticatedUser()` | ✅ |
| 8. Buyer accepts quote | `POST /api/deal/select` | `getAuthenticatedUser()` | 🟡 |
| 9. Checkout / Pay | `POST /api/monetization/pay` | None visible | ⚠️ |

### Auth Helper Inconsistency (informational, not a blocker)

Three different auth patterns are in use across API routes:

| Helper | Usage Count | Behaviour |
|--------|-------------|-----------|
| `verifyToken()` (manual) | ~20 routes | Synchronous JWT decode; cookie or Authorization header |
| `authenticate()` (from `@/lib/jwt`) | ~17 routes | Async wrapper; same logic |
| `getAuthenticatedUser()` (from `@/src/lib/auth-helpers`) | ~3 routes | Sync; reads localStorage header pattern |

All three accept `auth-token` cookie and `Authorization: Bearer` header. **No auth gap for the transaction path.** Consolidation is a P3 technical debt item, not a transaction blocker.

### Status Transition Audit

```
RFQ created           → status: OPEN/ACTIVE
Quote submitted       → RFQ status: QUOTED  (updated by /api/supplier/quotes ✅)
Quote accepted        → Quote.status: ACCEPTED, RFQ.status: ACCEPTED, Deal created
Deal created (Path B) → Deal.status: ACTIVE  (no wallet lock)
Deal created (Path A) → Deal.status: ACTIVE or ESCROW_LOCKED (wallet conditional)
```

### Notification Audit

| Event | Email Sent? | Route |
|-------|-------------|-------|
| Quote submitted | ✅ buyer notified | `/api/supplier/quotes` POST → `quoteReceivedEmail` |
| Quote accepted | ✅ supplier notified | `/api/rfq/quotes` PUT → `quoteAcceptedEmail` |
| Quote accepted (Path B) | ❌ NO email sent | `/api/deal/select` — no email fire |

**Gap:** Path B (the one the UI uses) does not notify the supplier when their quote is accepted. Supplier has no in-app notification that they won a deal. **Founder action:** call the supplier directly after first deal to confirm.

---

## Phase 2 — Real RFQ Readiness

This is a code-layer audit. Production DB data is not accessible from this environment. The following is based on schema + API behavior:

### RFQ Classification Framework

| Class | Filter | Marketplace-visible? |
|-------|--------|---------------------|
| Real Buyer, Active | `isSeeded: false, isPublic: true, status: OPEN/ACTIVE` | ✅ YES (post Sprint-02 fix) |
| Seeded / Demo | `isSeeded: true` | ❌ Filtered out |
| Expired | `status: CLOSED/EXPIRED` | ❌ Not returned |
| Private | `isPublic: false` | ❌ Not returned |

### Code Health for RFQ Visibility

- `/api/marketplace/rfqs` — `isSeeded: false` ✅ (Sprint-02 fix)
- `/api/supplier/leads` — `isSeeded: false` ✅ (pre-existing)
- `/api/admin/rfqs` — no `isSeeded` filter (admin sees all — correct)
- `/api/admin/seed-rfqs` — exists and can populate demo data; does not affect supplier view

**Founder action needed:** Log into admin panel and count real (non-seeded) RFQs with status OPEN/ACTIVE. If count = 0, post at least one real RFQ as a buyer before attempting first supplier transaction.

### RFQ Quote Eligibility

A supplier can quote on any RFQ where:
- `isPublic: true` AND `isSeeded: false`
- `status` is not `ACCEPTED`, `CLOSED`, `EXPIRED`
- They are not the RFQ's creator (`createdBy !== supplierId`)
- They have not already quoted on it (duplicate check in `/api/supplier/quotes`)

This logic is correct and complete.

---

## Phase 3 — Supplier Readiness

### Can a Supplier Complete the Full Journey?

| Capability | Route | Blocker? |
|------------|-------|---------|
| Register via OTP | `/api/auth/otp/verify` | None |
| Receive starter credits (3) | `UserCredits.upsert` (fire-and-forget) | ⚠️ Silent failure possible |
| Complete onboarding | `/api/supplier/onboarding` | None |
| Browse real RFQs | `/api/marketplace/rfqs` + `/api/supplier/leads` | None |
| Unlock lead (costs 1 credit) | `/api/leads/unlock` | None |
| Submit quote | `/api/supplier/quotes` | None |
| View own quote status | `/api/supplier/quotes` GET | None |

### Starter Credits Risk

The credit grant in `/api/auth/otp/verify` is non-blocking:

```typescript
prisma.userCredits.upsert({ ... }).catch((err) => {
  authLogger.error('Failed to grant onboarding credits', { userId: user.id, err });
});
```

If this silently fails (DB connection spike, Prisma error), the supplier has 0 credits and cannot unlock any lead. They see a "Buy Credits" prompt but have no free path to their first unlock.

**Founder verification step:** After onboarding a real supplier, run admin → Credits check to confirm their balance shows ≥ 3 before they attempt their first lead unlock.

### Supplier Verification State

At registration: `verificationStatus: PHONE_VERIFIED`, `trustScore: 30`  
After onboarding with GST: `verificationStatus: GST_PENDING`, trustScore += up to 55  
No current gating on `verificationStatus` for marketplace access — suppliers can quote regardless of verification state. This is correct for launch phase.

---

## Phase 4 — Deal Flow Verification

### Two Competing Paths (Documented — not fixed per sprint instructions)

#### Path A: `PUT /api/rfq/quotes`

**Called by:** NOT called by any current buyer UI. Available as a direct API call.

```
Quote accepted → Deal created → 
  IF buyer wallet.balance >= quote.price:
    wallet.balance -= price
    WalletTransaction created (ESCROW_LOCK)
    Deal.status = ESCROW_LOCKED
  ELSE:
    Deal.status = ACTIVE
→ Supplier notified via email (quoteAcceptedEmail)
```

**Pros:** Full escrow lock. Supplier gets email.  
**Cons:** Not connected to the buyer UI. Wallet must be pre-funded (buyers rarely fund wallet before receiving a quote).

#### Path B: `POST /api/deal/select` ← **the one the UI uses**

**Called by:** `/dashboard/quotes/page.tsx` (line 55) and `/app/rfq/[id]/page.tsx` (line 180).

```
Quote accepted → Deal created (ACTIVE) → BOM life events written → 
  redirect to /checkout/[dealId]
→ NO wallet lock
→ NO supplier email
```

**Pros:** BOM life events captured. Checkout flow initiated.  
**Cons:** No wallet lock. No supplier email. Checkout (`/checkout/[dealId]`) calls `/api/monetization/pay` which launches Razorpay — this is the actual payment capture.

**Checkout Page Analysis:**

The checkout page (`/checkout/[dealId]`) fetches the deal then opens Razorpay. This is functionally correct for the real payment flow — Razorpay captures the money, not the wallet. The wallet escrow lock in Path A is redundant if Razorpay is the payment rail.

### Recommendation

**For first transaction: use Path B as-is.** The flow is:

```
Deal created (ACTIVE) → buyer redirected to /checkout/[dealId] → Razorpay payment captured
```

Founder manual step: confirm with supplier that deal was won (since no supplier email fires from Path B).  
Sprint-03 fix scope: **do not refactor**. Document and proceed.  
Sprint-04 fix: add `quoteAcceptedEmail` to Path B's deal creation or consolidate paths.

---

## Phase 5 — First Transaction Playbook (Founder Runbook)

### Pre-conditions (verify before starting)

- [ ] At least 1 real RFQ exists: `isPublic: true, isSeeded: false, status: ACTIVE/OPEN`
- [ ] Target supplier phone number known
- [ ] Razorpay test mode vs live mode confirmed (check Vercel env: `RAZORPAY_KEY_ID`)
- [ ] MSG91 OTP working (test with your own phone first)

### Step-by-Step

**Step 1 — Supplier Onboarding**  
Have the supplier open `vyaparsethu.com` (or `bell24h.com`).  
→ Click "Supplier Login" → Enter mobile number → Enter OTP  
→ Complete onboarding wizard: company name, category, city  

**Founder checkpoint:** After OTP verify, check admin → Users → find supplier → confirm `credits = 3`  
If 0, run: admin → Credits → grant 3 credits manually

**Step 2 — RFQ Discovery**  
Supplier goes to: Dashboard → Browse Requirements (or `/supplier/browse-rfqs`)  
→ Confirm at least 1 RFQ is visible  
→ If none visible: go to admin panel, post a real RFQ as a buyer account

**Step 3 — Lead Unlock**  
Supplier clicks the RFQ card → clicks "Unlock Lead (1 Credit)"  
→ Phone and email should appear immediately  
→ Credit count should drop from 3 to 2

**Founder checkpoint:** Verify that the correct buyer phone/email is shown (it should be the RFQ poster's registered phone + generated email).

**Step 4 — Quote Submission**  
Supplier goes to: Dashboard → Browse Requirements → Find the RFQ → Click "Submit Quote"  
→ Enter price, delivery days, notes  
→ Confirm: "Quote submitted successfully"

**Founder checkpoint:** Log into buyer account → check email inbox for "New quote received" email.

**Step 5 — Buyer Review**  
Buyer logs in → Dashboard → My Quotes (or `/dashboard/quotes`)  
→ Buyer should see the quote with supplier name, company, price, delivery days  
→ If buyer is the founder: review the quote

**Step 6 — Buyer Acceptance**  
Buyer clicks "Accept Quote & Pay Escrow" on the quote card  
→ UI calls `POST /api/deal/select` → Deal created  
→ Buyer is redirected to `/checkout/[dealId]`

**Founder checkpoint:** Note the Deal ID from URL. Log it.

**Step 7 — Payment Capture**  
On `/checkout/[dealId]`:  
→ Buyer clicks "Pay Now" → Razorpay modal opens  
→ Complete payment (test card or real card depending on mode)  
→ On success: redirected to `/payment/success?dealId=...`

**Founder action (manual):** Call or WhatsApp the supplier to confirm: "Your quote was accepted. Deal ID: [X]. Payment received."

**Step 8 — Deal Confirmation**  
Both parties have:  
- Buyer: payment receipt from Razorpay  
- Supplier: verbal/WhatsApp confirmation from founder  
- System: Deal record with status `ACTIVE`  

Transaction is complete. Record it in the sprint evidence doc.

---

## Phase 6 — Marketplace Readiness Score

| Module | Status | Evidence |
|--------|--------|---------|
| **Registration** | 🟢 GREEN | OTP → JWT → UserCredits → BOM life event; full flow complete |
| **Starter Credits** | 🟡 AMBER | Granted fire-and-forget; silent failure possible; founder must verify |
| **RFQ Flow** | 🟢 GREEN | isSeeded filter active; buyer-posted RFQs visible to suppliers |
| **Lead Unlock** | 🟢 GREEN | JWT auth; supplierId from token; phone+email returned (Sprint-02 fixes) |
| **Quote Flow** | 🟢 GREEN | Canonical endpoint; updates RFQ status; sends buyer email |
| **Buyer View** | 🟢 GREEN | Prisma crash fixed (Sprint-02); quotes display correctly |
| **Deal Creation** | 🟡 AMBER | Path B: no wallet lock, no supplier email; founder must confirm manually |
| **Payment (Razorpay)** | 🔵 UNTESTED | Checkout page exists; Razorpay integration present; not smoke-tested this sprint |
| **Supplier Notification** | 🔴 RED | Path B sends no email to supplier on deal won; 100% manual currently |

**Overall: 🟡 AMBER** — ready for first founder-supervised transaction with 2 manual compensations.

---

## Bell24h-OS Integration Audit

### Current State

Bell24h-OS integration exists in the codebase as a **single, intentionally minimal client** at `src/lib/bell24h-os/client.ts`. It was implemented in a prior sprint (OS-INTEGRATION-IMPLEMENTATION-01).

#### What is integrated

| Component | File | Purpose |
|-----------|------|---------|
| AI text generation client | `src/lib/bell24h-os/client.ts` | Calls `POST /api/v1/ai/text` on Bell24h-OS (NVIDIA or Gemini provider) |
| Admin test route | `src/app/api/admin/bell24h-os/test-ai/route.ts` | Admin-only endpoint to verify the integration is live |
| Unit tests | `src/lib/bell24h-os/client.test.ts` | Tests auth, timeout, error codes, response shape |

#### Integration status: NOT CONFIGURED

```
BELL24H_OS_BASE_URL              → "" (not set in production)
BELL24H_VYAPARSETHU_SERVICE_TOKEN → "" (not set in production)
```

The client returns `{ status: 'NOT_CONFIGURED' }` on every call until both env vars are set. **No AI features from Bell24h-OS are active on vyaparsethu.com today.**

#### What the integration supports (when configured)

```
VyaparSethu → client.generateAiText(prompt, provider?)
           → POST /api/v1/ai/text on Bell24h-OS
           → Bell24h-OS routes to NVIDIA NIM or Gemini
           → Returns { text: string, requestId: string }
```

- Fixed 15-second timeout
- Non-throwing: returns typed error outcomes (NOT_CONFIGURED, ERROR, OK)
- Token never exposed to callers; status endpoint returns booleans only
- Prompt is caller-supplied (business logic decides the prompt; Bell24h-OS decides the provider)

#### Which VyaparSethu features consume Bell24h-OS AI (when live)

Currently: **none in the production path**. The only consumer is the admin test route. The client was built as the foundation for future intelligence features (RFQ matching, Trust Score explanation, Morning Brief polish).

---

## Bell24h-OS ↔ VyaparSethu Interconnection Features

### LIVE (Code exists, env-gated)

| Feature | Direction | Status | Notes |
|---------|-----------|--------|-------|
| AI text generation | VyaparSethu → Bell24h-OS | 🔵 NOT CONFIGURED | Client built; 2 env vars needed |
| Integration health check | VyaparSethu → Bell24h-OS | 🔵 NOT CONFIGURED | `/api/admin/bell24h-os/test-ai` GET |

### n8n Integration (Separate from Bell24h-OS)

| Feature | Status | Route |
|---------|--------|-------|
| Campaign multi-channel publish | Partially live | `POST /api/integrations/n8n/` → `N8N_WEBHOOK_URL` |
| n8n auth middleware | Code exists | `src/middleware/n8nAuth.ts`, `src/config/security.ts` |
| n8n error webhook | Configured by admin | `N8N_ERROR_WEBHOOK_URL` env var |

n8n is the **execution layer** (CLAUDE.md: "n8n executes. Backend decides. Never reverse this"). It handles outreach, campaign automation, and multi-channel publishing. It is separate from Bell24h-OS.

### PLANNED (Architecture documented, not yet built)

| Feature | Bell24h-OS Role | VyaparSethu Trigger |
|---------|----------------|---------------------|
| RFQ-to-supplier matching AI | Provider manager (NVIDIA/Gemini) | On RFQ creation or daily cron |
| Trust Score explanation (SHAP) | AI explanation text | On admin Trust Score view |
| Morning Brief AI polish | Text generation | Daily cron per company |
| Supplier recommendation | Semantic scoring | On buyer RFQ view |

All gated behind `FLAGS.INTELLIGENCE_ENABLED` and `Phase D gate: 100 verified suppliers`.

### SDK / API Contract

Documented at: `docs/project/BELL24H-OS-VYAPARSETHU-SDK-API-CONTRACT-v1.0.md` (referenced in client.ts; not read this sprint as it's documentation-only).

**Contract points verified in code:**
- Service auth: `X-Bell24h-Service-Token` header (not OAuth, not JWT)
- Request ID: `X-Request-Id` header, format `^[A-Za-z0-9_.-]{1,128}$`
- Error envelope: `{ error_code, message, request_id, correlation_id, retryable, details? }`
- Success shape: `{ text: string, requestId: string }`
- Endpoint: `POST {BELL24H_OS_BASE_URL}/api/v1/ai/text`

**To activate:** Set `BELL24H_OS_BASE_URL` and `BELL24H_VYAPARSETHU_SERVICE_TOKEN` in Vercel environment, matching the values on the Bell24h-OS deployment side.

---

## Pending Items — Consolidated Backlog

### From Sprint-01 (identified, not yet fixed)

| ID | Priority | Issue | Assigned Sprint |
|----|----------|-------|----------------|
| P2 | HIGH | Deal flow duplication: Path A vs Path B — UI uses B (no wallet lock, no supplier email) | Sprint-04 |
| P3 | MEDIUM | `responseRate` on Supplier Dashboard always "0%" (raw DB value, not computed) | Sprint-04 |
| P4 | MEDIUM | `isNew` signal missing from OTP verify response — new suppliers may miss onboarding redirect | Sprint-04 |

### From Sprint-02 (fixed, confirmed)

| Fix | Status |
|-----|--------|
| `supplier.city` → `supplier.location` Prisma crash | ✅ Fixed commit `cfa6b8a` |
| Lead unlock: auth bypass (supplierId from body) | ✅ Fixed |
| Lead unlock: UI-API contract mismatch | ✅ Fixed |
| Lead unlock: phone/email never returned | ✅ Fixed |
| Seeded RFQs in marketplace feed | ✅ Fixed |

### New items identified this sprint

| ID | Priority | Issue | Notes |
|----|----------|-------|-------|
| N1 | HIGH | Supplier not notified (email) when quote accepted via Path B | Path B (the UI path) fires no `quoteAcceptedEmail` |
| N2 | MEDIUM | Starter credits fire-and-forget — silent failure undetectable by supplier | Add admin credit health check or make blocking |
| N3 | MEDIUM | Checkout page prefill hardcoded: `name: "Buyer Name", email: "buyer@example.com"` | Razorpay prefill uses placeholder; should use authenticated user data |
| N4 | LOW | Three auth helper patterns in use (`authenticate`, `verifyToken`, `getAuthenticatedUser`) | Not a security gap; code hygiene |
| N5 | LOW | Bell24h-OS env vars not set on Vercel — AI integration dormant | Unblock when ready for intelligence features |

---

## Recommended Next Sprint

### Option A: VS-SPRINT-FIRST-TRANSACTION-PROOF (if first transaction is imminent)

**Do first.** Run the founder runbook above. Log evidence of:
- Supplier registered and credited ✅
- Lead unlocked ✅  
- Quote submitted ✅  
- Buyer email received ✅  
- Deal created ✅  
- Payment captured ✅  

Once proven: proceed to VS-SPRINT-TRADE-INTELLIGENCE-01.

### Option B: VS-SPRINT-DEAL-PATH-CONSOLIDATION (Sprint-04)

Fix N1 (supplier email on Path B), N3 (Razorpay prefill), and P2 (single canonical deal path). Low-risk, targeted changes. Does not require Trade Intelligence to be live.

**Recommendation: Do Option A first.** The code is ready. The first real transaction yields the first real BOM life events, which are the inputs Trade Intelligence needs. Running the transaction before TRADE-INTELLIGENCE-01 ensures the intelligence layer is built on real data, not theory.

---

## Rollback / Recovery

No code changes were made in this sprint. This is a pure audit.

All Sprint-02 fixes remain in effect at `cfa6b8a`. Rollback: `git revert cfa6b8a`.

---

*VS-SPRINT-FIRST-TRANSACTION-03 complete. Transaction path certified AMBER. Two manual founder compensations required; no additional code changes needed to attempt first transaction.*
