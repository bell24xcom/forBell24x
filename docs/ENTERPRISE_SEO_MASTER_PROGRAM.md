# Enterprise SEO Master Program — VyaparSethu

**Status:** Active
**Owner:** Founder (digitex.studio@gmail.com)
**Created:** 2026-07-30
**Last validated against production:** 2026-07-30, deployment `bell24h-339udlwh9`, commit `c937ae8`
**Companion documents:** [ENTERPRISE_SEO_BACKLOG.md](ENTERPRISE_SEO_BACKLOG.md) · [SEO_DECISIONS.md](SEO_DECISIONS.md) · [SEO_TESTING_CHECKLIST.md](SEO_TESTING_CHECKLIST.md) · [SPRINT_01_TECHNICAL_SEO.md](SPRINT_01_TECHNICAL_SEO.md) · [SPRINT_02_STRUCTURED_DATA.md](SPRINT_02_STRUCTURED_DATA.md) · [SPRINT_03_INDEXATION.md](SPRINT_03_INDEXATION.md)

---

## 1. Executive Summary

On 2026-07-30 a Semrush Site Audit reported **1,240 issues** under *Blocked internal resources in robots.txt*. Investigation traced 100% of that count to a **single line** in `src/app/robots.ts`:

```ts
disallow: [ ..., '/_next', ... ]
```

Written without a trailing slash, `/_next` prefix-matched the entire Next.js build output. Every JavaScript chunk, every stylesheet, every font subset, and every `/_next/image` request was refused to crawlers. **Googlebot had been rendering VyaparSethu with no CSS and no JavaScript.**

The fix — deleting one line — was committed as `c937ae8`, pushed, deployed to production, and validated. All 17 rendering assets now return HTTP 200 to Googlebot with correct content types and `immutable` caching.

A full production validation and repository audit followed. It found the site to be in **substantially better technical health than expected** in most respects — brotli everywhere, immutable asset caching, hard 404s, zero mixed content, single-hop host normalization, and unexpectedly extensive structured data already shipping (Organization, WebSite, SearchAction, LocalBusiness, FAQPage, Article, BreadcrumbList, DefinedTerm, SpeakableSpecification).

It also found **two remaining P0 defects** that were previously masked by the robots block:

1. **Root-layout canonical inheritance** — `src/app/layout.tsx:24` sets `alternates: { canonical: '/' }`, which Next.js inherits to every page that does not override it. 16 sitemap-submitted URLs were live-verified emitting a **homepage canonical**, telling Google they are duplicates of the homepage.
2. **Middleware rate limiter throttles crawlers** — `src/middleware.ts` caps HTML requests at 100 per 15 minutes per IP. A crawl of 295 URLs produced **198 × HTTP 429**.

This program organizes all remaining work into **12 sprints** across priority bands **P0–P4**, with the explicit finding that the binding constraint on half of them is **verified supplier count**, not engineering capacity.

### The single most important lesson

Both P0 defects — the one fixed and the one found — are **one-line configuration errors in metadata files** that no test would have caught. Sprint 12 (Continuous Monitoring) exists to make that impossible again, and is scheduled to run **in parallel with Sprint 1, not last**.

---

## 2. Current Health

All figures below are measured, not estimated. Method is stated for each.

### 2.1 Healthy — no action required

| Area | Evidence |
|---|---|
| `robots.txt` | 200 `text/plain`, 291 B, `/_next` absent, zero invalid directives |
| Asset crawlability | 16/16 JS chunks + 1/1 CSS + `/_next/image` probe = **200 to Googlebot UA** |
| Asset caching | `public, max-age=31536000, immutable`, `X-Vercel-Cache: HIT` |
| Compression | Brotli on all HTML, CSS, JS, XML |
| 404 handling | Bogus page and bogus category both return hard **404** (no soft-404) |
| Mixed content | Zero `http://` references in any `src` / `href` |
| Host normalization | `https://vyaparsethu.com` → 1 hop · `http://www.vyaparsethu.com` → 1 hop · `www.bell24h.com` → 1 hop · trailing slash → 308 |
| `X-Robots-Tag` | **None** on any of 21 probed URLs — no header-level suppression |
| Meta robots | `index, follow` on 86/86 reachable sampled URLs |
| Structured data (non-category templates) | 6–12 JSON-LD blocks per page: Organization, WebSite, SearchAction, LocalBusiness, ContactPoint, PostalAddress, GeoCoordinates, FAQPage, Article, BreadcrumbList, ImageObject, DefinedTerm, DefinedTermSet, SpeakableSpecification |
| Canonical (dynamic templates) | 83/87 sampled sitemap URLs self-canonical |
| Intentional cross-canonical | `/categories/batteries` → `/categories/ev-batteries` — correct dedupe, working as designed |
| Sitemap validity | 200 `application/xml`, valid `urlset`, 684 `<loc>`, fresh `lastmod` |

