# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- Never add new /api/ functions if it pushes count over 12 (Vercel Hobby tier limit — extend existing dispatchers instead)

## Dashboard Visibility Policy (5-Level)

1. Public homepage → trust promises only, NO numbers
2. Supplier dashboard → THEIR OWN metrics only
3. Buyer dashboard → their requirements + specific supplier scores
4. Admin (founder-only) → everything
5. Investor → network density (post 500 suppliers only)

## Reference Documents

- docs/VYAPARSETHU_MASTER_PLAN.md — single source of truth for strategy (17 chapters)
- docs/NEXT_30_DAYS_SPRINT.md — current sprint, day-by-day
