# First 10 Supplier Dashboard — Fix Report
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-02  
**Phase:** 6  
**Date:** 2026-08-27  
**File created:** `src/app/api/admin/first10/route.ts`

---

## What Was Built

`GET /api/admin/first10` — founder-facing dashboard view of the onboarding cohort.

Returns the earliest-registered SUPPLIER accounts (default 10, configurable via `?limit=N`) with per-row tracking and a summary.

---

## Endpoint

```
GET /api/admin/first10
Authorization: Bearer $ADMIN_TOKEN
```

Optional: `?limit=10` (default), `?limit=20` for expanded view.

---

## Response Shape

```json
{
  "success": true,
  "generatedAt": "2026-08-27T05:30:00.000Z",
  "summary": {
    "total": 7,
    "profileComplete": 5,
    "documentsSubmitted": 3,
    "pendingReview": 2,
    "verified": 1,
    "rejected": 0,
    "withCredits": 7,
    "quotedAtLeastOnce": 2
  },
  "suppliers": [
    {
      "id": "...",
      "name": "Ishwar",
      "phone": "9876543210",
      "company": "Sunrise Textiles",
      "location": "Surat, Gujarat",
      "registeredAt": "2026-08-27T04:00:00.000Z",
      "lastActiveAt": "2026-08-27T05:00:00.000Z",
      "profileComplete": true,
      "hasGstOrUdyam": true,
      "gstNumber": "24XXXXXX",
      "udyamNumber": null,
      "verificationStatus": "GST_PENDING",
      "trustScore": 55,
      "credits": 3,
      "creditsSpent": 0,
      "rfqsPosted": 0,
      "quotesSubmitted": 1,
      "steps": {
        "registered": true,
        "profileComplete": true,
        "documentsSubmitted": true,
        "verified": false,
        "hasCredits": true,
        "quotedAtLeastOnce": true
      }
    }
  ]
}
```

---

## Columns Tracked

| Column | Source |
|--------|--------|
| Name | `users.name` |
| Phone | `users.phone` |
| Company | `users.company` |
| Location | `users.location` |
| Registered at | `users.created_at` |
| Last active | `users.last_login_at` |
| Profile complete | `company + location + categories` all set |
| Documents submitted | `gstNumber OR udyamNumber` present |
| Verification status | `users.verification_status` |
| Trust score | `users.trust_score` |
| Credits (balance) | `user_credits.credits` |
| Credits spent | `user_credits.spent` |
| RFQs posted | `count(rfqs WHERE created_by=userId)` |
| Quotes submitted | `count(quotes WHERE supplier_id=userId)` |

---

## Completion Checklist (per supplier)

| Step | Condition |
|------|-----------|
| ✅ Registered | always true if in result |
| ✅ Profile complete | company + location + ≥1 category set |
| ✅ Documents submitted | gstNumber or udyamNumber non-empty |
| ✅ Verified | verificationStatus = GST_VERIFIED or MANUAL_VERIFIED |
| ✅ Has credits | credit balance > 0 |
| ✅ Quoted at least once | quote count > 0 |

---

## Usage from Founder's Terminal

```bash
# View first 10 suppliers
curl https://vyaparsethu.com/api/admin/first10 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# View first 20
curl "https://vyaparsethu.com/api/admin/first10?limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.summary'

# Watch who still needs verification
curl https://vyaparsethu.com/api/admin/first10 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.suppliers[] | {name, verificationStatus, steps}'
```

---

## Tracking Manual Spreadsheet (Now Automated)

The tracker from `first10_supplier_readiness.md`:

```
# | Supplier | Phone | OTP Verified | Profile Done | isVerified Set | Credits Granted | Quote Submitted
```

Is now available in real-time via this endpoint. No spreadsheet needed.

---

## Sprint Complete

All 6 phases of VS-SPRINT-SUPPLIER-CONVERSION-02 are complete:

| Phase | Task | Status |
|-------|------|--------|
| 1 | Fix `/api/leads/unlock` (wrong table) | ✅ Done |
| 2 | Starter credits on OTP registration | ✅ Done |
| 3 | Admin credit management endpoint | ✅ Done |
| 4 | `verificationStatus` enum (separate phone vs GST) | ✅ Done |
| 5 | GST verification workflow (no paid API) | ✅ Done |
| 6 | First 10 supplier dashboard | ✅ Done |

A real supplier can now:
1. Register via OTP → receive 3 credits automatically
2. Complete profile → verificationStatus advances to GST_PENDING
3. Browse RFQ feed → see all requirement details
4. Unlock buyer name → spend 1 credit (now works)
5. Submit a quotation → free, no credits needed

Founder can now:
- View all first 10 suppliers with progress: `GET /api/admin/first10`
- Review pending GST verification: `GET /api/admin/users?verificationStatus=GST_PENDING`
- Mark supplier verified: `POST /api/admin/users` with `review-gst-verification`
- Grant/adjust credits: `POST /api/admin/credits`

No SQL access required for any of these operations.
