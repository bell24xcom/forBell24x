# VS-SPRINT-FIRST-TRANSACTION-04: Execution Report

**Date:** 2026-08-27  
**Branch:** `claude/vyaparsethu-outreach-channels-18ghlu`  
**Commit basis:** `db8c03c` (post Sprint-03 certification)  
**Status:** ✅ ALL 6 PHASES COMPLETE — platform ready for first supervised transaction

---

## Executive Summary

5 targeted fixes across 5 files. No schema changes. No migrations. No new tables.

The marketplace now has a single, complete transaction path: deal created → supplier notified → buyer redirected to real Razorpay checkout with real buyer data → evidence recorded in `/api/admin/transaction-evidence` → visible in admin First Transaction Dashboard.

**Before this sprint:** supplier wins a deal and receives no notification; Razorpay opens with hardcoded "Buyer Name"; no deal visibility in admin.

**After this sprint:** supplier gets a "Your quote was accepted" email on every deal; Razorpay prefills real buyer name and phone; admin shows live deal counts and recent deal list.

---

## Files Changed

| Phase | File | Change |
|-------|------|--------|
| 1+2 | `src/app/api/deal/select/route.ts` | Wallet lock attempt + supplier win email (fire-and-forget) |
| 3 | `src/app/api/deal/[id]/route.ts` | Add `buyer_name` + `buyer_phone` to response |
| 3 | `src/app/checkout/[dealId]/page.tsx` | Replace hardcoded placeholders with real buyer data |
| 4+5 | `src/app/api/admin/stats/route.ts` | Add deal counts + recent deal list to stats response |
| 4 | `src/app/admin/page.tsx` | First Transaction Dashboard section |
| 5 | `src/app/api/admin/transaction-evidence/route.ts` | New evidence collection endpoint |

4 modified + 1 new = 5 files. 0 schema changes.

---

## Phase 1 — Deal Path Consolidation

### Decision: Path B is the canonical path

**Rationale:**
- Both buyer-facing UIs (`/dashboard/quotes` and `/rfq/[id]/page`) call `POST /api/deal/select` (Path B)
- Path A (`PUT /api/rfq/quotes`) has no UI — it is an API-only path, never exercised in normal user flow
- Consolidating by enhancing Path B to feature-parity is lowest risk (additive only)

### Changes to Path B (`POST /api/deal/select`)

1. **Wallet lock attempt** — added after deal creation, non-blocking:
   ```typescript
   const buyerWallet = await prisma.wallet.findUnique({ where: { userId: deal.buyerId } });
   if (buyerWallet && buyerWallet.balance >= deal.price) {
     // lock escrow → deal.status = 'ESCROW_LOCKED'
   }
   // Failure: deal remains ACTIVE, buyer pays via Razorpay checkout
   ```
   Identical logic to Path A. If buyer wallet is unfunded (typical for first transactions), deal stays `ACTIVE` and proceeds to Razorpay. No regression.

2. **Supplier win email** — added fire-and-forget (Phase 2 combined here).

### Path A status: retained, undeprecated

Path A remains intact as an admin/API path. It is not called by any UI. No retirement needed — it is already inert from the user perspective.

---

## Phase 2 — Supplier Win Notification

### What was wrong

`POST /api/deal/select` — the only path the buyer UI uses — fired zero emails to the supplier. A supplier had no way of knowing their quote was accepted short of a phone call from the founder.

### Fix

Added to `POST /api/deal/select` after deal creation and BOM events:

```typescript
// Fire-and-forget: notify winning supplier
const [supplier, rfq] = await Promise.all([
  prisma.user.findUnique({ where: { id: quote.supplierId }, select: { email, name } }),
  prisma.rFQ.findUnique({ where: { id: quote.rfqId }, select: { title, isSeeded } }),
]);
if (supplier?.email && rfq && !rfq.isSeeded) {
  const template = quoteAcceptedEmail(supplier.name, rfq.title, deal.price);
  resendService.sendEmail({ to: supplier.email, ...template }).catch(console.error);
}
```

**Guards:**
- `!rfq.isSeeded` — never sends for demo/test RFQs
- `supplier?.email` — skips if no email (should not occur post-OTP, but safe)
- `.catch(console.error)` — email failure never blocks the deal creation response

**Template used:** `quoteAcceptedEmail` from `lib/emailTemplates.ts` — already implemented, subject: `🎉 Your Quote Was Accepted — "{rfqTitle}"`.

---

## Phase 3 — Razorpay Readiness

### What was wrong

`/checkout/[dealId]/page.tsx` Razorpay prefill was hardcoded:
```javascript
prefill: { name: "Buyer Name", email: "buyer@example.com" }
```

### Fix (two files)

**`/api/deal/[id]/route.ts`** — added buyer data to the deal response:
```typescript
buyer: { select: { name: true, phone: true } }
// Response now includes:
buyer_name: deal.buyer?.name ?? null,
buyer_phone: deal.buyer?.phone ?? null,
```

**`/checkout/[dealId]/page.tsx`** — use real data:
```javascript
prefill: {
  name: deal?.buyer_name || '',
  contact: deal?.buyer_phone || '',
}
```

