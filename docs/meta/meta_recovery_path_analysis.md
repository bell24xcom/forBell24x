# Meta Recovery Path Analysis
**Project:** VyaparSethu  
**Sprint:** VS-META-RECOVERY-02  
**Date:** 2026-08-27  
**Restriction event:** January 13, 2024  
**Mode:** Read-only synthesis. No appeals submitted. No account changes. No Meta settings modified.

---

## Executive Summary

The Meta ad account restricted on January 13, 2024 is **31 months old** at the time of this analysis. The standard 180-day appeal window via Account Quality has almost certainly expired. The primary self-serve recovery path (Request Review button) is likely unavailable.

**The viable recovery path is:** Complete Meta Business Verification under Digitex Studio (GSTIN 27AAAPP9753F2ZF), then escalate through Business Support (Tier 2 chat). This is not a guarantee of reversal — it is the only documented path that remains open after 180 days have elapsed.

**Immediate blocking dependency:** Business Verification status is unknown. It must be checked before any other step. If BV is already complete, escalation can begin immediately. If not, BV completion is the first action.

**Governance risk:** Single-admin Business Manager is the highest continuity risk. Resolving the restriction without first adding a second BM Admin creates a scenario where a recovered asset immediately reverts to a single point of failure.

---

## Current State

| Field | Value | Source |
|-------|-------|--------|
| Legal entity | Digitex Studio | `docs/VYAPARSETHU_MASTER_SKILL.md` |
| GSTIN | 27AAAPP9753F2ZF | `docs/VYAPARSETHU_MASTER_SKILL.md` |
| Restriction date | January 13, 2024 | Sprint brief |
| Months elapsed | 31 | As of 2026-08-27 |
| Standard appeal window | 180 days | Meta policy, documented |
| Appeal window status | **Expired** (31 months > 6 months) | Inferred |
| BV status | **Unknown** — must verify in BM Settings | `docs/meta/meta_restriction_recovery_audit.md` |
| BM Admin count | **Unknown** — suspected 1 (Vishal Pendharkar) | `docs/meta/vyaparsethu_asset_ownership_audit.md` |
| Incorporation target | VyaparSethu Technologies Pvt Ltd (in progress) | `docs/VYAPARSETHU_MASTER_SKILL.md` |
| Pvt Ltd status | Not yet incorporated | Sprint brief context |

---

## Phase 1 — Business Verification Status Assessment

### What Business Verification (BV) is

Meta Business Verification (formerly "Business Manager Verification") is an identity check at the BM level — not the ad account level. It proves the BM is operated by a real registered business. For Indian entities, the primary document accepted is GST registration.

### BV eligibility for Digitex Studio

Digitex Studio holds GSTIN 27AAAPP9753F2ZF. This is a Maharashtra-registered GSTIN. Meta accepts:
- GST certificate
- Certificate of Incorporation
- PAN card in the company name
- Business bank statement (recent, showing business name)

Digitex Studio satisfies the GST requirement. BV can be completed now without waiting for VyaparSethu Technologies Pvt Ltd incorporation.

### BV status — three scenarios and their implications

| BV Status | Implication for recovery |
|-----------|---------------------------|
| **Already Verified** | Tier 2 support access is available immediately. Move to Phase 2. |
| **Pending review** | Do not submit again. Wait for Meta to process. Typically 3–10 business days. Then move to Phase 2. |
| **Not started** | BV completion is the prerequisite action before any escalation. Cannot access Tier 2 without it. |

### How to check BV status (read-only)

`business.facebook.com` → Settings → Business Info → Business Verification section.  
Look for: `Verified` / `Pending` / `Not started`.

**Important:** Checking BV status is read-only. Do not submit a new BV application or upload documents until the current status is confirmed. Submitting a duplicate application can reset a pending review.

---

## Phase 2 — Support Escalation Availability

### Support tier access, current inferred state

