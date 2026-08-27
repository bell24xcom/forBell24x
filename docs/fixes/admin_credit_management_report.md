# Admin Credit Management — Fix Report
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-02  
**Phase:** 3  
**Date:** 2026-08-27  
**File created:** `src/app/api/admin/credits/route.ts`

---

## Problem

There was no admin endpoint to view or manage supplier credit balances. The only way to grant credits was via raw SQL in the Neon console:

```sql
INSERT INTO "user_credits" ("id", "user_id", "credits", "spent", "created_at", "updated_at")
VALUES (gen_random_uuid()::text, '{supplierId}', 3, 0, now(), now())
ON CONFLICT ("user_id") DO UPDATE
SET "credits" = "user_credits"."credits" + 3, "updated_at" = now();
```

---

## What Was Built

`/api/admin/credits` — requires ADMIN auth (JWT with `role=ADMIN` or `ADMIN_TOKEN` env var).

### GET `/api/admin/credits`

Returns paginated credit balance summary for all users:

```
GET /api/admin/credits?page=1&limit=20
```

Response:
```json
{
  "success": true,
  "data": [
    { "userId": "...", "credits": 3, "spent": 0, "updatedAt": "...", "user": { "name": "...", "company": "...", "phone": "..." } }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 7, "pages": 1 }
}
```

### GET `/api/admin/credits?userId=<id>`

Returns balance + purchase history for one user:

```json
{
  "success": true,
  "user": { "id": "...", "name": "Ishwar", "company": "...", "phone": "..." },
  "credits": { "balance": 3, "spent": 1, "updatedAt": "..." },
  "purchases": [ ... ]
}
```

### POST `/api/admin/credits` — Grant Credits

```json
{
  "action": "grant",
  "userId": "<supplierId>",
  "amount": 3,
  "reason": "Founding cohort — Ishwar onboarding"
}
```

Response:
```json
{ "success": true, "action": "grant", "amountGranted": 3, "newBalance": 6, "reason": "..." }
```

### POST `/api/admin/credits` — Deduct Credits

```json
{
  "action": "deduct",
  "userId": "<supplierId>",
  "amount": 1,
  "reason": "Refund — unlock failed"
}
```

Returns 400 if deduction would take balance below zero.

---

## Auth

Uses `requireAdmin()` from `lib/admin-auth.ts`:
- JWT with `role=ADMIN` (admin browser session), OR
- `Authorization: Bearer {ADMIN_TOKEN}` header (M2M / curl)

---

## Usage from Founder's Terminal

Grant 3 credits to a supplier (using ADMIN_TOKEN):

```bash
curl -X POST https://vyaparsethu.com/api/admin/credits \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"grant","userId":"<supplierId>","amount":3,"reason":"founding cohort"}'
```

Check all balances:

```bash
curl https://vyaparsethu.com/api/admin/credits \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Audit Logging

All grant and deduct operations log to `console.info` with:
- `adminId` (who performed the action)
- `userId` (who was affected)
- `amount`
- `reason`
- `newBalance`

These appear in Vercel function logs for the `/api/admin/credits` route.

---

## What This Replaces

The SQL-only workflow from `first10_supplier_readiness.md` — no more Neon console access needed for credit operations during supplier onboarding.

---

## Remaining Gaps

- `isVerified` conflation unresolved (Phase 4)
- GST verification workflow (Phase 5)
- First 10 dashboard (Phase 6)