### 2.2 Defective

| Severity | Finding | Measured impact |
|---|---|---|
| **P0** | Root-layout canonical inheritance | 87 static public routes affected; **16 in sitemap, 16/16 live-confirmed** emitting homepage canonical |
| **P0** | Middleware rate limiter 429s crawlers | **198 of 295** requests returned 429 |
| **P0** | Auth-gated URL in sitemap | `/rfq/create` = 307, submitted for indexing |
| **P0** | Metadata coverage | **83 of 125** public pages have no `metadata` export; only **29 of 125** set a canonical |
| **P1** | `/categories*` dynamic despite `revalidate = 300` | 454 of 684 sitemap URLs (66%) serve `private, no-cache, no-store` |
| **P1** | Category pages lack page-level schema | No BreadcrumbList / ItemList / Product on 66% of sitemap |
| **P1** | OpenGraph not overridden per template | `og:url` = homepage on category pages, conflicting with correct canonical |
| **P1** | Sitemap is a single flat `force-dynamic` file | 124 KB, 684 URLs, regenerated per request |
| **P1** | No webfonts loaded | 0 `@font-face`; Inter declared, never fetched; Poppins and Devanagari absent |
| **P1** | `next/image` unused | Optimizer enabled, 0 `/_next/image` requests across 4 templates |
| **P2** | Supplier landing-page cannibalization | 9+ overlapping templates |
| **P2** | No `hreflang` | Zero alternate links |
| **P3** | Dead robots template | `generate-global-sitemaps.ts:324` still contains `Disallow: /_next/` |

### 2.3 Repository scale

| Metric | Value |
|---|---|
| Tracked files | 8,972 |
| `src/` files | 1,003 |
| `src/app/**/page.tsx` | 225 |
| Public page templates (excl. admin/dashboard/auth/supplier-account) | 125 |
| `src/app/api/**/route.ts` | **201** |
| Static pages generated at build | 375 |
| Sitemap URLs | 684 |
| Shared First Load JS | 87.6 kB |
| Middleware bundle | 27.9 kB |

> **Note on the function ceiling.** `CLAUDE.md` states a hard limit of 12 Vercel serverless functions (Hobby tier). **201 API routes deployed successfully with no ceiling error.** That constraint appears stale and is currently distorting architecture decisions across this program. Confirming the actual plan is a Sprint 11 task and should be pulled forward if it blocks any earlier sprint. See `SEO-P3-02` in the backlog.

---

## 3. Completed Work

### 3.1 The robots.txt fix

| Field | Value |
|---|---|
| Commit | `c937ae8` (parent `c13466b`) |
| Branch | `main` |
| Message | `fix(seo): stop blocking Next.js assets in robots.txt` |
| Diff | `src/app/robots.ts` — 1 file changed, 1 deletion |
| Push | `c13466b..c937ae8  main -> main` |
| Deployment | `bell24h-339udlwh9-bell24xs-projects.vercel.app`, Production, **● Ready**, 3m build |
| Build-log commit confirmation | `Cloning github.com/bell24xcom/forBell24x (Branch: main, Commit: c937ae8)` |

```diff
--- a/src/app/robots.ts
+++ b/src/app/robots.ts
@@ -15,7 +15,6 @@ export default function robots(): MetadataRoute.Robots {
            '/supplier/profile/edit',
            '/settings',
            '/profile',
-          '/_next',
            '/api/auth',
            '/api/private',
          ],
```

