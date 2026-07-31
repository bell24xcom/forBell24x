# Enterprise SEO Backlog — VyaparSethu

**Parent program:** [ENTERPRISE_SEO_MASTER_PROGRAM.md](ENTERPRISE_SEO_MASTER_PROGRAM.md)
**Created:** 2026-07-31
**Audit date:** 2026-07-30 (deployment `bell24h-339udlwh9`, commit `c937ae8`)
**Total items:** 25 (1 Done, 24 Open)

---

## Legend

| Field | Values |
|---|---|
| **Priority** | `P0` blocks indexation/crawling · `P1` suppresses indexed-page performance · `P2` structural quality & growth capacity · `P3` hygiene/docs/observability · `P4` gated, long-horizon |
| **Status** | `Done` · `Open` · `Blocked` · `In Progress` |
| **Owner** | `Founder` (decision required) · `Engineering` (implementation) |
| **Risk** | Risk of *making the change*, not of leaving it |

**Evidence convention:** every item cites how it was established — `measured` (live HTTP probe), `repo` (static inspection), `build log`, or `inferred`.

---

## P0 — Blocks indexation or crawling

---

### SEO-P0-00 — Remove `/_next` from robots.txt disallow list

| | |
|---|---|
| **Priority** | P0 |
| **Title** | Remove `/_next` from robots.txt disallow list |
| **Sprint** | 1 (pre-sprint hotfix) |
| **Risk** | Very Low |
| **Status** | ✅ **Done** — commit `c937ae8`, deployed `bell24h-339udlwh9` |
| **Owner** | Engineering |
| **Dependencies** | None |

**Description.** `src/app/robots.ts` disallowed `/_next` without a trailing slash, prefix-matching the entire Next.js build output. All JS chunks, CSS, font subsets, `/_next/image`, and `/_next/data` were refused to crawlers. Google was rendering the site with no CSS and no JavaScript. Accounted for essentially all 1,240 *Blocked internal resources* issues (14 blocked resources/page × ~88 crawled pages ≈ 1,232). **Evidence:** measured.

**Acceptance criteria.**
- [x] `Disallow: /_next` absent from live `robots.txt`
- [x] All security prefixes retained (`/api/`, `/admin/`, `/dashboard/`, `/settings`, `/profile`, supplier account paths)
- [x] All `/_next/static/*` assets return 200 to Googlebot UA
- [x] `/_next/image` endpoint returns 200
- [x] Sitemap directive intact, zero syntax errors
- [x] Production deployment Ready and validated

---

### SEO-P0-01 — Root-layout canonical inheritance

| | |
|---|---|
| **Priority** | **P0** |
| **Title** | Root-layout canonical inheritance makes pages declare themselves duplicates of the homepage |
| **Sprint** | 1 |
| **Risk** | Medium |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | None to remove; **SEO-P0-04 must follow immediately** so pages set their own canonical |

**Description.** `src/app/layout.tsx:24` declares `alternates: { canonical: '/' }`. Next.js App Router **inherits** `alternates.canonical` to every page that does not override it. Combined with `metadataBase` (L15), every non-overriding page emits `<link rel="canonical" href="https://www.vyaparsethu.com">` — instructing Google that the page is a duplicate of the homepage and should not be indexed separately.

Two defect variants exist: (a) page has no `metadata` export at all → inherits title, description, canonical, and OpenGraph; (b) page has a `metadata` export but omits `alternates.canonical` → inherits canonical only (e.g. `/industrial-cluster`).

**Scope, measured:** 87 static public routes carry the inherited canonical. **16 of them are in the sitemap and were individually live-verified emitting the homepage canonical:**

`/about` · `/contact` · `/cookies` · `/help` · `/industrial-cluster` · `/pricing` · `/privacy` · `/refund-policy` · `/rfq/create` · `/suppliers` · `/terms` · `/tools/gst-calculator` · `/tools/hsn-lookup` · `/tools/packaging-calculator` · `/video-rfq` · `/voice-rfq`

**Evidence:** repo (`layout.tsx:24`) + measured (16/16 live).

**Acceptance criteria.**
- [ ] `alternates: { canonical: '/' }` removed from `src/app/layout.tsx`; `metadataBase` retained
- [ ] Homepage `/` sets its own self-canonical explicitly
- [ ] All 16 listed URLs emit a self-referential canonical in production
- [ ] Zero sitemap URLs emit a canonical pointing to a different URL, except intentional dedupes recorded in [SEO_DECISIONS.md](SEO_DECISIONS.md)
- [ ] CI assertion added (see SEO-P3-04) that fails if any sitemap URL is not self-canonical

---

### SEO-P0-02 — Middleware rate limiter returns 429 to crawlers