| Tier | Condition | Current access |
|------|-----------|---------------|
| Tier 0 | Any BM | **Available** — Help Center, Community Forum |
| Tier 1 | BM with ≥1 active ad account | **Uncertain** — the restricted ad account may count as "active" for access determination, or access may be revoked. Must test at `business.facebook.com/support`. |
| Tier 2 | BM with completed Business Verification | **Available only if BV is already complete.** |
| Tier 3 | Meta Verified subscription | **Available for Page/Instagram issues** — not primary path for ad account restriction. |
| Tier 4 | ₹50L+/year spend | **Not applicable.** |

### What Tier 2 support can do for a 31-month-old restriction

Tier 2 agents have the ability to:
1. Submit an internal review request on an ad account that is past the standard appeal window.
2. Escalate to Meta's Policy review team when the standard Account Quality interface shows no "Request Review" button.
3. Cite the enforcement wave context (Q4 2023 – Q1 2024 sweep) as a mitigating factor — Meta's support documentation acknowledges some accounts from this period were incorrectly flagged.

**What Tier 2 support cannot do:**
- Override a final policy decision for severe violations (e.g., repeat fraudulent ad submissions).
- Restore an account if the Business Manager itself is disabled (not just the ad account).
- Bypass Business Verification — it is a prerequisite, not something support can work around.

### Support conversation prerequisites (for when founder initiates)

Before opening a Tier 2 support conversation, have the following ready:
- Ad account ID (format: `act_XXXXXXXXXXXXXXXX`) — from Account Quality
- BM ID — from Business Manager Settings → Business Info
- Business Verification completion confirmation
- Date of restriction (January 13, 2024)
- Policy citation shown in Account Quality (if visible)
- Any prior appeal submission history (if prior appeals exist, note their outcome)

---

## Phase 3 — Restriction Mapping

### Most probable restriction type (inferred, not confirmed)

Based on the January 13, 2024 date, entity stage (early-stage Indian startup, no prior ads context in codebase), and the documented Meta enforcement wave context:

| Restriction type | Probability | Basis |
|-----------------|-------------|-------|
| Business Verification not completed | **HIGH** | Most common trigger in Q4 2023 – Q1 2024 wave for Indian startups without BV |
| Landing page policy (thin content / no Privacy Policy) | **MEDIUM** | Common for early-stage sites; vyaparsethu.com / bell24h.com state at the time is unknown |
| Unusual activity signal (account age vs. spend mismatch) | **MEDIUM** | New accounts ramping ad spend quickly were swept in this wave |
| Payment issue or chargeback | **LOW** | No evidence in codebase of payment disputes |
| Personal account restriction cascading to BM | **LOW** | Would show as BM-level restriction, not ad account restriction |
| Severe policy violation (repeat prohibited content) | **VERY LOW** | B2B marketplace category is not a high-risk ad category; no evidence of content violations |

### What the restriction type determines

The restriction type (confirmed at Account Quality → ad account detail) determines:
1. Whether an appeal is possible at all.
2. Whether Tier 2 support can escalate internally.
3. Whether a new ad account in the same BM would be flagged immediately.

**Until the founder reads Account Quality, the restriction type is unknown.** This is the first verification action in the recovery sequence.

### Domain and Pixel factors

From `docs/meta/meta_restriction_recovery_audit.md`:
- Unverified domains (bell24h.com, vyaparsethu.com) may have been a contributing factor if the restriction cited landing page quality.
- If the Pixel was active at the time of restriction, it may carry an association flag — but Pixels are BM assets and are not permanently damaged by an ad account restriction unless the BM is also flagged.
- Domain verification in BM Brand Safety is a separate prerequisite for any new campaign activity, independent of restriction recovery.

---

## Phase 4 — Recovery Path Analysis

### Path A: Business Verification → Tier 2 Support Escalation

**Status:** Primary path. Most likely to succeed given the restriction profile.

