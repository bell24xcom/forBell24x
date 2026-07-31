# SEO Architectural Decisions — VyaparSethu

**Parent program:** [ENTERPRISE_SEO_MASTER_PROGRAM.md](ENTERPRISE_SEO_MASTER_PROGRAM.md)
**Created:** 2026-07-31
**Last validated against production:** 2026-07-30, deployment `bell24h-339udlwh9`, commit `c937ae8`

---

## How to read this document

Every decision carries a **status**. The distinction is load-bearing — do not blur it.

| Status | Meaning |
|---|---|
| 🟢 **RATIFIED** | Implemented and verified in production. Describes what **is**. Changing it requires a new decision entry. |
| 🟡 **PROPOSED** | A recommendation from the 2026-07-30 audit. **Not approved. Not implemented.** Describes what is *suggested*. |
| 🔴 **OPEN** | Requires a Founder decision before work can proceed. Blocks named sprints. |
| ⚫ **SUPERSEDED** | Replaced by a later entry. Retained for history. |

> ⚠️ **Nothing in this document has been approved by the Founder except where marked 🟢 RATIFIED, and 🟢 entries describe already-shipped production behaviour rather than forward commitments.** Every 🟡 and 🔴 item awaits sign-off.

---

## 1. Canonical strategy

### D-CAN-01 · 🟢 RATIFIED · `metadataBase` is the single origin source
`src/app/layout.tsx:15` sets `metadataBase: new URL(SITE_URL)`, where `SITE_URL` derives from `NEXT_PUBLIC_SITE_URL` via `lib/site-url.ts`. All canonical URLs resolve against it. **Keep.** This is correct and must survive the D-CAN-02 change.

### D-CAN-02 · 🔴 OPEN → 🟡 PROPOSED · Remove the inherited root canonical
**Current production behaviour (defect):** `src/app/layout.tsx:24` sets `alternates: { canonical: '/' }`. Next.js App Router inherits `alternates.canonical` to every page that does not override it, so 87 static public routes — **16 of them sitemap-submitted and individually live-verified** — emit `<link rel="canonical" href="https://www.vyaparsethu.com">`, declaring themselves duplicates of the homepage.

**Proposed decision:** remove `alternates` from the root layout entirely. Each page supplies its own canonical via the metadata factory; the homepage supplies its own explicitly.

**Rejected alternative — keep the layout canonical and override per page.** This inverts the failure mode: a forgotten override silently de-indexes a page, and the failure is invisible. With no inherited value, a forgotten canonical means Google self-canonicalizes by default — degraded, but not destructive.

**Consequence accepted:** between Sprint 1 T1 and Sprint 3 T2 completing, affected routes emit no canonical. This is knowingly accepted as strictly better than a wrong canonical.

**Blocks:** Sprint 1 T1 · Sprint 3 (all)
**Backlog:** `SEO-P0-01`

### D-CAN-03 · 🟡 PROPOSED · Canonical is structurally mandatory
The metadata factory (`src/lib/seo/metadata-factory.ts`, Sprint 3 T1) makes `canonical` a **required, non-optional** parameter, so a page cannot be created without one. Type-level enforcement, not convention.

### D-CAN-04 · 🟡 PROPOSED · `og:url` is derived from canonical, never set independently
`og:url` is computed *from* the canonical inside the factory. This structurally prevents the measured `SEO-P1-03` defect, where `/categories/textiles` emits a correct self-canonical alongside `og:url` pointing at the homepage.

### D-CAN-05 · 🟢 RATIFIED · Intentional cross-canonical dedupe is permitted and in use
`/categories/batteries` canonicalizes to `/categories/ev-batteries`. Verified working as designed. Cross-canonicals are legitimate for slug aliases and duplicate categories, but **every instance must be recorded here** so validation does not flag it as a defect.

**Recorded cross-canonicals:**

| Source | Target | Reason |
|---|---|---|
| `/categories/batteries` | `/categories/ev-batteries` | Slug alias dedupe |

### D-CAN-06 · 🟡 PROPOSED · One resolver for canonical, sitemap, and breadcrumb
Canonical values, sitemap membership, and `BreadcrumbList` URLs must all derive from the **same** slug resolver. Commits `aa28e72`, `75c440a`, `7760306`, and `c13466b` were four consecutive fixes for divergent slug logic; adding a fourth independent path would guarantee a fifth.

---

## 2. Robots strategy

