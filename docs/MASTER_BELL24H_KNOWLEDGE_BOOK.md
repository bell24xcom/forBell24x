# THE BELL24H → VYAPARSETHU KNOWLEDGE BOOK
### The Permanent Reference Manual for the Ecosystem

**Compiled:** 2026-08-03. Expanded from the first version of this document (Pass 3, same date) to merge all ten prior recovery documents into one coherent, non-repeating narrative, per your instruction not to rewrite from scratch. No new scanning was performed — this is pure synthesis of `MASTER_INDEX`, `MASTER_CLASSIFICATION`, `MASTER_HISTORICAL_AUDIT_2026-08-02`, `OLD_REPO_HISTORICAL_RECONSTRUCTION_2026-08-03`, `MASTER_ARCHITECTURE_RECOVERY`, `MASTER_IMPLEMENTATION_RECOVERY`, `MASTER_AI_AUTOMATION_RECOVERY`, `MASTER_MARKETPLACE_RECOVERY`, `MASTER_INFRASTRUCTURE_RECOVERY`, and `MASTER_BUSINESS_RECOVERY`.

Tags used throughout: **VERIFIED / INFERRED / UNKNOWN / NOT FOUND / LEGACY / ACTIVE / ABANDONED / PARTIAL**. Where a section's content was already established in a specific prior document, this book cross-references it by name rather than re-explaining it, to avoid unnecessary repetition.

---

## 1. Executive Summary

Bell24h began April/May 2025 as an AI-powered B2B RFQ marketplace explicitly built to out-feature IndiaMART. Two genuinely separate codebases carried that name at different points — the main `digitex-erp/bell24h` lineage and a disconnected Vite/Gemini lead-generation-agent side project — before the current repository began fresh on 2026-02-16, three days after the old repo's last commit. The current repo replaced its first backend (InsForge, itself Supabase-based) with Prisma+Neon within 24–48 hours, went live at `www.bell24h.com` on 2026-02-25, and rebranded to **VyaparSethu** on 2026-05-30 as a deliberate philosophical pivot — from "AI marketplace racing a competitor on feature count" to "Business Operating Platform, memory first, marketplace third." A working core marketplace (RFQ → Quote → Deal → wallet-based escrow → Ratings) is live in production today, with one significant, real bug found and fixed this session (a role-gate blocking real users from accepting quotes) alongside several other live fixes (SEO, footer links, a broken deep-link claim flow). Large portions of the aspirational "Bell24h-OS" vision (AI Provider Manager, Prompt Studio, GraphRAG, Qdrant, dedicated Image/Video/Voice Studios) were never built as named systems — what exists instead is narrower, real, and working (Knowledge Graph, Video RFQ, Voice RFQ, SHAP/LIME). Blockchain-based escrow was seriously attempted (391 commits on one branch, a real if incomplete deployment script) and then explicitly deprioritized in the platform's own vision document. The business is, as of this recovery, still executing the original Phase 1 supplier-acquisition motion (founder-led WhatsApp/phone outreach) more than a month past its own June 29, 2026 target — a fact recorded plainly, not as criticism.

## 2. Complete Timeline (2025 → Present)