| Factor | Assessment |
|--------|------------|
| Prerequisites | BV completed under Digitex Studio |
| Action | Open support case at `business.facebook.com/support` via Tier 2 chat; cite ad account ID, BM ID, Jan 13 2024 date, enforcement wave context |
| Timeline | 7–21 business days for internal review; may require follow-up |
| Probability of success | **Medium** — depends on restriction type. If BV-related restriction: HIGH. If landing page policy violation: MEDIUM. If severe violation: LOW. |
| Cost | None (BV is free) |
| Risk | Low. Submitting a support case does not worsen the restriction. |
| Outcome if successful | Ad account restored to Active status; can run campaigns on existing BM |
| Outcome if unsuccessful | Moves to Path B or Path D |

**Sequence for Path A:**
1. Verify BV status in BM Settings → Business Info.
2. If not verified: complete BV using Digitex Studio GSTIN and supporting documents.
3. Wait for BV confirmation (3–10 business days).
4. Open `business.facebook.com/support` → Contact Support → Ad Account Issue → Account Disabled.
5. Provide ad account ID, BM ID, restriction date, and business context.
6. Request internal policy review citing the Jan 13, 2024 enforcement wave.
7. Follow up every 5 business days if no response.

---

### Path B: Account Quality → Request Review (if button is present)

**Status:** Secondary path. Only viable if the "Request Review" button is still present in Account Quality.

| Factor | Assessment |
|--------|------------|
| Prerequisites | None — button presence is the only gate |
| Action | Navigate to Account Quality → ad account → click "Request Review" → submit context |
| Timeline | 3–7 business days for automated review; may escalate to human review |
| Probability of success | **Unknown** — depends entirely on whether the button is present. After 31 months, most violation types will not show this button. |
| Cost | None |
| Risk | Low. A denied review does not prevent Path A. |
| Outcome if successful | Ad account restored |
| Outcome if unsuccessful | No further Account Quality options; proceed to Path A |

**Sequence for Path B:**
1. Navigate to `business.facebook.com/accountquality`.
2. Select the ad account.
3. If "Request Review" button is present: submit the review with business context.
4. If button is absent or greyed out: Path B is closed. Proceed to Path A.

**Path B should be attempted first** if the button is present — it is the lowest-effort option. It does not require BV completion and has no downside risk.

---

### Path C: Meta Verified (Subscription)

**Status:** Not a primary recovery path for ad account restrictions. Applicable only if the restriction originates from a Page-level or personal account issue.

| Factor | Assessment |
|--------|------------|
| Prerequisites | Active Facebook Page or Instagram account for VyaparSethu / Bell24h |
| Action | Subscribe to Meta Verified for Business on the relevant Page/Instagram account |
| Timeline | Immediate access to priority inbox after subscription approval |
| Probability of success for ad account recovery | **LOW** — Meta Verified priority support handles Page and Instagram issues, not ad account policy violations |
| Cost | $14.99/month USD (or equivalent INR) per asset |
| Risk | None to the ad account status. Financial cost only. |
| Outcome | Priority inbox for Page/Instagram issues; may provide a support channel to escalate ad account case indirectly |

**Use Path C if:** Path A and Path B are both exhausted and the restriction has a Page-level component. Do not use it as the primary path.

---

### Path D: New Ad Account or New Business Manager

**Status:** Last resort. Significant risks. Only appropriate if Paths A and B are both definitively closed.

#### D1: New ad account within the same BM

| Factor | Assessment |
|--------|------------|
| Prerequisites | BM itself must not be disabled (only the ad account is restricted) |
| Action | Create a new ad account within the existing BM |
| Timeline | Immediate — new account is active upon creation |
| Probability of operating without immediate flag | **MEDIUM-LOW** — Meta's systems track BM-level history; a new account in a BM with a disabled account may receive enhanced scrutiny or be pre-restricted |
| Cost | None to create; must fund with a valid payment method |
| Risk | **MEDIUM** — new account may be restricted shortly after creation if BM health is flagged. This is a moderation risk, not a certainty. |
| Outcome if successful | Active ad account; can run campaigns immediately |
| Outcome if flagged | Wastes a new account creation; may complicate future BV |

**Note:** Creating a new ad account inside a BM with a restricted account is not prohibited by Meta policy — it is a moderation risk. The BV-completed BM has a lower risk profile for this action than an unverified BM.

