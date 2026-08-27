# Lead Unlock Fix Plan
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-03  
**Date:** 2026-08-27  
**Status:** IMPLEMENTED (sprint 02 Phase 1) — this document records the bug, the fix, and the migration impact.

---

## The Bug

**Route:** `POST /api/leads/unlock`  
**File:** `src/app/api/leads/unlock/route.ts`  
**Symptom:** Every unlock call returned 404. Credits were never deducted. Buyer names were never revealed in the leads feed.

### Root Cause

The route queried the CRM `leads` table using the `leadId` from the request body:

```typescript
// BROKEN (original code):
const lead = await prisma.lead.findUnique({
  where: { id: leadId }  // leadId is an RFQ ID — CRM Lead table has no such row
});
if (!lead) {
  return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
}
```

The supplier leads feed (`GET /api/supplier/leads`) returns RFQ records and uses `rfq.id` as the `leadId` in each row. RFQ IDs exist in the `rfqs` table, not the `leads` (CRM) table.

The `leads` table contains CRM contacts: `name, email, phone, source, status` — a sales pipeline model entirely separate from the RFQ marketplace.

### Affected Tables

| Table | Role | Problem |
|-------|------|---------|
| `leads` | CRM pipeline contacts | Route incorrectly queried here |
| `rfqs` | Buyer requirements | Should be queried |
| `lead_suppliers` | Unlock records (stores RFQ ID as leadId) | Not reached due to Step 2 always failing |
| `user_credits` | Credit balance | Not reached |

### Execution Path (Before Fix)

```
POST /api/leads/unlock { leadId: "<rfq-uuid>", supplierId: "<user-id>" }
  → Step 1: validate params ✅
  → Step 2: prisma.lead.findUnique({ where: { id: leadId } }) → null (no CRM lead has RFQ ID)
  → return 404 "Lead not found"  ← all executions terminate here
  → Step 3: check LeadSupplier.unlocked ← never reached
  → Step 4: check credits ← never reached
  → Step 5: deduct credit ← never reached
  → Step 6: create LeadSupplier row ← never reached
```

---

## The Fix (Implemented)

Changed `prisma.lead.findUnique` → `prisma.rFQ.findFirst`:

```typescript
// FIXED:
const rfq = await prisma.rFQ.findFirst({
  where: {
    id: leadId,
    isPublic: true,   // only unlock public requirements
  },
  include: {
    user: {
      select: { id: true, name: true, company: true, location: true },
    },
  },
});
if (!rfq) {
  return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
}
```

Updated response to return buyer identity:

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

---

## Migration Impact

**None.** The fix is a one-file code change. No schema changes. No data migrations.

The `lead_suppliers` table already stores RFQ IDs as `leadId` (field name is misleading but the data is correct). The feed-side check (`LeadSupplier.unlocked` lookup) was already correct — it was just never populated because the unlock route always failed.

| Schema element | Status |
|----------------|--------|
| `lead_suppliers` table | No change |
| `leadId` field type | No change — still stores RFQ IDs |
| `rfqs` table | No change |
| `leads` (CRM) table | No change |
| `user_credits` table | No change |

---

## Verification

End-to-end test sequence:

1. Register as supplier (OTP) → receive 3 starter credits
2. `GET /api/supplier/leads` → note a `leadId` (RFQ ID) and confirm `contactHidden: true`
3. `POST /api/leads/unlock { leadId, supplierId }` → should return 200 with buyer name
4. `GET /api/supplier/leads` again → same lead should now show `contactHidden: false` with buyer name
5. Repeat step 3 → should return 200 with "already unlocked" (idempotent)
6. Check credit balance: `GET /api/admin/credits?userId=<supplierId>` → balance reduced by 1

---

## Idempotency Check

The existing idempotency logic (checks `LeadSupplier` for existing unlock before deducting) is correct and was not changed. A supplier cannot accidentally spend 2 credits unlocking the same requirement.

---

## Buyer Contact Protection

After unlock:
- `buyerName` ✅ revealed
- `buyerCompany` ✅ revealed
- `buyerLocation` ✅ revealed
- `buyerEmail` ❌ never — not in DB select at any stage
- `buyerPhone` ❌ never — protected until deal closes
