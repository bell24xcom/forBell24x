# RFQ Inventory Report
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-FIRST-TRANSACTION-01 — Phase 1  
**Date:** 2026-08-27  
**Status:** Evidence-first. All classification rules cite the exact schema fields used.

---

## Classification Schema

RFQs are classified using three schema fields on the `rfqs` table:

| Field | Type | Purpose |
|-------|------|---------|
| `isSeeded` | Boolean | Marks demo/test data seeded by founders; excluded from all public counts |
| `isPublic` | Boolean | Controls visibility in the marketplace feed |
| `createdBy` | String? | FK to `users.id`; NULL means no authenticated buyer attached |
| `status` | RFQStatus | Enum: `OPEN\|CLOSED\|CANCELLED\|COMPLETED\|DRAFT\|ACTIVE\|QUOTED\|ACCEPTED\|IN_PROGRESS\|EXPIRED\|CLOSED_EXTERNAL` |

---

## RFQ Categories

### Category 1: VERIFIED_BUYER
**Criteria:** `isSeeded = false AND isPublic = true AND createdBy IS NOT NULL AND status IN ('OPEN', 'ACTIVE', 'QUOTED')`

These are the only RFQs that count toward platform credibility. A real, authenticated buyer posted this requirement and it is currently open for quoting.

**Query:**
```sql
SELECT count(*) FROM rfqs
WHERE "is_seeded" = false
  AND "is_public" = true
  AND "created_by" IS NOT NULL
  AND status IN ('OPEN', 'ACTIVE', 'QUOTED');
```

**Admin API:** `GET /api/admin/analytics?view=founder` → `supplierConversion.realActiveRfqs`  
**Admin API:** `GET /api/admin/rfqs?view=quality` → `rfqQuality.realActive`

---

### Category 2: UNVERIFIED_BUYER
**Criteria:** `isSeeded = false AND isPublic = true AND createdBy IS NOT NULL AND status IN ('OPEN', 'ACTIVE', 'QUOTED') AND user.verificationStatus = 'PHONE_VERIFIED'`

RFQ is real but buyer has not completed business verification. Suppliers can quote but buyer identity is not founder-confirmed.

**Query:**
```sql
SELECT r.* FROM rfqs r
JOIN users u ON r."created_by" = u.id
WHERE r."is_seeded" = false
  AND r."is_public" = true
  AND r."created_by" IS NOT NULL
  AND r.status IN ('OPEN', 'ACTIVE', 'QUOTED')
  AND u."verification_status" = 'PHONE_VERIFIED';
```

**Admin API:** Not yet surfaced separately. Distinguishable from VERIFIED_BUYER by joining users table.

---

### Category 3: DEMO
**Criteria:** `isSeeded = true`

Founder-seeded data for UI testing and demos. Must never appear in supplier-facing counts or be visible to real buyers as "real" inventory.

**Query:**
```sql
SELECT count(*) FROM rfqs WHERE "is_seeded" = true;
```

**Admin API:** `GET /api/admin/analytics?view=founder` → `supplierConversion.seededRfqs`  
**Admin API:** `GET /api/admin/rfqs?view=quality` → `rfqQuality.seededDemo`

---

### Category 4: ANONYMOUS
**Criteria:** `createdBy IS NULL`

No buyer attached. Created without authentication (e.g. legacy test routes, import scripts, or voice RFQ without save-to-account). A supplier cannot follow up with the buyer because there is no buyer record.

**Query:**
```sql
SELECT count(*) FROM rfqs WHERE "created_by" IS NULL;
```

**Admin API:** `GET /api/admin/rfqs?view=quality` → `rfqQuality.anonymous`

---

### Category 5: DRAFT
**Criteria:** `status = 'DRAFT'`

Buyer started posting but did not publish. Not visible in supplier feed (feed filters for OPEN/ACTIVE).

**Query:**
```sql
SELECT count(*) FROM rfqs WHERE status = 'DRAFT';
```

**Admin API:** `GET /api/admin/rfqs?view=quality` → `rfqQuality.draft`

---

### Category 6: EXPIRED
**Criteria:** `status = 'EXPIRED'` OR `(status NOT IN ('EXPIRED','CLOSED','COMPLETED','CANCELLED','ACCEPTED','CLOSED_EXTERNAL') AND "expires_at" IS NOT NULL AND "expires_at" < NOW())`

Two sub-types:
- Marked expired (`status = 'EXPIRED'`) — already processed
- Date-expired but not yet re-marked — caught by date comparison; a cron should sweep these

**Admin API:** `GET /api/admin/rfqs?view=quality` → `rfqQuality.expired` (both sub-types combined)

---

### Category 7: CLOSED
**Criteria:** `status IN ('CLOSED', 'COMPLETED', 'ACCEPTED', 'CANCELLED', 'CLOSED_EXTERNAL')`

Terminal states. No further quoting expected.

**Admin API:** `GET /api/admin/rfqs?view=quality` → `rfqQuality.closed`

---

## Supplier Feed Behavior

`GET /api/supplier/leads` returns up to 50 RFQs matching:
```typescript
where: { isPublic: true, status: { in: ['OPEN', 'ACTIVE'] } }
```

**Note:** This feed does NOT filter `isSeeded = false`. If seeded RFQs have `isPublic = true` and status `OPEN` or `ACTIVE`, they appear in the supplier feed.

**Action required:** Confirm whether any seeded RFQs are currently `isPublic = true`. If yes, founders should either:
1. Set `isSeeded = true` RFQs to `isPublic = false`, or
2. Add `isSeeded: false` filter to the supplier leads feed.

---

## How to Get Real-Time Counts

```bash
# Full quality breakdown:
GET /api/admin/rfqs?view=quality

# Founder conversion view (includes seededRfqs, realActiveRfqs):
GET /api/admin/analytics?view=founder

# Paginated list — all statuses:
GET /api/admin/rfqs?page=1&limit=50

# Filter by status:
GET /api/admin/rfqs?status=OPEN

# Filter seeded only (workaround — no isSeeded param yet):
# Use paginated list + manual review for now
```

---

## Known Gaps

| Gap | Impact | Fix |
|-----|--------|-----|
| No `isSeeded` filter in `GET /api/supplier/leads` | Seeded RFQs may appear to real suppliers | Add `isSeeded: false` to leads feed `where` clause |
| No `isSeeded` query param in `GET /api/admin/rfqs` | Founders must use `?view=quality` for seeded breakdown | Acceptable for now |
| Date-expired RFQs not auto-swept | `rfqQuality.expired` count grows over time | Cron: `prisma.rFQ.updateMany` where `expiresAt < now` set `status = 'EXPIRED'` — not in this sprint |
| VERIFIED_BUYER vs UNVERIFIED_BUYER not split in founder API | Cannot see which real RFQs have verified vs phone-only buyers | Phase 5 enhancement candidate |
