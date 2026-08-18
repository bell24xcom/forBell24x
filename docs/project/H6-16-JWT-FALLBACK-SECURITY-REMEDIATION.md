# H6-16 — JWT Fallback Security Remediation

**Status:** CONTROLLED SECURITY FIX — implemented, verified, not yet committed at time of writing.
**Date:** 2026-08-18
**Predecessor finding:** `docs/project/H6-15-PRODUCTION-CONFIG-VERIFICATION-REPORT.md`
**Scope:** Remove three hardcoded JWT fallback secrets from live production code. No
architectural change, no token-format change, no session-duration change, no role change,
no change to admin authentication, Gate A, Gate B-02, Bell24h-OS, NVIDIA, or MSG91.

---

## H6-15 Finding (recap)

H6-15's read-only inspection found three live, deployed code paths each falling back to a
well-known, hardcoded string when `JWT_SECRET` is unset, instead of failing closed the way
`lib/jwt.ts` (repo root) already does:

| File | Old fallback |
|---|---|
| `src/lib/jwt.ts` | `'your-secret-key'` |
| `lib/auth/agent-auth.ts` | `'fallback-secret-key'` |
| `src/app/api/claim/complete/route.ts` (inline) | `'your-secret-key'` |

`JWT_SECRET` was confirmed **CONFIGURED** in Vercel Production, so these fallbacks were not
actively firing — but any future misconfiguration (an unset var on a new environment scope,
an accidental removal) would have silently authenticated against a publicly-guessable
constant.

## Affected Files

1. `src/lib/jwt.ts`
2. `lib/auth/agent-auth.ts`
3. `src/app/api/claim/complete/route.ts`

## Old Insecure Behavior

Each file computed its signing/verification secret as:
```ts
const JWT_SECRET = process.env.JWT_SECRET || '<hardcoded string>';
```
If `JWT_SECRET` was ever unset, the app would sign and verify tokens using that hardcoded
string with no warning, no error, and no operational signal — a silent downgrade to a
forgeable secret.

## New Fail-Closed Behavior

Each file now uses the same pattern already present in `lib/jwt.ts` (repo root — the module
`lib/admin-auth.ts` uses safely for every `/api/admin/*` route):

```ts
const JWT_SECRET = (() => {
  const s = process.env.JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[JWT] CRITICAL: JWT_SECRET env var is not set. Set it in Vercel → Settings → Environment Variables.');
      return '__MISSING_JWT_SECRET__';
    }
    return 'dev_only_jwt_secret_not_for_production';
  }
  return s;
})();
```

No signing/verification logic, token shape, expiry, or role handling changed in any of the
three files — only the secret-resolution expression itself.

**Honest limitation, not glossed over:** this replicates the *existing repository
convention* exactly as instructed ("reuse the existing safe pattern... do not invent a new
security mechanism"), and it is a real improvement — `'__MISSING_JWT_SECRET__'` is far less
likely to be guessed by an automated attacker than tutorial-boilerplate strings like
`'your-secret-key'` or `'fallback-secret-key'`, and it now logs a `console.error` for
operational visibility where none existed before. It is **not**, however, true
throw-and-reject fail-closed behavior — the function still returns *a* string and lets
signing/verification proceed with it, rather than raising an error that would 500 the
request. A genuinely closed failure mode (reject the request instead of substituting any
string) would be a further, separately-scoped change; not attempted here, per the explicit
instruction not to invent new security mechanisms or alter authentication behavior beyond
this narrow fix.

## Verification Performed

- **Active-source search, post-fix:** `grep -rn "'your-secret-key'\|'fallback-secret-key'"` across `src/` and `lib/` → **zero matches.** (Matches still exist under `server/`, `_archive/`, and `src.backup/` — confirmed in H6-15 as not part of this Vercel/Next.js build graph, left untouched per the mission's "do not modify archive/dead-code copies unless reachable" instruction.)
- **Typecheck:** `npx tsc --noEmit`, scoped to the three changed files → zero errors.
- **Lint:** `npx next lint` on the three changed files → `✔ No ESLint warnings or errors`.
- **Production build:** `next build`, exit code 0, zero "Failed to compile". All affected routes (`/api/admin/bell24h-os/test-ai`, `/api/agents/verify`, `/api/campaigns`, `/api/campaigns/[id]`, `/api/claim/complete`) still present in the compiled route table.
- **Gate B-02 regression check:** `lib/admin-auth.ts`, `src/lib/bell24h-os/*`, and `src/app/api/admin/bell24h-os/*` confirmed **not** in this turn's changed-file list. `npm run test:bell24h-os` re-run → **18/18 passing**, unchanged.

## Security Impact

- **Gate A:** UNCHANGED — no file in scope.
- **Gate B-02:** UNCHANGED — `requireAdmin()`, `ADMIN_TOKEN`, `EXPORT_API_KEY`, and the Bell24h-OS S2S client/route were not touched; Gate B-02's own test suite re-confirmed passing.
- **Bell24h-OS / NVIDIA integration:** UNCHANGED — no file in either integration's scope was touched or executed. No live NVIDIA call was made.
- **MSG91:** UNCHANGED — no file in scope; no outreach/send endpoint invoked.
- **JWT session issuance/verification for real users:** now fails toward a fixed, logged
  sentinel instead of a well-known guessable string whenever `JWT_SECRET` is genuinely unset
  — a meaningful reduction in blast radius for that misconfiguration scenario, using the
  repository's own pre-existing convention rather than a new mechanism.

## Staging Note

`src/app/api/claim/complete/route.ts` carried pre-existing, unrelated, uncommitted H6-13
changes (import additions + `resolveClaimTarget`/`consumeClaimInvitation` logic) before this
fix was applied. The JWT fix landed as its own clean, separate diff hunk in that file,
verified not to overlap with the H6-13 hunks. Per this session's established practice for
mixed-content files, only the JWT-fix hunk is staged for this commit — the H6-13 work
remains uncommitted and untouched, exactly as it was before this task began.
