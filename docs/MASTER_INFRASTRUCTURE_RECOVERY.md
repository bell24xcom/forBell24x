# MASTER INFRASTRUCTURE & DEVOPS RECOVERY — Pass 2E

**Compiled:** 2026-08-03. Cross-references Pass 2A (deployment lineage already summarized), Pass 2B/2C (n8n/GitHub Actions, already fully covered), and adds new evidence from this pass's targeted checks: Docker file proliferation, a resolved question about what InsForge actually was, and one previously-unfound AI provider (Perplexity).

Tagging: **VERIFIED** / **INFERRED** / **UNKNOWN**.

---

## New evidence this pass

**InsForge was built on Supabase — this resolves an open ambiguity from earlier in this session.** `src/lib/insforge.ts` (current repo, confirmed dead code — zero importers anywhere) imports `createClient, SupabaseClient` from `@supabase/supabase-js` directly: `export function getInsforge(): SupabaseClient | null`. CLAUDE.md's instruction to "ignore any Supabase/VITE_ variable references in legacy docs" now has a concrete technical reason — InsForge, the platform's very first backend integration (added 2026-02-17, replaced within 24–48 hours), was itself a Supabase-client-based service, not a wholly separate custom backend. **VERIFIED.**

**A previously unfound AI provider: Perplexity.** `docker-compose.perplexity.yml` (current repo root) defines a `perplexity-ask` container, built from `Dockerfile.perplexity`, taking `PERPLEXITY_API_KEY`. Not mentioned in any document read across Pass 2A/2B/2C's AI-provider inventory. **VERIFIED** as a real artifact; **UNKNOWN** what it was used for or whether it was ever actually run in production — no supporting document found explaining its purpose.

**Docker file proliferation, suggestive of real struggle:** the current repo root alone has `Dockerfile`, `Dockerfile.client`, `Dockerfile.final`, `Dockerfile.fixed`, `Dockerfile.oracle`, `Dockerfile.oracle-fixed`, plus `docker-compose.yml`, `docker-compose.debug.yml`, `docker-compose.perplexity.yml`, and an `oracle-cloud-n8n/docker-compose.yml` still sitting at root (not just archived). The naming pattern (".fixed", ".final" as literal suffixes rather than version numbers) reads as iterative trial-and-error under real deployment pressure — **INFERRED**, consistent with the many `_archive/` deployment-crash-and-fix documents already catalogued in Pass 0/1, but not confirmed by any document explicitly narrating the struggle.

---

## Hosting Evolution