### D-ROB-01 · 🟢 RATIFIED · `src/app/robots.ts` is the sole generator
Next.js Metadata API, building as a static `○` route. No `public/robots.txt` exists — verified. Eight `robots.*` files under `_archive/` are dead (outside `src/app`, never compiled). `src/scripts/generate-global-sitemaps.ts` writes `robots-{cc}.txt`, not `robots.txt`, and is not in any pipeline.

### D-ROB-02 · 🟢 RATIFIED · Never block rendering resources
**Shipped 2026-07-30, commit `c937ae8`.** `Disallow: /_next` — written without a trailing slash, prefix-matching the entire build output — is removed. All 17 rendering assets plus `/_next/image` verified returning 200 to Googlebot.

**Standing rule:** no rule may be added to `robots.txt` that matches `/_next`, `/static`, or any path serving CSS, JavaScript, fonts, or images. Enforced by CI invariant **I1** (Sprint 12), which greps the **whole repository**, not just `src/app/robots.ts`.

### D-ROB-03 · 🟢 RATIFIED · Security prefixes stay disallowed
Retained: `/api/`, `/admin/`, `/dashboard/`, `/supplier/dashboard`, `/supplier/profile/edit`, `/settings`, `/profile`, `/api/auth`, `/api/private`.

**Rationale:** none serves rendering resources — verified, zero `src`/`href` references to any of these prefixes in rendered HTML. All are independently enforced server-side by `src/middleware.ts`. **`robots.txt` is not, and never was, the access-control mechanism for these paths** — it is a crawl directive only.

`/api/auth` and `/api/private` are redundant under `/api/` but harmless; retained for explicitness.

### D-ROB-04 · 🟡 PROPOSED · Robots changes are additive-only
`src/app/robots.ts` is a known blast radius — a one-line edit cost 1,240 audit issues and an unknown period of unstyled, script-less rendering by Google. Future changes may **add** `Allow` rules or per-bot groups. Any new `Disallow` requires explicit review against D-ROB-02 and must pass invariant I1.

---

## 3. Sitemap strategy

### D-SIT-01 · 🟢 RATIFIED · `src/app/sitemap.ts` is the sole generator
Declared in `robots.txt` as `Sitemap: ${SITE_URL}/sitemap.xml`. Currently 684 URLs, 124,260 bytes, valid `urlset`, fresh `lastmod`, `application/xml`.

### D-SIT-02 · 🟡 PROPOSED · Convert to a static sitemap index
**Current:** `sitemap.ts:8-9` sets `dynamic = 'force-dynamic'` and `revalidate = 3600`; the build marks it `ƒ`, so every crawler fetch is a serverless render of a 124 KB document.

**Proposed:** a statically-generated `<sitemapindex>` with per-namespace children — static, categories, suppliers, city×category, blog, glossary, location, clusters.

**Rationale:** per-template indexation diagnostics in GSC (currently impossible), no per-request render cost, and headroom for Sprint 4/6 growth. Children must build `○`/`●`, not `ƒ`, or the problem is distributed rather than solved.

**Backlog:** `SEO-P1-05`

### D-SIT-03 · 🟡 PROPOSED · Only 200-status, self-canonical, indexable URLs may be listed
**Measured violation:** `/rfq/create` is listed but returns **307** — it is a `PROTECTED_USER_PATH` in `src/middleware.ts:82`.

**Rule:** a URL enters the sitemap only if it returns 200, self-canonicalizes, and is indexable under the D-IDX policy. Sitemap membership must derive from the same protected-path lists that `src/middleware.ts` uses, imported rather than duplicated.

**Hazard:** those lists use `startsWith`. A careless match would drop the public `/suppliers/*` directory — an incident already documented at `src/middleware.ts:90-94`. Public namespaces must be explicitly asserted as retained.

**Backlog:** `SEO-P0-03`

### D-SIT-04 · 🟡 PROPOSED · Programmatic URLs require a coverage gate
No city×category, cluster, or product page enters the sitemap unless it passes a minimum verified-supplier threshold. Below-threshold pages render a genuine "Reserve your category" state, are `noindex`, and are sitemap-excluded — **never a zero metric** (see D-POL-01).

**Threshold value: 🔴 OPEN.** Requires a Founder decision informed by actual supplier density.

**Backlog:** `SEO-P2-05`

---

## 4. Metadata strategy

### D-MET-01 · 🟡 PROPOSED · One factory, no hand-rolled metadata
`src/lib/seo/metadata-factory.ts` becomes the only sanctioned constructor of page metadata.

