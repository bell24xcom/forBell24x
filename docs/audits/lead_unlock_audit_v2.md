# Lead Unlock Audit v2
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-01  
**Date:** 2026-08-26  
**Route:** `POST /api/leads/unlock`  
**Source:** `src/app/api/leads/unlock/route.ts`

---

## Status: BROKEN

The lead unlock endpoint exists and is not feature-flagged, but it is **functionally broken** due to a table mismatch. Unlocks always fail with 404 when called from the supplier leads feed.

---

## Root Cause

The route queries the **CRM `leads` table** (model: `Lead`):
```typescript
const lead = await prisma.lead.findUnique({
  where: { id: leadId }
});
if (!lead) {
  return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
}
```

But the supplier leads feed (`/api/supplier/leads`) uses **RFQ IDs** as `leadId`:
```typescript
// In /api/supplier/leads response:
leads = rfqs.map(rfq => ({
  id: rfq.id,  // ← this is an RFQ ID, not a CRM Lead ID
  ...
}));
```

The `leads` table contains CRM contacts (name, email, phone, source — a sales pipeline model). RFQ IDs will never match any row in `leads`. The unlock always returns 404.

---

## What Should Happen vs What Does Happen

| Step | Expected | Actual |
|------|----------|--------|
| 1. Validate leadId + supplierId | ✅ | ✅ |
| 2. Find "lead" record | Finds RFQ by ID | Queries `leads` CRM table → 404 |
| 3. Check existing unlock | — | Never reached |
| 4. Check credits | — | Never reached |
| 5. Deduct credit | — | Never reached |
| 6. Create LeadSupplier row | — | Never reached |
| 7. Return unlocked lead | — | Never reached |

---

## The Fix Required

Change `prisma.lead.findUnique` → `prisma.rFQ.findFirst`, adjust response:

```typescript
// Current (broken):
const lead = await prisma.lead.findUnique({ where: { id: leadId } });
if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

// Fixed:
const rfq = await prisma.rFQ.findFirst({
  where: { id: leadId, isPublic: true },
  include: { user: { select: { name: true, company: true } } },
});
if (!rfq) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
```

And update the return value to expose buyer name/company from `rfq.user`.

---

## Credit System Integration (When Fixed)

The credit deduction and `LeadSupplier` upsert logic is correct:
```typescript
await prisma.$transaction([
  prisma.userCredits.update({
    where: { userId: supplierId },
    data: { credits: { decrement: 1 }, spent: { increment: 1 } }
  }),
  prisma.leadSupplier.create({
    data: { leadId, supplierId, unlocked: true, unlockedAt: new Date(), credits: 1 }
  })
]);
```

The idempotency check (existing `LeadSupplier` row) is also correct. These just never execute because Step 2 always fails.

---

## LeadSupplier Table vs Supplier Leads Feed

The supplier leads feed checks `LeadSupplier.unlocked` correctly:
```typescript
const unlockedLeads = await prisma.leadSupplier.findMany({
  where: { supplierId, unlocked: true },
  select: { leadId: true },
});
const unlockedSet = new Set(unlockedLeads.map(l => l.leadId));
// uses rfq.id against unlockedSet — this side is correct
```

So the unlock display logic on the feed side works. It just never gets populated because the unlock route is broken.

---

## Access Rules (Current)

| Condition | Result |
|-----------|--------|
| `leadId` or `supplierId` missing | 400 |
| `leadId` is any RFQ ID | **404 (bug)** |
| `leadId` is an actual CRM Lead ID | Would proceed — but no supplier passes CRM Lead IDs |
| Already unlocked | 200 (cached) — never reached from supplier feed |
| Credits < 1 | 400 "Insufficient credits" — never reached from supplier feed |
| Valid supplier with ≥1 credit | Would unlock — never reached from supplier feed |

---

## Roadmap Status

The lead unlock system is **production-intended but broken** due to the table mismatch. Fixing it requires:

1. Change `prisma.lead` → `prisma.rFQ` in the lookup
2. Adjust the response to return unlocked buyer name/company from `rfq.user`
3. (Optional) Ensure the `LeadSupplier.leadId` stores the RFQ ID (currently it does — the field name is just misleading)

This is a one-file fix of approximately 15 lines.

---

## Impact on First 10 Suppliers

Because unlock is broken, first 10 suppliers **cannot spend credits even if they have them**. This is actually a secondary concern — the more important finding is that buyer identity is visible for free via `/api/rfq/[id]`, so the credit unlock is not a hard blocker for supplier participation.
