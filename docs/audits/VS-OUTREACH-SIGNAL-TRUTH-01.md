# VS-OUTREACH-SIGNAL-TRUTH-01

**Date:** 2026-09-03
**Scope:** production only. Every file cited below was read via `git show origin/main:<path>` — the exact commit deployed and confirmed `state: success` in the last known Vercel production deployment (`a6390fb3`, verified via `gh api repos/.../deployments`, re-confirmed fresh via `git fetch origin main` immediately before this audit). Working-tree files, this session's own branch, and the unmerged PR #54 branch are explicitly **not** used as evidence anywhere below — where they're mentioned at all, it's only to note they exist and are excluded.
**Rule followed:** no assumption is asserted without a file, a line number, and a quoted or reproduced code excerpt.

## Correction notice (read this first)

A prior audit this session (`docs/audits/VS-FOUNDER-LAUNCH-REALITY-CHECK-01.md`) concluded that `outreach_sent` is **never** written by any reachable code, because its only writer (`lib/agents/messenger.ts`) appeared to be imported by nothing. That conclusion was **wrong** — it resulted from a grep scoped only to `src/` and `lib/` at shallow depth, which missed `lib/agents/agent-zero.ts` importing `messenger.ts`, and missed that `agent-zero.ts` is itself imported by three live API routes. This report retraces the entire chain exhaustively and corrects the record. The true finding is more specific, and more interesting, than "never written": **`outreach_sent` is written by exactly one narrow, conditionally-gated path, tied to Voice/Video RFQ creation — not to any supplier-outreach action at all** — and that path's own "send" step never actually delivers a message. Full proof below.

---

## A. Every file involved

| File | Role |
|---|---|
| `src/app/api/voice-rfq/save/route.ts` | Entry point 1 — real voice-RFQ save, calls `agentZero()` |
| `src/app/api/video-rfq/route.ts` | Entry point 2 — real video-RFQ save, calls `agentZero()` |
| `src/app/api/rfq/guest-sync/route.ts` | Entry point 3 — guest RFQ sync, calls `agentZero()` conditionally |
| `src/app/api/rfq/create/route.ts` | The standard **text**-RFQ creation route — checked and confirmed to **not** call `agentZero()` at all |
| `lib/agents/agent-zero.ts` | Orchestrator — `agentZero()`, `decideStrategy()` |
| `lib/agents/scout.ts` | `findSuppliers()` — supplier candidate search |
| `lib/agents/messenger.ts` | `sendOutreach()`, `shouldContact()`, `buildMessage()` — **the only writer of `outreach_sent`** |
| `lib/memory-engine.ts` | `storeInteraction()` — the actual `prisma.interactionMemory.create()` call underlying every write in this chain; also `getMarketInsights()`, `getSimilarRFQs()` (read-only, used by `decideStrategy`/`scout`) |
| `lib/supplier-drip-engine.ts` | `getDripsDue()`, `logDripSent()` — Day 3 / Day 7 / Day 14 selection query |
| `lib/follow-up-engine.ts` | `getFollowUpsDue()`, `logFollowUpSent()` — Day 2 / Day 5 selection query |
| `src/app/api/cron/supplier-drip/route.ts` | Cron endpoint — calls `getDripsDue()` + `logDripSent()` |
| `src/app/api/cron/follow-up-due/route.ts` | Cron endpoint — calls `getFollowUpsDue()` (no completion-logging call exists in this route at all) |
| `src/app/api/cron/daily/route.ts` | Dispatcher — the only Vercel-registered cron, fans out via server-to-server `fetch` to both cron endpoints above |
| `lib/cronAuth.ts` | `verifyCronSecret()` / `getCronHeaders()` — gates every `/api/cron/*` route on `CRON_SECRET` |
| `vercel.json` | Confirms exactly one registered cron: `/api/cron/daily`, `30 3 * * *` UTC |
| `src/app/admin/n8n/page.tsx` | The only admin page that references either cron endpoint — confirmed to display cron *metadata* only, never the `wa.me` links either cron's response body carries |
| `src/app/api/admin/outreach/bulk-wa/route.ts`, `src/app/api/admin/outreach/daily-batch/route.ts`, `src/app/admin/outreach/page.tsx` | The **separate**, unrelated, real-delivery outreach system — writes `day1_wa_sent`, not `outreach_sent`. Included here only to prove it is a different system, not a source of `outreach_sent` |

Excluded, and why: `src/lib/supplier-drip-engine.ts` and `src/lib/follow-up-engine.ts` exist in the working tree but are imported by nothing anywhere (confirmed by `Grep` scoped to `src/` and `lib/` for each import path) — dead files, correctly excluded per instruction 7. `lib/agents/agent-zero.ts`'s single caller-chain does **not** pass through anything in `_archive/` — that directory is excluded from TypeScript compilation by `tsconfig.json`'s own `exclude` list and is not part of the deployed app; the `sendOutreach` references inside `_archive/` are unrelated legacy code with the same function name, not this pipeline.