**Precondition:** three SEO libraries already exist — `src/lib/seo-manager.ts`, `src/lib/seo/supplier-metadata.ts`, `src/lib/supplier-seo.ts`. The factory must **fold in or delegate to** these, never become a fourth parallel path. Audit before writing.

**Backlog:** `SEO-P0-04`

### D-MET-02 · 🟡 PROPOSED · Every indexable route exports its own metadata
**Measured:** 83 of 125 public page templates have no `metadata` export; only 29 of 125 set a canonical. Those 83 inherit the root layout's title, description, canonical, and OpenGraph wholesale.

**Rule:** every indexable public route exports `metadata` or `generateMetadata` with a unique title, a unique description, a self-canonical, and page-specific OpenGraph.

### D-MET-03 · 🟡 PROPOSED · Explicit title-template rule
**Measured defect:** `/cookies` renders `Cookie Policy | VyaparSethu | VyaparSethu` — the layout template applied on top of a title already containing the brand.

**Rule:** pages supply a bare title and let the layout template append the brand, **or** use `title: { absolute: … }` and own the full string. Never both. `/industrial-cluster` already demonstrates the `absolute` pattern correctly. Enforced in the factory, not by convention.

**Backlog:** `SEO-P1-04`

### D-MET-04 · 🟡 PROPOSED · Word System enforced at build time
The factory rejects banned vocabulary in `title` and `description`: RFQ → Quotation/Requirement · Voice RFQ → Speak Requirement · Video RFQ → Video Requirement · Text RFQ → Text Requirement · Escrow → Protected Payment · Vendor → Verified Supplier · Wallet → Trade Account · Procurement → Business Operations · Marketplace → Trade Network · Chat → Business Conversations · **Parcha → never**.

Applies equally to structured-data `name` and `description` values.

**Measured violation:** `/voice-rfq` renders `"Voice RFQ — Speak Your Requirement"`.

**Backlog:** `SEO-P2-06`

### D-MET-05 · 🔴 OPEN · Do Word System rules apply to URL slugs?
Compliance for *copy* (titles, descriptions, H1s, JSON-LD) is low-risk and recommended. Compliance for *URL slugs* — `/voice-rfq` → `/speak-requirement`, `/blog/how-to-write-effective-rfq` — requires 301s, internal-link updates, and temporary ranking volatility.

**Recommendation: copy only; defer slugs.** The Word System governs what users read; URLs are infrastructure carrying indexed equity. Revisit once pages have earned meaningful authority, if at all.

**Founder decision required. Blocks:** Sprint 3 T5b.

---

## 5. Indexation policy

### D-IDX-01 · 🟡 PROPOSED · Default-deny classification
Every public route class is explicitly classified **indexable** or **`noindex`**. A route class with no classification defaults to `noindex`. Enforced in `src/lib/seo/indexation-policy.ts`; consumed by both the metadata factory and `sitemap.ts`.

**Constraint:** indexation is a **metadata** concern. Per `CLAUDE.md`, this work must **not** add role-based access checks to API routes — the dashboard architecture is frozen.

### D-IDX-02 · 🟡 PROPOSED · Route-class classification

| Class | Policy | Rationale |
|---|---|---|
| Homepage, marketing, informational | **Indexable** | Primary organic surface |
| `/categories/*`, `/suppliers/*`, `/location/*`, `/industrial-cluster/*`, `/blog/*`, `/glossary/*`, `/tools/*` | **Indexable** | Core organic value |
| `/suppliers/[city]/[category]` and programmatic | **Indexable above the coverage gate only** | D-SIT-04 |
| Supplier profiles | **Indexable above a completeness threshold** | 🔴 threshold OPEN — see D-IDX-03 |
| `/rfq/[id]` (open requirements) | **Indexable** | 🔴 lifecycle OPEN — see D-IDX-04 |
| `/rfq/[id]` (closed/expired) | **`noindex` or 410** | 🔴 OPEN |
| Auth, login, register, onboarding | **`noindex`** | No organic value; auth-gated |
| Tokenised — `[token]`, `[dealId]`, `/claim/*`, `/quote/*`, `/review/*` | **`noindex`, always** | Indexing would expose token-bearing URLs |
| Checkout, messages, notifications, profile, orders | **`noindex`** | Private, transactional |
| `/admin/*`, `/dashboard/*` | **`noindex`** + robots-disallowed + middleware-gated | Defence in depth |
| Search results | **`noindex`** | Infinite-space crawl trap |
| `/downloads/b2b-glossary` | **`noindex`** | Already intentional (`page.tsx:7`) — verified correct |