| Date | Milestone |
|---|---|
| 2025-04-10/11 | Old `digitex-erp/bell24h` repo scaffolded |
| 2025-05-04 | Old repo's real "Initial commit" + same-day feature burst (auth, RFQ+AI, analytics, multilingual voice RFQ, org/team/ACLs) |
| 2025-06 | Earliest standalone HTML mockups saved locally |
| 2025-07-27 | Old repo's "Bell24h v1.0" milestone |
| 2025-08/09 | Candid local transcripts documenting real build struggles ("zero working deployment, zero tested features") |
| 2025-09 | Heaviest month in either repo's history (311 commits) |
| 2025-10-19 | Blockchain branch's final commit — "₹156 crore/369-day" projection |
| 2025-10-23 | SHAP/LIME branch's final commit (403 commits total) |
| 2025-11 | Recurring n8n 502-error fixes (old repo, Oracle VM) |
| 2025-11-22 | True root commit of the disconnected `temp/bell24h-update` Vite/Gemini lineage (a different product, same founder) |
| 2026-02-13 | Old repo's final commits (RevenueCat integration) — then goes silent |
| **2026-02-16** | **Current repo's Initial commit** |
| 2026-02-17/18 | InsForge (Supabase-based) added, then replaced by Prisma+Neon within ~24–48 hours |
| **2026-02-25** | **`www.bell24h.com` live in production** |
| 2026-03-21 | Feature Flags system introduced |
| 2026-03-27 → 2026-05-25 | Version tags v1.0 → v2.8-stable |
| **2026-05-30** | **VyaparSethu brand locked** |
| 2026-06-02 → 06-09 | Visual rebrand executed in code |
| 2026-06-27 | GitHub Actions confirmed as current scheduler (`docs/AUTOMATION_ARCHITECTURE.md`) |
| 2026-06-29 | Original "30 verified suppliers" sprint deadline |
| 2026-07-18 | Feature flags extended to gate Product/Industry Intelligence |
| 2026-07-27 | Most rigorous planning document in the whole recovery (`production-readiness-roadmap`) |
| 2026-08-01/02 | This session's live fixes: quote-acceptance role-gate, lat/lng, footer FAQ (twice), Ratings rewrite, deep-link claim fix |
| 2026-08-03 | This Knowledge Recovery project |

## 3. Brand Evolution (Bell24h → Bell24x → VyaparSethu)

**Bell24h**: original name, both in the old repo and the current repo's first four months. Purpose: "India's first Voice + Video + Text B2B RFQ marketplace," positioned explicitly against IndiaMART/TradeIndia/Moglix (`LAUNCH_PLAN.md`). Still present today as the legacy domain (`bell24h.com`, primary per CLAUDE.md until 50+ verified suppliers) and a "Formerly Bell24h" footer note. **ACTIVE as legacy brand, VERIFIED.**

**Bell24x**: **NOT FOUND** as a distinct brand phase with its own vision — exists only as the GitHub org name (`bell24xcom`) and two sibling-folder names. **INFERRED** to be purely an identity/naming artifact, not a real pivot.

