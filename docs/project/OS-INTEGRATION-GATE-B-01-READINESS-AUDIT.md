# OS-INTEGRATION-GATE-B-01 — VyaparSethu → Bell24h-OS Gate B Readiness Audit

**Status:** READ-ONLY AUDIT. No application code, schema, environment file, or
configuration was modified in either repository to produce this document.
**Date:** 2026-08-16
**Role:** Chief Integration Engineer / Repository Truth Verifier
**Authoritative contract:** `docs/project/BELL24H-OS-VYAPARSETHU-SDK-API-CONTRACT-v1.0.md`
(this audit cites it rather than reproducing it; every claim below that traces to the
contract is marked, and every claim that required a **fresh** current-source check — per
this sprint's explicit instruction not to rely solely on old documentation — is marked
"re-verified this turn" and cites the exact file/line read.)

---

## 1. Executive Summary

Gate B asks whether VyaparSethu can *safely and correctly consume* the already-proven
Bell24h-OS AI capability. The answer is **yes, on the narrow path this sprint is scoped
to** — and the evidence for that is stronger now than when the contract document was
written, because `requireServiceAuth.ts` and the `/api/v1/ai/text` route were both
re-read from current source this turn (not re-cited from the prior sprint's reports) and
match exactly what was documented, with one additional precise detail: the AI budget cap
now maps to `429 RATE_LIMITED` on overrun, which is a real (if narrow) form of rate
limiting the contract document did not fully credit.

The two structural blockers the contract document identified (§7: no tenant model; no
VyaparSethu-side server client) are **resolved for Gate B's purposes** by this sprint's
own Decision A (§2 below) — VyaparSethu is authorized to proceed as a single system-level
caller, not required to invent tenancy first. What remains is genuinely small: no
production blocker exists on the Bell24h-OS side (S2S auth and the AI route are both
proven); on the VyaparSethu side, nothing needs to be built to *read* the contract, only
to *implement* a client — which this sprint explicitly does not do.

**Verdict: READY FOR CONTROLLED IMPLEMENTATION**, scoped exactly as §22/§24 describe. No
other capability, no provider migration, no tenancy work is in scope or required first.

## 2. Repository Identity

Re-verified this turn, both repositories:

| | VyaparSethu | Bell24h-OS |
|---|---|---|
| Working directory | `C:\Users\Sanika\Projects\bell24h` | `C:\Users\Sanika\digitex-erp-bell24h-os` |
| Remote | `https://github.com/bell24xcom/forBell24x.git` — **matches expected** | `https://github.com/digitex-erp/digitex-erp-bell24h-os.git` — **matches expected** |
| Branch | `main` | `main` |
| HEAD | `7661194939e5467fa3aac4bfdcedb4878bbb4607` | `c27f8e5cdd524ce1af510184164abd90e63e136d` |
| Working tree | Dirty — H6-12/H6-13/contract-doc work, all pre-existing from before this sprint, none created by this audit | Clean |

Neither repository was altered by this audit (confirmed §26).

## 3. Contract Baseline

Extracted Gate B requirements from `BELL24H-OS-VYAPARSETHU-SDK-API-CONTRACT-v1.0.md`,
classified fresh (not copied from the contract's own §27 checklist, which used a slightly
different label set):

| Contract requirement | Classification |
|---|---|
| S2S credential storage location on VyaparSethu side | READY (design is obvious — server-only env var; §4) |
| Server-only execution boundary | READY (established convention, verified; §8) |
| Bell24h-OS auth contract compatibility | READY (re-verified current source; §5) |
| AI v1 endpoint compatibility | READY (re-verified current source; §6) |
| Request envelope fields VyaparSethu can supply | PARTIAL (§10) |
| Response/error envelope consumoption | READY (§11) |
| Idempotency | NOT IMPLEMENTED, NOT BLOCKING for the minimal AI-only path (§12) |
| Observability propagation | PARTIAL (§13) |
| Rate limiting | PARTIAL / KNOWN GAP, NOT BLOCKING (§14) |
| Tenant/identity model | NOT APPLICABLE for Gate B, per Decision A (§9) |
| Provider abstraction respected for the scoped path | READY (the one path in scope, AI, is correctly abstracted on the Bell24h-OS side; VyaparSethu's *other* provider exceptions are out of scope per Decision B, §15) |

## 4. S2S Authentication Readiness

**A. Where would the Bell24h-OS service token safely live?** A server-only environment
variable, following the exact convention already established for VyaparSethu's own
comparable secrets — `META_WHATSAPP_ACCESS_TOKEN`, `CLAIM_INVITATION_SECRET`,
`RAZORPAY_KEY_SECRET`, all read via `process.env.X` inside Next.js Route Handlers only,
documented in `.env.example` as empty placeholders. A hypothetical
`BELL24H_OS_SERVICE_TOKEN` would follow the identical pattern — no new mechanism required.

**B. Can it remain completely server-side?** Yes. VyaparSethu's Next.js App Router
structure gives a hard, tooling-enforced separation: any file under `src/app/api/**/route.ts`
or `src/lib/**` without a `'use client'` directive never ships to the browser bundle. This
is the exact boundary H6-12's `src/lib/whatsapp/` already relies on, verified clean by
that sprint's own build-output secret scan.

**C. Can VyaparSethu construct `X-Bell24h-Service-Token` without exposing it to browser
code?** Yes — trivially, using the same `fetch()`-with-header pattern already used for
every one of VyaparSethu's existing outbound provider calls (Meta, MSG91, Groq — all raw
`fetch()` inside server-only files, confirmed again this turn, §8).

**D. Is there an existing server-side HTTP client pattern that can safely be reused?**
**No shared abstraction/wrapper class exists** — re-verified this turn:
`src/lib/apiClient.ts` (the only "apiClient"-named file in the repo) is **client-side**
code (imports `@/providers/AuthProvider`, a React context; targets VyaparSethu's own
`/api` from the browser) — not a template for outbound server-to-server calls. What *does*
exist, consistently, is a **convention**: every server-only outbound call (H6-12's
`MetaWhatsAppProvider.ts`, `msg91-service.ts`, `seo-llm.ts`) uses a bare `fetch()` with
explicit headers, `AbortSignal.timeout()`, and manual JSON error-shape parsing — no
library, no generic client. A future Bell24h-OS client would follow this same convention,
not invent a new one.

**E. Is a new minimal Bell24h-OS client abstraction required?** Yes, in the sense that no
file calling Bell24h-OS exists today (there is nothing to reuse literally) — but the
*shape* it should take is already fully precedented by H6-12's `src/lib/whatsapp/`
three-file layering (`config.ts` for env-var reads and safe-status helpers,
`MetaWhatsAppProvider.ts` for the raw HTTP boundary, `WhatsAppService.ts` for the
business-facing facade). **Not created this sprint** (§22 describes what it would contain,
without building it).

## 5. Bell24h-OS Auth Verification

**Re-verified this turn from current source**, `server/middleware/requireServiceAuth.ts`
(112 lines, read in full):

| Property | Current value (this turn) |
|---|---|
| Header | `x-bell24h-service-token` (constant `SERVICE_TOKEN_HEADER`) |
| Env var | `BELL24H_VYAPARSETHU_SERVICE_TOKEN` (constant `SERVICE_TOKEN_ENV_VAR`) |
| Comparison | SHA-256 digest of both sides, `crypto.timingSafeEqual` — constant-time |
| Ordering | Missing-header check happens **before** the missing-server-config check, so a credential-less caller always gets the identical 401 regardless of server state |
| Failure — missing header | `401 AUTHENTICATION_FAILED` |
| Failure — server secret unset | `503 PROVIDER_UNAVAILABLE` (fail-closed, distinct code) |
| Failure — credential mismatch | `401 AUTHENTICATION_FAILED`, message "Service credential rejected." |
| Success | `req.serviceCaller = { system: "vyaparsethu" }` — a TypeScript-narrowed literal type (`ServiceCallerContext.system: "vyaparsethu"`), not a free-form string; audit event emitted (`s2s.verify` / `success`) |
| Client-input trust | None — `serviceCaller` is set only by this middleware, never read from body/query/headers |

**No divergence found** from what the contract document and the prior S2S-AUTH-REPORT
described — this re-confirms the contract's §6 rather than contradicting it. Unlike §5's
correction of the *contract document's* staleness in the prior sprint, this middleware
itself has not changed.

## 6. AI API v1 Compatibility

**Re-verified this turn from current source**, `server.ts` lines 90–131:

| Property | Current value (this turn) |
|---|---|
| Method | `POST /api/v1/ai/text` |
| Auth | `requireServiceAuth` (mandatory middleware, first in chain) |
| Required field | `prompt: string`, non-empty — else `400 VALIDATION_FAILED`, message `"prompt is required"` |
| Optional field | `provider: "nvidia" | "gemini" | undefined` — any other value → `400 VALIDATION_FAILED`, message `` `Unknown provider "${provider}".` `` (never silently defaults) |
| Response (success) | `{ text: string, requestId: string }` |
| Response (error) | Canonical envelope via `sendError()` |
| Error mapping | `provider_credentials_unavailable` → `503 PROVIDER_UNAVAILABLE`; `ai_budget_exceeded` → **`429 RATE_LIMITED`** (a real, existing rate-limit signal this audit surfaces more precisely than the contract document did — see §14); anything else → `500 INTERNAL_ERROR` |
| Provider selection | Caller-chosen between exactly two named values; routing happens entirely inside `aiRouter.generateNvidiaText()` / `aiRouter.generateText()` — never exposes provider internals to the caller beyond the name it requested |
| Timeout | **NVIDIA path only**: `NvidiaProvider.ts` uses an explicit `AbortController` + `setTimeout` (re-verified this turn, exact constant not re-derived here). **Gemini path**: no timeout logic found in `GeminiProvider.ts` (re-verified this turn — zero matches for `timeout`/`AbortController`/`retry` in that file) |
| Retry | **None**, either path — re-verified this turn, zero matches for `retry` anywhere in `server/ai/*.ts` |
| Usage metadata | Not returned in the response body; tracked internally only (in-memory per-caller-identity daily budget) |
| Logging/tracing | `emitAuditEvent` on every branch (via the shared `ctx`); `requestId` echoed in both success and error responses |

**Comparison against Contract v1.0**: matches exactly, with one refinement — the contract
document's §13 states the rate-limiting gap as unqualified ("no rate limiter applied").
This audit's fresh read shows that's true for *request-rate* limiting specifically, but
the **daily budget cap does function as a coarse rate limit**, surfacing as
`429 RATE_LIMITED` on overrun. Both facts are true simultaneously and are not in tension —
recorded precisely rather than as a flat contradiction (§14).

## 7. VyaparSethu AI Architecture

Re-confirmed this turn (targeted greps, not a full re-audit — the contract document's §22
already did the exhaustive version):

| Location | Providers | Live/Dead | Notes |
|---|---|---|---|
| `src/lib/ai-service-manager.ts` | NVIDIA (`integrate.api.nvidia.com` via `OpenAI` SDK client), OpenAI | **Dead** — zero imports under `src/app`, re-confirmed this turn | `NVIDIA_API_KEY` not in `.env.example` |
| `src/app/api/voice-rfq/transcribe/route.ts` | Groq (`api.groq.com/openai/v1/audio/transcriptions`) | **Live** | Real product feature (Voice RFQ) |
| `src/lib/seo-llm.ts` | Groq (`api.groq.com/openai/v1/chat/completions`), NVIDIA (`integrate.api.nvidia.com/v1/chat/completions`) | **Live** | Two live admin routes call this; already hand-rolls its own dual-provider fallback |
| — | Gemini | **Not present anywhere in VyaparSethu** | No `GEMINI_API_KEY` reference found in this codebase at all |

**Where a future Bell24h-OS AI client belongs**: `src/lib/bell24h-os/` (or similarly
named), mirroring the `src/lib/whatsapp/` three-file shape (§4.E) — a new, additive
directory. It does **not** belong inside `ai-service-manager.ts` (dead, should arguably be
deleted rather than extended — a separate decision, not this sprint's) or `seo-llm.ts`
(a working, live, narrowly-scoped feature file; conflating it with a general-purpose
Bell24h-OS client would be scope creep). **Not created this sprint.**

## 8. Browser Security Boundary

Focused search performed this turn:

- `NEXT_PUBLIC_*` variables in `.env.example` referencing AI/service-token concepts:
  only `NEXT_PUBLIC_AI_AGENTS_ENABLED` / `NEXT_PUBLIC_AI_FACTORY_ENABLED` — both plain
  feature-flag booleans (`src/lib/feature-flags.ts` pattern, H6-12-confirmed), not
  credentials.
- `'use client'` files referencing `NVIDIA`/`GEMINI_API_KEY`/`SERVICE_TOKEN`: 5 files
  found by grep, all inspected — every match is **plain UI text** ("AI Features Powered
  by NVIDIA", "Analyze with AI (Groq → NVIDIA)") — brand-name marketing copy, zero
  credential or env-var-name references.
- No `localStorage`/`sessionStorage`/URL-parameter usage found carrying anything
  resembling an API key or service token anywhere in this targeted search.
- VyaparSethu does not hold a Bell24h-OS service token today — there is nothing to leak
  yet, and no code path attempts to construct one client-side.

**SERVICE TOKEN EXPOSURE: SAFE.**

## 9. Identity / Tenancy Decision

Per this sprint's Decision A: **VyaparSethu = one authenticated service identity for
Gate B.** No organization table, no tenant table is required or was added.

| Identity | Where it lives | Role |
|---|---|---|
| Service identity | `caller_system: "vyaparsethu"`, established by Bell24h-OS's `requireServiceAuth`, never client-supplied | The **only** identity Bell24h-OS needs to see for Gate B |
| Buyer/Supplier/User ID | `User.id` (VyaparSethu's own Prisma model) | Business-domain metadata only — may ride inside the request body's `prompt`/context if a caller wants Bell24h-OS's audit trail to reference it, but must never be mistaken for or mapped to an OS-side tenant/organization concept |
| RFQ ID | `RFQ.id` | Same — business metadata, not identity |
| Session ID | VyaparSethu's own JWT-derived session, unrelated to the S2S credential | Never crosses this boundary |

This resolves the contract document's §7 finding for Gate B's purposes specifically —
**not** by solving the underlying architectural mismatch (VyaparSethu genuinely still has
no tenant model, and Bell24h-OS's model still assumes `organization_id` everywhere else),
but by this sprint's explicit authority to treat that as future architecture rather than
a P0 blocker. Recorded as a **scoped deferral**, not a resolution.

## 10. Request Context

| Field | Classification | Notes |
|---|---|---|
| `request_id` | PARTIAL | VyaparSethu generates no request ID anywhere today (re-confirmed absent, contract §12); Bell24h-OS accepts an inbound `X-Request-Id` and echoes it, or generates one itself if none is sent. **VyaparSethu does not need to generate one for the minimal path to work** — Bell24h-OS's own fallback covers it — but wouldn't get end-to-end traceability on its own side without adding one |
| `correlation_id` | PARTIAL | Same as above — Bell24h-OS treats it as equal to `request_id` today; no VyaparSethu-side concept exists to map from |
| `actor/user ID` | READY (as business metadata, §9) | `User.id` exists and is available server-side wherever a route would call Bell24h-OS |
| `RFQ ID` | READY (as business metadata, §9) | Same |
| `service identity` | READY | Fixed value (`"vyaparsethu"`) — nothing VyaparSethu needs to supply beyond presenting the correct credential |
| `timestamp` | READY | Trivial (`new Date().toISOString()`), no infrastructure gap |
| `idempotency key` | MISSING | No idempotency-key generation or tracking convention exists anywhere in VyaparSethu (§12) |

## 11. Error Handling

VyaparSethu's per-route pattern (`NextResponse.json({success, error/data}, {status})`,
confirmed inconsistent across the ~206 routes, contract §9) is **sufficient to consume**
Bell24h-OS's canonical envelope even though it doesn't match it structurally — a thin
translation layer (map `error_code` → an internal message/status, log `request_id`) is
all that's needed, not a rewrite of VyaparSethu's existing error handling.

| Bell24h-OS code | VyaparSethu-side translatability |
|---|---|
| `AUTHENTICATION_FAILED` | Trivial — maps to "Bell24h-OS credential misconfigured," an operator-facing message, never shown to an end buyer/supplier |
| `AUTHORIZATION_FAILED` (contract uses `AUTHORIZATION_DENIED`) | Same class |
| `RATE_LIMITED` | Trivial — maps to "try again shortly," a pattern VyaparSethu already uses for its own `MSG91` daily-limit responses (`bulk-wa/route.ts`, H6-12) |
| `PROVIDER_UNAVAILABLE` | Trivial — same shape as H6-12's `NOT_AVAILABLE` result already returned by `WhatsAppService`/`OutreachService` when Meta credentials are absent — **direct existing precedent to copy** |
| `PROVIDER_TIMEOUT` | Trivial — VyaparSethu already uses `AbortSignal.timeout()` + catch blocks for its own outbound calls |
| `VALIDATION_ERROR` (contract uses `VALIDATION_FAILED`) | Trivial |
| `INTERNAL_ERROR` | Trivial — generic 500 handling already exists everywhere |
| `SERVICE_UNAVAILABLE` | Overlaps `PROVIDER_UNAVAILABLE` conceptually — no new handling needed |

**No implementation performed.** VyaparSethu's H6-12 `WhatsAppService` result pattern
(`{status: 'SENT'|'NOT_CONFIGURED'|'META_ERROR'}`) is the closest existing precedent for
what a Bell24h-OS client's return type should look like — cited as a template, not reused
as code (different capability entirely).

## 12. Retry / Idempotency

**Neither exists generically in VyaparSethu.** The one exception is narrowly scoped and
does not generalize: H6-13's `consumeClaimInvitation()` uses a conditional
`updateMany`-inside-a-Prisma-transaction pattern to make **claim redemption** idempotent —
this is a database-level guard specific to that one operation, not a reusable
idempotency-key mechanism a Bell24h-OS client could adopt as-is.

| Future need | Current VyaparSethu readiness |
|---|---|
| AI requests (Gate B's actual scope) | MISSING, but **not blocking** — a duplicate `/api/v1/ai/text` call today just costs budget twice, not a correctness defect (contract §11) |
| Communication (future, out of scope) | MISSING — genuinely would need design before any Communication migration, not before Gate B |
| Media jobs (future, out of scope) | MISSING |
| Workflow actions (future, out of scope) | MISSING |

**Classification: MISSING, NOT BLOCKING for the Gate B AI-only scope.**

## 13. Observability

| Field | Propagation readiness |
|---|---|
| `request_id` | PARTIAL (§10) — Bell24h-OS's fallback generation covers the gap for a first implementation; VyaparSethu adding its own would improve, not unblock |
| `correlation_id` | Same |
| `service identity` | READY — fixed, nothing to propagate from VyaparSethu's side |
| `operation`/`capability` | READY as a literal string constant (`"ai.generate_text"` or similar) — no infrastructure needed |
| `latency` | MISSING on VyaparSethu's side generically; trivially addable per-call (`Date.now()` delta) if desired, not required for correctness |
| `success/failure` | READY — VyaparSethu's existing per-route try/catch pattern already produces this |
| `retry count` | N/A — no retry exists on either side for this path (§6, §12) |

**Sensitive-data-in-logs check**: VyaparSethu's own `lib/logger.ts` (repo root, H6-12/13
confirmed) already redacts keys matching `password|token|otp|secret|apikey|auth` — the
same discipline Bell24h-OS's `audit.ts` independently applies. A future Bell24h-OS client
built inside VyaparSethu should use this existing logger, not a new one, and the existing
redaction pattern already covers a hypothetical `serviceToken` field by name-matching
`token`.

## 14. Rate Limiting

Re-verified this turn, both sides:

- **Bell24h-OS**: `aiRateLimit` middleware exists (`server/middleware/rateLimit.ts`) and
  is applied to `/api/vault/ai-summary` and `/api/vault/mentor-advice` — **confirmed, this
  turn, NOT applied to `/api/v1/ai/text`** (`grep -n "aiRateLimit|rateLimit" server.ts` —
  the S2S route's only middleware is `requireServiceAuth`). This reconfirms the contract
  document's P1 finding. **Refinement from this audit (§6)**: the AI daily-budget cap
  *does* map to `429 RATE_LIMITED` on overrun — a coarse, day-granularity rate limit
  exists even though a request-rate limiter does not.
- **VyaparSethu**: no working rate-limit framework exists anywhere (H6-13's own security
  review, re-confirmed unchanged this sprint — `src/middleware/rate-limiter.ts` and
  `src/lib/rate-limit.ts` both remain dead/unimported).

**Does this block Gate B? NO.** The credential itself is the actual gate — an attacker
with no valid `X-Bell24h-Service-Token` cannot reach the route regardless of rate-limit
presence (constant-time comparison removes the timing side-channel; a properly-generated
secret makes brute-forcing computationally infeasible). This is a **P1 defense-in-depth
recommendation** for a future sprint (add `aiRateLimit`-equivalent to `/api/v1/ai/text`),
not a Gate B blocker, consistent with the S2S-AUTH-REPORT's own original classification.

## 15. Direct Provider Exceptions

Per Decision B — **not migrated, not modified, classified only:**

| Provider | VyaparSethu Location | Live/Dead | Capability | Owner Target | Gate B Impact |
|---|---|---|---|---|---|
| Groq | `src/app/api/voice-rfq/transcribe/route.ts` | Live | Voice transcription | Bell24h-OS Voice (future, not yet implemented) | **NON-BLOCKING** — unrelated capability to the AI-text path Gate B scopes |
| Groq + NVIDIA | `src/lib/seo-llm.ts` | Live | Text generation (SEO) | Bell24h-OS AI (`/api/v1/ai/text` — already exists!) | **NON-BLOCKING TECHNICAL DEBT** — the most natural future migration target once Gate B's client exists, but explicitly out of this sprint's scope |
| NVIDIA + OpenAI | `src/lib/ai-service-manager.ts` | **Dead** | N/A (unreachable) | N/A | **NON-BLOCKING** — recommend deletion in a future hygiene pass, not a Gate B concern either way |
| MSG91 | `src/lib/services/msg91-service.ts` (OTP), `src/app/api/admin/outreach/bulk-wa/route.ts` (bulk WhatsApp) | Live | OTP / messaging | OTP: arguably VyaparSethu-owned (needs review, per contract §26); bulk WhatsApp: Bell24h-OS Communication (future) | **NON-BLOCKING** |
| Meta WhatsApp | `src/lib/whatsapp/` (H6-12/H6-13) | Live, already correctly boundary-shaped | Communication | Bell24h-OS Communication (future) | **NON-BLOCKING MIGRATION DEBT** — see §16 |

No entry in this table rises above **NON-BLOCKING TECHNICAL DEBT**. None constitutes a
security issue on its own (each was already individually security-reviewed in H6-12/H6-13
or this sprint's contract document; no new exposure found this turn).

## 16. WhatsApp / Communication Assessment

Re-confirmed present, unmodified, this turn (file existence checked, contents not
re-read — H6-13's own Final Certification Pass already re-validated these in full):

- `MetaWhatsAppProvider.ts`, `WhatsAppService.ts` — `src/lib/whatsapp/`
- Bulk outreach route — `src/app/api/admin/outreach/bulk-wa/route.ts`
- Admin WhatsApp UI — `/admin/whatsapp-cloud-api`, `/admin/outreach`
- Claim invitation system — `src/lib/outreach/claimInvitation.ts`, `claimToken.ts`
- Suppression — `src/lib/outreach/suppression.ts` (integrates `OutreachConsentLog`)
- Campaign state machine — `src/lib/outreach/campaignStateMachine.ts`

**Current capability = VyaparSethu-owned direct Meta implementation.** Correctly
boundary-shaped already (§4.E, §7 of the contract document) — `WhatsAppService` is the one
swap point a future `Bell24h-OS Communication Hub` migration would touch; no other file in
the H6-12/H6-13 chain calls Meta directly.

**Classification: NON-BLOCKING MIGRATION DEBT.** Does not block Gate B — Gate B's scope
(§22, §24) is AI-only and touches none of this code.

## 17. Media Assessment

Cloudinary (`src/lib/cloudinary-server.ts`) — live, VyaparSethu's own product-image
storage. **Current implementation**: direct Cloudinary integration, unabstracted.
**Target ownership**: ambiguous per the contract document's own §16/§22 judgment call
(Storage is nominally Bell24h-OS-owned per the architecture constitution, but product
photos are arguably in-domain business content) — **not resolved here either**, consistent
with the contract document's own non-resolution. **Gate B impact: NONE** — Cloudinary is
unrelated to the AI-only path this sprint scopes, and Bell24h-OS itself has no Media
capability to migrate to yet (contract §16: `UNKNOWN`, not even confirmed absent).

## 18. P1 Security Backlog

Re-verified against **current source**, this turn, not re-cited from old reports:

| # | Item | Status | Verified this turn? | Blocks Gate B? |
|---|---|---|---|---|
| 1 | `/api/check-users-count` — cross-tenant count disclosure | **VERIFIED, still present** | Yes — `server.ts:205-214`, `SELECT count(*) FROM auth.users` with no org scoping, `requireAuth` only | **NO** |
| 2 | `/api/check-table` — raw error disclosure | **VERIFIED, still present** | Yes — `server.ts:193-203`, `res.status(500).json({ error: err.message })` | **NO** |
| 3 | `/api/v1/ai/text` rate limiting gap | **VERIFIED, still present** (refined — §14) | Yes — `aiRateLimit` confirmed absent from this route's middleware chain | **NO** |
| 4 | `JobOrchestratorService.ts` browser-shipped | **VERIFIED, still present** | Yes — still under `src/modules/`, still imports `AIManagerService` from the client-side `AiProviderService.ts`; `JobWorker` import still commented out in `src/main.tsx` | **NO** |
| 5 | Provider environment-variable scope governance | **UNKNOWN, unchanged** | No — no Vercel env-scope-reading tool available this session either, same as every prior sprint | **NO** |

None of the five items relate to the S2S/AI path Gate B scopes (`requireServiceAuth`,
`/api/v1/ai/text`) — all five are pre-existing, separately-tracked, `requireAuth`-gated or
governance items. **None blocks Gate B.**

## 19. Gate B Readiness Matrix

| Requirement | Evidence | Status | Blocking? |
|---|---|---|---|
| S2S secret storage | §4.A — server-only env var, established convention | READY | No |
| Server-only execution | §4.B — Next.js App Router boundary, verified | READY | No |
| Authentication header | §5 — `X-Bell24h-Service-Token`, re-verified current source | READY | No |
| Bell24h-OS auth compatibility | §5 | READY | No |
| AI endpoint compatibility | §6 — re-verified current source | READY | No |
| Request envelope | §10 | PARTIAL | No |
| Response envelope | §11 | READY (translatable) | No |
| Error handling | §11 | READY (translatable) | No |
| Request IDs | §10, §13 | PARTIAL (OS-side fallback covers the gap) | No |
| Correlation IDs | §10, §13 | PARTIAL | No |
| Identity model | §9 — resolved for Gate B via Decision A | READY (scoped) | No |
| Idempotency | §12 | MISSING | No (AI-only scope tolerates duplicates) |
| Retries | §6, §12 | MISSING (neither side) | No |
| Observability | §13 | PARTIAL | No |
| Rate limiting | §14 | PARTIAL (budget cap exists; per-request limiter doesn't) | No |
| Provider abstraction | §7, §15 | READY for the AI path; other paths are debt, not blockers | No |
| Security boundary | §8 — SAFE | READY | No |
| Deployment configuration | Not this sprint's to verify — Bell24h-OS production deployment already proven reachable and correctly configured (contract §5) | READY (OS side); N/A (VyaparSethu side — nothing deployed yet since nothing built) | No |
| Runtime configuration | Same | READY (OS side) | No |

**Zero rows are BLOCKED.**

## 20. Minimal Implementation Change Set

**Question:** if the founder authorizes implementation tomorrow, what is the smallest safe
change set to prove `VyaparSethu → Bell24h-OS → /api/v1/ai/text → NVIDIA → real completion`?

**Described only, not implemented:**

1. **One new server-only file**, e.g. `src/lib/bell24h-os/client.ts` — a single function,
   `callBell24hOsAiText(prompt: string, provider?: 'nvidia' | 'gemini')`, following the
   exact `fetch()` + `AbortSignal.timeout()` + typed-result convention already used by
   `src/lib/whatsapp/MetaWhatsAppProvider.ts`. Reads `BELL24H_OS_URL` and
   `BELL24H_OS_SERVICE_TOKEN` from `process.env`, both new env vars, both documented as
   empty placeholders in `.env.example` (no default fallback — fails closed if unset,
   matching every other H6-12/H6-13 secret-handling precedent).
2. **One new route or admin action**, minimal — e.g. a single admin-only test endpoint
   (`POST /api/admin/bell24h-os/test-ai`, `requireAdmin`-gated, mirroring H6-12's
   `/api/admin/whatsapp-meta/test-send` pattern exactly: requires an explicit `confirm: true`
   body field, never fires automatically) that calls the new client function and returns
   its typed result.
3. **Two new env vars** in `.env.example` only: `BELL24H_OS_URL` (the production/preview
   Bell24h-OS base URL) and `BELL24H_OS_SERVICE_TOKEN` (the shared secret, matching
   Bell24h-OS's `BELL24H_VYAPARSETHU_SERVICE_TOKEN` value once the founder provisions it
   on both sides).
4. **No schema change.** Nothing about this path touches Prisma.
5. **No UI beyond the one admin test action** — no new Admin nav entry is strictly
   required for a first proof, though one could mirror H6-12's `/admin/whatsapp-cloud-api`
   status-page pattern if desired.

**Explicitly excluded from this minimal set** (per §24's own scope lock): provider
migration (Groq/MSG91/Meta untouched), WhatsApp migration, Video migration, tenant
architecture, multi-provider expansion beyond the two Bell24h-OS already supports,
Bell24h-OS refactoring.

## 21. Gate B Verdict

## READY FOR CONTROLLED IMPLEMENTATION

**Evidence basis:** Bell24h-OS's S2S authentication and `/api/v1/ai/text` are both
re-verified this turn against current source (not stale documentation) and both match
their documented, production-proven behavior exactly. VyaparSethu's browser security
boundary is SAFE. No P1 finding, direct-provider exception, or communication/media
technical debt item rises above NON-BLOCKING. The two structural gaps the contract
document flagged (tenancy, no server client) are correctly scoped out of Gate B by this
sprint's own Decision A/B rather than papered over. Zero rows in the readiness matrix
(§19) are BLOCKED.

No blocker was invented to pad this verdict — every "not ready" or "missing" item found
(idempotency, generic rate limiting, request-ID generation, JobOrchestrator hygiene) was
tested against whether it blocks the *specific, minimal* AI-text path this sprint scopes,
and none of them do.

## 22. Recommended Next Sprint

```
NEXT SPRINT: OS-INTEGRATION-IMPLEMENTATION-01 (VyaparSethu side)

Scope, exactly:

  VyaparSethu server-side client
          ↓
  S2S authentication
          ↓
  /api/v1/ai/text
          ↓
  Bell24h-OS
          ↓
  NVIDIA

Per §20's minimal change set. No other capability. No WhatsApp migration.
No provider expansion. No Video Factory. No SEO Factory. No agent migration.
No tenant/organization model added to VyaparSethu.
```

## 23. Open Questions

Carried forward from the contract document, **still unresolved, not decided by this
audit** (this audit does not attempt to close them — that was never its purpose):

- Whether VyaparSethu's OTP-MSG91 usage should be reclassified out of "Communication
  capability" entirely (contract §26 — flagged as needing review, not decided).
- Whether Cloudinary should ever be considered a Storage-capability migration candidate
  (§17).
- Whether `digitex-erp/bell24h` and `bell24xcom/forBell24x` are the same underlying
  codebase under different names (contract §28 Q13) — still not resolved, still relevant
  to which repository any future Communication Hub migration would actually target.
- Whether `ai-service-manager.ts` should be deleted (recommended) or left as inert dead
  code — a code-hygiene decision, not an architecture one.
- What the real Bell24h-OS base URL (production vs. preview) should be for
  `BELL24H_OS_URL` once OS-INTEGRATION-IMPLEMENTATION-01 begins — not determined by this
  audit, a founder/operator decision at implementation time.

## 24. Explicit Non-Goals

This sprint explicitly did NOT:

- Modify application source code (either repository)
- Modify database schema
- Create migrations
- Modify authentication
- Create an SDK
- Create an API client
- Modify Bell24h-OS
- Modify VyaparSethu
- Modify environment variables
- Modify Vercel configuration
- Modify Supabase
- Modify Meta WhatsApp
- Modify MSG91
- Modify Groq
- Modify NVIDIA
- Migrate any direct-provider integration
- Add tenant tables
- Add organization tables
- Refactor architecture
- Upgrade dependencies
- Commit, push, or deploy anything

---

## Final Safety Audit

Performed against both repositories, this turn.