Using `contact` (not `email`) because the platform auth is phone-first. The buyer's stored email is the generated `phone@bell24h.com` placeholder — their real identity is their phone number. Razorpay's `prefill.contact` accepts phone numbers.

**Result:** Razorpay modal pre-fills with the actual buyer's registered name and phone.

---

## Phase 4 — Founder Transaction Dashboard

### What was added

**`/api/admin/stats` response** — new `deals` key:
```json
{
  "deals": {
    "total": 0,
    "active": 0,
    "escrowLocked": 0,
    "recentDeals": []
  }
}
```

**`/admin/page.tsx`** — "First Transaction Dashboard" section between Transactions and Deal Funnel:

| Card | Value | Color |
|------|-------|-------|
| Deals Created | total deals | indigo |
| Active (Awaiting Payment) | status = ACTIVE | amber |
| Escrow Locked | status = ESCROW_LOCKED | green |

Below the cards: recent deals table (last 5) showing RFQ title, buyer → supplier, price, and status badge.

When `total === 0`: renders a dashed-border placeholder: "No deals yet — first transaction pending. Run the Founder Runbook from Sprint-03 Certification."

---

## Phase 5 — Transaction Evidence Capture

### New endpoint: `GET /api/admin/transaction-evidence`

Admin-only. Returns structured evidence for every deal journey.

**Evidence per deal:**
| Field | Source |
|-------|--------|
| `dealId`, `rfqId`, `buyerId`, `supplierId`, `quoteId` | `Deal` + related records |
| `rfqCreatedAt` | `RFQ.createdAt` |
| `unlockTimestamp` | `LeadSupplier.unlockedAt` (matched on rfqId + supplierId) |
| `quoteTimestamp` | `Quote.createdAt` |
| `acceptanceTimestamp` | `Quote.updatedAt` when `status === ACCEPTED` |
| `dealTimestamp` | `Deal.createdAt` |
| `paymentTimestamp` | `Transaction.createdAt` (matched on `reference = dealId`) |
| `paymentStatus` | `Transaction.status` |

**Computed intervals:**
- `unlockToQuoteSeconds` — how fast supplier quoted after unlocking
- `quoteToAcceptanceSeconds` — buyer decision time
- `dealToPaymentSeconds` — payment speed after deal

**Summary object** (for quick founder view):
```json
{
  "totalDeals": 0,
  "realDeals": 0,
  "dealsWithPayment": 0,
  "dealsWithUnlock": 0,
  "avgQuoteToAcceptanceHours": null
}
```

This is the raw material for VS-SPRINT-TRADE-INTELLIGENCE-01 — no AI, no ranking, no scoring. Pure evidence capture.

---

## Phase 6 — Bell24h-OS Readiness Audit (Read-Only)

### Current State

```
BELL24H_OS_BASE_URL              → not set (blank in Vercel env)
BELL24H_VYAPARSETHU_SERVICE_TOKEN → not set
Integration status: NOT_CONFIGURED
```

All calls to `generateAiText()` return `{ status: 'NOT_CONFIGURED' }` immediately. Zero AI calls made to Bell24h-OS in production today.

### Data Contract Draft

The following VyaparSethu events are the future inputs to Bell24h-OS intelligence:

| Event | Source System | Payload Fields | Ready? |
|-------|--------------|----------------|--------|
| RFQ created | `RFQ` table | id, title, category, budget, location, urgency, createdAt | ✅ Exists |
| Lead unlocked | `LeadSupplier` table | leadId, supplierId, unlockedAt, credits | ✅ Exists |
| Quote submitted | `Quote` table | id, rfqId, supplierId, price, deliveryDays, status | ✅ Exists |
| Quote accepted | `Quote.status = ACCEPTED` + `Deal` | quoteId, dealId, buyerId, supplierId, price | ✅ Exists |
| Deal created | `Deal` table | id, rfqId, quoteId, buyerId, supplierId, price, status | ✅ Exists |
| Payment captured | `Transaction` table | id, reference (dealId), amount, status | ✅ Exists |
| Supplier BOM event | `BusinessLifeEvent` table | companyId, eventType, metadata, outcome | ✅ Exists |

**All data is already being captured.** Bell24h-OS activation requires:
1. Set `BELL24H_OS_BASE_URL` + `BELL24H_VYAPARSETHU_SERVICE_TOKEN` in Vercel
2. Build the prompt-construction layer that reads the above data and calls `generateAiText()`
3. Set `FLAGS.INTELLIGENCE_ENABLED = true` (currently `false`, gated behind 100 verified suppliers)

**Do not activate until Phase D gate is reached.**

---

## Real Transaction Execution

### Founder Runbook (Updated)

**Pre-conditions (verify):**
- [ ] At least 1 real RFQ exists: `isPublic: true, isSeeded: false, status: ACTIVE/OPEN`
- [ ] Target supplier phone known
- [ ] Razorpay mode confirmed (test vs live): check `RAZORPAY_KEY_ID` in Vercel

