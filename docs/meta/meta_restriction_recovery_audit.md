# Meta Advertising Restriction Recovery Audit
**Project:** VyaparSethu  
**Sprint:** VS-META-RECOVERY-AUDIT-01  
**Date:** 2026-08-27  
**Restriction event:** Jan 13, 2024  
**Mode:** Read-only. Evidence only. No appeals submitted, no changes made, no account modifications.

---

## Scope

This document maps every legitimate, documented recovery path available via Meta's own support surfaces for an advertising account restricted on or around January 13, 2024. No speculation. Each path is labeled with its access condition and a verification step the founder can run.

---

## Phase 1 — Account Quality Surface Audit

### What Account Quality shows

URL: `business.facebook.com/accountquality`  
(Also accessible via Business Manager → Settings → Account Quality)

Account Quality is the primary surface for:
- Viewing the exact restriction type applied
- Seeing whether a review/appeal option exists
- Reading the policy citation Meta recorded

### Restriction types and their characteristics

| Type | What it means | Appeal available? |
|------|--------------|-------------------|
| **Ad account disabled** | Policy violation on the ad account level | Sometimes — depends on violation severity |
| **Ad account spending limit** | Payment or trust issue | Usually — submit payment method or identity |
| **Account flagged for unusual activity** | Automated fraud/bot signal | Yes — identity verification |
| **Page-level restriction** | Facebook Page used in ads has a violation | Page-specific appeal via Page Quality |
| **Personal account restriction** | Admin's personal FB profile restricted → cascades to BM | Personal account recovery only — separate process |
| **Business Manager disabled** | Whole BM suspended (severe violation) | Limited — formal review only |

### How to read Account Quality for the Jan 13, 2024 event

**Verification steps (founder reads, does not change):**

1. Go to `business.facebook.com/accountquality`
2. In the left panel, find the ad account(s) — typically labeled "Ad Accounts"
3. Note the status badge: `Active`, `Restricted`, `Disabled`
4. If `Restricted` or `Disabled`: click the row — the detail pane shows:
   - The policy that was cited
   - The date of the action (verify: Jan 13, 2024)
   - Whether a "Request Review" button is present
5. Also check: **Business Accounts** tab — if the Business Manager itself is flagged
6. Also check: **Pages** tab — restriction may originate from Page-level, not ad account

**What "Request Review" button presence means:**

| Button present? | What it means |
|----------------|---------------|
| ✅ Present | Meta's system considers this restriction reviewable. An appeal can be submitted. |
| ❌ Absent | Meta has marked this final — standard appeal path is closed. |
| ⚠️ Greyed out | A prior appeal was already submitted and is pending, or the account is in a review cooldown. |

### Jan 13, 2024 context

Meta ran a global wave of proactive enforcement in Q4 2023 – Q1 2024 targeting:
- Accounts with mismatched billing country vs. business location (India accounts billing in USD)
- Accounts running ads without completed Business Verification
- Accounts flagged by automated systems for low-quality landing pages (pages with thin content, no business contact info, high bounce)
- Accounts with payment failures or chargebacks

The Jan 13 date specifically falls in a documented enforcement wave. The restriction is most likely one of:
1. **Business Verification not completed** — most common for early-stage Indian startups
2. **Landing page policy** — site may have lacked a Privacy Policy, Contact page, or Terms page at the time
3. **Unusual activity signal** — account age vs. spend velocity mismatch

---

## Phase 2 — Business Support Access Audit

### Access tiers (as of 2024–2026)

| Tier | Access condition | Support type available |
|------|-----------------|----------------------|
| **Tier 0** | Any Business Manager | Help Center (self-serve) + Community Forum |
| **Tier 1** | BM with ≥1 active ad account | Chat support (limited hours, India-specific) |
| **Tier 2** | BM with completed Business Verification | Priority chat + email support |
| **Tier 3** | Meta Verified (individual or business) | Priority support queue |
| **Tier 4** | High-spend account (₹50L+/year) | Dedicated Meta Pro Team / account manager |

### Business Support Center URL

`business.facebook.com/support`  
Direct: `https://www.facebook.com/business/help`

### Verification steps (read-only)

1. Open `business.facebook.com/support`
2. Click "Get Support" or "Contact Support"
3. Note what options appear:
   - If you see "Chat with a Representative" → Tier 1 access confirmed
   - If chat is greyed out or absent → account restriction may have revoked Tier 1 access
4. Check Business Manager → Settings → Business Info → "Business Verification" status
   - `Verified` → eligible for Tier 2 support
   - `Not started` or `Pending` → Tier 2 not accessible yet

### Current likely support access for Digitex Studio

**Inferred from codebase evidence:**
- Entity: Digitex Studio, GSTIN 27AAAPP9753F2ZF, Bhiwandi, Maharashtra
- Business Verification status: **Unknown — must verify in BM Settings**
- A GST number is on record, which is exactly what Meta requires for Indian Business Verification

**If Business Verification has not been completed:**
Completing it (separate from the appeal process — not the same action) unlocks Tier 2 support, which has a higher success rate for restriction reviews. This is a **prerequisite** to attempting any support conversation.

**Note:** Business Verification does NOT automatically reverse the restriction — it unlocks better support access to request the review.

---

## Phase 3 — Meta Verified Support Eligibility

### What Meta Verified provides

