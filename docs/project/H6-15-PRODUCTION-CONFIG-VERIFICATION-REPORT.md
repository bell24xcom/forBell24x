# H6-15 — Production Auth + WhatsApp Configuration Verification

**Status:** READ-ONLY VERIFICATION — no code changed, no secrets sent, no message sent.
**Date:** 2026-08-18
**Scope:** JWT_SECRET production security posture + MSG91 WhatsApp production configuration.
**Frozen per mission brief:** Gate A, Gate B-02, Bell24h-OS integration, NVIDIA integration,
H6-13 implementation, MSG91 provider. No provider migration, no code fix applied here.

---

## 1. JWT Security

### 1a. Vercel Production presence

`JWT_SECRET` — **PRESENT** (Production, Preview scopes; key set 220 days ago).

True non-emptiness cannot be confirmed from `vercel env ls` alone — it lists variable
*names* and scopes, never lengths or values, and this investigation deliberately avoided
`vercel env pull` (which would write the real secret to a local file) to keep exposure risk
at zero. Reported as **PRESENT**, with emptiness genuinely **UNKNOWN** by this method.

### 1b. Every code path reading `JWT_SECRET`, and fallback status

Two structurally different `jwt.ts` modules exist in this repository, with **inconsistent**
fallback behavior:

| File | Fallback? | Reachable in production? |
|---|---|---|
| `lib/jwt.ts` (repo root — the one `@/lib/jwt` resolves to, since `@/` = repo root per this project's path alias) | **No** — uses a `'__MISSING_JWT_SECRET__'` sentinel + `console.error('[JWT] CRITICAL: ...')` if unset. Fails closed, not open. | Yes — imported by `lib/admin-auth.ts`, used by every `/api/admin/*` route (including the Gate B-02 test route). **Safe.** |
| `src/lib/jwt.ts` (a *separate* file, under `src/lib/`) | **Yes** — `process.env.JWT_SECRET \|\| 'your-secret-key'` | **Yes.** Imported by `src/lib/auth-helpers.ts`, which is imported by: `src/app/api/deal/select/route.ts`, `src/app/api/deal/[id]/complete/route.ts`, `src/app/api/quote/route.ts`, `src/app/api/rfq/create/route.ts`, `src/app/api/rfq/[id]/quotes/route.ts`, **and** `src/middleware/auth.ts` (project middleware — the broadest reach of the three). |
| `lib/auth/agent-auth.ts` | **Yes** — `process.env.JWT_SECRET \|\| 'fallback-secret-key'` | **Yes.** Imported by `src/app/api/agents/verify/route.ts`, `src/app/api/campaigns/route.ts`, `src/app/api/campaigns/[id]/route.ts`. |
| `src/app/api/claim/complete/route.ts` (inline, not via a shared module) | **Yes** — `process.env.JWT_SECRET \|\| 'your-secret-key'`, used to sign a real **7-day session token** on successful claim completion (H6-13 flow) | **Yes.** Directly in the route handler itself — no import indirection. |
| `src/lib/jwt-service.ts` | Yes — `process.env.JWT_SECRET \|\| 'fallback-secret'` | **No live importer found.** Zero references from any `src/app/**` route or any file that is itself reachable. Appears to be dead code in the current build. |
| `server/**`, `_archive/**`, `src.backup/**` (multiple fallback variants: `'your-secret-key'`, `'bell24h-secret-key'`, `'bell24h_default_secret'`, `'secret'`) | Yes, throughout | **No** — `server/` is not referenced anywhere in `vercel.json` or `next.config.js`; it is not part of this Vercel/Next.js deployment's build graph. `_archive/` and `src.backup/` are, by directory convention and by every prior sprint's own documented baseline in this codebase, dead/backup code, not shipped. Excluded from the CRITICAL classification below on that basis, but not exhaustively proven unreachable by any other mechanism (e.g. a separate, undocumented deployment) — flagged as **UNKNOWN, low-probability** rather than definitively ruled out.

### 1c. Classification

```
JWT SECURITY: CONFIGURED
FALLBACK: STILL REQUIRES CODE REMEDIATION
```

`JWT_SECRET` is present in Vercel Production, so the insecure fallbacks are **not currently
active** — but three genuinely live, deployed code paths (`src/lib/jwt.ts` via
`auth-helpers.ts` and project middleware, `lib/auth/agent-auth.ts` via the agents/campaigns
routes, and the inline fallback in `src/app/api/claim/complete/route.ts`) would silently
authenticate against a publicly-known, hardcoded string the instant `JWT_SECRET` was ever
unset for any reason (a misconfigured Preview deployment, an accidental env var removal, a
new environment scope that forgot to carry it over). This is latent risk, not active
exploitation — no forgery was attempted here, per instruction.

---

## 2. MSG91 Configuration

Vercel Production presence, names/scopes only:

| Variable | Status |
|---|---|
| `MSG91_WA_AUTH_KEY` | **PRESENT** (Preview, Production — 62d ago) |
| `MSG91_AUTH_KEY` | **PRESENT** (Production, Preview — 220d ago) |
| `MSG91_WA_PHONE` | **PRESENT** (Preview, Production — 62d ago) |
| `MSG91_WA_TEMPLATE` | **ABSENT** — does not appear anywhere in the Production variable list. (`MSG91_TEMPLATE_ID` exists as a separate, different variable — appears to serve the unrelated OTP flow, not the WhatsApp outreach template.) |
| `NEXT_PUBLIC_SITE_URL` | **PRESENT** (Development, Preview, Production — 74d ago) |
| `CRON_SECRET` | **PRESENT** (Production — 26d ago) |

---

## 3. Meta Template

**UNKNOWN.** No Meta Business/WhatsApp dashboard access is available to this session.
Template name, approval status, approved language, and display-name status could not be
inspected. Nothing was submitted or modified.

---

## 4. Code Consistency (H6-13 active route)

`src/app/api/admin/outreach/bulk-wa/route.ts` — confirmed as the live H6-13 bulk-send route:

- Reads `process.env.MSG91_WA_AUTH_KEY || process.env.MSG91_AUTH_KEY`, `process.env.MSG91_WA_PHONE`, `process.env.MSG91_WA_TEMPLATE` (lines 110–112, and the `GET` handler's `configured` check, lines 28–32).
- `useApi` (whether the real MSG91 API call is attempted) is `!!(waAuthKey && waPhone && waTemplate)` — since `MSG91_WA_TEMPLATE` is **ABSENT** in Production (§2), `useApi` currently evaluates to `false` in production. The route falls back to generating a `wa.me` deep link only; no real MSG91 API send occurs today, regardless of what triggers the route.
- Language sent (when the API path *is* reachable): **hardcoded `'en'`** — `template: { name: waTemplate, language: { code: 'en' } }` (line 164). No other language is ever sent from this code path.

Because Meta's actual approved language is **UNKNOWN** (§3, no dashboard access), a
mismatch cannot be confirmed either way:

```
LANGUAGE MISMATCH: UNKNOWN — human/code decision required once Meta template state is known
```

This is reported per instruction, not resolved — no code was changed.

---

## 5. No-Send Confirmation

```
WHATSAPP MESSAGE SENT: NO
```

No outreach endpoint, MSG91 API, or Meta send API was called. `bulk-wa` was read, not
invoked. No dry-run or live request was made against it.

---

## 6. Git Discipline

`git status --short` before and after this investigation: **identical**, 48 lines, matching
the established multi-sprint baseline. No tracked file was modified. No file was staged,
committed, pushed, reset, stashed, or cleaned. This report is the only new file.

---

## Final Verdict

```
H6-15

JWT_SECRET:            CONFIGURED
JWT FALLBACK:           PRESENT
MSG91_WA_AUTH_KEY:      PRESENT
MSG91_WA_PHONE:         PRESENT
MSG91_WA_TEMPLATE:      ABSENT
META TEMPLATE:          UNKNOWN
META LANGUAGE:          UNKNOWN
DISPLAY NAME:           UNKNOWN
LANGUAGE MATCH:         UNKNOWN
WHATSAPP MESSAGE SENT:  NO
SOURCE MODIFIED:        NO
VERCEL CONFIG MODIFIED: NO
SECRETS EXPOSED:        NO

NEXT ACTION: Two independent, separately-authorizable items — do not conflate them.
  (a) Code remediation (JWT): replace the three live insecure fallbacks
      (src/lib/jwt.ts, lib/auth/agent-auth.ts, and the inline fallback in
      src/app/api/claim/complete/route.ts) with the same fail-closed sentinel
      pattern lib/jwt.ts (repo root) already uses safely — a scoped, reviewable
      diff, not attempted in this read-only task.
  (b) Operator action (WhatsApp): supply MSG91_WA_TEMPLATE in Vercel Production
      (and confirm it matches an actually-approved Meta template + language)
      before bulk-wa's real API path can ever activate — currently the route
      silently no-ops to a wa.me link only.
```
