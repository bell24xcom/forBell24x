# VyaparSethu Meta Asset Ownership Audit
**Project:** VyaparSethu  
**Sprint:** VS-META-RECOVERY-AUDIT-01  
**Date:** 2026-08-27  
**Mode:** Read-only. Evidence only. No account changes.

---

## Purpose

Map every Meta platform asset associated with VyaparSethu / Bell24h / Digitex Studio: what exists, who owns it, and what the business continuity risk is if any single asset or person becomes unavailable.

---

## Entity Context (from codebase)

| Field | Value | Source |
|-------|-------|--------|
| Legal entity | Digitex Studio | `docs/VYAPARSETHU_MASTER_SKILL.md` |
| GSTIN | 27AAAPP9753F2ZF | `docs/VYAPARSETHU_MASTER_SKILL.md` |
| Location | Bhiwandi, Maharashtra | `docs/VYAPARSETHU_MASTER_SKILL.md` |
| Founder | Vishal Pendharkar | `docs/VYAPARSETHU_MASTER_SKILL.md` |
| Primary domain | bell24h.com (active) | `CLAUDE.md` |
| Secondary domain | vyaparsethu.com (in transition) | `CLAUDE.md` |
| Target entity | VyaparSethu Technologies Pvt Ltd (incorporation in progress) | `docs/VYAPARSETHU_MASTER_SKILL.md` |

---

## Meta Asset Inventory Framework

The following asset categories should exist for a B2B marketplace running paid acquisition. Each row shows the asset type, how to locate it, and the continuity risk.

### Asset 1: Facebook Business Manager (BM)

**What it is:** The container for all other Meta assets. One BM can hold multiple ad accounts, pages, pixels, etc.

**How to locate:** `business.facebook.com` → the BM name shown in the top-left dropdown.

**Verification checklist (read-only):**
- [ ] BM name: ___ (record the exact name)
- [ ] BM ID: found at Business Manager → Settings → Business Info → Business Manager ID
- [ ] Created date: visible in Settings → Business Info
- [ ] Business Verification status: Verified / Not started / Pending
- [ ] Creator (personal FB account linked): ___
- [ ] Number of Admins: ___ (Settings → People, filter by Admin)
- [ ] Domain verified: ___ (Settings → Brand Safety → Domains)

**Expected state:** BM likely created under Vishal's personal Facebook account. Business Verification likely Not Started or Pending — GSTIN 27AAAPP9753F2ZF is on file and is sufficient for Indian BV.

**Continuity risk:** If Vishal's personal account becomes unavailable and there is no second Admin, the BM becomes inaccessible. All assets inside it are locked.

---

### Asset 2: Ad Account(s)

**What it is:** The account used to run advertising campaigns and hold the Jan 13, 2024 restriction.

**How to locate:** Business Manager → Accounts → Ad Accounts

**Verification checklist (read-only):**
- [ ] Ad account name(s): ___
- [ ] Ad account ID(s): 15-16 digit number, format `act_XXXXXXXXXXXXXXXX`
- [ ] Status: Active / Disabled / Restricted
- [ ] Restriction date: confirm Jan 13, 2024 visible in Account Quality
- [ ] Currency: INR (Indian accounts should bill in INR)
- [ ] Payment method: ___
- [ ] Spend lifetime: ₹___
- [ ] People with access: ___ (check if Vishal is the only one)

**Note on the Jan 13, 2024 restriction:**
The ad account ID is critical for any future support conversation. Record it from Account Quality — it is the anchor reference Meta's support team will ask for.

**Continuity risk:** Ad account is attached to BM. If BM is inaccessible, ad account cannot be managed. If ad account is the only one in the BM, there is no fallback.

---

### Asset 3: Facebook Page

**What it is:** The public Facebook Page representing VyaparSethu / Bell24h.

**How to locate:** business.facebook.com → Accounts → Pages, OR search Facebook for "Bell24h" or "VyaparSethu"

