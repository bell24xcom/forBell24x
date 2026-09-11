# Bell24h-OS ↔ VyaparSethu SDK/API Contract v1.0

**Status:** CONTRACT DEFINITION — read/analyze/document only. No application code, schema,
route, provider adapter, or dependency was modified to produce this document. Gate B has
**not** started.
**Date:** 2026-08-16
**Written from:** `C:\Users\Sanika\Projects\bell24h` (VyaparSethu — `bell24xcom/forBell24x`)
**Also inspected (read-only):** `C:\Users\Sanika\digitex-erp-bell24h-os` (Bell24h-OS —
`digitex-erp/digitex-erp-bell24h-os`)
**Relationship to prior art:** Bell24h-OS's own repo already contains
`docs/architecture/BELL24H_OS_VYAPARSETHU_SDK_API_CONTRACT_V1.md` (2026-08-10) and its
companion `BELL24H_OS_CURRENT_STATE.md`. This document does **not** duplicate that work —
it is written from the opposite side of the boundary (VyaparSethu's actual repository, not
inferred), reconciles it against **four newer** Bell24h-OS sprints that post-date it
(S2S auth, AI proof, provider routing, NVIDIA adapter+proof — none of which the OS-side
document could have seen, since it predates them), and adds the VyaparSethu-side
capability inventory the OS-side document explicitly does not have access to. Where the
two documents agree, this one cites rather than restates. Where they diverge because the
OS-side document is now stale, that is called out explicitly (§5).

---

## 1. Executive Summary

Bell24h-OS has a working, production-**proven** S2S authentication mechanism
(`requireServiceAuth`, shared-secret header, constant-time comparison) and a working,
production-**proven** AI capability (`POST /api/v1/ai/text`, provider-selectable between
Gemini and NVIDIA, real HTTP 200 against NVIDIA's live API confirmed by the operator on
2026-08-12). This is the strongest, most concrete capability boundary available to define
a contract against — so this document defines the AI v1 contract in full detail (§14) and
defines every other capability (Communication, Media, Voice, Agents, Policy, Audit,
Evidence, Storage) as an explicit `CONTRACT-DEFINED / NOT-YET-IMPLEMENTED` boundary,
matching what actually exists rather than what the target architecture eventually wants.

The single most consequential finding from the VyaparSethu side: **VyaparSethu has no
tenant/organization concept anywhere in its data model** (§7), while Bell24h-OS's entire
identity and authorization model is built around `organization_id`. This is a real,
unresolved structural gap between the two systems — not a naming difference, not
something either side's documentation currently reconciles — and is the load-bearing
open question for Gate B (§28, Q1).

The second consequential finding: VyaparSethu already has two **live** direct-to-provider
AI integrations (Groq, for Voice RFQ transcription and SEO content generation) and one
**dead** direct-to-provider AI integration (an unwired NVIDIA/OpenAI scaffold,
`src/lib/ai-service-manager.ts`) — all of which are the exact "BAD" pattern Section 22 of
this sprint's own constitution names (`VyaparSethu → provider` instead of
`VyaparSethu → Bell24h-OS capability → provider adapter`). None are fixed here, per the
read-only rule; all are recorded in the Integration Decision Matrix (§26).

## 2. Architecture Constitution

