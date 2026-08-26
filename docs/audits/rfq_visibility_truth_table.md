# RFQ Visibility Truth Table
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-01  
**Date:** 2026-08-26  
**Source routes:** `GET /api/supplier/leads`, `GET /api/rfq/[id]`, `PUT /api/rfq/quotes`

---

## Supplier Leads Feed — `GET /api/supplier/leads`

Auth required: **Yes (JWT)**

| Field | Before Unlock | After Unlock (1 credit) | Notes |
|-------|--------------|------------------------|-------|
| RFQ ID | ✅ Visible | ✅ Visible | `rfq.id` |
| Category | ✅ Visible | ✅ Visible | `rfq.category` |
| Product / Title | ✅ Visible | ✅ Visible | `rfq.title` |
| Quantity | ✅ Visible | ✅ Visible | `rfq.quantity` |
| Budget (maxBudget) | ✅ Visible | ✅ Visible | Shown as null if not set |
| Description | ✅ Visible | ✅ Visible | `rfq.description` |
| Urgency | ✅ Visible | ✅ Visible | `rfq.urgency` |
| Location | ✅ Visible | ✅ Visible | `rfq.location` |
| Status | ✅ Visible | ✅ Visible | Only OPEN/ACTIVE returned |
| Created at | ✅ Visible | ✅ Visible | `rfq.createdAt` |
| Buyer Name | ❌ `••• •••••` | ✅ Revealed | `rfq.user.name` |
| Buyer Company | ❌ `••••••• •••` | ✅ Revealed | `rfq.user.company` |
| Buyer Email | ❌ Never | ❌ Never | Not in DB select |
| Buyer Phone | ❌ Never | ❌ Never | Not in DB select |
| GST verification status | ❌ Never | ❌ Never | Not exposed |
| isVerified badge | ❌ Never | ❌ Never | Not exposed |
| Supplier's own RFQs | ❌ Excluded | ❌ Excluded | `NOT: { createdBy: supplierId }` |
| Supplier credit balance | ✅ Visible | ✅ Visible | Returned as `credits` in response |

**Important:** The unlock is **broken** — see `lead_unlock_audit_v2.md`. Even if credits are spent, the unlock call will always return 404.

---

## Public RFQ Detail — `GET /api/rfq/[id]`

Auth required: **No (public)**

| Field | Visible? | Notes |
|-------|----------|-------|
| RFQ ID | ✅ Yes | |
| Slug | ✅ Yes | |
| Title | ✅ Yes | |
| Category | ✅ Yes | |
| Description | ✅ Yes | |
| Quantity | ✅ Yes | |
| Unit | ✅ Yes | |
| Budget (maxBudget) | ✅ Yes | |
| Timeline | ✅ Yes | |
| Urgency | ✅ Yes | |
| Location | ✅ Yes | |
| Status | ✅ Yes | |
| Views count | ✅ Yes | Auto-increments on fetch |
| Buyer Name | ✅ Yes | `rfq.user.name` — **no auth, no credits** |
| Buyer Company | ✅ Yes | `rfq.user.company` — **no auth, no credits** |
| Buyer Location | ✅ Yes | `rfq.user.location` — **no auth, no credits** |
| Buyer Email | ❌ No | Not in select |
| Buyer Phone | ❌ No | Not in select |
| GST verification | ❌ No | Not in select |
| `isPublic` guard | Required | Returns 404 if `isPublic: false` |

**Key finding:** Buyer name, company, and location are visible WITHOUT authentication via the public RFQ URL. A supplier who knows the RFQ ID can see buyer identity for free, making the credit-based unlock in the leads feed redundant.

---

## Quote Review — `GET /api/rfq/quotes?rfqId=xxx`

Auth required: **Yes (JWT)**  
Who can see: **Any authenticated user** (route does not restrict to RFQ owner)

| Field | Visible to authenticated user? | Notes |
|-------|-------------------------------|-------|
| Quote ID | ✅ Yes | |
| Price | ✅ Yes | |
| Quantity | ✅ Yes | |
| Delivery Days | ✅ Yes | |
| Notes / Description | ✅ Yes | |
| Timeline | ✅ Yes | |
| Terms | ✅ Yes | |
| Status (PENDING/ACCEPTED/REJECTED) | ✅ Yes | |
| isAccepted | ✅ Yes | |
| Supplier ID | ✅ Yes | |
| Supplier Name | ✅ Yes | |
| Supplier Company | ✅ Yes | |
| Supplier Email | ✅ Yes | **Included in select** — gap from previous audit |
| Supplier Phone | ✅ Yes | **Included in select** — gap from previous audit |
| Supplier TrustScore | ✅ Yes | |
| Supplier Location | ✅ Yes | |
| Supplier isVerified | ❌ No | Not in select |

**Finding:** Supplier phone and email ARE included in the quote response (`supplier: { id, name, company, email, phone, trustScore, location }`). Previous audit said "phone/email not shown" — that was incorrect based on current code.

---

## RFQ Status Values (Complete Enum)

From `prisma/schema.prisma`:
```
OPEN, CLOSED, CANCELLED, COMPLETED, DRAFT, ACTIVE, QUOTED, ACCEPTED, IN_PROGRESS, EXPIRED, CLOSED_EXTERNAL
```

Supplier leads feed shows only: `OPEN`, `ACTIVE`  
Public RFQ list (`/api/rfq/list`) defaults to: `ACTIVE` (param `status`)

---

## Visibility Inconsistencies

| Inconsistency | Impact | Decision |
|---------------|--------|----------|
| Public `/api/rfq/[id]` shows buyer name without auth | Credit unlock bypass — any supplier with RFQ ID can see buyer identity free | Intentional by design (buyers chose `isPublic: true`) |
| Supplier email/phone exposed via quote GET | Any authenticated user can see supplier contact after quote submitted | May be intentional (deal flow needs contact sharing) |
| `isVerified` not shown on quote to buyer | Buyer cannot distinguish verified vs unverified suppliers | Gap — recommend adding to quote response |
| Lead unlock broken (wrong table) | Suppliers cannot unlock buyer names via the leads feed credit system | Bug — fix required |

---

## What Ishwar Can Actually See Without Spending Money

1. RFQ feed: category, product, quantity, budget, location, urgency — **yes, all visible**
2. Buyer name in feed: **masked** (but see below)
3. Buyer name via direct URL: **fully visible, no auth needed**
4. GST/verification status of buyers: **never visible**
5. Buyer contact details (email/phone): **never visible** — protected throughout the flow

**Bottom line:** Ishwar gets full RFQ intelligence for free. The credit system's only real value is the convenience of seeing buyer names in the leads feed without separately visiting each RFQ URL.