**Verification checklist (read-only):**
- [ ] Page name: ___
- [ ] Page ID: visible in Page → About → Page transparency, or Page Settings → Page Info
- [ ] Status: Active / Restricted / Unpublished
- [ ] Page Admins: ___ (Page Settings → Page Roles)
- [ ] Page Quality status: `facebook.com/[page-name]/page_quality` — check for any content violations
- [ ] Connected to BM: yes/no

**Note:** If the Page has a policy strike, it can restrict the ad account even if the ad account itself has no separate violation. Check Page Quality as a separate surface.

**Continuity risk:** If only Vishal has Admin role on the Page, losing his account = losing Page Admin access. Meta can restore Page access to verified business owners but the process is slower than BM recovery.

---

### Asset 4: Instagram Account

**What it is:** Instagram business profile linked to the Facebook Page.

**How to locate:** Business Manager → Accounts → Instagram Accounts, OR check if bell24h / vyaparsethu Instagram exists

**Verification checklist (read-only):**
- [ ] Instagram username: ___
- [ ] Connected to Page: yes/no
- [ ] Connected to BM: yes/no (adds managed access vs. direct account login)
- [ ] Account status: Active / Restricted

**Continuity risk:** If Instagram is managed directly (not via BM), it is tied to a login email/phone — separate from the BM single point of failure. If connected via BM, same risk as above.

---

### Asset 5: Meta Pixel(s)

**What it is:** JavaScript snippet + server-side event tracking for website conversions. Required for retargeting and lookalike audiences.

**How to locate:** Business Manager → Data Sources → Pixels

**Verification checklist (read-only):**
- [ ] Pixel name: ___
- [ ] Pixel ID: 15-16 digit number
- [ ] Status: Active / No recent activity
- [ ] Connected domains: bell24h.com, vyaparsethu.com
- [ ] Events received (last 30 days): ___
- [ ] Server-side events connected (Conversions API): yes/no

**Why this matters for restriction:**
If the Pixel was tracking on a site that Meta's system flagged for low-quality landing pages at the time of the Jan 13 restriction, the Pixel itself may be associated with the policy violation. Check for any Pixel-level flags in Data Sources.

**Continuity risk:** Pixels are BM assets. They are not lost if a specific ad account is restricted — but if BM becomes inaccessible, no new campaigns can use the Pixel. Pixel historical data is not permanently deleted.

---

### Asset 6: Custom Audiences

**What it is:** Audience lists built from website visitors (Pixel), customer lists (email/phone upload), or engagement (video views, Page followers).

**How to locate:** Business Manager → Audiences (in the Ads Manager dropdown)

**Verification checklist (read-only):**
- [ ] Number of active audiences: ___
- [ ] Largest audience size: ___
- [ ] Customer list uploaded (email/phone): yes/no
- [ ] Website custom audience (Pixel-based): yes/no
- [ ] Lookalike audiences built: yes/no

**Continuity risk:** Custom audiences exist inside the ad account. If the ad account is disabled, the audiences cannot be used in new campaigns but the data is not deleted (retained for 180 days per Meta policy, then auto-deleted if unused). If the account is restored, audiences should still be accessible.

---

### Asset 7: Product Catalog

**What it is:** A structured feed of products/services for dynamic ads. Relevant for marketplace use cases.

**How to locate:** Business Manager → Catalog Manager

**Verification checklist (read-only):**
- [ ] Catalog exists: yes/no
- [ ] Catalog name: ___
- [ ] Products/items count: ___
- [ ] Feed URL connected: ___

**For VyaparSethu:** A catalog may not yet exist given the current stage (pre-100 suppliers). If not set up, note as future asset.

---

### Asset 8: Domain Verification

**What it is:** Proves to Meta that the BM owns the domains used in ads. Required since iOS 14.5 (May 2021) for conversion tracking.

**How to locate:** Business Manager → Brand Safety → Domains