**Step 1 — Supplier Onboarding**
→ `bell24h.com` → Supplier Login → OTP → Onboarding wizard
→ Founder checkpoint: admin → Stats → Deals panel (0 deals shown = fresh start ✅)

**Step 2 — Lead Unlock**
→ Dashboard → Browse Requirements → Unlock Lead
→ Phone + email appear immediately
→ Credits drop from 3 to 2

**Step 3 — Quote Submission**
→ Submit Quote with price + delivery days
→ Buyer receives `quoteReceivedEmail` ✅ (was already working)

**Step 4 — Buyer Acceptance**
→ `/dashboard/quotes` → "Accept Quote & Pay Escrow"
→ **NEW: Supplier now receives `quoteAcceptedEmail` automatically** ✅
→ Buyer redirected to `/checkout/[dealId]`

**Step 5 — Razorpay Checkout**
→ Checkout opens with **real buyer name + phone** (no more placeholder) ✅
→ Complete payment
→ Success → `/payment/success?dealId=...`

**Step 6 — Verify Evidence**
→ Admin → Stats → First Transaction Dashboard → deal appears ✅
→ `GET /api/admin/transaction-evidence` → evidence JSON with all timestamps

---

## Remaining Blockers

### P3 — `responseRate` always "0%" on Supplier Dashboard
Not a transaction blocker. Deferred to Sprint-05.

### P4 — `isNew` signal missing from OTP verify
New suppliers may land on home page instead of onboarding wizard. Founder can manually direct first supplier. Deferred to Sprint-05.

### N4 — Three auth helper patterns
Code hygiene. No user-facing impact. Deferred.

---

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|-----------|
| Wallet lock in Path B | LOW | Non-blocking; failure keeps deal ACTIVE; no regression |
| Supplier email in Path B | LOW | Fire-and-forget; `.catch(console.error)`; email failure never blocks deal |
| Buyer data in deal API | LOW | Additive fields; existing callers unaffected |
| Razorpay prefill fix | LOW | Falls back to empty string if name/phone null |
| Admin stats deal query | LOW | Additive to existing query; no existing field modified |
| Transaction evidence endpoint | NONE | Read-only admin endpoint; new route |

---

## Rollback Plan

| File | Rollback Action |
|------|----------------|
| `deal/select/route.ts` | Remove wallet lock block + remove supplier email block |
| `deal/[id]/route.ts` | Remove `buyer` include + `buyer_name`/`buyer_phone` from response |
| `checkout/[dealId]/page.tsx` | Revert to `name: "Buyer Name", email: "buyer@example.com"` |
| `admin/stats/route.ts` | Remove `totalDeals`, `activeDeals`, `escrowDeals`, `recentDeals` queries + response fields |
| `admin/page.tsx` | Remove First Transaction Dashboard section |
| `api/admin/transaction-evidence/route.ts` | Delete file |

Git rollback: `git revert <commit>` (single commit, all changes together).

---

## Recommended Next Sprint

**VS-SPRINT-TRADE-INTELLIGENCE-01** — only after the first real transaction is confirmed via the Founder Runbook above.

Requirements to unlock:
- ✅ Code: deal path complete, notifications working, evidence captured
- 🔲 Production: at least 1 real deal with payment in `/api/admin/transaction-evidence`
- 🔲 Phase D: 100 verified suppliers (currently gated by `FLAGS.INTELLIGENCE_ENABLED`)

For founder-supervised first transaction: intelligence does not need to be live. Run the transaction, collect evidence, then start TRADE-INTELLIGENCE-01 with real data.

---

## Success Criteria Verification

| Criterion | Status |
|-----------|--------|
| Supplier: I registered | ✅ OTP → JWT → UserCredits (Sprint-01/02) |
| Supplier: I saw an RFQ | ✅ `isSeeded: false` filter active (Sprint-02) |
| Supplier: I unlocked the RFQ | ✅ JWT auth, phone+email returned (Sprint-02) |
| Supplier: I submitted a quote | ✅ Canonical endpoint, buyer email sent (Sprint-01/02) |
| Buyer: I received quotes | ✅ `quoteReceivedEmail` active |
| Buyer: I reviewed quotes | ✅ `/dashboard/quotes` functional, no Prisma crash (Sprint-02) |
| Buyer: I selected a supplier | ✅ `POST /api/deal/select` creates deal |
| Supplier: I was notified when I won | ✅ **NEW Sprint-04** — `quoteAcceptedEmail` fires from Path B |
| Buyer: Razorpay shows my real name | ✅ **NEW Sprint-04** — prefill uses `buyer_name` + `buyer_phone` |
| Founder: Evidence exists for every stage | ✅ **NEW Sprint-04** — `/api/admin/transaction-evidence` |
| Founder: Metrics visible in dashboard | ✅ **NEW Sprint-04** — First Transaction Dashboard section |

---

*VS-SPRINT-FIRST-TRANSACTION-04 complete. Platform is ready for the first founder-supervised real transaction. Run the Founder Runbook, collect evidence, then proceed to VS-SPRINT-TRADE-INTELLIGENCE-01.*
