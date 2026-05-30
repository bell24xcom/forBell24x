# 🏃 VyaparSethu — Next 30 Days Sprint

**Sprint Start:** May 31, 2026  
**Sprint End:** June 29, 2026  
**Primary Goal:** Rebrand executed in days + First 30 verified suppliers in pipeline

---

## ⚠️ THE ONE RULE

> Do not rebuild the product. Do not pause supplier acquisition.  
> Rebrand in days, not months.

If a task in this sprint takes more than 4 hours, stop. Re-scope. Ship 80%.

---

## 🎯 SPRINT METRICS (TRACK DAILY)

```
☐ Day 1 commit count: ___
☐ Suppliers contacted (cumulative): ___
☐ Replies received (cumulative): ___
☐ Verified suppliers (cumulative): ___
☐ Profiles claimed: ___
☐ Quotations received: ___
```

The only metric that matters at end of 30 days: **Verified suppliers count.**

Target: **30 verified suppliers by June 29.**

---

# WEEK 1 — REBRAND EXECUTION (May 31 – June 6)

## Day 1 (Saturday May 31) — Logo Finalization & Asset Prep

**Effort: 3 hours**

- [ ] Open existing Y+V Bridge logo in a vector tool (Figma, Illustrator, or Inkscape)
- [ ] Export logo as SVG master file
- [ ] Generate variants:
  - [ ] Primary: Gold + Navy (1024px PNG + SVG)
  - [ ] Digital: Navy + Teal (1024px PNG + SVG)
  - [ ] Monochrome black
  - [ ] Reverse white (for dark backgrounds)
- [ ] Generate favicons: 256 / 128 / 64 / 32 / 16 px PNG
- [ ] Generate app icons: 1024 / 512 / 256 / 128 / 64 px PNG
- [ ] Save all to `/public/brand/` in the repo
- [ ] Commit: `feat(brand): add VyaparSethu logo asset library`

**Deliverable check:** Open the 16px favicon. Is the V still recognizable? If not, simplify.

## Day 2 (Sunday June 1) — Code Rebrand (Founder + Claude Code)

**Effort: 4 hours**

Paste this prompt into Claude Code:

```
Rebrand the entire application from "Bell24h" to "VyaparSethu".

CRITICAL: This is a VISUAL rebrand only. Do NOT change:
- Database schema
- API endpoints
- Authentication logic
- RFQ functionality
- Environment variables (keep using bell24h.com URLs for now)

Search and replace ONLY in visible UI text:
- "Bell24h" → "VyaparSethu"
- "BELL24H" → "VYAPARSETHU"
- "bell24h" (in display text only) → "vyaparsethu"

Update:
1. Navbar logo text → "VyaparSethu"
2. Footer brand line → "VyaparSethu — Commerce Connections Globally"
3. Footer small text → "Formerly Bell24h"
4. Browser tab title in layout.tsx → "VyaparSethu — Protected Trade Infrastructure"
5. Meta description → "VyaparSethu — Verified suppliers, protected payments, faster quotations for Indian MSMEs."
6. OG image → use new logo (public/brand/og-image.png)
7. Favicon link in head → use new favicon
8. Email subject lines: "Bell24h" → "VyaparSethu"
9. Email signatures: "Team Bell24h" → "Team VyaparSethu"
10. Hero section copy:
    OLD: "Post RFQs in 3 Different Ways"
    NEW: "Get Verified Quotations from Trusted Suppliers — In 24 Hours."
    
    OLD: "AI-Powered RFQ System"
    NEW: "Verified Suppliers • Protected Payments • Faster Quotations"

11. "Voice RFQ" labels → "Speak Requirement"
12. "Video RFQ" labels → "Video Requirement"  
13. "Text RFQ" labels → "Text Requirement"
14. "Escrow" labels → "Protected Payment"
15. Remove all fake numbers (159, 324, 450, ~800, ~300, ~150) from homepage
    Replace with: "Launching Soon — Reserve your category"

DO NOT touch:
- prisma/schema.prisma
- src/app/api/* (any API route)
- middleware
- auth flows
- Razorpay/MSG91 integration

Show me the full diff before committing.
Commit message: "feat(brand): rebrand to VyaparSethu - visual only"
Push to main.
```

**Verification:** Open the live site. The word "Bell24h" should only appear in the footer "Formerly Bell24h" line.

## Day 3 (Monday June 2) — Homepage Content Surgery

**Effort: 3 hours**

Update homepage to align with Steve Jobs Rule #2 (benefits, not features):