**Verification checklist (read-only):**
- [ ] bell24h.com verified: yes/no
- [ ] vyaparsethu.com verified: yes/no
- [ ] Verification method: DNS TXT record / HTML tag / Meta tag

**Why critical:** Without domain verification, any campaign using bell24h.com or vyaparsethu.com as the landing page destination runs under restricted conversion tracking rules. If the Jan 13 restriction involved landing page quality issues, unverified domains may have been a contributing factor.

---

## Asset Ownership Summary Table

Fill in after founder reads each surface:

| Asset | Name | ID | Owner account | BM connected | Status | Continuity risk |
|-------|------|----|--------------|-------------|--------|------------------|
| Business Manager | ___ | ___ | Vishal (personal FB) | — | ___ | HIGH if single admin |
| Ad Account | ___ | act___ | Via BM | Yes | Restricted (Jan 13, 2024) | HIGH |
| Facebook Page | ___ | ___ | Via BM + Page roles | Yes | ___ | HIGH if single admin |
| Instagram | ___ | ___ | Via BM | Yes | ___ | MEDIUM |
| Pixel | ___ | ___ | Via BM | Yes | ___ | MEDIUM |
| Custom Audiences | — | — | Via Ad Account | Yes | ___ | LOW (180-day retention) |
| Product Catalog | ___ | ___ | Via BM | Yes | ___ | LOW (not yet set up) |
| bell24h.com domain | bell24h.com | — | DNS control | No | ___ | LOW (DNS separate) |
| vyaparsethu.com domain | vyaparsethu.com | — | DNS control | No | ___ | LOW (DNS separate) |

---

## Critical Findings (Pre-verified from codebase)

### Finding 1: Entity transition in progress
The legal entity is currently Digitex Studio (GSTIN 27AAAPP9753F2ZF). VyaparSethu Technologies Pvt Ltd incorporation is in progress. Meta Business Verification, if completed, should be done under Digitex Studio now. After incorporation, the BV may need to be re-done under the new entity — or a new BM created. This is a future risk, not an immediate one.

### Finding 2: Domain transition
bell24h.com is primary; vyaparsethu.com is secondary. Both domains likely need verification in the BM. During the domain transition, any Pixel or conversion tracking set up on bell24h.com will need to be moved to vyaparsethu.com. This is a separate action from restriction recovery.

### Finding 3: Jan 13, 2024 restriction age
As of August 27, 2026: the restriction is **31 months old**. Meta's standard appeal window for most policy violations is 180 days. The "Request Review" button may no longer be present, meaning the standard appeal path via Account Quality is closed. The remaining paths are:
1. Business Support escalation (requires Business Verification)
2. Creating a new ad account under the same BM (if BM itself is not disabled — new accounts inherit BM health, not the specific disabled account's history)
3. Creating a new Business Manager (fresh start — loses audiences, Pixel history)

**Note on new ad account within same BM:** Meta may flag new accounts created in a BM with a disabled account. This is a moderation risk, not a guaranteed block.

### Finding 4: Single point of failure
No evidence in the codebase of a second employee or admin added to any Meta asset. High probability of single-admin BM. This is the highest continuity risk.

---

## What Cannot Be Determined Without Direct Access

| Unknown | Where to find it |
|---------|------------------|
| Exact restriction type (policy citation) | Account Quality → ad account detail |
| Whether "Request Review" button is present | Account Quality → ad account detail |
| BM Business Verification status | BM Settings → Business Info |
| Number of BM Admins | BM Settings → People |
| Pixel activity status | BM → Data Sources → Pixels |
| Domain verification status | BM → Brand Safety → Domains |
| Whether prior appeals were submitted | Account Quality → review history |
| Current payment method status | Ad Account → Billing |

---

## Notes

- **No changes made.** This audit is read-only documentation only.
- All asset descriptions reflect Meta Business Suite / Meta Business Manager as of August 2026.
- The Instagram, Pixel, Catalog, and Audience sections are framework items — confirm existence before recording as active assets.
