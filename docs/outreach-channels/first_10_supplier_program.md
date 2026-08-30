# First 10 Verified Supplier Program
**Project:** VyaparSethu  
**Date:** 2026-08-26  
**Owner:** Founder (digitex.studio@gmail.com)  
**Goal:** 10 verified, RFQ-participating suppliers before any intelligence feature activates (Phase D gate)

---

## Why This Milestone Matters

The platform's intelligence layer (`FLAGS.INTELLIGENCE_ENABLED`) and SHAP features are gated behind **100 verified suppliers**. The first 10 represent the proof-of-concept cohort that validates:
- The claim flow works end-to-end
- Suppliers can discover and quote on real RFQs
- Protected Payment is understood and trusted
- Word-of-mouth referrals are possible (each of the 10 can refer 5)

---

## Definition of "Verified" for This Program

A supplier counts toward the 10 when **all three** are true:
1. `user.isClaimed = true` (phone OTP verified)
2. `user.isVerified = true` (GST check passed OR Udyam verified by admin)
3. At least one quote submitted on a real (non-seeded) RFQ

---

## Tracker

Copy this table into your working notes. Update after each supplier interaction.

| # | Supplier Name | Company | Industry | Location | Onboarding Status | Verification | RFQ Participation | Referral Source | Notes |
|---|---------------|---------|----------|----------|-------------------|--------------|-------------------|-----------------|-------|
| 1 | Ishwar | — | — | — | Warm lead (WhatsApp active) | Pending | None yet | Direct outreach | Send clarification message. Add personal onboarding offer. |
| 2–10 | — | — | — | — | Not started | — | — | — | To be sourced |

---

## Sourcing Strategy (No Meta Cloud API)

### Priority 1 — Kalamboli Steel Cluster
- Category: Steel & Metals
- Cluster page: `/industrial-cluster/kalamboli-steel`
- Outreach: wa.me personal (founder sends), email invitation if available
- Target: 3 suppliers from this cluster

### Priority 2 — Bhiwandi Packaging Cluster
- Category: Eco-Packaging / Corrugated
- Cluster page: `/industrial-cluster/bhiwandi-packaging`
- Outreach: wa.me personal
- Target: 2 suppliers

### Priority 3 — Surat or Tirupur Textiles
- Category: Textiles / Fabric
- Outreach: wa.me personal
- Target: 2 suppliers

### Priority 4 — Founder's network / referrals
- Category: Any
- Target: 3 suppliers (referral from existing contacts)

---

## Onboarding Playbook (Per Supplier)

### Step 1 — First contact (Day 0)
**Channel:** wa.me personal message from founder's phone  
**Message template:**
```
Namaste {ownerFirst} ji 🙏

Maine VyaparSethu pe {companyName} ka ek verified supplier profile banaya hai.
Buyers aapke category mein actively requirements post kar rahe hain.

Aap 2 minute mein apna free profile claim kar sakte hain:
{claimLink}

Claim karne ke baad main personally aapke profile ko set up karne mein help karunga
taaki aap future RFQ matching mein properly position ho sakein.

— {founderName}
VyaparSethu
```

### Step 2 — Profile claim (Supplier action)
- Supplier opens `/claim/{token}`
- Verifies phone via OTP (MSG91)
- `user.isClaimed` → true

### Step 3 — Founder follow-up (within 1 hour of claim)
- Call or WhatsApp: "I see you've claimed. Let me walk you through the profile."
- Help supplier fill: company, categories, products, GST number
- Screenshot the completed profile and send back to supplier

### Step 4 — GST verification
- Supplier enters GST number in supplier profile form
- `POST /api/supplier/gst` validates automatically
- `user.isVerified` → true
- If no GST: request Udyam certificate → admin marks `isVerified: true` manually

### Step 5 — First RFQ match
- Founder creates a real test RFQ in the relevant category (use a buyer account)
- Supplier appears in the match feed
- Founder walks supplier through quote submission
- Quote submitted → `user` has RFQ participation = ✅

### Step 6 — Credit grant (unlock 3 leads)
After claim, manually grant 3 free credits (until self-serve credit purchase is live):
```sql
-- Run in Neon console or via admin panel when credit-grant route exists
INSERT INTO "UserCredits" ("userId", "credits", "spent")
VALUES ('{supplierId}', 3, 0)
ON CONFLICT ("userId") DO UPDATE SET "credits" = "UserCredits"."credits" + 3;
```

---

## Communication Cadence Per Supplier

| Day | Action | Channel | Owner |
|-----|--------|---------|-------|
| 0 | First outreach message | wa.me personal | Founder |
| 0–1 | Claim link sent | wa.me / email | Automated (claim token) |
| 1 | Profile completion assist | Call / WhatsApp | Founder |
| 1–2 | GST verification | Dashboard | Supplier + Founder assist |
| 2–3 | First RFQ match, quote walkthrough | Call | Founder |
| 7 | Drip if unclaimed | wa.me (automated) | Drip engine |
| 14 | Final drip | wa.me (automated) | Drip engine |
| 30 | Monthly check-in | WhatsApp | Founder |

---

## Trust-Building Commitments to Each Supplier

Tell every supplier explicitly:
1. **Verified Matching** — "We only show your profile to verified buyers, not random enquiries."
2. **Protected Payment** — "Your payment is secured before goods leave your warehouse. Zero bad debt risk."
3. **Faster Trade** — "Quotation in 24h, Order in 48h, Settlement in 7 days — that's our commitment to buyers."
4. **Free during founding cohort** — "You are one of our first 10 verified suppliers. Your profile and leads are free. You only pay for credits to unlock buyer contact after a deal is confirmed."

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Claimed suppliers | 10 | `SELECT count(*) FROM "User" WHERE role='SUPPLIER' AND "isClaimed"=true` |
| Verified suppliers | 10 | `... AND "isVerified"=true` |
| Suppliers with ≥1 quote | 5 | `SELECT count(DISTINCT "supplierId") FROM "Quote"` |
| Deals closed | 1 | `SELECT count(*) FROM "Deal"` |
| Outreach → claim conversion | ≥15% | `getOutreachSummary()` via admin panel |
| Days to first 10 verified | ≤30 days | Manual tracking |

---

## Answering the 5 Success Questions

**1. Why should a supplier join VyaparSethu?**  
Verified buyers post real requirements (Quotations). Protected Payment means no bad debt. Free profile, free quotes during founding cohort. Founder personally assists with onboarding and profile positioning.

**2. How many verified suppliers exist?**  
Query: `SELECT count(*) FROM "User" WHERE role='SUPPLIER' AND "isVerified"=true`  
Do not publish this number publicly until ≥50. Per homepage policy: "Launching Soon — Reserve your category."

**3. How many real RFQs exist?**  
Query: `SELECT count(*) FROM "RFQ" WHERE "isSeeded"=false AND "isPublic"=true AND status IN ('OPEN','ACTIVE')`  
Only show real (non-seeded) RFQs in supplier-facing views.

**4. How does RFQ → Quote flow actually work?**  
Supplier sees open RFQs in dashboard → clicks View → submits quote (price, delivery days, terms) → buyer gets email → buyer accepts → deal created → Razorpay Protected Payment initiated → supplier ships → payment released.

**5. What communication channels work today without Meta Cloud API?**  
(1) wa.me personal outreach — operator-click, no Cloud API dependency  
(2) Email (Brevo SMTP) — automated claim invitations and transactional emails  
(3) In-app dashboard notifications — supplier must be logged in  
(4) MSG91 OTP SMS — auth flow only; promotional SMS after DLT registration  
(5) Bolna voice — if API key active, warm-lead follow-up only
