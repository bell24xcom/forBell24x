# First 10 Supplier Tracking
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-FIRST-TRANSACTION-01 — Phase 6  
**Date:** 2026-08-27  
**Purpose:** Founder-managed tracking structure for the first 10 real suppliers. No automation — human-reviewed weekly.

---

## Why Track Manually

Automated funnels are useful at scale (100+ suppliers). For the first 10, the founder needs direct accountability per person: who is stuck, what did they try, what did I tell them last. A dashboard aggregate cannot surface "Ravi hasn't logged in since we spoke 3 days ago."

---

## Tracking Table (Update Weekly)

| # | Name | Phone | Registered | Profile % | GST Status | RFQs Viewed | Quotes Sent | First Quote Date | Response from Buyer | Status | Notes |
|---|------|-------|-----------|-----------|------------|-------------|-------------|-----------------|--------------------|----|-------|
| 1 | — | — | — | — | — | — | — | — | — | PROSPECT | |
| 2 | — | — | — | — | — | — | — | — | — | PROSPECT | |
| 3 | — | — | — | — | — | — | — | — | — | PROSPECT | |
| 4 | — | — | — | — | — | — | — | — | — | PROSPECT | |
| 5 | — | — | — | — | — | — | — | — | — | PROSPECT | |
| 6 | — | — | — | — | — | — | — | — | — | PROSPECT | |
| 7 | — | — | — | — | — | — | — | — | — | PROSPECT | |
| 8 | — | — | — | — | — | — | — | — | — | PROSPECT | |
| 9 | — | — | — | — | — | — | — | — | — | PROSPECT | |
| 10 | — | — | — | — | — | — | — | — | — | PROSPECT | |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| PROSPECT | Not yet registered |
| REGISTERED | Completed OTP registration |
| ONBOARDING | Profile partially filled, not yet submitted GST |
| PENDING_REVIEW | GST/Udyam submitted, awaiting founder review |
| VERIFIED | `verificationStatus = GST_VERIFIED or MANUAL_VERIFIED` |
| ACTIVE | Has submitted at least 1 quote |
| WON | At least 1 deal accepted and payment initiated |
| CHURNED | Was registered but not active after 14 days |

---

## How to Get Per-Supplier Data

### Profile + verification status:
```bash
GET /api/admin/users?role=SUPPLIER&page=1&limit=20
```
Returns: `id, name, phone, email, company, verificationStatus, isActive, trustScore, createdAt`

### Quote activity for a specific supplier:
```bash
GET /api/admin/users?userId=<supplierId>
# or check quotes table via admin RFQ view
```

### Credit balance:
```bash
GET /api/admin/credits?userId=<supplierId>
```

### Full conversion picture:
```bash
GET /api/admin/analytics?view=founder
```
Returns aggregate counts for all 6 success criteria.

---

## Weekly Review Checklist (Founder)

Run every Monday:

1. Open `GET /api/admin/analytics?view=founder` — note `conversionBlockers[]`
2. For each supplier in the table above:
   - Check `verificationStatus` — is anyone stuck in `GST_PENDING` for > 3 days? Call them.
   - Check `suppliersWhoQuoted` count — did anyone new quote this week?
   - Check `quotesSubmitted` total — is it growing?
3. For any supplier with 0 quotes after 7 days since registration: personal follow-up call.
4. If `suppliersWith0Credits > 0`: grant credits via `POST /api/admin/credits`.
5. If `realActiveRfqs = 0`: post a real requirement from the buyer account before next supplier contact.

---

## Conversion Milestones

| Milestone | Target |
|-----------|--------|
| 10 suppliers registered | Week 1–2 |
| 10 suppliers have complete profiles | Week 2–3 |
| 5 suppliers have submitted quotes | Week 2–3 |
| 1 supplier has a deal accepted | Week 3–4 |
| 1 supplier receives payment | Week 4–5 |

---

## Off-Platform Contact Log

For suppliers you contacted directly (phone/WhatsApp) to get them onboarded:

| Date | Supplier | Contact Method | What was discussed | Action taken |
|------|----------|---------------|-------------------|--------------|
| — | — | — | — | — |

---

## Concierge Quote Log

When founder sources a quote off-platform on a supplier's behalf (e.g. called them, they gave a price, founder enters it):

```bash
POST /api/admin/rfqs
{
  "action": "submit-concierge-quote",
  "rfqId": "<rfq-id>",
  "supplierId": "<supplier-user-id>",
  "price": 15000,
  "quantity": "500 units",
  "sourcingNote": "Phone call 2026-08-27 with Ravi Sharma, +9198xxxxxxxx, Sunrise Textiles — confirmed price of ₹15,000 for 500 units cotton fabric"
}
```

`sourcingNote` is mandatory and stored as audit trail. These quotes are tagged `CONCIERGE_SOURCED` and excluded from organic engagement counts.

---

## What Success Looks Like at 10 Suppliers

- `suppliersRegistered` ≥ 10
- `profilesCompleted` ≥ 8 (80% profile completion)
- `verifiedSuppliers` ≥ 5
- `suppliersWhoQuoted` ≥ 5
- `quotesSubmitted` ≥ 20 (avg 4 quotes per active supplier)
- `realActiveRfqs` ≥ 3
- At least 1 deal accepted → first transaction complete