### D-IDX-03 · 🔴 OPEN · Supplier profile indexability threshold
`src/lib/supplier-seo.ts:67` currently reads:

```ts
robots: user.isVerified || user.gstNumber ? { index: true, follow: true } : { index: true, follow: true },
```

Both branches are identical — the verification check has **no effect**. Either the intent was to `noindex` thin/unverified profiles and the implementation is incomplete, or the check is vestigial.

Indexing thin supplier profiles at scale is the classic B2B-marketplace quality failure and risks site-wide demotion.

**Founder decision required:** what completeness or verification level makes a profile indexable? **Blocks:** Sprint 8.
**Backlog:** `SEO-P2-03`

### D-IDX-04 · 🔴 OPEN · Quotation page lifecycle
16 `/rfq/*` URLs are in the sitemap; 15 return 200. There is no policy for what happens when a quotation closes or expires. Stale requirement pages accumulating in the index degrade quality and give a poor SERP-to-page experience.

`/api/cron/expire-rfqs` already exists and could drive this state.

**Founder decision required:** on close/expiry, do pages become `noindex`, return 410, or redirect to the parent category? **Blocks:** Sprint 8.
**Backlog:** `SEO-P2-04`

### D-IDX-05 · 🔴 OPEN · Supplier landing-page consolidation
Nine templates target overlapping supplier-discovery intent: `/suppliers` · `/supplier` · `/suppliers-verified` · `/suppliers-exporters` · `/suppliers/manufacturers` · `/services/verified-suppliers` · `/services/featured-suppliers` · `/founding-suppliers` · `/learn/how-to-find-verified-b2b-suppliers-india`.

**Founder decision required:** which URL owns each intent; which are 301'd away; which are genuinely differentiated. **Blocks:** Sprint 8.
**Backlog:** `SEO-P2-01`

---

## 6. Rate limiting policy

### D-RAT-01 · 🟢 RATIFIED · Static assets are exempt from rate limiting
`src/middleware.ts:139` — `pathname.startsWith('/_next') || pathname.includes('.')` bypasses the limiter. Verified: assets returned 200 while HTML was being 429'd. **Keep.** Rendering resources must never be throttled.

### D-RAT-02 · 🟢 RATIFIED · OTP endpoints carry a tighter, separate limit
5 requests / 10 minutes per IP on `/api/auth/send-otp`, `/api/auth/otp/send`, `/api/auth/verify-otp`, `/api/auth/otp/verify`. **This is a cost control** — MSG91 charges per SMS. **Must not be relaxed** as part of any SEO work.

### D-RAT-03 · 🔴 OPEN → 🟡 PROPOSED · Exempt verified crawlers from the global limit
**Measured defect:** `MAX_REQUESTS = 100` per 15 minutes per IP applies to HTML. A 295-URL crawl produced **198 × HTTP 429**.

The limiter is a per-instance `Map`, so it resets on cold start — behaviour is **non-deterministic**. A retry moments later returned 200 from a different `X-Vercel-Id`.

**Epistemic note:** it is *proven* the limiter 429s a fast crawler. It is *inferred*, not proven, that this throttled the actual Semrush crawl (consistent with the audit reaching ~88 pages).

**Options:**

| Option | Trade-off |
|---|---|
| **A — UA allowlist** *(recommended now)* | Simplest. UA strings are spoofable; pair with a ceiling, or reverse-DNS verify Googlebot |
| **B — Raise the HTML limit** | Blunt; weakens abuse protection for all traffic |
| **C — Durable keyed limiting via Upstash Redis** *(recommended long-term)* | Correct; already anticipated in the code comments at L9-10; required anyway for Sprint 10 |

**Mandatory constraint:** ship as an **isolated commit**. `src/middleware.ts` carries domain redirect, forbidden paths, OTP limiting, admin gating, protected-route gating, CSP, and security headers in one file. Do not touch auth or CSP in the same change.

**Founder input needed on:** which non-Google crawlers are exempt (interacts with D-AI-02).
**Backlog:** `SEO-P0-02`

---

## 7. AI crawler policy

