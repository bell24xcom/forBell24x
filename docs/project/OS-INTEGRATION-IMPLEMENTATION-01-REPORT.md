# OS-INTEGRATION-IMPLEMENTATION-01 — VyaparSethu → Bell24h-OS Controlled AI Integration

**Status:** CONTROLLED IMPLEMENTATION — complete, not committed, not pushed, not deployed.
**Date:** 2026-08-16
**Role:** Chief Implementation Engineer
**Authoritative readiness audit:** `docs/project/OS-INTEGRATION-GATE-B-01-READINESS-AUDIT.md`
**Authoritative contract:** `docs/project/BELL24H-OS-VYAPARSETHU-SDK-API-CONTRACT-v1.0.md`

---

## 1. Executive Summary

Implemented the smallest possible production-safe path proving
`VyaparSethu → Bell24h-OS requireServiceAuth → /api/v1/ai/text → AI Provider Manager →
NVIDIA → real completion`. Two new files, two small additive edits to existing config
files, 18 automated tests (all passing), a clean typecheck/lint/build. Bell24h-OS was not
modified — re-verified against current source before writing any code, and confirmed
unchanged (`git status` clean, same `HEAD`) after. No provider SDK, no schema change, no
tenant model, no scope creep beyond the AI-text path this sprint was authorized for.

**The runtime integration test was NOT executed** — `BELL24H_OS_BASE_URL` and
`BELL24H_VYAPARSETHU_SERVICE_TOKEN` are not configured in this environment, and per the
mission brief's explicit instruction this sprint did not attempt to obtain them, fabricate
a token, or work around the gap. Every other acceptance criterion is met.

## 2. Pre-implementation Baseline

**VyaparSethu**, before any change this sprint:
```
branch: main
HEAD: 7661194939e5467fa3aac4bfdcedb4878bbb4607
origin/main: 7661194939e5467fa3aac4bfdcedb4878bbb4607 (matched)
git status: dirty — H6-12/H6-13/contract-doc/Gate-B-audit work, all pre-existing
            from prior sprints, none created by this sprint
```

**Bell24h-OS**, re-verified before any code was written (Phase 7 of the mission brief):
```
branch: main
HEAD: c27f8e5cdd524ce1af510184164abd90e63e136d
origin/main: c27f8e5cdd524ce1af510184164abd90e63e136d (matched)
git status: clean
```
`server/middleware/requireServiceAuth.ts` and the `/api/v1/ai/text` handler in `server.ts`
were read in full from current source. **No discrepancy found** against the contract or
the Gate B audit — implementation proceeded without adapting the contract.

## 3. Files Created