| | |
|---|---|
| **Priority** | **P0** |
| **Title** | Global rate limiter throttles Googlebot and third-party crawlers |
| **Sprint** | 1 |
| **Risk** | Medium (file also carries auth + CSP) |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | Upstash Redis provisioning **if** durable keyed limiting is chosen |

**Description.** `src/middleware.ts` sets `MAX_REQUESTS = 100` per `RATE_LIMIT_WINDOW = 15 * 60 * 1000` per IP, applied to all HTML requests. Static assets are exempt (`pathname.startsWith('/_next') || pathname.includes('.')`, L139). A 295-URL crawl at 10-way parallelism produced **198 × HTTP 429**.

The limiter is a per-instance `Map` (L13), so it resets on serverless cold start — behaviour is **non-deterministic**. A retry moments later returned 200 from a different `X-Vercel-Id`.

**Epistemic boundary.** It is *proven* that the limiter 429s a fast crawler. It is *not proven* that it throttled the actual Semrush crawl. The behaviour is consistent with the audit reaching only ~88 pages, but that link is **inferred**, not measured.

**Evidence:** measured (198/295) + repo (`middleware.ts:11-13,139-142`).

**Acceptance criteria.**
- [ ] A sequential crawl of 300 HTML URLs from one IP produces **zero** 429 responses
- [ ] Verified crawler user-agents (Googlebot, Bingbot, and any bot allowed under `SEO_DECISIONS.md` D2) are exempt or generously scoped
- [ ] Abuse protection for non-crawler traffic remains effective (documented threshold, tested)
- [ ] Limiter behaviour is deterministic across cold starts, or the non-determinism is explicitly accepted and documented
- [ ] Change shipped as an **isolated commit** touching no auth or CSP logic

---

### SEO-P0-03 — Auth-gated and redirecting URLs in sitemap

| | |
|---|---|
| **Priority** | **P0** |
| **Title** | `/rfq/create` returns 307 but is submitted for indexing |
| **Sprint** | 1 |
| **Risk** | Low |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | None |

**Description.** `/rfq/create` is listed in `sitemap.xml` but is a `PROTECTED_USER_PATH` in `src/middleware.ts:82`, returning **307** to `/auth/phone-email` for unauthenticated requests. Submitting a redirecting, auth-gated URL for indexing is a direct crawl-error signal. It is the only non-200 URL in an 87-URL sample.

**Evidence:** measured (307) + repo (`middleware.ts:82`).

**Acceptance criteria.**
- [ ] `sitemap.ts` excludes every route matched by `PROTECTED_USER_PATHS` or `PROTECTED_SUPPLIER_PATHS`
- [ ] Full sitemap sweep returns 200 for 100% of `<loc>` entries
- [ ] CI assertion added that fails the build if any sitemap URL is non-200

---

### SEO-P0-04 — 83 of 125 public pages have no metadata export

| | |
|---|---|
| **Priority** | **P0** |
| **Title** | Majority of public pages inherit homepage title, description, canonical, and OpenGraph |
| **Sprint** | 3 |
| **Risk** | Low per file, Medium in aggregate (80+ file surface) |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | **SEO-P0-01 first** — remove the inherited canonical, or every page fights it individually |

**Description.** Of 125 public page templates (excluding admin, dashboard, auth, and supplier-account routes), **83 have no `metadata` or `generateMetadata` export**. They inherit the root layout's title, description, canonical, and OpenGraph wholesale. Of the 42 that do export metadata, only **29 set `alternates.canonical`** — so 96 of 125 pages have no page-specific canonical.

High-value examples: `/about`, `/contact`, `/help/*`, `/legal/*`, `/pricing`, `/escrow`, `/payment-security`, `/fintech`, `/gst-registration`, `/products`, `/register`, `/rfq-compare`, `/compliance/gst`, `/compliance/razorpay`.

**Evidence:** repo scan of all 125 public `page.tsx`.

**Acceptance criteria.**
- [ ] A shared `src/lib/seo/metadata-factory.ts` exists and is the only sanctioned way to construct page metadata
- [ ] 100% of indexable public routes export `metadata` or `generateMetadata`
- [ ] 100% of indexable public routes set `alternates.canonical` to their own URL
- [ ] Zero duplicate `<title>` values across indexable routes
- [ ] Zero duplicate meta descriptions across indexable routes
- [ ] All titles and descriptions comply with the Word System (see SEO-P2-06)

---

## P1 — Suppresses performance of pages that are indexed

---

### SEO-P1-01 — `/categories*` renders dynamically despite `revalidate = 300`

| | |
|---|---|
| **Priority** | P1 |
| **Title** | 66% of sitemap served uncached per-request; declared ISR not honoured |
| **Sprint** | 9 |
| **Risk** | Medium |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | Post-fix CWV re-baseline (1–2 weeks after `c937ae8`) |

