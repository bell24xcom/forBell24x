# VyaparSethu — Production Readiness Status & Roadmap

**Date:** 2026-07-27
**Purpose:** Consolidated snapshot of tonight's production smoke test progress and the agreed priority order for what comes next. No code was changed to produce this document — status only.

---

## 1. Priority Order (agreed)

Rationale: establish a known-good production baseline before adding any new feature surface (Camera RFQ, SHAP/LIME, etc.).

| # | Priority | Status |
|---|---|---|
| 1 | Complete production smoke test | 🟡 In progress — see §2 |
| 2 | Fix any issues discovered | ⏸ Pending §1 completion |
| 3 | Freeze stable build (git tag, e.g. `v1.0.0-smoke-tested`) | ⏸ Pending |
| 4 | SEO investigation (479 URLs "Discovered — currently not indexed") | ⏸ Queued |
| 5 | Media Permission Engine | ⏸ Queued |
| 6 | Camera RFQ | ⏸ Queued |
| 7 | SHAP/LIME Explainability | ⏸ Queued |
| 8 | Patent / FTO review | ⏸ Queued |
| — | Commercial launch | ⏸ Queued |

---

## 2. Tonight's Smoke Test — Actual Results So Far

This is a partial run against the **concierge deal flow specifically**, not the full 13-module plan in §4 yet.

| Step | Result | Evidence |
|---|---|---|
| Admin login | ✅ PASS | Session persisted, no fresh OTP needed |
| RFQ creation via `/rfq/create` | ✅ PASS | `POST /api/rfq/create → 201`. Confirms tonight's earlier production fix (budget string→number conversion, uppercase urgency enum, Zod error details) works live through the real UI. RFQ `cms24i49c0001jv04ma0tz9a9`, cleaned up (`CANCELLED`) after verification. |
| Submit concierge quote via `/admin/rfqs` | ❌ **BLOCKED** | No UI exists anywhere in the live app. See §3. |
| Accept quote / Mark Paid / Transaction / Notifications / idempotency / email log | ⏸ Not reachable | All depend on a quote existing, which depends on the blocked step above |

**Interpretation:** this is not a regression or a code bug — it's a genuine, real product gap that a smoke test is supposed to surface. Better to find it now than after relying on the workflow with a live buyer.

---

## 3. Concierge Quote Gap — Investigation Findings

**Backend:** fully built, admin-gated, reviewed. `POST /api/admin/rfqs` with `action: 'submit-concierge-quote'` (`src/app/api/admin/rfqs/route.ts`).

**Frontend:** does not exist. Confirmed two ways:
- Live-codebase search for "concierge" (case-insensitive, all files): only backend logic, a buyer-side *display* badge for quotes already tagged `CONCIERGE_SOURCED`, and analytics-exclusion filters. Nothing that *submits* a quote. (One unrelated namesake file, `_archive/.../PremiumSupportConcierge.tsx`, is a different, legacy "premium support tiers" pricing UI — coincidental name collision.)
- Git history: the entire feature (schema fields, migration `0006_concierge_quotes`, the endpoint, analytics exclusions) landed in a single commit (`af57dee`) with no frontend page or component in that diff, or in any commit since. **Never built, not removed.**

**Stated intent** (from the endpoint's own doc-comment, the most authoritative in-repo source — no external "Master Strategy" or "Reevol" doc exists in this repository to check against):

> *"Staff enters a real quote, obtained off-platform... for bootstrapping liquidity before a supplier is actively self-serving on the platform."*

Reads as an admin-only, cold-start bridge tool — not stated as permanent, not formally sunset-dated either.

**Minimal build plan (not yet approved/built):** one "Submit Concierge Quote" button in the existing `/admin/rfqs` detail drawer → small inline form (supplier picker, price, required sourcing note ≥10 chars, optional quantity/terms/timeline) → calls the existing, unmodified endpoint. No new page, no backend changes.
```ts
POST /api/admin/rfqs
{ action: 'submit-concierge-quote', rfqId, supplierId, price, sourcingNote,
  quantity?, terms?, timeline?, deliveryDays?, notes? }
```

**Current decision point:** the user is testing the organic supplier-quote path in parallel (a real contact, outside Concierge) — so this gap is not blocking tonight's immediate need. Whether to build the minimal UI is a decision for later, based on how the organic path performs.

---

## 4. Full Smoke Test Plan (reference — not yet executed in full)

13 modules, to be run end-to-end once decided to proceed beyond tonight's concierge-flow check:

1. **Authentication** — Registration, OTP, Login, Logout, Session persistence, Forgot Password
2. **Buyer** — Create Organization, Complete Profile, Upload Logo, GST, Buyer Dashboard
3. **Supplier** — Registration, Profile, Categories, Capabilities, Dashboard
4. **RFQ** — Text, Image Upload, Document Upload, Multiple Attachments (defer Camera/Voice/Video); verify validation, DB records, storage, notifications
5. **AI Processing** (if implemented) — Summary, Category Detection, Requirement Extraction, Supplier Suggestions
6. **Supplier Matching** — receipt, filtering, categories, location, matching logic
7. **Quotation** — Submit, View, Accept, Reject
8. **Deal** — Creation, status changes, audit entries
9. **Notifications** — Email, in-app, logs
10. **Storage** — image/PDF/document uploads, file access permissions
11. **Security** — unauthorized access, RLS, RBAC, API authorization, file access control
12. **Database** — tables updated correctly, relationships, audit records, transactions
13. **Production Quality** — browser console, network errors, API failures, performance, mobile responsiveness

**Exit criteria** (all must pass before freezing the build):
- ✓ User can register · ✓ Buyer can log in · ✓ Supplier can log in
- ✓ Buyer creates RFQ · ✓ Files upload correctly · ✓ AI processes RFQ (if enabled)
- ✓ Supplier receives RFQ · ✓ Supplier submits quote · ✓ Buyer accepts quote
- ✓ Deal is created · ✓ Notifications work · ✓ Audit trail is recorded
- ✓ No critical production errors

---

## 5. Reference — QA Lead Prompt Template (for running the full smoke test later)

Rules to keep the test objective and prevent accidental changes:
1. Do not modify source code · 2. Do not commit · 3. Do not redesign architecture
4. Do not install new packages · 5. Do not change database schema · 6. Do not refactor
7. Only investigate and test · 8. Collect evidence for every test
9. If defects are found, stop and report before fixing anything

Phases: (1) system summary, (2) numbered test plan for approval — Test ID / Objective / Steps / Expected Result / Actual Result / Evidence Required / Severity — (3) execute every test after approval, never skip, never assume a pass, collect screenshots/logs/API responses.

Output format: Executive Summary → Smoke Test Checklist → Test Results → Critical/High/Medium/Low Issues → Go/No-Go Recommendation → Production Readiness Score.

---

## 6. What's Next

Two independent things are in flight, neither blocking the other:
- User is testing the **organic** supplier-quote path live (real contact, outside Concierge).
- Concierge minimal-build decision is pending that result.

No further smoke-test modules (§4) have been run yet beyond the concierge-flow check in §2. Full end-to-end run is queued once this decision point resolves.
