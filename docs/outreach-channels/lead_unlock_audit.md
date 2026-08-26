# Lead Unlock Audit
**Project:** VyaparSethu  
**Date:** 2026-08-26  
**Route:** `POST /api/leads/unlock`  
**Source file:** `src/app/api/leads/unlock/route.ts`

---

## Status: ACTIVE

The lead unlock endpoint is fully implemented and functional. It is **not disabled** and is **not on a roadmap** — it is live production code.

---

## How It Works

**Request:**
```json
POST /api/leads/unlock
{ "leadId": "<rfqId>", "supplierId": "<userId>" }
```

**Steps (from route code):**
1. Validate both `leadId` and `supplierId` are present
2. Fetch `Lead` row by `leadId` — `lead.id` is an RFQ ID (stored as Lead in `LeadSupplier` join)
3. Check `LeadSupplier` for existing unlock by this supplier → return cached result if found (idempotent)
4. Check `UserCredits.credits >= 1` — return 400 "Insufficient credits" if zero
5. Transaction:
   - Decrement `UserCredits.credits` by 1
   - Increment `UserCredits.spent` by 1
   - Create `LeadSupplier` row: `{ leadId, supplierId, unlocked: true, unlockedAt: now, credits: 1 }`
6. Return the lead with `contactHidden: false`

**What "unlocked" reveals:**
The route returns the full `Lead` row with `contactHidden: false`. From the supplier leads route, the revealed fields after unlock are:
- `buyerName` — actual buyer name (was `••• •••••`)
- `buyerCompany` — actual company name (was `••••••• •••`)
- Buyer email and phone are **not stored on the RFQ** and therefore not revealed even after unlock. Buyer contact details remain protected through the deal/payment flow.

---

## Credit System

**Model:** `UserCredits`
```
userId    String @unique
credits   Int    @default(0)
spent     Int    @default(0)
```

**Credit sources (from codebase):**
- `POST /api/credits/purchase` — Razorpay payment flow for credit purchase
- `POST /api/credits/verify` — Razorpay webhook verification
- No evidence of free credits granted on signup or on first claim

**Credit cost:**
- 1 credit = 1 lead unlock

**Credit purchase flow:**
- Route: `/api/credits/purchase` → creates Razorpay order
- Route: `/api/credits/verify` → verifies payment, credits are added to `UserCredits`

**Current pricing:** Not hardcoded in codebase. Razorpay order amount is set at purchase time. Admin/founder controls pricing.

---

## Access Rules

| Condition | Result |
|-----------|--------|
| `leadId` or `supplierId` missing | 400 Bad Request |
| Lead does not exist | 404 Not Found |
| Already unlocked by this supplier | 200 OK (cached, no credit charge) |
| `UserCredits` row missing OR `credits < 1` | 400 "Insufficient credits" |
| Valid supplier with ≥1 credit | 200 OK — unlocked, 1 credit deducted |

---

## Integration with Supplier Leads Feed

`GET /api/supplier/leads`:
- Fetches all `LeadSupplier` rows for the current supplier with `unlocked: true`
- Builds a Set of unlocked leadIds
- Each RFQ in the feed checks `unlockedSet.has(rfq.id)`
- If unlocked: real buyer name/company shown; else masked

**Credits also returned** in the leads feed response: `credits: userCredits?.credits ?? 0` — so the UI can show the supplier their remaining balance.

---

## Roadmap Status

The lead unlock system is **production-ready** and **not gated behind a feature flag**. It is part of the core monetisation layer.

**What is missing (gaps):**

1. **No free credits on signup** — new suppliers have 0 credits and cannot unlock any lead. This is a friction point for the first 10 suppliers. Recommendation: grant 3 free credits on first verified claim.

2. **Credit purchase UI** — `POST /api/credits/purchase` exists but there is no evidence of a frontend credits-purchase flow in the supplier dashboard. Supplier sees `credits: 0` with no path to buy.

3. **No admin credit-grant route** — founder cannot manually grant credits to a supplier without DB intervention. Add `POST /api/admin/users/{id}/credits/grant` for early onboarding.

4. **Lead vs RFQ naming confusion** — the `LeadSupplier` table uses `leadId` to store what is actually an RFQ ID. This works functionally but makes the schema misleading. Low priority to fix.

---

## Recommended Changes for First 10 Suppliers

1. Grant **3 free unlock credits** on `isClaimed` → `true` transition (in `/api/auth/claim` route)
2. Add **admin credit grant endpoint**: `POST /api/admin/users/[id]/credits` body `{ credits: N, reason: string }`
3. Surface credit balance prominently in supplier dashboard with a "Buy more credits" CTA
4. Confirm Razorpay credit purchase flow is visible and functional in supplier UI
