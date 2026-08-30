# Quote Lifecycle Audit
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-FIRST-TRANSACTION-01 — Phase 3  
**Date:** 2026-08-27  
**Mode:** Evidence-first — actual schema states, not aspirational lifecycle.

---

## Actual Schema: QuoteStatus Enum

```prisma
enum QuoteStatus {
  PENDING    // Default on creation; awaiting buyer review
  ACCEPTED   // Buyer accepted this quote → triggers Deal creation
  REJECTED   // Buyer rejected this quote
  EXPIRED    // Quote exceeded validity window (set by cron or on quote creation deadline)
}
```

Source: `prisma/schema.prisma` — `QuoteStatus` enum definition.

**This is a 4-state lifecycle, not 7-state.** The sprint brief referenced `NEW | SUBMITTED | VIEWED | NEGOTIATING | ACCEPTED | REJECTED | CLOSED` — those states do not exist in the DB.

---

## Quote Model Fields

```prisma
model Quote {
  id             String      @id @default(cuid())
  rfqId          String
  supplierId     String
  price          Float
  quantity       String      @default("1")
  terms          String?
  timeline       String?
  deliveryDays   Int?
  notes          String?
  status         QuoteStatus @default(PENDING)
  source         QuoteSource @default(SELF_SUBMITTED)
  sourcingNote   String?
  sourcedByUserId String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  rfq            RFQ         @relation(fields: [rfqId], references: [id])
  supplier       User        @relation("SupplierQuotes", fields: [supplierId], references: [id])
  deal           Deal?       @relation(fields: [dealId], references: [id])
  dealId         String?
}

enum QuoteSource {
  SELF_SUBMITTED      // Supplier quoted directly on platform
  CONCIERGE_SOURCED   // Admin entered a real off-platform quote on supplier's behalf
}
```

---

## Lifecycle State Machine (Actual)

```
[Supplier submits quote]
        ↓
     PENDING
    /       \
ACCEPTED   REJECTED   EXPIRED
    ↓
[Deal created]
```

### State Transitions

| Transition | Trigger | Route |
|------------|---------|-------|
| `→ PENDING` | Supplier submits via `POST /api/quote` | `src/app/api/quote/route.ts` |
| `PENDING → ACCEPTED` | Buyer accepts quote | `POST /api/rfq/[id]/quotes` (accept action) or admin PUT |
| `PENDING → REJECTED` | Buyer rejects quote | Quote update route |
| `PENDING → EXPIRED` | Quote deadline passes | Expected: cron; currently unknown if implemented |

---

## Deal Creation on Quote Acceptance

When a quote is accepted (`ACCEPTED`), a `Deal` row is created. The `Deal` model:

```prisma
model Deal {
  id          String   @id @default(cuid())
  rfqId       String
  buyerId     String
  supplierId  String
  quoteId     String   @unique
  status      String   @default("ACTIVE")   // Free-form string, NOT an enum
  amount      Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  rfq         RFQ      @relation(...)
  buyer       User     @relation("BuyerDeals", ...)
  supplier    User     @relation("SupplierDeals", ...)
  quote       Quote    @relation(...)
}
```

**Key finding:** `Deal.status` is a free-form `String`, NOT an enum. Observed values in code: `"ACTIVE"`, `"COMPLETED"`, `"CANCELLED"`. No enum constraint — callers can write any string. This is a data integrity risk for future reporting.

---

## What Happens After Quote Accepted: Transaction Flow

```
Deal created (status: "ACTIVE")
    ↓
Transaction created (status: PENDING)
    ↓
Payment processed via Razorpay
    ↓
Transaction status: PROCESSING → COMPLETED
    ↓
Deal status: "COMPLETED"
```

`Transaction.status` IS an enum: `PENDING | PROCESSING | COMPLETED | FAILED | REFUNDED`.

---

## What the Quote Routes Support

### `POST /api/quote` — Submit quote
- Auth: JWT, role SUPPLIER or ADMIN
- Required: `rfqId`, `price`, `quantity`
- Optional: `description`, `terms`, `deliveryDays`
- Creates: `Quote` with `status: PENDING`, `source: SELF_SUBMITTED`
- No credit check
- ✅ Working

### `GET /api/supplier/quotes` — List my quotes
- Auth: JWT
- Returns supplier's quotes with RFQ context and buyer info
- ✅ Working

### `GET /api/rfq/[id]/quotes` — List quotes on an RFQ
- Auth: JWT required
- Returns all quotes for an RFQ with supplier info
- Used by buyers to review incoming quotes
- ✅ Working

### Admin: `POST /api/admin/rfqs` action `submit-concierge-quote`
- Auth: Admin token
- Creates `CONCIERGE_SOURCED` quote on behalf of real supplier
- Requires `sourcingNote` (audit trail)
- Supplier must have phone or email on record
- ✅ Working

---

## Gap: No "VIEWED" State

The lifecycle has no mechanism to record when a buyer views a quote. There is no `viewedAt` field or `VIEWED` status transition. Founders cannot tell from the DB whether a buyer opened a submitted quote.

**Impact:** Cannot distinguish "buyer saw quote and rejected" vs "buyer has not checked yet."

**Recommendation (not this sprint):** Add `viewedAt DateTime?` to `Quote` model — a nullable timestamp set on first buyer view of the quote detail page.

---

## Gap: No Negotiation State

There is no `NEGOTIATING` status or message thread attached to a quote. After a supplier submits a quote:
- The buyer can only Accept or Reject (or ignore)
- There is no in-platform mechanism to counter-offer

**Impact:** Negotiation happens off-platform (phone, WhatsApp). This is acceptable for the first-transaction goal but is a conversion risk for larger deals.

---

## Gap: Quote Expiry Not Automated

There is no verified cron or route that sweeps `PENDING` quotes past their deadline and marks them `EXPIRED`. The `deliveryDays` field is informational, not enforced.

**Impact:** PENDING quotes accumulate indefinitely. Counts inflate. Suppliers cannot see "your quote expired" signal.

**Recommendation (not this sprint):** Vercel Cron at 2 AM IST: `updateMany` where `status = PENDING AND createdAt < 30 days ago` → `EXPIRED`.

---

## Readiness Assessment

| Capability | Status |
|------------|--------|
| Supplier can submit a quote | ✅ Ready |
| Buyer can see submitted quotes | ✅ Ready |
| Buyer can accept a quote | ✅ Ready (triggers Deal) |
| Buyer can reject a quote | ✅ Ready |
| Deal created on acceptance | ✅ Ready |
| Transaction/payment flow | ✅ Ready (Razorpay integrated) |
| Quote viewed tracking | ❌ Not implemented |
| Negotiation | ❌ Not implemented |
| Quote expiry automation | ❌ Not implemented |

**For first-transaction goal:** ✅ Ready. The core path (Submit → Accept → Deal → Payment) is intact.
