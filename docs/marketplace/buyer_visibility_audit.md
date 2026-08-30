# Buyer Visibility Audit
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-FIRST-TRANSACTION-01 — Phase 4  
**Date:** 2026-08-27  
**Question:** What does a supplier see about the buyer at each stage?

---

## Stage Map

```
Stage 1: Before any action   — Supplier in leads feed
Stage 2: Before unlocking    — Supplier reads leads feed row
Stage 3: After unlock        — Supplier unlocks buyer name in leads feed
Stage 4: Full RFQ page       — Supplier navigates to /rfq/[id]
Stage 5: After quoting       — Supplier views their submitted quote
Stage 6: Quote accepted      — Supplier receives acceptance
Stage 7: Deal closed         — Supplier receives payment
```

---

## Stage 1 — Leads Feed (Before Unlock)

**Route:** `GET /api/supplier/leads`

| Field | Visible? | Value |
|-------|----------|-------|
| `rfq.title` | ✅ | Full text |
| `rfq.description` | ✅ | Full text |
| `rfq.category` | ✅ | Full text |
| `rfq.quantity` | ✅ | Full text |
| `rfq.budget` | ✅ | If set |
| `rfq.urgency` | ✅ | STANDARD / URGENT / CRITICAL |
| `rfq.location` | ✅ | City/state |
| `rfq.createdAt` | ✅ | ISO timestamp |
| `rfq._count.quotes` | ✅ | Number of quotes received |
| **buyer.name** | ❌ | `••• •••••` (masked) |
| **buyer.company** | ❌ | Not returned |
| **buyer.phone** | ❌ | Not returned at any stage via this route |
| `contactHidden` | ✅ | `true` |
| `creditBalance` | ✅ | Supplier's current credit balance |

**Source:** `src/app/api/supplier/leads/route.ts` — masking logic confirmed.

---

## Stage 2 — Full RFQ Detail Page (NO AUTH REQUIRED)

**Route:** `GET /api/rfq/[id]`  
**Auth:** None — fully public endpoint.

| Field | Visible? | Value |
|-------|----------|-------|
| All RFQ fields | ✅ | Full |
| **buyer.name** | ✅ | **Fully exposed** |
| **buyer.company** | ✅ | **Fully exposed** |
| **buyer.location** | ✅ | **Fully exposed** |
| buyer.email | ❌ | Not in DB select |
| buyer.phone | ❌ | Not in DB select |

**Source:** `src/app/api/rfq/[id]/route.ts` — `user: { select: { id, name, company, location } }`

**Critical finding:** A supplier can see buyer name and company on the public RFQ page **without any auth, without spending any credits**. The leads-feed masking (`••• •••••`) is a UX pattern, not a data protection mechanism. Any supplier who navigates directly to `vyaparsethu.com/rfq/<rfq-id>` sees the buyer's identity for free.

**Implication for business model:** The 1-credit unlock in the leads feed is a convenience charge ("see buyer identity without leaving the feed"), not a data access control. This is acceptable IF buyers understand their identity is public on the requirement detail page. If buyers expect identity privacy until they select a supplier, this is a trust gap.

**Recommendation (founder decision required):**
- Option A: Accept current model. Buyer names are public. Credits gate the feed-level shortcut only.
- Option B: Add auth gate to `GET /api/rfq/[id]` for buyer identity fields (breaking change for SEO/public pages).
- Option C: Mask buyer name on public page until the RFQ has at least 1 accepted deal. Not recommended — too complex.

**Default for this sprint:** Document the finding. No code change. The current model enables the first transaction.

---

## Stage 3 — After Unlock (Leads Feed)

**Route:** `POST /api/leads/unlock` → `GET /api/supplier/leads`

After spending 1 credit:

| Field | Visible? | Value |
|-------|----------|-------|
| buyer.name | ✅ | Revealed in feed |
| buyer.company | ✅ | Revealed in feed |
| buyer.location | ✅ | Revealed in feed |
| buyer.email | ❌ | Not returned |
| buyer.phone | ❌ | Not returned (protected until deal closes) |
| `contactHidden` | ✅ | `false` |

**Source:** `src/app/api/leads/unlock/route.ts` (post sprint-02 fix), `src/app/api/supplier/leads/route.ts`

---

## Stage 4 — After Quoting

**Route:** `GET /api/supplier/quotes`

When supplier lists their submitted quotes:

| Field | Visible? | Value |
|-------|----------|-------|
| rfq.user.name | ✅ | Buyer name |
| rfq.user.company | ✅ | Buyer company |
| rfq.user.location | ✅ | Buyer location |
| rfq.user.email | ❌ | Not in select |
| rfq.user.phone | ❌ | Not in select |
| quote.status | ✅ | PENDING / ACCEPTED / REJECTED / EXPIRED |

**Source:** `src/app/api/supplier/quotes/route.ts`

---

## Stage 5 — Quote Accepted (Deal Created)

When `Quote.status = ACCEPTED`, a `Deal` is created. What the supplier can access:

**Route:** `GET /api/supplier/stats` — aggregates only (won quotes count, total earned).

**Route:** Deals-specific supplier route — needs verification (not read in this sprint).

**Route:** `GET /api/supplier/quotes` — quote row now shows `status: ACCEPTED`.

At this stage the supplier knows the quote was accepted but contact details (phone/email) remain hidden until payment is processed.

---

## Stage 6 — Deal Closed / Payment Completed

At `Transaction.status = COMPLETED`:
- Buyer has paid into escrow (Razorpay)
- Supplier delivers goods/services
- On delivery confirmation, payment releases

**Phone/email reveal:** Not surfaced by any API route in the current codebase review. The platform does not automatically reveal buyer phone/email on deal close. Off-platform contact (the buyer contacts the supplier) is the current mechanism.

**Gap:** No route returns `buyer.phone` or `buyer.email` to suppliers at any stage. For large B2B orders, phone contact between buyer and supplier is expected. Founders should decide: should phone be revealed on deal acceptance? On payment?

---

## Summary: Buyer Identity Visibility Matrix

| Stage | Name & Company | Phone | Email |
|-------|---------------|-------|-------|
| Leads feed (locked) | ❌ masked | ❌ | ❌ |
| Leads feed (unlocked, 1 credit) | ✅ | ❌ | ❌ |
| Full public RFQ page | ✅ (no auth!) | ❌ | ❌ |
| Supplier quotes list | ✅ | ❌ | ❌ |
| Quote accepted | ✅ | ❌ | ❌ |
| Deal closed | ✅ | ❌ *(gap)* | ❌ *(gap)* |

---

## Decisions Required from Founder

1. **Public RFQ page exposes buyer identity** — acceptable or change required?
2. **Phone reveal on deal acceptance** — yes/no? If yes, which route should return it?
3. **Email reveal** — VyaparSethu mission is "no bad debt / trusted trade" — email may not be needed if messaging flows through platform.
