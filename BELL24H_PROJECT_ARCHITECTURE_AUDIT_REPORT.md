# BELL24H PROJECT ARCHITECTURE AUDIT REPORT

**Date:** January 2026  
**Scope:** Full codebase analysis for launch readiness after ~1.5 month pause.  
**Primary codebase:** Root `src/`, `client/`, `prisma/`; reference to `bell24h-main/`, `vercel-clean-deploy/` where relevant.

---

## Executive Summary

The Bell24h repo is a **multi-root monorepo**: root (blockchain/Hardhat + Next), **client/** (Next.js 14 “bell24h-client”), **server/**, and copies in **bell24h-main/** and **vercel-clean-deploy/**. The **production deployment** (Vercel, 100 static pages) is likely built from one of these Next.js apps; the exact build root used by Vercel should be confirmed in project settings.

**Current state:** Core UI, auth flow (OTP mock), categories (50 static), RFQ/quote APIs and Prisma schema exist, but **schema vs generated client and API code are misaligned**. Root `prisma/schema.prisma` defines RFQ/Quote/Transaction; `src/generated/prisma` exposes only Account/Session/User/VerificationToken. API routes under `src/app/api/rfqs` and `src/app/api/quotes` assume a different schema (e.g. `category` relation, `webhook` model) and will fail at runtime. Auth (send-otp, verify-otp) is **mock-only** (no MSG91). Payment routes are **not** under `src/app/api` (they exist in client/ or vercel-clean-deploy). DNS still points to the old server (216.198.79.1); Vercel expects 76.76.21.21.

**Readiness:** Not launch-ready until: (1) Prisma schema and generated client are aligned and migrations applied, (2) Auth uses real MSG91 or is explicitly “demo”, (3) Login “t is not a function” fixed (i18n), (4) DNS updated, (5) Single deployable app and env clarified.

---

## 1. Project Structure Analysis

### 1.1 Root level

| Path | Purpose | Status |
|------|--------|--------|
| `package.json` | bell24h-blockchain (Hardhat + Next 14) | Root app is blockchain-focused; Next may run from here |
| `next.config.js` | Next config (Prisma external, images unoptimized, TS/ESLint ignore) | Present; consider tightening for prod |
| `prisma/schema.prisma` | Main B2B schema (User, RFQ, Quote, Transaction, Lead, Notification, OTPVerification) | Complete; no Category/Webhook models |
| `src/app/*` | Next.js App Router pages & API | 35+ pages; 6 API route files under src/app/api |
| `src/components/*` | React components (70+ files) | Many present; usage vs dead code needs verification |
| `src/lib/*` | Utils, prisma client, auth, AI, etc. | prisma.ts uses @prisma/client; generated client is different schema |
| `src/contexts/AuthContext.tsx` | Client auth state, sendOTP, signIn | Uses /api/auth/send-otp, verify-otp |
| `src/data/*` | Categories, mock RFQs, suppliers, demo data | all-50-categories.ts, demoData.ts, etc. |
| `src/i18n/config.ts` | next-i18next (useTranslation, appWithTranslation) | Exported; likely source of “t is not a function” if used without provider |
| `src/generated/prisma/*` | Generated Prisma client | Only Account, Session, User, VerificationToken (NextAuth-style) |
| `client/` | Separate Next.js app (“bell24h-client”) | Own package.json, src/app, many API routes (auth, subscription, health, claim, etc.) |
| `server/` | Backend server (Express/Node style) | Routes for rfq, payments, wallet, etc. |
| `vercel-clean-deploy/` | Minimal Vercel deploy | Payment routes, auth variants, reminder API |
| `bell24h-main/` | Copy of older full codebase | Duplicate of much of the above |

**Key finding:** Two (or more) Next.js apps and multiple Prisma schemas. The **deployed** app on Vercel must be identified (root vs client vs vercel-clean-deploy). Root `src/app/api` has only 6 route files; `client/src/app/api` has many more (payments may live there or in vercel-clean-deploy).

### 1.2 Key directories – summary

- **src/app:** layout.tsx (no Header/Footer in layout; homepage has inline nav), page.tsx (home), auth/login-otp, dashboard, rfq/*, categories, suppliers, pricing, legal, etc. **Incomplete:** Layout does not wrap with AuthProvider or i18n; payment-example not under src/app.
- **src/app/api:** send-otp, verify-otp, rfqs, quotes, webhooks/n8n, voice/rfq. **Broken:** rfqs/route.ts uses `prisma.rfq` with `include: { category: true, user: true }` and creates `webhook` – schema has no Category relation or Webhook model.
- **src/lib:** prisma.ts, auth, db-connection (Railway comments), etc. **Risk:** Which Prisma client is resolved (root generate vs generated/prisma) is environment-dependent.
- **prisma:** Single schema.prisma at root; no Category, no Webhook; RFQ has category String, not relation.

---

## 2. Infrastructure Status

| Component | Status | Notes |
|-----------|--------|------|
| **Vercel** | Deployed | bell24h.helpline@gmail.com, bell24xs-projects/bell24h; build ~2m48s; 100 pages |
| **GitHub** | Connected | digitex-erp/bell24h; main branch |
| **Neon PostgreSQL** | In use | DATABASE_URL in Vercel; verified in prior Part 2 |
| **DNS (bell24h.com)** | Wrong | A record 216.198.79.1 (old); should be 76.76.21.21 (Vercel) |
| **DigitalOcean** | Legacy | 165.232.187.195; scripts reference /root/bell24h-app, Docker; no longer primary |
| **Railway** | Migrated off | DB/env references removed; some .env.example still mention Railway |
| **InsForge** | BaaS + MCP | App env: NEXT_PUBLIC_INSFORGE_*; MCP connected in Cursor |
| **n8n** | Unclear | n8n webhook route in src; n8n.bell24h.com was on DO; production instance not confirmed |

**Vercel:** Env vars (from your docs) include DATABASE_URL, NEXTAUTH_*, RAZORPAY_*, MSG91_*, JWT_SECRET, NEXT_PUBLIC_INSFORGE_*. Confirm which app (root vs client vs vercel-clean-deploy) is built and which env file it uses.

**Old infrastructure:** DigitalOcean droplet may still exist; Railway was shut down. Recommend confirming DO is no longer billed if unused.

---

## 3. Feature Completeness Matrix

| Feature | Status | Evidence / Notes |
|---------|--------|-------------------|
| **OTP login (MSG91)** | Mock only | send-otp/verify-otp have TODO; no MSG91 call |
| **Session / JWT** | Mock | verify-otp returns mock token; stored in localStorage via AuthContext |
| **Protected routes** | Partial | AuthContext exists; no middleware.ts in src for route protection |
| **Create RFQ (text)** | API broken | rfqs/route.ts schema mismatch (category, webhook) |
| **RFQ voice/video/image** | Partial | Pages and some API exist; voice/rfq route in src |
| **View/Edit RFQ** | UI exists | rfq/[id], rfq/create; likely mock or broken API |
| **Quotes** | API broken | quotes/route.ts uses Prisma; same schema risk as rfqs |
| **Razorpay** | Not in src/app/api | Payment routes in client/ or vercel-clean-deploy |
| **Categories (50)** | Complete (static) | all-50-categories.ts; categories page and [slug] use it |
| **Suppliers** | UI + data | suppliers/[slug], mock-suppliers, SupplierProfileView |
| **Payments (create/verify/webhook)** | Elsewhere | See vercel-clean-deploy or client API |
| **AI (matching, voice, etc.)** | Partial | Some lib/ai and backend; not fully audited |
| **n8n webhooks** | Route exists | src/app/api/webhooks/n8n/route.ts |

---

## 4. Database Schema Review

**File:** `prisma/schema.prisma`

**Models:** User, OTPVerification, RFQ, Quote, Transaction, Lead, Notification.  
**Enums:** UserRole, RFQStatus, RFQUrgency, QuoteStatus, TransactionStatus, LeadStatus, NotificationType.

**Gaps vs API usage:**

- **RFQ:** Schema has `category String` (no relation). API does `include: { category: true, user: true }` → expects Category model and relation. **Fix:** Either add Category model and relation or change API to stop including category.
- **Webhook:** API creates `prisma.webhook.create(...)`; no Webhook model in schema. **Fix:** Add Webhook model or remove webhook creation from API.
- **Generated client:** `src/generated/prisma` was generated from a different schema (Account, Session, User, VerificationToken only). **Fix:** Run `prisma generate` from project root so `node_modules/@prisma/client` matches root schema; remove or update any code that imports from `@/generated/prisma` if that path is used.

**Migrations:** Confirm migrations are applied on Neon (e.g. `prisma migrate deploy`). Schema uses `directUrl` for migrations.

---

## 5. API Routes Inventory (src/app/api)

| Route | Purpose | Complete? | Auth? | Issues |
|-------|---------|-----------|-------|--------|
| POST /api/auth/send-otp | Send OTP to phone | Mock only | No | TODO MSG91 |
| POST /api/auth/verify-otp | Verify OTP, return user/token | Mock only | No | TODO real verify; mock JWT |
| GET/POST /api/rfqs | List/create RFQ | Broken | Unclear | Prisma schema mismatch (category, webhook) |
| /api/quotes | Quotes | Broken | Unclear | Same Prisma client/schema risk |
| /api/webhooks/n8n | n8n webhook | Present | Check | — |
| /api/voice/rfq | Voice RFQ | Present | Check | — |

**Payment routes:** Not under `src/app/api`. Search shows them in `client/src/app/api` or `vercel-clean-deploy/app/api` (e.g. payments/create-order, verify, wallet). Which codebase Vercel builds determines which payment routes are live.

---

## 6. Frontend Completeness

**Pages (src/app):** Home, auth/login-otp, dashboard, dashboard/comprehensive, rfq (create, [id], voice, video, demo/*), categories, categories/[slug], suppliers/[slug], pricing, about, contact, blog, careers, help/*, legal/*, admin, orders/received, products/add, quotes/my-quotes.

**Components:** 70+ under src/components (Header, Footer, AuthModal, RFQ, dashboard, suppliers, ai, admin, etc.). Many look complete; some may be unused or depend on broken API.

**Critical issues:**

- **Layout:** Root layout does not include Header/Footer or AuthProvider; homepage has its own nav. If other pages expect layout chrome, they may be inconsistent.
- **Login “t is not a function”:** Likely a component (e.g. Header or shared UI) calling `t()` from `useTranslation()` while the app is not wrapped with `appWithTranslation` or the provider fails. **Fix:** Ensure i18n provider wraps the tree or remove use of `t` on login path.
- **AuthProvider:** Login page uses `useAuth()`; layout must wrap app with `AuthProvider` for auth to work.

---

## 7. Configuration Analysis

- **package.json (root):** Scripts dev/build/start (Next), Hardhat scripts. Dependencies include Next 14, React, Hardhat, OpenZeppelin, etc.
- **next.config.js:** reactStrictMode, swcMinify, ignore ESLint/TS errors in build, serverComponentsExternalPackages Prisma, images unoptimized. **Recommendation:** Re-enable type checking and lint for prod; fix images if needed.
- **.env.example:** Still has Railway DATABASE_URL and Railway NEXTAUTH_URL. **Fix:** Switch to Neon and Vercel URLs and document all vars used in production (see BELL24H-ACCOUNT-AND-DNS-REFERENCE.md).
- **tsconfig.json:** Not fully read; ensure path alias `@/` points to correct app (e.g. `src/`).

---

## 8. Integration Status

| Service | Configured | Integrated | Working |
|---------|------------|------------|---------|
| Neon PostgreSQL | Yes (Vercel) | Yes (Prisma) | Yes (per Part 2) |
| MSG91 (SMS/OTP) | Yes (env) | Mock only in src | No |
| NextAuth | Env present | Partial (mock verify) | No real session |
| JWT | Env present | Mock token in verify-otp | No real signing |
| Razorpay | Env present | In other app (client/ or vercel-clean-deploy) | Unverified in src |
| InsForge | Env present | Referenced in docs | MCP + app usage |
| n8n | Webhook route | Unknown | Instance and workflows not confirmed |

---

## 9. Critical Issues List

1. **Prisma schema vs API (CRITICAL)**  
   - `src/app/api/rfqs/route.ts` and quotes use `include: { category: true }` and `prisma.webhook`; root schema has no Category relation and no Webhook.  
   - **Fix:** Align schema with API (add Category/Webhook or change API) and run `prisma generate` + migrations.

2. **Generated Prisma client mismatch (CRITICAL)**  
   - `src/generated/prisma` has only Account, Session, User, VerificationToken.  
   - **Fix:** Use single schema (root prisma/schema.prisma), run `prisma generate` at repo root, and ensure all API code uses the same client (e.g. `@/lib/prisma` → `@prisma/client` from root).

3. **Login “t is not a function” (CRITICAL)**  
   - Likely i18n: component calls `t()` without provider or wrong import.  
   - **Fix:** Wrap app with i18n provider or remove translation usage on login route; check Header/Footer and any shared component on auth pages.

4. **DNS (CRITICAL)**  
   - bell24h.com A record 216.198.79.1; should be 76.76.21.21 for Vercel.  
   - **Fix:** Update Cloudflare A record; see BELL24H-ACCOUNT-AND-DNS-REFERENCE.md.

5. **Auth mock-only (HIGH)**  
   - send-otp and verify-otp do not call MSG91 or issue real JWT.  
   - **Fix:** Integrate MSG91 and sign JWT with JWT_SECRET, or clearly label as “demo” and restrict access.

6. **Deployable app ambiguity (HIGH)**  
   - Multiple Next.js apps (root, client, vercel-clean-deploy).  
   - **Fix:** Confirm in Vercel which root is built; document and standardize on one app and one Prisma schema.

7. **.env.example outdated (MEDIUM)**  
   - Railway URLs and DB; should reflect Neon + Vercel.  
   - **Fix:** Update and match Vercel env list.

---

## 10. Launch Readiness Assessment

### Critical blockers (must fix before launch)

- [ ] Fix Prisma: align schema with API (Category/Webhook or remove from API); single `prisma generate` and migrations on Neon.
- [ ] Fix login: resolve “t is not a function” (i18n or remove `t` on auth path).
- [ ] DNS: point bell24h.com to 76.76.21.21 (Vercel).
- [ ] Auth: either integrate MSG91 + real JWT or lock “demo” auth and document.
- [ ] Confirm which Next.js app and which API routes are deployed on Vercel; ensure payment and auth routes are in that app.

### High priority (launch week 1)

- [ ] Add AuthProvider (and optionally i18n) to root layout if using src/app as main app.
- [ ] Protect dashboard/rfq routes via middleware or auth check.
- [ ] End-to-end test: login → create RFQ → view RFQ (with real DB).
- [ ] Verify payment flow (create order, verify, webhook) on deployed app.

### Medium priority (weeks 2–4)

- [ ] n8n: confirm production instance; import workflows; point webhooks to production URL.
- [ ] Voice/video RFQ: test and complete or hide.
- [ ] Rate limiting and security headers (e.g. middleware).

### Low priority (post-launch)

- [ ] Remove or archive duplicate codebases (e.g. bell24h-main) to avoid confusion.
- [ ] Re-enable TypeScript/ESLint in Next build.
- [ ] Sentry/analytics and monitoring.

### Estimated time

- Critical blockers: 1–2 days (Prisma + login + DNS + auth decision).
- High priority: 2–3 days.
- MVP launch: ~1 week after criticals done. Full feature set: 2–4 weeks depending on n8n and payment verification.

---

## 11. Architecture Diagram (Text)

```
User Browser
    ↓
Cloudflare DNS (bell24h.com)  ← CURRENT: 216.198.79.1 (wrong)
    ↓                          TARGET: 76.76.21.21 (Vercel)
Vercel (Next.js 14)
    ↓
├── Neon PostgreSQL (DATABASE_URL) ✅
├── InsForge (NEXT_PUBLIC_INSFORGE_*) ✅
├── MSG91 (OTP) – env set; app code mock ⚠️
├── Razorpay – env set; routes in client/ or vercel-clean-deploy ⚠️
├── NextAuth/JWT – env set; verify-otp mock ⚠️
└── n8n – webhook route exists; instance location TBD ⚠️

Repo structure:
├── src/app (pages + 6 API routes) – schema mismatch
├── client/ (full API set, payments?) – may be deploy target
├── vercel-clean-deploy/ (minimal + payments)
├── prisma/schema.prisma (B2B models; no Category/Webhook)
└── src/generated/prisma (NextAuth-style only) – wrong for current schema
```

---

## 12. Next Steps Action Plan

**Today (next 2–4 hours)**  
1. Confirm Vercel project’s “Root Directory” and build command (which app is deployed).  
2. Update Cloudflare A record for bell24h.com to 76.76.21.21.  
3. Fix login: in codebase search for `useTranslation` or `t(` in components used on `/auth/login-otp`; add provider or remove `t` on that path; test locally.  
4. Align Prisma: add Category and Webhook to schema (or change rfqs/quotes API to match current schema); run `npx prisma generate` and `npx prisma migrate deploy` (or apply migrations to Neon).

**This week**  
5. Replace mock send-otp/verify-otp with MSG91 + JWT or explicitly restrict to demo.  
6. Add AuthProvider (and i18n if needed) to root layout.  
7. Run full flow: login → create RFQ → list RFQs against Neon.  
8. Verify payment endpoints on the deployed app and test with Razorpay test keys.

**This month**  
9. Document single “source of truth” app and Prisma schema; archive or remove duplicate roots.  
10. n8n production instance and workflow import.  
11. Monitoring (e.g. Sentry) and basic analytics.

---

*End of audit. For account and DNS details, see BELL24H-ACCOUNT-AND-DNS-REFERENCE.md.*