### D-AI-01 · 🟢 RATIFIED · `llms.txt` is served and reachable
`public/llms.txt` returns 200 `text/plain` and is explicitly `Allow`ed in `robots.txt`. Foundation exists.

### D-AI-02 · 🔴 OPEN · Per-bot policy for AI crawlers
`robots.txt` currently has a single `User-Agent: *` group. Every AI crawler is treated identically to Googlebot — and, until 2026-07-30, every one of them was also blocked from all CSS and JavaScript.

**Founder decision required for each:**

| Crawler | Operator | What allowing it means |
|---|---|---|
| `GPTBot` | OpenAI | Training corpus inclusion |
| `OAI-SearchBot` | OpenAI | ChatGPT search citation |
| `ClaudeBot` | Anthropic | Training / retrieval |
| `PerplexityBot` | Perplexity | Answer citation |
| `Google-Extended` | Google | Gemini training; **does not affect Google Search ranking** |
| `CCBot` | Common Crawl | Broad downstream corpus reuse |
| `Bytespider` | ByteDance | Training |

**The core trade-off:** blocking training crawlers protects content from corpus absorption but may reduce the likelihood of being cited as a source. For a marketplace whose strategic wedge is being *the* authority on Indian B2B sourcing, citation visibility is plausibly worth more than corpus exclusivity — but that is a Founder call, not an engineering default.

