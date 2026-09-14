# MASTER IMPLEMENTATION RECOVERY — Pass 2B

**Compiled:** 2026-08-03. Question this document answers: *what has actually been built, backed by code, across the entire Bell24h → VyaparSethu journey* — as distinct from Pass 2A, which covered what was planned or envisioned.

**Method:** synthesizes three tiers of evidence, kept explicitly distinct rather than blended:
1. **This session's own direct, live-traced code audits** (today and yesterday) — the highest-confidence tier, since these came from reading the actual current source and, in several cases, verifying against the live production deployment.
2. **Pass 2A's document findings** — historical planning/completion docs, several already flagged as over-optimistic relative to code.
3. **New targeted existence checks run for this pass** — quick greps against current code for modules not yet directly audited (CRM, Notifications, GraphRAG/Qdrant, Video/Image studios, AI Provider abstraction, Prompt systems).

Tagging: **VERIFIED** / **INFERRED** / **UNKNOWN**, per your instruction. Where a historical document and current code disagree, both are stated — never silently resolved.

---

## Module-by-module recovery

### Marketplace / RFQ / Quote / Deal
**VERIFIED (this session, live-traced today):** Full chain confirmed working end-to-end: RFQ creation (`POST /api/rfq/create`) → Quote submission (`POST /api/supplier/quotes`) → Quote acceptance (`POST /api/deal/select` — had a live-blocking role-gate bug, fixed this session, commit `d68da2a`) → Deal record creation → Deal lifecycle (`ACTIVE → ESCROW_LOCKED → SHIPPING → DELIVERED → COMPLETED`, all in `src/app/api/dashboard/deals/route.ts`). Database: `RFQ`, `Quote`, `Deal` Prisma models, all with real fields, all confirmed via direct schema reading and live code tracing.
**First implementation:** Bell24h era, Day 1 of the old repo (2025-05-04 commit: "Enhance user authentication and streamline RFQ processing with AI").
**Historical claim vs. current reality:** `BELL24H_FEATURES_COMPLETION_TABLE.md` (undated, old-repo era) claims "RFQ Matching — AI-Powered Matching — 85% Complete." Current code confirms real AI extraction exists in the Voice RFQ pipeline (Groq Whisper) but the claimed "85%" figure cannot be independently confirmed or denied from this pass's evidence — **UNKNOWN** whether that specific matching-quality claim was ever true.
**Status:** Active, current, confirmed working live in production as of this session.

### Supplier / Buyer
**VERIFIED:** Dual-role model (every user is buyer + supplier by default) is a frozen architectural rule, sourced directly to `ARCHITECTURE.md` (locked March 2026) and carried unchanged through the VyaparSethu rebrand into current CLAUDE.md. Supplier claim flow (`/claim/[token]`, `claimToken`/`isClaimed`/`claimedAt` on the unified `User` model) confirmed working live this session; one deep-link variant was broken and fixed this session (commit `b732e92`).
**Historical design, superseded:** an earlier, structurally different design existed — a separate `ScrapedCompany` model with a `claimStatus` enum and a distinct `CompanyClaim` request table (`SUPPLIER_PROFILE_IMPLEMENTATION_PLAN.md`, old-repo era). This was **not** carried forward; the current schema puts claim fields directly on `User`. No document explains the redesign rationale — **UNKNOWN** why.
**Status:** Active, current.

### Escrow / Wallet / Ledger / Protected Payment
**VERIFIED (this session, live-traced):** A dedicated `/api/escrow` route exists and is an explicit stub (`"Escrow service coming soon"`, no `EscrowTransaction` model in schema). The **actual, working** escrow mechanism is a wallet-ledger simulation inside `src/app/api/dashboard/deals/route.ts` — real `WalletTransaction` rows of type `ESCROW_LOCK`/`ESCROW_RELEASE`, a real, transactionally sound implementation, just not the dedicated "Escrow" system its own name implies. Wallet balance/add-funds/ledger all confirmed working live (two parallel UI implementations found: `/wallet` and `/dashboard/wallet`). Withdraw confirmed as an explicit disabled "Coming Soon" button.
**Document vs. code disagreement:** `BELL24H_FEATURES_COMPLETION_TABLE.md` claims "Escrow Services — Payment Holding — 90% Complete... RazorpayX + Neon" and "Withdrawal System — 85% Complete." Current code shows no RazorpayX-based fund-holding integration wired into the deal lifecycle at all (`src/app/api/wallet/razorpay/route.ts` exists but has zero callers, confirmed this session), and Withdraw is explicitly disabled. **Confidence: current code is VERIFIED; the 90%/85% figures are not corroborated by anything found and are contradicted by direct trace.**
**Planned-but-never-built target architecture:** `VYAPARSETHU_MASTER_PLAN.md` Ch.7.3 (read in full earlier this session) specifies Protected Payment must run through Razorpay + RazorpayX + a regulated Nodal Current Account, explicitly stating "VyaparSethu does NOT hold customer funds directly." This is the stated compliance target; the live wallet-simulation approach does not meet it. **VERIFIED gap, not yet closed.**
**Status:** Active (wallet simulation) / Not built (real regulated escrow, dedicated Escrow API).

