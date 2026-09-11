# MASTER MARKETPLACE & TRANSACTION ENGINE RECOVERY — Pass 2D

**Compiled:** 2026-08-03. This is the pass with the richest evidence base of the whole recovery project, because the marketplace/transaction chain is exactly what this session's own direct, live-traced code audits (today and yesterday) already covered in the greatest depth — those audits are treated here as the highest-confidence tier, cross-referenced against Pass 2A/2B/2C's document-based history and two new artifacts found this pass (a real deployment script and a real n8n workflow, both escrow-related).

Tagging: **VERIFIED** / **INFERRED** / **UNKNOWN**.

---

## New evidence this pass

- **`scripts/deploy-escrow.cjs`** (current repo, also archived) — a real Hardhat deployment script targeting **Sepolia** (an Ethereum L1 testnet), reading `PRIVATE_KEY`/`SEPOLIA_RPC_URL`/`ESCROW_PLATFORM_FEE` from environment. **This contradicts `BELL24H_BLOCKCHAIN_IMPLEMENTATION_PLAN.md`'s stated target network of Polygon (chainId 137).** Document A (`BELL24H_BLOCKCHAIN_IMPLEMENTATION_PLAN.md`) says Polygon mainnet. Actual deployment tooling (`deploy-escrow.cjs`) targets Sepolia testnet. Current production evidence: neither network shows any live, wired contract — the escrow that actually runs in production today is the Prisma wallet-ledger simulation, not any blockchain deployment on either network. **Confidence: VERIFIED that the plan and the deployment script disagree on network; UNKNOWN whether the contract was ever actually deployed to either network (no deployment address or transaction hash found in any document read).**
- **`n8n/workflows/escrow.workflow.json`** (current repo root, also archived) — a real, simple n8n workflow: webhook receiver → send email to seller ("Escrow Released – Transaction ID...") → POST to `http://analytics.bell24h.com/log`. This confirms escrow-release notifications were planned to flow through n8n, and references a custom analytics subdomain (`analytics.bell24h.com`) not found documented anywhere else in this recovery. **VERIFIED** as a real artifact; **UNKNOWN** whether it was ever actually activated/triggered in production, and **UNKNOWN** what `analytics.bell24h.com` was or whether it still exists.

---

## Buyer Lifecycle

**Originally Planned:** `ARCHITECTURE.md` (locked March 2026) — buyer is not a separate account type; every user is buyer + supplier by default, single unified dashboard with a view-mode toggle, no permission gating by role.
↓ **Partially Built / Tension point:** the quote-acceptance bug fixed this session (`hasRole(user, ['BUYER','ADMIN'])`) was a direct, real violation of this frozen rule — evidence that the rule was written down clearly but not consistently enforced in every route that got built afterward.
↓ **Implemented:** RFQ creation, quote review, quote acceptance, deal lifecycle actions (pay, confirm delivery, complete) — all confirmed live and working this session, after the role-gate fix.
↓ **Current Production State: VERIFIED active.** A buyer today can complete the full lifecycle from RFQ to a completed, paid deal.

## Supplier Lifecycle

