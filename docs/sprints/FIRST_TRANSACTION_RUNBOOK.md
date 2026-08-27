# First Transaction Runbook
**Project:** VyaparSethu  
**Sprint basis:** VS-SPRINT-FIRST-TRANSACTION-04 (commit `954f8b5`)  
**Date:** 2026-08-27  
**Owner:** Founder (digitex.studio@gmail.com)  
**Mode:** Founder-supervised, live transaction

---

## Pre-Flight Checklist (Complete Before Step 1)

- [ ] Razorpay key confirmed: log into Vercel → Settings → Environment Variables → `RAZORPAY_KEY_ID`
  - Test key starts with `rzp_test_` → payment is TEST only, no real money
  - Live key starts with `rzp_live_` → real money
- [ ] MSG91 OTP working: send a test OTP to your own phone
- [ ] At least 1 real RFQ exists: `GET /api/admin/analytics?view=founder` → `realActiveRfqs > 0`
  - If 0: log into a buyer account → post a real requirement in Ishwar's category (Steel / Packaging / Textiles) → verify it appears in supplier feed
- [ ] Buyer account ready: a real (non-founder) buyer account that will receive and accept the quote
  - Acceptable for first transaction: founder plays buyer on a separate test account
- [ ] Admin panel accessible: `bell24h.com/admin` or `vyaparsethu.com/admin`

---

## Step 1 — Supplier Registration

**Supplier action:**
1. Open `vyaparsethu.com` (or `bell24h.com`)
2. Click **"Supplier Login"** (top nav or hero button)
3. Enter Ishwar's mobile number → click **"Send OTP"**
4. Enter the 6-digit OTP received via SMS
5. Land on the onboarding wizard

**What happens in the system:**
- `User` row created: `role: SUPPLIER, isVerified: true (phone), trustScore: 30`
- `auth-token` cookie set (JWT, 7-day expiry)
- Starter credits (3) granted fire-and-forget in background

**Founder checkpoint after Step 1:**
- Log into admin panel → Users → search Ishwar's phone
- Confirm `credits = 3` in the credits column
- If `credits = 0`: Admin → Credits → grant 3 credits manually
  ```
  POST /api/admin/credits
  { "action": "grant", "userId": "<ishwarUserId>", "amount": 3 }
  ```
- Screenshot the admin user card and save for evidence

---

## Step 2 — Supplier Profile Completion