### Ratings / Trust Score
**VERIFIED (this session — this session also built the fix):** The legacy ratings system called InsForge's REST API, had no matching Prisma model, and used a lowercase/uppercase status mismatch that made it permanently unable to succeed. Rewritten to Prisma this session (`Review` model, migration `0010_reviews`, commit `39394f4`).
**Trust Score — three independent, disagreeing implementations found, all real code:**
1. `User.trustScore` DB field — increment/clamp pattern, updated by onboarding, claim, and now reviews.
2. A separate ad-hoc formula inside `api/supplier/[id]/route.ts` and `api/supplier/stats/route.ts` that never reads field #1 at all.
3. The admin diagnostics' unrelated aggregate "Business Memory" readiness score.
None of these implement the documented CLAUDE.md formula (30% payment history / 20% delivery / 15% response speed / 15% repeat orders / 10% dispute rate / 10% verification). **VERIFIED**, this is a real, current inconsistency, not a historical artifact.

### Verification (GST / Udyam)
**VERIFIED:** `docs/VYAPARSETHU_MASTER_PLAN.md` Ch.7.1 specifies auto-fetch verification against public GST and Udyam government APIs, even at the most basic membership tier. Current code (`src/app/api/supplier/gst/route.ts`) does format-length checking only and doesn't persist to the database; `src/app/api/supplier/onboarding/route.ts` trusts a client-supplied `gstVerified` boolean with no server-side check at all. Udyam has zero validation of any kind anywhere in the codebase. This gap has existed since at least this session's own supplier-acquisition audit and is consistent with CLAUDE.md's own "self-reported... Phase 1" framing (`src/app/admin/control-panel/page.tsx`'s own warning box) — meaning it's a **known, disclosed** gap within the product itself, not something hidden.

### Authentication / Authorization
**VERIFIED:** OTP-based auth is the real, live production path (`/auth/phone-email` → `/api/auth/otp/send` → `/api/auth/otp/verify`/`widget-verify`). A parallel, older pair (`/api/auth/send-otp`/`verify-otp`) still exists but is used only by the `/demo-login` test page — confirmed this pass to be a fossil of the original **InsForge-era** OTP implementation (`MSG91_VIDEO_IMPLEMENTATION_COMPLETE.md`, old repo: "Creates or fetches user from InsForge database"), superseded when InsForge was dropped within its first 24–48 hours of existence but never deleted. `/api/auth/register` and `/register`/`/auth/register` pages exist and are reachable, but this session did not trace whether they're linked from any live navigation — **UNKNOWN** whether they're a real alternate signup path or another dead-code twin.
**Authorization:** the dual-role/no-role-gating rule (`ARCHITECTURE.md`) was directly violated by the quote-acceptance bug fixed this session (`hasRole(user, ['BUYER','ADMIN'])` gate blocking real users whose DB role defaults to `SUPPLIER`) — a live, real-world instance of an old architectural rule being broken in newer code, now fixed.

### Admin
**VERIFIED (this session's extensive live audit):** 63 admin page routes exist. A representative, not exhaustive, sample was individually verified: KPI (real bug found — raw SQL column-name mismatch, unrelated to this pass but same root-cause class as the Revenue page's identical bug), Revenue (same bug class, both traced to the same root cause), Feature Flags vs. Control Panel (confirmed genuine duplication — both read/write the same `feature_flags` table via separate routes), SEO Cockpit (14 tabs, mostly static-data pages, 3 with real backing APIs), Automation & Jobs vs. n8n/Automation Status pages (confirmed genuinely distinct, not a duplicate — though the "n8n" page name is itself a fossil, see Automation below).

### CRM
**VERIFIED (new check, this pass):** Real routes exist — `src/app/admin/crm`, `src/app/api/admin/crm`, `src/app/crm`. Not deep-audited this pass or any prior pass this session; existence confirmed, functional correctness **UNKNOWN**.