**Originally Planned:** a `ScrapedCompany`/`CompanyClaim` two-table pre-populated-then-claimed model (`SUPPLIER_PROFILE_IMPLEMENTATION_PLAN.md`, old-repo era).
↓ **Partially Built:** components existed "in backup" per that same document, not yet wired to live routes at time of writing.
↓ **Replaced:** current schema abandons the two-table design; claim fields (`isClaimed`, `claimToken`, `claimedAt`) live directly on the unified `User` model. **UNKNOWN** why the redesign happened — no document explains it.
↓ **Current Production State: VERIFIED active**, with one real bug found and fixed this session (the deep-link claim variant's broken redirect, commit `b732e92`) and one confirmed-working plain claim path (`/claim/[token]`).

## RFQ Lifecycle

**Originally Planned/First built:** Day 1 of the old repo (2025-05-04): "streamline RFQ processing with AI."
↓ **Evolved:** Voice RFQ and Video RFQ added as first-class input modes (Groq Whisper-based transcription for voice, confirmed live).
↓ **Current Production State: VERIFIED active.** `POST /api/rfq/create` confirmed working live this session, including a same-session production fix (budget string→number conversion, uppercase urgency enum) referenced directly in `docs/production-readiness-roadmap-2026-07-27.md`'s smoke-test log.

## Quote Lifecycle

**Originally Planned:** part of the same Day-1 RFQ processing feature.
↓ **Implemented, with a parallel "Concierge" path added later:** `Quote.source` field (`SELF_SUBMITTED` vs. `CONCIERGE_SOURCED`) — staff can submit a quote on a supplier's behalf for cold-start liquidity. Backend fully built (`POST /api/admin/rfqs`, `action: 'submit-concierge-quote'`), **frontend never built** — confirmed independently by `docs/production-readiness-roadmap-2026-07-27.md`'s own live grep and git-blame (single commit `af57dee`, no follow-up, ever).
↓ **Current Production State:** self-submitted quote path **VERIFIED active** end-to-end (submission → acceptance). Concierge path: backend **VERIFIED working**, frontend **VERIFIED not built** — this is a real, still-open, independently-confirmed gap, not a historical curiosity.

## Deal Lifecycle

**Originally Planned:** implied by the RFQ→Quote chain; no standalone "Deal" planning document found in any pass.
↓ **Implemented:** `Deal` record created transactionally on quote acceptance (`src/app/api/deal/select/route.ts`), status progression `ACTIVE → ESCROW_LOCKED → SHIPPING → DELIVERED → COMPLETED` fully implemented in `src/app/api/dashboard/deals/route.ts`, with correct relationship-based permission checks (`deal.buyerId`/`deal.supplierId`) — notably, this route does **not** have the role-gate bug that blocked quote acceptance, meaning the bug was isolated to one entry point, not systemic across the whole deal chain.
↓ **Current Production State: VERIFIED active**, fully live-traced this session, one blocking bug found and fixed at the entry point (quote acceptance), the downstream lifecycle was already sound.

## Wallet Evolution

**Originally Planned:** `BELL24H_FEATURES_COMPLETION_TABLE.md` claims a wallet built on **RazorpayX**.
↓ **Actually Implemented:** a Prisma-native wallet (`Wallet`/`WalletTransaction` models), balance/add-funds/ledger all real and working, confirmed live this session — **two parallel UI implementations found** (`/wallet` and `/dashboard/wallet`), both hitting the real Razorpay create-order/verify flow for add-funds specifically, but the wallet *balance and ledger* themselves are Prisma-native, not RazorpayX-hosted balances as the older document implies.
↓ **Current Production State:** Add Funds, Balance, Ledger — **VERIFIED active**. Withdraw — **VERIFIED not built**, an explicit disabled "Coming Soon" button, contradicting `BELL24H_FEATURES_COMPLETION_TABLE.md`'s claimed "85% Complete."

## Escrow Evolution

This is the single most-evolved, most-contradicted workflow found in the entire recovery, spanning four generations of design:

**Generation 1 — Blockchain (Polygon, per plan):** `BellEscrow.sol`, `BellToken.sol`, Polygon chainId 137 target, staking/liquidity-mining token economics (`BELL24H_BLOCKCHAIN_IMPLEMENTATION_PLAN.md`).
↓
**Generation 2 — Blockchain (Sepolia, per actual deploy tooling):** `scripts/deploy-escrow.cjs` targets Sepolia testnet, not Polygon — a real, evidenced contradiction between the plan and the tooling built to execute it. **UNKNOWN** whether any contract was ever actually deployed to either network — no address or tx hash found anywhere in this recovery.
↓
**Generation 3 — n8n notification layer bolted onto the blockchain design:** `n8n/workflows/escrow.workflow.json` — webhook → email seller → log to `analytics.bell24h.com`, presumably meant to fire on a contract's release event. **UNKNOWN** whether this was ever connected to anything real.
↓
**Generation 4 — Dedicated REST API stub:** `src/app/api/escrow/route.ts` — explicitly "coming soon," no `EscrowTransaction` model ever created.
↓
**Generation 5 — Current, actually-working implementation:** a wallet-ledger simulation inside the Deal lifecycle route (`ESCROW_LOCK`/`ESCROW_RELEASE` `WalletTransaction` types), confirmed live and transactionally sound this session. Meets neither the blockchain vision nor the separately-specified Razorpay+Nodal-Account regulated architecture (`VYAPARSETHU_MASTER_PLAN.md` Ch.7.3) — a third, simpler design that actually shipped while two more ambitious ones didn't.
↓
**Current Production State: VERIFIED active** (Generation 5 only). Generations 1–4 are dormant, unconnected, or stubbed.

## Trust Score Evolution

**Originally Planned:** CLAUDE.md's documented weighted formula (30% payment history / 20% delivery / 15% response speed / 15% repeat orders / 10% dispute rate / 10% verification), computed via daily cron only, never real-time.
↓
**Actually built — three separate, disagreeing implementations, all real code, confirmed this session:**
1. `User.trustScore` — increment/clamp pattern, updated by onboarding bonuses, the claim flow's floor-at-30, and (as of this session's Ratings rewrite) reviews.
2. A separate ad-hoc formula in `api/supplier/[id]/route.ts`/`api/supplier/stats/route.ts` that never reads field #1.
3. Admin diagnostics' unrelated aggregate "Business Memory" score.
**None of the three implements the documented weighted formula.** **Current Production State: VERIFIED — this is a live, current inconsistency, not something that was fixed at any point in the recovered history.**