Adopted as given by this sprint's mission brief, cross-checked against repository
evidence rather than assumed. **No contradiction was found** between the brief's
ownership model and what either repository's own architecture documentation already
states — Bell24h-OS's `CANONICAL_ARCHITECTURE.md`, `MASTER_DATA_OWNERSHIP.md`,
`MASTER_MODULES.md`, and its own SDK contract draft (§1's "prior art") all describe the
same split. The frozen model stands unmodified:

- **VyaparSethu owns** the B2B business/product domain: Buyer, Supplier, RFQ, Quote,
  Matching, Trust/KYB, Trade Chat, Negotiation, Deal, Payment orchestration, Escrow
  business rules, Logistics, Marketplace, Supplier discovery, Trade intelligence,
  Admin/outreach, SEO/business content.
- **Bell24h-OS owns** reusable enterprise capability/infrastructure: AI, AI Provider
  Manager, Communication infrastructure, Media, Voice, Identity/RBAC, Agent Runtime,
  Policy, Workflow/Event infrastructure, Audit, Evidence, Storage abstraction, provider
  adapters, Observability, Usage/cost controls.
- **External providers are adapters, never direct integration points from VyaparSethu**
  where the capability belongs to Bell24h-OS: NVIDIA, Meta, Spur, MSG91, DeepSeek, Qwen,
  GLM, MiniMax, Cloudinary, etc.

## 3. System Ownership

Confirmed by direct repository inspection on both sides — not inferred:

| System | Repository | Remote | HEAD at inspection | Role |
|---|---|---|---|---|
| VyaparSethu | `C:\Users\Sanika\Projects\bell24h` | `bell24xcom/forBell24x` | `7661194939e5467fa3aac4bfdcedb4878bbb4607` (== `origin/main`) | Public B2B marketplace application |
| Bell24h-OS | `C:\Users\Sanika\digitex-erp-bell24h-os` | `digitex-erp/digitex-erp-bell24h-os` | `c27f8e5cdd524ce1af510184164abd90e63e136d` (== `origin/main`, clean working tree) | Reusable capability/infrastructure platform |

**Open question surfaced by this inspection, not resolved here** (§28, Q13): Bell24h-OS's
own architecture documents (e.g. `BELL24H_OS_VYAPARSETHU_SDK_API_CONTRACT_V1.md` §08, §04)
refer to VyaparSethu's live Meta/MSG91 integration as existing "only in the separate
legacy repo `digitex-erp/bell24h`" — a **different** GitHub org/name than the repository
actually inspected for this document (`bell24xcom/forBell24x`). Either these are genuinely
two different repositories (in which case Bell24h-OS's prior documentation was written
against a stale or wrong VyaparSethu instance), or `digitex-erp/bell24h` is an old rename
history / mirror of the same codebase. This was not resolved by this sprint — it directly
affects which repository Gate B should even target.

## 4. Capability Boundaries

Per the mission brief's Section 8, evaluated against actual repository evidence, not
assumption:

| Group | Bell24h-OS status (this inspection) |
|---|---|
| A. AI — `/api/v1/ai/text` | **PROVEN.** See §14. |
| B. Communication | CONTRACT-DEFINED / NOT-YET-IMPLEMENTED. No Communication Hub, no send/template/delivery-status endpoint exists in Bell24h-OS. |
| C. Media | CONTRACT-DEFINED / NOT-YET-IMPLEMENTED. No working generation pipeline confirmed end-to-end in Bell24h-OS (its own `BELL24H_OS_CURRENT_STATE.md` marks this `UNKNOWN`, not `TARGET` — absence itself wasn't even fully confirmed). |
| D. Voice | CONTRACT-DEFINED / NOT-YET-IMPLEMENTED. No voice capability in Bell24h-OS. (VyaparSethu has its own direct Groq Whisper integration for Voice RFQ — §7, §26 — unrelated to any Bell24h-OS capability.) |
| E. Agents | CONTRACT-DEFINED / NOT-YET-IMPLEMENTED. No agent runtime, policy, or risk-classification code found in Bell24h-OS. |
| F. Identity / authorization | PARTIAL. Authenticate + tenant-context resolution EXISTS (`requireAuth.ts`, Supabase JWT); real authorization/RBAC beyond "authenticated + belongs to org X" is NOT-YET-IMPLEMENTED (`role: 'ADMIN'` hardcoded client-side). |
| G. Policy | CONTRACT-DEFINED / NOT-YET-IMPLEMENTED. Only `requireAuth`'s fail-closed check and per-org rate limiting exist — neither is a risk-classification/approval system. |
| H. Audit | PARTIAL. Write-only, structured, **not durable** (`emitAuditEvent`, stdout only — no `DATABASE_URL` configured for the audit tables in Bell24h-OS's environment). No query/read API. |
| I. Evidence | CONTRACT-DEFINED / NOT-YET-IMPLEMENTED. No hashing, anchoring, or evidence-chain code in Bell24h-OS. |
| J. Storage | INFERRED, not independently re-verified this sprint (Supabase Storage referenced in Bell24h-OS docs only). |

## 5. Current Verified Baseline

**Bell24h-OS**, verified by direct evidence this inspection (not assumed from the mission
brief's own framing, though the brief's framing turned out to be accurate — see below):

| Claim (from mission brief §3) | This inspection's verdict | Evidence |
|---|---|---|
| Gate A = CLOSED | Not independently re-verified this sprint (no Gate A report was read) — **carried as stated**, consistent with every downstream artifact assuming it | — |
| S2S authentication = proven | **CONFIRMED** | `docs/project/OS-INTEGRATION-IMPLEMENTATION-03-S2S-AUTH-REPORT.md` — mechanism verified locally + against live production; production credential confirmed configured via a genuine behavioral change (503→401) between two verification passes |
| `requireServiceAuth` = proven | **CONFIRMED** | Same report; `server/middleware/requireServiceAuth.ts`, unchanged since OS-INTEGRATION-IMPLEMENTATION-01 |
| `/api/v1/ai/text` = proven | **CONFIRMED** | `OS-INTEGRATION-IMPLEMENTATION-04E-NVIDIA-PROOF-REPORT.md` |
| AI Provider Manager = proven | **CONFIRMED** | Same; `server/ai/ProviderManager.ts`/`ProviderRouter.ts`, unchanged across 03→04E (`git diff --stat` zero each sprint) |
| NVIDIA adapter = proven | **CONFIRMED** | `OS-INTEGRATION-IMPLEMENTATION-04D-NVIDIA-ADAPTER-REPORT.md` (5/5 mock verification) + 04E (6/6 local-runtime HTTP round-trip) |
| Real NVIDIA production execution = proven | **CONFIRMED** | 04E "Operator Production Proof" section — operator-performed, credential never exposed to any session |
| HTTP 200 production proof = proven | **CONFIRMED** | Same |
| `BELL24H-OS-NVIDIA-PROOF-OK` = proven | **CONFIRMED** | Same — exact marker string received in the operator's proof-call response body |

**Important correction to the OS-side document's own currency**: Bell24h-OS's
`docs/architecture/BELL24H_OS_VYAPARSETHU_SDK_API_CONTRACT_V1.md` (dated 2026-08-10,
confirmed by file mtime) states in its own §02 and §26 Stop Condition A that
**"Cross-system (VyaparSethu → Bell24h-OS) service-to-service authentication does not
exist today."** This was true on 2026-08-10. It is **no longer true** — three later
sprints (`03`, `04D`, `04E`, all dated 2026-08-12, confirmed by file mtime) built and
production-verified exactly that mechanism. The OS-side contract document was not
updated to reflect this. This document does not edit that file (read-only rule); it
records the discrepancy here as a **FINDING**:
- **FINDING:** Bell24h-OS's own authoritative contract document is stale on its single
  most important claim (cross-system auth existence).
- **IMPACT:** Anyone reading only that document would wrongly conclude Gate B is blocked
  on a nonexistent-auth-mechanism problem that was actually solved five sprints ago.
- **RECOMMENDATION:** Bell24h-OS should update or supersede that document before Gate B
  begins, referencing `03`/`04D`/`04E` as closing its Stop Condition A.
- **BLOCKING / NON-BLOCKING:** Non-blocking for this document (which uses the newer, more
  current evidence throughout) but should be treated as blocking for anyone relying on the
  OS-side document alone.

**VyaparSethu**, verified this inspection:

| Claim (from mission brief §3) | Verdict | Evidence |
|---|---|---|
| H6-13 outreach implementation = certified | **CONFIRMED** | `docs/project/H6-13-COMPANY-CLAIM-OUTREACH-REPORT.md`, Final Certification Pass section — 🟢 CERTIFIED — READY FOR COMMIT REVIEW |
| Outreach tests = 25/25 | **CONFIRMED** | Same document; re-verified this session is unnecessary (read-only sprint) |
| Production build = passed | **CONFIRMED** | Same |
| H6-13 commit/push = pending at sprint start | **CONFIRMED** | `git status --short` this session, before any action: `HEAD == origin/main`, all H6-12/H6-13 work present only as uncommitted working-tree changes |
| Live outreach = not activated | **CONFIRMED** | No `META_WHATSAPP_ACCESS_TOKEN`/`CLAIM_INVITATION_SECRET` configured (§20 of the H6-12 report, §20 of the H6-13 report) |
| Real WhatsApp campaign sending = not performed | **CONFIRMED** | Same — every live-send path fails closed to `NOT_AVAILABLE` |

**Gate B has NOT started.** This document is a prerequisite artifact for it, nothing more.

## 6. Authentication Contract

Documented exactly as the repository evidence supports — **no second authentication
mechanism is proposed.**

**Existing, proven mechanism (Bell24h-OS side):**

| Property | Value |
|---|---|
| Caller identity | Fixed, non-negotiable: `caller_system = "vyaparsethu"` — established only after successful verification, never accepted from the request body, query string, or any client-supplied field |
| Service identity | Same field; used downstream as `userId: "service:vyaparsethu"` / `organizationId: "vyaparsethu"` in AI-router context |
| Credential location | `BELL24H_VYAPARSETHU_SERVICE_TOKEN` — server-side environment variable, Bell24h-OS side only |
| Server-side-only secret requirement | **Verified enforced.** `requireServiceAuth.ts` is never imported from Bell24h-OS's client code (`grep -rl "requireServiceAuth" src/` → zero matches); the variable name itself never appears in Bell24h-OS's built browser bundle |
| Authentication header | `X-Bell24h-Service-Token` |
| Authentication validation | SHA-256 digest of both sides, compared via `crypto.timingSafeEqual` (constant-time — no length-comparison or timing side-channel) |
| Failure behaviour | Missing header → `401`; invalid credential → `401`; missing server-side secret entirely → `503 PROVIDER_UNAVAILABLE` (fail-closed, distinguishable from a real rejection) |
| Authorization boundary | Binary — a valid token grants exactly the one gated route (`/api/v1/ai/text`) as the fixed `vyaparsethu` identity; no finer-grained scoping exists |
| Tenant context | The fixed `caller_system` value **is** the tenant/organization context on the Bell24h-OS side — see §7 for why this doesn't reconcile with VyaparSethu's own model |
| Actor context | Not distinguished from service identity — no per-VyaparSethu-user actor propagates through this boundary today |
| Credential rotation expectations | Not designed or documented anywhere in either repository — **CONTRACT-DEFINED / NOT-YET-IMPLEMENTED** |
| Secret exposure rules | Verified clean on the Bell24h-OS side across every proof sprint (03, 04, 04B, 04D, 04E): never in `src/`, never in the built client bundle, never printed in any report |

**The service token MUST NEVER be exposed to** (repeating the mission brief's own rule,
now cross-checked against evidence): browser — verified clean on the OS side; client
bundle — verified clean on the OS side; localStorage — N/A, no such storage exists for
this credential anywhere; public URL — never appears in any tested response body;
frontend environment variables — VyaparSethu has no `NEXT_PUBLIC_*` variable for this
(none exists to check, since VyaparSethu doesn't hold this credential today); logs —
verified clean via `emitAuditEvent`'s metadata shape (`provider`, `model`, `latencyMs`,
`errorCode` only — never a credential); analytics payloads — N/A, no analytics pipeline
touches this boundary in either repository.

**On the VyaparSethu side**, no equivalent mechanism exists yet — VyaparSethu holds no
service credential for calling Bell24h-OS, has never attempted to, and this document does
not create one. This is the **actual, current, correctly-named Gate B prerequisite**
(§28, Q7 covers where such a credential would live if VyaparSethu were to call Bell24h-OS).

## 7. Tenant/Identity Contract

**This is the most important open architectural gap this document surfaces.**

| System | Tenant/org model | Evidence |
|---|---|---|
| Bell24h-OS | `organization_id`, resolved server-side per authenticated Supabase user from a `profiles` table, RLS-enforced | `requireAuth.ts`, confirmed unchanged across every OS-side sprint read this inspection |
| VyaparSethu | **None.** No `organization`, `tenant`, `org_id`, or equivalent field exists anywhere in `prisma/schema.prisma` | Direct grep this inspection: `grep -in "organization\|tenant" prisma/schema.prisma` → zero matches |

VyaparSethu's identity model is flat: a `User` row (`id`, `role: SUPPLIER|BUYER|ADMIN|AGENT`,
`phone`-based OTP authentication, JWT payload `{userId, phone, role}` — see `src/lib/jwt.ts`,
root `lib/admin-auth.ts`). Every business is a `User`, not a member of an organization; a
single phone number/User row **is** the tenant, if VyaparSethu has an equivalent concept
at all. There is no concept of multiple human actors under one organizational umbrella.

**Determination of how tenant context should cross VyaparSethu → Bell24h-OS: not
resolved by this sprint** (per the mission brief's own instruction not to silently resolve
ambiguity). Three real options exist, none adopted here:
1. Map `User.id` 1:1 to a synthetic Bell24h-OS `organization_id` per VyaparSethu user —
   creates a large number of single-member "organizations" on the OS side, a shape
   Bell24h-OS's `organization_id`/`profiles` model wasn't designed for.
2. Treat all of VyaparSethu as the single fixed `caller_system = "vyaparsethu"` identity
   Bell24h-OS's S2S mechanism already uses today (§6) — the model already implemented,
   but it means Bell24h-OS has **zero** visibility into which VyaparSethu business/user
   actually triggered a given capability call, only that *some* VyaparSethu request did.
3. Introduce a new, VyaparSethu-specific actor field inside the request envelope (§9) that
   Bell24h-OS records but does not use for authorization — preserves auditability without
   requiring either side's identity model to change.

**Bell24h-OS's tenant-isolation guarantee** (Tenant A cannot access Tenant B's data) is
enforced today via Supabase RLS on user-authenticated routes (§6, `requireAuth.ts`) — but
the one route relevant to this contract (`/api/v1/ai/text`, S2S-gated) has **no
per-VyaparSethu-tenant isolation at all**, because there is no per-tenant identity to
isolate (§6: single fixed `caller_system`). **This is not a bug** — it is the correct,
verified behavior of the mechanism as designed today. It does mean the contract, as it
exists right now, cannot express "VyaparSethu Business A's AI request must never be
attributable to or billed against VyaparSethu Business B" — that property does not exist
yet on either side. **FLAGGED, NOT FIXED.**

## 8. Request Envelope

Evaluated field-by-field, not assumed necessary:

| Field | Classification | Notes |
|---|---|---|
| `request_id` | REQUIRED | Bell24h-OS already supports this — `X-Request-Id` header, accepted verbatim if well-formed (`^[A-Za-z0-9_.-]{1,128}$`), else server-generated. Verified echoed back on every response, including 401 denials. VyaparSethu currently generates **no** equivalent ID anywhere (§9 finding) — would need to start doing so to participate |
| `correlation_id` | OPTIONAL today, REQUIRED once multi-hop exists | On the Bell24h-OS side, `correlation_id` currently always equals `request_id` — no consumer for a distinct value exists yet (single-process system, nothing downstream re-propagates it). The envelope shape reserves the field so a future divergence isn't a breaking change |
| `organization_id` | FUTURE — blocked on §7 | Cannot be filled in meaningfully until the tenant-mapping question is resolved |
| `actor_id` | FUTURE — blocked on §7 | Same |
| `service_identity` | REQUIRED, already fixed | Always `"vyaparsethu"` per §6 — not a field VyaparSethu sets, it's what the credential itself proves |
| `capability` | REQUIRED (conceptually) | E.g. `"ai.generate_text"` — not formally typed on the Bell24h-OS side today; `/api/v1/ai/text`'s URL path itself currently plays this role |
| `operation` | OPTIONAL | Overlaps with `capability` at current scope (one route, one operation); becomes meaningful once multiple operations share one capability group |
| `timestamp` | OPTIONAL | Not required by any existing Bell24h-OS route; server-side timestamps already exist in audit records |
| `idempotency_key` | FUTURE | Not implemented anywhere in either repository — see §11 |
| `API version` | REQUIRED, already implicit | `/api/v1/` path prefix on the Bell24h-OS side (adopted, additive-only). VyaparSethu has **no API versioning at all** (flat `/api/*`, confirmed this inspection — 206 `route.ts` files, zero `/v1/` or similar prefix anywhere) |
| `metadata` | OPTIONAL | Free-form; Bell24h-OS's own audit metadata shape (`provider`, `model`, `latencyMs`, `errorCode`) is the closest existing precedent |

## 9. Response Envelope

**Bell24h-OS success responses**: route-specific JSON, no canonical success envelope is
mandated by the OS side's own contract draft — confirmed unchanged, this remains true.

**Bell24h-OS error responses** (canonical, `server/lib/errors.ts`, P0-built in the OS
side's own contract sprint, verified still present): `error_code`, `message`,
`request_id`, `correlation_id`, `retryable`, `details`. See §10 for the code list.

**VyaparSethu's current response shape**: ad hoc per route,
`NextResponse.json({ success: boolean, ...data | error }, { status })` — no canonical
envelope, no shared error-code taxonomy across ~206 route handlers (confirmed this
inspection and consistent with every prior sprint's audit of individual routes). This is
a real gap relative to Bell24h-OS's more disciplined shape, not fixed here.

**Provider information disclosure rule** (unchanged from the mission brief, reinforced by
evidence): VyaparSethu should conceptually request `AI TEXT GENERATION`, not
`call NVIDIA API directly`. Bell24h-OS already honors this correctly today —
`/api/v1/ai/text`'s `provider` field is a caller-supplied **preference**
(`"nvidia"` | omitted-for-Gemini), not the caller reaching into a specific vendor's SDK;
the actual HTTP call to `integrate.api.nvidia.com` or Google's API happens entirely inside
Bell24h-OS, never visible to the caller. Confirmed by direct code-path description in
`04E-NVIDIA-PROOF-REPORT.md` §"Route Change."

## 10. Error Contract

Adopting Bell24h-OS's already-implemented `CanonicalErrorCode` union as the starting
point (not inventing a parallel one), extended per the mission brief's list where the
existing set doesn't already cover it:

| Code | HTTP status | Retryable | Exists today? |
|---|---|---|---|
| `AUTHENTICATION_FAILED` | 401 | No | **YES** — Bell24h-OS, verified |
| `AUTHORIZATION_DENIED` (brief: `AUTHORIZATION_FAILED`) | 403 | No | **YES**, under this name |
| `TENANT_NOT_FOUND` (brief: `TENANT_CONTEXT_INVALID`) | 400/404 | No | **YES**, under this name — semantically close, not identical |
| `VALIDATION_FAILED` (brief: `VALIDATION_ERROR`) | 400 | No | **YES**, under this name |
| `RATE_LIMITED` | 429 | Yes | **YES** — implemented, but see §16: not actually applied to `/api/v1/ai/text` today |
| `PROVIDER_UNAVAILABLE` | 503 | Yes | **YES**, verified — this is the exact code returned for both "credential not configured" and "provider rejected the request" (both fail-closed cases) |
| `TIMEOUT` (brief: `PROVIDER_TIMEOUT`) | 504 | Yes | **YES**, under this name — not separately observed triggering in any read report |
| `DUPLICATE_REQUEST` (brief: `IDEMPOTENCY_CONFLICT`) | 409 | No | **YES**, under this name — no idempotency mechanism actually populates it yet (§11) |
| `POLICY_DENIED` | 403 | No | **YES**, defined; no policy engine exists to ever emit it (§4.G) |
| `HUMAN_APPROVAL_REQUIRED` | 202/403 | No | **YES**, defined; no agent/approval flow exists to ever emit it (§4.E) |
| `RESOURCE_NOT_FOUND` | 404 | No | **YES** |
| `INTERNAL_ERROR` | 500 | No | **YES** |
| `INVALID_REQUEST` (mission brief, not in OS union) | 400 | No | Overlaps `VALIDATION_FAILED` — **do not add a duplicate code**; use the existing one |
| `SERVICE_UNAVAILABLE` (mission brief, not in OS union) | 503 | Yes | Overlaps `PROVIDER_UNAVAILABLE` — **do not add a duplicate code** unless a genuinely distinct "Bell24h-OS itself is down" (vs "the downstream provider is down") case is ever needed |

**Leakage check, verified this inspection (citing, not re-running, the OS-side proof
sprints' own checks):** no provider secret, stack trace, internal database error,
credential, or infrastructure detail appears in any captured response body across every
proof sprint read (`03`, `03B`, `04E`). VyaparSethu's own error responses are **not**
similarly disciplined — several routes across the ~206 handlers return raw
`error.message` (a pattern the mission brief's own §26 P1 list flags on the Bell24h-OS
side for `/api/check-table`; VyaparSethu has the equivalent pattern in places, not
inventoried exhaustively here since it's outside this contract's immediate P0 AI scope).

## 11. Idempotency

**Not implemented anywhere in either repository.** Documented as a contract requirement
only, per the mission brief's explicit instruction not to implement it:

| Operation class | Idempotency required? | Rationale |
|---|---|---|
| AI text-generation requests | Recommended, not required at P0 | A duplicate `/api/v1/ai/text` call today just generates text twice, consuming budget twice — wasteful, not corrupting |
| Communication send operations (future) | **Required** | A duplicate WhatsApp/email send is a real user-facing defect (double message), not just waste — see §15 |
| Future outreach (VyaparSethu's own H6-13 campaign engine) | Already partially solved **within VyaparSethu**, not via this contract | H6-13's `consumeClaimInvitation()` uses a conditional `updateMany`-inside-transaction pattern for claim redemption — a real, working idempotency mechanism, but local to VyaparSethu's own database, not a cross-system idempotency-key contract |
| Future media jobs | Required | Re-rendering the same video/image job twice wastes compute and possibly money (paid generation APIs) |
| Future workflow actions | Required | Depends entirely on the (not-yet-built) Workflow contract |

**Proposed shape (design only, not built):** `idempotency_key` (caller-supplied, opaque
string) scoped per `(service_identity, capability)` pair; retention window and duplicate
behavior (return-cached-result vs reject-with-`DUPLICATE_REQUEST`) both **CONTRACT-DEFINED
/ NOT-YET-IMPLEMENTED** — no evidence in either repository suggests a preference.

## 12. Observability Contract

| Field | Bell24h-OS status | VyaparSethu status |
|---|---|---|
| Request ID | EXISTS, propagated | **Does not exist** — no request/correlation-ID pattern found anywhere in VyaparSethu (`grep` this inspection for `X-Request-Id`/`requestId`/`correlationId` in `src/lib`, `src/app/api` returned only unrelated hits: third-party API response IDs like MSG91's `request_id`, not an internal tracing convention) |
| Correlation ID | EXISTS (== request ID today) | Does not exist |
| Service identity | EXISTS (`caller_system`) | N/A — VyaparSethu doesn't call Bell24h-OS today |
| Organization | Blocked on §7 | N/A |
| Capability / operation | Implicit (URL path) | N/A |
| Latency | Logged (`latencyMs` in AI audit metadata) | Not systematically logged anywhere found |
| Status | Logged (`outcome: success/denied`) | Ad hoc per route |
| Provider used internally | Logged (`provider` field) | N/A (VyaparSethu doesn't proxy through Bell24h-OS yet) |
| Retry count | Not logged (no retry logic exists — §14) | N/A |
| Failure reason | Logged (`errorCode`) | Ad hoc, inconsistent (§9) |
| Usage/cost metadata | Logged for AI only (in-memory per-org daily budget) | Not implemented |

**Sensitive-information rule, verified honored on the Bell24h-OS side:** `audit.ts`'s own
header comment forbids secrets/tokens/prompts/raw user content in audit metadata;
confirmed via direct file read this inspection's cited sprints, unchanged. VyaparSethu's
own logger (`lib/logger.ts`, repo root) independently implements the same principle —
auto-redacts keys matching `password|token|otp|secret|apikey|auth` — a convergent, not
coordinated, design choice worth noting as a reusable convention if/when a shared
observability contract is built.

## 13. Rate Limits / Quotas

| Layer | Bell24h-OS status | VyaparSethu status |
|---|---|---|
| Per-service limits | Not implemented | N/A |
| Per-organization limits | EXISTS for AI only — in-memory daily budget (`ProviderRouter.ts`), resets on process restart, single-process only (not durable, not shared across instances) | N/A — no organization concept (§7) |
| Per-user limits | Not implemented | Not implemented |
| Capability-specific limits | AI only | N/A |
| Provider quotas | Not surfaced/tracked distinctly from the org budget | N/A |
| Retry protection | **Gap, confirmed twice** (`03-S2S-AUTH-REPORT.md` §13, `04B` §11): `/api/v1/ai/text` itself has **no rate limiter**, unlike `requireAuth`-gated routes which carry `aiRateLimit`. Not an auth bypass (still blocked by `requireServiceAuth`), but no cap exists on legitimate-but-runaway or credential-guessing traffic once a real token is configured (it now is, per §5) | N/A |

**Not implemented during this sprint, per instruction.** Status recorded honestly, not
optimistically — this remains an open P1 item on the Bell24h-OS side even after the
credential was configured (§5), since configuring the secret and adding a rate limiter
are two independent actions and only the first has happened.

## 14. AI API v1 Contract

The one capability with a real, production-proven implementation. Documented at the level
of detail the mission brief requires, distinguishing implemented from designed:

### CURRENTLY IMPLEMENTED

**Endpoint:** `POST /api/v1/ai/text`
**Authentication:** `requireServiceAuth` (§6) — mandatory, verified fail-closed
**Request body:**
```
{
  "prompt": "<non-empty string>",   // REQUIRED
  "provider": "nvidia" | omitted    // OPTIONAL — omitted = Gemini (default, unchanged historical behavior)
}
```
- `prompt` missing/empty → `400 VALIDATION_FAILED`
- `provider` present but not `"nvidia"` (e.g. a typo) → `400 VALIDATION_FAILED` — **never**
  silently falls back to a default or reaches an unintended provider (verified, 04E Test D)
- `provider: "nvidia"` → routes to `aiRouter.generateNvidiaText()` → `NvidiaProvider.ts`
- `provider` omitted → routes to `aiRouter.generateText()` → `GeminiProvider.ts` (byte-identical
  to pre-04E behavior, verified via local-runtime Test C)

**Response (success):** provider-agnostic JSON body containing the generated text; the
caller never sees which provider actually served the request beyond what it explicitly
requested via `provider` (§9's disclosure rule, honored).

**Response (error):** the canonical envelope, §10.

**Provider selection policy:** caller-chosen between exactly two named providers today
(`nvidia`, `gemini`-via-omission) — **not** an automatic routing/fallback/cost-optimization
policy. Bell24h-OS explicitly does not implement multi-provider fallback, load balancing,
or provider scoring (verified — 04E §Security Check: "No fallback/multi-provider routing,
load balancing, or provider scoring was added").

**Organization context:** the fixed `caller_system: "vyaparsethu"` identity only (§6, §7)
— no finer-grained organization/tenant scoping exists for this endpoint today.

**Temperature/token limits:** not exposed as caller-settable parameters in the current
route — **CONTRACT-DEFINED / NOT-YET-IMPLEMENTED** as a caller-facing option; the adapters
themselves may set internal defaults (not independently re-verified this inspection).

**Timeout/retry semantics:** no explicit retry logic found in `ProviderRouter.ts`
(confirmed by the OS side's own `BELL24H_OS_VYAPARSETHU_SDK_API_CONTRACT_V1.md` §14 —
cited, not re-derived); a failure surfaces as `PROVIDER_UNAVAILABLE`/`TIMEOUT` to the
caller with no automatic retry inside Bell24h-OS.

**Usage information:** per-organization (i.e., per the single fixed `vyaparsethu`
pseudo-org) daily budget tracked in-memory; not returned to the caller in the response
body today (internal enforcement only, not a caller-visible usage/cost field).

**Real production proof:** `HTTP 200`, `NVIDIA production provider: VERIFIED`,
`S2S authentication: VERIFIED`, proof marker `BELL24H-OS-NVIDIA-PROOF-OK` received by the
operator directly, 2026-08-12 — see §5.

### CONTRACT-DEFINED / FUTURE (this contract's stated goal, not built)

Provider routing must remain entirely Bell24h-OS's decision — VyaparSethu should never
select a provider merely because it happens to know NVIDIA/DeepSeek/Qwen/etc. exist; the
`provider` field as it exists today is a narrow exception (a caller **preference** among
two Bell24h-OS-vetted options), not a precedent for VyaparSethu embedding provider
knowledge generally. **Distinguishing note:** VyaparSethu's own live Groq integrations
(§7, §26) are the pattern this contract exists to eventually replace, not the pattern this
`provider` field endorses — the two look superficially similar (both are "callers naming
a provider") but differ completely in where the actual HTTP call to the provider happens
(inside Bell24h-OS vs inside VyaparSethu itself).

Extract, classify, embed, rerank, summarize, transcribe, translate — all
**CONTRACT-DEFINED / NOT-YET-IMPLEMENTED**; only "generate" (via `/api/v1/ai/text`) is
proven.

## 15. Communication Contract

**CONTRACT-DEFINED / NOT-YET-IMPLEMENTED on the Bell24h-OS side. Zero implementation on
either side of this boundary from this sprint.**

```
VyaparSethu
    ↓
Communication capability (conceptual)
    ↓
Bell24h-OS Communication Hub  ← does not exist
    ↓
Provider Adapter  ← does not exist for Communication
    ↓
Meta / Spur / MSG91 / etc.
```

Conceptual operations (design reference only, matching the mission brief and Bell24h-OS's
own §08): send message, send template, delivery status, webhook event, retry, provider
selection, suppression/policy check.

**Current reality on the VyaparSethu side, which this contract must eventually replace,
not extend:**
- A working, provider-boundary-shaped WhatsApp integration already exists in VyaparSethu:
  `src/lib/whatsapp/WhatsAppService.ts` → `MetaWhatsAppProvider.ts` → Meta Cloud API
  (built H6-12). This is **already the correct internal shape** (a single swap point) —
  it is simply pointed at Meta directly today instead of at a future
  `Bell24h-OS Communication Hub`. Re-pointing it, when Gate B is approved, should be a
  contained change inside `WhatsAppService.ts` only.
- A separate, older, MSG91-based WhatsApp outreach path also exists and is **live**
  (`/admin/outreach`, `src/app/api/admin/outreach/bulk-wa/route.ts`) — bypasses any
  provider-boundary pattern entirely, calling MSG91's API directly from the route handler.
- VyaparSethu's H6-13 campaign engine (`src/lib/outreach/OutreachService.ts`) already
  anticipates this contract structurally — it calls `WhatsAppService`, never Meta
  directly, and stubs Email/SMS as `NOT_AVAILABLE` rather than reaching for a new provider
  — but it still terminates at Meta, not at a Bell24h-OS boundary, because no such
  boundary exists yet to terminate at.

**Not built, not altered, per this sprint's rule.** §26 records the disposition of each
existing piece.

## 16. Media Contract

**CONTRACT-DEFINED / NOT-YET-IMPLEMENTED on both sides.** Bell24h-OS's own current-state
document marks this `UNKNOWN` (not `TARGET`) — absence itself was not confirmed, only that
no working pipeline was found. VyaparSethu has its own Cloudinary integration
(`src/lib/cloudinary-server.ts`, referenced in H6-13's environment audit) for product
image uploads — a live, in-domain feature (product photos are VyaparSethu business
content, not a reusable OS capability), not a candidate for migration under this contract
unless a future sprint decides otherwise. No implementation, no boundary design beyond
noting it would follow the same adapter shape as §14/§15 once built.

## 17. Voice Contract

**CONTRACT-DEFINED / NOT-YET-IMPLEMENTED on the Bell24h-OS side.** VyaparSethu's own Voice
RFQ feature (`src/app/api/voice-rfq/transcribe/route.ts`) calls Groq's Whisper API
directly today (`GROQ_API_KEY`, live, confirmed this inspection) — the exact "BAD" pattern
Section 22 names, currently live and in production use for a real product feature. Not
migrated, not fixed, per the read-only rule — recorded in §26.

## 18. Agent Contract

**CONTRACT-DEFINED / NOT-YET-IMPLEMENTED.** No agent runtime exists in Bell24h-OS.
Canonical flow (design reference only, from the OS side's own contract document, cited
not restated): `Agent → Capability → Policy → Permission → Risk classification → Human
approval if required → Execution → Audit`. Five risk categories (Advisory, Reversible,
Financial, Contractual, Irreversible) — no agent gets financial or contractual authority
merely because an API exists. VyaparSethu has no agent implementation to reconcile against
this either.

## 19. Policy Contract

**CONTRACT-DEFINED / NOT-YET-IMPLEMENTED as a general system on either side.** The only
policy-like enforcement anywhere across both repositories: Bell24h-OS's `requireAuth`
fail-closed check + `rateLimit.ts`'s per-org cap (neither is risk-classification or
approval-requirement logic); VyaparSethu's `requireAdmin` role gate (root
`lib/admin-auth.ts`) — same category of narrowness, different domain.

## 20. Audit/Evidence Contract

**Audit PARTIAL, Evidence NOT-YET-IMPLEMENTED**, both sides. Bell24h-OS: write-only,
structured, non-durable (`emitAuditEvent`, stdout only, no `DATABASE_URL` configured for
persistence). VyaparSethu: has its own, entirely separate audit-adjacent tables
(`DataAccessLog`, `ConsentEvent`, `ErasureRequest` — DPDP-compliance-focused, confirmed
present in `prisma/schema.prisma` during H6-13's investigation) — durable (real Postgres
rows), but **not** designed for or connected to Bell24h-OS's audit model in any way.
**Open question** (§28, Q12): what belongs in Bell24h-OS's audit vs VyaparSethu's own
DPDP-compliance audit trail is genuinely unresolved — they currently serve different
regulatory/operational purposes (Bell24h-OS: "what happened on the platform,"
VyaparSethu's DPDP tables: "what personal-data events happened, for compliance"), and
naively merging them would be wrong without a deliberate decision.

Evidence (hash/anchor/verify): confirmed absent from both repositories. Bell24h-OS's own
document is explicit that blockchain-related code exists only in a separate legacy repo
and is "explicitly forbidden to extract" into either current system — this document
carries that prohibition forward unchanged.

## 21. Storage Contract

**INFERRED on the Bell24h-OS side (Supabase Storage referenced in docs, not
independently re-verified this inspection).** VyaparSethu uses Cloudinary for product
images (§16) and Neon Postgres (via Prisma) for all structured data — no shared storage
abstraction exists or is proposed between the two systems by this document.

## 22. Provider Abstraction (restated, evidence-checked)

The absolute rule, restated with VyaparSethu-side evidence attached to every category the
mission brief names:

| Provider | Rule says | Current VyaparSethu reality |
|---|---|---|
| NVIDIA | Must go through Bell24h-OS | **Exception, but dead code.** `src/lib/ai-service-manager.ts` constructs an `OpenAI`-client pointed at `https://integrate.api.nvidia.com/v1` directly, reads `process.env.NVIDIA_API_KEY` directly. **Confirmed unimported by any live route** (`grep` this inspection, zero hits under `src/app`) — scaffold, not live. `NVIDIA_API_KEY` is not even documented in `.env.example`. |
| OpenAI | Must go through Bell24h-OS (implied — same capability class as NVIDIA) | Same file also constructs a direct `OpenAI` client (`OPENAI_API_KEY`) — also dead/unimported. |
| Spur | Must go through Bell24h-OS | **No exception found.** No reference to Spur anywhere in VyaparSethu. |
| Cloudinary | Named in the mission brief's "BAD" example list | **Live exception, but out of the AI/Communication capability classes this contract is scoping.** Cloudinary is VyaparSethu's own product-image storage (§16) — arguably in-domain (product photos are business content), not unambiguously a Bell24h-OS-owned capability under this sprint's own list (Storage is OS-owned generically, but Cloudinary here serves a VyaparSethu business feature, not general storage infrastructure). Flagged as a genuine judgment call, not resolved here. |
| Meta (WhatsApp) | Must go through Bell24h-OS Communication Hub | **Live exception**, already structured as a swap-point (§15) — `WhatsAppService.ts`/`MetaWhatsAppProvider.ts`, H6-12. |
| MSG91 | Must go through Bell24h-OS Communication Hub | **Live exception, two call sites**, no swap-point structure at all — direct `fetch` calls to MSG91's API from `src/lib/services/msg91-service.ts` (OTP) and `src/app/api/admin/outreach/bulk-wa/route.ts` (bulk WhatsApp send) and `src/app/api/claim/verify/route.ts` (claim-flow OTP). |
| Groq | Not named in the mission brief's example list, but same capability class as NVIDIA/OpenAI (AI) | **Live exception, two call sites, no swap-point structure.** `src/app/api/voice-rfq/transcribe/route.ts` (Voice RFQ transcription — a real, shipping product feature) and `src/lib/seo-llm.ts` (SEO content generation, live behind two admin routes) both call `api.groq.com` directly. `src/lib/seo-llm.ts` **also** calls `integrate.api.nvidia.com` directly as a fallback path — a second, independent, live NVIDIA exception distinct from the dead `ai-service-manager.ts` scaffold. |

**Document any current exceptions. Do not fix them during this sprint. Done above.**

## 23. Security Requirements

Minimum rules, cross-checked against both repositories' actual state (not restated as
aspiration where evidence contradicts it):

| Rule | Bell24h-OS | VyaparSethu |
|---|---|---|
| Secrets server-side only | VERIFIED, every proof sprint | VERIFIED for `CLAIM_INVITATION_SECRET`/`META_WHATSAPP_*` (H6-12/H6-13 audits); **not independently re-verified across the whole 206-route surface** this sprint |
| S2S authentication | EXISTS, proven (§6) | Does not exist — VyaparSethu holds no credential for calling Bell24h-OS |
| Tenant isolation | Enforced for user-authenticated routes; **not meaningful for the S2S route** (§7) | No tenant concept exists to isolate |
| Authorization / least privilege | Auth-only, no real RBAC (§4.F) | `requireAdmin` role gate exists; broader RBAC not audited this sprint |
| No provider credential exposure | VERIFIED (§6) | VERIFIED for the H6-12/13-audited paths; MSG91/Groq credentials not independently re-audited this sprint (no prior finding of exposure, but no fresh check either) |
| Safe errors | VERIFIED for canonical `/api/v1/*` envelope | Not consistently applied (§9, §10) |
| Auditability | Write-only, non-durable (§20) | Separate, durable, DPDP-focused (§20) |
| Rate limiting | Exists for user routes; **absent on `/api/v1/ai/text`** (§13, confirmed P1) | Confirmed **no working rate-limit framework exists anywhere** in VyaparSethu (H6-13's own security review — `src/middleware/rate-limiter.ts` and `src/lib/rate-limit.ts` both dead code, neither imported) |
| Idempotency | Not implemented (§11) | Not implemented generically; one narrow, local exception (H6-13 claim redemption) |
| Request tracing | EXISTS (§8, §12) | Does not exist |
| Webhook verification | Not applicable to this contract's current scope (no Communication Hub webhooks exist yet) | VyaparSethu **does** have this today for its own inbound webhooks — Razorpay (HMAC-SHA256), Resend (svix), Meta WhatsApp (H6-12, HMAC-SHA256 + verify-token handshake) — a real, working pattern that could inform Bell24h-OS's future Communication Hub webhook design, cited as prior art rather than duplicated |
| Credential rotation | Not designed (§6) | Not designed |
| Policy enforcement | Narrow (§19) | Narrow (§19) |

## 24. Versioning

Adopted from the Bell24h-OS side, since it already exists and works, not reinvented:

- **API version:** `/api/v1/*` namespace, additive-only, adopted for new SDK-surface
  routes; every pre-existing Bell24h-OS route stays exactly where it is.
- **Contract version:** this document is `v1.0`.
- **Backward compatibility:** additive changes are compatible within `v1`; breaking
  changes require a new major version (`v2`).
- **Deprecation policy:** not defined by either repository today — **CONTRACT-DEFINED /
  NOT-YET-IMPLEMENTED**, matching the OS side's own honest admission that no
  deprecation-window policy exists yet.
- **VyaparSethu-side versioning:** does not exist at all (§8) — adopting this contract
  does not require VyaparSethu to retroactively version its own ~206 existing routes;
  only new routes that call Bell24h-OS would need to carry the `api_version` field the
  request envelope reserves (§8).

## 25. Contract Status Matrix

| Capability | Owner | Current Implementation | Contract v1 | Provider | Gate |
|---|---|---|---|---|---|
| AI (text generation) | Bell24h-OS | PROVEN (`/api/v1/ai/text`, Gemini + NVIDIA) | DEFINED (§14) | NVIDIA / Gemini | Gate A closed; Gate B not started |
| AI (extract/classify/embed/etc.) | Bell24h-OS | NOT IMPLEMENTED | FUTURE | — | Gate B |
| Communication | Bell24h-OS | NOT IMPLEMENTED | CONTRACT-ONLY (§15) | Meta / Spur / MSG91 (future) | Gate B |
| Media | Bell24h-OS | UNKNOWN (not confirmed absent or present) | CONTRACT-ONLY (§16) | — | Gate B |
| Voice | Bell24h-OS | NOT IMPLEMENTED | CONTRACT-ONLY (§17) | — | Gate B |
| Agents | Bell24h-OS | NOT IMPLEMENTED | CONTRACT-ONLY (§18) | — | Gate B+ |
| Identity | Bell24h-OS | PARTIAL (authN + tenant-context proven; authZ/RBAC missing) | DEFINED (§6) | Supabase | Gate B |
| Policy | Bell24h-OS | PARTIAL (auth + rate-limit only) | CONTRACT-ONLY (§19) | — | Gate B+ |
| Audit | Bell24h-OS | PARTIAL (write-only, non-durable) | CONTRACT-ONLY (§20) | — | Gate B+ |
| Evidence | Bell24h-OS | NOT IMPLEMENTED | CONTRACT-ONLY (§20) | — | Gate B+ |
| Storage | Bell24h-OS | INFERRED (Supabase Storage) | CONTRACT-ONLY (§21) | Supabase | Gate B+ |
| S2S Authentication | Bell24h-OS | PROVEN (§6) | DEFINED | — | Gate A closed |

## 26. Integration Decision Matrix

For each existing VyaparSethu provider-adjacent capability, per the mission brief's exact
categories. **Nothing moved — decision-recording only.**

| Capability | Current state | Decision |
|---|---|---|
| Meta WhatsApp (`src/lib/whatsapp/`) | Live, H6-12, already provider-boundary-shaped | **FUTURE MIGRATION** — swap `MetaWhatsAppProvider` for a Bell24h-OS Communication Hub call once it exists; no VyaparSethu business-logic change needed given the existing boundary |
| MSG91 (OTP: `src/lib/services/msg91-service.ts`) | Live, direct | **KEEP IN VYAPARSETHU** — OTP/auth is arguably VyaparSethu's own auth concern, not a Bell24h-OS Communication capability; **NEEDS ARCHITECTURE REVIEW** to confirm this categorization rather than assume it |
| MSG91 (bulk WhatsApp outreach: `bulk-wa/route.ts`) | Live, direct, no boundary | **FUTURE MIGRATION**, same target as Meta WhatsApp — currently the least-abstracted of all the provider exceptions found |
| Groq (Voice RFQ transcription) | Live, direct | **FUTURE MIGRATION** to Bell24h-OS Voice capability (§17) once it exists — currently has no Bell24h-OS capability to migrate to |
| Groq + NVIDIA (`src/lib/seo-llm.ts`) | Live, direct, dual-provider fallback already hand-rolled inside VyaparSethu | **FUTURE MIGRATION** to Bell24h-OS AI capability (§14) — ironically, this file already re-implements exactly the kind of provider-fallback logic Bell24h-OS's `/api/v1/ai/text` is meant to centralize, just entirely inside VyaparSethu instead |
| NVIDIA + OpenAI (`src/lib/ai-service-manager.ts`) | **Dead code**, unimported | **NEEDS ARCHITECTURE REVIEW** — recommend deletion (unreachable, duplicates what Bell24h-OS's AI capability already does correctly) rather than migration, since there's nothing live to migrate; a decision for whoever owns VyaparSethu code hygiene, not this sprint |
| Cloudinary (product images) | Live, direct | **KEEP IN VYAPARSETHU** — in-domain business content (§16, §22), not a clear Bell24h-OS Storage-capability candidate; flagged for review, not decided |
| Razorpay (payments) | Live, direct | **KEEP IN VYAPARSETHU** — Payment orchestration and Escrow business rules are explicitly VyaparSethu-owned per §2/Section 4 of the mission brief; not a Bell24h-OS capability at all, no migration question exists |
| Notifications (in-app, `Notification` Prisma model) | Live, VyaparSethu-only | **KEEP IN VYAPARSETHU** — in-app notification records are business-domain data (tied to RFQ/Quote/Deal events), distinct from the Communication Hub's outbound-message-sending role |

## 27. Gate B Readiness Criteria

Marked `READY` only where repository evidence supports it — nothing marked ready on
aspiration:

- [x] S2S credentials can be securely stored — Bell24h-OS side proven (§5, §6); VyaparSethu side does not need to store Bell24h-OS's credential under the current design (Bell24h-OS validates a token *it* issues, not one VyaparSethu manages) — **READY on the Bell24h-OS side**
- [ ] VyaparSethu server-side client exists or can exist — **NOT READY.** No client/SDK code for calling Bell24h-OS exists in VyaparSethu today (correctly — this sprint forbids building one); the shape it would take is undesigned beyond this document's envelope sketch (§8, §9)
- [ ] Tenant context is available — **NOT READY.** §7's core finding — VyaparSethu has no tenant model to make available
- [ ] Organization identity is available — **NOT READY.** Same as above
- [x] Request IDs can propagate — **READY on the Bell24h-OS side** (§8); VyaparSethu would need to start generating/forwarding an ID, which is a small, well-precedented addition, not an architecture problem
- [x] Error contract can be consumed — **READY.** Bell24h-OS's canonical envelope (§10) is simple, stable JSON; nothing prevents VyaparSethu from parsing it today
- [ ] Retry semantics are defined — **NOT READY.** Neither side has designed this (§11, §14)
- [ ] Idempotency strategy is defined — **NOT READY.** §11 — design-only, nothing decided
- [x] Provider abstraction is respected — **PARTIALLY READY.** Where it matters most (AI, via `/api/v1/ai/text`) it's fully respected on the Bell24h-OS side. VyaparSethu's own live exceptions (§22, §26) are the actual blocker for VyaparSethu-side readiness, not Bell24h-OS's
- [x] No secrets reach browser — **READY**, verified on both sides for every credential class actually checked (§6, §23)
- [ ] Logging/tracing is possible — **PARTIALLY READY.** Bell24h-OS: yes. VyaparSethu: no request-tracing convention exists to hook into (§12)
- [x] Existing provider integrations have an ownership decision — **READY.** §26 records a decision (even if some are "needs further review") for every live integration found
- [x] AI v1 contract is implementable — **READY.** It's not just implementable, it's already implemented and production-proven (§5, §14)
- [x] Communication boundary is defined — **READY as a *contract* definition** (§15); not implemented, which is a separate, later gate, not this checklist item's requirement

**Net: Gate B is blocked primarily on the tenant/organization-identity question (§7) and
on VyaparSethu building any server-side capability to call Bell24h-OS at all — not on
anything wrong with Bell24h-OS's AI capability itself, which is the one part of this
contract already proven end-to-end.**

## 28. Open Questions

Not silently resolved. Recorded exactly as the mission brief requires:

1. **Who owns tenant identity at the OS boundary?** (§7) — the single most important
   unresolved question in this document.
2. **Which organization ID is authoritative** once/if VyaparSethu gets one? Not
   answerable until Q1 is decided.
3. **Should AI provider selection ever be exposed to VyaparSethu** beyond the narrow
   `nvidia`/`gemini` preference `/api/v1/ai/text` already allows? Current evidence (§14)
   suggests the existing narrow exposure is intentional and should not widen without a
   specific reason.
4. **Which communication capabilities move first** — Meta WhatsApp (already
   boundary-shaped, §26) is the obvious lowest-friction first migration; MSG91 bulk
   outreach (least abstracted) would need the most rework.
5. **Does Meta remain the first communication provider** once a real Communication Hub
   exists, or does Spur take that position? No evidence in either repository favors one
   over the other — this is a product/vendor decision, not an engineering one.
6. **When/if should Spur become another adapter?** Same as Q5 — no repository evidence
   either way.
7. **What is the canonical SDK transport?** Plain HTTP/JSON (what exists today) vs a
   generated client library vs something else — not decided by either repository.
8. **What retry semantics are acceptable?** §11, §14 — undesigned.
9. **Which operations require idempotency?** §11 gives a first-pass answer (Communication
   sends: yes; AI generation: recommended but not required); not ratified as a decision.
10. **What data may cross the OS boundary?** Not formally enumerated anywhere — today
    only a `prompt` string crosses for AI; nothing about business data (RFQ content,
    supplier identity, etc.) crossing has been decided either way.
11. **What data must never cross it?** Same — not formally enumerated. Should explicitly
    include: raw payment/escrow data, KYB documents, and anything DPDP-consent-gated
    (VyaparSethu's `ConsentEvent`/`OutreachConsentLog` tables) unless a specific, deliberate
    decision says otherwise.
12. **What belongs in OS audit vs VyaparSethu business audit?** §20 — genuinely
    unresolved, not just undesigned.
13. **Which repository is "VyaparSethu" from Bell24h-OS's perspective** —
    `bell24xcom/forBell24x` (inspected for this document) or `digitex-erp/bell24h`
    (referenced in Bell24h-OS's own docs)? §3 — this affects which codebase Gate B
    actually targets and was not resolved by this sprint.
14. **What is the canonical error schema** once VyaparSethu starts consuming Bell24h-OS
    errors — adopt `CanonicalErrorCode` verbatim, or map it into VyaparSethu's own ad hoc
    `{success, error}` shape (§9)? Not decided.

## 29. Non-Goals

This sprint explicitly did NOT:

- Implement Gate B
- Implement the SDK
- Implement API clients
- Implement a Communication Hub
- Integrate Spur
- Replace Meta
- Generalize providers
- Implement Gemini/DeepSeek/Qwen/GLM/MiniMax beyond what already exists
- Implement Video Factory
- Implement SEO Factory
- Implement supplier agents
- Implement Trust Graph
- Implement ONDC
- Implement B2C
- Modify H6-13
- Activate WhatsApp outreach
- Deploy anything

## 30. Change Control

This document is `v1.0`. Future revisions should be versioned (`v1.1`, `v2.0` on breaking
restructure) and should explicitly note which sections changed and why, following the
same evidence-classification discipline used throughout this document (VERIFIED /
INFERRED / CONTRACT-DEFINED / NOT-YET-IMPLEMENTED / FUTURE — never silently upgrading a
status without new evidence). Any future update should also re-check whether Bell24h-OS's
own `BELL24H_OS_VYAPARSETHU_SDK_API_CONTRACT_V1.md` has been refreshed to close the
staleness finding in §5, and reconcile against whichever is more current at that time.

---

## 31. Final Report

**A. What was inspected:**
- VyaparSethu (`C:\Users\Sanika\Projects\bell24h`): `prisma/schema.prisma` (tenant/org
  search), `src/lib/jwt.ts`, `root lib/admin-auth.ts`, `src/lib/whatsapp/*` (H6-12),
  `src/lib/outreach/*` (H6-13), `src/lib/ai-service-manager.ts`,
  `src/app/api/voice-rfq/transcribe/route.ts`, `src/lib/seo-llm.ts`,
  `src/app/api/admin/outreach/bulk-wa/route.ts`, `src/lib/services/msg91-service.ts`,
  `lib/logger.ts`, `.env.example`, `docs/project/H6-12-WHATSAPP-INTEGRATION-REPORT.md`,
  `docs/project/H6-13-COMPANY-CLAIM-OUTREACH-REPORT.md`, `git status`/`branch`/`HEAD`/`remote`.
- Bell24h-OS (`C:\Users\Sanika\digitex-erp-bell24h-os`, read-only):
  `docs/architecture/BELL24H_OS_VYAPARSETHU_SDK_API_CONTRACT_V1.md`,
  `docs/architecture/BELL24H_OS_CURRENT_STATE.md`,
  `docs/architecture/OS_API_SECURITY_BOUNDARY_V1.md`,
  `docs/project/OS-INTEGRATION-IMPLEMENTATION-03-S2S-AUTH-REPORT.md`,
  `docs/project/OS-INTEGRATION-IMPLEMENTATION-04B-GEMINI-PROOF-REPORT.md`,
  `docs/project/OS-INTEGRATION-IMPLEMENTATION-04C-AI-PROVIDER-ROUTING-REPORT.md`,
  `docs/project/OS-INTEGRATION-IMPLEMENTATION-04D-NVIDIA-ADAPTER-REPORT.md`,
  `docs/project/OS-INTEGRATION-IMPLEMENTATION-04E-NVIDIA-PROOF-REPORT.md`,
  file mtimes across all `docs/architecture/*.md` and `docs/project/*.md`,
  `git status`/`branch`/`HEAD`/`remote`.

**B. What was confirmed:** S2S authentication mechanism and its production configuration;
`/api/v1/ai/text` with NVIDIA + Gemini provider selection, production-proven via a real
operator-performed HTTP 200 call; the canonical error envelope; the absence of a tenant
model anywhere in VyaparSethu; three live, direct-to-provider AI exceptions in VyaparSethu
(Groq ×2, plus MSG91/Meta for Communication) and one dead one (NVIDIA/OpenAI scaffold);
that Bell24h-OS's own prior contract document is now stale on its central claim.

**C. What was inferred:** Storage (Bell24h-OS side, Supabase — not independently
re-verified); that `digitex-erp/bell24h` and `bell24xcom/forBell24x` may or may not be the
same codebase under different names (§28 Q13).

**D. What remains unknown:** Media pipeline status on the Bell24h-OS side (their own docs
mark it `UNKNOWN`, not `TARGET` — not re-investigated here, out of this sprint's AI-first
scope); Vercel environment-variable scoping (Production vs Preview) for
`BELL24H_VYAPARSETHU_SERVICE_TOKEN`; whether VyaparSethu's ~206 routes have any other
undiscovered direct-provider exceptions beyond the ones this targeted search found.

**E. What the contract defines:** See §6–§21 — authentication, tenant/identity (as an
open question, not a resolution), request/response envelopes, error taxonomy, idempotency
posture, observability fields, rate-limit posture, the full AI v1 contract, and
contract-only boundaries for Communication/Media/Voice/Agents/Policy/Audit/Evidence/Storage.

**F. Current implementation vs target architecture:** §25 (Contract Status Matrix) is the
single-table summary; §26 (Integration Decision Matrix) is the per-provider detail.

**G. Gate B prerequisites:** §27 — two items are the real blockers (tenant identity;
VyaparSethu-side server client), most others are either already satisfied or are design
decisions rather than implementation blockers.

**H. P1 security findings:** carried forward from the mission brief's own list (§26 of the
brief), independently corroborated by primary evidence this inspection: `/api/check-table`
raw-error disclosure (Bell24h-OS, `OS_API_SECURITY_BOUNDARY_V1.md` §5) and
`/api/check-users-count` cross-tenant count disclosure (same source) — both confirmed via
direct citation of the OS-side security boundary document, not re-tested live this sprint
(read-only). `/api/v1/ai/text` rate-limiting gap — confirmed via two independent OS-side
sprint reports (`03`, `04B`). `JobOrchestratorService.ts` browser-shipped — confirmed via
`04D`'s import-graph finding. Provider environment-variable scope governance — confirmed
undecided via `OS_API_SECURITY_BOUNDARY_V1.md` §8. None fixed; all cited to their source
evidence rather than re-derived.

**I. Open architecture questions:** §28, fourteen items, none silently resolved.

**J. Exact files changed:** one file created —
`docs/project/BELL24H-OS-VYAPARSETHU-SDK-API-CONTRACT-v1.0.md` (this document), in the
VyaparSethu repository only. Zero files changed in the Bell24h-OS repository (read-only
throughout — confirmed by never issuing a write/edit tool call against
`C:\Users\Sanika\digitex-erp-bell24h-os`).

**K. Git status:** see §32.

**L. NO APPLICATION IMPLEMENTATION PERFORMED.**

---

## 32. Final Audit

Performed against **both** repositories.

**VyaparSethu** (`C:\Users\Sanika\Projects\bell24h`):
```
git status --short   → only this document is new (untracked); every other
                        modified/untracked entry present belongs to the
                        already-uncommitted H6-12/H6-13 work (unrelated to
                        this sprint, not touched by it) or pre-existing
                        unrelated files from before either sprint
git diff --stat       → zero changes to any tracked application file this
                        sprint (this document is a new file, not a diff to
                        an existing one)
```
Confirmed: no application source changed. No API route changed. No database/schema
changed (this sprint did not touch `prisma/schema.prisma`, unlike H6-13 which did — that
change predates and is unrelated to this sprint). No package file changed. No env file
changed (`.env.example` was **not** touched this sprint — its H6-12/H6-13-era changes
predate this sprint). No provider code changed. No Meta code changed. No H6-13 code
changed.

**Bell24h-OS** (`C:\Users\Sanika\digitex-erp-bell24h-os`):
```
git status --short → (empty — clean, unchanged from the clean state
                       confirmed at the start of this inspection)
```
Confirmed: zero files touched in the Bell24h-OS repository.

**Not committed. Not pushed. Not deployed.**