**Description.** `src/app/categories/page.tsx:6` and `src/app/categories/[category]/page.tsx:13` both declare `export const revalidate = 300`. The build log nonetheless marks both routes **`ƒ` (dynamic)**, and production returns `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`. The declared 5-minute ISR is not in effect.

**454 of 684 sitemap URLs (66%)** are in this namespace. Every crawler hit is a cold serverless render — a crawl-budget tax on the majority of the site, and a TTFB penalty for users.

Likely causes to investigate: an uncached Prisma call, use of `cookies()`/`headers()` in the component tree, or a child component importing a dynamic API.

**Evidence:** repo + build log (`ƒ /categories`, `ƒ /categories/[category]`) + measured headers.

**Acceptance criteria.**
- [ ] Root cause of forced dynamic rendering identified and documented
- [ ] `/categories` and `/categories/[category]` build as `●` or `○`, or serve a cacheable `Cache-Control` with CDN HIT
- [ ] Production response shows `X-Vercel-Cache: HIT` on a repeat request
- [ ] p75 TTFB on category pages improves measurably against the re-baseline
- [ ] No stale-content regression: category data refreshes within the declared window

---

### SEO-P1-02 — Category pages carry no page-level structured data

| | |
|---|---|
| **Priority** | P1 |
| **Title** | No BreadcrumbList, ItemList, or Product schema on 66% of the sitemap |
| **Sprint** | 2 |
| **Risk** | Low-Medium |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | SEO-P0-01 (canonicals must be correct before `@id`/`url` reference them) |

**Description.** `/categories/steel-metal` emits 6 JSON-LD blocks, but **all are global**: Organization, WebSite, SearchAction, LocalBusiness, ContactPoint, PostalAddress, GeoCoordinates, Country. There is **no BreadcrumbList, no ItemList, and no Product/Offer**.

By contrast `/blog/[slug]` correctly emits Article + BreadcrumbList + ImageObject, and `/glossary/[term]` emits DefinedTerm + DefinedTermSet + FAQPage + BreadcrumbList. The category namespace — the largest on the site — is the outlier.

**Evidence:** measured (live JSON-LD extraction across 4 templates).

**Acceptance criteria.**
- [ ] `BreadcrumbList` on every `/categories/*` page, derived from the same slug resolver as canonical and sitemap
- [ ] `ItemList` enumerating listed suppliers/products where real data exists
- [ ] `Product`/`Offer` on product-intelligence pages with HSN as `additionalProperty`
- [ ] Zero `AggregateRating`, `review`, or `offerCount` properties not backed by real data
- [ ] Google Rich Results Test passes with zero errors on one URL per template
- [ ] GSC Enhancements shows valid Breadcrumb items for the category namespace

---

### SEO-P1-03 — OpenGraph not overridden per template

| | |
|---|---|
| **Priority** | P1 |
| **Title** | `og:url` and `og:title` inherit homepage values, conflicting with correct canonicals |
| **Sprint** | 3 |
| **Risk** | Low |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | SEO-P0-04 |

**Description.** `/categories/textiles` sets a correct page `<title>` and a correct self-canonical, but emits `og:title` = `"VyaparSethu — Protected Trade Infrastructure"` (the root layout default) and `og:url` = `https://www.vyaparsethu.com` (the homepage). `og:url` therefore contradicts `rel=canonical` on the same page.

This degrades social previews, WhatsApp/LinkedIn shares (a primary B2B distribution channel in India), and AI-assistant link previews.

**Evidence:** measured.

**Acceptance criteria.**
- [ ] `og:url === rel=canonical` on 100% of indexable public routes
- [ ] `og:title` and `og:description` are page-specific on all indexable routes
- [ ] `og:image` is page-appropriate, or the branded default is a deliberate documented choice
- [ ] CI assertion added comparing `og:url` to canonical

---

### SEO-P1-04 — Title template produces duplicated brand suffix

| | |
|---|---|
| **Priority** | P1 |
| **Title** | Titles render as `… \| VyaparSethu \| VyaparSethu` |
| **Sprint** | 3 |
| **Risk** | Very Low |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | SEO-P0-04 |

**Description.** `/cookies` renders `Cookie Policy | VyaparSethu | VyaparSethu` — a page title already containing the brand suffix has the root layout's title template applied on top. Wastes SERP pixel width and reads as an error.

Related: `/industrial-cluster` correctly uses `title: { absolute: … }` to opt out of the template — that is the pattern to standardise on where a page supplies its own full title.

**Evidence:** measured.

**Acceptance criteria.**
- [ ] Zero live titles contain a repeated brand token
- [ ] Title construction is centralised in the metadata factory (SEO-P0-04)
- [ ] Documented rule for when to use `title.absolute` vs the template
- [ ] All indexable titles ≤ 60 characters where practical

---

### SEO-P1-05 — Sitemap is a single flat force-dynamic file

