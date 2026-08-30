# RFQ Inventory Truth Report
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-01  
**Date:** 2026-08-26  

---

## Status: PARTIALLY AUDITABLE

RFQ counts cannot be verified from static code analysis — they require live database access. This document records the classification rules from code evidence so the founder can run the queries against the Neon database.

---

## RFQ Schema Fields Relevant to Classification

From `prisma/schema.prisma`:

```prisma
model RFQ {
  status    RFQStatus  @default(ACTIVE)
  isPublic  Boolean    @default(true)
  isSeeded  Boolean    @default(false) @map("is_seeded")
  createdBy String?    @map("created_by")
  expiresAt DateTime?
  ...
}

enum RFQStatus {
  OPEN, CLOSED, CANCELLED, COMPLETED, DRAFT, ACTIVE,
  QUOTED, ACCEPTED, IN_PROGRESS, EXPIRED, CLOSED_EXTERNAL
}
```

---

## Classification Rules

### Real Buyer RFQs (counts toward platform credibility)
```sql
SELECT count(*) FROM "rfqs" 
WHERE "is_seeded" = false 
  AND "is_public" = true 
  AND status IN ('OPEN', 'ACTIVE', 'QUOTED')
  AND "created_by" IS NOT NULL;
```

### Seeded / Demo RFQs (do NOT count)
```sql
SELECT count(*) FROM "rfqs" WHERE "is_seeded" = true;
```

### Anonymous RFQs (no buyer attached)
```sql
SELECT count(*) FROM "rfqs" WHERE "created_by" IS NULL;
```

### Draft RFQs (not yet published)
```sql
SELECT count(*) FROM "rfqs" WHERE status = 'DRAFT';
```

### Expired RFQs
```sql
SELECT count(*) FROM "rfqs" 
WHERE status = 'EXPIRED' 
   OR ("expires_at" IS NOT NULL AND "expires_at" < now());
```

### Closed / Completed RFQs
```sql
SELECT count(*) FROM "rfqs" WHERE status IN ('CLOSED', 'COMPLETED', 'ACCEPTED', 'CLOSED_EXTERNAL');
```

### Full Inventory Breakdown
```sql
SELECT 
  is_seeded,
  is_public,
  status,
  CASE WHEN created_by IS NULL THEN 'anonymous' ELSE 'has_buyer' END as buyer_type,
  count(*) as count
FROM "rfqs"
GROUP BY is_seeded, is_public, status, buyer_type
ORDER BY is_seeded, count DESC;
```

---

## What Suppliers See

`GET /api/supplier/leads` returns RFQs where:
- `isPublic: true`
- `status IN ('OPEN', 'ACTIVE')`
- Not created by the requesting supplier

`GET /api/rfq/list` returns RFQs where:
- `status = {param}` (default: `'ACTIVE'`)
- No `isSeeded` or `isPublic` filter — may expose seeded RFQs

**Gap:** `/api/rfq/list` does not filter out seeded RFQs. Suppliers browsing the marketplace view may see demo/seeded content.

---

## What to Tell Suppliers and Investors

**Safe answer (until DB is queried):**
> "We have active buyer Requirements across Steel, Packaging, and Textiles. Our founding cohort of buyers has posted real requirements. Contact us for current inventory."

Do NOT state a number publicly until the DB query confirms real (non-seeded, non-anonymous) RFQ count.

---

## Admin Query to Run Now

Run in Neon SQL editor:

```sql
-- Quick snapshot
SELECT 
  COUNT(*) FILTER (WHERE is_seeded = false AND is_public = true AND status IN ('OPEN', 'ACTIVE', 'QUOTED') AND created_by IS NOT NULL) as real_active_rfqs,
  COUNT(*) FILTER (WHERE is_seeded = true) as seeded_rfqs,
  COUNT(*) FILTER (WHERE created_by IS NULL) as anonymous_rfqs,
  COUNT(*) FILTER (WHERE status = 'DRAFT') as draft_rfqs,
  COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'CLOSED', 'ACCEPTED')) as completed_rfqs,
  COUNT(*) as total_rfqs
FROM "rfqs";
```

---

## Recommendation

Before the first 10 supplier outreach, the founder should:

1. Run the query above
2. If `real_active_rfqs < 3`: create 3–5 real buyer test RFQs (using a buyer account) in the categories being sourced (Steel, Packaging, Textiles)
3. Use these real RFQs as the first "match" for Ishwar and subsequent suppliers
4. Never seed fake RFQs — use actual founder buyer account for test RFQs
