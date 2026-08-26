# Supplier RFQ Visibility Audit
**Project:** VyaparSethu  
**Date:** 2026-08-26  
**Source routes audited:**
- `GET /api/supplier/leads` — supplier's view of available RFQs
- `GET /api/rfq/[id]` — public RFQ detail (no auth required)
- `GET /api/rfq/[id]/quotes` — quotes on an RFQ (buyer-only)
- `GET /api/marketplace/rfqs` — marketplace RFQ list

---

## What Suppliers Can See (Evidenced from Code)

### `/api/supplier/leads` — RFQ Feed for Suppliers

**Auth required:** Yes — valid JWT.

**Visibility rules:**
| Field | Visible to supplier? | Notes |
|-------|---------------------|-------|
| RFQ ID | ✅ Yes | `rfq.id` |
| Category | ✅ Yes | `rfq.category` |
| Product / Title | ✅ Yes | `rfq.title` |
| Quantity | ✅ Yes | `rfq.quantity` |
| Budget (maxBudget) | ✅ Yes | Converted to number. Shown as `null` if not set by buyer. |
| Location | ✅ Yes | `rfq.location` |
| Urgency | ✅ Yes | `rfq.urgency` |
| Description | ✅ Yes | `rfq.description` |
| Status | ✅ Yes | Only OPEN / ACTIVE shown |
| Created at | ✅ Yes | `rfq.createdAt` |
| Buyer name | ❌ Masked | Shows `••• •••••` until unlocked |
| Buyer company | ❌ Masked | Shows `••••••• •••` until unlocked |
| Buyer email | ❌ Never shown | Not included in query select |
| Buyer phone | ❌ Never shown | Not included in query select |
| Supplier's own RFQs | ❌ Excluded | `NOT: { createdBy: supplierId }` |

**Unlock mechanism:**
- `POST /api/leads/unlock` with `leadId` (= rfqId) and `supplierId`
- Costs 1 credit from `UserCredits`
- After unlock: buyer name and company revealed
- Buyer email and phone still not revealed (not in schema select)

---

### `/api/rfq/[id]` — Public RFQ Detail (No Auth)

**Auth required:** No — public route.

**Visibility rules:**
| Field | Visible? | Notes |
|-------|----------|-------|
| RFQ ID, slug | ✅ Yes | |
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
| Views | ✅ Yes | Auto-increments on fetch |
| Buyer name | ✅ Yes | `user.name` via include |
| Buyer company | ✅ Yes | `user.company` |
| Buyer location | ✅ Yes | `user.location` |
| Buyer email | ❌ No | Not in select |
| Buyer phone | ❌ No | Not in select |
| **isPublic guard** | Required | Only returns if `isPublic: true` |

**Finding:** Public RFQ detail already shows buyer name, company, and location without auth. This is more permissive than the supplier leads feed. A supplier who knows the RFQ ID can see buyer identity without spending a credit. This is a **visibility inconsistency** — not a security issue (RFQs are explicitly public) but creates a credit system bypass.

---

### `/api/rfq/[id]/quotes` — Quotes on an RFQ

**Auth required:** Yes — only the buyer who owns the RFQ can see all quotes.

**What suppliers can see:** Nothing — forbidden to all except RFQ creator.

**What quote fields are returned (to buyer only):**
| Field | Visible to buyer? |
|-------|-----------------|
| Quote ID, price, quantity | ✅ Yes |
| Delivery days, notes, terms, timeline | ✅ Yes |
| Supplier name and company | ✅ Yes |
| Supplier city, trustScore | ✅ Yes |
| Quote status, isAccepted | ✅ Yes |
| Supplier phone / email | ❌ No |

---

## RFQ Status Flow (from schema and routes)

```
OPEN      → Buyer posted, accepting quotes
ACTIVE    → At least one quote received (supplier-facing: same as OPEN)
CLOSED    → Buyer selected a quote; deal being created
COMPLETED → Deal closed and settled
CANCELLED → Buyer cancelled
```

Suppliers can only see `OPEN` and `ACTIVE` RFQs in their leads feed.

---

## Verification Status Visibility

**Supplier profile route** `GET /api/supplier/profile`:
- Returns `verified: user.isVerified` and `trustScore: user.trustScore` to the supplier for their own profile.
- Not shown to other suppliers — per Dashboard Visibility Policy Level 2.

**Buyer view of supplier:**
- Quote response includes `supplier.trustScore` and `supplier.city` — buyer sees this when reviewing quotes.
- `user.isVerified` is not returned in the quotes endpoint. Gap: buyers cannot see verification badge from quote view.

---

## Quote Workflow (End to End)

1. Supplier sees RFQ in `/api/supplier/leads` feed
2. Supplier optionally unlocks buyer identity via `/api/leads/unlock` (1 credit)
3. Supplier submits quote via `POST /api/rfq/quotes` or `POST /api/quote`
4. Buyer receives `quoteReceivedEmail` (transactional email, automated)
5. Buyer views all quotes at `/api/rfq/[id]/quotes` (auth required)
6. Buyer accepts a quote via `POST /api/deal/select`
7. Deal created → `quoteAcceptedEmail` sent to supplier
8. Payment arranged via Razorpay Protected Payment

---

## Gaps and Recommendations

| Gap | Impact | Fix |
|-----|--------|-----|
| Buyer email/phone never revealed even after credit unlock | Supplier cannot contact buyer directly after unlock | Intentional design (Protected Payment model) — document clearly on unlock UI |
| Public `/api/rfq/[id]` shows buyer name without auth | Credit unlock bypass for suppliers who know the ID | Accept as-is (buyers chose to make RFQ public) or add `isPublic` toggle on buyer RFQ form |
| `isVerified` not shown in quote context to buyer | Buyer cannot differentiate verified vs unverified suppliers | Add `isVerified` to quote supplier select in `/api/rfq/[id]/quotes` |
| In-app notification not created on RFQ match | Supplier only notified via email; misses if email unavailable | Add `prisma.notification.create` in rfq-match-suppliers route |
| Contact visibility after deal creation undefined | Supplier needs delivery address; buyer needs supplier address | Document deal contact-reveal policy and implement in `/api/deal/[id]` response |