| | |
|---|---|
| **Priority** | P1 |
| **Title** | 684 URLs in one 124 KB `force-dynamic` sitemap; no index, no segmentation |
| **Sprint** | 1 |
| **Risk** | Low |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | None |

**Description.** `src/app/sitemap.ts:8-9` sets `export const dynamic = 'force-dynamic'` and `revalidate = 3600`; the build marks it `ƒ`. It is regenerated per request at 124,260 bytes.

Consequences: every crawler fetch is a serverless render; there is no per-namespace indexation diagnostics; and there is no headroom for Sprint 4/6 growth (the 50,000-URL / 50 MB ceiling is distant but the diagnostic problem is immediate).

**Evidence:** repo + build log + measured (124,260 B).

**Acceptance criteria.**
- [ ] `sitemap.xml` is a sitemap **index** referencing per-namespace children (static, categories, suppliers, city×category, blog, glossary, location, clusters)
- [ ] Child sitemaps are statically generated (`○`/`●`), not `ƒ`
- [ ] Each child < 50,000 URLs and < 50 MB uncompressed
- [ ] `robots.txt` declares the index
- [ ] GSC shows per-child submitted/indexed counts
- [ ] Zero non-200 and zero non-self-canonical URLs across all children

---

### SEO-P1-06 — No webfonts loaded; design system unimplemented

| | |
|---|---|
| **Priority** | P1 |
| **Title** | Inter declared but never fetched; Poppins and Devanagari fallback absent |
| **Sprint** | 9 |
| **Risk** | Medium (adds bytes; interacts with CSP) |
| **Status** | Open |
| **Owner** | Engineering + Founder (brand sign-off) |
| **Dependencies** | Post-fix CWV re-baseline |

**Description.** The 123,104-byte CSS bundle contains **zero `@font-face` rules** and no reference to `fonts.googleapis.com` or `fonts.gstatic.com`. It declares `font-family: Inter, system-ui, sans-serif`, but Inter is never loaded — pages silently fall back to the system font.

The `CLAUDE.md` design system mandates **Poppins for headings, Inter for body, and a Devanagari-compatible fallback for Hindi overlays**. None of the three is present. The CSP in `src/middleware.ts` already permits `fonts.googleapis.com` and `fonts.gstatic.com`, implying an intended integration that was never completed or was later removed.

**Tension to manage:** this item *adds* page weight and is in mild conflict with Core Web Vitals goals in the same sprint. Self-hosting via `next/font` is the mitigation.

**Evidence:** measured (CSS bundle inspection) + repo (`middleware.ts` CSP).

**Acceptance criteria.**
- [ ] Poppins (headings) and Inter (body) load via `next/font`, self-hosted, with `font-display: swap`
- [ ] A Devanagari-capable face is available for Hindi content
- [ ] CLS does not regress; LCP regression, if any, is within the agreed budget
- [ ] CSP updated only if third-party font origins are genuinely still required; prefer removing them
- [ ] Visual regression review signed off by Founder

---

### SEO-P1-07 — `next/image` unused despite optimizer being enabled

| | |
|---|---|
| **Priority** | P1 |
| **Title** | Image optimizer configured but zero `/_next/image` requests on public pages |
| **Sprint** | 9 |
| **Risk** | Low-Medium |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | Post-fix CWV re-baseline |

**Description.** `next.config.js:18-22` enables optimization (`unoptimized: false`, `formats: ['image/avif','image/webp']`, `minimumCacheTTL: 86400`). Yet **zero `/_next/image` requests** appear across `/`, `/categories`, `/suppliers`, and `/pricing` — strongly indicating raw `<img>` tags bypass the optimizer entirely.

Consequences: no AVIF/WebP negotiation, no responsive `srcset`, and likely no explicit dimensions → CLS exposure and unnecessary LCP weight.

Note: the `/_next/image` endpoint itself was probed and returns **200** — it is available and crawlable, simply unused.

**Evidence:** measured (4 templates, 0 references; endpoint probe 200) + repo (`next.config.js`).

**Acceptance criteria.**
- [ ] All above-the-fold and content images use `next/image` with explicit `width`/`height`
- [ ] LCP image carries `priority`
- [ ] `/_next/image` requests observable in production HTML
- [ ] CLS < 0.1 at p75 mobile on all public templates
- [ ] Image payload reduced measurably against the re-baseline

---

## P2 — Structural quality and growth capacity

---

### SEO-P2-01 — Supplier landing-page cannibalization

| | |
|---|---|
| **Priority** | P2 |
| **Title** | 9+ overlapping supplier landing templates competing for the same intent |
| **Sprint** | 8 |
| **Risk** | Medium-High (consolidation requires 301s) |
| **Status** | Open |
| **Owner** | Engineering + Founder (which URL wins) |
| **Dependencies** | SEO-P0-04, SEO-P1-02 |

