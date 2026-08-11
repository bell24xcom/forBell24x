# H6-10A — VyaparSethu Payment-Control Truth Cleanup Report

**Date:** 11 Aug 2026
**Scope:** Three targeted, evidence-justified fixes carried over from H6-09/its addendum. No new features, no new enforcement logic, no live payment route touched. Not committed — awaiting founder review per instruction.

---

## Light confirmation pass (not a re-audit)

Before making any change: `git status`/`git diff` confirmed clean (no drift since H6-09), and one grep re-confirmed `src/lib/razorpay-config.ts` still had zero importers anywhere in `src/`/`lib/`. Both matched H6-09 exactly — proceeded on that basis rather than re-deriving from scratch.

---

## 1. Deleted `src/lib/razorpay-config.ts`

Removed in full (176 lines: the dead, credential-shaped `RAZORPAY_CONFIG` object plus its unused `escrow.enabled: true` literal). This was previously attempted in H6-09 and blocked by the permission system as unauthorized; this task explicitly authorized it, and the founder has since rotated the live Razorpay key on the dashboard, making the file's hardcoded value both unreachable *and* stale. Zero live importers, confirmed both in H6-09 and again here — removal has no runtime effect.

---

## 2. Admin panel: made the Escrow/Wallet indicators honest

**Correction to the H6-09 framing, found while implementing this fix (not a re-audit — a natural byproduct of reading the file to change it):** the H6-09 report described these as "hardcoded `enabled: true` literals that nothing reads back." That's not quite what the code does. `src/app/api/admin/control-panel/route.ts` has a real `FeatureFlag` Prisma table, seeded once from a static `DEFAULT_FLAGS` array, then genuinely read from and written to on every request (`GET` reads `prisma.featureFlag.findMany()`; a real `PATCH` handler persists `enabled` changes). The admin page's toggle is a fully wired, working UI control — click it, and it really does flip a persisted database value.

**What's actually true, and what actually needed fixing:** nothing in the live escrow/wallet code path (`src/app/api/dashboard/deals/route.ts`'s `pay_wallet`/`complete` actions, or the payment routes) ever reads that `FeatureFlag` value back to gate anything. So the toggle is *real* (it persists, it displays correctly, it round-trips through the database) but has **zero effect on actual payment behavior** — which is arguably more misleading than a purely cosmetic hardcoded value, since it looks and behaves like a working control right up until you check whether flipping it does anything.

**Fix implemented — Option A, adapted to the real shared-component structure:** the Feature Flags list in `src/app/admin/control-panel/page.tsx` renders one generic toggle UI for all 9 flags (`voice_rfq`, `video_rfq`, `ai_matching`, `escrow_payments`, `wallet_system`, `referral_program`, `maintenance_mode`, `gst_verification`, `auto_expire_rfqs`). Rather than touch the shared component or the backend, the render loop now special-cases exactly `escrow_payments` and `wallet_system`:
- The interactive toggle button is replaced with a static, non-clickable **"Always On (Production)"** badge.
- A one-line amber note is added under the description: *"Core payment infrastructure — always on in production. This switch is not wired to any enforcement and toggling it has no effect on live payments."*
- All other 7 flags are completely unaffected — same toggle button, same `PATCH` call, same behavior as before.

**Option B was evaluated and correctly not used:** wiring real enforcement would require adding a `FeatureFlag` lookup and an early-return check inside `dashboard/deals/route.ts`'s live payment-transition logic — new backend logic in a payment-critical route, exactly what this task's scope and the "explicitly out of scope" list forbid. Per the task's own instruction ("if it would require new backend enforcement logic, STOP and report — do not build it"), that path was not taken.

**No backend code was changed for this fix.** The `FeatureFlag` table, the `GET`/`PATCH` handlers, and the toggle mechanism for every other flag are untouched.

---

## 3. Removed the dead InsForge "Route A" branch

`src/app/api/payment/webhook/route.ts` previously had two branches on `payment.captured`: a "Route A" that, on `notes.deal_id`, made raw `fetch` calls to `INSFORGE_URL` to update `deals`/`transactions` tables in a persistence layer this application doesn't otherwise use anywhere (confirmed in H6-09 — this app is Neon Postgres + Prisma throughout), plus an N8N webhook notification; and "Route B," which credits the user's real Prisma `Wallet` on `notes.userId`.

**Removed:** Route A in its entirety (the `if (notes.deal_id)` block, ~30 lines) and its three now-unused top-of-function `const` declarations (`INSFORGE_URL`, `INSFORGE_API_KEY`, `N8N_WEBHOOK_URL`). H6-09 confirmed, and this task re-confirmed via the same grep, that no live order-creation code anywhere in the repo ever sets `notes.deal_id` — every real order sets `notes.userId`/`type: 'WALLET_DEPOSIT'` instead — so this branch could never execute.

**Untouched, confirmed byte-identical:** the `if (notes.userId) { ... }` block (the live, executing wallet-credit path) — same idempotency check (`findFirst({where: {reference: paymentId}})`), same wallet find-or-create, same `prisma.$transaction([...])` with the same two operations, same return value. Verified via `git diff` on the file: the diff touches only the removed declarations and the removed branch; every line from `if (notes.userId) {` onward is absent from the diff entirely, meaning git detected zero change to that code.

---

## Validation Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean — no errors in any of the three touched files (grepped specifically for them in the full output) |
| `npx next build` | Exit 0, compiled successfully |
| Live wallet-credit webhook path byte-identical before/after | **Confirmed via `git diff`** — the `if (notes.userId)` block and everything inside it does not appear in the diff at all |
| No live route imports the deleted file | Re-confirmed (grep, zero matches) before deletion |
| `git diff --stat` | Exactly the three intended files, plus `tsconfig.tsbuildinfo` (routine build-cache regeneration from running `tsc`, not a source change — same pattern seen in every prior session this week) |

```
 src/app/admin/control-panel/page.tsx |  48 +++++++---
 src/app/api/payment/webhook/route.ts |  42 ++-------
 src/lib/razorpay-config.ts           | 176 -----------------------------------
 tsconfig.tsbuildinfo                 |   2 +-
 4 files changed, 43 insertions(+), 225 deletions(-)
```

No unrelated file appears in the diff. `git status` shows no other tracked-file changes beyond these four; untracked files present are the same pre-existing set from before this session's work (`.kilo/`, `claude-1.txt`, the `docs/MASTER_*.md` set, and this week's other audit reports).

---

## What was explicitly not done

- No enforcement/gating logic was added for Escrow or Wallet.
- `create-order/route.ts` and every other live payment route: untouched.
- Video Player, Cloudinary, WhatsApp, Bell24h-OS: untouched.
- No environment variable was changed.
- No commit, no push, no deployment.

---

**STOP. Awaiting founder review before commit, push, or deployment.**
