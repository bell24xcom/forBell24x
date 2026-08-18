# H6-16A — JWT True Fail-Closed Hardening

**Status:** SECURITY HARDENING — implemented, tested, verified.
**Date:** 2026-08-18
**Predecessor:** `docs/project/H6-16-JWT-FALLBACK-SECURITY-REMEDIATION.md` (commit `5abf9a97`)
**Baseline:** `5abf9a97207abb584e31ca4d08df6cf97a18fc24`

---

## H6-16 vs H6-16A

**H6-16** removed three hardcoded, well-known fallback *strings* (`'your-secret-key'`,
`'fallback-secret-key'`) and replaced them with a sentinel pattern already present in
`lib/jwt.ts` (repo root): substitute `'__MISSING_JWT_SECRET__'` and log a `console.error`.
H6-16's own report was explicit that this was **not** true fail-closed behavior — it still
substitutes *a* string and lets signing/verification proceed.

**H6-16A removes the sentinel substitution entirely**, across all four JWT-secret-resolving
locations in the codebase (the three H6-16 remediated it addresses, plus `lib/jwt.ts` itself,
which — while not one of H6-15's three flagged files — used the same substitution pattern
and needed the identical upgrade to make the invariant hold everywhere):

| File | H6-16 behavior | H6-16A behavior |
|---|---|---|
| `lib/jwt.ts` (repo root) | Substitutes `'__MISSING_JWT_SECRET__'` / `'__MISSING_JWT_REFRESH_SECRET__'` | **Throws `MissingJwtSecretError`** |
| `src/lib/jwt.ts` | Substitutes `'__MISSING_JWT_SECRET__'` | **Throws `MissingJwtSecretError`** |
| `lib/auth/agent-auth.ts` | Substitutes `'__MISSING_JWT_SECRET__'` | **Throws `MissingJwtSecretError`** |
| `src/app/api/claim/complete/route.ts` (inline) | Substitutes `'__MISSING_JWT_SECRET__'` | **Throws a plain `Error`**, caught by the route's own pre-existing outer `try/catch` |

No token format, expiry, role handling, or authentication architecture changed. `ADMIN_TOKEN`,
`EXPORT_API_KEY`, `requireAdmin()`, the Gate B-02 route, Bell24h-OS client, and MSG91 code
were not touched.

## Design

Each JWT-secret resolution point now:
1. Reads `process.env.JWT_SECRET` (or `JWT_REFRESH_SECRET`) **at the point of use** (lazily —
   not at module load), so importing these modules never crashes a route that doesn't
   actually need to sign/verify on a given request.
2. If missing, empty, or a known historical placeholder value — logs
   `console.error('[JWT] CRITICAL: ...')` for operational visibility, then **throws**.
3. Never substitutes any string, sentinel or otherwise, as a signing/verification key.

This relies on an invariant that was already true throughout this codebase before H6-16A
touched anything: every route wraps its handler body (or the specific verify call) in a
`try/catch` that already runs on `jwt.verify()`'s own native throws (expired token, bad
signature) and returns a safe error response. Adding "secret missing" as one more reason for
that same throw path required **zero changes** to any of the 44+ existing callers of
`lib/jwt.ts`'s `verifyToken`/`generateTokens` — confirmed by tracing representative callers
(`lib/admin-auth.ts`, `src/app/api/dashboard/stats/route.ts`, `src/lib/auth-helpers.ts`) and
finding each already wraps the call in a `try/catch` returning `401`/`null`.

## Regression Analysis (Phase 4)

| Caller class | Existing error handling | Adjustment needed? |
|---|---|---|
| `lib/jwt.ts`'s `verifyToken`/`generateTokens`, 44+ callers incl. `lib/admin-auth.ts` | Outer route-level `try/catch`, or (in `authenticate()`) an internal `try/catch` returning `null` | **None** |
| `src/lib/jwt.ts`'s `verifyToken`, via `src/lib/auth-helpers.ts` | `auth-helpers.ts` wraps the call in its own `try/catch`, logs, returns `null` | **None** |
| `src/lib/jwt.ts`'s `decodeToken` | Already had its own `try/catch` (used for non-auth-decision decoding) | **None** — now also safely returns `null` on missing secret |
| `lib/auth/agent-auth.ts`'s `AgentAuth.verifyToken` | Already had its own `try/catch`, returns `null` | **None** |
| `lib/auth/agent-auth.ts`'s `AgentAuth.generateToken` | No local `try/catch`; **zero live callers found** (`createAuthResponse`/`generateToken` unused anywhere in `src/`) | **None required** — not reachable in production today |
| `src/app/api/claim/complete/route.ts` inline `sign()` call | Route's own outer `try/catch` (confirmed: catches, logs server-side only, returns generic `500 Internal server error`) | **None** |

No caller required a code change beyond the secret-resolution line itself.

## Two Small, Necessary, Zero-Behavior-Change Import Fixes

