# SEO Testing Checklist — VyaparSethu

**Parent program:** [ENTERPRISE_SEO_MASTER_PROGRAM.md](ENTERPRISE_SEO_MASTER_PROGRAM.md)
**Created:** 2026-07-31
**Purpose:** permanent, reusable validation gates. Run the relevant section before every SEO-affecting merge and after every production deploy.

---

## How to use this document

Each section is a gate. **Do not skip a gate because a change "looks small"** — the defect that cost 1,240 audit issues was one line, and the second P0 found in this program was one line in a different metadata file.

| Symbol | Meaning |
|---|---|
| 🔴 | **Blocking** — must pass before merge/deploy |
| 🟡 | Should pass; document and accept any exception |
| 🔵 | Informational; track the trend |

**Canonical origin:** `https://www.vyaparsethu.com` (subject to decision D-DOM-01 — verify before running).

### Reusable snippets

```bash
SITE="https://www.vyaparsethu.com"
GB="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
```

> ⚠️ **Rate limiting caveat.** Until `SEO-P0-02` is fixed, `src/middleware.ts` returns HTTP 429 after ~100 HTML requests per 15 minutes per IP. **Run bulk checks serially with ≥ 2 s pacing and retry on 429**, or results will be false negatives. Static assets are exempt. A measured crawl of 295 URLs at 10-way parallelism produced 198 × 429.

---

## 1. Local Development

Run before opening a PR.

### 1.1 Build integrity 🔴
- [ ] `npm run build` completes without error
- [ ] Review the route table: no route unexpectedly changed from `○`/`●` to `ƒ`
  - Known baseline: `/categories` and `/categories/[category]` are currently `ƒ` despite `revalidate = 300` — this is defect `SEO-P1-01`, not a new regression
- [ ] `/robots.txt` builds as `○`
- [ ] Static page count has not dropped unexpectedly (baseline: **375**)
- [ ] Shared First Load JS has not regressed materially (baseline: **87.6 kB**)

> ⚠️ `next.config.js` sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`. **A green build does not mean type-clean or lint-clean.** Run `npx tsc --noEmit` separately when touching typed SEO code.

### 1.2 The four invariants 🔴

These are the CI assertions from `SEO-P3-04` / D-ENG-04. Run locally before pushing.

- [ ] **I1** — no rendering-resource block anywhere in the repo:
  ```bash
  grep -rn "Disallow.*_next\|Disallow.*/static" src/ --include=*.ts --include=*.tsx
  # Expect: zero matches
  ```
- [ ] **I2** — every sitemap URL returns 200 and self-canonicalizes
- [ ] **I3** — no duplicate `<title>` or meta description across indexable routes
- [ ] **I4** — `og:url === rel=canonical` on every indexable route

### 1.3 Robots output 🔴
```bash
npm run build && npm run start
curl -s localhost:3000/robots.txt
```
- [ ] `/_next` absent
- [ ] All security prefixes present: `/api/`, `/admin/`, `/dashboard/`, `/supplier/dashboard`, `/supplier/profile/edit`, `/settings`, `/profile`
- [ ] Sitemap directive present and absolute
- [ ] No malformed directives:
  ```bash
  curl -s localhost:3000/robots.txt | grep -vnE '^\s*$|^(User-Agent|User-agent|Allow|Disallow|Sitemap|Crawl-delay|Host)\s*:|^#'
  # Expect: no output
  ```

### 1.4 Metadata on changed pages 🔴
For every page touched:
- [ ] Exports `metadata` or `generateMetadata`
- [ ] Sets `alternates.canonical` to its own URL
- [ ] Title unique and ≤ 60 chars where practical
- [ ] Description unique, 120–160 chars
- [ ] Title contains no repeated brand token
- [ ] `og:url` equals canonical
- [ ] Word System compliant — no RFQ, Escrow, Vendor, Wallet, Procurement, Marketplace, Chat, Parcha in user-facing strings

### 1.5 Structured data on changed pages 🟡
- [ ] JSON-LD parses as valid JSON
- [ ] No `AggregateRating`, `review`, `reviewCount`, `ratingValue`, or `offerCount` without real backing data (D-ENG-01)
- [ ] `@id` values stable and unique
- [ ] Any `FAQPage` markup corresponds to Q&A **visible on the page**

---

## 2. Preview Deployment

Run on the Vercel preview URL before promoting to production.

### 2.1 Parity 🔴
- [ ] Preview `robots.txt` matches expected output
- [ ] Preview `sitemap.xml` returns 200 and valid XML
- [ ] URL count within expected delta of baseline (**684**)

### 2.2 Rendering assets as Googlebot 🔴
```bash
PREVIEW="https://<deployment>.vercel.app"
curl -s -A "$GB" "$PREVIEW/" -o /tmp/p.html
grep -o '/_next/[a-zA-Z0-9._/@%?=&-]*' /tmp/p.html | sort -u | while read -r a; do
  printf "%-64s %s\n" "$a" "$(curl -s -o /dev/null -A "$GB" -w '%{http_code} %{content_type}' "$PREVIEW$a")"