#### D2: New Business Manager

| Factor | Assessment |
|--------|------------|
| Prerequisites | New Meta personal account or use Vishal's existing account |
| Action | Create a new BM; build all assets from scratch |
| Timeline | Immediate BM creation; but Pixel history, custom audiences, and Page associations must be rebuilt |
| Cost | Loses all historical Pixel data, custom audiences, and ad account history |
| Risk | **HIGH** — loses all historical data. The old BM and its assets still exist (restricted, not deleted) and creating a new BM does not remove them. Meta may flag the new BM if the same personal account that owns the restricted BM creates it. |
| Outcome | Clean start with no policy history; but also no audience data and no Pixel warmup |

**Path D should only be considered if:**
- BV completion is confirmed or completed.
- Path A (Tier 2 support escalation) has been attempted and formally denied.
- The business cannot wait for a support review outcome.

**Do not attempt Path D as the first action.** It destroys accumulated data assets and carries its own flagging risk.

---

## Phase 5 — Governance Risk Review

### Source document

The full asset inventory and continuity risk matrix is in `docs/meta/vyaparsethu_asset_ownership_audit.md`. This section summarizes the governance risks that affect recovery planning.

### Single-admin risk (CRITICAL)

**Inferred state:** Vishal Pendharkar is the sole admin of the Business Manager.

**Risk during recovery process:** If the support escalation or appeal process requires verification steps (identity confirmation, document uploads, email verification), all of these will be tied to Vishal's personal Facebook account. If that account becomes unavailable during the recovery process, the process stops.

**Mitigation (to be implemented before or alongside recovery, not after):**
1. Add a second trusted person as BM Admin.
2. This person's Facebook account must be in good standing (no policy violations, real identity).
3. The second Admin should also be added to the Facebook Page as Admin.
4. Do not use a dummy or throwaway account — Meta's systems flag newly created admin accounts added to flagged BMs.

**Timing:** Adding a second admin before escalating support is lower risk than doing it after recovery (doing it during a support review may not affect outcome; doing it before gives the BM a better standing profile).

### Entity transition risk (MEDIUM)

**Current state:** Digitex Studio is the operating entity. VyaparSethu Technologies Pvt Ltd incorporation is in progress.

**Risk:** If BV is completed under Digitex Studio and the ad account is recovered, a subsequent entity transition (Digitex Studio → VyaparSethu Pvt Ltd) may require:
- Re-verification under the new entity.
- Transfer or re-creation of BM assets under the new entity's BM.
- Updated domain verification for vyaparsethu.com.

**Mitigation:** Complete BV and recovery under Digitex Studio now. The entity transition can be managed as a separate future action. Do not delay recovery to wait for incorporation.

### Domain verification status (MEDIUM)

**Current state:** Unknown — must verify in BM → Brand Safety → Domains.

**Risk to new campaigns:** Without verified domains, any new ad campaign (if the account is recovered) will run under restricted conversion tracking (post-iOS 14.5 rules). This limits retargeting and lookalike audience effectiveness.

**Mitigation:** Domain verification is a parallel action to restriction recovery. It can be completed once BM access is confirmed stable. Priority order: BV first, then support escalation, then domain verification.

### Instagram and Pixel continuity (LOW for recovery; MEDIUM for future campaigns)

Neither asset is central to the immediate restriction recovery. The Pixel history is preserved regardless of ad account status. Instagram is managed independently. These are future campaign preparation items, not recovery blockers.

---

## Recovery Path Priority Matrix

| Path | When to attempt | Prerequisites | Estimated probability of success | Time to outcome |
|------|----------------|--------------|--------------------------------|----------------|
| **B: Account Quality → Request Review** | First — immediately | None | Unknown (button may be absent) | 3–7 days |
| **A: BV + Tier 2 Support Escalation** | After checking Path B | BV completion | Medium (30–60% depending on restriction type) | 2–4 weeks |
| **C: Meta Verified** | If Path A is insufficient | Active Page/Instagram | Low (for ad account specifically) | 1–2 days |
| **D1: New ad account in same BM** | After Path A is denied | BM not disabled, BV complete | Medium-Low | Immediate |
| **D2: New Business Manager** | Last resort | BV under new BM possible | Medium (but data loss) | 1–2 weeks setup |

