# VyaparSethu — Phase B Manual E2E Validation Checklist

**Target:** live production deployment at **vyaparsethu.com**
**Tester:** Founder, on a real device
**Scope:** manual validation only — no code changes accompany this document.

---

## Section 1 — Supplier Registration & Onboarding

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 1.1 | Supplier can open registration page on desktop | On desktop Chrome, go to vyaparsethu.com → click Register/Supplier signup | Registration page loads fully, no console errors, form is visible | | |
| 1.2 | Supplier can open registration page on mobile (Android Chrome) | On Android Chrome, go to vyaparsethu.com → tap Register/Supplier signup | Page loads fully, form is usable without zooming | | |
| 1.3 | OTP is sent to mobile number via MSG91 | Enter a real mobile number in the registration form → tap "Send OTP" | Form confirms OTP was sent, no error toast | | |
| 1.4 | OTP is received within 30 seconds | Watch the phone's SMS inbox after tapping "Send OTP" | SMS with OTP arrives within 30 seconds | | |
| 1.5 | OTP verification succeeds | Enter the received OTP into the verification field → submit | App confirms OTP verified, proceeds to next step | | |
| 1.6 | Supplier can enter company name, GST number, Udyam number | On the profile step, fill in Company Name, GSTIN, Udyam number | All three fields accept input and validate format (no premature errors) | | |
| 1.7 | GST validation returns correct business name | Enter a valid GSTIN → trigger validation | Business/legal name auto-fills or displays matching GSTIN's registered name | | |
| 1.8 | Profile is saved and confirmation is shown | Submit the completed profile form | Success message/confirmation screen appears; no error toast | | |
| 1.9 | New supplier appears in /admin/suppliers within 60 seconds | Log in to /admin/suppliers as admin within 60s of the above submission | New supplier row appears with correct name/phone | | |
| 1.10 | Supplier profile shows correct GST/Udyam verification status | Open the new supplier's record in /admin/suppliers | GST/Udyam status field reflects the values entered/validated in 1.6–1.7 | | |

## Section 2 — Buyer Registration

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 2.1 | Buyer can open registration page on desktop | On desktop Chrome, go to vyaparsethu.com → click Register/Buyer signup | Registration page loads fully, no console errors | | |
| 2.2 | Buyer can open registration page on mobile (Android Chrome) | On Android Chrome, go to vyaparsethu.com → tap Register/Buyer signup | Page loads fully, form usable without zooming | | |
| 2.3 | OTP is sent and received within 30 seconds | Enter mobile number → tap "Send OTP" → watch SMS inbox | OTP SMS arrives within 30 seconds | | |
| 2.4 | OTP verification succeeds | Enter received OTP → submit | App confirms verification, proceeds to next step | | |
| 2.5 | Buyer profile is created and confirmation is shown | Complete buyer profile fields → submit | Success message/confirmation screen appears | | |
| 2.6 | Buyer appears in /admin/crm or /admin/users | Log in to /admin/crm or /admin/users as admin | New buyer record is visible with correct name/phone | | |

## Section 3 — RFQ Flow

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 3.1 | Logged-in buyer can access RFQ creation page | Log in as buyer → navigate to /rfq/create | Page loads with an empty RFQ form | | |
| 3.2 | Buyer can fill in RFQ title, category, quantity, location | On the RFQ form, fill Title, Category, Quantity, Location | All fields accept input; category dropdown populates correctly | | |
| 3.3 | RFQ is submitted successfully | Submit the completed RFQ form | Request completes without error (no 4xx/5xx toast) | | |
| 3.4 | Buyer sees confirmation / success state | Observe UI immediately after submission | Success screen or confirmation message is shown | | |
| 3.5 | RFQ appears in /admin/rfqs within 60 seconds | Log in to /admin/rfqs as admin within 60s of submission | New RFQ row appears with matching title/details | | |
| 3.6 | RFQ is mapped to correct category | Open the new RFQ in /admin/rfqs | Category field matches what the buyer selected in 3.2 | | |
| 3.7 | Buyer can view their submitted RFQ in their dashboard | Log in as the same buyer → open their dashboard/"My RFQs" | Submitted RFQ is listed with correct title/status | | |