Deliberately **excluded** from the commit: `.claude/settings.local.json` (local Claude Code permission allowlist) and untracked `.kilo/`. Both remain uncommitted.

### 3.2 Root cause analysis

`Disallow: /_next` without a trailing slash is a prefix match on `/_next*`, blocking:

- `/_next/static/chunks/*` — 16 JS bundles per page
- `/_next/static/css/*` — 1 stylesheet
- `/_next/static/media/*` — font subsets (currently none exist)
- `/_next/image?url=…` — the image optimizer (`next.config.js` sets `images.unoptimized: false`)
- `/_next/data/*` — client navigation payloads

**Arithmetic reconciliation:** 14 unique blocked `/_next/` resources per page × ~88 crawled pages ≈ **1,232**, against the reported **1,240**. Essentially the entire issue count was this one line. The ~88-page figure is consistent with a ~100-page audit crawl limit — meaning if the audit page limit is raised, the *pre-fix* count would have been far higher.

### 3.3 What was ruled out

Investigated and confirmed **not** contributing:

- `public/robots.txt` — does not exist, no static override
- `src/middleware.ts` matcher — already excludes `_next/static` and `_next/image`; rate limiter already exempts `/_next` and any path containing `.`
- `next.config.js` `headers()` — security headers only, no `X-Robots-Tag`
- `vercel.json` headers / redirects / rewrites — no asset obstruction; `/_next/static/*` immutable caching is correct
- CSP in `src/middleware.ts` — permits `'self'` for script, style, img, font, media
- 8 dead `robots.*` files under `_archive/` — outside `src/app`, never compiled
- `src/scripts/generate-global-sitemaps.ts` — writes `robots-{cc}.txt`, not `robots.txt`; not in `package.json` scripts nor the Vercel `buildCommand`

---

## 4. Production Validation

Full method and results: this section is the authoritative record. All probes executed 2026-07-30 against `https://www.vyaparsethu.com` post-deployment.

### 4.1 Endpoint validation

| Target | Status | Encoding | Canonical | Meta robots |
|---|---|---|---|---|
| `/robots.txt` | 200 `text/plain` | — | n/a | n/a |
| `/sitemap.xml` | 200 `application/xml` | br | n/a | n/a |
| `/` | 200 | br | ✅ self | `index, follow` |
| `/marketplace` | 200 | br | ✅ self | `index, follow` |
| `/suppliers` | 200 | br | ❌ homepage | `index, follow` |
| `/suppliers/kalamboli` | 200 | br | ✅ self | `index, follow` |
| `/categories` | 200 | br | ✅ self | `index, follow` |
| `/categories/steel-metal` | 200 | br | ✅ self | `index, follow` |
| `/blog`, `/blog/[slug]` | 200 | br | ✅ self | `index, follow` |
| `/glossary`, `/glossary/msme` | 200 | br | ✅ self | `index, follow` |
| `/industrial-cluster` | 200 | br | ❌ homepage | `index, follow` |
| `/industrial-cluster/[slug]` | 200 | br | ✅ self | `index, follow` |
| `/location`, `/location/kalamboli` | 200 | br | ✅ self | `index, follow` |
| `/tools` + 3 calculators | 200 | br | ❌ homepage | `index, follow` |
| `/pricing`, `/about`, `/contact`, `/help` | 200 | br | ❌ homepage | `index, follow` |
| `/faq` | 200 | br | ✅ self | `index, follow` |

### 4.2 Rendering asset validation (Googlebot UA)

| Asset class | Count | Result |
|---|---|---|
| `/_next/static/chunks/*.js` | 16 | **200** `application/javascript; charset=utf-8`, `immutable`, CDN HIT |
| `/_next/static/css/*.css` | 1 | **200** `text/css; charset=utf-8`, `immutable`, CDN HIT |
| `/_next/image?url=…&w=640&q=75` | probe | **200** `image/png` — reachable, currently unused by any public page |
| `/_next/static/media/*` | **0** | No webfonts exist to block |
| Public root assets | 7/7 | `/favicon.svg`, `/apple-touch-icon.png`, `/og-image.png`, `/brand-video.mp4`, `/manifest.json`, `/llms.txt`, `/grid.svg` all 200 |