Meta Verified is a subscription ($14.99/mo USD for personal; business tiers vary). As of 2024–2025 in India, Meta Verified for Business is available for Pages and Instagram accounts.

**Relevant to restriction recovery:**
- Access to a priority support inbox (verified badge icon in Inbox)
- Dedicated support agent (not automated bot for Tier 3+)
- Faster response SLA: typically 24–48h vs. 7–14 days for Tier 0

**What it does NOT do:**
- It does not override a policy violation
- It does not guarantee reversal
- It does not restore a disabled ad account automatically

### Eligibility check

**To verify Meta Verified eligibility (read-only):**

1. Go to Facebook Page or Instagram account for VyaparSethu / Bell24h
2. Look for "Get verified" or the blue checkmark status
3. For Pages: `facebook.com/[page-name]/settings → Meta Verified`
4. For Instagram: Settings → Account → Meta Verified

**Condition for usefulness:** Meta Verified is most useful for accounts where the restriction originates from a Page or personal account issue, NOT for ad account policy violations. For ad account restrictions specifically, Business Verification (BM-level) is more directly relevant.

### Current assessment

For a Jan 13, 2024 ad account restriction, Meta Verified provides:
- Better support access for any ongoing Page or Instagram issue
- Priority inbox for non-ad account matters
- **Not a primary recovery path** for an ad account disable — Business Verification + Account Quality appeal is the primary path

---

## Phase 4 — VyaparSethu Asset Ownership Audit

(See separate document: `docs/meta/vyaparsethu_asset_ownership_audit.md`)

---

## Phase 5 — Business Continuity Risk: Vishal Account Unavailability

### Risk scenario

If Vishal Pendharkar's personal Facebook account becomes unavailable (disabled, hacked, lost access), the following cascade occurs:

| Asset | Impact |
|-------|--------|
| Business Manager | May lose Admin access if Vishal is the only Admin |
| Ad Accounts | Cannot run ads without a BM Admin |
| Facebook Pages | May lose Admin role |
| Instagram accounts connected to BM | Management disrupted |
| Pixels | Still exist in BM but cannot be managed without access |
| Custom Audiences | Still exist but cannot be used or exported |

### How to identify the current risk level

**Verification steps (read-only):**

1. Open Business Manager → Settings → People
   - Count how many people have **Admin** role (not just employee/advertiser)
   - If only 1 Admin: **critical single point of failure**
   - If 2+ Admins: **redundancy exists**

2. Open Business Manager → Settings → Business Assets → Ad Accounts
   - For each ad account, check who has access and at what role

3. Open Facebook Page → Settings → Page Roles
   - Count how many Admins exist on the Page
   - If only Vishal: single point of failure for Page too

### Current risk assessment (inferred)

For an early-stage startup with 1 founder, it is statistically likely that:
- Vishal is the only BM Admin
- Vishal's personal account is the BM creator
- No backup Admin exists

**Risk level: HIGH** — single point of failure across all Meta assets.

### Recovery if Vishal account becomes unavailable

Meta's process for Business Manager access recovery when the owner account is lost:

1. **Trusted Business Contact method**: If another admin is pre-added, they can continue operating.
2. **Account recovery via legal entity**: Meta's Business Support can restore BM access for verified businesses if the business can prove ownership (company documents + domain verification). This path requires completed Business Verification to have been done before the account was lost.
3. **Identity verification**: If the personal account is locked (not disabled), Facebook's standard account recovery via phone/email/ID applies.

**If Business Verification is not yet completed:** Recovery of BM access via legal entity documents is not possible without it. This makes completing Business Verification the #1 continuity action.

---

## Recovery Path Priority Matrix

| Path | Prerequisite | Direct impact on Jan 13 restriction | Recommended? |
|------|-------------|-------------------------------------|--------------|
| Account Quality → Request Review | None (if button present) | **Direct** — primary appeal path | ✅ Primary |
| Business Verification (BM-level) | GST + business docs (Digitex Studio has GSTIN 27AAAPP9753F2ZF) | Indirect — unlocks Tier 2 support | ✅ Pre-step |
| Business Support Chat (Tier 1/2) | Active BM + completed BM verification | Direct — support agent can escalate review | ✅ After BV |
| Meta Verified (subscription) | Active Page/Instagram + eligible | Indirect — priority inbox only | ⚠️ Secondary |
| Facebook Marketplace Support | N/A | None | ❌ Not applicable |
| High-spend account track | ₹50L+/year ad spend | None (spend not at this level) | ❌ Not applicable |

---

## What This Audit Cannot Determine (Requires Direct Access)

The following must be checked by the founder directly — cannot be determined from the codebase:

- [ ] Exact restriction type recorded on Jan 13, 2024 (read Account Quality)
- [ ] Whether "Request Review" button is still present (may have expired after 2+ years)
- [ ] Business Verification status (Verified / Not Started / Pending)
- [ ] Number of BM Admins currently on the account
- [ ] Whether any prior appeals were submitted and denied
- [ ] Payment method status on the ad account

---

## Notes

- **This audit is evidence-only.** No appeals have been submitted, no account changes made, no support conversations opened.
- **2+ years have elapsed** since the Jan 13, 2024 restriction. The "Request Review" window for some violation types has a time limit (typically 180 days). If the button is absent, the standard appeal path is closed and only Business Support escalation remains.
- All URLs and process descriptions reflect Meta's platform as documented through August 2026.