**Description.** The repo contains at least nine public templates targeting overlapping supplier-discovery intent:

`/suppliers` · `/supplier` · `/suppliers-verified` · `/suppliers-exporters` · `/suppliers/manufacturers` · `/services/verified-suppliers` · `/services/featured-suppliers` · `/founding-suppliers` · `/learn/how-to-find-verified-b2b-suppliers-india`

Google must choose among near-identical candidates, splitting link equity and relevance signals. `/suppliers` additionally emits the homepage canonical (SEO-P0-01), so the strongest candidate is currently self-cancelling.

**Evidence:** repo route inventory.

**Acceptance criteria.**
- [ ] Documented decision on which URL owns each intent, recorded in [SEO_DECISIONS.md](SEO_DECISIONS.md)
- [ ] Losing URLs 301 to winners, or are genuinely differentiated with distinct intent and content
- [ ] Zero near-duplicate title/H1 pairs across the supplier namespace
- [ ] 301 map verified end-to-end with zero chains > 1 hop
- [ ] Internal links updated to point at winners, not redirects

---

### SEO-P2-02 — No `hreflang` implementation

| | |
|---|---|
| **Priority** | P2 |
| **Title** | Zero alternate-language links despite Hindi/Devanagari product intent |
| **Sprint** | 6 |
| **Risk** | Medium (incorrect hreflang is worse than none) |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | A language strategy decision; SEO-P1-06 (Devanagari font) |

**Description.** No `<link rel="alternate" hreflang="…">` elements exist on any page. `CLAUDE.md` mandates a Devanagari-compatible fallback for Hindi overlays, and `layout.tsx` sets `locale: 'en_IN'` in OpenGraph — but there is no localized URL structure and no hreflang.

This is only actionable once a language strategy exists. Shipping hreflang without genuinely localized pages is actively harmful.

**Evidence:** measured (zero hreflang links).

**Acceptance criteria.**
- [ ] Language strategy documented (subdirectory vs subdomain vs parameter; which content is localized)
- [ ] `hreflang` present only on genuinely localized URL pairs, with reciprocal references
- [ ] `x-default` declared
- [ ] Zero errors in GSC International Targeting
- [ ] If the decision is "not yet", it is recorded in `SEO_DECISIONS.md` and this item is closed as `Deferred`

---

### SEO-P2-03 — `supplier-seo.ts` indexability ternary is a no-op

| | |
|---|---|
| **Priority** | P2 |
| **Title** | Verified-supplier check returns `index: true` on both branches |
| **Sprint** | 8 |
| **Risk** | Low |
| **Status** | Open |
| **Owner** | Engineering + Founder (policy) |
| **Dependencies** | Thin-profile policy decision |

**Description.** `src/lib/supplier-seo.ts:67` reads:

```ts
robots: user.isVerified || user.gstNumber ? { index: true, follow: true } : { index: true, follow: true },
```

Both branches are identical, so the verification check has no effect. Either the intent was to `noindex` unverified/thin supplier profiles and the implementation is incomplete, or the check is vestigial and should be removed. Indexing thin supplier profiles at scale is the classic B2B-marketplace quality failure.

**Evidence:** repo.

**Acceptance criteria.**
- [ ] Explicit documented policy: which supplier profiles are indexable
- [ ] Ternary either implements the policy or is removed
- [ ] Profile completeness threshold defined and enforced
- [ ] Below-threshold profiles are `noindex` **and** excluded from the sitemap
- [ ] Unit tests cover both branches

---

### SEO-P2-04 — No lifecycle policy for `/rfq/[id]` pages

| | |
|---|---|
| **Priority** | P2 |
| **Title** | Quotation pages indexed indefinitely with no expiry handling |
| **Sprint** | 8 |
| **Risk** | Medium |
| **Status** | Open |
| **Owner** | Engineering + Founder (policy) |
| **Dependencies** | SEO-P0-03 |

**Description.** 16 `/rfq/*` URLs are in the sitemap; 15 return 200 (the 16th is `/rfq/create`, see SEO-P0-03). These are time-bound requirement pages. There is no observed policy for what happens when a quotation closes or expires — stale requirement pages accumulating in the index is a persistent quality drag and a poor user experience from SERP.

Word System note: these are "Requirements"/"Quotations" in all user-facing copy, never "RFQ".

**Evidence:** measured (sitemap + status) .

**Acceptance criteria.**
- [ ] Documented lifecycle: open → indexable; closed/expired → `noindex` or 410; sitemap membership follows state
- [ ] `/api/cron/expire-rfqs` (already exists) drives sitemap and indexability state
- [ ] Expired URLs return the agreed status code, verified in production
- [ ] Zero expired requirements remain in the sitemap
- [ ] Live requirement pages carry Word System-compliant titles

---