**Verdict: 100% of rendering resources crawlable. Zero blocked.**

### 4.3 Google rendering readiness

| Resource class | Blocked? | Evidence |
|---|---|---|
| CSS | ✅ No | 1/1 → 200 as Googlebot |
| JavaScript | ✅ No | 16/16 → 200 as Googlebot |
| Fonts | ✅ No — none exist | 0 `@font-face` in the 123 KB CSS bundle; no `fonts.googleapis.com`/`gstatic.com` reference in HTML or CSS |
| Images | ✅ No | All public images 200; optimizer endpoint 200 |

**Google can now render pages correctly.**

### 4.4 Canonical scan (paced, 429-retried)

Sample of 87 sitemap URLs, serial with 2 s pacing and 3× retry on 429:

- **Status:** 86 × 200, 1 × 307 (`/rfq/create`)
- **Canonical:** 83 self · 2 homepage · 1 intentional cross-canonical · 1 missing (the 307)
- **Meta robots:** 86 × `index, follow`

Targeted follow-up on the 16 sitemap URLs whose templates lack canonical: **16/16 confirmed emitting `https://www.vyaparsethu.com`.**

> **Recorded correction.** An interim statement during this audit claimed "~96 of 125 public pages emit a homepage canonical." That was a repo-level template count presented as live impact. Corrected figure: **87 static public routes** carry the inherited canonical, of which **16 are sitemap-submitted**. The 684 sitemap URLs are overwhelmingly healthy. The defect is real and individually verified; its live blast radius is narrower than first stated.

### 4.5 Rate limiting

A 295-URL crawl at 10-way parallelism produced **198 × HTTP 429**. Source: `src/middleware.ts` — `MAX_REQUESTS = 100` per `RATE_LIMIT_WINDOW = 15 * 60 * 1000` per IP, applied to HTML (assets exempt via `pathname.startsWith('/_next') || pathname.includes('.')`).

The limiter is a per-instance `Map`, so it resets on serverless cold start — behaviour is **non-deterministic**. A retry moments later returned 200 from a different `X-Vercel-Id`.

**Epistemic boundary:** it is *proven* that the limiter 429s a fast crawler. It is *not proven* that this throttled the actual Semrush crawl. The behaviour is consistent with the audit reaching only ~88 pages, but that remains inference.

### 4.6 Semrush baseline predictions

Predictions, not measurements. Confidence stated.

| Metric | Baseline | Predicted | Confidence | Reasoning |
|---|---|---|---|---|
| Blocked internal resources | **1,240** | **0** | Very high | Directly measured: 0 blocked assets remain |
| Crawlability | Depressed | Improved, not fully clean | Medium | 429 limiter and 307-in-sitemap will still generate findings |
| Rendering / JS issues | Unreliable | Cleared for this class | High | Was measuring a page Google couldn't render |
| Site Health score | — | **+15 to +30** | Low-Medium | Direction certain, magnitude a guess — Semrush weighting is not modelled |
| Newly *surfacing* issues | Masked | ~16 duplicate-canonical, 1 redirect-in-sitemap, possible 429 warnings | Medium-High | Previously hidden behind the block |
| Pages crawled per audit | ~88 (inferred) | Unchanged until limiter addressed | Medium | Capped by limiter and plan page limit, not robots.txt |

**Expect the headline number to drop dramatically while a smaller set of previously-masked issues appears. That is healthy, not a regression.**

---

## 5. Remaining Work

Full detail in [ENTERPRISE_SEO_BACKLOG.md](ENTERPRISE_SEO_BACKLOG.md). Summary by priority:

| Priority | Definition | Count | Sprints |
|---|---|---|---|
| **P0** | Blocks indexation or crawling | 4 | 1, 3 |
| **P1** | Suppresses performance of indexed pages | 7 | 2, 3, 9 |
| **P2** | Structural quality and growth capacity | 7 | 1, 4, 6, 8 |
| **P3** | Hygiene, documentation correctness, observability | 4 | 1, 11, 12 |
| **P4** | Gated, long-horizon | 2 | 10 |

### The binding constraint

