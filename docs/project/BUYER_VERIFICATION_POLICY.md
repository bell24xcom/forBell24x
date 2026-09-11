# Buyer Verification Policy

**Source:** SPRINT-STDV-04, Task 3, cross-referenced with P3 and this sprint's onboarding review. Evidence-only.

---

## The Verified Buyer badge

**What it is:** A badge shown on an RFQ's browse-list card and detail page when the RFQ's creator has at least one `KycDocument` row with `status === 'VERIFIED'`.

**What sets it:** A real, human admin review — confirmed via a live review pathway in `src/app/api/admin/users/route.ts`. There is no automated path to `VERIFIED` status on a `KycDocument`.

**Implementation:** `src/lib/rfq/trustBadges.ts`, `getVerifiedBuyerIds()`.

## What "Verified" means

A specific admin has reviewed at least one document this buyer uploaded and marked it `VERIFIED` in the `kyc_documents` table, with `reviewedByUserId` and `reviewedAt` populated on that row.

## What "Verified" does NOT mean

- **It does not mean the buyer has completed phone-OTP login.** That is a separate field, `User.isVerified`, which is set `true` on every successful OTP login/signup and is hardcoded `true` on seeded/demo supplier accounts at creation. It carries no verification signal and is deliberately **not** used for this badge — using it would show "Verified" on nearly every account, real or demo, equally. This was the central finding of the P3 audit.
- **It does not mean GST-verified.** No `gstVerified` field exists anywhere in the schema. See "GST verification — current state" below for what actually happens with GST numbers.
- **It does not mean the buyer's identity has been cross-checked against government records.** KYC document review, as implemented, is a human looking at an uploaded document — not an API call to any registry.

## GST verification — current state (found during this sprint's onboarding review)

This affects the **supplier** onboarding flow, not the buyer-facing badge above, but belongs in this policy since it's the same category of claim.

- `POST /api/gst/verify` does attempt a real external lookup (`api.taxpayerapi.in`) and can return real government-sourced data (legal name, trade name, status) when that call succeeds.
- When the external call fails or times out (4-second timeout to a third-party API), the route falls back to format-only validation but still returns `success: true` — it separately and correctly sets `verified: false` in that case.
- **Defect:** the onboarding page's frontend checks `data.success || data.verified` (`src/app/supplier/onboarding/page.tsx:106`) — so the fallback (format-only) response still flips the UI's `gstVerified` state to `true` and shows "GST verified successfully" / "Get Verified ✓ badge," contradicting the backend's own `verified: false`.
- **Consequence, more serious than a wording issue:** that client-side `gstVerified` boolean is sent as-is to `POST /api/supplier/onboarding` and trusted without server-side re-verification — `if (gstNumber && gstVerified) trustBonus += 30;` (`src/app/api/supplier/onboarding/route.ts:43`). This directly inflates the real `trustScore` field (the same field the admin dashboard's "high-trust supplier" count reads) from a claim the server never independently confirmed, and which a client could set to `true` regardless of whether `/api/gst/verify` was ever called at all.

**Recommendation, not implemented this sprint:** the onboarding frontend condition should check `data.verified` alone, not `data.success || data.verified`; the trust-bonus calculation should be moved server-side, re-checking the GST API result at submission time rather than trusting a client-supplied boolean.

## Verified vs. Unverified — summary

| | Verified | Unverified |
|---|---|---|
| Buyer badge on an RFQ | ≥1 `KycDocument` with `status: 'VERIFIED'`, admin-reviewed | No such document, or none reviewed yet |
| Supplier's own `trustScore` GST component | *Should* mean government lookup succeeded — **currently does not reliably**, see defect above | Self-reported GST, no lookup attempted or lookup failed honestly |