### SEO-P2-05 — Programmatic templates ship without a coverage gate

| | |
|---|---|
| **Priority** | P2 |
| **Title** | `/suppliers/[city]/[category]` renders regardless of verified supplier density |
| **Sprint** | 4 (merged with 6) |
| **Risk** | **HIGH** |
| **Status** | Open |
| **Owner** | Engineering + Founder (threshold) |
| **Dependencies** | Real supplier density (Phase D); SEO-P1-05 |

**Description.** The city×category template already ships as SSG (`● /suppliers/[city]/[category]`), but no verified-supplier threshold governs whether a given pair renders as an indexable page or enters the sitemap.

The four commits immediately preceding this program were all fixing symptoms of exactly this gap:
`aa28e72` (only emit city×category pairs that resolve) · `75c440a` (resolve categoryId by slug) · `7760306` + `c13466b` (category slug normalization).

Thin/duplicate content at scale triggers **site-wide** quality demotion, not per-page suppression. This is the single highest-risk item in the backlog.

**Evidence:** build log + git history.

**Acceptance criteria.**
- [ ] Minimum verified-supplier threshold defined, documented, and enforced in code
- [ ] Below-threshold pairs render a genuine "Reserve your category" state, are `noindex`, and are excluded from the sitemap — **never a zero metric** (Principle 1)
- [ ] Rollout is tranched (100 → 500 → full) with GSC indexed/submitted monitored between tranches
- [ ] Tranche gate: < 60% indexed → stop and fix, do not ship the next tranche
- [ ] Near-duplicate score on a 30-page sample below the agreed threshold
- [ ] Zero URL collision with the Sprint 6 geographic namespace

---

### SEO-P2-06 — Word System violations in live output

| | |
|---|---|
| **Priority** | P2 |
| **Title** | Banned vocabulary appears in production titles and URLs |
| **Sprint** | 3 (metadata) + 8 (marketplace copy) |
| **Risk** | Low |
| **Status** | Open |
| **Owner** | Engineering + Founder (URL-change decisions) |
| **Dependencies** | SEO-P0-04 |

**Description.** `CLAUDE.md` mandates the Word System for all user-facing copy. Live production violates it, e.g. `/voice-rfq` renders the title `"Voice RFQ — Speak Your Requirement"` — "Voice RFQ" must be "Speak Requirement". Blog slugs and titles also carry "RFQ" (`/blog/how-to-write-effective-rfq`).

**Scope decision required.** Fixing *titles and copy* is safe and in scope. Changing *URLs* (e.g. `/voice-rfq` → `/speak-requirement`) requires 301s and is a separate, riskier decision — slugs already carry indexed equity.

**Evidence:** measured (live titles) + sitemap.

**Acceptance criteria.**
- [ ] Zero banned terms in any live `<title>`, meta description, H1, or JSON-LD `name`/`description`
- [ ] Automated Word System linter in CI covering metadata and structured data
- [ ] Explicit Founder decision on whether URL slugs change; if yes, 301 map with zero chains
- [ ] "Parcha" appears nowhere in the codebase or output

---

### SEO-P2-07 — `http://` apex redirect takes two hops

| | |
|---|---|
| **Priority** | P2 |
| **Title** | `http://vyaparsethu.com` → 2 hops to final URL |
| **Sprint** | 1 |
| **Risk** | Very Low |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | SEO-P3-03 (domain posture) |

**Description.** Redirect chain measurements:

| Origin | Hops |
|---|---|
| `http://vyaparsethu.com` | **2** (http→https, then apex→www) |
| `https://vyaparsethu.com` | 1 |
| `http://www.vyaparsethu.com` | 1 |
| `https://www.bell24h.com` | 1 |

Each additional hop dilutes signals marginally and adds latency. Minor, but trivially fixable at the platform level.

**Evidence:** measured.

**Acceptance criteria.**
- [ ] All host/protocol combinations reach `https://www.vyaparsethu.com` in **≤ 1 hop**
- [ ] No redirect loops
- [ ] Verified for the bell24h.com domain too, subject to SEO-P3-03

---

## P3 — Hygiene, documentation correctness, observability

---

### SEO-P3-01 — Dead robots template still contains `Disallow: /_next/`

| | |
|---|---|
| **Priority** | P3 |
| **Title** | Inactive sitemap script carries the exact bug just fixed |
| **Sprint** | 1 |
| **Risk** | Very Low |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | None |

**Description.** `src/scripts/generate-global-sitemaps.ts:324` contains `Disallow: /_next/` inside a per-country robots template. The script is **inactive**: it is not referenced in `package.json` scripts, not in the Vercel `buildCommand`, and it writes `robots-{cc}.txt` (not `robots.txt`) into `./public`.

It is harmless today and is **the mechanism by which SEO-P0-00 returns**.

**Evidence:** repo (`package.json`, `vercel.json`, script line 324).