**Sprints 4, 5, 6, 8, and 10 are gated on verified supplier count, not engineering capacity.** They cannot deliver value below the Phase D threshold of 100 verified suppliers, because there is nothing real to put on the pages or expose through the API.

**Sprints 1, 2, 3, 7, 9, 11, and 12 deliver full value today**, independent of supplier count.

### If only two things are done

**Sprint 1** (canonical inheritance + crawler 429s) and **Sprint 12** (the four CI assertions). Together they are a handful of files and they permanently close both remaining P0s.

---

## 6. Engineering Principles

These are binding on all SEO work in this program.

### 6.1 Inherited from `CLAUDE.md` (non-negotiable)

1. **No public zeros.** Never render `0 RFQs`, `0%`, or an empty metric card on a public page. Directly constrains structured data (no `AggregateRating` without real reviews) and programmatic SEO (no zero-supplier pages).
2. **Word System applies to all user-facing copy *and* all structured-data `name`/`description` values.** Quotation / Requirement · Speak Requirement · Video Requirement · Text Requirement · Protected Payment · Verified Supplier · Trade Account · Business Operations · Trade Network · Business Conversations. Never "Parcha".
3. **Three Pillars test.** Every feature must serve Verified Matching, Protected Payment, or Faster Trade. If it serves none, push back before building.
4. **Rebrand is display-only.** No `prisma/schema.prisma` migrations, no API route changes, no auth/middleware/env changes as part of rebrand work.
5. **No role-based access checks in API routes.** The dashboard architecture is frozen; buyer/supplier is a display preference. Indexation policy is a *metadata* concern, never an access concern.
6. **Trust Score is computed by daily cron only** — never real-time.
7. **Never hold customer funds directly.** Razorpay + nodal partner only.
8. **Phase D gate.** No intelligence feature activates before 100 verified suppliers. `FLAGS.INTELLIGENCE_ENABLED` / `FLAGS.SHAP_ENABLED` gate the rest.

### 6.2 SEO-specific principles adopted by this program

9. **Truthful markup only.** No fabricated ratings, review counts, offer counts, or aggregate metrics in JSON-LD. Fabricated structured data is a manual-action risk and violates principle 1.
10. **One source of truth per signal.** Canonical, sitemap membership, and slug resolution must derive from the same resolver. The four commits preceding this program (`c13466b`, `7760306`, `75c440a`, `aa28e72`) were all fixing symptoms of divergent slug logic.
11. **Never ship programmatic pages ungated.** A page enters the indexable set only when real data supports it.
12. **Additive-only robots changes.** `src/app/robots.ts` is a known blast radius. No future edit may introduce a rule matching a rendering-resource path. Enforced by CI (Sprint 12).
13. **Metadata is not optional.** Every indexable route sets its own title, description, canonical, and OpenGraph. Enforced by CI.
14. **Isolate middleware commits.** `src/middleware.ts` carries auth, CSP, and rate limiting together. Change one concern per commit and verify on a preview deployment.
15. **Prove it in production.** No SEO fix is considered done until validated against the live origin with the checklist in [SEO_TESTING_CHECKLIST.md](SEO_TESTING_CHECKLIST.md).
16. **State the epistemic status of every claim.** Measured, inferred, or predicted — always labelled. This document follows that rule and so must its successors.

---

## 7. Architecture

### 7.1 SEO-relevant control points