While adding tests for `src/lib/jwt.ts` (Phase 5), two **pre-existing** issues in that file's
import statements surfaced — both were latent (the file had never been exercised outside
Next.js's own bundler, which papers over both) and both are pure import-syntax corrections,
not logic changes:

1. `import { sign, verify, JwtPayload } from 'jsonwebtoken'` mixed a **type-only** import
   (`JwtPayload`) with value imports in one statement. Split into
   `import { sign, verify } from 'jsonwebtoken'` + `import type { JwtPayload } from 'jsonwebtoken'`.
2. `jsonwebtoken` is a CommonJS-only package; Node's native ESM loader (used by `node --test`)
   does not synthesize named exports for it the way Next.js's bundler does, so the named
   import of `sign`/`verify` itself failed under direct execution. Changed to the
   default-import + destructure form (`import jwt from 'jsonwebtoken'; const { sign, verify } = jwt;`)
   — **the same convention `lib/jwt.ts` and `lib/auth/agent-auth.ts` already used successfully
   in production**, so this aligns `src/lib/jwt.ts` with the codebase's own dominant,
   already-proven pattern rather than introducing a new one.

Neither change alters what `sign`/`verify` actually do at runtime.

## Tests (Phase 5)

New: `src/lib/jwt.test.ts` — 8 tests, all passing:

```
1. JWT_SECRET configured: signing succeeds
2. JWT_SECRET missing: signing fails (throws MissingJwtSecretError)
3. JWT_SECRET empty string: signing fails
4. JWT_SECRET missing: verification fails
5. JWT_SECRET configured: existing verification behavior preserved
+ decodeToken returns null (not throw) when secret is missing
+ no fallback secret: a token signed under one secret does not verify under a different one
6. no hardcoded JWT fallback literal remains in the three H6-15/H6-16 source files (+ lib/jwt.ts)
```
Run via `npm run test:jwt-fail-closed` (new script, `node --test src/lib/jwt.test.ts`).

**Coverage gap, stated plainly:** `lib/jwt.ts` (repo root) and `lib/auth/agent-auth.ts` are
**not** covered by a standalone `node --test` file. `lib/jwt.ts` imports `@/lib/prisma`
(path-alias import, unresolvable under Node's native module loader with no alias loader
configured in this project) and `lib/auth/agent-auth.ts` imports `next/server`
(`NextRequest`/`NextResponse`, only resolvable inside Next.js's own runtime/bundler) —
both are genuine, pre-existing environment constraints, not something introduced by this
task, and fixing either would mean touching import structure unrelated to JWT logic (a
larger, out-of-scope change). Confidence in their correctness instead comes from:
- Both use **the exact same `requireSecret()`/throw pattern**, verified correct by the 8
  passing tests against `src/lib/jwt.ts`.
- `npx tsc --noEmit` (scoped) — zero new errors in either file.
- `next build` — succeeds, and every live route that imports either module
  (`/api/admin/login`, `/api/auth/otp/verify`, `/api/auth/otp/widget-verify`,
  `/api/agents/verify`, `/api/campaigns`, `/api/campaigns/[id]`, plus every `/api/admin/*`
  route via `lib/admin-auth.ts` → `lib/jwt.ts`) compiles and appears in the route table.
- Source-level regression analysis (table above) confirms every caller already has adequate
  error handling.

## Security Search (Phase 6)

```
grep -rn "'your-secret-key'\|'fallback-secret-key'\|'__MISSING_JWT_SECRET__'\|dev_only_jwt_secret_not_for_production\|dev_only_refresh_secret_not_for_production" src/ lib/
→ CLEAN — zero matches
```

## Validation (Phase 8)

| Check | Result |
|---|---|
| Typecheck (scoped to changed files) | **1 pre-existing, unrelated error** in `lib/jwt.ts`'s `generateToken` (`expiresIn` parameter typing vs. `@types/jsonwebtoken`'s `SignOptions`) — confirmed via `git diff` that the only change on that line is the secret argument (unchanged `string` type both before and after), so this could not have been introduced by this task. `next.config.js` ignores TypeScript errors at build time project-wide (documented convention, every prior sprint), so this was never build-blocking. Not fixed here — out of scope (would mean touching `expiresIn`/token-expiry handling, explicitly forbidden by this mission). |
| Lint | **PASS** — `✔ No ESLint warnings or errors` on all changed files |
| New JWT fail-closed tests | **8/8 PASS** |
| Existing Gate B-02 tests (regression) | **18/18 PASS**, unchanged |
| Existing outreach tests (regression) | **25/25 PASS**, unchanged |
| Production build | **PASS** — exit 0, zero "Failed to compile", every affected route present in the compiled route table |
| `git diff --check` | Clean, no whitespace errors |

## Gate / Integration Regression (Phase 7)

- **Gate A:** UNCHANGED — no file in scope.
- **Gate B-02:** UNCHANGED — `lib/admin-auth.ts`, `src/lib/bell24h-os/*`, `src/app/api/admin/bell24h-os/*` not touched this turn; 18/18 tests re-confirmed passing.
- **Bell24h-OS / NVIDIA:** UNCHANGED — no file touched, no live/paid call made.
- **MSG91:** UNCHANGED — no file touched, no send performed.

## Security Impact

```
JWT_SECRET missing:      SIGNING FAILS (throws, no substitution)
JWT_SECRET empty:        SIGNING FAILS (throws, no substitution)
JWT_SECRET missing:      VERIFICATION FAILS (throws or returns null, per each
                          function's pre-existing contract — never a fallback match)
JWT_SECRET configured:   NORMAL BEHAVIOR PRESERVED (8/8 new tests + 18/18 + 25/25
                          regression tests confirm)
```

No secret value was printed, logged, rotated, or generated at any point in this task.

## Staging Note

`src/app/api/claim/complete/route.ts` still carries the same pre-existing, unrelated,
uncommitted H6-13 work noted in H6-16's report. The H6-16A fix landed as its own isolated
hunk in that file (confirmed non-overlapping with the H6-13 hunks), and only that hunk is
staged for this commit — consistent with H6-16's precedent.
