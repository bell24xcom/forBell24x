# Task 12A — Resend Service Removal Report

**Repository:** `bell24xcom/forBell24x`
**Branch:** `cleanup/remove-resend-service` (created from `origin/main` @ `5b60ce55b8741d6b10036943cb56d75a1c4ea893`)
**Commit:** `29d840dd` (local; push attempted, denied by this session's own permission layer — see below)
**Worktree:** `C:\Users\Sanika\Projects\bell24h-resend-removal`

**Status: NOT merged, NOT deployed, NOT pushed by this session.** Submitted for review per the task's instructions.

---

## Phase 1 — Usage verification (performed before any deletion)

Searched the full tracked tree (excluding `_archive/`, `src.backup/`, `.netlify/` build artifacts) for every Resend-related surface:

- **Resend SDK**: `grep -n '"resend"' package.json` → no match. The `resend` npm package was never a dependency of this project.
- **Resend API calls (outbound send)**: none found anywhere in live application code. The only outbound email path is `lib/email.ts`, which calls MSG91's Email API — confirmed in this session's own prior `DOMAIN_MSG91_CREDENTIAL_FORENSIC_2026-11-04.md` report and re-confirmed this pass.
- **Resend-related env vars**: `RESEND_API_KEY` (declared, never consumed by a live send path — only a presence-check diagnostic) and `RESEND_WEBHOOK_SECRET` (consumed by exactly one route, the inbound webhook receiver, discussed below).
- **Email sending services/adapters**: `lib/orchestration.ts` defines a local object named `resendService` — this name is misleading and **pre-existing**; the object's `sendEmail` method calls `sendEmail` from `@/lib/email` (MSG91), not any Resend SDK. **Confirmed not a Resend dependency** — left untouched, see Phase 3.
- **Signup/OTP/password-reset/notification/transactional dependencies**: OTP send/verify (`src/app/api/auth/otp/send/route.ts`) uses MSG91's SMS API directly, with no Resend involvement. Notification emails (cron digests, invitations, contact form, deal-completion) all route through `lib/email.ts` → MSG91, via the same `resendService`-named wrapper noted above.
- **Deployment scripts/configuration**: `env.example`, `SIMPLE_DEPLOY_COMMANDS.txt`, `auto-configure-netlify.js` all contained a live-looking `RESEND_API_KEY` value. `env.local.template`/`env.production.template` contained only a commented-out, already-placeholder reference.

**One genuinely active Resend-specific route was found**: `src/app/api/webhooks/resend/route.ts` — an inbound Svix-signature-verified webhook receiver for Resend's own event types (`email.bounced`, `email.delivered`, etc.), which on `email.bounced` sets `user.isActive = false`. This is real, functioning code, not dead code in the usual sense. **However**, since no outbound Resend send path exists anywhere in the application (confirmed above and in the prior session's H6-13 finding), **Resend itself can never fire a webhook event for this app** — there is nothing upstream that would ever cause this receiver to actually be invoked with real data. Removing it eliminates a real, Resend-specific endpoint, with no functional path by which doing so changes any current user-facing behavior.

**Conclusion of Phase 1: no currently active VyaparSethu feature depends on Resend for anything a user or business process would notice if removed.** The webhook receiver is the one borderline case, and is addressed transparently (not silently) below.

## Phase 2 — Removal performed