done
```
- [ ] **100%** return 200
- [ ] JS serves `application/javascript`, CSS serves `text/css`
- [ ] `/_next/image` probe returns 200

### 2.3 Middleware regression 🔴 — **mandatory whenever `src/middleware.ts` changes**
- [ ] `/admin/anything` without `admin-token` → redirects to `/admin/login`
- [ ] A `PROTECTED_USER_PATHS` route without `auth-token` → 307 to `/auth/phone-email`
- [ ] OTP endpoints still limit at 5 / 10 min (**cost control — MSG91 charges per SMS**)
- [ ] Public `/suppliers/*` remains publicly accessible (regression guard for the incident documented at `middleware.ts:90-94`)
- [ ] CSP header present; no console CSP violations on the homepage
- [ ] Static assets still bypass rate limiting

### 2.4 Crawl simulation 🔴 (after `SEO-P0-02` is fixed)
- [ ] 300 sequential HTML requests with a Googlebot UA → **zero 429**
- [ ] 300 rapid requests with a generic UA → limiting still engages

---

## 3. Production Deployment

Run immediately after every production deploy.

### 3.1 Deployment confirmation 🔴
```bash
vercel ls --yes | head -5
vercel inspect <deployment-url> --logs 2>&1 | grep -i "Commit:"
```
- [ ] Status **● Ready**
- [ ] Build log commit SHA matches the intended commit
- [ ] Build duration within normal range (baseline ~3 min)

### 3.2 Core endpoints 🔴
```bash
curl -s -w "\n[%{http_code} %{content_type} %{size_download}B]\n" "$SITE/robots.txt?cb=$(date +%s)"
curl -s -o /tmp/sm.xml -w "sitemap %{http_code} %{content_type} %{size_download}B\n" "$SITE/sitemap.xml"
grep -c '<loc>' /tmp/sm.xml
```
- [ ] `robots.txt` 200 `text/plain`, `/_next` absent, all security prefixes present, sitemap declared
- [ ] `sitemap.xml` 200 `application/xml`, valid `<urlset>` or `<sitemapindex>`, fresh `lastmod`
- [ ] URL count within expected delta

> Use `curl`, not a cached fetcher. Cached tooling can return a pre-deploy copy and produce a false pass.

### 3.3 Template smoke test 🔴
One URL per template — homepage, `/marketplace`, `/suppliers`, `/suppliers/[city]`, `/categories`, `/categories/[category]`, `/blog`, `/blog/[slug]`, `/glossary`, `/glossary/[term]`, `/industrial-cluster`, `/location/[area]`, `/tools/[tool]`, `/pricing`:
- [ ] HTTP 200
- [ ] Self-referential canonical
- [ ] Meta robots `index, follow`
- [ ] No `X-Robots-Tag` header
- [ ] Brotli (`content-encoding: br`)
- [ ] Unique, Word System-compliant title

### 3.4 Asset and cache validation 🔴
- [ ] All `/_next/static/*` return 200 to Googlebot with correct content types
- [ ] `Cache-Control: public, max-age=31536000, immutable` on static assets
- [ ] `X-Vercel-Cache: HIT` on a repeat asset request
- [ ] No mixed content: `grep -oE '(src|href)="http://[^"]*"'` returns nothing

### 3.5 Redirects and status codes 🔴
- [ ] `http://vyaparsethu.com`, `https://vyaparsethu.com`, `http://www.vyaparsethu.com`, `https://www.bell24h.com` each reach the canonical origin in **≤ 1 hop** (currently `http://` apex is 2 — defect `SEO-P2-07`)
- [ ] A bogus URL returns hard **404**, not a soft 200
- [ ] A bogus category returns hard **404**
- [ ] Zero redirect loops

### 3.6 Full sitemap sweep 🟡 — weekly, or after any sitemap change
Serial, ≥ 2 s pacing, retry on 429:
- [ ] 100% return 200
- [ ] 100% self-canonicalize, except recorded D-CAN-05 dedupes
- [ ] Zero auth-gated or redirecting URLs
- [ ] Zero duplicate titles

---

## 4. Google Search Console

### 4.1 After any robots, canonical, or sitemap change 🔴
- [ ] **URL Inspection → Test Live URL** on the homepage: rendered screenshot is **fully styled** (the definitive proof the `/_next` block is gone)
- [ ] Inspect one URL per template: *URL is on Google* or a clear, expected reason
- [ ] **Google-selected canonical** matches **user-declared canonical** — the specific check for `SEO-P0-01`
- [ ] Page resources list shows **zero** blocked resources
- [ ] Sitemap submitted, status **Success**, discovered-URL count as expected

### 4.2 Ongoing monitoring 🟡
- [ ] **Coverage / Indexing** — no rise in *Excluded*, *Duplicate — Google chose different canonical*, or *Crawled — currently not indexed*
- [ ] **Crawl Stats** — no rise in `429` or `5xx`; average response time stable or improving
- [ ] **Enhancements** — Breadcrumbs, FAQ, Products valid; error count zero
- [ ] **Manual Actions** — none. Check after every structured-data change
- [ ] **Core Web Vitals** — track the post-fix re-baseline; pre-2026-07-30 field data is unreliable because Google was rendering without CSS/JS

### 4.3 Domain migration (only if D-DOM-01 is ratified) 🔴
- [ ] Both properties verified
- [ ] **Change of Address** filed and accepted
- [ ] New sitemap submitted on the destination property
- [ ] Coverage monitored on both properties for **14 days**
- [ ] 301s committed for **≥ 12 months**

---

## 5. Rich Results

Google Rich Results Test — https://search.google.com/test/rich-results

### 5.1 Per template 🔴 — after any structured-data change
- [ ] Homepage — Organization, WebSite, SearchAction, FAQPage
- [ ] `/categories/[category]` — BreadcrumbList, ItemList *(pending Sprint 2)*
- [ ] `/blog/[slug]` — Article, BreadcrumbList
- [ ] `/glossary/[term]` — DefinedTerm, FAQPage, BreadcrumbList
- [ ] `/product-intelligence/[slug]` — Product *(pending Sprint 2)*
- [ ] `/industrial-cluster/[slug]` — Place *(pending Sprint 2)*
- [ ] **Zero errors** on all templates; warnings triaged
- [ ] Schema.org validator (https://validator.schema.org) also clean

### 5.2 Truthfulness audit 🔴 — every structured-data change
- [ ] No `AggregateRating` / `ratingValue` / `reviewCount` without real reviews
- [ ] No `offerCount` / `numberOfItems` not matching rendered reality
- [ ] No `Offer` with a price VyaparSethu does not authoritatively hold
- [ ] No FAQ markup for Q&A not visible on the page
- [ ] Every breadcrumb `item` URL returns 200
- [ ] Breadcrumb leaf equals page canonical

### 5.3 Social previews 🟡
- [ ] Facebook Sharing Debugger — correct title, description, image
- [ ] LinkedIn Post Inspector — correct preview
- [ ] `og:image` returns 200 on every tested URL
- [ ] WhatsApp preview renders correctly (**primary B2B sharing channel in India**)

---

## 6. Lighthouse

Mobile, simulated 4G, incognito. **Median of 3 runs** — single runs are noisy.

### 6.1 Thresholds

| Metric | Target | Blocking |
|---|---|---|
| Performance | ≥ 70 mobile / ≥ 90 desktop | 🟡 |
| Accessibility | ≥ 90 | 🟡 |
| Best Practices | ≥ 90 | 🟡 |
| SEO | **100** | 🔴 |
| LCP | < 2.5 s | 🟡 |
| INP | < 200 ms | 🟡 |
| CLS | < 0.1 | 🔴 |

### 6.2 SEO audit — all must pass 🔴
- [ ] Document has a `<title>`
- [ ] Document has a meta description
- [ ] Page has a successful HTTP status code
- [ ] Links have descriptive text
- [ ] Links are crawlable
- [ ] Page is not blocked from indexing
- [ ] `robots.txt` is valid
- [ ] Image elements have `[alt]` attributes
- [ ] Document has a valid `hreflang` *(N/A until Sprint 6)*
- [ ] Document has a valid `rel=canonical` — **the check that catches `SEO-P0-01`**

### 6.3 Per-template runs 🟡
Homepage · `/categories/[category]` · `/suppliers/[city]` · `/blog/[slug]` · `/pricing`

Track: LCP element identity, CLS sources, total blocking time, unused JS/CSS.

> **Baseline caveat:** field data collected before 2026-07-30 is unreliable — Google was rendering the site with no CSS or JavaScript. Re-baseline 1–2 weeks after `c937ae8` before drawing conclusions or starting Sprint 9.

---

## 7. Semrush

### 7.1 Post-deploy audit 🔴 — after any robots, sitemap, or canonical change
- [ ] Re-run Site Audit
- [ ] **Blocked internal resources in robots.txt: expect 0** (baseline before fix: **1,240**)
- [ ] Compare total issue count against the previous crawl
- [ ] Review newly *surfaced* issues — previously masked, not new regressions
- [ ] Site Health score trend

> **Expect the headline number to drop sharply while a smaller set of previously-hidden issues appears.** Predicted to surface: ~16 duplicate-canonical, 1 redirect-in-sitemap, possible 429 warnings. This is healthy, not a regression.

### 7.2 Issue categories to monitor 🟡
- [ ] Crawlability — 4xx, 5xx, redirect chains, **429s**
- [ ] Duplicate content — titles, descriptions, canonical conflicts
- [ ] Internal linking — orphans, crawl depth > 3, broken links
- [ ] Markup — structured-data errors
- [ ] Performance — slow pages, large payloads

### 7.3 Crawl configuration 🔵
- [ ] Note the configured page limit — the pre-fix reconciliation (1,240 ÷ 14 ≈ 88 pages) suggests a ~100-page cap against a **684-URL** sitemap
- [ ] Crawl rate low enough to avoid the rate limiter until `SEO-P0-02` ships
- [ ] Consider raising the page limit after the limiter fix, so the audit reflects the whole site

---

## 8. Ahrefs

### 8.1 Site Audit 🟡
- [ ] Health Score trend
- [ ] Indexability — noindex, canonical, redirect issues
- [ ] **Canonical points to non-canonical / canonical from HTTP to HTTPS** — catches `SEO-P0-01`
- [ ] Duplicate pages without canonical
- [ ] Orphan pages
- [ ] Zero broken internal links; zero broken outgoing links
- [ ] Redirect chains and loops

### 8.2 Backlinks and authority 🔵
- [ ] Domain Rating trend
- [ ] Referring domains — growth and losses
- [ ] **If D-DOM-01 is ratified:** monitor authority transfer from bell24h.com to vyaparsethu.com over 90 days. This is the primary quantitative evidence of whether the migration is succeeding
- [ ] Lost backlinks pointing at the old domain

### 8.3 Organic performance 🔵
- [ ] Organic traffic and keyword trends
- [ ] Top pages — do the 16 previously self-cancelling URLs begin ranking after `SEO-P0-01`?
- [ ] Content gap vs IndiaMART and other competitors
- [ ] Cannibalization — multiple URLs ranking for one keyword (tracks `SEO-P2-01`)

---

## 9. AI Search

No standard tooling exists; these are manual, repeatable probes. **Run the same prompts each time** so results are comparable.

### 9.1 Crawler access 🔴
- [ ] `curl -s "$SITE/llms.txt"` returns 200 `text/plain`
- [ ] `robots.txt` per-bot groups match decision **D-AI-02** exactly
- [ ] Any allowed AI crawler can reach CSS and JS (same check as §3.4 — they were blocked by the `/_next` bug too)
- [ ] Server logs show AI crawler user-agents receiving 200, not 429

### 9.2 Citation probes 🟡 — monthly
Run the same query set across ChatGPT, Perplexity, Claude, and Gemini:

- [ ] "Best B2B marketplace for Indian MSMEs"
- [ ] "How do I find verified steel suppliers in India"
- [ ] "What is a Trade Confidence Score"
- [ ] "B2B suppliers in Bhiwandi" *(geographic probe)*
- [ ] "How does protected payment work for Indian B2B trade"

Record for each: whether VyaparSethu is mentioned · whether it is linked · which page is cited · what facts are attributed · whether any attributed fact is **wrong** (the highest-priority signal — incorrect attribution is worse than absence).

### 9.3 Google AI Overviews 🟡
- [ ] Do target queries trigger an AI Overview?
- [ ] Is VyaparSethu cited?
- [ ] Which page is cited, and does it match the page you would want cited?

### 9.4 Extractability 🟡
- [ ] Key pages answer their core question in the **first paragraph**
- [ ] Headings are self-describing and chunk cleanly
- [ ] Definitions are self-contained (the `/glossary/*` template is the model — DefinedTerm + FAQPage + BreadcrumbList)
- [ ] Primary data (Trust Score formula, cluster datasets) is published and citable — original data earns citations; marketing copy does not

---

## 10. Release gate summary

Minimum before any SEO-affecting production deploy:

| Gate | Sections | Blocking |
|---|---|---|
| Local build + four invariants | 1.1, 1.2 | 🔴 |
| Robots output | 1.3 | 🔴 |
| Metadata on changed pages | 1.4 | 🔴 |
| Preview asset crawlability | 2.2 | 🔴 |
| Middleware regression *(if `middleware.ts` touched)* | 2.3 | 🔴 |
| Production core endpoints | 3.2 | 🔴 |
| Production template smoke test | 3.3 | 🔴 |
| Production assets and caching | 3.4 | 🔴 |
| GSC live render + canonical check | 4.1 | 🔴 |
| Rich Results *(if structured data touched)* | 5.1, 5.2 | 🔴 |

**Post-deploy monitoring window:** 14 days on GSC Coverage and Crawl Stats after any canonical, robots, sitemap, or domain change.

---

## Appendix — Historical baselines

Measured 2026-07-30, deployment `bell24h-339udlwh9`, commit `c937ae8`. Compare against these when assessing regressions.

| Metric | Baseline |
|---|---|
| Sitemap URLs | 684 |
| Sitemap size | 124,260 B |
| Static pages generated | 375 |
| API routes | 201 |
| Public page templates | 125 |
| …with metadata export | 42 |
| …setting canonical | 29 |
| Unique `/_next` assets per page | 14–17 |
| Shared First Load JS | 87.6 kB |
| Middleware bundle | 27.9 kB |
| App CSS bundle | 123,104 B |
| `@font-face` rules | **0** |
| Build duration | ~3 min |
| Semrush blocked-resource issues (pre-fix) | **1,240** |
| Canonical scan | 83 self / 2 homepage / 1 cross / 1 missing, of 87 |
| Rate-limit measurement | 198 × 429 of 295 parallel requests |