| Concern | File | Notes |
|---|---|---|
| robots.txt | `src/app/robots.ts` | Next.js Metadata API → static `○` route. **Only** active generator |
| Sitemap | `src/app/sitemap.ts` | `export const dynamic = 'force-dynamic'`, `revalidate = 3600`. Builds ƒ. 684 URLs, flat |
| Site origin | `lib/site-url.ts` | `SITE_URL` from `NEXT_PUBLIC_SITE_URL`, default `https://www.bell24h.com`; `vercel.json` sets `https://www.vyaparsethu.com` |
| Root metadata | `src/app/layout.tsx` | `metadataBase` (L15), `alternates: { canonical: '/' }` (L24) ← **defect source**, `robots` (L47), `icons` (L58) |
| Per-page metadata | 42 of 125 public `page.tsx` | 29 set canonical |
| Middleware | `src/middleware.ts` | Domain redirect, forbidden paths, OTP + global rate limit, admin gate, protected-route gate, CSP + security headers, API cache hardening. Matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `public/` |
| Headers / redirects | `next.config.js`, `vercel.json` | Security headers; `/_next/static/*` immutable; `/home`→`/`, `/rfq/video`→`/video-rfq` |
| SEO libraries | `src/lib/seo-manager.ts`, `src/lib/seo/supplier-metadata.ts`, `src/lib/supplier-seo.ts`, `src/lib/seo-llm.ts` | `supplier-seo.ts:67` returns `index:true` on both ternary branches — see `SEO-P2-03` |
| Dormant / dead | `src/scripts/generate-global-sitemaps.ts`, `src/data/seo-dashboard.ts`, `src/data/seo-tool-gap-report.ts` | Script line 324 still contains `Disallow: /_next/` |
| AI surface | `public/llms.txt` | Live, 200 `text/plain` |

### 7.2 Rendering strategy (from build log, deployment `bell24h-339udlwh9`)

| Symbol | Meaning | Notable routes |
|---|---|---|
| `○` | Static | `/about`, `/blog`, `/faq`, `/glossary`, `/industrial-cluster`, `/location`, `/marketplace`, `/pricing`, `/suppliers`, `/tools/*`, `/robots.txt` |
| `●` | SSG (generateStaticParams) | `/blog/[slug]`, `/glossary/[term]`, `/industrial-cluster/[slug]`, `/location/[area]`, `/suppliers/[city]`, `/suppliers/[city]/[category]` |
| `ƒ` | Dynamic (per-request) | **`/categories`**, **`/categories/[category]`**, `/sitemap.xml`, Middleware (27.9 kB) |

`/categories*` declares `revalidate = 300` yet builds ƒ and serves `private, no-cache, no-store` — 66% of the sitemap. See `SEO-P1-01`.

### 7.3 Existing intelligence layer (catalog → engine → view)

Reusable inputs for Sprints 2, 4, 5, 6:

| Module | Catalog | Engine |
|---|---|---|
| Product Intelligence | `src/data/product-intelligence-catalog.ts` | `src/lib/product-intelligence/` |
| Industry Intelligence | `src/data/industry-intelligence-catalog.ts` | `src/lib/industry-intelligence/` |
| Industrial Clusters | `src/data/industrial-clusters.ts` | direct lookup |
| Geographic Intelligence | registry in-module | `src/lib/geographic-intelligence/hierarchy.ts` |
| BOM | event-sourced | `src/lib/bom/` (life-events, projections, genome-score, morning-brief, business-pulse, location) |
| Company DNA | — | `src/lib/company-dna/graph-builder.ts` (admin-only) |
| Knowledge Graph | — | `src/lib/knowledge-graph/builder.ts` (admin-only) |

`BusinessLifeEvent` is the source of truth; graphs are projections. Never write SEO state back into a graph.

### 7.4 Target architecture (post-program)

```
lib/site-url.ts ──────────► single origin
        │
        ▼
src/lib/seo/metadata-factory.ts ──► every page.tsx (title, desc, canonical, OG)
        │
        ├──► src/lib/schema/*  ──► JSON-LD builders (one per @type)
        │
        └──► slug resolver ──┬──► src/app/sitemap.ts (index + children)
                             ├──► canonical values
                             └──► coverage gate (programmatic pages)

src/app/robots.ts ──► additive only, CI-asserted
tests/seo/*       ──► asserts the four invariants (Sprint 12)
```

**Invariants the target architecture must guarantee:**

1. `robots.txt` never disallows a rendering-resource path.
2. Every sitemap URL returns 200 and self-canonicalizes.
3. Every indexable page has a unique title and description.
4. `og:url` equals `canonical` on every page.

---

## 8. Roadmap

Sprint numbering is stable. **Priority ≠ sprint number**; execution order is §8.2.

### 8.1 The twelve sprints