---

## B. Import chains — traced exactly, file → file

**Chain 1 (Voice RFQ):**
```
src/app/api/voice-rfq/save/route.ts
  import { agentZero } from '@/lib/agents/agent-zero';
    → lib/agents/agent-zero.ts
        import { findSuppliers } from './scout';        → lib/agents/scout.ts
        import { sendOutreach } from './messenger';      → lib/agents/messenger.ts
            import { storeInteraction } from '@/lib/memory-engine';  → lib/memory-engine.ts
                storeInteraction() → prisma.interactionMemory.create()
```
Call site (`voice-rfq/save/route.ts` line ~108): `agentZero({...}).catch(...)` — **unconditional call**, no `AGENT_MODE` check at this call site, fire-and-forget (not awaited).

**Chain 2 (Video RFQ):** identical shape. `video-rfq/route.ts` line ~290: `agentZero({...}).catch(...)` — also unconditional at the call site, fire-and-forget.

**Chain 3 (Guest RFQ sync):** `guest-sync/route.ts` lines 46-61 — explicitly gated: `if (process.env.AGENT_MODE === 'live') { agentZero({..., maxBudget: null, ...}) } else { console.log('AGENT_MODE=test — agentZero skipped') }`. Note `maxBudget: null` is hardcoded here — see §F, this alone guarantees this specific chain never reaches `sendOutreach`.

