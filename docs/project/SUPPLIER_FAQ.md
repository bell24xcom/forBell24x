# Supplier FAQ

**Source:** SPRINT-STDV-04, Task 3. Every answer traces to actual code behavior — no marketing language, no claim that isn't backed by a specific file. See `SUPPLIER_TRANSPARENCY.md` for the underlying evidence.

---

**Why should I join?**
VyaparSethu is early-stage. The founder-led outreach message (fixed as of the P1 sprint) says this directly: "We're building this with Indian suppliers. Your feedback shapes the product." There is no claim of existing buyer volume in current outreach copy, because none can currently be backed with live data.

**Are buyers verified?**
Some are, some aren't, on a per-RFQ basis. As of P3, an RFQ shows a real "Verified Buyer" badge only when its creator has at least one admin-approved KYC document (`KycDocument.status === 'VERIFIED'`). There is no platform-wide claim that all buyers are verified — most RFQ-creator accounts do not have an approved KYC document.

**How do I get opportunities?**
By browsing `/supplier/browse-rfqs` or opening a direct RFQ link, then submitting a quote. There is no automated matching or notification system that pushes RFQs to suppliers — it is supplier-initiated browsing only.

**How do quotes work?**
One quote per RFQ. Price is required; quantity, timeline, notes, and terms are optional. A quote cannot be edited once submitted. No confirmation email or notification is sent on submission — check "My Quotes" to see its status.

**How are suppliers selected?**
The buyer who owns the RFQ manually reviews submitted quotes and accepts one. There is no automated ranking, scoring, or recommendation of suppliers to buyers in the code today.

**What is free?**
Browsing RFQs, viewing buyer information on an RFQ, and submitting quotes. All of this requires only a phone-OTP account — no payment anywhere in this flow.

**What is paid?**
Only lead unlock, which is a separate system from RFQs. 1 credit per unlock; credits purchased via Razorpay.

**How does lead unlock work?**
It unlocks a `Lead` record — not an RFQ's buyer contact, a distinct object in the schema. As of the P5 fix, the request is authenticated server-side; the credit balance is checked and decremented in a single database transaction.

**What does "GST Verified" mean if I see it?**
See `BUYER_VERIFICATION_POLICY.md` — this term should not currently be shown to anyone as a trust signal. If you see it, it does not mean what it implies; flagged as a defect, not a feature.
