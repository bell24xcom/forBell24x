# Supplier Transparency Report

**Source:** SPRINT-STDV-04, Tasks 1–2. Evidence-only — every line below traces to a specific file. No live database access this session; nothing here is a count or estimate.

**Last verified:** 2026-08-26, against `main` post-P3/P5 commits (`7f3b3800`, `42d1566f`).

---

## What a supplier sees

### Browse list — `/supplier/browse-rfqs` → `GET /api/marketplace/rfqs`

Shown: RFQ title, buyer company name, category, urgency, type (voice/video/text), location, budget, quote count, created time, quote deadline, a "Demo RFQ" badge (if `isSeeded`), a "Verified Buyer" badge (if the RFQ's creator has an admin-approved KYC document).

Excluded by default: seeded/demo RFQs (opt back in via a "Show demo RFQs" checkbox, which sets `?includeDemos=true`).

### RFQ detail page — `/rfq/[id]` → `GET /api/rfq/[id]`

Shown: everything above except quote count and deadline (see below), plus the buyer's full name (not just company) and the buyer's own location field.

**No login is required to view any of this.** The endpoint has no authentication check — buyer company, name, and location are visible to anyone with the link, including a search-engine crawler.

### Inconsistency between the two views

| Field | List | Detail |
|---|---|---|
| Buyer name | Not rendered (though the API returns it as of P3) | Shown |
| Quote deadline (`expiresAt`) | Shown | **Not returned by the API at all** |

The list and detail endpoints were built independently and drifted — worth reconciling, not treated as intentional design.

## What a supplier never sees, anywhere

- GST number or GST verification status of the buyer. Neither API route selects `gstNumber` from the buyer's `User` record. Confirmed no `gstVerified` field exists in the schema at all (see `BUYER_VERIFICATION_POLICY.md`).
- Buyer phone or email.
- How many other suppliers have already quoted, or what they quoted.
- Why a buyer is or isn't marked "Verified" — the badge is binary, no explanation shown.

## When details become visible

Nothing on the RFQ side is gated behind quoting or login — buyer identity is either shown to everyone (detail page) or shown to no one (list page), not staged behind an unlock action. The only real gate in the product is **submitting a quote**, which requires a phone-OTP login.

## How quote submission works

`POST /api/supplier/quotes`. Required: `rfqId`, `price`. Optional: `quantity` (defaults to the RFQ's own), `deliveryDays`, `notes`, `terms`, `timeline`, `description`. Blocked: quoting on your own RFQ, submitting a second quote on the same RFQ. Not possible: attaching a file (no such field exists on the `Quote` model). Not possible: editing a quote after submission (no update route exists for an individual quote).

**No confirmation is sent after submission** — no email, no in-app notification. The supplier finds out only by reopening `/supplier/my-quotes`. The same is true in the other direction: when a buyer accepts a quote (`POST /api/deal/select`), nothing notifies the supplier either.

## How lead unlock works

`POST /api/leads/unlock`. Entirely separate system from RFQs — it unlocks a `Lead` record (a different model), not an RFQ's buyer contact. Credit-gated: 1 credit per unlock. Credits purchased via Razorpay: ₹1,000/2 credits, ₹5,000/12, ₹10,000/30. As of the P5 fix, `supplierId` is derived from the authenticated session — previously the live UI never sent it at all, so every real unlock attempt failed with a 400.
