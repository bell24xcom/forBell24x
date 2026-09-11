# H6-12 — VyaparSethu WhatsApp Cloud API Integration Readiness + Admin Foundation

**Scope:** VyaparSethu only. **Role:** Implementation Chief Engineer.
**Date:** 2026-08-16
**Repository:** `C:\Users\Sanika\Projects\bell24h` · GitHub: `bell24xcom/forBell24x`

---

## 1. Repository Baseline

| Item | Value |
|---|---|
| Branch | `main` |
| Remote | `https://github.com/bell24xcom/forBell24x.git` |
| HEAD | `7661194939e5467fa3aac4bfdcedb4878bbb4607` |
| `origin/main` | `7661194939e5467fa3aac4bfdcedb4878bbb4607` (HEAD matches origin — up to date) |
| Working tree | **Not clean at sprint start** — `src/app/features/voice-rfq/page.tsx` modified (pre-existing, unrelated, not touched by this sprint), plus a long list of pre-existing untracked docs/recovery files and `public/voice-rfq-demo*` assets from prior sessions. None of these were created or modified by H6-12. |

---

## 2. Existing WhatsApp Implementation Audit

Two **completely separate** WhatsApp code paths exist in this repository. Conflating them would misstate what is actually live.

### 2a. MSG91-mediated WhatsApp outreach — **LIVE / CONFIGURABLE**

This is a real, working, currently-shipping feature. It does **not** call Meta's Graph API directly — MSG91 acts as the WhatsApp Business Solution Provider (BSP) intermediary.

| Component | File | Classification |
|---|---|---|
| Bulk-send + daily quota API | `src/app/api/admin/outreach/bulk-wa/route.ts` | **IMPLEMENTED** — calls `https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/` when `MSG91_WA_AUTH_KEY`, `MSG91_WA_PHONE`, `MSG91_WA_TEMPLATE` are all set; falls back to generating `wa.me` click-to-chat links otherwise |
| Outreach stats API | `src/app/api/admin/outreach-stats/route.ts` | **IMPLEMENTED** — reads `InteractionMemory` rows (`day1_wa_sent`, follow-ups, drip, conversions) |
| Admin UI | `src/app/admin/outreach/page.tsx` (nav: "WhatsApp Outreach") | **IMPLEMENTED** — quota bar, bulk-send trigger, WhatsApp "Dialer" (opens `wa.me` links with auto-advance), CSV export, funnel stats |
| Env vars | Documented in `.env.example` | `MSG91_WA_AUTH_KEY`, `MSG91_WA_PHONE`, `MSG91_WA_TEMPLATE` — **NOT CONFIGURED** in this deployment (no values present); feature runs in wa.me-link-only mode until set |

This is TRAI-safe (50 messages/IST-day cap), writes attribution to `InteractionMemory`, and is unrelated to the Meta Cloud API app referenced in this sprint's brief.

### 2b. Direct Meta Graph API code — **DEAD CODE (all of it)**

The following files reference WhatsApp and *look* like a Meta Cloud API integration, but are confirmed dead: not imported by any file under `src/app/`, not reachable from the Next.js build, and in several cases would not even compile/run standalone.

| File | Classification | Evidence |
|---|---|---|
| `src/services/whatsapp/WhatsAppService.ts` | **DEAD CODE** | Imports `../../config` (no `config` index exists at that path) and `../../utils/logger` (module does not exist anywhere in the repo). Not imported by any file in `src/app`. |
| `src/services/whatsapp/TemplateManager.ts` | **DEAD CODE** | Imports `../cache/RedisService` — Redis is not a runtime dependency of this app. Not imported outside its own package. |
| `src/services/whatsapp/MediaHandler.ts` | **DEAD CODE** | Imports `../storage/S3Service`, uses Node-only `FormData`/Buffer patterns inconsistent with the Edge/Node split Next.js route handlers need. Not imported anywhere. |
| `src/routes/whatsapp.ts` | **DEAD CODE** | Express `Router` — this project has **no `express` dependency** in `package.json` and no server entry point (`src/server.ts`/`index.ts`) that could mount it. Pure leftover scaffold. |
| `src/models/Settings.ts`, `src/models/Conversation.ts` | **DEAD CODE** | Mongoose schemas — this project uses Neon PostgreSQL + Prisma exclusively; `mongoose` is not a dependency. |
| `src/services/traffic/routers/MessageRouter.ts` (+ sibling `TrafficManager.ts`, `LoadBalancer.ts`, `QueueManager.ts`) | **DEAD CODE / MOCK** | Full agent-routing/call-center simulation with explicit placeholder bodies (`// This is a placeholder implementation`, `simulated assignment delay`). Fails `tsc` on its own (missing exports, type mismatches). Not imported anywhere. |