**VyaparSethu**: locked 2026-05-30. Name meaning: Vyapar (commerce) + Sethu (bridge). Mission: "Wipe Out Bad Debt." Tagline: "Commerce Connections Globally." Three pillars: Verified Matching, Protected Payment, Faster Trade. Executed as a visual-only rebrand within 8 days of being locked (per its own sprint plan's explicit rule: "do not rebuild the product, do not pause supplier acquisition"). **ACTIVE, VERIFIED**, the current governing brand.

**Positioning shift, stated in the platform's own words** (`VYAPARSETHU_VISION.md`): *AI Marketplace → Business Operating Platform*; *Supplier Risk → Trade Confidence Score*; blockchain and stock-market-API framing explicitly listed as "removed/deprioritized."

## 4. Business Evolution

Fully detailed in `MASTER_BUSINESS_RECOVERY.md`; consolidated here. Three distinct go-to-market philosophies were tried in sequence: (1) IndiaMART feature-racing with blockchain-gated pricing tiers and a ₹156 crore/369-day revenue projection; (2) a viral, social-proof-driven launch plan (`LAUNCH_PLAN.md`) with a fabricated-sounding live stat ticker and an unverified "10,000+ suppliers" homepage claim; (3) the current VyaparSethu approach — an unlock-driven 4-level Trade Confidence membership ladder, and CLAUDE.md's explicit rule to **never show fake or zero metrics**, directly reversing philosophy #2. What's actually being executed today, per this session's own observed context, is philosophy #4 in practice: founder-led, one-by-one phone/WhatsApp outreach to real associations (COSIA, TSSIA) and cold lists — the least "viral," most manual of all four approaches, and the only one with no corresponding grand vision document, just direct action.

**"BELL"/"Business Export Leads Link"**: searched exhaustively across two separate passes — **NOT FOUND** anywhere in any repository, document, or file.

## 5. Technical Architecture Evolution

The frozen architectural core — every user is buyer + supplier by default, single unified dashboard, no role-based API gating — was written down in `ARCHITECTURE.md` in March 2026, predating the VyaparSethu rebrand by two months, and carried through unchanged. It was, however, violated in practice by a later-built route (the quote-acceptance role-gate, found and fixed this session) — evidence that a documented rule and consistent enforcement across every subsequently-built route are two different things. "Bell24h-OS," per CLAUDE.md, names a much larger module set than what was actually built (see §13, Module Inventory) — the one real, coherent architectural achievement underneath that name is the Business Operating Memory (BOM) layer and its `BusinessLifeEvent` event stream, confirmed firing from real product actions this session.

## 6. Infrastructure Evolution

Full detail in `MASTER_INFRASTRUCTURE_RECOVERY.md`. Headline chain: Cloudflare Pages (real, extensive, abandoned) → a fully-planned-but-never-executed Netlify migration → Railway (named once, unconfirmed) → Oracle Cloud VM (real, for n8n and early SHAP/LIME hosting) → **current: Vercel (main app) + Render.com (SHAP/LIME)**. A cluster of Dockerfile variants (`.fixed`, `.final`, `.oracle-fixed`) sitting at the repo root reads as real historical deployment struggle, consistent with the pile of crash-and-fix documents catalogued in Pass 0/1.

## 7. Marketplace Evolution

Full detail in `MASTER_MARKETPLACE_RECOVERY.md`. The richest-evidenced area of the whole recovery because this session directly live-traced almost all of it. Headline: RFQ→Quote→Deal chain is real and working; Escrow evolved through five generations (Polygon blockchain plan → a deployment script that actually targets Sepolia instead → an n8n notification workflow → a REST API stub → the current, actually-working wallet-ledger simulation) with two of those generations directly contradicting each other on target network; Trust Score has three separate, disagreeing implementations; GST/Udyam verification is a self-disclosed gap; Concierge Quote has a built backend and no frontend, confirmed by two independent sources.

## 8. AI & Automation Evolution

Full detail in `MASTER_AI_AUTOMATION_RECOVERY.md`. Two genuine surprises: "Prompt Studio" is actually `CL4R1T4S/`, a vendored public collection of ~24 other AI products' leaked/published system prompts, used as reference material for Claude Code's own behavior on this project — not a customer-facing feature. "Multi-Agent Architecture" belongs to a completely separate side project (`Web-Agency`, a six-agent automated web-design-agency concept), sharing the founder and the CL4R1T4S tooling but nothing else with Bell24h/VyaparSethu. SHAP/LIME is the one clean "planned → built → shipped, same code" story: built on a 403-commit branch, originally targeted at Oracle Cloud VM, now live on Render.com, feature-flagged off pending a supplier-count gate. GraphRAG, Qdrant, AI Provider Manager, Image Studio, Video Studio: all **NOT FOUND**.

## 9. DevOps & Deployment Evolution

n8n on a self-managed Oracle Cloud VM (real, recurring 502 errors) → Vercel Cron considered and explicitly rejected (2-job Hobby-tier limit, per `docs/AUTOMATION_ARCHITECTURE.md`) → **current: GitHub Actions**, with 9 named scheduled jobs (`expire-rfqs`, `supplier-drip`, `follow-up-due`, `demand-loop`, `analyze-behavior`, `update-insights`, `churn-check`, `weekly-digest`, `morning-brief-refresh`) and a deliberately scheduler-agnostic business-logic layer built to ease a planned future migration to Trigger.dev (post-50-suppliers). This corrected an error this session's own earlier historical audit had made (claiming Vercel Cron was current).

## 10. Database Evolution

InsForge (the very first backend, 2026-02-17) is now confirmed, via direct code inspection, to have been built on **Supabase** (`@supabase/supabase-js`) — resolving CLAUDE.md's otherwise-unexplained instruction to ignore Supabase references in legacy docs. Replaced by Prisma+Neon within 24–48 hours. The Neon project itself changed at least once (an earlier `us-east-1` project documented in a migration guide vs. the current `ap-southeast-1` project, confirmed via live `.env` inspection) — reason unstated, consistent with an India-latency optimization. Schema grew from 7 models (old repo, end of life) to 38 (current, 12 applied migrations, the latest — `0010_reviews` — added this session).

## 11. API & Route Inventory

Current repository, directly counted this session: **201 API routes** (`route.ts` files), **225 page routes** (`page.tsx` files), **63 admin page routes** specifically. A large fraction of these were individually classified in this session's own separate audits (admin panel Part 1–4, SEO repository check, internal-linking audit, supplier-acquisition readiness) rather than re-walked in this recovery project — see those audit reports for route-by-route detail; this Knowledge Book sits above that layer, not duplicating it.

## 12. Feature Inventory (consolidated)

| Feature | Status |
|---|---|
| RFQ creation/submission | ACTIVE, VERIFIED |
| Quote submission/acceptance | ACTIVE, VERIFIED (role-gate bug fixed this session) |
| Deal lifecycle | ACTIVE, VERIFIED |
| Concierge Quote | PARTIAL — backend only |
| Escrow (wallet simulation) | ACTIVE, VERIFIED |
| Escrow (blockchain) | ABANDONED |
| Wallet/Ledger | ACTIVE, VERIFIED |
| Withdraw | NOT FOUND (never built) |
| Trust Score | PARTIAL — 3 disagreeing implementations |
| GST/Udyam Verification | PARTIAL — self-disclosed gap |
| Supplier Claim | ACTIVE, VERIFIED (deep-link bug fixed this session) |
| Ratings/Reviews | ACTIVE, VERIFIED (rewritten this session) |
| Knowledge Graph | ACTIVE — existence confirmed, depth unaudited |
| CRM | ACTIVE — existence confirmed, depth unaudited |
| SHAP/LIME | ACTIVE, flagged off |
| Voice RFQ | ACTIVE, VERIFIED |
| Video RFQ | ACTIVE, VERIFIED |
| WhatsApp outreach | ACTIVE, VERIFIED (deep-link bug fixed this session) |
| SEO (canonical, JSON-LD, sitemap) | ACTIVE, several bugs fixed this session |
| Feature Flags | ACTIVE, VERIFIED — also genuinely duplicated with Control Panel |

## 13. Module Inventory (Bell24h-OS claimed vs. real)

| CLAUDE.md-claimed module | Reality |
|---|---|
| AI Provider Manager | NOT FOUND |
| Prompt Studio | NOT FOUND as a feature — CL4R1T4S reference library exists instead |
| Image Studio | NOT FOUND |
| Video Studio | NOT FOUND — narrow Video RFQ exists instead |
| Voice Studio | NOT FOUND — narrow Voice RFQ (Groq Whisper) exists instead |
| Automation Studio | Real, but is "Automation & Jobs" admin page over GitHub Actions jobs, not a studio |
| SEO Studio | Real — "SEO Cockpit," mostly static-data admin pages, 3 with live APIs |
| Agent System | NOT FOUND as an AI agent system in this product (Multi-Agent belongs to a different project) |
| Memory Graph / Provider Abstraction | The real BOM/BusinessLifeEvent layer — genuinely built, just narrower-named in reality |
| Knowledge Engine | Real — Knowledge Graph |
| Marketplace Engine | Real — the RFQ/Quote/Deal chain |
| CRM | Real, existence confirmed |
| Campaign Center | Corresponds to real WhatsApp outreach automation, not a dedicated "center" UI |
| Workflow Engine | The scheduler abstraction (`SchedulerProvider` interface) |

## 14. Automation Inventory

**GitHub Actions (current, active):** `daily-cron.yml` (expire-rfqs, supplier-drip, follow-up-due, demand-loop, analyze-behavior, update-insights, morning-brief-refresh), `weekly-cron.yml` (weekly-digest, churn-check), `manual-job.yml` (ad-hoc dispatch).
**n8n (legacy, dormant):** Oracle Cloud VM setup (docker-compose, setup scripts) still physically present in `backend/`; two real workflow JSONs found — supplier-onboarding welcome email/SMS, and an escrow-release notification workflow (webhook → email seller → log to `analytics.bell24h.com`, an endpoint of unconfirmed current existence).
**WhatsApp outreach (current, active):** `outreach/bulk-wa`, `outreach/daily-batch` — real, working, one bug found and fixed this session.

## 15. Cloud Services Inventory

| Service | Status |
|---|---|
| Vercel | ACTIVE — main application host |
| Render.com | ACTIVE — SHAP/LIME Python service |
| Neon | ACTIVE — database (project/region changed at least once historically) |
| Cloudflare Pages | LEGACY/ABANDONED |
| Cloudflare Workers | NOT FOUND — never used, confirmed twice |
| Netlify | LEGACY — planned migration never executed |
| Railway | UNKNOWN — named once, never confirmed |
| Oracle Cloud VM | LEGACY — n8n + early SHAP/LIME hosting |
| Supabase (standalone) | NOT FOUND as a direct platform choice — only as InsForge's underlying foundation |

## 16. AI Provider Inventory

| Provider | Purpose | Status |
|---|---|---|
| Groq (Whisper v3) | Voice RFQ transcription | ACTIVE, VERIFIED |
| Anthropic (Claude) | This entire recovery session; CL4R1T4S reference material | ACTIVE, self-evidently |
| NVIDIA | Day-1 old-repo integration, "74% cost savings" | INFERRED historical, current use unconfirmed |
| Gemini | Disconnected lead-gen lineage; Aider CLI's own model | NOT part of current product |
| OpenAI | Claimed across older completion tables | UNKNOWN current status |
| Perplexity | A docker-compose service found this pass | UNKNOWN purpose, VERIFIED to exist as a config artifact |

## 17. Historical Migrations (every one recovered)

InsForge/Supabase → Prisma/Neon (24–48 hrs); `ScrapedCompany`/`CompanyClaim` two-table design → unified `User`-model claim fields; n8n/Oracle VM → GitHub Actions; Cloudflare Pages → (attempted Netlify, never completed) → Vercel; an earlier Neon project/region → the current one; Polygon blockchain plan → a Sepolia-targeting deployment script (never fully executed either way); the original `/api/auth/send-otp`/`verify-otp` → `/api/auth/otp/send`/`verify` (old routes survive as a `/demo-login`-only fossil); InsForge-based, structurally-broken Ratings → Prisma-based `Review` model (this session).

## 18. Legacy Systems

InsForge (Supabase-based), the original MSG91 OTP routes, n8n + its Oracle VM infrastructure, Cloudflare Pages, Netlify migration tooling, the `ScrapedCompany`/`CompanyClaim` schema design, three dormant blockchain contract files (`BellEscrow.sol`, `BellToken.sol`, `Escrow.sol`) plus a fourth archived variant (`TradeEscrow.sol`), RevenueCat integration (built at the very end of the old repo, no current-repo trace), a credit-purchase monetization component (`CreditPurchase.tsx`), the dead `CategoryGrid.tsx` homepage component.

## 19. Production-Ready Systems

RFQ creation/submission, Quote submission/acceptance, Deal lifecycle, Wallet balance/add-funds/ledger, the current (wallet-simulation) Escrow mechanism, Supplier Claim (both paths), Ratings/Reviews (source-traced, live execution not yet independently re-verified), Voice RFQ, Video RFQ, WhatsApp outreach, GitHub Actions automation, core SEO mechanics (canonical, JSON-LD, sitemap), Feature Flags.

## 20. Partially Implemented Systems

Concierge Quote (backend only), Trust Score (real but internally inconsistent), GST/Udyam Verification (format-check only, self-disclosed gap), CRM and Knowledge Graph (existence confirmed, functional depth not audited), SEO indexing (479 URLs still unindexed per the most recent roadmap document).

## 21. Abandoned Systems

Blockchain escrow (Polygon plan, Sepolia deploy script, neither confirmed deployed), BELL token economics, multi-org/team/ACL system (present Day 1 of the old repo, absent from current dual-role architecture), RevenueCat, credit-purchase monetization, the viral/fake-metrics launch strategy, ECG Marketing as originally scoped, n8n as a live scheduler, Netlify/Railway/Cloudflare as hosting targets, Withdraw (never built, not merely deprecated).

## 22. Current Production Architecture

Next.js 14 App Router on Vercel, Neon PostgreSQL via Prisma (38 models), JWT/cookie session auth fronted by MSG91 OTP, Razorpay for wallet deposits, a Prisma-native wallet ledger standing in for regulated escrow, GitHub Actions driving 9 scheduled jobs against `CRON_SECRET`-protected API routes, a Python FastAPI SHAP/LIME service on Render.com (flagged off), WhatsApp-based outreach automation, and a Business Operating Memory event-sourcing layer (`BusinessLifeEvent`) underlying Company DNA, Morning Brief, and Business Genome Score features.

## 23. Current Technology Stack

Next.js 14, TypeScript, Prisma 6.16.2, Neon PostgreSQL, Tailwind CSS, Groq (Whisper v3), Vercel, Render.com, GitHub Actions, Razorpay, MSG91, Zod (validation, confirmed in this session's route audits).

## 24. Current Integrations

MSG91 (OTP/SMS), Razorpay (deposits), WhatsApp Business (outreach), Groq (voice transcription), Render-hosted SHAP/LIME (flagged off). Email provider identity (Resend vs. Brevo) remains **UNKNOWN** despite two separate attempts to confirm it across this recovery.

## 25. Current Project Status by Subsystem

| Subsystem | Status | Confidence | Production Ready? | Remaining Work |
|---|---|---|---|---|
| RFQ creation | ACTIVE | VERIFIED | Yes | — |
| Quote submission | ACTIVE | VERIFIED | Yes | — |
| Quote acceptance | ACTIVE (fixed this session) | VERIFIED | Yes | Monitor for regressions |
| Deal lifecycle | ACTIVE | VERIFIED | Yes | — |
| Concierge Quote | PARTIAL | VERIFIED | No | Frontend UI never built |
| Escrow (real) | ACTIVE | VERIFIED | Functionally yes; compliance unclear | Regulated Nodal Account, if required |
| Escrow (blockchain) | ABANDONED | VERIFIED | No | Explicitly deprioritized |
| Wallet / Ledger | ACTIVE | VERIFIED | Yes | Consolidate two parallel UIs |
| Withdraw | NOT BUILT | VERIFIED | No | Entire feature |
| Trust Score | PARTIAL | VERIFIED | Questionable | Reconcile 3 implementations |
| GST/Udyam Verification | PARTIAL | VERIFIED | No (Phase 1 by design) | Real API integration |
| Supplier Claim | ACTIVE (fixed this session) | VERIFIED | Yes | — |
| Ratings/Reviews | ACTIVE (rewritten this session) | VERIFIED | Yes | Live-execution re-verification pending |
| Knowledge Graph | ACTIVE (existence only) | VERIFIED | Unknown depth | Deeper audit |
| CRM | ACTIVE (existence only) | PARTIAL | Unknown | Deeper audit |
| SHAP/LIME | ACTIVE, flagged off | VERIFIED | Yes when flag flips | Supplier-count gate |
| AI Provider abstraction | NOT FOUND | VERIFIED | N/A | Build if desired |
| Automation (GitHub Actions) | ACTIVE | VERIFIED | Yes | — |
| n8n | ABANDONED | VERIFIED | N/A | Candidate for deletion |
| SEO | PARTIAL | VERIFIED | Partially | 479 URLs unindexed |
| Infrastructure (Vercel+Render) | ACTIVE | VERIFIED | Yes | — |
| Blockchain/Polygon | ABANDONED | VERIFIED | N/A | Decide whether to delete dormant files |
| Supplier Acquisition (business) | ACTIVE, behind schedule | VERIFIED | N/A | Ongoing |

## 26. Known Contradictions (with authoritative source)

| # | Document A | Document B / Current Code | Authoritative Today |
|---|---|---|---|
| 1 | Blockchain plan: Polygon mainnet | Deploy script: Sepolia testnet | Neither — production uses the wallet simulation |
| 2 | This session's earlier audit: "n8n replaced by Vercel Cron" | `docs/AUTOMATION_ARCHITECTURE.md`: GitHub Actions is current | The document — the earlier audit statement was wrong |
| 3 | Completion table: Escrow 90%, Withdrawal 85%, RazorpayX-backed | Current code: wallet simulation, Withdraw disabled | Current code |
| 4 | `LAUNCH_PLAN.md`: live ticker + "10,000+ suppliers" | CLAUDE.md: never show fake/zero metrics | CLAUDE.md |
| 5 | Blockchain pricing vs. Trade Confidence ladder vs. `UserPlan` enum | — | Current code, for what's live; neither vision fully implemented |
| 6 | Oct-2025-dated completion doc: high percentages across the board | This session's direct audits: multiple real bugs in those exact areas | Current code |
| 7 | CLAUDE.md's Bell24h-OS module list | This recovery's repeated confirmation most modules don't exist | Current code |

## 27. Lessons Learned

Three patterns recur across this entire recovery, worth stating once, plainly, rather than leaving scattered:
1. **A working implementation and the live UI calling it are not the same claim.** At least four separate instances this session found a well-built, even superior implementation sitting completely unused because the actual UI called a different, broken, or dead-code twin instead (CategoryGrid, the two claim mechanisms, the two accept-quote routes, InsForge-era vs. current OTP routes).
2. **Percentage-based "feature completion" documents from the Bell24h/blockchain era have a 100% contradiction rate against direct code evidence in this recovery.** Every single one checked was wrong about at least one significant claim. Treat any newly-discovered document of this genre with the same skepticism by default.
3. **Ambition and delivery decouple in a specific, recognizable way**: the most technically adventurous plans (blockchain, GraphRAG, a unified AI Provider Manager, multi-language voice AI) attracted the most planning documents and the least shipped code; the least glamorous work (OTP auth, the deal lifecycle, WhatsApp outreach) is exactly what's live and working today.

## 28. Remaining Production Roadmap

Per the single most rigorous document found in this recovery (`docs/production-readiness-roadmap-2026-07-27.md`), the stated sequence is: complete production smoke test → fix discovered issues → freeze a stable build → resolve SEO indexing (479 URLs) → Media Permission Engine → Camera RFQ → SHAP/LIME (flip the flag) → patent/FTO review → commercial launch. This recovery adds, from its own findings, three items worth folding into that sequence at the founders' discretion: (a) decide the Trust Score's canonical implementation, (b) decide whether Concierge Quote's frontend gets built or the feature gets formally sunset, (c) decide whether the dormant blockchain files should be deleted or kept as optionality.

## 29. Appendix — Repositories, Branches, Tags, Major Documents

**Repositories:** current (`bell24xcom/forBell24x`), old (`digitex-erp/bell24h`), 9 local sibling folders (`bell24h-clean/-deploy/-final/-live/-main/-migration-package/-working`, `bell24x-clean/-complete`), `Web-Agency` (separate project), `temp/bell24h-update` (disconnected in-repo lineage).
**Branches:** current repo — `main`, `digitex-erp-bell24h`, `domain/site-url-refactor`, `temp/bell24h-update`, plus 2 remote-only Claude-session branches. Old repo — `main` + 23 others, most notably `feature/blockchain-integration` (391 commits) and `feature/shap-lime-integration` (403 commits).
**Tags:** current repo — v1.0-stable through v2.8-stable (12 total, dated 2026-03-27 to 2026-05-25). Old repo — none.
**Major documents:** `ARCHITECTURE.md`, `CLAUDE.md`, `docs/VYAPARSETHU_VISION.md`, `docs/VYAPARSETHU_MASTER_PLAN.md`, `docs/AUTOMATION_ARCHITECTURE.md`, `docs/production-readiness-roadmap-2026-07-27.md`, `LAUNCH_PLAN.md`, `BELL24H_BLOCKCHAIN_IMPLEMENTATION_PLAN.md`, `docs/NEXT_30_DAYS_SPRINT.md`, and the ten recovery documents this book synthesizes.

---

## Confidence Assessment (whole-project)

Highest confidence: everything this session directly live-traced against running code and live production. Next tier: dated, internally consistent documents cross-referenced against that code. Lowest confidence: the older, percentage-heavy completion-table documents from the Bell24h/blockchain era — every one contradicted by direct evidence at least once (see §27, Lesson 2).

No commits, no pushes. Stopping here per the brief.