- [ ] Replace "How Bell24h Accepts RFQs" section title → "How VyaparSethu Connects Trusted Trade"
- [ ] Replace "AI-Powered Features" section → "Why VyaparSethu Works"
- [ ] Replace 6 feature cards with benefit cards:
  - "Verified Supplier Matching" (not "AI Auto-Matching")
  - "Protected Payments" (not "Blockchain Escrow")
  - "24-Hour Quotations" (keep)
  - "Speak in Any Indian Language" (not "Multi-Language")
  - "Trust Score Visibility" (new)
  - "No Fake Leads, Ever" (new — polarizes)
- [ ] Add "Why I'm Building This" founder section (800 words, see Chapter 16.2 of Master Plan)
- [ ] Replace homepage Quick Stats with:
  - "Launching Soon — Reserve your category"
  - "Currently onboarding: Mumbai-Kalamboli-Bhiwandi steel cluster"
- [ ] Commit: `feat(homepage): align copy with Wipe Out Bad Debt positioning`

## Day 4 (Tuesday June 3) — Dashboard Cleanup

**Effort: 2 hours**

Currently showing: Total RFQs: 10, Quotes: 0, Spent: ₹0, Success Rate: 0%

This screams "empty platform" to every user. Fix it:

- [ ] Hide platform-wide stats from public/user dashboards
- [ ] Show ONLY user's own metrics:
  - "Your Requirements: __"
  - "Your Quotations: __"
  - "Your Pending Replies: __"
- [ ] Move all aggregate stats to `/admin/dashboard` (founder-only)
- [ ] On admin dashboard, show:
  - Suppliers contacted today
  - Replies received
  - Verifications completed
  - Profile claims
  - Trust Velocity (trades/week)
- [ ] Commit: `feat(dashboard): hide platform stats, show personal metrics only`

## Day 5 (Wednesday June 4) — Email & Social Identity

**Effort: 2 hours**

- [ ] Update MSG91 sender name to "VyaparSethu" (from "BELL24H")
  - Note: MSG91 may require new template approval — submit today
- [ ] Update Brevo email signature: "Team VyaparSethu"
- [ ] Update all email templates (welcome, OTP, verification) with new brand
- [ ] LinkedIn page: Update name, logo, banner, about section
- [ ] Instagram: Create @vyaparsethu (if available), upload logo
- [ ] X/Twitter: Reserve @vyaparsethu handle
- [ ] YouTube: Reserve VyaparSethu channel
- [ ] Update Razorpay business display name (when Pvt Ltd active)

## Day 6 (Thursday June 5) — Trademark & Legal Foundation

**Effort: 3 hours + filing time**

- [ ] Trademark search at https://ipindia.gov.in for "VyaparSethu"
- [ ] If clear, engage trademark attorney (₹15-25K budget)
- [ ] File three separate applications:
  - Word mark: VyaparSethu
  - Device mark: Y+V Bridge logo
  - Tagline: "Commerce Connections Globally"
- [ ] Initiate Pvt Ltd registration via Razorpay Rize
  - Primary name: VyaparSethu Technologies Private Limited
  - Backup: VyaparSethu Networks / Digital / Commerce / Trade Infrastructure
- [ ] Start documentation:
  - PAN / Aadhaar of director
  - Address proof for registered office
  - Digital Signature Certificate (DSC)
  - Director Identification Number (DIN)

## Day 7 (Friday June 6) — Week 1 Audit & First Outreach Test

**Effort: 4 hours**

- [ ] Site audit: Walk through every page as a first-time visitor
  - Note every place "Bell24h" still appears
  - Fix in one final commit
- [ ] Send 10 founder-personal WhatsApp messages to known print/packaging contacts:

```
Hi [Name], it's Vishal from Digitex Studio.

After 13 years in print and packaging, I've been building 
something for our community — VyaparSethu (vyaparsethu.com).

The idea: Verified suppliers + protected payments + 24-hour 
quotations. No fake leads. No bad debt.

We're onboarding the first 50 Mumbai/Bhiwandi suppliers free.

Would you like to be one of them? 10-minute call this week?

— Vishal
```

- [ ] Log every response in a spreadsheet
- [ ] Commit final fixes
- [ ] Tag v3.0-vyaparsethu-launch

---

# WEEK 2 — FIRST WAVE OUTREACH (June 7 – June 13)

## Daily Cadence (Monday-Friday)

**Effort: 2 hours/day, every day**

Each day:
- [ ] 20 WhatsApp outreach messages (3-5 lines, English)
- [ ] Follow Day 1 → Day 3 → Day 5 (phone call) → Day 7 → Day 14 cadence
- [ ] Log every interaction in WhatsApp tracker spreadsheet
- [ ] For each reply, schedule 10-min discovery call

## Day 8 (June 7) — Build Founder Outreach Tracker