**Supplier action:**
1. In the onboarding wizard, fill:
   - Company name (Ishwar's business name)
   - Business category (Steel / Packaging / Textiles — whichever matches)
   - City / location
   - GST number (if available) or Udyam registration number
2. Submit the onboarding form

**What happens in the system:**
- `User.company`, `User.location`, `User.gstNumber` updated
- `preferences.onboardingComplete = true`
- Trust score increases: +15 (GST number provided) or +10 (Udyam), +10 (description), +5 (≥2 categories)

**Founder checkpoint after Step 2:**
- Confirm profile is visible in admin → Users → Ishwar's record
- If GST/Udyam verified: manually set `isVerified: true` via admin:
  ```
  PUT /api/admin/users
  { "userId": "<ishwarUserId>", "updates": { "isVerified": true } }
  ```
- **Note:** GST verification is a stub on the platform — no automatic GST portal check. Founder must verify the GSTIN manually at `https://www.gst.gov.in/` and then set the flag.

---

## Step 3 — RFQ Discovery

**Supplier action:**
1. Go to Dashboard → "Browse Requirements" (or `/supplier/browse-rfqs`)
2. At least 1 requirement should be visible matching their category

**What the supplier sees:**
- Requirement card: category, title, quantity, budget range, urgency, location
- Buyer name: masked (visible only after unlock)
- "Unlock Lead" button (costs 1 credit)

**Founder checkpoint:**
- If the supplier sees 0 requirements: go to admin → confirm a real OPEN/ACTIVE RFQ exists for their category
- If needed: post a real RFQ as a buyer account before continuing

---

## Step 4 — Lead Unlock

**Supplier action:**
1. Click the requirement card they want to quote on
2. Click **"Unlock Lead (1 Credit)"**
3. Buyer phone number and email appear immediately
4. Credit count drops from 3 to 2

**What happens in the system:**
- `POST /api/leads/unlock` called
- `LeadSupplier` row created: `{ leadId: rfqId, supplierId, unlocked: true, unlockedAt: now() }`
- 1 credit deducted from `UserCredits`
- **This unlock timestamp is captured in `/api/admin/transaction-evidence` for evidence**

**Founder checkpoint:**
- Confirm buyer phone + email displayed correctly
- Supplier should NOT use these contact details to bypass the platform — this is the key trust moment
- Screenshot the unlocked lead card (for evidence log)

---

## Step 5 — Quote Submission

**Supplier action:**
1. On the unlocked RFQ page, click **"Submit Quote"**
2. Fill in:
   - Price (₹ total or per unit — match the RFQ unit)
   - Delivery days (how many days to deliver)
   - Notes / terms (optional but recommended)
3. Click **"Submit"**

**What happens in the system:**
- `POST /api/supplier/quotes` creates a `Quote` record with `status: PENDING`
- RFQ status → `QUOTED`
- **Buyer receives `quoteReceivedEmail` automatically** ✅
- BOM life event recorded: `QUOTE_SUBMITTED`

**Founder checkpoint:**
- Log into the buyer account → check email inbox for "You received a quote" email
- Confirm the email arrived (if using Brevo SMTP — check Brevo dashboard if unsure)
- If email not received: notify the buyer manually by phone/WhatsApp with quote details

---

## Step 6 — Buyer Review

**Buyer action (founder-mediated for first transaction):**
1. Buyer logs into `vyaparsethu.com`
2. Go to Dashboard → "My Quotes" (or `/dashboard/quotes`)
3. Find the quote from Ishwar
4. Review: supplier name, company, price, delivery days, notes
5. Confirm the quote is satisfactory

**Founder role in Step 6:**
- Walk the buyer through this screen (in person, WhatsApp screen share, or phone call)
- Explain what they're looking at: "This is Ishwar's quote for your requirement. Price is ₹X, delivery in Y days."
- Confirm buyer is willing to proceed before they click "Accept"

---

## Step 7 — Buyer Acceptance

**Buyer action:**
1. Click **"Accept Quote & Pay Escrow"** on the quote card

**What happens in the system:**
- `POST /api/deal/select` called
- `Deal` row created: `{ buyerId, supplierId, rfqId, quoteId, price, status: ACTIVE }`
- Wallet lock attempted (non-blocking — if buyer wallet unfunded, deal stays ACTIVE)
- **Supplier receives `quoteAcceptedEmail` automatically** ✅ (Sprint-04)
- BOM life events recorded
- Buyer redirected to `/checkout/[dealId]`

**Founder checkpoint:**
- Note the Deal ID from the URL: `/checkout/[dealId]`
- Log the Deal ID — this is your primary evidence identifier
- Confirm supplier received the "Your quote was accepted" email

---

## Step 8 — Deal Creation Confirmation

**Confirm in admin panel:**
1. Go to `bell24h.com/admin`
2. Scroll to "First Transaction Dashboard" section
3. Confirm the deal appears in the "Recent Deals" table
4. Verify: RFQ title, buyer name, supplier name, price, status = ACTIVE

**Confirm via evidence endpoint:**
```
GET /api/admin/transaction-evidence
Authorization: Bearer <admin-token>
```
- Confirm `dealId` appears in evidence list
- Confirm `unlockTimestamp`, `quoteTimestamp`, `acceptanceTimestamp`, `dealTimestamp` are all populated

---

## Step 9 — Payment Initiation

**Buyer action (on `/checkout/[dealId]`):**
1. Verify the page shows:
   - Deal value (₹ — the agreed quote price)
   - Buyer's real name pre-filled in Razorpay (Sprint-04 fix) ✅
   - Buyer's real phone pre-filled in Razorpay (Sprint-04 fix) ✅
2. Click **"Pay ₹[amount] Securely"**
3. Razorpay modal opens → complete payment
4. On success: redirected to `/payment/success?dealId=[id]&paymentId=[razorpayId]`

**If Razorpay is in TEST mode:**
- Use test card: `4111 1111 1111 1111`, any future expiry, any CVV
- Payment succeeds but no real money transfers

**If Razorpay is in LIVE mode:**
- Buyer must complete real UPI / card / netbanking payment
- Confirm with Razorpay dashboard that payment is captured

**Founder checkpoint:**
- Screenshot the `/payment/success` page
- Check Razorpay dashboard for payment confirmation
- Note `razorpay_payment_id` from success URL

---

## Step 10 — Evidence Capture

**Call the evidence endpoint immediately after payment:**
```
GET /api/admin/transaction-evidence
Authorization: Bearer <admin-token>
```

**Record these values from the response:**
```json
{
  "dealId": "...",
  "rfqId": "...",
  "buyerId": "...",
  "supplierId": "...",
  "quoteId": "...",
  "rfqCreatedAt": "...",
  "unlockTimestamp": "...",
  "quoteTimestamp": "...",
  "acceptanceTimestamp": "...",
  "dealTimestamp": "...",
  "paymentTimestamp": "...",
  "paymentStatus": "...",
  "paymentAmount": ...,
  "unlockToQuoteSeconds": ...,
  "quoteToAcceptanceSeconds": ...,
  "dealToPaymentSeconds": ...
}
```

**Manual capture (screenshot and save):**
- [ ] Razorpay payment confirmation (from Razorpay dashboard)
- [ ] `/payment/success` page screenshot
- [ ] Admin "First Transaction Dashboard" screenshot showing 1 deal
- [ ] Evidence endpoint JSON response (copy-paste or screenshot)
- [ ] Supplier's acceptance email (forward to self)
- [ ] Buyer's quote received email (forward to self)

**Post-transaction — notify both parties:**
- Call/WhatsApp Ishwar: "Your quote was accepted and payment has been received. Deal ID: [X]. We will coordinate delivery."
- Call/WhatsApp buyer: "Your payment is secured. Ishwar will deliver in [Y] days. We will guide you through delivery confirmation."

---

## What Happens After Step 10

1. **Delivery coordination:** Founder mediates between buyer and supplier for first delivery. Platform does not yet have a delivery confirmation UI.
2. **Payment release:** Once buyer confirms delivery, founder releases payment from Razorpay escrow to supplier (manual step in Razorpay dashboard for first transaction).
3. **VS-SPRINT-TRADE-INTELLIGENCE-01 unlocks** once this evidence exists in the system.

---

## Emergency Contacts and Fallbacks

| Issue | Action |
|-------|--------|
| OTP not received | Check MSG91 dashboard → resend |
| Credits = 0 after registration | Admin panel → grant 3 credits via POST /api/admin/credits |
| No real RFQs visible | Post a test RFQ from founder's buyer account |
| Razorpay payment fails | Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel |
| Supplier email not received | Check Brevo SMTP logs; deliver manually by phone |
| Checkout shows "Buyer Name" | Clear cache — Sprint-04 fix deployed at commit 954f8b5 |
| Deal not appearing in admin dashboard | Hard-refresh admin page; confirm Sprint-04 deployed on Vercel ✅ |