---

## Recommended Path and Sequence

### Step 1 — Check Account Quality (today)
Navigate to `business.facebook.com/accountquality`. Record:
- Exact restriction type
- Policy citation
- Whether "Request Review" button is present

### Step 2 — Check Business Verification status (today, same session)
Navigate to BM Settings → Business Info → Business Verification. Record: Verified / Pending / Not started.

### Step 3 — Add a second BM Admin (before escalating)
Choose a trusted contact with a clean, established Facebook account. Add them as BM Admin at BM Settings → People. This reduces the continuity risk before any recovery attempt.

### Step 4a — If "Request Review" button is present (Path B)
Submit the review via Account Quality. Provide business context (Digitex Studio, GSTIN, Jan 13 2024 date). Wait 5–7 business days. If denied or no response, move to Step 4b.

### Step 4b — Complete Business Verification if not done (Path A prerequisite)
Gather: GST certificate for 27AAAPP9753F2ZF, business address (Bhiwandi, Maharashtra), Vishal Pendharkar's identity documents. Submit BV at BM Settings → Business Info → Start Business Verification. Wait 3–10 business days.

### Step 5 — Open Tier 2 support case (Path A)
After BV confirmation: `business.facebook.com/support` → Contact Support → ad account disabled. Provide ad account ID, BM ID, restriction date, enforcement wave context, and GSTIN as business evidence. Request internal policy review. Follow up every 5 business days.

### Step 6 — Assess outcome and decide on Path D
If Tier 2 support formally denies the review: evaluate Path D1 (new ad account in same BM) vs. waiting for VyaparSethu Pvt Ltd incorporation and starting clean under a new entity.

---

## Blocking Dependencies

| Dependency | Blocks | Owner | Urgency |
|-----------|--------|-------|---------|
| Founder reads Account Quality | Every recovery path decision | Vishal Pendharkar | **TODAY** |
| BV status confirmed | Path A (Tier 2 escalation) | Vishal Pendharkar | **TODAY** |
| BV completion (if not done) | Path A start | Vishal Pendharkar | 3–10 days |
| Second BM Admin added | Continuity risk reduction | Vishal Pendharkar | Before escalation |
| Ad account ID recorded | Support conversation | Vishal Pendharkar | Before escalation |
| Domain verification (bell24h.com, vyaparsethu.com) | Future campaigns post-recovery | Vishal Pendharkar | After recovery |

---

## What This Analysis Cannot Determine

The following require direct founder access to Meta Business Manager and cannot be inferred from codebase or platform documentation:

| Unknown | Where to find it | Impact |
|---------|-----------------|--------|
| Exact restriction type and policy citation | Account Quality → ad account detail | Determines probability of Path A success |
| "Request Review" button presence | Account Quality → ad account detail | Determines whether Path B is available |
| Business Verification status (Verified / Pending / Not started) | BM Settings → Business Info | Determines Path A readiness |
| Number of BM Admins | BM Settings → People | Determines governance risk level |
| Prior appeal history and outcomes | Account Quality → review history | Affects Tier 2 support framing |
| Whether BM itself is disabled or only the ad account | Account Quality → Business Accounts tab | Determines whether Path D1 is viable |
| Payment method status on the ad account | Ad Account → Billing | May affect restriction type assessment |

---

## Notes

- **This analysis is documentation only.** No appeals have been submitted, no support cases opened, no account changes made, no Meta settings modified.
- All assessments of Meta's platform behavior reflect documented processes and publicly stated Meta support policies as of August 2026.
- Probability assessments are estimates based on the restriction age, entity profile, and Meta enforcement wave documentation — not guarantees.
- The recommended sequence prioritizes the lowest-risk, lowest-cost actions first (check, verify) before any escalation or account creation.
