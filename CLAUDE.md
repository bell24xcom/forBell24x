# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ARCHITECTURE REFERENCE
VyaparSethu = Business OS (Bell24h OS is the internal engine).
Marketplace = Application #1. Not the platform.
All intelligence features gated behind FLAGS.INTELLIGENCE_ENABLED.
All SHAP features gated behind FLAGS.SHAP_ENABLED.
Phase D gate: 100 verified suppliers before any intelligence activates.
n8n executes. Backend decides. Never reverse this.

## Commands

```bash
npm run dev          # Start development server (Next.js)
npm run build        # prisma migrate deploy + prisma generate + next build
npm run lint         # ESLint (next lint)
npm run db:push      # Push schema changes without migration (dev only, --accept-data-loss)
npm run db:baseline  # Baseline an existing database into Prisma migrations
```

TypeScript and ESLint errors are intentionally ignored during builds (`next.config.js` sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`). Do not rely on the build step to catch type errors.

## Architecture

**Bell24h** is India's B2B supplier marketplace. Buyers post RFQs (via voice, video, or text); suppliers submit quotes; deals close through escrow.

### Stack

- **Framework**: Next.js 14 App Router (`src/app/`)
- **Database**: Neon PostgreSQL via Prisma ORM (`prisma/schema.prisma`)
- **Auth**: Mobile OTP only — MSG91 sends OTP, JWT stored in `localStorage` under key `bell24h_user`
- **AI / Voice RFQ**: Groq Whisper v3 (`GROQ_API_KEY`) for audio transcription + RFQ extraction
- **Payments**: Razorpay (`src/app/api/payment/`)
- **Blockchain**: Solidity smart contracts on Polygon (`contracts/` — `BellEscrow.sol`, `BellToken.sol`), compiled/tested via Hardhat
- **Email/SMS**: MSG91 HTTP API for OTP and transactional messages

### Path Alias

`@/` resolves to the **repo root**, not `src/`. So `@/src/lib/prisma` is `./src/lib/prisma` and `@/components/Header` is `./src/components/Header`.

### Key Directories

| Path | Purpose |
|------|---------|
| `src/app/` | App Router pages |
| `src/app/api/` | All API routes (Next.js Route Handlers) |
| `src/components/` | Shared React components |
| `src/lib/` | Utilities — `prisma.ts` (singleton client), `otp-service.ts`, `auth.ts`, `payment.ts`, etc. |
| `src/contexts/` | React contexts — `AuthContext.tsx`, `DashboardContext` (buyer/supplier toggle) |
| `prisma/schema.prisma` | Single source of truth for DB schema |
| `contracts/` | Solidity smart contracts |

### Core Domain Model

- **User**: dual-role by design — every account is simultaneously a buyer and supplier.
- **RFQ**: a request for quotation posted by a user; has `status`, `urgency`, `categoryId`, optional `slug`.
- **Quote**: a supplier's bid on an RFQ.
- **Deal**: created when a quote is accepted; links buyer, supplier, RFQ, and quote.
- **Transaction**: payment record for a deal; tracks `status` through `PENDING → PROCESSING → COMPLETED`.
- **Wallet / WalletTransaction**: in-app wallet balance per user.
- **OTPVerification**: tracks sent OTPs and attempts; expires after a short window.

### Auth Flow

1. Client calls `POST /api/auth/send-otp` → MSG91 sends OTP to phone.
2. Client calls `POST /api/auth/verify-otp` or `POST /api/auth/otp/verify` → returns JWT.
3. JWT is stored in `localStorage` as `bell24h_user`; `AuthContext.tsx` reads it on mount.
4. API routes validate the JWT from the `Authorization: Bearer` header or cookies.

### Dashboard Architecture (Frozen)

The dashboard lives at `/dashboard`. A **buyer/supplier toggle** switches view mode only — it does not change permissions. The `DashboardProvider` context provides `useDashboardMode()`. Any user can post RFQs, submit quotes, or browse — role in DB is a display preference, not an access gate. **Do not add role-based access checks to API routes.**

### Voice RFQ Pipeline

`POST /api/voice-rfq/transcribe` → Groq Whisper v3 transcribes audio and extracts structured RFQ fields in one call → `POST /api/voice-rfq/save` persists to the `rfqs` table. The component is `src/components/VoiceRFQ.tsx`.

### Homepage Structure (Frozen)

Header → Hero (demo, minimal) → 3-Column Grid (Categories | Live RFQs | Most Demanded) → Footer. No structural changes without founder approval.

### Environment Variables

Copy `.env.example` to `.env.local`. Required variables:

```
DATABASE_URL      # Neon PostgreSQL pooled URL
DIRECT_URL        # Neon PostgreSQL direct URL (for migrations)
JWT_SECRET        # ≥32 chars
MSG91_AUTH_KEY    # OTP provider
MSG91_SENDER_ID
MSG91_TEMPLATE_ID
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
GROQ_API_KEY      # Voice RFQ transcription
```

### Deployment

- **Primary**: Vercel (`vercel.json`) — `npm run vercel-build` runs migrations then builds.
- **DB migrations**: `prisma migrate deploy` runs automatically on build. For schema changes in dev, use `npm run db:push`. Only one baseline migration exists (`0001_baseline`).
- **Blockchain**: `npm run deploy:polygon` / `npm run deploy:mumbai` via Hardhat.

---

## Brand & Naming (CRITICAL)

The platform is rebranding from Bell24h to VyaparSethu.

- Brand: VyaparSethu (not Bell24h)
- Tagline: "Commerce Connections Globally"
- Mission: "Wipe Out Bad Debt"
- Domain: vyaparsethu.com (in transition; bell24h.com still active during 30-60 day controlled migration)
- Operating entity: Digitex Studio (Pvt Ltd registration in progress as VyaparSethu Technologies Private Limited)

When writing user-facing copy, ALWAYS use VyaparSethu.
When writing internal code/comments, Bell24h references are acceptable but new code should prefer VyaparSethu.

## Word System (ENFORCE IN ALL USER-FACING COPY)

Never write → Always write:
- RFQ → "Quotation" or "Requirement"
- Voice RFQ → "Speak Requirement"
- Video RFQ → "Video Requirement"
- Text RFQ → "Text Requirement"
- Escrow → "Protected Payment"
- Vendor → "Verified Supplier"
- Wallet → "Trade Account" (RBI-safe naming)
- Procurement → "Business Operations"
- Marketplace → "Trade Network"
- Chat → "Business Conversations"
- Parcha → REJECTED, never use
- "AI-powered" in headlines → use as feature description only

## Three Pillars (Every feature must serve at least one)

1. Verified Matching — no fake suppliers, no fake buyers
2. Protected Payment — money safe until both sides deliver
3. Faster Trade — Quotation in 24h, Order in 48h, Settlement in 7d

If a proposed feature serves none of these three, push back before building.

## Never Do (Hard Rules)

- Never show zero metrics publicly ("0 RFQs", "0% Success Rate")
- Never call Trade Account a "Wallet" (RBI risk)
- Never hold customer funds directly (use Razorpay + Nodal partner)
- Never compete with IndiaMART on directory features
- Never build chat (build "Business Conversations" instead)
- Never compute Trust Score real-time (use daily cron only)
- Never add new /api/ functions if it pushes serverless function count over 12 (Vercel Hobby tier limit) — extend existing dispatcher routes instead. The `/api/admin/*` routes are dispatched through thin handlers to stay under this limit.

## Dashboard Visibility Policy (5-Level)

1. Public homepage → trust promises only, NO numbers
2. Supplier dashboard → THEIR OWN metrics only
3. Buyer dashboard → their requirements + specific supplier scores
4. Admin (founder-only) → everything
5. Investor → network density (post 500 suppliers only)

## Reference Documents

- docs/VYAPARSETHU_MASTER_PLAN.md — single source of truth for strategy (17 chapters)
- docs/NEXT_30_DAYS_SPRINT.md — current sprint, day-by-day

## Trade Confidence Score™ Formula

```
Trust Score =
  30% Payment History
+ 20% On-time Delivery
+ 15% Response Speed
+ 15% Repeat Orders
+ 10% Dispute Rate
+ 10% Verification Strength
= Score out of 100
```

Compute via **daily cron at 2 AM IST only** — never real-time. Use Vercel Cron.
Stored on the User model as `trustScore` (already exists in schema).

**North Star metric — Trust Velocity:** `Successful Transactions ÷ Time` (trades/week).
Not page views, not registrations, not RFQs. This is the only metric to obsess over.

## Controlled Rebrand Scope (Visual Only)

The rebrand is **display text only**. The following must NOT change during rebrand work:

- `prisma/schema.prisma` — no migration, no column renames
- `src/app/api/*` — no API route changes
- Authentication logic, middleware, env vars
- Vercel/Neon/MSG91/Razorpay configuration and callback URLs
- Domain: bell24h.com stays primary until 50+ verified suppliers onboarded;
  vyaparsethu.com becomes primary only at Phase 2 (30–60 days out)

Safe replacements: `Bell24h` → `VyaparSethu`, `BELL24H` → `VYAPARSETHU` in UI text only.
Footer must include small "Formerly Bell24h" note during transition.
Remove all fake/seeded aggregate numbers from public pages (replace with
"Launching Soon — Reserve your category").


---

## AI Persona & Autonomous Studio (from CL4R1T4S integration)

Claude Code operates as an **Autonomous Creative and Operational Studio** for VyaparSethu. Key behavioral directives extracted from CL4R1T4S reference library:

- **Be proactive, not reactive.** When you see a broken file, incomplete type, or missing env var, surface it immediately rather than waiting to be asked.
- **Codebase-first.** Always read existing components before creating new ones. Never assume a library is available — check `package.json`.
- **Security-first.** No hardcoded credentials, no fallback plaintext passwords, no localStorage-based admin auth. All secrets via env vars.
- **Minimal output.** Answer in fewer than 4 lines when possible. No preamble, no postamble, no summaries of what you just did.
- **Task process**: Search → Implement → Verify → Report only what changed.

### MuAPI / Kling Defaults (for video generation tasks)

```
model:        kling-v2.1-master-t2v   (text-to-video, cinematic master quality)
aspect_ratio: 9:16                    (vertical mobile format)
duration:     5 or 10                 (Kling max per clip; chain clips for 15s)
endpoint:     POST https://api.muapi.ai/api/v1/kling-v2.1-master-t2v
auth_header:  x-api-key: $MUAPI_API_KEY
poll:         GET  https://api.muapi.ai/api/v1/predictions/{request_id}/result
image_model:  flux-dev-image          (for batch category images)
output_dir:   public/marketing/       (video), public/assets/ (images)
```

Account must have credits at muapi.ai (digitex.studio@gmail.com). Current balance: $0 — top up before calling generation endpoints.

### Design System Constraints

- **Primary palette**: Deep Navy `#001f3f` · Brushed Gold `#D4AF37` · White `#FFFFFF`
- **Spacing system**: 6px grid (6, 12, 18, 24, 36, 48, 72px) — all margins/paddings must be multiples of 6
- **Typography**: Poppins for headings · Inter for body · Devanagari-compatible fallback for Hindi overlays
- **No zeros publicly**: Never render 0 counts, 0% rates, or empty metric cards on public-facing pages

### Intelligence Layer (Static Catalog + Engine Pattern)

Several intelligence modules follow a **catalog → engine → view** pattern — all data is static TypeScript, no extra DB tables:

| Module | Data Catalog | Engine | Purpose |
|--------|-------------|--------|---------|
| Product Intelligence | `src/data/product-intelligence-catalog.ts` | `src/lib/product-intelligence/` | Product specs, HSN, graph, SEO metadata |
| Industry Intelligence | `src/data/industry-intelligence-catalog.ts` | `src/lib/industry-intelligence/` | Industry profiles, cluster links, trend scoring |
| Industrial Clusters | `src/data/industrial-clusters.ts` | (direct lookup) | Geo-tagged cluster slugs → public `/industrial-cluster/[slug]` pages |
| Geographic Intelligence | (registry inside module) | `src/lib/geographic-intelligence/hierarchy.ts` | Country/State/District/City hierarchy for BOM Location Memory |

Public SEO routes: `/industrial-cluster/[slug]` and `/product-intelligence/[slug]` — these are statically rendered from the catalog data.

### Business Operating Memory (BOM)

`src/lib/bom/` is the event-sourced memory layer for each company. Architecture:

- **Life Events** (`life-events.ts`) — the source of truth. All company activity is written as `BusinessLifeEvent` rows in the DB.
- **Projections** (`projections.ts`) — reads life events and builds a `BomProjection` (20 memory module snapshots).
- **Genome Score** (`genome-score.ts`) — computes a 0–100 `BusinessGenome` score across the 20 BOM modules.
- **Morning Brief** (`morning-brief.ts`) — generates a per-company brief from BOM projection + optional LLM polish. Always reads the company's own BOM — never generic chatbot data.
- **Business Pulse** (`business-pulse.ts`) — area-level + cluster-level pulse feed, for the geographic context of a company.
- **Location Memory** (`location.ts`) — maps company location to `IndustrialArea` via `src/data/industrial-clusters.ts`.

The 20 BOM modules (identity, business, product, procurement, supplier, customer, financial, trust, risk, market, knowledge, communication, decision, intent, timeline, opportunity, operational, predictive, economic, location) are defined in `modules.ts`.

### Company DNA Graph

`src/lib/company-dna/graph-builder.ts` builds a force-directed graph (`DnaGraphData`) from a company's BOM layers. This powers the `/admin/company-dna` UI. It uses `product-intelligence-catalog.ts` for product node data. The `Company DNA graph is a visualization; BusinessLifeEvent is the source of truth.`

### Knowledge Graph

`src/lib/knowledge-graph/builder.ts` builds a cross-entity graph (`KnowledgeGraphData`) linking users, RFQs, products, and categories. Admin-only via `/admin/knowledge-graph` and `/api/admin/knowledge-graph`.

### Additional Env Vars (beyond .env.example)

```
BOLNA_API_KEY       # Bolna.ai voice campaign API key
BOLNA_AGENT_ID      # Bolna.ai agent UUID for Sethu persona
SCRAPEGRAPH_API_KEY # ScrapeGraphAI API key for lead scraping
MUAPI_API_KEY       # MuAPI video/image generation (add credits at muapi.ai)
CRON_SECRET         # Required on all /api/cron/* endpoints; set on Vercel too
SEO_LLM_API_KEY     # Used by src/lib/seo-llm.ts for Morning Brief AI polish (optional)
```

### Database Notes

- Project uses **Neon PostgreSQL + Prisma** — NOT Supabase. Ignore any Supabase/VITE_ variable references in legacy docs.
- New `leads` table and `consent_audit_log` are in `prisma/migrations/0002_leads_dpdp/migration.sql` — run `prisma migrate deploy` to apply.
- DPDP erasure trigger fires automatically when a lead's `status` is set to `'opted_out'`.