**Recommendation for discussion, not a decision:** allow citation-oriented crawlers (`OAI-SearchBot`, `PerplexityBot`), decide training crawlers (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`) deliberately, and note that `Google-Extended` has no bearing on classic Search ranking.

**Constraint:** any per-bot group must be **additive** (D-ROB-04). No new `Disallow` may match a rendering resource.

**Blocks:** Sprint 7. **Interacts with:** D-RAT-03 (exempted crawlers).

### D-AI-03 · 🟡 PROPOSED · `llms.txt` becomes a real knowledge surface
Expand beyond a stub into a structured description of what VyaparSethu is, how Protected Payment works, the Trade Confidence Score™ methodology, and an index of categories and clusters. Consider `llms-full.txt` / OKF-style knowledge bundles.

**Rationale:** original primary data earns citations; marketing copy does not.

### D-AI-04 · 🟡 PROPOSED · No content gating against AI without a business reason
Content available to Googlebot is available to allowed AI crawlers. Cloaking — serving different content by user-agent — is prohibited: it violates Google's guidelines and risks a manual action. Access is controlled through `robots.txt` groups only, never through response-content differences.

---

## 8. Domain strategy

### D-DOM-01 · 🔴 OPEN · Ratify or revert the live domain migration
**Production and documentation currently contradict each other.**

| Source | State |
|---|---|
| Production (measured) | `https://www.bell24h.com` → **301** → `https://www.vyaparsethu.com`, 1 hop. `REDIRECT_BELL24H_TO_VYAPARSETHU=true` |
| `vercel.json` | `NEXT_PUBLIC_SITE_URL: https://www.vyaparsethu.com` |
| `lib/site-url.ts` | Default `https://www.bell24h.com` |
| `CLAUDE.md` | *"bell24h.com stays primary until 50+ verified suppliers onboarded; vyaparsethu.com becomes primary only at Phase 2 (30–60 days out)"* |

There is no indication a **GSC Change of Address** has been filed. An unmanaged domain migration bleeds accumulated authority for as long as it goes unaddressed.

**Founder decision required.** Two coherent paths:

**Ratify** — accept the cutover; verify both GSC properties; file Change of Address; submit the new sitemap; commit to 301s for ≥ 12 months; update `CLAUDE.md`; reconcile the `lib/site-url.ts` default.

**Revert** — unset `REDIRECT_BELL24H_TO_VYAPARSETHU`; reconcile `NEXT_PUBLIC_SITE_URL`; keep bell24h.com primary until the supplier threshold, exactly as `CLAUDE.md` specifies.

**Reversibility asymmetry:** the redirect is a single env toggle. A filed Change of Address is **not** cleanly reversible. File it only after the decision is final.

**Blocks:** Sprint 1 T7, T5. **Backlog:** `SEO-P3-03`

### D-DOM-02 · 🟡 PROPOSED · One hop maximum from every host/protocol form
**Measured:** `http://vyaparsethu.com` takes **2 hops**; the other three forms take 1.

**Rule:** every host/protocol combination reaches the canonical origin in ≤ 1 hop. Platform configuration only — no application code.
**Backlog:** `SEO-P2-07`

### D-DOM-03 · 🟢 RATIFIED · "Formerly Bell24h" footer note during transition
Required by `CLAUDE.md` for the transition period. Retain regardless of the D-DOM-01 outcome, until the migration is complete and settled.

---

## 9. Cross-cutting engineering constraints

### D-ENG-01 · 🟢 RATIFIED · No fabricated data in markup or copy
No `AggregateRating`, `review`, `reviewCount`, `ratingValue`, `offerCount`, or any aggregate numeric claim unless backed by real, verifiable database records. Where real data is absent, **omit the property** — never emit a zero or placeholder.

Derives from `CLAUDE.md` (*no public zeros*, *no fake suppliers*) and Google's structured-data policies. Fabricated markup risks a manual action, which is materially worse than having no rich results.

### D-ENG-02 · 🟢 RATIFIED · Middleware changes ship in isolation
`src/middleware.ts` carries domain redirect, forbidden-path blocking, OTP limiting, global limiting, admin gating, protected-route gating, CSP, and security headers in a single file. One concern per commit; verify on a preview deployment before production.

### D-ENG-03 · 🟢 RATIFIED · SEO work never touches schema, API routes, or access control
No `prisma/schema.prisma` migrations. No API route behaviour changes. No role-based access checks added to API routes — the dashboard architecture is frozen and role is a display preference, not an access gate. Indexation is a metadata concern.

### D-ENG-04 · 🟡 PROPOSED · Four CI invariants guard the program
Both P0 defects in this program are one-line configuration errors that neither `npm run build` nor `npm run lint` would catch — and `next.config.js` sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`, so the build catches even less than it appears to.

| ID | Invariant |
|---|---|
| **I1** | `robots.txt` output contains no rule matching `/_next`, `/static`, or any rendering-resource path — repo-wide grep, not just `src/app/robots.ts` |
| **I2** | Every sitemap URL returns 200 and self-canonicalizes (except recorded D-CAN-05 dedupes) |
| **I3** | No duplicate `<title>` or meta description across indexable routes |
| **I4** | `og:url === rel=canonical` on every indexable route |

**Backlog:** `SEO-P3-04` · **Sprint 12, scheduled in Wave 1 alongside Sprint 1 — not last.**

### D-ENG-05 · 🔴 OPEN · Confirm the real Vercel function ceiling
`CLAUDE.md` states a hard limit of 12 serverless functions (Hobby tier). The repository contains **201** `src/app/api/**/route.ts` files, and deployment `bell24h-339udlwh9` completed successfully with no ceiling error.

The documented constraint is very likely stale — but it is **actively distorting architecture decisions** across Sprints 7, 9, 10, and 11, all of which currently defer to it.

**Founder action:** confirm the actual plan and limit from the Vercel dashboard, then update or remove the constraint in `CLAUDE.md`.
**Backlog:** `SEO-P3-02`

---

## Open decisions summary

| ID | Decision | Blocks | Owner |
|---|---|---|---|
| **D-DOM-01** | Ratify or revert the live domain migration | **Sprint 1 T7, T5** | Founder |
| **D-AI-02** | Per-bot AI crawler policy | **Sprint 7**, D-RAT-03 | Founder |
| **D-MET-05** | Do Word System rules apply to URL slugs? | Sprint 3 T5b | Founder |
| **D-IDX-03** | Supplier profile indexability threshold | Sprint 8 | Founder |
| **D-IDX-04** | Quotation page lifecycle on close/expiry | Sprint 8 | Founder |
| **D-IDX-05** | Supplier landing-page consolidation | Sprint 8 | Founder |
| **D-SIT-04** | Programmatic coverage-gate threshold | Sprint 4 | Founder |
| **D-ENG-05** | Real Vercel function ceiling | Sprints 7, 9, 10, 11 | Founder |
| **D-RAT-03** | Which non-Google crawlers are exempt from rate limiting | Sprint 1 T2 | Founder |

**The two blocking Sprint 1 are D-DOM-01 and D-RAT-03.** Everything else in Sprint 1 (T1, T3, T4, T6) can proceed without a decision.

---

## Change log

| Date | Entry | Author |
|---|---|---|
| 2026-07-30 | D-ROB-02 ratified — `/_next` removed from robots.txt, shipped `c937ae8`, production-verified | Claude Opus 5 |
| 2026-07-31 | Document created. 9 RATIFIED, 16 PROPOSED, 9 OPEN. | Claude Opus 5 |