**Conclusion:** there is no existing direct-Meta integration to build on. H6-12 starts from zero on the Meta Cloud API side. The dead files above were left untouched — no deletions, no edits — per the sprint's strict-scope rule.

### 2c. Other audit answers

| Question | Answer |
|---|---|
| D. MSG91 used for WhatsApp/SMS/OTP/outreach? | Yes — OTP via `src/lib/services/msg91-service.ts` (SMS), WhatsApp outreach via `MSG91_WA_*` (§2a). Two separate MSG91 integrations. |
| E. Is Twilio present? | Only as an **optional, unconfigured** SMS alert channel inside `src/lib/security/securityMonitoring.ts` (reads `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_FROM_NUMBER`, all unset). Not a WhatsApp provider, not used for outreach or notifications. |
| F. Existing provider abstraction? | No pre-existing provider-agnostic messaging boundary. This sprint introduces one for WhatsApp specifically (`src/lib/whatsapp/`). |
| G. `src/services/whatsapp/` equivalent? | Exists but dead (§2b). |
| J. WhatsApp used for OTP / RFQ / supplier / buyer notifications? | No — OTP uses SMS via MSG91 only (`src/lib/otp-service.ts`, `src/lib/services/msg91-service.ts`). WhatsApp is outreach-only (§2a). |
| K/L. Admin WhatsApp page + nav entry? | Yes — `/admin/outreach`, "WhatsApp Outreach" (§2a). This sprint adds a second, clearly distinct nav entry (§5). |
| M. Message templates? | Implemented for MSG91 outreach (one approved template name, referenced via env var). No template CRUD UI exists for either path. |
| N. Message history? | `InteractionMemory` rows for outreach only (§2a). No general WhatsApp conversation history. |
| O. Delivery statuses stored? | No, for either path. |
| P. Webhook handling? | No webhook route existed for WhatsApp before this sprint (only `src/app/api/webhooks/resend/route.ts`, for email). |
| Q. Test-send? | No, for either path, before this sprint. |

---

## 3. Meta Cloud API Contract (Phase 2)

Implemented boundary, exactly as specified:

```
VyaparSethu Business Logic
        │
        ▼
src/lib/whatsapp/WhatsAppService.ts     (business-facing: sendTextMessage, sendTemplateMessage, getStatus)
        │
        ▼
src/lib/whatsapp/MetaWhatsAppProvider.ts (low-level HTTP boundary — the only module that builds graph.facebook.com requests)
        │
        ▼
Meta WhatsApp Cloud API (graph.facebook.com/v21.0/{phone_number_id}/messages)
```

`src/lib/whatsapp/config.ts` centralizes env-var reads and exposes only booleans/safe strings (`getSafeStatus()`) to callers — no function in this module set returns a secret value. `src/lib/whatsapp/webhook.ts` holds signature/handshake verification, kept separate so the webhook route stays thin.

No Bell24h-OS integration, no Communication Hub, and no S2S auth were added — the service is deliberately provider-swappable *later*, not wired to anything today.

---

## 4. Environment Variables (Phase 3)

Added to `.env.example` only — **no real values exist anywhere in this repository**:

| Variable | Required for | Status |
|---|---|---|
| `META_WHATSAPP_ACCESS_TOKEN` | Sending | NOT CONFIGURED |
| `META_WHATSAPP_PHONE_NUMBER_ID` | Sending | NOT CONFIGURED (this is a Meta-assigned ID, distinct from the WABA phone number `+91 77159 12764`) |
| `META_WHATSAPP_BUSINESS_ACCOUNT_ID` | Sending | NOT CONFIGURED (WABA ID `1576973140725245` is known but not yet set as an env var anywhere) |
| `META_WHATSAPP_APP_SECRET` | Webhook signature verification | NOT CONFIGURED |
| `META_WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Webhook subscription handshake | NOT CONFIGURED |

Naming follows the `MSG91_WA_*` precedent already in `.env.example` (feature-scoped prefix) rather than colliding with it. No existing variable name was reused, duplicated, or renamed.

---

## 5. WhatsApp Service Architecture (Phase 4) — files added

| File | Purpose |
|---|---|
| `src/lib/whatsapp/config.ts` | Env-var reader; `getSendReadiness()`, `getWebhookReadiness()`, `getSafeStatus()` — never returns secret values |
| `src/lib/whatsapp/MetaWhatsAppProvider.ts` | `sendTextMessage()`, `sendTemplateMessage()` — the only module that calls `graph.facebook.com` |
| `src/lib/whatsapp/WhatsAppService.ts` | Business-facing facade; normalizes results into `SENT / NOT_CONFIGURED / META_ERROR`; distinguishes config errors from Meta API errors; logs only redacted recipient (`***1234`), never body/token |
| `src/lib/whatsapp/webhook.ts` | `verifyHandshake()`, `verifySignature()` (HMAC-SHA256, constant-time compare), `extractDeliveryStatuses()` |

`sendTextMessage()`/`sendTemplateMessage()` in `WhatsAppService` explicitly satisfy the Phase 4 requirement to "distinguish configuration errors from Meta API errors": a missing env var surfaces as `WhatsAppConfigError` → `NOT_CONFIGURED` (nothing was ever sent), while a rejected/failed Meta call surfaces as `MetaApiError` → `META_ERROR` with the HTTP status and Meta's own error code — these are never collapsed into one generic failure.

`getMessageStatus()` was **not** implemented. This was checked, not assumed: `grep -ri "message status|delivery status|read receipt|delivery tracking" docs/` turned up two relevant prior findings. `docs/architecture/VYAPARSETHU_OS_INTEGRATION_READINESS_AUDIT.md` §11 states the target principle explicitly — "VyaparSethu owns message *meaning*... Bell24h-OS owns *transport* (provider routing, retry, fallback, **delivery status**, webhooks, credentials)" — i.e. delivery-status polling/storage is scoped to the future Communication Hub, which this sprint is explicitly forbidden from building. `docs/architecture/VYAPARSETHU_H6_08_FINAL_FREEZE_AND_UI_GAP_BASELINE.md` independently marks delivery-status tracking for the *existing* MSG91 outreach path as **UNKNOWN/not implemented, P2 — confirm/close if outreach volume grows** — i.e. no live requirement currently depends on it either. No requirement for status *polling* was found anywhere; Meta's webhook push (§7) is the intended near-term mechanism instead. `handleWebhook()` exists as the webhook route itself (§7), not as a separate service method, since it only needs to normalize and log — no business action to dispatch yet.

---

## 6. Admin WhatsApp State (Phase 5)

**Before this sprint:** one WhatsApp admin surface, `/admin/outreach` ("WhatsApp Outreach"), covering the MSG91 path only (§2a). No admin UI existed for a direct-Meta integration.

**Added this sprint:** `/admin/whatsapp-cloud-api` ("WhatsApp Cloud API (Meta)"), a new nav entry placed directly below "WhatsApp Outreach" in `src/app/admin/layout.tsx`, with an on-page link back to `/admin/outreach` and explicit copy distinguishing the two ("transactional infrastructure, separate from WhatsApp Outreach (MSG91-based bulk campaigns)") so a founder skimming the sidebar cannot conflate them.

Page shows: Status badge (`READY` / `NOT_CONFIGURED`), Provider, Phone/WABA/Token configured-or-not (booleans only — never the values), a Capabilities checklist (Text Message / Template Message / Webhook / Delivery Status), and a Test Send panel. No secret value is rendered anywhere on this page or returned by its backing API route.

Currently renders: **Status: NOT_CONFIGURED**, all capabilities **Not available**, Test Send **not available** — accurate given zero credentials are configured.

---

## 7. Webhook Readiness (Phase 7)

Added `src/app/api/webhooks/meta-whatsapp/route.ts`:
- `GET` — Meta's `hub.mode`/`hub.verify_token`/`hub.challenge` handshake. Returns `403` unconditionally while `META_WHATSAPP_WEBHOOK_VERIFY_TOKEN` is unset (it is, today).
- `POST` — verifies `X-Hub-Signature-256` via `META_WHATSAPP_APP_SECRET`; returns `401` and processes nothing while that secret is unset (it is, today). When configured, it only normalizes delivery statuses and logs a count — **no DB write, no business action** — per the "do not trigger business actions blindly" instruction.

This is readiness infrastructure only. It has not been registered in the Meta App dashboard (no callback URL/verify token has been entered there) — that remains a manual Meta-side step.

**Open question for H6-13, not verified this sprint:** the POST handler currently returns `401` for any unverified request, including once a signature secret *is* configured but an unrecognized/malformed event arrives. Whether Meta's dashboard verification test or webhook subscription tooling expects a `200` for certain unrecognized-but-well-formed event types (as opposed to truly invalid signatures) was not confirmed against Meta's current webhook contract. Recommend confirming this against Meta's docs during the actual webhook-registration step in H6-13, before assuming today's always-401-when-unverified behavior is final.

---

## 8. RFQ Integration (Phase 8)

Re-confirmed: `src/app/api/rfq/*` and `src/app/api/rfqs/route.ts` contain **zero** WhatsApp references. "WhatsApp notification to new RFQ posting" remains **NOT IMPLEMENTED** — the earlier repository audit's finding still holds.

Safest future insertion point (documented here, **not implemented**): after `POST /api/rfqs` (or the RFQ-create path) persists the RFQ and the AI-matching step identifies eligible suppliers, a call to `WhatsAppService.sendTemplateMessage()` could fire per matched supplier with phone-consent-on-file. This was deliberately **not wired** this sprint — no Meta credentials exist to send with, and the sprint brief explicitly forbids enabling this without both proven-ready code and proven-ready Meta config.

`src/app/api/marketing/outreach/send/route.ts` is a separate, pre-existing InsForge-backed sequence stub: it selects a channel (`whatsapp` if `supplier.phone` present) and writes to InsForge `outreach_sequences`/`communication_logs` tables, but its own inline comment admits step 5 is a stub — `"Here we'd call the actual WhatsApp/Email API"` — no messaging API is actually called. Classification: **MOCK**. Not modified this sprint; noted here because it's adjacent-sounding but unrelated to the Meta integration.

---

## 9. Security Findings

- No token, secret, or credential value was placed in source, logs, or this report — confirmed by scanning all new files for token-shaped strings (none found; see §10).
- `WhatsAppService` logs only a redacted last-4-digits recipient identifier; message bodies, tokens, and app secret are never logged.
- Webhook route rejects (doesn't silently accept) both the verification handshake and inbound POSTs while credentials are absent — it does not "fail open."
- Test-send route requires both an explicit recipient and `confirm: true` in the request body; it never fires on page load or against a stored contact list.
- **Discrepancy flagged, not resolved, by this sprint:** `CLAUDE.md` states a hard "≤12 serverless functions (Vercel Hobby tier)" rule for `/api/`. The repository already contains 201 `route.ts` files (39+ of them under `/api/admin/*` alone, each its own file — no shared dispatcher exists in practice). A prior audit already flags this as open — `docs/SEO_DECISIONS.md`, item `D-ENG-05`, states verbatim: *"The documented constraint is very likely stale — but it is **actively distorting architecture decisions** across Sprints 7, 9, 10, and 11, all of which currently defer to it."* This sprint's 3 new route files (`/api/admin/whatsapp-meta/status`, `/api/admin/whatsapp-meta/test-send`, `/api/webhooks/meta-whatsapp`) follow the actual established per-feature-folder convention rather than inventing a dispatcher that doesn't exist elsewhere in the codebase — but D-ENG-05 remains open and is now distorting a 5th sprint's worth of decisions. **Recommend the founder resolve D-ENG-05 directly** (confirm actual Vercel plan/ceiling) rather than each sprint re-deferring to a rule nobody has verified.

---

## 10. Files Changed / Not Changed

**Added:**
- `src/lib/whatsapp/config.ts`
- `src/lib/whatsapp/MetaWhatsAppProvider.ts`
- `src/lib/whatsapp/WhatsAppService.ts`
- `src/lib/whatsapp/webhook.ts`
- `src/app/api/admin/whatsapp-meta/status/route.ts`
- `src/app/api/admin/whatsapp-meta/test-send/route.ts`
- `src/app/api/webhooks/meta-whatsapp/route.ts`
- `src/app/admin/whatsapp-cloud-api/page.tsx`
- `docs/project/H6-12-WHATSAPP-INTEGRATION-REPORT.md` (this file)

**Modified:**
- `.env.example` — added 5 new Meta WhatsApp vars (empty placeholders + comments only)
- `src/app/admin/layout.tsx` — added one nav entry (`WhatsApp Cloud API (Meta)`)

**Explicitly not changed:** Bell24h-OS, any Razorpay/Escrow/Wallet file, Voice RFQ, Video RFQ, Cloudinary, RFQ matching, supplier verification, AI Provider Manager, `src/services/whatsapp/*`, `src/routes/whatsapp.ts`, `src/models/Settings.ts`, `src/models/Conversation.ts`, `src/services/traffic/*`, `/admin/outreach` and its API routes, MSG91 OTP service. `src/app/features/voice-rfq/page.tsx` shows as modified in `git status` but that change **predates this sprint** and was not touched by H6-12.

**Not committed, not pushed** — per sprint rule.

---

## 11. Status Summary

| Area | Status | Evidence |
|---|---|---|
| LIVE | — | No direct-Meta message has been sent; MSG91 outreach path is live but out of this sprint's scope |
| CONFIGURED | — | Zero Meta WhatsApp env vars set |
| NOT CONFIGURED | Access token, Phone Number ID, WABA ID, App Secret, Webhook Verify Token | `.env.example` documents all 5; none present in this deployment |
| NOT IMPLEMENTED | RFQ→WhatsApp notification | Confirmed absent from `src/app/api/rfq*` |
| Manual in Meta (still pending) | Generate permanent System User token; retrieve Phone Number ID; register webhook callback URL + verify token in Meta App dashboard; get message templates approved | — |

---

## 12. Validation (Phase 10)

- `npx tsc --noEmit` — **zero new errors.** All pre-existing errors (~90) are in unrelated dead code (`src/services/*`, `src/tests/*`, root-level `test-*.ts`) untouched by this sprint.
- `npx next lint` (scoped to the 8 new files) — 1 error found and fixed (`react/no-unescaped-entities` in the admin page), then **clean**.
- `npx next build` — **succeeded.** All 4 new routes/page appear in the build output with no compile errors. One real bug was caught and fixed during this step: `import logger from '@/lib/logger'` (default import) failed because that module — resolved via the repo-root `@/` alias, i.e. `lib/logger.ts`, distinct from `src/lib/logger.ts` — only exports `logger` as a **named** export; corrected to `import { logger } from '@/lib/logger'` in both files that used it.
- Build-time `DATABASE_URL`/`JWT_SECRET` warnings during static generation are pre-existing local-environment limitations (no DB/secrets configured in this sandbox) affecting unrelated pages (e.g., `BusinessPulse`) — not caused by, or related to, this sprint's changes.
- `git status` / `git diff --stat` reviewed: only the 2 intended file modifications + new files listed in §10; no `.env*` file staged; no secret-shaped string found in any new file (verified via pattern scan); `tsconfig.tsbuildinfo` (a build-cache artifact touched by running `tsc`) was reverted to avoid unrelated diff noise.
- Existing RFQ, auth, payment/escrow, and Admin routes are unchanged except the one intended nav-entry addition.

---

## 13. Recommended H6-13 Scope

The smallest next sprint to move from here to a production-safe WhatsApp send capability:

1. **Manual (Meta side, founder/ops):** generate the permanent System User access token, retrieve the Phone Number ID from the API Setup screen, and get at least one message template approved (e.g. an RFQ-notify or supplier-claim template).
2. **Set the 3 "required" env vars** (`META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_WHATSAPP_BUSINESS_ACCOUNT_ID`) in Vercel → confirm `/admin/whatsapp-cloud-api` flips to `READY` and run one real Test Send to a known number.
3. **Register the webhook** in the Meta dashboard against `/api/webhooks/meta-whatsapp`, set `META_WHATSAPP_WEBHOOK_VERIFY_TOKEN` and `META_WHATSAPP_APP_SECRET`, confirm the handshake succeeds.
4. **Only after 1–3 are verified live:** design (in a dedicated sprint, with a Director decision per [[feedback_finding_promotion_gate]]-style review) the RFQ→supplier WhatsApp notification insertion point identified in §8 — including consent/opt-in handling, since this would be the first *outbound-initiated* transactional WhatsApp flow in the app.
5. Decide whether the dead code in §2b should be deleted (recommended, since it is unreachable and now duplicated in spirit by `src/lib/whatsapp/`) — a cleanup decision, not a functional one, and out of scope for H6-12's "do not modify" boundary.