## Section 4 — Supplier Matching

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 4.1 | Submitted RFQ triggers supplier matching | After submitting the RFQ in Section 3, wait briefly, then check for matching activity (admin logs or supplier dashboard) | Matching process runs against the new RFQ without error | | |
| 4.2 | Matched suppliers can see the RFQ in their dashboard | Log in as a supplier whose category matches the RFQ → open their dashboard | RFQ appears in the supplier's incoming/matched requirements list | | |
| 4.3 | Supplier can submit a quote against the RFQ | As the matched supplier, open the RFQ → submit a quote | Quote submission completes without error, confirmation shown | | |
| 4.4 | Buyer can see the quote in their dashboard | Log in as the buyer → open the RFQ or "My Quotes" | Submitted quote is visible with correct supplier/amount | | |
| 4.5 | Match explanation is visible (even if heuristic, not SHAP) | On the matched RFQ or quote view, look for match reasoning/explanation | Some explanation of why the match occurred is displayed (heuristic reasons acceptable — no SHAP/LIME expected) | | |

## Section 5 — Payments

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 5.1 | Payment page loads correctly | Navigate to the payment page for a deal/order | Page loads with correct amount and order details, no console errors | | |
| 5.2 | Razorpay checkout opens without errors | Tap "Pay" / "Proceed to payment" | Razorpay checkout modal/window opens cleanly | | |
| 5.3 | Test payment can be initiated (use Razorpay test mode) | In Razorpay checkout, use a Razorpay test card/UPI | Test payment flow proceeds without JS errors | | |
| 5.4 | Payment success triggers correct confirmation | Complete the test payment successfully | App shows payment success confirmation, order/deal status updates | | |
| 5.5 | Payment failure shows correct error state | Trigger a failed/declined test payment | App shows a clear failure message, no silent hang | | |
| 5.6 | /api/health shows razorpay: true | Open vyaparsethu.com/api/health in browser or curl | JSON response includes `configured.razorpay: true` | | |

## Section 6 — Admin Panel

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 6.1 | Admin login at /admin/login succeeds | Go to /admin/login → enter admin credentials | Login succeeds, redirects into admin shell | | |
| 6.2 | Dashboard loads with real data (not empty/error state) | Open /admin after login | Dashboard shows real metrics/data, not blank or error state | | |
| 6.3 | /admin/suppliers shows supplier list with correct data | Open /admin/suppliers | Supplier list loads with real rows and correct fields | | |
| 6.4 | /admin/rfqs shows submitted RFQs | Open /admin/rfqs | RFQ list loads, including any RFQs submitted during this test session | | |
| 6.5 | /admin/crm loads correctly | Open /admin/crm | Page loads without error, shows buyer/lead data | | |
| 6.6 | /admin/outreach loads correctly | Open /admin/outreach | Page loads without error | | |
| 6.7 | /admin/analytics loads without error | Open /admin/analytics | Page loads without error, charts/data render | | |
| 6.8 | /admin/system shows healthy system status | Open /admin/system | System health indicators show healthy/green status | | |
| 6.9 | /admin/email-health shows SPF/DKIM/DMARC status | Open /admin/email-health | Page displays SPF/DKIM/DMARC check results | | |

## Section 7 — Feature Flag Verification

**Verify these pages return 404 or redirect for public users** (all should be gated behind `FLAGS.INTELLIGENCE_ENABLED` / `FLAGS.SHAP_ENABLED`, both default `false` per the Phase 2C/2D hardening work).

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 7.1 | /admin/company-dna — must NOT be accessible | Navigate directly to vyaparsethu.com/admin/company-dna | 404 page (or redirect), not the Company DNA UI | | |
| 7.2 | /admin/knowledge-graph — must NOT be accessible | Navigate directly to vyaparsethu.com/admin/knowledge-graph | 404 page (or redirect), not the Knowledge Graph UI | | |
| 7.3 | /admin/product-intelligence — must NOT be accessible | Navigate directly to vyaparsethu.com/admin/product-intelligence | 404 page (or redirect), not the Product Intelligence UI | | |
| 7.4 | /admin/industry-intelligence — must NOT be accessible | Navigate directly to vyaparsethu.com/admin/industry-intelligence | 404 page (or redirect), not the Industry Intelligence UI | | |
| 7.5 | /admin/morning-brief — must NOT be accessible | Navigate directly to vyaparsethu.com/admin/morning-brief | 404 page (or redirect), not the Morning Brief UI | | |
| 7.6 | /smart-matching — must NOT be accessible to public users | While logged out (or as a non-admin), navigate to vyaparsethu.com/smart-matching | 404 page — not reachable without admin session + SHAP_ENABLED flag | | |
| 7.7 | /product-intelligence — must NOT be accessible | Navigate directly to vyaparsethu.com/product-intelligence | 404 page, not the Product Intelligence index | | |
| 7.8 | /product-intelligence/fabric-sample-books — must NOT be accessible | Navigate directly to vyaparsethu.com/product-intelligence/fabric-sample-books | 404 page, not a product detail page | | |
| 7.9 | /industrial-cluster/bhiwandi-textile-cluster — must NOT be accessible | Navigate directly to vyaparsethu.com/industrial-cluster/bhiwandi-textile-cluster | 404 page, not the cluster detail page | | |

