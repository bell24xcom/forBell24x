# Supplier Credit System Audit
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-01  
**Date:** 2026-08-26  
**Audited by:** Claude Code (evidence from source)

---

## Status: PARTIALLY WORKING — critical gaps

---

## Architecture

### Schema

```prisma
model UserCredits {
  id      String @id @default(cuid())
  userId  String @unique @map("user_id")
  credits Int    @default(0)   // ← starts at zero
  spent   Int    @default(0)
  ...
}

model CreditPurchase {
  userId     String
  credits    Int
  amount     Float
  razorpayId String?
  status     String @default("pending")
  ...
}
```

**Default balance: 0** — no row is created on registration, no credits seeded.

---

## What Consumes Credits

| Action | Credit Cost | Status |
|--------|-------------|--------|
| Unlock RFQ buyer identity via `/api/leads/unlock` | 1 credit | BROKEN (see below) |
| Submit a quote via `/api/rfq/quotes` | 0 credits | WORKING |
| Browse the RFQ feed via `/api/supplier/leads` | 0 credits | WORKING |
| View full RFQ detail via `/api/rfq/[id]` | 0 credits | WORKING |
| Everything else | 0 credits | — |

**Key finding: quote submission requires ZERO credits.** A supplier with 0 credits can browse RFQs, see masked buyer identity, and submit quotes. The credit wall only blocks buyer identity unlock.

---

## Credit Packages (Defined in Code)

Source: `src/app/api/credits/purchase/route.ts`

| Package | Credits | Amount (INR) | Per-Credit Cost |
|---------|---------|--------------|-----------------|
| starter | 2 | ₹10 | ₹5 |
| pro | 12 | ₹50 | ₹4.17 |
| enterprise | 30 | ₹100 | ₹3.33 |

---

## Credit Purchase Flow

**Route:** `POST /api/credits/purchase`  
**Status: WORKING (backend only)**

1. Client sends `{ userId, package: 'starter' | 'pro' | 'enterprise' }`
2. Creates Razorpay order via REST API (not SDK)
3. Creates `CreditPurchase` row with `status: 'pending'`
4. Returns `{ orderId, amount, credits, purchaseId }`

**Route:** `POST /api/credits/verify`  
**Status: WORKING**

1. Verifies Razorpay HMAC signature
2. Fetches `CreditPurchase` row, checks `status === 'pending'`
3. Transaction:
   - Updates `CreditPurchase.status` → `'completed'`
   - Upserts `UserCredits` (creates if missing, increments if exists)
4. Returns `{ success: true, credits: N }`

**Gap: No evidence of purchase UI in supplier dashboard.** Backend routes exist but there is no frontend page confirmed to expose them.

---

## Admin Credit Grant

**Status: DOES NOT EXIST**

`/api/admin/users` PUT only allows updating: `name, role, plan, isActive, isVerified, company, location`

Credits are not in the allowed update fields. There is no admin route to grant credits.

**Workaround (database only):**
```sql
INSERT INTO "user_credits" ("id", "user_id", "credits", "spent", "created_at", "updated_at")
VALUES (gen_random_uuid()::text, '{supplierId}', 3, 0, now(), now())
ON CONFLICT ("user_id") DO UPDATE SET "credits" = "user_credits"."credits" + 3, "updated_at" = now();
```

---

## Behavior at Zero Credits

When `UserCredits` row is missing OR `credits < 1`:

**At `/api/leads/unlock`:**
```json
{ "error": "Insufficient credits. Please purchase credits to unlock leads." }
```
HTTP 400.

**At `/api/rfq/quotes` (POST) — quote submission:**
No credit check. Supplier can submit a quote regardless of credit balance.

---

## Critical Bug: Lead Unlock Is Broken

**Source:** `src/app/api/leads/unlock/route.ts`

The route queries:
```typescript
const lead = await prisma.lead.findUnique({ where: { id: leadId } });
```

This queries the **`leads` CRM table** (model: `Lead`). But the supplier leads feed at `/api/supplier/leads` sends **RFQ IDs** as `leadId`. The `leads` table contains CRM contacts — not RFQs. An RFQ ID will never match a Lead ID.

**Result:** Every unlock attempt from the supplier leads feed returns:
```json
{ "error": "Lead not found" }
```
HTTP 404. Credits are never deducted and nothing is unlocked.

The feature is architecturally broken. The fix: change the lookup to `prisma.rFQ.findFirst({ where: { id: leadId } })` and adjust the response accordingly.

---

## Summary Classification

| Feature | Status |
|---------|--------|
| Credit storage (schema) | WORKING |
| Default credit balance (0) | WORKING (but bad for onboarding) |
| Credit purchase (backend) | WORKING |
| Credit purchase (frontend UI) | UNKNOWN / probably absent |
| Credit verification (webhook) | WORKING |
| Admin credit grant route | DOES NOT EXIST |
| Lead unlock | BROKEN (queries wrong table) |
| Quote submission credit gate | NOT GATED (suppliers can quote freely) |

---

## Recommendations

1. **Immediate:** Fix `/api/leads/unlock` to query `rfqs` table, not `leads` table
2. **Immediate:** Grant 3 free credits on first phone OTP verification (in `otp/verify` route)
3. **Short-term:** Add `POST /api/admin/users/[id]/credits` for manual grant
4. **Short-term:** Confirm credit purchase frontend exists; if not, build a one-page credits purchase screen in supplier dashboard
5. **Document:** Clarify to first 10 suppliers that they can submit quotes for free; credits only unlock buyer name (which they can also see for free via the public `/api/rfq/[id]` route)