### Marketing / SEO
**VERIFIED (extensive session audit, done in an earlier turn):** Category-page internal linking, canonical tags, JSON-LD schema, sitemap inclusion, og:image inheritance were all individually audited and several real bugs fixed (category linking, og:image, footer FAQ link on the wrong file initially). SEO Cockpit confirmed mostly static-data-driven. `docs/production-readiness-roadmap-2026-07-27.md` independently notes 479 URLs "Discovered — currently not indexed" as a still-open item, queued at priority #4.

### Analytics
**NOT independently verified this session or this pass** beyond confirming `/admin/analytics`, `/admin/heatmap`, `/admin/revenue` exist as real routes (the latter two audited today with real bugs found and documented). **UNKNOWN** the state of any broader analytics layer beyond these specific pages.

### Notifications / Email / WhatsApp
**VERIFIED (new check, this pass):** A real `Notification` Prisma model is used by two live routes (`/api/notifications/route.ts`, `/api/admin/monitoring/route.ts`) — this is a genuine, if narrow, implementation, correcting an earlier assumption in this session's supplier-acquisition audit that no notification mechanism existed (that earlier finding was specifically about the quote-acceptance chain not writing a `Notification` row — both can be true: the model and route exist for some purposes, just not that one). WhatsApp outreach (`outreach/bulk-wa`, `outreach/daily-batch`) confirmed working this session, including a real bug in the deep-link claim variant, now fixed. Email: `src/lib/email.ts`'s `sendEmail` function is used throughout the codebase (confirmed in multiple routes traced this session — quote acceptance, quote submission); the specific underlying provider (Resend vs. Brevo vs. something else) was **not independently reconfirmed** this pass.

### Video / Image
**VERIFIED (new check, this pass):** No dedicated "Video Studio" or "Image Studio" admin systems found anywhere in current code — zero matches searching for either term as a route name. What exists: `/api/video-rfq` (the specific Video RFQ feature, matches CLAUDE.md's documented Voice/Video RFQ pipeline) and `/api/supplier/upload-image` (basic image upload, matches this session's product-listing audit). The "AI Content Generator," "Video Factory," "Social Publisher" concepts named in earlier task prompts this session are **NOT FOUND** as implementations anywhere searched.

### Prompt Studio / AI Provider Manager
**NOT FOUND.** No file matching "prompt" as a system/studio concept exists anywhere in `src/lib` or `src/app/api` (checked this pass). No unified AI provider abstraction exists either — the only "provider" abstractions found are the automation scheduler's provider interface (`src/lib/scheduler/providers`, unrelated to AI) and a mock payment provider. AI integrations (Groq, NVIDIA, Gemini at various points per Pass 2A's document reading) appear to exist as scattered, per-feature integrations rather than one central abstraction layer. **INFERRED** that "AI Provider Manager" is a CLAUDE.md-documented aspiration for "Bell24h-OS" that was never built as a distinct system.

### SHAP/LIME
**VERIFIED (confirmed live this session):** Real, working, deployed on Render.com (`vyaparsethu-ai.onrender.com`, confirmed 200 on `/health`), genuine `shap`/`lime` Python library usage in `ai-explainability-service/main.py`. Feature-flagged off in production (`NEXT_PUBLIC_SHAP_ENABLED` not set) pending a documented supplier-count gate. First built on the old repo's `feature/shap-lime-integration` branch (403 unique commits), originally targeted at Oracle Cloud VM deployment, later re-homed to Render.com.

### GraphRAG / Qdrant / Knowledge Base
**GraphRAG, Qdrant: NOT FOUND** anywhere in current code (checked this pass, zero matches). **Knowledge Graph** (a different, real thing) does exist: `src/app/admin/knowledge-graph`, `src/app/api/admin/knowledge-graph`, `src/app/api/knowledge-graph` — matches CLAUDE.md's documented `src/lib/knowledge-graph/builder.ts` cross-entity graph linking users/RFQs/products/categories. This is a genuinely different, simpler system than GraphRAG (a specific retrieval-augmented-generation architecture pattern) or Qdrant (a vector database product) — neither of which has any footprint in this codebase.

### Automation (n8n / GitHub Actions)
**VERIFIED, and this is a real correction to earlier reporting in this session:** the actual current scheduler is **GitHub Actions** (`.github/workflows/daily-cron.yml`, `weekly-cron.yml`, `manual-job.yml`), not Vercel Cron as this session's own earlier historical audit incorrectly stated. The documented migration path (`docs/AUTOMATION_ARCHITECTURE.md`, dated June 27, 2026) is: Manual → Vercel Cron (rejected, Hobby-tier 2-job limit) → GitHub Actions (current) → Trigger.dev (planned, after 50+ suppliers) → dedicated queue engine (planned, at scale). The `/admin/n8n` page's own name is a fossil — it currently monitors these GitHub-Actions-invoked `/api/cron/*` routes, not any live n8n instance. Real n8n infrastructure did exist historically (Oracle Cloud VM, docker-compose, 2 real workflow JSONs for supplier onboarding emails/SMS) but is confirmed dormant — the `backend/` folder containing it still sits in the current repo but is referenced by neither `package.json` nor `vercel.json`.