## Company Claim Evolution

Covered in full under Supplier Lifecycle above; repeating the headline only: two-table scraped/claim design → superseded by unified-User-model claim fields → one live bug found and fixed this session in the deep-link variant.

## Marketplace Evolution (overall positioning)

Already covered in Pass 2A in detail (Bell24h "beat IndiaMART on features" → VyaparSethu "Business Operating Platform, memory first"). Not repeated here beyond the cross-reference.

## Verification Evolution

**Originally Planned:** auto-fetch verification against real GST and Udyam government APIs, even at the most basic membership tier (`VYAPARSETHU_MASTER_PLAN.md` Ch.7.1).
↓
**Actually built:** format-length checking only (`api/supplier/gst/route.ts`), no persistence, no real API call anywhere in the codebase; `gstVerified` is a client-supplied boolean the server trusts without verification. Udyam: zero validation of any kind.
↓
**Current Production State:** **VERIFIED** as a known, self-disclosed gap — the platform's own admin UI (`control-panel/page.tsx`) explicitly labels this "self-reported... Phase 1," meaning the gap is acknowledged internally, not hidden. This is one of the few gaps in the whole recovery that comes with its own honest internal disclosure.

## Review & Rating Evolution

**Originally Planned/Built:** against InsForge, with no Prisma model ever created for it — meaning it was structurally incapable of working even while InsForge was the active backend, let alone after InsForge was dropped within its first 24–48 hours.
↓
**Sat broken for the entirety of the recovered history** until this session.
↓
**Rewritten this session:** real `Review` Prisma model, migration `0010_reviews`, commit `39394f4`, verified via source trace (live execution not attempted, per this session's own stated constraints at the time).
↓
**Current Production State: VERIFIED active** as of this session's fix — the newest working piece of the entire marketplace chain by a wide margin.

---

## Outstanding Gaps (consolidated, marketplace-specific)

1. Concierge Quote frontend — confirmed never built, independently corroborated by two separate sources (this session's own trace and `docs/production-readiness-roadmap-2026-07-27.md`).
2. Real GST/Udyam verification — never built to the documented spec, self-disclosed internally.
3. Regulated Nodal-Account Protected Payment — never built; current escrow is a functional but non-compliant-with-spec simulation.
4. Withdraw — never built, explicit "Coming Soon."
5. Trust Score — three disagreeing implementations, none matching the documented formula.
6. Blockchain escrow — two generations attempted (Polygon plan, Sepolia deploy script), neither confirmed deployed, both dormant.

## Cross-References

- Escrow's dormant blockchain generations and the wallet-simulation's real-vs-planned architecture gap were first identified in Pass 2B's Escrow section; this pass adds the Sepolia-vs-Polygon contradiction and the n8n notification workflow as new evidence.
- Trust Score's three-way inconsistency was first identified in Pass 2B; unchanged and reconfirmed here with no new evidence either way.
- Verification's GST/Udyam gap was first identified in this session's supplier-acquisition audit (prior to Pass 2A/2B existing) and confirmed again independently via `VYAPARSETHU_MASTER_PLAN.md` Ch.7.1 in Pass 2A.

## Confidence Assessment

Highest confidence (directly live-traced this session): RFQ, Quote, Deal, Wallet balance/ledger, current Escrow mechanism, Ratings rewrite, Claim flow.
Medium confidence (document-based, cross-referenced against code): Verification's stated original spec, Trust Score's stated original formula, Escrow's blockchain generations' historical intent.
Low confidence / explicitly unresolved: whether any blockchain escrow contract was ever actually deployed to a live network (Sepolia or Polygon); whether the n8n escrow-release workflow was ever activated; what `analytics.bell24h.com` was.

Stopping here per the brief. No implementation, no code changes, no commits.