**Chain 4 (cron side):**
```
vercel.json → "path": "/api/cron/daily", "schedule": "30 3 * * *"
  src/app/api/cron/daily/route.ts
    verifyCronSecret(req)   [lib/cronAuth.ts]
    callCron('/api/cron/supplier-drip')   → fetch with getCronHeaders()
    callCron('/api/cron/follow-up-due')   → fetch with getCronHeaders()
      src/app/api/cron/supplier-drip/route.ts
        import { getDripsDue, logDripSent } from '@/lib/supplier-drip-engine';
          → lib/supplier-drip-engine.ts   (root — confirmed the resolved target of the `@/lib/*` alias)
      src/app/api/cron/follow-up-due/route.ts
        import { getFollowUpsDue } from '@/lib/follow-up-engine';
          → lib/follow-up-engine.ts       (root — same alias resolution)
```

**Chain 5 (the RFQ-creation route that does NOT participate):**
```
src/app/api/rfq/create/route.ts
  — grepped for "agentZero" / "agent-zero": zero matches.
```
This is the route backing both public RFQ-creation forms (`/rfq/create`, `/rfq-create`) referenced throughout every prior audit in this repo as the primary, most-used RFQ creation path. It never touches this pipeline at all.

---

## C/D/E. Where `outreach_sent` is written — proof, and proof of what does *not* write it

**Exhaustive search, whole-repo, production commit:** `git grep -n "outreach_sent" origin/main -- '*.ts' '*.tsx'` returns 24 matches across 7 files. Every one was individually classified:

| File:line | Read or Write? |
|---|---|
| `lib/agents/messenger.ts:75` | **Read** — inside `shouldContact()`'s dedup check (`prisma.interactionMemory.findFirst({where:{...actionType:'outreach_sent'...}})`) |
| `lib/agents/messenger.ts:125` | **WRITE** — the only write in the entire repository. `storeInteraction({ rfqId: rfq.id, userId: supplier.id, actionType: 'outreach_sent', source: 'whatsapp', metadata: {...} })` |
| `lib/follow-up-engine.ts` (comment + query at line 87) | **Read only** — `getFollowUpsDue()`'s `findMany({where:{actionType:'outreach_sent',...}})`. `logFollowUpSent()`, this file's only write function, writes `follow_up_1_sent`/`follow_up_2_sent`, never `outreach_sent`. |
| `lib/supplier-drip-engine.ts` (comment + query) | **Read only** — same pattern, `getDripsDue()`'s `findMany`. `logDripSent()` writes `drip_dayN_sent`, never `outreach_sent`. |
| `lib/knowledge-base.ts:279` | **Documentation string only** — a text description inside a knowledge-base content array, not executable logic |
| `src/app/admin/outreach/page.tsx`, `src/app/api/admin/launch-metrics/route.ts`, `src/app/api/admin/outreach-stats/route.ts`, `src/app/api/metrics/funnel/route.ts` | **Read only** — all four are analytics/display code counting existing rows, none creates one. `outreach-stats/route.ts` line 14 contains its own comment confirming this: `'outreach_sent', // legacy key — kept for backward compat; may have 0 rows`, and line 79 states the **current, actual key is `day1_wa_sent`**, not `outreach_sent`. |

**Conclusion for D/E:** `outreach_sent` is **not never written** — instruction D's premise ("if it is never written, prove it") does not hold absolutely. It has exactly **one** writer, gated behind all of the following, every one of which is required simultaneously:

1. The RFQ was created via `voice-rfq/save`, `video-rfq`, or `guest-sync` — **not** via the standard `/api/rfq/create` (proven by chain 5's zero-match grep).
2. `rfq.isSeeded` is falsy (`agentZero()` returns early with `strategy:'skip'` otherwise — `lib/agents/agent-zero.ts`, the `if (rfq.isSeeded)` guard near the top of the function).
3. `guest-sync`'s path is additionally excluded structurally: it hardcodes `maxBudget: null`, and `decideStrategy()`'s first check is `if (!ctx.maxBudget || ctx.maxBudget < 10000) return {strategy:'skip', ...}` — `!null` is `true`, so every guest-sync-originated call always evaluates to `'skip'` before any supplier is ever contacted, regardless of `AGENT_MODE`. **Guest-sync can never reach the write, structurally, independent of any environment variable.**
4. For the two remaining chains (voice, video): `decideStrategy()` must not return `'skip'` — also skips on demand `'DECLINING'` or high-drop-off behavior signals (`lib/agents/agent-zero.ts` lines ~48-66).
5. `findSuppliers()` (`lib/agents/scout.ts`) must return at least one candidate — its own where-clauses all require `isClaimed: true, isActive: true` on the `User` row; a 3-tier fallback (memory-proven → category-matched → any active-in-location) makes an empty result unlikely *if any claimed supplier exists at all*, but not impossible on an empty/near-empty supplier base.
6. Inside `sendOutreach()` (`lib/agents/messenger.ts`), the **safety gate**: `if (process.env.AGENT_MODE !== 'live') { return [...blocked...] }` — confirmed present, unconditional, at the top of the function.
7. Per supplier: `trustScore >= 30`, and `shouldContact()` (not already quoted this RFQ, not contacted this exact RFQ+supplier pair in the last 7 days).

**`AGENT_MODE` value, local files only (production Vercel value not verifiable from this sandbox):** `grep "^AGENT_MODE=" .env .env.local` → `AGENT_MODE="live"` in **both** files. This is presented as a fact about local configuration only — per this whole audit series' established discipline, a local `.env` value is never treated as proof of the production Vercel environment's value.

**A separate, independent finding that undercuts even the "successfully written" case:** inside `sendOutreach()`, after the `storeInteraction()` write, the function does **not** call any WhatsApp send API. It does this instead:
```ts
// In production: integrate with WhatsApp Business API (wa.me links or WhatsApp Cloud API)
// For now: log to console + InteractionMemory
const waLink = supplier.phone ? `https://wa.me/91${...}` : null;
if (waLink) { console.log(`[Messenger] Would send to ${supplier.company}...`, waLink); }
```
The comment says it itself: this is a stub. **No message is ever actually delivered to the supplier by this code path, in any configuration.** The `outreach_sent` row records that the *system decided to* contact someone, not that any contact occurred.

---

## F. Can Day 3, Day 5, Day 7, and Day 14 ever be selected by the cron query?

Given an `outreach_sent` row *does* exist (i.e., all seven gates in §E were satisfied at least once), tracing each drip type's own selection logic against `origin/main`:

- **Day 3** (`lib/supplier-drip-engine.ts`): `const profileComplete = !!supplier.company; if (profileComplete) continue;` — skips if the supplier has a `company` value. Every supplier `findSuppliers()` can ever return requires `isClaimed: true` (scout.ts). Claiming a profile does not clear `company` — it is the same field, required and populated since import (`import-suppliers/route.ts` rejects any row without it). **Every supplier who could ever reach this branch already has `company` set, so `profileComplete` is `true` for 100% of real candidates, unconditionally.** **Day 3 cannot be selected. This is proven, not inferred — verified by reading `import-suppliers/route.ts`, `scout.ts`, and `supplier-drip-engine.ts` together, not by trusting any one file's comment.**
- **Day 7**: gate is only `hasQuotedSet.has(supplierId)` (skip if already quoted this — wait, actually the query is `prisma.quote.findMany({where:{supplierId:{in:supplierIds}}})`, distinct by `supplierId`, not RFQ-scoped — skips if the supplier has quoted *anything*, not specifically this RFQ). No equivalent structural bug found. **Selectable in principle**, conditional on an `outreach_sent` row existing 6-8 days old and that supplier having quoted nothing at all since.
- **Day 14**: gate is `lastLoginAt` recency (skip if logged in within 14 days). No structural bug found. **Selectable in principle**, same `outreach_sent`-existence precondition, 13-15 day window.
- **Day 2** (`lib/follow-up-engine.ts`): gates on not-yet-quoted-this-specific-RFQ and RFQ not `CLOSED`/`EXPIRED`. No structural bug found. **Selectable in principle**, same precondition, 48-72h window, **and** additionally requires the `outreach_sent` row to carry a non-null `rfqId` — which `messenger.ts`'s write does provide.
- **Day 5**: additionally requires Day 2 to have already been sent (`follow_up_1_sent` present) — sequential dependency on Day 2 having fired first. **Selectable in principle**, same preconditions plus that sequencing.

**Net answer to the audit's core question:** Day 7, Day 14, Day 2, and Day 5 are **not structurally dead** — the code is correct and would select real candidates if an `outreach_sent` row exists in the right time window. Day 3 **is structurally dead**, unconditionally, independent of whether `outreach_sent` is ever written at all. And **all four of the non-Day-3 types are gated on a precondition (`outreach_sent` existing) that itself depends on the seven-gate chain in §E — including a production environment variable this audit cannot verify, and a "send" step that, even at its most successful, never delivers a real message.**

---

## G. Stage-by-stage verdicts

| Stage (per the requested pipeline) | Verdict | Basis |
|---|---|---|
| Outreach send (the action that is *supposed* to precede `outreach_sent`) | **VERIFIED BROKEN** | `sendOutreach()` never calls any delivery API — confirmed by reading the function body; it logs to console only, regardless of configuration |
| → `outreach_sent` creation | **VERIFIED WORKING**, conditionally | The write statement is real, unconditional Prisma code (`storeInteraction`→`prisma.interactionMemory.create`) and *will* execute correctly if reached — but reaching it requires the 7-gate chain in §E, one gate of which (`AGENT_MODE` in production) is **NOT PROVABLE** from this sandbox |
| → Supplier state update | **VERIFIED BROKEN / does not exist** | `messenger.ts`'s write touches only `InteractionMemory` — no `prisma.user.update` anywhere in this file. Unlike the separate `bulk-wa` system (which does update `User.claimToken`/`claimSentAt`/`outreachCount`), this pipeline has no supplier-row state change at all |
| → Cron selection query | **VERIFIED WORKING** | Both `getDripsDue()` and `getFollowUpsDue()` are correct, well-formed Prisma queries that would return accurate results given real input data — the query logic itself is not the defect |
| → Follow-up trigger (per type) | **Day 3: VERIFIED BROKEN** (proven bug, §F) · **Day 2/5/7/14: VERIFIED WORKING as logic, NOT PROVABLE as ever-executed** | Day 3's bug is provable from static code alone. Whether Day 2/5/7/14 have ever actually fired requires production DB access this audit does not have |
| → Message generation | **VERIFIED WORKING** | `buildDripMessage()`/`buildFollowUpMessage()` execute without missing references and produce valid text + `wa.me` URLs, confirmed by direct read. (Side note, not a functional break: still Bell24h-branded — `- Bell24h Team`, `bell24h.com` links — in `origin/main`, not rebranded) |
| → Delivery path | **VERIFIED BROKEN** | Two independent proofs: (1) the initial "outreach send" never calls a delivery API (above); (2) even a successfully-generated Day 2/5/7/14 candidate's `wa.me` link is returned only in a cron endpoint's raw JSON response — `src/app/admin/n8n/page.tsx`, the only admin page that references either cron path, displays cron *metadata* (name/schedule/description) and never renders the `waLink`/`drips` fields those responses actually carry. No UI path exists for a human to see or act on it |

**Direct answer to the audit's objective:** the supplier outreach persistence engine, as deployed on `origin/main` today, is **not** capable of executing real Day 3, Day 5, Day 7, or Day 14 follow-ups end-to-end. Day 3 is dead by a proven code defect regardless of any other factor. Day 5/7/14 (and Day 2) are not structurally dead, but the entire chain feeding them depends on a "send" step that never delivers a real message and an unverifiable production environment flag — and even in the best case, nothing in the admin UI would ever surface the result for a human to complete the loop.

---

## UNTRACKED / UNSTAGED / UNCOMMITTED

Current branch: `fix/admin-audit-phase1-4`, still 4 commits ahead of `origin/main` / 0 behind (unchanged from prior audits, reconfirmed via fresh `git fetch origin main` at the top of this session). `git status --porcelain` shows the same pre-existing 21 modified + ~65 untracked entries carried forward from every prior report in this series, plus this report's own new file and the two prior reports' files — all left untracked, nothing staged, nothing committed, nothing pushed, per instruction.
