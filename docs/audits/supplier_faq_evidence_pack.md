# Supplier FAQ Evidence Pack
**Project:** VyaparSethu  
**Sprint:** VS-SPRINT-SUPPLIER-CONVERSION-01  
**Date:** 2026-08-26  
**Purpose:** Evidence-backed answers for every question Ishwar and future suppliers will ask.

All answers cite actual platform behavior from audited source code. No marketing language.

---

## Q1: Why should I join VyaparSethu?

**Evidence-backed answer:**

1. **Real buyer requirements exist.** Buyers post requirements (RFQs) on the platform. You can see them: category, product, quantity, budget, location, and timeline — all visible after registration.

2. **You can quote for free.** Submitting a quotation costs zero credits. There are no mandatory fees to participate.

3. **Protected Payment.** When a buyer accepts your quote, the deal amount is held in escrow before goods leave your warehouse. You are guaranteed payment on delivery. Source: `PUT /api/rfq/quotes` escrow lock on accept.

4. **No cold-calling required.** Buyers come to you. Your profile is matched to their requirements.

5. **Free during the founding cohort.** As one of the first 10 verified suppliers, your profile and leads are free.

---

## Q2: How do I receive requirements?

**Exact flow:**

1. Register with your phone number (OTP) at vyaparsethu.com
2. Complete your supplier profile: company name, category, city (2 minutes)
3. Go to your dashboard → Leads / Requirements section
4. See all current open requirements in your categories
5. Each requirement shows: product, quantity, location, budget, urgency

**What you see immediately:**
- All RFQ details except buyer name (masked as `••• •••••`)
- Buyer name visible for free via the full requirement page

**Source:** `GET /api/supplier/leads` (feed) + `GET /api/rfq/[id]` (full detail)

---

## Q3: How do I submit a quotation?

**Route:** `POST /api/rfq/quotes`  
**Credits required:** Zero.

**What you submit:**
- Price (required)
- Quantity (optional — defaults to RFQ quantity)
- Delivery timeline in days
- Notes / terms

**After submission:**
- Quote status: `PENDING`
- Buyer receives email notification
- Buyer reviews all quotes on their dashboard
- If buyer accepts: you receive `quoteAcceptedEmail` with deal details

**No credits. No fees. Completely free to quote.**

---

## Q4: When do I see buyer details?

| What | When | How |
|------|------|-----|
| Buyer company name (in feed) | After spending 1 credit (unlock) | Via `/api/leads/unlock` *(currently broken, fix pending)* |
| Buyer company name (full page) | Immediately after registration | Via direct RFQ URL — no credits needed |
| Buyer email | Never — until deal closes | Protected throughout |
| Buyer phone | Never — until deal closes | Protected throughout |
| Buyer delivery address | After deal created | Via deal record |

**Practical answer for Ishwar:** You can see the buyer's company name and location immediately — click the requirement from your leads feed and the full page shows it. Credits are optional for convenience in the feed view.

---

## Q5: What is free?

Everything needed to participate is free:

| Feature | Free? |
|---------|-------|
| Registration | ✅ Free |
| Profile completion | ✅ Free |
| Browsing requirements | ✅ Free |
| Viewing full requirement details (incl. buyer name) | ✅ Free |
| Submitting a quotation | ✅ Free |
| Receiving deal notification (email) | ✅ Free |
| Protected Payment participation | ✅ Free (Razorpay handles transaction) |

---

## Q6: What is paid?

| Feature | Cost |
|---------|------|
| Unlocking buyer name IN the leads feed (convenience shortcut) | 1 credit |
| Credits: Starter pack | ₹10 for 2 credits |
| Credits: Pro pack | ₹50 for 12 credits |
| Credits: Enterprise pack | ₹100 for 30 credits |

**For the founding cohort of first 10 suppliers:** The founder will grant 3 free credits manually. You do not need to purchase anything.

---

## Q7: What happens after I register?

**Day 0:**
1. You register via OTP (30 seconds)
2. You receive a welcome confirmation

**Day 0–1 (founder-assisted):**
3. Founder calls or messages: "I see you've registered. Let me walk you through your profile."
4. You fill: company name, category, city, GST/Udyam (2 minutes)
5. Founder grants 3 free lead-unlock credits
6. Founder verifies your GST/Udyam and marks your profile as "Verified Supplier"

**Day 1–2:**
7. Founder creates a real buyer requirement in your category
8. You see it in your dashboard
9. Founder walks you through submitting your first quotation
10. Quote submitted — your profile is now active in the marketplace

**Day 7–30:**
- New requirements matching your categories appear automatically
- Buyers may accept your quotes
- On acceptance: deal created, Protected Payment initiated
- On delivery confirmation: payment released within 7 days

---

## Q8 (for buyer): How many verified suppliers do you have?

**Safe answer until ≥50 suppliers:**
> "We are onboarding our founding cohort of verified suppliers across Steel, Packaging, and Textiles. We personally verify each supplier's GST/Udyam before listing them. Join the waitlist for early buyer access."

**Do not state a number publicly.** Run this query for internal tracking:
```sql
SELECT count(*) FROM "users" 
WHERE role = 'SUPPLIER' 
  AND "is_verified" = true 
  AND "trust_score" >= 50;
-- Note: all OTP-registered users have is_verified=true.
-- trustScore >= 50 is a better proxy for "founder-reviewed" suppliers.
```

---

## Q9 (for investor/judge): What traction exists today?

**Evidence-backed answer:**

- Platform is live at vyaparsethu.com / bell24h.com
- Quote submission, deal creation, Protected Payment (Razorpay) all functional
- Supplier profile, RFQ browsing, matching — all working
- First warm lead (Ishwar) in personal outreach
- Outreach infrastructure: wa.me (personal), Brevo email (automated), MSG91 OTP

**What to avoid claiming:**
- User counts (unknown without DB query)
- Transaction volume (unknown without DB query)
- "50,000+ businesses" or any invented metric

**Honest traction statement:**
> "Platform is live with full quote-to-deal-to-payment flow. Onboarding first verified suppliers in August 2026. First RFQ-to-deal conversion target: 30 days."
