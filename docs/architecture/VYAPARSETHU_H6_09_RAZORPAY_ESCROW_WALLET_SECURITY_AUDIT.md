# VyaparSethu — Razorpay / Escrow / Wallet Truth & Credential Safety Audit (H6-09)

**Date:** 11 Aug 2026
**Role:** Chief Implementation Engineer / Repository Truth Verifier
**Scope:** VyaparSethu only, read-first. No payment test performed. No secret reproduced. No commit, no push, no deployment, no Bell24h-OS contact.
**Safety note:** per instruction, no full credential value appears anywhere in this document. Where a credential-shaped string is referenced, only the variable name, filename, and (for the one value where the prefix itself is not sensitive, per Razorpay's own documentation) the `rzp_live_` prefix are used.

---

## 1. Executive Summary

**Escrow and Wallet are real, live, and unconditionally enabled in production — confirmed by tracing the actual code path, not inferred.** There is no feature flag, no admin toggle with real effect, and no environment gate anywhere in the codebase that turns them off. What's built is a **pre-funded internal wallet-ledger model**, not a per-transaction payment-gateway escrow: a buyer tops up their `Wallet.balance` via a real, webhook-confirmed Razorpay payment; "locking escrow" on a deal is then an internal Prisma transaction that debits that already-verified balance; "releasing escrow" credits the supplier's `Wallet.balance` the same way. No live code path calls Razorpay again at the lock/release step — which is architecturally sound for a wallet model, not a defect.

**The hardcoded Razorpay credential in `src/lib/razorpay-config.ts` is, with the highest confidence static analysis can provide, dead code with zero production reach** — confirmed via an exhaustive repo-wide import trace (direct imports, indirect imports, barrel/re-export files) and a check of this session's own `next build` output, which contains no trace of the file. Its authenticity as a real vs. placeholder credential is **UNVERIFIABLE FROM REPOSITORY** — that determination requires the account owner to check it against the actual Razorpay dashboard, not something static code inspection can settle.

**A second, more consequential finding surfaced while tracing the webhook:** `/api/payment/webhook/route.ts` contains two branches. "Route B" (wallet credit) is live, correct, and properly signature-verified. "Route A" (a "Marketplace Deal" branch that writes to **InsForge**, a persistence layer this application does not otherwise use — CLAUDE.md and every other part of this codebase use Neon Postgres via Prisma) is **also confirmed dead** — no live code path ever creates a Razorpay order with the `notes.deal_id` field that branch requires to trigger. This is legacy code from an earlier, since-abandoned architecture, sitting alongside the live code, consistent with the InsForge-to-Prisma migration pattern already documented elsewhere in this repository's history (e.g. commit `39394f4`).

**No P0 blocker to the Hackathon 6.0 demo.** The founder decision needed is not "is something broken" — it's "do you want Escrow/Wallet live during the demo," since the evidence shows they already are, unconditionally.

---

## 2. Production Identity

| Item | Value |
|---|---|
| Working directory | `C:\Users\Sanika\Projects\bell24h` |
| Remote | `https://github.com/bell24xcom/forBell24x.git` |
| Branch | `main` |
| Local HEAD | `c076b1b3da9d319b1c85feef0cab9289661aba07` |
| `origin/main` (fresh fetch) | `c076b1b3da9d319b1c85feef0cab9289661aba07` — **identical** |
| Latest Vercel deployment | `dpl_3Wvm1U5PXSFcaJMuLHVKbbEdrjMv`, `READY`, `target: production` |
| Deployment `githubCommitSha` | `c076b1b3da9d319b1c85feef0cab9289661aba07` — **matches exactly** |
| Production domain | `www.vyaparsethu.com` (confirmed reachable, `/api/health` → 200) |

**No discrepancy. Production is serving the expected, current commit. No stop condition triggered by this phase.**

---

## 3. Escrow Runtime Trace

**A. What actually enables Escrow?** Nothing gates it — it is unconditional application logic. **CODE-ONLY / VERIFIED absence of a gate.**

**Governing code path**, traced end to end in `src/app/api/dashboard/deals/route.ts`:

| Action (POST body `action`) | Caller role required | Precondition (`Deal.status`) | Effect |
|---|---|---|---|
| `pay_wallet` | buyer only (`deal.buyerId === userId`) | `ACTIVE` or `PAYMENT_PENDING` | Checks `Wallet.balance >= deal.price`; in one Prisma `$transaction`: creates `WalletTransaction{type: 'ESCROW_LOCK'}`, decrements buyer's `Wallet.balance`, sets `Deal.status = 'ESCROW_LOCKED'` |
| `mark_shipped` | supplier only | `ESCROW_LOCKED` or `PAID` | `Deal.status = 'SHIPPING'` |
| `confirm_delivery` | buyer only | `SHIPPING` | `Deal.status = 'DELIVERED'` |
| `complete` | buyer only | `DELIVERED` | In one Prisma `$transaction`: `Deal.status = 'COMPLETED'`, `RFQ.status = 'COMPLETED'`, credits supplier's `Wallet.balance`, creates `WalletTransaction{type: 'ESCROW_RELEASE'}` |

**Key finding: "escrow lock" and "escrow release" never call Razorpay.** They operate entirely on the buyer's/supplier's already-existing internal `Wallet.balance`. This is **VERIFIED** by direct code read — no `fetch`/HTTP call to Razorpay anywhere in this file.

**Role/permission protections (J):** **VERIFIED** — every action checks `isBuyer`/`isSupplier` against `deal.buyerId`/`deal.supplierId` and returns `403` on mismatch; every action also checks the deal's current `status` before proceeding (no skipping steps).

**Environment guards (K) / test-vs-live mode guards (L):** **NOT FOUND.** No `NODE_ENV`, no test-mode flag, no environment-conditional branch anywhere in this route. It behaves identically regardless of environment (aside from whatever `DATABASE_URL` it's pointed at).

---

## 4. Wallet Runtime Trace

**B. What actually enables Wallet?** Same answer as Escrow — unconditional, no flag.

**How a wallet gets real money (the only point where Razorpay is actually involved):**

`src/app/api/payment/create-order/route.ts` creates a Razorpay order with `notes: { userId, type: 'WALLET_DEPOSIT', platform: 'Bell24h' }` — **VERIFIED**, this is the only `notes` shape found anywhere in the live order-creation code (checked `create-order`, `create-link`, `payments/create-order`).

`src/app/api/payment/webhook/route.ts` receives Razorpay's server-to-server confirmation:
- **Signature verification: VERIFIED correct.** HMAC-SHA256 over the raw request body using `RAZORPAY_WEBHOOK_SECRET`, compared against the `x-razorpay-signature` header. If the secret isn't configured, the handler returns `{status: 'skipped'}` rather than processing unverified input (fail-closed, correct). If the signature doesn't match, `400`.
- On `payment.captured` with `notes.userId` present ("Route B"): finds-or-creates the user's `Wallet`, and in one Prisma `$transaction`, increments `Wallet.balance` and records a `WalletTransaction{type: 'CREDIT'}`. Idempotency check present (`findFirst({where: {reference: paymentId}})` before crediting — prevents double-credit on webhook retry). **VERIFIED, correct, live.**

**"Route A"** (the InsForge marketplace-deal branch, triggered only by `notes.deal_id`) — **confirmed dead**, see §6.

**Wallet withdrawal / cash-out mechanism:** not traced this session — out of the scope this task defined (it asked about escrow/wallet *enablement*, not the full ledger lifecycle). Noted as **UNKNOWN**, not investigated further.

---

## 5. Admin Control Trace

**D. Is the Admin toggle functional or cosmetic?** **CONFIRMED COSMETIC.**

`src/app/api/admin/control-panel/route.ts` returns:
```
{ key: 'escrow_payments', label: 'Escrow Payments', enabled: true },
{ key: 'wallet_system',   label: 'Wallet System',   enabled: true },
```
This is a **hardcoded literal `true`**, not derived from any database row, environment variable, or feature-flag table. **There is no code path anywhere in the repository that reads these keys back to actually gate the escrow/wallet routes traced in §3–4.** An admin viewing this panel sees "enabled: true" because the source code says so unconditionally — not because a real, flippable switch was checked. Toggling this in the UI (if the UI even allows it — not traced whether the frontend renders these as interactive controls or read-only status) would have **no effect on live payment/escrow behavior**, since nothing consumes a mutated value.

**E. Is `enabled: true` hardcoded anywhere?** **VERIFIED, yes** — in the control-panel route above, and separately in the dead `RAZORPAY_CONFIG.escrow.enabled` (see §6) — two independent hardcoded-`true` sightings, neither wired to the live gate (because there is no live gate).

---

## 6. Razorpay Configuration Trace

**F. Which production API routes can initiate payment?** `POST /api/payment/create-order`, `POST /api/payment/create-link`, `POST /api/payment/subscribe`, `POST /api/payments/create-order` — all read `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` directly from `process.env`, **no fallback, fail closed** if either is missing (checked in each file this session).

**G. Which routes can capture/release/refund payments?** Capture happens Razorpay-side, confirmed via `/api/payment/webhook` (§4). No explicit refund route was located this session — not traced further, **UNKNOWN**, out of this task's specific question set.

**H. Which routes handle escrow state?** `src/app/api/dashboard/deals/route.ts` (§3), plus `src/app/api/deal/[id]/complete/route.ts` — this second route's own code comment (read in a prior session, re-confirmed present) explicitly says it is *"deliberately separate from the existing wallet-escrow completion"* and refuses to act on any deal whose status shows it already used wallet escrow — i.e., it's a guarded, non-overlapping alternate path, not a second competing escrow mechanism. **VERIFIED, no conflict.**

**I. Which routes handle wallet state?** `src/app/api/wallet/route.ts` (read/GET), `src/app/api/wallet/ledger/route.ts`, `src/app/api/wallet/razorpay/route.ts` (not fully traced this session — named consistently with a wallet-specific Razorpay entry point, **UNKNOWN detail, not required to answer this task's core questions**).

### Hardcoded credential file — `src/lib/razorpay-config.ts`

| Question | Answer | Classification |
|---|---|---|
| A. Does the file exist? | Yes | VERIFIED |
| B. Credential-shaped literals? | Yes — a key ID with the `rzp_live_` prefix (Razorpay's own docs treat key IDs as non-sensitive, safe for client exposure), a secret-shaped string assigned to `keySecret`, and a merchant-ID-shaped string. **None reproduced here.** | VERIFIED |
| C. Imported anywhere? | **No** — repo-wide search (`src/`, `lib/`) for the filename or `RAZORPAY_CONFIG` finds only the file's own definition | VERIFIED |
| D. Imported by any production route? | No | VERIFIED |
| E. Imported indirectly (barrel/re-export)? | No — checked separately, no file re-exports it | VERIFIED |
| F. Included in the production bundle? | No trace found in this session's own `next build` output (`.next/`) | VERIFIED (strong; not a guarantee against every possible build config, but consistent with C–E) |
| G. Do live payment routes use `process.env` instead? | Yes, all four order/payment-initiating routes read directly from `process.env`, confirmed in §6 above | VERIFIED |
| H. Do live routes fail closed if env vars are absent? | Yes — `create-link` and `create-order` both explicitly check and reject if `RAZORPAY_KEY_ID`/`SECRET` are unset | VERIFIED |

**Also found in the same file, same treatment (no value reproduced):** `escrow: { enabled: true, holdPeriod: 7 days, releaseThreshold: 0.8 }` — a second, independent hardcoded-`true`, in the same dead file, unconnected to the real escrow mechanism traced in §3.

---

## 7. Credential Exposure Analysis

**Classification: UNVERIFIABLE FROM REPOSITORY.**

Static repository inspection can establish that this string is credential-*shaped* (matches Razorpay's real key-ID prefix convention) and that it is *not reachable by any live code path* — it cannot establish whether the underlying key is currently active against a real Razorpay account, expired, revoked, or was always a placeholder. **This audit did not, and will not, attempt to authenticate to Razorpay using it**, per the absolute prohibition in this task's brief.

**Recommendation, per Phase 4's instruction: if potentially real, recommend immediate rotation by the account owner.** Given the key-ID prefix (`rzp_live_`) explicitly signals a *live*, not *test*, credential family, and given there is no way from this session to rule out authenticity, **the safe default is to treat it as potentially real and act accordingly** — i.e., the account owner should check this specific key ID against the live Razorpay dashboard and rotate/revoke it there if it corresponds to an active credential, independent of anything done to the source file. **This audit did not attempt rotation and was not provided authorization or access to do so.**

---

## 8. Live-vs-Dead Code Analysis

| File / branch | Status | Production impact of removal |
|---|---|---|
| `src/lib/razorpay-config.ts` (whole file) | **Dead** — §6 | **None.** Confirmed zero importers, zero bundle presence. Removing it changes no runtime behavior. |
| `/api/payment/webhook/route.ts` "Route A" (InsForge marketplace-deal branch) | **Dead** — no live order-creation code ever sets `notes.deal_id` (only `notes.userId`, confirmed repo-wide) | Not touched this session — flagged for awareness, not corrected, since the task's Phase 6 scope was specifically the credential file, and this branch, while dead, does not itself expose a credential |
| `/api/payment/webhook/route.ts` "Route B" (wallet credit) | **Live**, correct, load-bearing | N/A — not a removal candidate |
| Admin control-panel `enabled: true` literals | **Live** (the route itself is live and returns real JSON) but **cosmetic** (not wired to any gate) | Out of scope to change — no gate exists to wire it to without a design decision (§10) |

---

## 9. Production Risk Classification

| Risk | Severity | Status |
|---|---|---|
| Escrow/Wallet live in production with no kill switch | **Medium** — not a bug, but a real-money system running unconditionally during a Hackathon demo period deserves a deliberate decision, not a silent default | CONFIGURED (unconditionally) |
| Hardcoded credential-shaped secret in dead code, public repo | **Medium-High** until verified — no active exploitation path via this app's own runtime (confirmed dead), but the string itself remains publicly readable by anyone with repo access regardless of whether VyaparSethu's own servers ever call it | UNVERIFIABLE (authenticity) |
| Webhook signature verification | **Low** — correctly implemented | VERIFIED secure |
| Dead InsForge webhook branch | **Low** — unreachable, but represents architectural drift/confusion if ever revived without realizing it targets a defunct system | VERIFIED dead, not a live risk |
| Admin panel showing hardcoded flags as if they were real controls | **Low-Medium** — an operator could believe they have a kill switch they don't actually have | CONTRADICTED (UI implies control that doesn't exist) |

---

## 10. Founder Decision Required

1. **Is Escrow/Wallet being live in production, unconditionally, during the Hackathon 6.0 period intentional?** The evidence shows no gate exists either way — this is a yes/no decision about whether one should be built, not a report of something broken.
2. **Should the admin control-panel's `escrow_payments`/`wallet_system` flags be wired to a real, functional gate**, given they currently display state they don't control? This is a UX/trust question for the admin tool, separate from #1.
3. **Verify the `rzp_live_`-prefixed key ID (and its paired secret) in `src/lib/razorpay-config.ts` against the actual Razorpay dashboard, and rotate/revoke there if it is active.** This is the account owner's action — not something this session can perform or verify further.

---

## 11. Minimum Safe Corrective Action

**Evaluated and evidence-justified: remove `src/lib/razorpay-config.ts` in its entirety.** Justification, per Phase 6's bar: (a) a concrete safety defect exists (a real, credential-shaped, unverified secret sitting in a public repository), (b) it can be fixed without changing payment semantics (confirmed zero live importers, zero bundle presence — nothing about how payments work changes), (c) no payment code, business rule, database schema, transaction amount, or commission logic is touched.

**This action was attempted and blocked by the session's own permission system** (a safety classifier declined the file-deletion command, appropriately, given it touches a credential-shaped string). Per this session's standing practice of not working around such a block, **the removal was not forced through.** The file remains present, unchanged, exactly as found. `git status`/`git diff` confirmed clean before and after this attempt.

**Recommendation:** you can authorize this specific removal explicitly (a one-line `git rm src/lib/razorpay-config.ts` with no other changes), or remove it yourself. No other code path needs any change for this removal to be safe, per the dependency trace in §6.

**Nothing else was implemented.** No gate was added to Escrow/Wallet (per instruction, "do not implement the gate until the evidence proves that a gate is required" — the evidence here shows the *absence* of a gate is a decision to be made, not a defect to be silently patched).

---

## 12. Hackathon Safety Verification

`Verified Business → RFQ → AI Matching → Supplier → Quote → Deal → Escrow → Rating/Trust` — every file read in this audit was read-only. No file was edited. No database was touched, queried for real data, or migrated. No Razorpay order, payment, capture, or refund was initiated. No wallet balance was mutated. No webhook event was triggered. `git status --short` (tracked files) returned empty both before and after this session's work.

**Flow confirmed untouched.**

---

## 13. Final Verdict

- **Is Escrow actually enabled in production?** **YES — VERIFIED**, unconditionally, no gate.
- **Is Wallet actually enabled in production?** **YES — VERIFIED**, unconditionally, no gate.
- **What governs those states?** Deal-status business logic only (`src/app/api/dashboard/deals/route.ts`) — no feature flag, no environment gate, no admin-controlled switch despite the admin UI's cosmetic display.
- **Does the Admin UI accurately represent those states?** **NO — CONTRADICTED.** It shows `enabled: true` as if toggleable; nothing reads that value back to enforce anything.
- **Is the hardcoded credential real, stale, or placeholder?** **UNVERIFIABLE FROM REPOSITORY.** Treat as potentially real; verify against the Razorpay dashboard directly.
- **Is that credential reachable from any production code path?** **NO — VERIFIED dead**, exhaustively traced.
- **Are live payment routes using environment variables correctly?** **YES — VERIFIED**, all four order-initiating routes, fail-closed.
- **Could the exposed credential authorize live Razorpay API access?** **Cannot be determined from this repository** — only Razorpay's own systems can answer that; not tested here, per the absolute prohibition on live-testing a discovered credential.
- **Minimum safe corrective action:** remove the dead credential file — **evidence-justified, attempted, blocked by the permission system, not forced, awaiting your explicit approval or your own action.**

**This was a truth-and-safety sprint, not a payment feature-development sprint. No payment semantics were changed. No Escrow/Wallet gate was implemented. No Video Player or WhatsApp work was performed.**

---

## 14. Addendum (11 Aug 2026, same day) — Razorpay MCP Read-Only Verification

Following the founder's request to check the connected Razorpay MCP integration. **This is a separate, pre-authorized connection — not the hardcoded credential from `razorpay-config.ts`, which was still not used to authenticate anything, per §7's prohibition.**

**`fetch_all_payments` was blocked by the session's permission classifier and was not retried or forced.**

**`fetch_all_orders` and `fetch_all_settlements` succeeded (read-only) and add real evidence:**

- **The connected account is a genuine, live, actively-settling merchant account.** Three real settlements were returned, each with a real bank UTR reference (e.g. `AXISCN0395337594`) and `status: "processed"` — i.e., real money has actually been paid out to a real bank account through this account. **VERIFIED — this is not a test/sandbox account.**
- **One order exactly matches VyaparSethu's own live code shape:** `order_TFLAgvk9ZvhZa3`, `notes: {"platform":"Bell24h","type":"WALLET_DEPOSIT","userId":"cmm6dkvww0000js04aucrxo3r"}` — identical in shape to `create-order/route.ts`'s `notes: { userId, type: 'WALLET_DEPOSIT', platform: 'Bell24h' }` (§4). Status `"attempted"` (payment was started, not completed). **VERIFIED**: this is direct proof that VyaparSethu's real Wallet top-up flow has been exercised against this real Razorpay account at least once — not just theoretically wired, actually used.
- **New finding, not previously known: this Razorpay account is shared across multiple, unrelated projects.** The same order listing contains entries from what is clearly a different website (`notes.website_url: "https://hostscue.com/"`, WooCommerce "Knit Pay" plugin fields) and a separate, unrelated report-generation product (`notes.tier_name`, `notes.pages`, `notes.gst_amount`, `notes.user_id: "admin-1"`). **VERIFIED — multi-tenant use of one merchant account, confirmed from real order data, not inferred.** This matters directly for §7's credential-exposure risk: if the hardcoded key in `razorpay-config.ts` does correspond to this account, its blast radius is not limited to VyaparSethu.
- **What this does NOT resolve:** none of these read endpoints expose the connection's own API key ID, so **it is still not possible to confirm from available tools whether the specific hardcoded `rzp_live_`-prefixed key in `razorpay-config.ts` is this same account's live key, an old rotated key, a different account's key, or a placeholder.** §7's classification stands unchanged: **UNVERIFIABLE FROM REPOSITORY (AND FROM THIS MCP CONNECTION)** — only a direct Razorpay dashboard check (matching the key ID string itself against the account's API Keys page) can settle this.

**Net effect on the founder decisions in §10:** decision #3 (verify/rotate against the dashboard) is now higher-confidence-urgent — the account this credential family plausibly belongs to is confirmed real, live, multi-tenant, and settling real money, not a dormant or test setup. Decisions #1 and #2 are unchanged by this addendum.

No payment was created, captured, refunded, or modified. No credential was reproduced. No code was changed.

**STOP.**