**Acceptance criteria.**
- [ ] Either the `Disallow: /_next/` line is removed from the template, or the entire script is deleted if the multi-country plan is dormant
- [ ] Decision recorded in `SEO_DECISIONS.md`
- [ ] CI assertion (SEO-P3-04) greps the whole repo, not just `src/app/robots.ts`, for rules matching rendering-resource paths

---

### SEO-P3-02 — `CLAUDE.md` 12-function limit appears stale

| | |
|---|---|
| **Priority** | P3 |
| **Title** | Documented Vercel function ceiling contradicts a successful 201-route deployment |
| **Sprint** | 11 (**pull forward if it blocks any earlier sprint**) |
| **Risk** | Low to verify; **High cost of leaving it wrong** |
| **Status** | Open |
| **Owner** | Founder (plan confirmation) |
| **Dependencies** | None |

**Description.** `CLAUDE.md` states: *"Never add new /api/ functions if it pushes serverless function count over 12 (Vercel Hobby tier limit)."*

The repository contains **201** `src/app/api/**/route.ts` files, and deployment `bell24h-339udlwh9` completed successfully with `Created all serverless functions` and no ceiling error.

The constraint is therefore very likely stale — but it is **actively distorting architecture decisions** across this program (Sprints 7, 9, 11 all defer to it). It must be resolved, not assumed either way.

**Evidence:** repo (`git ls-files` count) + build log (successful deploy, no error).

**Acceptance criteria.**
- [ ] Actual Vercel plan and function limit confirmed from the dashboard
- [ ] `CLAUDE.md` updated to state the real constraint, or the constraint removed
- [ ] All roadmap items that defer to the ceiling re-evaluated against the real number
- [ ] Decision recorded in `SEO_DECISIONS.md`

---

### SEO-P3-03 — Domain posture: production contradicts documentation

| | |
|---|---|
| **Priority** | P3 (**blocks Sprint 1 planning**) |
| **Title** | `bell24h.com → vyaparsethu.com` 301 is live; `CLAUDE.md` says it should not be |
| **Sprint** | 1 |
| **Risk** | **Medium-High** — touches live redirect behaviour and canonical host |
| **Status** | **Open — Founder decision required** |
| **Owner** | **Founder** |
| **Dependencies** | GSC access for both properties |

**Description.** Production serves a **301 from `https://www.bell24h.com` to `https://www.vyaparsethu.com`** (measured), meaning `REDIRECT_BELL24H_TO_VYAPARSETHU=true` is set in the Vercel environment.

`CLAUDE.md` states the opposite: *"Domain: bell24h.com stays primary until 50+ verified suppliers onboarded; vyaparsethu.com becomes primary only at Phase 2 (30–60 days out)."*

`vercel.json` also hardcodes `NEXT_PUBLIC_SITE_URL: https://www.vyaparsethu.com`, while `lib/site-url.ts` defaults to `https://www.bell24h.com`.

An unannounced domain migration — one with no GSC Change of Address filed — bleeds accumulated authority for as long as it goes unmanaged.

**Evidence:** measured (301, 1 hop) + repo (`middleware.ts:120`, `vercel.json`, `lib/site-url.ts`, `CLAUDE.md`).

**Acceptance criteria.**
- [ ] Founder ratifies the live cutover **or** directs a rollback
- [ ] If ratified: both properties verified in GSC; **Change of Address filed**; new sitemap submitted; 301s committed to for ≥ 12 months
- [ ] If rolled back: `REDIRECT_BELL24H_TO_VYAPARSETHU` unset and `NEXT_PUBLIC_SITE_URL` reconciled
- [ ] `CLAUDE.md` updated to match production reality either way
- [ ] Zero canonical or sitemap URL points at the non-primary domain
- [ ] Decision recorded in `SEO_DECISIONS.md` as D1

---

### SEO-P3-04 — No SEO regression testing in CI

| | |
|---|---|
| **Priority** | P3 by category, **P1 by urgency** |
| **Title** | Nothing in CI would have caught either P0 defect |
| **Sprint** | 12 (**run in Wave 1, in parallel with Sprint 1**) |
| **Risk** | Very Low |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | None — can start immediately |

