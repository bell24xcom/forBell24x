# STDV-06 — Trust Integrity & Quote Acceptance Verification

**Mode:** Read-only, no code/DB/commit changes. Every claim tagged OBSERVED, INFERRED, or UNKNOWN. Old findings were re-verified fresh, not repeated — one of them (RFQ-to-supplier matching) turned out to be **wrong** in prior reports; corrected below.

**Repo:** bell24h/VyaparSethu · **Branch:** main · **Date:** 2026-08-26

---

## 1. GST Integrity Audit

**Frontend Logic (OBSERVED):** `src/app/supplier/onboarding/page.tsx:106`
```ts
if (data.success || data.verified) { setGstVerified(true); ... }
```
`/api/gst/verify` returns `success: true` on *both* the real-verification path and the format-only fallback path (only `verified` differs between them) — so this OR condition sets `gstVerified = true` in both cases.

**Backend Logic (OBSERVED):** `src/app/api/gst/verify/route.ts:44-90`. Attempts a real external lookup (`api.taxpayerapi.in`, 4s timeout). Success path: `{ success: true, verified: true, gstData: {...real government fields...} }`. Fallback path (external call fails/unreachable/times out): `{ success: true, verified: false, gstData: { status: 'Format Valid', ... } }` — correctly distinguishes the two cases on its own side.

**Trust Score Logic (OBSERVED):** `src/app/api/supplier/onboarding/route.ts:14,43`. `gstVerified` is destructured directly from the client-sent request body and used with **zero server-side re-check** against the actual `/api/gst/verify` result: `if (gstNumber && gstVerified) trustBonus += 30;`.

**Answers to the five questions, all OBSERVED:**
- Can a failed GST lookup still display "GST Verified"? **Yes** — the frontend OR-bug does this on every fallback response.
- Can a client-controlled value increase trustScore? **Yes** — `gstVerified` is client-supplied and trusted as-is.
- Is server-side revalidation performed? **No** — confirmed, no second call to the GST API or any check in `supplier/onboarding/route.ts`.
- Can trustScore be manipulated without a real GST verification? **Yes** — a client could POST `gstVerified: true` to `/api/supplier/onboarding` directly, without ever calling `/api/gst/verify`, and receive the +30 bonus.

### GST INTEGRITY REPORT
```
Frontend Logic:  data.success || data.verified — true on both real and fallback responses
Backend Logic:   /api/gst/verify correctly distinguishes verified vs. format-only; the bug is
                 entirely in how the frontend consumes that distinction
Trust Score Logic: trustBonus computed from a client-supplied boolean, never re-verified server-side

Exploitable: YES
Severity: HIGH
  (not CRITICAL — this inflates a reputation score, not funds or access control;
   not LOW/MEDIUM — it is a real, straightforward, unauthenticated-logic manipulation
   of a number the platform uses to signal trust)

Evidence:
  src/app/supplier/onboarding/page.tsx:106
  src/app/api/gst/verify/route.ts:44-90
  src/app/api/supplier/onboarding/route.ts:14,43
```

---

## 2. Supplier Verified Badge Audit

**UI Condition (OBSERVED):** `src/app/rfq/[id]/page.tsx:438`
```tsx
{quote.supplier?.isVerified && <span>Verified ✓</span>}
```

**API Response shape (OBSERVED):** `src/app/api/rfq/[id]/quotes/route.ts:42-50`
```ts
supplier: { select: { id: true, name: true, company: true, city: true, trustScore: true } }
```
`isVerified` is not in this select — confirmed by direct re-read, not inferred.

### SUPPLIER VERIFIED BADGE
```
UI Condition:   quote.supplier?.isVerified
API Response:   { id, name, company, city, trustScore } — no isVerified field
Field Present:  NO
Badge Reachable: NO — quote.supplier.isVerified is always undefined at runtime

Status: DEAD CODE

Evidence:
  src/app/rfq/[id]/page.tsx:438
  src/app/api/rfq/[id]/quotes/route.ts:21-54
```