## Section 8 — API Health Checks

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 8.1 | GET /api/health — returns JSON, status 200 | Open vyaparsethu.com/api/health | Status 200; JSON includes `configured: { razorpay: true }`, `database: {...}` | | |
| 8.2 | GET /api/categories — returns category list, status 200 | Open vyaparsethu.com/api/categories | Status 200; JSON array/object of categories returned | | |
| 8.3 | GET /api/marketplace/suppliers — returns supplier list | Open vyaparsethu.com/api/marketplace/suppliers | Status 200; JSON list of suppliers returned | | |
| 8.4 | POST /api/auth/otp/send — returns 200 (do not use real number) | Send a POST request to /api/auth/otp/send with a test/dummy number (e.g. via curl or Postman) | Status 200 response; do NOT use a real phone number for this check | | |
| 8.5 | GET /api/admin/stats — returns 200 (admin auth required) | With a valid admin session/token, request /api/admin/stats | Status 200 with stats JSON; without admin auth, should reject (401/403) | | |

## Section 9 — Mobile Validation (Android Chrome)

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 9.1 | Homepage loads correctly on mobile | On Android Chrome, open vyaparsethu.com | Homepage renders correctly, no layout breakage | | |
| 9.2 | Supplier registration flow works on mobile | Repeat Section 1's flow on Android Chrome | Full flow completes as in Section 1 | | |
| 9.3 | RFQ creation works on mobile | Repeat Section 3's flow on Android Chrome | Full flow completes as in Section 3 | | |
| 9.4 | OTP input works on mobile keyboard | During OTP entry on mobile, observe the keyboard and input field | Numeric keyboard appears (if applicable), digits enter correctly | | |
| 9.5 | All buttons are tappable (minimum 44px touch target) | Tap through primary buttons across key pages (register, RFQ, payment) | All buttons register taps reliably without mis-taps | | |
| 9.6 | No horizontal scroll on any page | Swipe/scroll horizontally on homepage, registration, RFQ, dashboard | No horizontal scroll/overflow on any page | | |
| 9.7 | Admin panel loads on mobile (basic check) | On Android Chrome, open /admin/login and log in | Admin shell loads and is at least minimally usable on mobile | | |

## Section 10 — Communications

| # | Test | Steps | Expected Result | Pass/Fail | Notes |
|---|------|-------|-----------------|-----------|-------|
| 10.1 | OTP SMS is received (MSG91 live) | Complete any OTP-triggering flow with a real number | SMS arrives from the configured MSG91 sender ID | | |
| 10.2 | Welcome email is received after registration (Brevo SMTP) | Complete a full registration (supplier or buyer) with a real email address | Welcome email arrives in inbox within a few minutes | | |
| 10.3 | Email sender shows correct from address | Open the received welcome email | "From" address matches the expected VyaparSethu/Bell24h sending domain | | |
| 10.4 | Email is not in spam folder | Check both inbox and spam/junk folder | Email lands in the primary inbox, not spam | | |

---

## Summary

- **Total tests:** 68
- **Critical (must pass before any outreach):** Sections 1, 2, 3, 6, 7
- **Important (should pass before pilot):** Sections 4, 5, 8, 10
- **Nice to have (fix after pilot):** Section 9

## Instructions for the founder

1. Open vyaparsethu.com on desktop Chrome
2. Open the same URL on your Android phone in Chrome
3. Go through each test in order
4. Mark PASS or FAIL
5. Add notes for anything unexpected
6. Return all FAILs to Claude Code as a single list
7. Do NOT onboard any real user until Sections 1, 2, 3, 6, 7 all PASS