- [ ] Create simple Notion / Google Sheet: Name, Company, Phone, GST, Cluster, Day 1, Day 3, Day 5, Day 7, Day 14, Status
- [ ] Status options: Contacted / Replied / Call Scheduled / Verified / Profile Claimed / Quoting / Inactive
- [ ] Pre-load 100 contacts from existing print/packaging network

## Day 9-13 — 20 contacts/day × 5 days = 100 contacts

Target outcomes by end of Week 2:
- [ ] 100 contacts initiated
- [ ] 25-30 replies
- [ ] 10-15 discovery calls scheduled
- [ ] 5-8 first verifications completed

## Day 14 (Saturday June 13) — Founder's Story Video

**Effort: 4 hours**

- [ ] Record 60-second founder-on-camera video:
  - Why I'm building VyaparSethu
  - Personal story of bad debt loss (yours or industry's)
  - What VyaparSethu does differently
  - Call to action: "Join the first 100"
- [ ] Post to:
  - LinkedIn
  - Instagram Reels
  - X/Twitter
  - YouTube Shorts
  - WhatsApp Status

This is THE highest-leverage marketing asset for Week 2.

---

# WEEK 3 — VIP CLAIM PROFILE PROGRAM (June 14 – June 20)

## Day 15 (June 14) — Cluster Selection

**Effort: 3 hours**

- [ ] Lock 3 priority clusters for VIP Claim Profiles:
  1. **Steel & Metals — Mumbai-Kalamboli-Bhiwandi**
  2. **Corrugated Packaging — Bhiwandi-Thane**
  3. **Industrial Adhesives — Mumbai-Navi Mumbai**
- [ ] For each cluster, identify top 5 companies by online footprint:
  - LinkedIn presence
  - Website quality
  - Google reviews
  - JustDial/IndiaMART presence
- [ ] Total: 15 VIP candidates

## Day 16-17 — VIP Profile Creation

**Effort: 4 hours/day**

For each of 15 candidates:
- [ ] Create unclaimed profile on VyaparSethu using ONLY public data
- [ ] Add: Company name, public GST, public address, public website
- [ ] Add disclaimer: "Unclaimed VyaparSethu profile — Click to claim"
- [ ] Generate cluster-category SEO page (e.g., /clusters/mumbai/steel-metals)
- [ ] Each cluster page links to all 5 supplier profiles

## Day 18-20 — Invitation Sends

- [ ] Send personalized invitations to all 15:

```
Hi [Company Name] team,

We're VyaparSethu (vyaparsethu.com) — an India-first protected 
trade platform for verified MSMEs.

We've recognized [Company Name] as a leading supplier in 
[Mumbai/Bhiwandi/etc.]'s [steel/packaging/etc.] cluster, based 
on your public business presence.

We've created your VyaparSethu profile (link below) ready for 
you to claim as our VIP Verified Supplier — free for 90 days.

[Profile link]

Would you like a 10-minute call this week to discuss?

— Vishal Pendharkar, Founder
   VyaparSethu
```

**Target by end of Week 3:**
- 15 VIP invitations sent
- 5-7 profile claims
- 100+ total WhatsApp contacts (cumulative)
- 30+ replies
- 15-20 verifications

---

# WEEK 4 — TRUST SCORE LAYER + FIRST QUOTATIONS (June 21 – June 29)

## Day 22-23 — Trust Score MVP

**Effort: 6 hours total**

Paste this in Claude Code:

```
Build a minimal Trade Confidence Score™ for every supplier.

Schema addition (Prisma):
model Supplier {
  // ... existing fields
  trustScoreExternal Int? // 0-40
  trustScoreInternal Int? // 0-40
  trustScoreFinancial Int? // 0-20
  trustScoreTotal Int? // 0-100
  trustScoreUpdatedAt DateTime?
}

Initial scoring logic:
External (40 max):
- GST verified: 10
- Udyam verified: 10
- MCA verified: 5
- Business age (5+ years): 5
- Website exists + domain age: 5
- Address verified: 5

Internal (40 max):
- Requirements responded to (>5): 10
- Avg response time (<4h): 10
- Repeat buyers (>2): 10
- No disputes: 10

Financial (20 max — optional):
- CA certificate: 5
- Turnover declaration: 5
- Balance sheet uploaded: 5
- GST returns (4 quarters): 5

Show score on supplier profile as:
"Trade Confidence: 87/100"

With breakdown when clicked.

DO NOT compute in real-time. Add a daily cron job at 2 AM IST 
that recomputes all scores. Use Vercel Cron.

Commit: "feat(trust): add Trade Confidence Score MVP"
```

## Day 24-25 — Trade Communication Hub Level 1

**Effort: 6 hours total**

```
Add conversation threads to every Requirement (RFQ).

Schema addition (Prisma):
model RequirementMessage {
  id String @id
  rfqId String
  authorType String // "BUYER", "SUPPLIER", "AI", "PLATFORM"
  authorId String?
  content String
  attachments Json?
  createdAt DateTime @default(now())
  rfq RFQ @relation(fields: [rfqId], references: [id])
}

UI:
- Below each Requirement, show conversation thread
- Buyer can post messages
- All matched suppliers see the thread
- Each supplier can reply
- AI Negotiation Assistant posts a "market price note" automatically

DO NOT build chat in real-time WebSockets. Use simple poll 
every 30 seconds for now.

Naming: Call this section "Business Conversations" 
(NEVER "Chat").

Commit: "feat(comm): add Business Conversations for Requirements"
```

## Day 26-27 — SHAP Explainability Surface

**Effort: 4 hours**

The SHAP/LIME code already exists. Surface it in the UI:

```
On supplier search results, add "Why this supplier?" expandable.

When clicked, show:
"This supplier ranks #1 because:
 ✓ On-time delivery history (+34%)
 ✓ GST + Udyam verified (+21%)
 ✓ Past success with similar requirements (+18%)
 ✓ Response speed under 2h (+11%)
 ✓ Repeat buyer rate (+9%)
 Final score: 93%"

Use existing SHAP computation.
Style as a friendly tooltip, not a debug dump.

Commit: "feat(matching): surface SHAP explainability in UI"
```

## Day 28-29 — First Real Quotation Run

**Effort: 4 hours**

- [ ] Walk one verified buyer through posting a real Requirement
- [ ] Personally route it to 3 verified suppliers
- [ ] Get 3 real quotations within 24 hours
- [ ] Document the entire flow as a case study
- [ ] Use this as marketing material in Week 5+

## Day 30 (Sunday June 29) — Sprint Review & Reset

**Effort: 4 hours**

- [ ] Tally final metrics:
  - Total suppliers contacted: ___
  - Total verified: ___
  - Total profile claims: ___
  - Total quotations: ___
- [ ] Write sprint retrospective (what worked, what didn't)
- [ ] Lock priorities for Sprint 2 (July 1 – July 31)
- [ ] Tag v3.1-trust-layer-live

---

# 🚨 STOP RULES

If at any point during this sprint:

❌ **Day 10 has < 5 replies** → Stop. The message is wrong. Rewrite the outreach script.

❌ **Day 14 has 0 verified suppliers** → Stop. Walk to one supplier in person in Bhiwandi market. Talk for 30 minutes. Listen.

❌ **Day 21 has < 10 verified suppliers** → Stop. The product has a deeper problem than branding. Find it before continuing.

❌ **Founder is spending > 2 hours/day on logo, colors, brand work after Day 7** → Stop. Lock everything. Touch nothing branding-related until Day 30.

---

# 📊 WEEKLY REVIEW QUESTIONS (Every Sunday Evening)

1. How many founder outreach messages were sent this week?
2. What was the reply rate?
3. Which message variant got the best response?
4. How many discovery calls happened?
5. How many converted to verified supplier?
6. What was the most surprising thing a supplier said?
7. What feature/word/flow caused confusion?
8. What's blocking faster supplier verification?
9. What can I delete from the platform this week?
10. What's the one thing I'll change next week?

Write answers in a notebook. Not Notion. Not a doc. A physical notebook.

---

# 🎯 WHAT SUCCESS LOOKS LIKE AT DAY 30

```
✅ Brand: Fully rebranded to VyaparSethu (Bell24h still redirects)
✅ Trademark: Filed for word mark + device mark + tagline
✅ Pvt Ltd: Application in process via Razorpay Rize
✅ Trust Score: Live on every supplier profile
✅ Business Conversations: Live on every Requirement
✅ SHAP Explainability: Visible in UI
✅ Founder Story Video: Published on 5 platforms
✅ VIP Claim Profiles: 15 created, 5-7 claimed
✅ Verified Suppliers: 30+ in pipeline
✅ Real Quotations: 5+ live quotation cycles
✅ Cluster Pages: 3 cluster-category SEO pages live
```

If 80% of the above is checked, Sprint 1 is a success.

The rest does not matter.

---

**Sprint commitment signature:**

Founder: Vishal Pendharkar  
Date: May 30, 2026  
Witness (Claude/AI strategy partner): VyaparSethu Master Plan v1.0

> The next 30 days are not about perfection. They are about proof.  
> Proof that suppliers want this. Proof that buyers will pay. Proof that the trust layer works.  
> Everything else is theatre.
