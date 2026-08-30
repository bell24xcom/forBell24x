# GST Verification Workflow — Fix Report
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-02  
**Phase:** 5  
**Date:** 2026-08-27  
**Files changed:**
- `src/app/api/supplier/onboarding/route.ts`
- `src/app/api/admin/users/route.ts`

---

## Problem

The GST verification workflow was a stub:
- `POST /api/supplier/gst` logged to console and returned fake "pending" status
- No DB write
- No state transition
- No admin review capability

---

## Fix Applied (No Paid GST API Required)

The workflow is manual-first, consistent with the "first 10 suppliers" program:

### Stage 1: Supplier Submits GST/Udyam (Onboarding)

When a supplier completes their profile via `POST /api/supplier/onboarding` with a `gstNumber` or `udyamNumber`, the route now:

1. Checks current `verificationStatus` — only advances if currently `PHONE_VERIFIED`
2. Updates to `GST_PENDING` (does not overwrite `GST_VERIFIED`, `MANUAL_VERIFIED`, or `REJECTED`)
3. Returns `pendingVerification: true` in the response so the UI can show "Document review pending"

```typescript
if (current?.verificationStatus === 'PHONE_VERIFIED') {
  verificationStatusUpdate.verificationStatus = 'GST_PENDING';
}
```

**No external GST API call.** The founder reviews the submitted number manually.

### Stage 2: Admin Reviews (Founder Marks Decision)

New POST action: `review-gst-verification`

```bash
POST /api/admin/users
Authorization: Bearer $ADMIN_TOKEN
Content-Type: application/json

{
  "action": "review-gst-verification",
  "userId": "<supplierId>",
  "status": "GST_VERIFIED",
  "note": "GST 29XXXXXX verified via govt portal"
}
```

Valid `status` values:
- `GST_VERIFIED` — founder confirmed GST number via [GST portal](https://services.gst.gov.in/services/searchtp)
- `MANUAL_VERIFIED` — founder verified via Udyam portal or in-person (no GST)
- `REJECTED` — document invalid or mismatched

Response:
```json
{
  "success": true,
  "action": "review-gst-verification",
  "userId": "...",
  "verificationStatus": "GST_VERIFIED",
  "note": "GST 29XXXXXX verified via govt portal"
}
```

### Stage 3: Admin Review Queue

The existing `GET /api/admin/users` now supports `verificationStatus` filter:

```bash
GET /api/admin/users?verificationStatus=GST_PENDING&role=SUPPLIER
Authorization: Bearer $ADMIN_TOKEN
```

Returns all suppliers awaiting verification. Each row includes: `name`, `phone`, `company`, `gstNumber`, `udyamNumber`, `verificationStatus`.

---

## State Machine

```
Registration OTP
      ↓
 PHONE_VERIFIED (default)
      ↓  (submit GST/Udyam via onboarding)
  GST_PENDING
      ↓                      ↓               ↓
GST_VERIFIED          MANUAL_VERIFIED      REJECTED
                                              ↓  (resubmit)
                                          GST_PENDING
```

Transitions not shown (no automated trigger yet):
- `PHONE_VERIFIED → MANUAL_VERIFIED` via `review-gst-verification` with `status: MANUAL_VERIFIED` (for suppliers without GST)

---

## How the Founder Verifies GST Manually

1. Open [GST search](https://services.gst.gov.in/services/searchtp) in browser
2. Enter the supplier's GSTIN from the admin users list
3. Confirm: name matches, status is Active, HSN category is reasonable
4. Call `review-gst-verification` with `status: GST_VERIFIED`

For Udyam: open [Udyam portal](https://udyamregistration.gov.in/UdyamSearch) and verify the registration number.

---

## What the `/api/supplier/gst` Stub Does Now

The separate `src/app/api/supplier/gst/route.ts` is still a stub. The GST submission now flows through the onboarding route (`/api/supplier/onboarding`), which is the actual code path used by the frontend. The `/api/supplier/gst` route can be deprecated.

---

## Remaining Gaps

- `/api/supplier/gst` stub not yet removed (tech debt, not urgent)
- No automated email to founder when a supplier enters `GST_PENDING`
- No in-app notification to supplier when status advances to `GST_VERIFIED`

These can be added when Brevo drip engine is extended (separate sprint).