### Deployment / Infrastructure
**VERIFIED, full lineage across this session's cumulative work:** Netlify (real, multi-attempt migration effort documented, never completed) → Cloudflare Pages (real, extensive historical usage, later abandoned) → Railway (named in old-repo v1.0 commit messages, no trace in current repo) → Oracle Cloud VM (real, for both n8n and an early SHAP/LIME attempt) → **Vercel** (current, confirmed live and actively deployed to multiple times this session) + **Render.com** (current, for the Python SHAP/LIME service specifically). Database: an early Neon project (`ep-morning-sound-...us-east-1`) → current Neon project (`ep-super-wind-...ap-southeast-1`), a different project and region, reason not documented but consistent with an India-latency optimization.

### Monitoring
**VERIFIED (new check, this pass):** Real routes exist — `src/app/admin/monitoring/page.tsx`, `src/app/api/admin/monitoring/route.ts` — and this route is confirmed (via the Notification check above) to also read the `Notification` model. Not deep-audited beyond confirming existence and this one cross-reference.

---

## Implementation Evolution — the clearest transitions, stated as chains

**OTP Authentication:**
Originally planned as MSG91 + InsForge (Day 1, Feb 2026 in current repo's history / earlier still in the old repo)
↓
InsForge abandoned within 24–48 hours; OTP logic rewritten against Prisma
↓
Original `/api/auth/send-otp`/`verify-otp` routes left in place, unused by real traffic
↓
Current production path: `/api/auth/otp/send` + `/api/auth/otp/verify`/`widget-verify`, old routes now serve only `/demo-login`

**Escrow:**
Originally planned as Polygon blockchain smart contracts (`BellEscrow.sol`, `TradeEscrow.sol` variant found in old-repo backup)
↓
Simultaneously/later, a second target architecture specified: Razorpay + RazorpayX + regulated Nodal Account (`VYAPARSETHU_MASTER_PLAN.md` Ch.7.3)
↓
Neither fully built; a dedicated `/api/escrow` route exists as a permanent stub
↓
Current, actually-working implementation: a wallet-ledger simulation bolted onto the Deal lifecycle route, functionally solid but meeting neither originally planned architecture

**Automation:**
Originally n8n on a self-managed Oracle Cloud VM (recurring 502 errors throughout old-repo history)
↓
Vercel Cron considered, rejected (2-job Hobby-tier limit)
↓
Current: GitHub Actions, business logic held in scheduler-agnostic API routes specifically so the next migration (to Trigger.dev) won't require rewriting business logic

**SHAP/LIME:**
Planned and built on a long-running feature branch (403 commits, old repo)
↓
Originally targeted at Oracle Cloud VM deployment
↓
Current: live on Render.com, wired end-to-end, feature-flagged off pending a documented supplier-count gate — the only module in this whole recovery where the planned technology and the shipped technology are the same code, just redeployed to a different host

**Ratings:**
Originally built against InsForge (inherits from the InsForge-era default), with no schema model ever created for it
↓
Sat broken for the InsForge-era's entire subsequent lifetime — confirmed unreachable by design (lowercase/uppercase status mismatch even if InsForge were live)
↓
Rewritten this session against Prisma with a real `Review` model, migration `0010_reviews`

---

## Disagreements recorded explicitly (per your instruction not to silently resolve)

1. **Escrow/Withdraw completion %:** `BELL24H_FEATURES_COMPLETION_TABLE.md` says Escrow 90%, Withdrawal 85%. Current code (this session, live-traced) shows no real fund-holding integration and an explicitly disabled Withdraw button. **Confidence: code evidence is VERIFIED; document figures are not corroborated and are contradicted.**
2. **Automation scheduler:** this session's own earlier historical audit document said "Vercel Cron replaced n8n." `docs/AUTOMATION_ARCHITECTURE.md` says GitHub Actions is current, Vercel Cron was rejected outright. **Confidence: the document is VERIFIED (dated, detailed, internally consistent); my own earlier statement was wrong and should be treated as superseded.**
3. **RFQ AI matching quality:** `BELL24H_FEATURES_COMPLETION_TABLE.md` claims "85% Complete." No document or code trace in this recovery independently confirms or refutes the specific percentage. **Confidence: UNKNOWN, not adjudicated either way.**

---

Stopping here per the brief. No implementation, no code changes, no commits.
