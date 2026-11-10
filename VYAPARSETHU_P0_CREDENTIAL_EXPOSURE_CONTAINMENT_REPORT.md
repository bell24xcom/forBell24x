# VyaparSethu — P0 Credential Exposure Investigation and Containment

**Repository:** `bell24xcom/forBell24x`. **Baseline SHA (main, at investigation start):** `5b60ce55b8741d6b10036943cb56d75a1c4ea893`. **Remediation branch:** `security/credential-exposure-containment`, commit `334aeee3c5322e3a8614968f44df767195aeace7`. **PR:** [#94](https://github.com/bell24xcom/forBell24x/pull/94). **State: OPEN, not merged.**

No secret value is printed anywhere in this report — only variable/credential names and file names.

## 1. Repository and baseline SHA

Fresh clone to a new, clean location for this task (the pre-existing scratchpad clone from earlier work had unrelated Windows long-path checkout artifacts in its `_archive/` subtree — not touched, not reused, to avoid any risk of confusing that noise with real changes). `main` HEAD confirmed `5b60ce5` at investigation start.

## 2. File tracking and Git-history findings

- **`.vercel-env-vars.txt` is tracked on current `main`** (`git ls-tree HEAD` confirms a real blob, not absent).
- **It has existed, unchanged, since this repository's very first commit**: `git log --all --follow -- .vercel-env-vars.txt` returns exactly one commit, `01d49ce` ("Initial commit: Bell24h MVP with MSG91 OTP authentication"). It was never modified after being added — the content at HEAD today is the content it has always had.
- **It was never covered by any `.gitignore` rule.** The existing `.gitignore` has several `.env*` patterns (`.env.local`, `.env.*.local`, `.env*.local`, `.env.production`, `.env*.txt`) but none of them match the `.vercel-env-vars.txt` naming convention (it doesn't start with `.env`).
- **No automation depends on it.** `git grep` across all tracked `.ts`/`.js`/`.sh`/`.json`/`.md`/`.yml` files for the literal filename found zero references. The one script that plausibly could reference it (`scripts/setup-vercel-env.sh`) instead reads from `.env.local` and `production.env.template` — confirmed by reading that script in full.
- **PRs #91 and #92 are unrelated** — #91 (`phase-11/razorpay-test-lifecycle`, Razorpay lifecycle/webhook hardening) and #92 (`phase-12b-4/next15-safe-integration`, buyer-authorization fix) were checked; neither touches `.vercel-env-vars.txt` or any environment/secret file.

## 3. Credential categories discovered, without values

### In `.vercel-env-vars.txt` itself (the file named in this task)
`DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NODE_ENV`.

### CRITICAL — additional finding, materially expanding the scope of this investigation

Phase 1's own instruction to "identify other tracked environment/configuration files that may contain credentials" surfaced a **much larger exposure than the task's framing described**. The following tracked files were confirmed (by inspecting structure and key names only, values redacted before ever being displayed) to contain real, non-template credential data:

| File | Credential categories found |
|---|---|
| `env-list.txt` | `DATABASE_URL`, **`MSG91_AUTH_KEY`**, `MSG91_SENDER_ID`, `MSG91_TEMPLATE_ID`, **`JWT_SECRET`**, `NEXTAUTH_SECRET`, `ENCRYPTION_KEY` |
| `.env.neon` | `DATABASE_URL`, `SOURCE_DATABASE_URL`, `NEON_DATABASE_URL`, **`NEON_API_KEY`** (distinct from the DB connection string), `NEON_PROJECT_ID` |
| `.env.production.protected-backup` | `DATABASE_URL`, `PGUSER`/`PGPASSWORD`/`PGDATABASE`/`PGHOST`/`PGPORT`, `SESSION_SECRET` |
| `gitkraken.env` | `GITKRAKEN_API_TOKEN`, `GITKRAKEN_WORKSPACE_ID` |
| `client_secret_2_1044360968417-....apps.googleusercontent.com.json` | A real Google OAuth client — `client_id`, `client_secret`, and a live-looking `redirect_uris` entry pointing at a real Vercel deployment URL |
| `.env.local.backup.1756839874707`, `.env.local.backup.1756844683945` | `NEXTAUTH_URL`, `NEXTAUTH_SECRET` |
| `.env.development.backup`, `.env.development.disabled`, `.env.windsurf`, `.env.staging`, `.env.test`, `server/.env.test`, and others | Not individually inspected for content this pass — flagged by name pattern as requiring the same scrutiny |
| Duplicates under `_archive/` (e.g. `_archive/bell24h-main/.vercel-env-vars.txt`, `_archive/bell24h-main (1)/bell24h-main/.vercel-env-vars.txt`, `_archive/client/env-example.txt`, etc.) | Same categories as above, duplicated |

**None of these are gitignored** — `git check-ignore -v` confirmed zero matches for any of them.

**This was surfaced to the project owner mid-investigation and the decision was made explicitly: this task's remediation remains scoped to `.vercel-env-vars.txt` only. The full list above is reported for the record and requires its own, separate containment decision — it is NOT remediated by this PR.**

## 4. Previously rotated credential confirmation (Category A, per this task's own classification)

**This task did not independently verify rotation of any credential** — no provider-dashboard access exists in this session, and the task explicitly says not to claim provider-log verification without actual provider evidence. Category A (Neon, Razorpay, core authentication secrets "previously confirmed rotated") is carried forward **as asserted by the task's own premise**, not re-verified here. One specific gap worth flagging: **`NEON_API_KEY`** (found in `.env.neon`, §3) is a distinct credential from the `DATABASE_URL` connection string — if the "Neon credentials rotated" confirmation specifically covered the connection string's password component and not this separate API key, that key's rotation status is **unconfirmed**, not confirmed. This is new evidence of a potentially separate exposure, per the task's own exception to "do not rotate already-confirmed credentials again."

## 5. Outstanding credential actions

Per the task's explicit Category B list, these two require the project owner's provider-dashboard access and were not and cannot be performed by this task:
- **Revoke the old Resend API key.**
- **Revoke the old Vercel token.**

Neither credential name was found in `.vercel-env-vars.txt` itself or in any file inspected this pass — their location (which specific file exposed them) was not independently re-identified in this investigation; they are carried forward from the task's own premise (the "Production Activation Checklist dated 9 November 2026," which this session does not have independent access to).

## 6. Provider-log investigation status

**Not performed.** This session has no provider-dashboard or provider-API access to Resend, Vercel, Neon, Razorpay, or MSG91 account activity logs. Per the task's own instruction, no claim of provider-log verification is made. Whether any exposed value has been used since its reported rotation is **unknown and unverifiable from this repository alone.**

## 7. Repository remediation

Commit `334aeee` on branch `security/credential-exposure-containment`:
1. `.vercel-env-vars.txt` removed from the tracked tree (`git rm --cached`, also deleted on disk).
2. `.gitignore` updated with a `.vercel-env*.txt` pattern and an explanatory comment, including an explicit note of what it does *not* cover (the files in §3's expanded table).

**Explicitly not done, and why:**
- **No Git history rewrite.** The file's content remains retrievable from any clone of history prior to this commit — this is forward-going containment, not retroactive removal, per the task's own restriction against history rewriting without separate approval.
- **No credential rotation performed or claimed.**
- **No other exposed file touched** — scoped per the project owner's explicit decision (§3).
- **No application authentication behavior changed.**

Verified no production functionality depends on the removed file (§2 — zero script/CI references).

## 8. Tests and scan results

| Check | Result |
|---|---|
| Git tracked-file check (`.vercel-env-vars.txt` no longer in `git ls-files`) | **Confirmed removed** |
| `.gitignore` pattern match (`git check-ignore -v .vercel-env-vars.txt`) | **Confirmed now ignored** going forward |
| Secret-pattern scan | **No dedicated secret-scanning tool/config found in this repository** (no `gitleaks`, `trufflehog`, or `.gitguardian` config). GitHub's own PR checks on this repo do **not** include a GitGuardian check (confirmed by inspecting PR #94's actual checks, below) — unlike `digitex-erp/digitex-erp-bell24h-os`, which does have one. **Recommend adding one** — flagged as a finding, not implemented, out of this task's scope. |
| PR #94 CI: `Build & Type Check` | **pass** |
| PR #94 CI: `build-check` | **pass** |
| PR #94 CI: `Vercel` (preview deployment) | **pass** |
| PR #94 CI: `Vercel Preview Comments` | **pass** |

No secret value was printed during any scan or check in this investigation.

## 9. PR URL and number

**https://github.com/bell24xcom/forBell24x/pull/94** — OPEN, mergeable, all checks passing, **not merged**.

## 10. Remaining risks

- **The historical exposure is not removed by this PR** — anyone who already cloned this repository, or who clones it from a point in history before this commit, still has the original file's content. If any of its values were real production credentials and have not actually been rotated (not independently confirmed, §4), they remain compromised regardless of this repository change.
- **The expanded exposure (§3) is unresolved** — `env-list.txt`, `.env.neon`'s `NEON_API_KEY`, `gitkraken.env`, the Google OAuth client secret, and the `.env.local.backup.*` files remain tracked, unprotected by `.gitignore`, and duplicated under `_archive/`. This is a materially larger and still-open exposure.
- **No secret-scanning tool is active on this repository** to catch a recurrence of this same pattern.
- **Provider-side usage cannot be ruled in or out** — no log access exists in this session.

## 11. Actions requiring owner approval

1. **Review and merge (or request changes on) PR #94.**
2. **Decide the containment approach for the expanded exposure list (§3)** — at minimum: `env-list.txt`, `.env.neon`, `.env.production.protected-backup`, `gitkraken.env`, the Google OAuth `client_secret_*.json`, the `.env.local.backup.*` files, and their `_archive/` duplicates. This is a separate, larger task, not silently expanded into this PR per the owner's own explicit decision mid-investigation.
3. **Revoke the old Resend API key and the old Vercel token** (Category B) — provider-dashboard actions, cannot be performed from this repository.
4. **Determine whether `NEON_API_KEY` specifically (§4) was included in the already-reported Neon credential rotation**, or whether it needs its own, separate rotation.
5. **Investigate MSG91 and NextAuth/JWT credential status (Category C)** before any rotation decision — per the task's own instruction, this report does not independently assume these are compromised or safe; it only confirms where they are exposed (`env-list.txt`).
6. **Consider whether a Git history rewrite is warranted** for `.vercel-env-vars.txt` and/or the expanded file list — this report does not recommend one unilaterally; it requires its own separately-documented approval and recovery plan, per the task's own restriction.
7. **Consider adding a secret-scanning tool** (e.g. GitGuardian, already used on the Bell24h-OS repository) to this repository's CI.

---

No credentials were rotated, disclosed, or requested through this investigation. No history was rewritten. No merge or deployment occurred as part of this task.
