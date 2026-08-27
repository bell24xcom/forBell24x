# Credit Friction Audit
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-03  
**Date:** 2026-08-27  
**Mode:** Evidence-first — all claims cite source route.

---

## How Many Actions Require Credits?

**One action requires credits: unlocking buyer identity in the leads feed.**

All other supplier actions are free.

---

## Credit Gate Map

| Action | Route | Credits Required | Auth Required | Evidence |
|--------|-------|-----------------|---------------|----------|
| Register | `POST /api/auth/otp/verify` | 0 | No | No credit check |
| Complete profile | `POST /api/supplier/onboarding` | 0 | Yes (JWT) | No credit check |
| Browse requirements feed | `GET /api/supplier/leads` | 0 | Yes (JWT) | Returns leads regardless of balance |
| View full RFQ detail | `GET /api/rfq/[id]` | 0 | No (public) | No auth, no credit check |
| View buyer name/company (full page) | `GET /api/rfq/[id]` | 0 | No (public) | Buyer `name`, `company`, `location` in response |
| Submit a quotation | `POST /api/quote` | 0 | Yes (JWT, SUPPLIER role) | No credit check in route |
| Track quote status | `GET /api/supplier/stats` | 0 | Yes (JWT) | No credit check |
| Send message to buyer | `POST /api/messages` | 0 | Yes (JWT) | No credit check in route |
| **Unlock buyer name in leads feed** | `POST /api/leads/unlock` | **1 credit** | Yes (JWT) | `userCredits.credits < 1 → 400` |
| Purchase credits | `POST /api/credits/purchase` | — | Yes (JWT) | Razorpay order creation |

---

## What Happens to a New Supplier with 0 Credits?

**Before sprint 02:** New suppliers had 0 credits.  
**After sprint 02:** New suppliers receive 3 credits automatically on OTP registration.

For completeness, documented what 0-credit state meant:

| Action | With 0 Credits | Evidence |
|--------|----------------|----------|
| Browse feed | ✅ Full access | `GET /api/supplier/leads` — no credit check |
| View requirement detail | ✅ Full access | `GET /api/rfq/[id]` — public |
| Submit quotation | ✅ Full access | `POST /api/quote` — no credit check |
| Send message | ✅ Full access | `POST /api/messages` — no credit check |
| See buyer name in feed | ❌ Masked | `••• •••••` in leads response |
| Unlock buyer name in feed | ❌ Blocked | `POST /api/leads/unlock` → 400 "Insufficient credits" |

---

## Can a Supplier Participate Without Credits?

**Yes.** A supplier with 0 credits can:
- Browse all active requirements
- View buyer name/company/location on the full RFQ page (no credits needed)
- Submit a quotation on any open requirement
- Send messages to buyers
- Track their own quote status

**What they cannot do with 0 credits:**
- See buyer name directly inside the leads feed (convenience shortcut only)

**Practical conclusion:** Credits are a convenience feature, not a participation gate. A supplier never needs credits to find and bid on requirements.

---

## Credit Packages Available

| Package | Credits | Price |
|---------|---------|-------|
| Starter | 2 | ₹10 |
| Pro | 12 | ₹50 |
| Enterprise | 30 | ₹100 |

Source: `CreditPurchase` table; packages defined in `POST /api/credits/purchase` route.

**Onboarding grant:** 3 free credits on registration (`ONBOARDING_CREDITS` env var).  
**Admin grant:** `POST /api/admin/credits { action: "grant", userId, amount }`.

---

## Messages: No Credit Gate

`POST /api/messages` — no credit check. Source:

```typescript
// src/app/api/messages/route.ts
// Auth: JWT required
// No credit check in the route
```

Messages require only authentication. A supplier can message any buyer after registration.

---

## Unlock Fix Status

`POST /api/leads/unlock` was broken in prior code (queried CRM `leads` table instead of `rfqs`). Fixed in sprint 02 Phase 1:
- Now queries `prisma.rFQ.findFirst` with `isPublic: true`
- Returns `buyerName`, `buyerCompany`, `buyerLocation`
- Credit deduction works end-to-end

---

## Recommendation

No credit friction changes needed. The current model is correct:
- 0 credits → full participation except feed-level name unlock
- 3 starter credits → immediate unlock capability for 3 requirements on day 1
- Credits are an optional convenience, not a paywall
