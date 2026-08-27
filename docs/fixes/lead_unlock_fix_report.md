# Lead Unlock Fix Report
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-02  
**Phase:** 1  
**Date:** 2026-08-27  
**File changed:** `src/app/api/leads/unlock/route.ts`

---

## Problem

`POST /api/leads/unlock` always returned 404 for every supplier unlock attempt from the leads feed.

**Root cause:** The route queried `prisma.lead` — the CRM leads table — using the `leadId` from the request body. The supplier leads feed (`/api/supplier/leads`) returns RFQ IDs as `leadId`. RFQ IDs never exist in the `leads` CRM table. Every lookup returned null → 404.

The credit deduction, idempotency check, and `LeadSupplier` upsert logic were all correct; they just never executed because step 2 always failed.

---

## Fix Applied

Changed `prisma.lead.findUnique` → `prisma.rFQ.findFirst` with:
- `where: { id: leadId, isPublic: true }` — only unlock public requirements
- `include: { user: { select: { id, name, company, location } } }` — return buyer identity

Updated the response shape to expose:
```json
{
  "success": true,
  "lead": {
    "id": "<rfq-id>",
    "buyerName": "Ramesh Kumar",
    "buyerCompany": "Sunrise Textiles",
    "buyerLocation": "Surat",
    "contactHidden": false
  }
}
```

Updated both the idempotency (already-unlocked) path and the new-unlock path to return the same shape.

---

## What Did Not Change

- Credit deduction logic (`userCredits.credits -= 1`, `spent += 1`) — unchanged
- `LeadSupplier.create` data — unchanged (stores RFQ ID as `leadId`, which was already correct on the feed side)
- Idempotency check (`LeadSupplier.findFirst`) — unchanged
- 400 on missing credits — unchanged
- Error handling — unchanged

---

## Verification

The fix can be verified by:

1. Register as a supplier (OTP)
2. Grant credits (SQL or admin endpoint — see Phase 3)
3. Open the leads feed (`GET /api/supplier/leads`) — note a `leadId` value
4. Call `POST /api/leads/unlock` with `{ leadId, supplierId }` — should return 200 with buyer name
5. Repeat same call — should return 200 with "already unlocked" message (idempotent)
6. Check `LeadSupplier` table — should have one row per unlock

---

## Impact

- Suppliers with credits can now unlock buyer names in the leads feed
- The credit system is end-to-end functional for the first time
- Buyer email/phone remain protected (not in DB select)
- The public RFQ detail page (`/api/rfq/[id]`) already showed buyer name without credits — this fix makes the in-feed credit unlock consistent with that

---

## Remaining Gaps (later phases)

- No admin credit grant UI (Phase 3)
- No starter credits on registration (Phase 2)
- `isVerified` conflation unresolved (Phase 4)