---

## 3. Quote Acceptance Flow Verification

**⚠️ Correction to prior sprints' reports:** earlier findings stated "no automated matching pushes RFQs to suppliers." That was **wrong** — re-verified this pass by actually reading `lib/orchestration.ts` and its call sites, which prior passes never did (only a code comment referencing it had been seen). The correct picture is more specific: **one** orchestration event is wired up and functional; **four** others exist, fully built, but are never called by any live route.

**Route map (OBSERVED):**

| Step | Route | Orchestration call | Wired? |
|---|---|---|---|
| RFQ creation | `POST /api/rfq/create` | `onRFQCreated()` | **YES** — `route.ts:108` |
| RFQ listing | `GET /api/marketplace/rfqs`, `GET /api/rfq/[id]` | none | n/a (read-only) |
| Quote submission | `POST /api/supplier/quotes` | none — confirmed no `lib/orchestration` import anywhere in this file | **NO** |
| Quote review (buyer) | `GET /api/rfq/[id]/quotes` | none | n/a (read-only) |
| Quote acceptance | `POST /api/deal/select` | none — confirmed no `lib/orchestration` import in this file | **NO** |
| Deal completion | `POST /api/deal/[id]/complete`, `POST /api/rfq/complete` | `onDealCompleted()` | **YES** — both files import and call it |

**What `onRFQCreated` actually does (OBSERVED, `lib/orchestration.ts:167-244`):** scores all active suppliers (category match +3, location +3, city preference +2, category history +2, trust score ≥70 +2, verified +1, prior accepted quote +1), takes the top 15, writes a real `Notification` row to each (`prisma.notification.create`), writes a confirmation `Notification` to the buyer, attempts an n8n webhook (see below), attempts an email via a **local stub** (see below).

**What `onQuoteAccepted` would do if it were called (OBSERVED, defined but dead, `lib/orchestration.ts:341-462`):** sets `RFQ.status = ACCEPTED`, **and marks every other PENDING quote on that RFQ as REJECTED** (`prisma.quote.updateMany`), bumps the winning supplier's trust score +5, auto-creates an opening `Message` thread between buyer and supplier, notifies both parties, schedules a 7-day deal-check notification. None of this executes today — `/api/deal/select` (the live route) does none of it; it only creates the `Deal` row and sets `Quote`/`RFQ` status directly.