- `src/lib/bell24h-os/client.ts` — the server-only client (config reading + the one HTTP
  operation, `generateAiText`). Kept as a single file rather than the H6-12 WhatsApp
  module's 3-file split — deliberate, both because this module has exactly one operation
  and because a cross-file relative import (`config.ts` → `client.ts`) broke Node's native
  test-runner module resolution (`ERR_MODULE_NOT_FOUND`) while an explicit `.ts` extension
  in that import broke `tsc` (`TS5097: allowImportingTsExtensions` not enabled in this
  project's tsconfig). Merging into one file removed the cross-file import entirely,
  satisfying both toolchains without adding a resolver/loader — the more "intentionally
  minimal" outcome per the mission brief's own instruction.
- `src/lib/bell24h-os/client.test.ts` — 18 tests, `node --test` (Node's built-in runner,
  same zero-new-dependency approach established in H6-13).
- `src/app/api/admin/bell24h-os/test-ai/route.ts` — the one admin-gated integration test
  endpoint (`POST` to run the test, `GET` for status only).

## 4. Files Modified

- `.env.example` — added `BELL24H_OS_BASE_URL` and `BELL24H_VYAPARSETHU_SERVICE_TOKEN` as
  empty placeholders, with a comment stating the token must be the exact value configured
  on the Bell24h-OS side. No default value, no fallback.
- `package.json` — added one script, `"test:bell24h-os": "node --test src/lib/bell24h-os/*.test.ts"`.

No other file was modified. `prisma/schema.prisma`, `.github/workflows/ci.yml`,
`src/app/admin/layout.tsx`, the H6-13 claim-flow files, and `src/app/features/voice-rfq/page.tsx`
all show as modified in `git status` because that work predates this sprint (H6-12/H6-13,
still uncommitted) — `git diff --stat` for each of those files is byte-identical to the
pre-implementation baseline (§2), confirmed this sprint touched none of them.

## 5. Bell24h-OS Contract Verification

Re-read from current source this sprint (not from the contract/audit documents' own
citations, though they matched):

| Property | Verified value |
|---|---|
| Method | `POST /api/v1/ai/text` |
| Auth header | `X-Bell24h-Service-Token` (`server/middleware/requireServiceAuth.ts:36`) |
| Auth failure | `401 AUTHENTICATION_FAILED` (missing/invalid), `503 PROVIDER_UNAVAILABLE` (server secret unset) |
| Request body | `{ prompt: string, provider?: "nvidia" \| "gemini" }` (`server.ts:92,104`) |
| Response (success) | `{ text: string, requestId: string }` (`server.ts:120`) |
| Response (error) | `{ error_code, message, request_id, correlation_id, retryable, details? }` (`server/lib/errors.ts`) |
| Request-ID header | `X-Request-Id`, pattern `^[A-Za-z0-9_.-]{1,128}$` (`server/lib/requestContext.ts:24`) |

**No material difference from the approved contract was found.** Implementation proceeded
as designed.

## 6. S2S Authentication Implementation

`generateAiText()` sends `X-Bell24h-Service-Token: <BELL24H_VYAPARSETHU_SERVICE_TOKEN>` on
every call, read fresh from `process.env` at call time (never cached, never logged). No
second authentication mechanism was invented — this is the one, already-proven Bell24h-OS
mechanism, consumed exactly as documented. Verified by test (`client.test.ts`, "B: sends
the correct X-Bell24h-Service-Token header").

## 7. Server-only Security Boundary

- `src/lib/bell24h-os/client.ts` contains no `'use client'` directive and is never
  imported by one — confirmed by direct search: its only importer in the entire
  repository is `src/app/api/admin/bell24h-os/test-ai/route.ts`, itself a Next.js Route
  Handler (server-only by the framework's own architecture, not by convention alone).
- No `NEXT_PUBLIC_*` variable was added for either the base URL or the token.
- Confirmed absent from the built client bundle (`.next/static/chunks/`) — see §13.

## 8. Environment Configuration

```
BELL24H_OS_BASE_URL=""               # e.g. https://digitex-erp-bell24h-os.vercel.app
BELL24H_VYAPARSETHU_SERVICE_TOKEN="" # must equal the Bell24h-OS side's value exactly
```

Both added to `.env.example` only, as empty strings. No real value was written anywhere —
not in source, not in this document, not in any log. The client fails closed
(`NOT_CONFIGURED`) whenever either is absent; it never falls back to a hardcoded URL
(localhost or otherwise) or a default token.

## 9. Test Route

`POST /api/admin/bell24h-os/test-ai`:
1. `requireAdmin(req)` — the existing, unchanged VyaparSethu admin-auth mechanism.
2. Checks `getSafeStatus()`; returns `{ testResult: 'NOT_AVAILABLE' }` if not configured.
3. Requires `{ confirm: true }` in the body — rejects with `400` otherwise, mirroring the
   H6-12 `/api/admin/whatsapp-meta/test-send` pattern exactly.
4. Calls `generateAiText()` with a **fixed, server-side, non-caller-configurable** prompt
   (`"Return exactly: BELL24H-OS-INTEGRATION-OK"`) and a **fixed** provider (`'nvidia'`).
   No field from the request body is ever forwarded to Bell24h-OS except the confirm flag
   itself, which never leaves this route. This is not a generic proxy — the route accepts
   no provider name, no URL, no header, no arbitrary prompt from the caller.
5. Returns a sanitized result (`testResult`, `text`/`errorMessage`, `requestId`,
   `durationMs`, `timestamp`) — never the service token, never a raw upstream body beyond
   the already-sanitized `message`/`text` fields Bell24h-OS itself returns.

`GET /api/admin/bell24h-os/test-ai` returns status only (no call made), mirroring
`/api/admin/whatsapp-meta/status`.

## 10. Automated Tests

`npm run test:bell24h-os` → `node --test src/lib/bell24h-os/*.test.ts`:

```
tests 18
pass  18
fail  0
```

Mapped to the mission brief's Phase 19 checklist:

| # | Requirement | Covered by |
|---|---|---|
| A | Missing configuration fails safely | `A: missing configuration returns NOT_CONFIGURED and never calls fetch` + 2 config-level tests |
| B | Correct authentication header | `B: sends the correct X-Bell24h-Service-Token header`, `B: sends an X-Request-Id header matching...` |
| C | Correct Bell24h-OS endpoint | `C: calls the correct Bell24h-OS endpoint`, `C: strips a trailing slash...` |
| D | Non-2xx responses handled safely | 3 tests — 401 canonical envelope, 503 canonical envelope, network-throw |
| E | Secrets not returned | `E: no outcome branch ever serializes the service token` + a config-level test |
| F | Unauthorized users cannot invoke the route | **Not independently unit-tested** — `requireAdmin` is reused unchanged from H6-12/H6-13 (root `lib/admin-auth.ts`), already exercised by every prior sprint's own routes; no new authorization logic was written for this route to test |
| G | Successful mocked response translated correctly | `G: a successful mocked response is translated correctly` |

Two additional tests beyond the checklist: request-body-shape strictness (never forwards
an arbitrary field) and a defensive check that a 200 response missing the `text` field is
treated as an error rather than a silent, malformed success.

## 11. Typecheck

`npx tsc --noEmit`: **zero errors in `src/lib/bell24h-os/*` or
`src/app/api/admin/bell24h-os/*`**, confirmed by scoped grep against the full sweep
output. The full-repo sweep itself still reports the same pre-existing error volume in
unrelated legacy/dead code (root-level Vite scaffold, orphaned `components/`, etc.)
documented as a known baseline in every prior sprint this session (H6-12, H6-13, contract
sprint, Gate B audit) — not a regression introduced here.

One real bug was caught and fixed during this step: `getConfigOrThrow`'s original return
type annotation, `Required<Bell24hOsConfig>`, does not actually remove `| undefined` from
a property that was already required-but-unioned (`baseUrl: string | undefined`, no `?`)
— `Required<>` only affects optional (`?`) properties. Fixed by declaring the return type
directly as `{ baseUrl: string; serviceToken: string }` instead of relying on `Required<>`
to do work it doesn't do. (This function was subsequently removed entirely when `config.ts`
was merged into `client.ts` — §3 — but the type-correctness lesson is recorded here since
it's a real, easy-to-repeat mistake.)

## 12. Production Build

`NODE_OPTIONS=--max-old-space-size=1536 npx next build` (same memory-constrained
foreground approach every prior sprint in this session needed on this machine — ~1.9GB
free of 7.8GB total RAM):

- **Exit code 0.**
- Zero "Failed to compile".
- `/api/admin/bell24h-os/test-ai` appears in the compiled route table.
- Every H6-12/H6-13 route (`/admin/whatsapp-cloud-api`, `/admin/company-claim-outreach`,
  `/api/webhooks/meta-whatsapp`, `/claim/[token]`, etc.) still present, unmodified.
- `/voice-rfq` and `/features/voice-rfq` still present, untouched.
- No client/server boundary violation — confirmed in §13.

## 13. Static Security Audit

- `grep -rl "BELL24H_VYAPARSETHU_SERVICE_TOKEN\|NEXT_PUBLIC_BELL24H" .next/static/chunks/`
  → **zero matches.**
- `grep -rEn` for a hardcoded token/URL value (excluding the test file's own
  clearly-labeled dummy values `test-token-...`/`test-service-token-...`) across
  `src/lib/bell24h-os`, `src/app/api/admin/bell24h-os`, and `.env.example` → **zero
  matches.**
- `grep -rn "bell24h-os/client"` across all of `src` → **exactly one importer**,
  `src/app/api/admin/bell24h-os/test-ai/route.ts` (a server-only Route Handler).

**Token is server-only. Confirmed.**

## 14. Runtime Integration Test

**NOT EXECUTED.**

`BELL24H_OS_BASE_URL` and `BELL24H_VYAPARSETHU_SERVICE_TOKEN` are not configured anywhere
in this environment (`.env.local` was not inspected for secrets per standing policy, and
neither variable is set in the shell environment this session runs in). Per the mission
brief's explicit instruction: no attempt was made to obtain the secret from the user, no
token was fabricated, and no workaround was attempted.

```
Integration runtime test NOT EXECUTED
Reason: required secret/configuration unavailable.
```

The path is proven at the code level (§10 — 18/18 passing tests against a mocked Bell24h-OS,
covering every branch: success, every documented error code, network failure, and
configuration absence) and Bell24h-OS's own side of this exact path is independently
production-proven (`OS-INTEGRATION-IMPLEMENTATION-04E-NVIDIA-PROOF-REPORT.md`, operator-
performed, 2026-08-12, `HTTP 200`, marker `BELL24H-OS-NVIDIA-PROOF-OK`). What remains
unproven is only the literal end-to-end wire-up once both secrets are configured on this
side — an operator action, not an engineering gap.

**Operator action needed** (not performed by this sprint): set
`BELL24H_OS_BASE_URL=https://digitex-erp-bell24h-os.vercel.app` and
`BELL24H_VYAPARSETHU_SERVICE_TOKEN=<the same value already configured on the Bell24h-OS
side>` in this deployment's environment, then call
`POST /api/admin/bell24h-os/test-ai` with `{"confirm": true}` as an authenticated admin.
Expected successful response: `{"success": true, "testResult": "OK", "text": "BELL24H-OS-INTEGRATION-OK", ...}`.

## 15. Bell24h-OS Repository Verification

Re-checked after implementation:
```
cd C:\Users\Sanika\digitex-erp-bell24h-os
git status --short  → (empty)
git rev-parse HEAD  → c27f8e5cdd524ce1af510184164abd90e63e136d  (unchanged)
```
**Zero files touched. Zero write/edit tool calls issued against this repository at any
point in this sprint.**

## 16. Existing Debt Left Untouched

Per the mission brief's Section 3 — confirmed not migrated, not refactored, not touched:
Groq Voice RFQ, Groq/NVIDIA SEO path, MSG91 (OTP and bulk outreach), Meta WhatsApp Cloud
API (H6-12/H6-13), the dead `src/lib/ai-service-manager.ts` scaffold,
`JobOrchestratorService.ts` browser-shipped issue (Bell24h-OS side), the two Bell24h-OS
disclosure routes (`/api/check-table`, `/api/check-users-count`), generic rate limiting
(either side), and request-ID generation improvements beyond this sprint's own scoped
client. `git diff --stat` (§4) confirms none of these files were touched.

## 17. Acceptance Criteria

- [x] Bell24h-OS source contract still matches (§5)
- [x] Server-only client exists (`src/lib/bell24h-os/client.ts`)
- [x] Correct S2S header is used (§6, tested)
- [x] Service token is never client-exposed (§13)
- [x] Bell24h-OS base URL is environment-driven, no fallback (§8)
- [x] `/api/v1/ai/text` is called correctly (§5, §10)
- [x] No provider SDK is added
- [x] No provider credentials are added
- [x] No database schema changes
- [x] No tenant model added
- [x] Admin-gated test route exists (§9)
- [x] Unauthorized access is rejected — via the existing, unmodified `requireAdmin` mechanism (not independently re-tested this sprint, §10 item F)
- [x] Error handling is safe (§10, §13)
- [x] Typecheck passes for changed scope (§11)
- [x] Production build passes (§12)
- [x] Static secret-exposure audit passes (§13)
- [x] Bell24h-OS repository remains unchanged (§15)
- [x] Existing H6-12/H6-13 functionality remains untouched (§4, §16)

**17/17 met.**

## 18. Known Limitations

- The runtime integration test was not executed (§14) — the one item this report cannot
  mark fully closed, by design, since the required secrets are not available to this
  session.
- Unauthorized-access rejection for the new route relies on `requireAdmin` being correct
  (already relied upon by every other admin route in this codebase) rather than being
  independently re-verified by a new test written this sprint.
- No retry logic exists (explicitly out of scope, per the mission brief's Section 16/19).
- No idempotency-key mechanism exists for this call (explicitly out of scope, per Section 17
  — this operation is read/compute-oriented, not a financial or irreversible action).
- `Bell24hOsErrorCode` is typed as a closed union matching Bell24h-OS's current
  `CanonicalErrorCode` set; if Bell24h-OS adds a new code in the future without a
  corresponding VyaparSethu-side update, that new code would simply come through as
  `undefined` in the typed field rather than a compile error — a minor forward-compatibility
  gap, not a runtime safety issue (the `message`/`httpStatus` fields still carry the real
  information regardless).

## 19. Next Step Recommendation

1. **Operator action**: configure `BELL24H_OS_BASE_URL` and
   `BELL24H_VYAPARSETHU_SERVICE_TOKEN` in this deployment's environment (Vercel or local),
   using the exact same token value already configured on the Bell24h-OS side.
2. Run the one real proof call via `POST /api/admin/bell24h-os/test-ai` as an authenticated
   admin, confirming the `BELL24H-OS-INTEGRATION-OK` marker is received — closing §14's one
   open item.
3. Only after that proof: consider whether any of the "existing debt" items (§16) — most
   naturally the `seo-llm.ts` Groq/NVIDIA path, since it already targets the same AI-text
   capability this sprint's client now exposes — should become a future, separately
   authorized migration sprint. Not started, not scoped by this report.