**Description.** Both P0 defects in this program are one-line configuration errors in metadata files. Neither `npm run build` nor `npm run lint` would fail on either. `next.config.js` additionally sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`, so the build catches even less than it appears to.

This item is categorised P3 (observability) but is **operationally P1**: without it, the program's own fixes can silently regress.

**Evidence:** repo.

**Acceptance criteria.** Four invariant tests exist, run in CI, and fail the build when violated:
- [ ] **I1** — `robots.txt` output contains no rule matching `/_next`, `/static`, or any rendering-resource path (repo-wide grep, not just `robots.ts`)
- [ ] **I2** — every sitemap URL returns 200 and self-canonicalizes
- [ ] **I3** — no duplicate `<title>` or meta description across indexable routes
- [ ] **I4** — `og:url === rel=canonical` on every indexable route
- [ ] Each historical defect reproduced on a branch and confirmed to fail CI
- [ ] Production-dependent checks isolated in a non-blocking job to avoid flake

---

## P4 — Gated, long-horizon

---

### SEO-P4-01 — No agent-readable commerce surface

| | |
|---|---|
| **Priority** | P4 |
| **Title** | No machine-consumable discovery or intake for AI procurement agents |
| **Sprint** | 10 |
| **Risk** | **HIGH** (public data surface + DPDP + funds) |
| **Status** | **Blocked** |
| **Owner** | Founder + Engineering |
| **Dependencies** | **Phase D (100 verified suppliers)** · Pvt Ltd registration · nodal partner · legal sign-off · Sprints 2, 5, 7 |

**Description.** VyaparSethu has no versioned public API for supplier/product discovery, no agent capability manifest, and no schema-validated machine intake for Requirements. This is the endgame of the Business OS thesis (Marketplace = Application #1, not the platform).

Three compounding risks: a public data API is a scraping surface that could hand competitors the verified-supplier asset; DPDP consent must be airtight before supplier data is machine-harvestable; and any funds path demands human-in-the-loop approval.

**Evidence:** repo (no such routes) + `CLAUDE.md` architecture.

**Acceptance criteria.**
- [ ] Documented, versioned public read API within the confirmed function budget (SEO-P3-02)
- [ ] Agent capability manifest published
- [ ] Durable keyed rate limiting surviving cold starts (builds on SEO-P0-02)
- [ ] DPDP erasure proven end-to-end: opt-out removes data from all feeds (extends `consent_audit_log` / `0002_leads_dpdp`)
- [ ] **Human-in-the-loop approval mandatory at fund release — no autonomous fund movement**
- [ ] Independent security review complete
- [ ] ≥ 1 external agent integration validated

---

### SEO-P4-02 — Trust Score cron schedule contradicts specification

| | |
|---|---|
| **Priority** | P4 |
| **Title** | Cron runs 09:00 IST; spec mandates 2 AM IST |
| **Sprint** | 11 |
| **Risk** | Low |
| **Status** | Open |
| **Owner** | Engineering |
| **Dependencies** | None |

**Description.** `vercel.json` schedules `/api/cron/daily` at `30 3 * * *`. Vercel cron expressions are UTC, so this fires at **09:00 IST**. `CLAUDE.md` specifies the Trade Confidence Score™ must be computed by **daily cron at 2 AM IST only**.

Either the schedule is wrong or the specification is. Trust Score freshness affects supplier-facing metrics and, later, agent counterparty risk (SEO-P4-01).

**Evidence:** repo (`vercel.json`) + `CLAUDE.md`.

**Acceptance criteria.**
- [ ] Intended run time confirmed with Founder
- [ ] `vercel.json` schedule matches intent (2 AM IST = `30 20 * * *` UTC), or the spec is amended
- [ ] Production logs confirm the cron fires at the intended IST time
- [ ] Trust Score remains cron-only — **never computed real-time**

---

## Summary by sprint

| Sprint | Items | Priorities |
|---|---|---|
| 1 — Technical SEO | SEO-P0-01, SEO-P0-02, SEO-P0-03, SEO-P1-05, SEO-P2-07, SEO-P3-01, SEO-P3-03 | P0×3, P1×1, P2×1, P3×2 |
| 2 — Structured Data | SEO-P1-02 | P1×1 |
| 3 — Indexation | SEO-P0-04, SEO-P1-03, SEO-P1-04, SEO-P2-06 | P0×1, P1×2, P2×1 |
| 4 — Programmatic SEO | SEO-P2-05 | P2×1 |
| 6 — GEO | SEO-P2-02 | P2×1 |
| 8 — Marketplace SEO | SEO-P2-01, SEO-P2-03, SEO-P2-04 | P2×3 |
| 9 — Performance | SEO-P1-01, SEO-P1-06, SEO-P1-07 | P1×3 |
| 10 — Autonomous Commerce | SEO-P4-01 | P4×1 |
| 11 — Enterprise Analytics | SEO-P3-02, SEO-P4-02 | P3×1, P4×1 |
| 12 — Continuous Monitoring | SEO-P3-04 | P3×1 |

**Blocked on Founder decision:** SEO-P3-03 (domain posture, blocks Sprint 1) · SEO-P3-02 (function ceiling) · SEO-P2-06 (URL slug changes) · SEO-P2-01 (which URL wins) · SEO-P2-03 / SEO-P2-04 (indexation policy) · SEO-P4-02 (cron intent) · AI crawler policy D2 (blocks Sprint 7).