**Answers, all OBSERVED against the live route (`/api/deal/select`), not the dead orchestration function:**
- What happens when buyer accepts? A `Deal` row is created (`buyerId`, `supplierId`, `price`, `status: ACTIVE`); `Quote.status → ACCEPTED`; `RFQ.status → ACCEPTED`. Internal BOM life-events logged (non-user-facing analytics).
- What DB records change? `Deal` (new row), `Quote` (this one), `RFQ` (status only).
- Are suppliers notified? **No** — for either the winner or the others.
- Do buyer details become visible? No *new* information — buyer name/company/location were already visible on the RFQ page before acceptance (per the P3 visibility work).
- Are rejected suppliers updated? **No** — their `Quote.status` remains `PENDING` indefinitely, even after the RFQ itself is `ACCEPTED`. The code that would fix this (`onQuoteAccepted`'s `updateMany`) exists and is correct, but isn't called.

### QUOTE ACCEPTANCE FLOW
```
Observed Route Map: see table above
Observed Status Changes: Deal created; Quote → ACCEPTED (winner only); RFQ → ACCEPTED
                          Other suppliers' quotes stay PENDING — not updated
Observed Notifications: None on accept, for anyone, via the live route
Observed Contact Sharing: None new — same buyer info already shown pre-acceptance

Unknown Areas:
  - Whether /api/deal/select was deliberately built to bypass orchestration.ts,
    or whether it's an older/newer route that never got wired up — no comment
    in either file explains the split. INFERRED: given onDealCompleted (a later
    stage) IS wired up in two other routes, this looks like an incomplete
    migration rather than an intentional design choice, but that's inference,
    not something the code states.
  - Whether onCounterOffer is reachable from any negotiation UI — a
    "/negotiation" page is referenced in orchestration.ts's own email HTML,
    but no route calling onCounterOffer was found in this pass. UNKNOWN.
```

---

## 4. Notification Infrastructure Audit

**Email (OBSERVED, two separate paths exist):**
- `lib/orchestration.ts:28-31` defines a **local stub**: `console.log('[EMAIL] Stub — to:', to, ...); return { success: true };` — used by every email call inside this file (`onRFQCreated`, `onQuoteSubmitted`, `onQuoteAccepted`, `onCounterOffer`). Even for `onRFQCreated`, the one live event, its email step is fake — logs to console, sends nothing, reports success anyway.
- `lib/email.ts`'s `sendEmail()` calls MSG91's email API for real (confirmed in an earlier sprint this session) — this is what `/api/supplier/quotes/route.ts` uses for its one real email (buyer notification on quote submission, skipped for seeded RFQs).

**SMS (OBSERVED):** MSG91 OTP API, used only for login/auth OTPs (`src/app/api/auth/otp/*`) — not used for any of the events in this audit's scope (submission/acceptance/rejection/lead-unlock/RFQ-creation).

**WhatsApp (OBSERVED):** Only wired to supplier *acquisition* (outreach templates, fixed in P1) — not to any transactional event (quote submitted, accepted, etc.). No WhatsApp send exists anywhere in `lib/orchestration.ts` or the live quote/deal routes.

**In-app notifications (OBSERVED):** `Notification` model, written via `createNotification()` inside `lib/orchestration.ts`, read via `GET /api/notifications`, displayed at `src/app/notifications/page.tsx` — a real, working, end-to-end path, but only for the one event (`onRFQCreated`) that's actually called.

**n8n (OBSERVED):** `lib/n8n-trigger.ts`'s `N8NMarketing.sendToN8N()` early-returns if `N8N_WEBHOOK_URL` is unset — confirmed absent from `.env.local` this pass. Every `safeN8N(...)` call in `orchestration.ts` is therefore a silent no-op in this environment. Consistent with the project's own stated architecture ("no n8n in production").

**Bell24h-OS communication hooks (UNKNOWN):** not investigated this pass — out of the five channels named, this one wasn't traced; flagging rather than guessing.

### NOTIFICATION MATRIX

| Event | Channel | Status | Evidence |
|---|---|---|---|
| RFQ Creation | In-app | **Implemented** | `onRFQCreated` → `createNotification` × up to 16 rows, real UI at `/notifications` |
| RFQ Creation | Email | **Partially implemented** | Attempted, but the email function is a stub — nothing actually sends |
| RFQ Creation | n8n/WhatsApp | Not implemented | `N8N_WEBHOOK_URL` unset — silent no-op |
| Quote Submission | Email (to buyer) | **Implemented** | `/api/supplier/quotes/route.ts`, real MSG91 email via `lib/email.ts`, skipped for seeded RFQs |
| Quote Submission | In-app (to either party) | Not implemented | `onQuoteSubmitted` exists, never called |
| Quote Submission | Confirmation to supplier (any channel) | Not implemented | Confirmed in prior sprint, re-confirmed this pass |
| Acceptance | Any channel, either party | Not implemented | `onQuoteAccepted` exists, never called from `/api/deal/select` |
| Rejection (other quotes on an accepted RFQ) | Any channel | Not implemented | Status isn't even updated, let alone notified |
| Lead Unlock | Any channel | Not implemented | No notification of any kind in `src/app/api/leads/unlock/route.ts` |
| Deal Completion | In-app + email | **Implemented** | `onDealCompleted`, wired from two routes, real in-app notification; email uses the same stub as above, so **partially** on the email leg specifically |

---

## 5. WhatsApp Readiness — Meta Cross-Check

**Cannot be completed from this session.** This section requires live browser access to Meta Business Manager / Meta for Developers, which this Claude Code session does not have — confirmed earlier this sprint (navigating to `business.facebook.com` redirected straight to a login page, no authenticated session). That data exists in the separate, browser-connected session working Track B.

```
WHATSAPP CLOUD API STATUS
Business:  UNKNOWN (from this session)
App:       UNKNOWN
WABA:      UNKNOWN
Phone:     UNKNOWN
Webhook:   UNKNOWN
Token:     UNKNOWN
Templates: UNKNOWN

Readiness: UNKNOWN — do not infer from this report; pull from the Track B session's own findings
```

---

## 6. Updated Trust Gap Register

| ID | Gap | Status | Severity | Evidence | Fix Status |
|---|---|---|---|---|---|
| G1 | Lead unlock 400s on every real click | **CLOSED** | — | `src/app/api/leads/unlock/route.ts` | Fixed, committed `7f3b3800` |
| G2 | Lead unlock had no auth check | **CLOSED** | — | same file | Fixed, same commit |
| G3 | RFQ list/detail buyer-visibility inconsistency | **CLOSED** | — | `src/app/api/marketplace/rfqs/route.ts`, `rfq/[id]/route.ts` | Fixed, committed `7f3b3800`, per your Option A decision |
| G4 | No `isSeeded` filter on RFQ listings | **PARTIAL** | Medium | `src/app/api/marketplace/rfqs/route.ts` (fixed) vs. `src/app/api/admin/rfqs/route.ts` (not touched) | Live supplier-facing endpoint fixed; admin management view still unfiltered |
| G5 | No notification on quote submission or acceptance | **OPEN** | High | This report, Part 3–4 | Not fixed — and now precisely scoped: 4 of 5 orchestration functions exist but are disconnected, not missing |
| G6 | No live DB credential this session | **OPEN** | Blocking | — | Still blocked; credential also needs rotation (exposed twice in transcript) |
| G7 | Stray F&F project files incl. plaintext password | **OPEN** | High | `data.js` etc., repo root | Flagged, not actioned |
| G8 | Orphaned duplicate drip-engine file | **OPEN** | Low | `src/lib/supplier-drip-engine.ts` | Flagged, not actioned |
| G9 (new) | GST verification trust-score exploit | **OPEN** | High | Part 1 of this report | Newly found this sprint, not fixed |
| G10 (new) | Supplier Verified badge is dead code | **OPEN** | Low (cosmetic — badge just never shows) | Part 2 of this report | Newly found this sprint, not fixed |
| G11 (new) | Rejected suppliers' quotes never updated after another quote wins | **OPEN** | Medium | Part 3 of this report | Newly found this sprint — code to fix this already exists (`onQuoteAccepted`), just needs wiring |
| G12 (new) | `onRFQCreated`'s email step is a stub — logs, sends nothing | **OPEN** | Medium | Part 4 of this report | Newly found this sprint |

---

## 7. Recommended Priority Order

1. **G9 (GST trust-score exploit)** — highest-severity new finding; a one-line frontend fix (`data.verified` instead of `data.success || data.verified`) plus moving the trust bonus calculation server-side closes it.
2. **G5 + G11 (wire up `onQuoteAccepted`)** — the code already exists and is correct; this is a "connect it" fix, not a "build it" fix, and it closes two gaps (notification + rejected-supplier status) at once.
3. **G6 (DB credential)** — still the single blocker on P2/P6 and on live-testing anything in this report.
4. **G4 (admin RFQ listing filter)** — small, same pattern as the fix already applied to the supplier-facing endpoint.
5. **G12 (real email in orchestration.ts)** — lower urgency; in-app notifications already work for the one live event, email is a secondary channel for it.
6. **G7/G8/G10** — low effort, no urgency, your call on timing.

Meta/WhatsApp readiness (Part 5) stays with the Track B session — not actionable from here.