| File | Action |
|---|---|
| `env.example:17-18` | Removed the live-looking `RESEND_API_KEY` line and its "Email Service (Resend...)" comment header; left `FROM_EMAIL` (generic, not Resend-specific) in place |
| `SIMPLE_DEPLOY_COMMANDS.txt:23` | Removed the `RESEND_API_KEY=...` line |
| `auto-configure-netlify.js:25` | Removed the `RESEND_API_KEY: '...'` object entry |
| `env.local.template:26` | Removed the commented `# RESEND_API_KEY="your_resend_key_here"` line |
| `env.production.template:26` | Removed the commented `# RESEND_API_KEY=your_resend_key_here` line |
| `src/app/api/admin/system/diagnostics/route.ts:69` | Removed the `RESEND_API_KEY` diagnostic-presence-check entry from the "Media & Email" group |
| `src/app/api/webhooks/resend/route.ts` | **Deleted entirely** (see Phase 1's reasoning) |
| `package.json` | Removed `"svix": "^1.85.0"` — confirmed to have had exactly one consumer in the entire tracked tree (the deleted webhook route) |
| `package-lock.json` | Regenerated via `npm install --legacy-peer-deps` after the `package.json` change; diff is exactly 32 lines removed, all `svix`-related, no other dependency churn |

No Resend SDK dependency existed to remove from `package.json` (it was never installed). No dedicated "Resend setup" documentation file was found — `ECG-MARKETING-IMPLEMENTATION-PLAN.md`, `LAUNCH_PLAN.md`, and this session's own prior `docs/project/H6-13-COMPANY-CLAIM-OUTREACH-REPORT.md` each contain a single incidental mention of Resend in general prose/planning/historical-audit context, not a dedicated setup guide, and were **deliberately left unmodified**:
- `H6-13-COMPANY-CLAIM-OUTREACH-REPORT.md:145` is a dated, historical audit finding — altering it would be rewriting evidence, not cleanup.
- `ECG-MARKETING-IMPLEMENTATION-PLAN.md:54` and `LAUNCH_PLAN.md:280` are general planning/status docs with no live credential value present (the plan shows illustrative example code; the launch doc shows a status table entry with no key material) — editing these was judged out of this task's security-cleanup scope and left for a separate documentation pass if wanted.

**Additional cleanup performed per your explicit instruction (not part of Task 12A's own written scope, handled separately within the same commit):** removed the single permission-allowlist line in `.claude/settings.local.json:58` that embedded a live-looking Vercel access token (prefix `vca_`). This is a Claude Code tool-permission string, not application code — it was deleted in full (a redacted/placeholder token value would never match a real future command under Claude Code's literal-prefix permission matching, so partial redaction would leave a dead, meaningless entry; full removal was the only option that actually eliminates the exposure). **No other entry in that file was modified**, confirmed by the diff being exactly one line removed.

## Phase 3 — Functionality preservation

**Current active email provider confirmed: MSG91** (`lib/email.ts`, `control.msg91.com/api/v5/email/send`), unchanged by this cleanup. Current active SMS/OTP provider confirmed: MSG91 (`api.msg91.com/api/v5/otp`), unchanged.

**Nothing touched in this change set**: `lib/email.ts`, `lib/orchestration.ts` (including its misleadingly-named-but-functionally-unrelated-to-Resend `resendService` object and its 5 call sites), `src/app/api/auth/otp/send/route.ts`, any admin/cron/contact/invitation route's actual email-sending logic, any authentication, session, JWT, or NextAuth code.

**No active feature was found to depend on Resend**, so Phase 3's "stop and report instead of breaking it" condition was not triggered — the one borderline case (the webhook receiver) was resolved by the reasoning in Phase 1/Phase 2, not by stopping short.

## Phase 4 — Security verification

| Check | Result |
|---|---|
| No Resend API key remains in the current tracked source tree | **Confirmed.** `grep -rn "RESEND_API_KEY\|RESEND_WEBHOOK_SECRET"` across the full working tree (excluding `_archive/`/`src.backup/`/`.netlify/`) returns zero matches with a live value; the only 3 remaining hits are prose mentions of the variable *name* in two planning docs and one historical audit report, none containing a key value |
| No active source-code reference to Resend remains, unless explicitly documented as historical | **Confirmed.** The only remaining references are the three documentation files above, none of which is executable code |
| No new credential was generated | **Confirmed** — this task only removed references and one unused dependency; nothing was created |
| No unrelated credential was changed | **Confirmed** — MSG91, Razorpay, JWT/NextAuth, and every other credential reference in every file this task touched was left byte-for-byte unchanged except for the Resend lines/entries and the one Vercel-token line explicitly requested separately |
| Historical Git commits may still contain the exposed key | **True, and unaddressed by design.** `git log --all --oneline -- env.example SIMPLE_DEPLOY_COMMANDS.txt auto-configure-netlify.js` shows the live-looking Resend key has existed in this repository's history across many prior commits; this cleanup removes it from the current tree only. **No history rewrite was performed or attempted**, per the task's explicit restriction. If history rewriting is ever wanted, it requires its own separate approval and process (force-push coordination, fork implications, etc.), not folded into this change. |
| Provider-side revocation | **Not performed, and not attempted.** Per the task's explicit restriction, no call was made to Resend's API or dashboard. **The account owner must revoke/rotate the exposed Resend key directly through Resend's own dashboard** — this is the one remaining action this session cannot perform. |

## Phase 5 — Tests and build results

- **`npx tsc --noEmit`**: the full repository has a large, pre-existing set of TypeScript errors unrelated to this change (consistent with `CLAUDE.md`'s own documented statement that "TypeScript and ESLint errors are intentionally ignored during builds"). Specifically checked for any error introduced by this change: zero matches for `svix`, `webhooks/resend`, or any new error in `src/app/api/admin/system/diagnostics/route.ts` beyond one pre-existing implicit-`any` warning at line 143, confirmed present verbatim in the unmodified `origin/main` version before this change. **No new TypeScript error was introduced by this cleanup.**
- **`npm run build`**: the project's own unconditional `build` script runs `prisma migrate deploy`, which fails in this isolated worktree with no `DATABASE_URL`/`DIRECT_URL` configured — this is expected and unrelated to this change (this environment was never given database credentials, by design, since none were needed or appropriate for a source-only cleanup). Ran the safe equivalent instead: `npx prisma generate` (succeeded, no DB connection required) followed by `npx next build` directly.
  - **Result: `✓ Compiled successfully in 29.9s`.**
  - `/api/webhooks/resend` is confirmed **absent** from the build's route manifest.
  - `/api/admin/system/diagnostics` is confirmed **present and building correctly** in the route manifest.
  - The build log shows repeated `DATABASE_URL not found` errors during static-generation attempts for data-dependent pages — these are expected in a database-less environment and are unrelated to this change (every prior worktree build in this session's history has shown the identical pattern).
- **Test suite**: no dedicated test file exists for either the diagnostics route or the deleted webhook route (confirmed via search), so no existing test needed updating or re-running for this specific change. The project's `npm test` script runs Hardhat contract tests, unrelated to this change, and was not run.

## Historical exposure status

The live-looking Resend API key and the live-looking Vercel access token both remain present in this repository's Git history (prior commits), even after this cleanup. **This is documented, not fixed, per the task's explicit "do not rewrite Git history" restriction.** Both values should be treated as permanently compromised regardless of their removal from the current tree, and rotated at their respective providers — this is an owner action this session cannot perform.

## Files changed (final diff summary)

```
10 files changed, 1 insertion(+), 112 deletions(-)
 M .claude/settings.local.json                        (1 line removed — Vercel token entry)
 M SIMPLE_DEPLOY_COMMANDS.txt                          (1 line removed)
 M auto-configure-netlify.js                           (1 line removed)
 M env.example                                         (2 lines removed, 1 line changed)
 M env.local.template                                  (1 line removed)
 M env.production.template                             (1 line removed)
 M package-lock.json                                   (32 lines removed — svix only)
 M package.json                                        (1 line removed — svix dependency)
 M src/app/api/admin/system/diagnostics/route.ts        (1 line removed)
 D src/app/api/webhooks/resend/route.ts                 (71 lines, full file deletion)
```

## Actions deliberately not performed

- No Git history rewrite.
- No provider-side (Resend) revocation or rotation — requires the account owner, through Resend's own dashboard.
- No change to `lib/email.ts`, `lib/orchestration.ts`'s `resendService` object/naming, MSG91 configuration, or any other authentication/notification system.
- No edit to the three documentation files that merely mention Resend in prose (`ECG-MARKETING-IMPLEMENTATION-PLAN.md`, `LAUNCH_PLAN.md`, `H6-13-COMPANY-CLAIM-OUTREACH-REPORT.md`).
- No merge, deploy, or Vercel environment-variable change.
- No push was completed by this session — blocked by a session-level permission restriction (not a task restriction); the owner must run the push themselves (command provided separately).

---

**Awaiting review and explicit approval before any merge or deployment.**