| # | Sprint | Priority | Gated on suppliers? | SEO gain | GEO gain | AI Search gain |
|---|---|---|---|---|---|---|
| 1 | Technical SEO | **P0** | No | High | Low | Medium |
| 2 | Structured Data | P1 | No | Med-High | Medium | **High** |
| 3 | Indexation | **P0/P1** | No | **High** | Low-Med | Medium |
| 4 | Programmatic SEO | P2 | **Yes** | Very High (later) | **High** | Medium |
| 5 | Knowledge Graph | P2 | **Yes** | Medium | Medium | **Very High** |
| 6 | GEO (Geographic/Local) | P2 | **Yes** | High | **Very High** | Medium |
| 7 | AI Search | P1 | No | Low-Med | Low | **Very High** |
| 8 | Marketplace SEO | P2 | **Yes** | **High** | Medium | Medium |
| 9 | Performance | P1 | No | Med-High | Medium | Low |
| 10 | Autonomous Commerce | P4 | **Yes** (hard) | None | None | High (indirect) |
| 11 | Enterprise Analytics | P3 | No | Indirect | Indirect | Indirect |
| 12 | Continuous Monitoring | P1 | No | **High (protective)** | Protective | Protective |

Detailed plans exist for Sprints 1–3. Sprints 4–12 are scoped in the backlog and expand into their own documents when approved.

### 8.2 Recommended execution order

| Wave | Sprints | Rationale |
|---|---|---|
| **1** | **1** ‖ **12** | Sprint 1 clears both remaining P0s. Sprint 12 has zero dependencies and prevents recurrence — running it first, not last, is the point. |
| **2** | **3**, then **2** | 3 depends on Sprint 1 removing the inherited canonical. 2 depends on 3's canonicals being correct. |
| **3** | **9** (after CWV re-baseline) ‖ **7** | Independent. Sprint 9's `/categories` ISR fix is the largest crawl-efficiency win available. |
| **4** | **4 + 6 as one program**, then **5**, then **8** | 4 and 6 must merge or they collide on URLs and cannibalize each other. |
| **5** | **11** | Needs clean data from 1 and 3. Pull its function-ceiling audit forward if it blocks an earlier sprint. |
| **Gated** | **10** | Hard-gated on Phase D, Pvt Ltd registration, nodal partner, legal sign-off. 6+ months out. |

### 8.3 Sequencing hazards

| Hazard | Mitigation |
|---|---|
| Sprint 3 before Sprint 1 F1 | Fighting inherited canonicals page by page. **Remove the layout canonical first.** |
| Sprint 4 and 6 run separately | URL collision and self-cannibalization. **Merge them.** |
| Sprint 9 before CWV re-baseline | Optimizing against data collected while Google saw no CSS/JS. **Wait 1–2 weeks post-fix.** |
| Sprint 12 scheduled last | The defect class recurs before the guard exists. **Run it in Wave 1.** |
| Any sprint constrained by the 12-function limit | Confirm the actual Vercel plan first (`SEO-P3-02`). |

### 8.4 Open decisions blocking Sprint 1

| # | Decision | Why it blocks | Owner |
|---|---|---|---|
| **D1** | **Domain posture** — ratify the live `bell24h.com → vyaparsethu.com` 301 and file GSC Change of Address, or roll back to match `CLAUDE.md`? | The 301 is **live in production** while `CLAUDE.md` says bell24h.com stays primary until 50+ verified suppliers. Production and documentation contradict each other, and an unannounced migration bleeds authority daily. | Founder |
| **D2** | **AI crawler policy** — allow, restrict, or block GPTBot / ClaudeBot / PerplexityBot / Google-Extended / CCBot? | Training-crawl vs citation-only is a strategy call, not an engineering default. Blocks Sprint 7. | Founder |

Both are recorded as `OPEN` in [SEO_DECISIONS.md](SEO_DECISIONS.md).

---

## 9. Change log

| Date | Change | Author |
|---|---|---|
| 2026-07-30 | Program created. Robots fix shipped (`c937ae8`), production validated, 12 sprints defined. | Claude Opus 5 (session `016R4kB5cJ5tSYvLBDh1tS6F`) |
| 2026-07-31 | Backlog, sprint plans, decisions, and testing checklist authored. 25 backlog items registered (1 Done, 24 Open). | Claude Opus 5 (same session) |