**Originally Planned/First tried:** Cloudflare Pages — extensive historical usage (`_archive/bell24h-main/CLOUDFLARE-PAGES-*.md`, at least 7 distinct fix/setup documents, confirmed Pass 2A).
↓
**Attempted alternative, never completed:** Netlify — a fully-planned, never-executed Vercel→Netlify migration (`MIGRATION_ACTION_PLAN.txt`, confirmed Pass 2A), including a real target site and DNS cutover plan.
↓
**Named but unconfirmed:** Railway — appears only in old-repo v1.0 commit messages ("Complete platform with Admin Panel and Railway deployment"); no supporting document or config found describing an actual Railway deployment.
↓
**Self-hosted, for specific services only:** Oracle Cloud VM — used for n8n (docker-compose, setup scripts) and, per `_archive/bell24h-main/client/MIGRATION_PLAN.md`, an early attempt at hosting the SHAP/LIME Python ML service there too.
↓
**Current Production State: VERIFIED.** Vercel (main application, confirmed via this session's own multiple live deploys and `vercel` CLI usage throughout) + Render.com (SHAP/LIME service specifically, confirmed live and healthy this session). Cloudflare, Netlify, Railway, and Oracle VM are all dormant or abandoned as hosting targets today.

## Database Evolution

**First implementation:** InsForge (Supabase-based, per this pass's new finding), 2026-02-17.
↓
**Replaced within 24–48 hours:** Prisma + Neon PostgreSQL.
↓
**Neon project changed at least once:** an earlier documented project (`ep-morning-sound-81469811.us-east-1.aws.neon.tech`, per `NEON_DATABASE_MIGRATION.md`) differs from the current live project (`ep-super-wind-a1c1ni4n.ap-southeast-1.aws.neon.tech`, confirmed via `.env`/`.env.local` earlier this session) — different endpoint name, different AWS region. **VERIFIED** the two are different; **UNKNOWN** why or exactly when the switch happened (region change is consistent with an India-latency optimization, but no document states this).
↓
**Schema growth:** old repo's `schema.prisma` had 7 models at end of life (confirmed Pass 2A); current repo has 38.
↓
**Current Production State: VERIFIED active.** Prisma + Neon, 12 applied migrations (0001_baseline through 0010_reviews, the latter added this session), confirmed working via this session's own live deploy of migration `0010_reviews`.

## Authentication Evolution

**First implementation:** MSG91 OTP + InsForge/Supabase user storage (`MSG91_VIDEO_IMPLEMENTATION_COMPLETE.md`, confirmed Pass 2A/2B: "Creates or fetches user from InsForge database").
↓
**Replaced:** OTP logic rewritten against Prisma once InsForge was dropped; the original `/api/auth/send-otp`/`verify-otp` routes survive today as a fossil, used only by `/demo-login`.
↓
**Current production path:** `/auth/phone-email` → `/api/auth/otp/send` → `/api/auth/otp/verify`/`widget-verify`, JWT issuance (7-day expiry, confirmed this session in the claim-flow trace), cookie-based session (`auth-token`, httpOnly, `sameSite: lax`).
↓
**Current Production State: VERIFIED active**, confirmed extensively this session across the claim flow, quote acceptance, and deal lifecycle routes.

## Payment Evolution

**Razorpay** — confirmed as the real, live payment gateway for wallet Add Funds (`create-order`/`verify` flow, confirmed this session in both `/wallet` and `/dashboard/wallet` pages).
**RazorpayX** — named in `BELL24H_FEATURES_COMPLETION_TABLE.md` as the wallet's backing service; current code does not confirm this — the wallet balance/ledger are Prisma-native, and `src/app/api/wallet/razorpay/route.ts` (a real file) has zero callers anywhere (confirmed this session). **Document says RazorpayX-backed; current code indicates Prisma-native with Razorpay used only for the deposit transaction itself, not fund custody. Confidence: current code VERIFIED; document's implied architecture not corroborated.**
**Nodal Account (regulated fund holding)** — specified as the required target architecture for real Protected Payment (`VYAPARSETHU_MASTER_PLAN.md` Ch.7.3) — **never built**, per this session's and Pass 2D's escrow findings.
**Current Production State:** Razorpay **VERIFIED active** for deposits; RazorpayX and Nodal Account **VERIFIED not implemented** as fund-custody mechanisms.

## Messaging Evolution

**MSG91** — confirmed as the real, current OTP/SMS provider throughout this session (claim flow, onboarding, OTP send/verify all trace to it).
**WhatsApp** — real, working outreach automation confirmed this session (`outreach/bulk-wa`, `outreach/daily-batch`), including one real bug found and fixed (deep-link claim redirect).
**Email — Resend vs. Brevo:** both are named across various historical documents (`ECG-MARKETING-IMPLEMENTATION-PLAN.md` names Resend specifically, with a code sample; `docs/production-readiness-roadmap-2026-07-27.md` references generic email notification logs without naming a provider). This pass's direct grep of `src/lib` for "brevo"/"resend" did not cleanly resolve which is the current live provider — `src/lib/email.ts`'s `sendEmail` function is confirmed used throughout current code (quote submission, deal notifications), but its underlying provider was **not reconfirmed this pass**. **UNKNOWN**, flagged rather than guessed.

## Automation Evolution (CI/CD)

Fully covered in Pass 2A/2C — cross-referencing rather than repeating: n8n on Oracle Cloud VM (real, recurring 502 errors) → Vercel Cron considered and rejected (2-job Hobby-tier limit) → **GitHub Actions, current** (`.github/workflows/daily-cron.yml`, `weekly-cron.yml`, `manual-job.yml`) → Trigger.dev planned (post-50-suppliers) → dedicated queue planned (at scale). Scheduler abstraction (`SchedulerProvider` interface) deliberately built to make this migration path require no business-logic rewrites.

## Monitoring / Logging / Analytics Evolution

**`/admin/monitoring`** confirmed real (Pass 2B), reads the `Notification` Prisma model.
**`analytics.bell24h.com`** — referenced only once, inside the dormant `n8n/workflows/escrow.workflow.json` (Pass 2D finding) as a POST target for escrow-release logging. **UNKNOWN** whether this subdomain/service ever existed as a real, separate analytics service, or what it logged.
**Current Production State:** real `/admin/analytics`, `/admin/heatmap`, `/admin/revenue` pages exist and were audited today (two real bugs found and documented in this session's earlier admin-panel audit — unrelated to this pass, cross-referenced only).

## Feature Flags Evolution

**First appearance, dated precisely via git history this pass:** 2026-03-21, "feat(admin): heatmap, revenue, outreach, feature flags + full nav audit" — Feature Flags introduced as part of a broader admin sprint, not as a standalone initiative.
↓
**Matured use:** 2026-07-18, "feat(intelligence): harden Product/Industry Intelligence and gate entire layer behind feature flags" — by this point, feature flags had become the actual gating mechanism for a major subsystem (Product/Industry Intelligence), matching CLAUDE.md's `FLAGS.INTELLIGENCE_ENABLED`/`FLAGS.SHAP_ENABLED` phase-gate pattern.
↓
**Current Production State: VERIFIED active.** Confirmed this session as the mechanism gating SHAP/LIME (`NEXT_PUBLIC_SHAP_ENABLED`, unset in production), and separately confirmed as genuinely duplicated between the Feature Flags admin page and the Control Panel page (same underlying `feature_flags` table, two separate UIs — found in this session's earlier admin audit).

## Environment Configuration Evolution

Pass 0's mechanical index already catalogued an unusually large number of env-file variants across repos: `.env.development`, `.env.local.backup.<timestamp>` (x2), `.env.neon`, `.env.production.protected-backup`, `.env.revenuecat`, `.env.staging`, `.env.windsurf`, `.env.test`, in the old repo alone. This density of backup/variant env files is **consistent with** (not proof of) an environment that went through many deployment-platform changes in rapid succession, each requiring its own credential set — matching the hosting evolution above. **INFERRED**, not directly stated in any document.

---

## Current Production Stack (as of this session, directly verified)

- **Hosting:** Vercel (main app) + Render.com (SHAP/LIME Python service)
- **Database:** Neon PostgreSQL (`ap-southeast-1`) + Prisma (38 models, 12 migrations)
- **Automation:** GitHub Actions (9 scheduled cron-equivalent jobs)
- **Auth:** MSG91 OTP + JWT (7-day cookie session)
- **Payments:** Razorpay (deposits only; fund custody is Prisma-native, not RazorpayX or a Nodal Account)
- **Messaging:** MSG91 (SMS/OTP) + WhatsApp (outreach automation) + email (provider unconfirmed this pass)
- **AI:** Groq (Voice RFQ), SHAP/LIME on Render (flagged off), scattered NVIDIA/Gemini/OpenAI/Perplexity references with mostly unconfirmed current status

## Legacy / Removed Systems

InsForge (Supabase-based), Cloudflare Pages, Netlify (never completed), Railway (named, unconfirmed), Oracle Cloud VM (n8n + early SHAP/LIME hosting), n8n itself as a scheduler, the original MSG91 OTP routes (superseded, not deleted), RevenueCat (built at the very end of the old repo, no trace in current repo).

## Contradictions Recorded

1. Wallet/Escrow document (`BELL24H_FEATURES_COMPLETION_TABLE.md`) implies RazorpayX-hosted fund custody; current code shows Prisma-native wallet with Razorpay used only for deposit transactions. Not silently reconciled — both stated above.
2. Blockchain escrow plan specifies Polygon; the actual deployment script (Pass 2D finding) targets Sepolia. Repeated here for infrastructure completeness, fully detailed in Pass 2D.
3. Email provider: at least two candidates named across different documents/eras (Resend explicitly in one implementation plan; no explicit current-code confirmation either way this pass) — recorded as unresolved, not guessed.

## Confidence Assessment

High confidence, directly verified this session or this pass: hosting stack, database stack, GitHub Actions automation, MSG91/JWT auth, Feature Flags timeline and current gating role, InsForge's Supabase foundation.
Medium confidence, inferred from circumstantial evidence: the causal link between deployment-platform churn and env-file proliferation, Docker file naming as evidence of deployment struggle.
Unresolved, explicitly flagged: current email provider identity, Perplexity's actual usage, whether any blockchain contract was ever deployed to any network, what `analytics.bell24h.com` was.

Stopping here per the brief. No implementation, no code changes, no commits.
