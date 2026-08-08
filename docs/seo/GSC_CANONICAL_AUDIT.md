# Google Search Console Canonical & Indexing Audit

**Date:** 8–9 Aug 2026
**Scope:** Diagnose and fix GSC's "Duplicate, Google chose different canonical than user" alert plus the surrounding indexing picture (244 indexed / 494 not indexed). Minimum safe fixes only. No marketplace, RFQ, quote, deal, wallet, escrow, or auth logic touched.
**Evidence tagging:** every claim below is marked **VERIFIED** (confirmed via live production HTTP/HTML or `next build` output), **INFERRED** (reasoned from code + verified data, not independently confirmed), or **UNKNOWN** (couldn't be determined this session).

---

## 1. Executive summary

Live production testing of the site's own HTML found two real, mechanical canonical-declaration bugs that are the strongest available explanation for the "Duplicate, Google chose different canonical than user" alert:

- **`/suppliers`** (the supplier directory index — footer-linked, sitemapped at priority 0.85) was a client component with **no metadata export at all**, so it silently served the **homepage's** `<title>` and `<link rel="canonical" href="https://www.vyaparsethu.com">`. **VERIFIED** live, 8 Aug 2026.
- **`/industrial-cluster`** (the cluster hub — sitemapped) had page-specific title/description but **no `alternates.canonical`**, so it inherited the root layout's `canonical: '/'` — also self-declaring the homepage. **VERIFIED** live, 8 Aug 2026.

Both are now fixed (§17). Both are exactly the shape of bug that produces this specific GSC alert: the page declares one canonical (homepage) while its content is clearly distinct, well-linked, sitemapped content — Google's own algorithm is likely to pick the page itself as canonical, which disagrees with what we declared. I do **not** have the literal two flagged URLs from GSC (see §4 for why), so this is the best evidence-based explanation available, not a confirmed match — treat it as **INFERRED**, not **VERIFIED**, until you re-check these two URLs in GSC's URL Inspection tool after this fix ships and reindexes.

Also found and fixed: a live, VERIFIED soft-404 on `/supplier/[id]` (nonexistent ids returned HTTP 200), an orphan content hub (`/learn` + 3 guides — real content, unlinked, unsitemapped), and a title-tag bug that double-appended the brand suffix.

Also found and **deliberately left alone**: the identical soft-404 pattern exists on `/rfq/[id]` and is worse there (it's the sitemapped, and higher-volume of the two) — but `/rfq/[id]` is explicitly out of scope ("do not touch RFQ logic") per this task's own guardrail, so it's documented here for separate approval rather than fixed. Per this account's standing "finding promotion gate" policy, evidence alone doesn't authorize the fix — it needs an explicit go-ahead.

## 2. GSC evidence as given (8 Aug 2026)

| Status | Count |
|---|---|
| Indexed | 244 |
| Not indexed | 494 |
| — Discovered, currently not indexed | 422 |
| — Alternate page with proper canonical tag | 44 |
| — Page with redirect | 14 |
| — Crawled, currently not indexed | 4 |
| — Soft 404 | 5 |
| — **Duplicate, Google chose different canonical than user** | **2** |
| — Redirect error | 2 |
| — Not found (404) | 1 |

I did not have live GSC access this session (§4), so none of the above per-URL lists could be pulled directly. All per-category analysis below is code- and production-HTTP-based diagnosis, explicitly tagged.

## 3. Domain consistency — VERIFIED, and one finding worth flagging prominently

Verified via direct production HTTP requests (`curl`, no browser, no auth):

| Request | Result |
|---|---|
| `https://vyaparsethu.com/` | 308 → `https://www.vyaparsethu.com/` |
| `http://vyaparsethu.com/` | 2-hop chain → `https://www.vyaparsethu.com/` (200) |
| `https://www.bell24h.com/` | 301 → `https://www.vyaparsethu.com/` |
| `http://bell24h.com/` | 2-hop chain → `https://www.vyaparsethu.com/` (200) |
| `https://www.vyaparsethu.com/` | 200 (canonical host) |

**`https://www.vyaparsethu.com` is the single enforced canonical host in production today** — every variant (apex, non-www, http, both brand domains) redirects there in ≤2 hops. This matches `NEXT_PUBLIC_SITE_URL` in `vercel.json` and `lib/site-url.ts`'s `SITE_URL`, which every canonical/OG/sitemap/robots call in the codebase uses. Domain signals in code are internally consistent — no code changes needed here.

**Flag for the founder, not a code fix:** `CLAUDE.md`'s Controlled Rebrand Scope says *"Domain: bell24h.com stays primary until 50+ verified suppliers onboarded; vyaparsethu.com becomes primary only at Phase 2."* Production already redirects `bell24h.com` straight to `www.vyaparsethu.com` — i.e. the domain cutover described as a future Phase 2 step already appears to be live. This is a **VERIFIED** contradiction between documented policy and live behavior. It's almost certainly a Vercel domain-alias setting (the in-repo `middleware.ts` domain-redirect block is gated behind `REDIRECT_BELL24H_TO_VYAPARSETHU`, which — going by this live behavior — would have to be `true`, though I can't read Vercel env vars from the repo to confirm that's actually the mechanism; **UNKNOWN** whether it's the middleware flag or a Vercel dashboard-level domain redirect). Either way it's a **platform/dashboard-level setting, not a code change**, so it's out of scope for this commit — flagging it because the task explicitly asked to verify domain intent against production reality rather than assume, and this is a real mismatch worth a deliberate decision rather than silence.

The two-hop `http → https → www` redirect chains are standard Vercel apex/http handling, not an app-level defect — not worth "fixing" (no app code produces it).

## 4. Why the 2 conflict URLs are INFERRED, not VERIFIED

Phase 4 of this task's own instructions call for identifying the two URLs from GSC URL Inspection data before falling back to code-pattern inference. I checked for that data in two ways before inferring:

1. **Repo/docs search** — `docs/seo/` did not exist before this audit; grepped `docs/` for "different canonical", "duplicate canonical", "GSC", "search console" — matches were all in existing SEO planning docs (`ENTERPRISE_SEO_*`, `SEO_DECISIONS.md`, `SPRINT_0*_*.md`), none contain an exported GSC URL list or a record of these two specific URLs.
2. **Live GSC access** — attempted via the connected Chrome session. The signed-in Google account (`bell24h.info@gmail.com`) does not have access to the `vyaparsethu.com` Search Console property ("Oops, you don't have access to this property"), and no properties are registered under that session at all. I did not attempt to sign in as a different account — that would require entering credentials, which I don't do. **This means the exact two URLs are UNKNOWN this session.**

Given that, §1/§17 findings are the best **INFERRED** explanation from live production evidence, not a confirmed match. **Action for you:** after this fix deploys and Google reindexes, check GSC → Indexing → Pages → "Duplicate, Google chose different canonical than user" and confirm whether `/suppliers` and/or `/industrial-cluster` are still listed, or were the two all along.

## 5. P0 fixes — wrong self-declared canonical (the leading theory)

### 5a. `/suppliers` — no metadata at all

`src/app/suppliers/page.tsx` is `'use client'` (live search/filter UI over `/api/suppliers`) and therefore cannot export `metadata`/`generateMetadata` — a Next.js restriction. With no sibling `layout.tsx` providing it, the page fell through to the root layout's defaults entirely.

**VERIFIED live before fix** (`curl https://www.vyaparsethu.com/suppliers`):
```html
<title>VyaparSethu — Protected Trade Infrastructure</title>
<meta name="description" content="VyaparSethu — Verified suppliers, protected payments, faster quotations for Indian MSMEs."/>
<link rel="canonical" href="https://www.vyaparsethu.com"/>
```
Identical to the homepage's own tags. `/suppliers` is footer-linked ("Find Suppliers"), sitemapped at priority 0.85, and linked from `not-found.tsx` — a real, important, distinct page telling Google it's a duplicate of the homepage.

**Fix:** added `src/app/suppliers/layout.tsx` — same pattern already used for `/supplier/[id]` — with its own title, description, OG tags, and self-referencing canonical. Verified in `next build` output (`.next/server/app/suppliers.html`):
```html
<title>Find Verified B2B Suppliers in India | VyaparSethu</title>
<link rel="canonical" href="https://www.vyaparsethu.com/suppliers"/>
```
This layout only wraps `/suppliers` itself — `/suppliers/[city]`, `/suppliers/[city]/[category]`, and `/suppliers/manufacturers` all already declare (or, for `manufacturers`, already lacked) their own metadata independently, and a child segment's `alternates` fully replaces the parent's, so this change doesn't alter their canonical behavior. **Confirmed:** `/suppliers/[city]/[category]/page.tsx` declares its own canonical — unaffected. `/suppliers/manufacturers/page.tsx` has no metadata either (client component, hardcoded placeholder data, not in sitemap) — it will now inherit `/suppliers`'s canonical instead of the homepage's, which is a strict improvement even though it's not itself fixed this round (that page's fabricated-looking supplier list is a content/data issue outside this audit's scope — flagged, not touched).

### 5b. `/industrial-cluster` (index) — canonical never declared

`src/app/industrial-cluster/page.tsx` declared its own `title`/`description` correctly but never set `alternates.canonical`, so it inherited the root layout's `canonical: '/'`.

**VERIFIED live before fix:**
```html
<title>Industrial Clusters — Business Intelligence | VyaparSethu</title>
<link rel="canonical" href="https://www.vyaparsethu.com"/>
```
Title was page-specific (so this wouldn't show up as an obvious duplicate-title issue) — only the canonical tag was wrong, which is exactly the harder-to-notice version of this bug.

**Fix:** added `alternates: { canonical: `${SITE_URL}/industrial-cluster` } }`. Verified in build output:
```html
<link rel="canonical" href="https://www.vyaparsethu.com/industrial-cluster"/>
```

### 5c. Individual `/industrial-cluster/[slug]` pages — false alarm, no bug

Initial testing of `/industrial-cluster/bhiwandi-textile-cluster` also showed homepage-default metadata, which looked like the same bug. On checking the actual HTTP status it's a **correct 404** (`FLAGS.INTELLIGENCE_ENABLED` is off pre-Phase-D per `CLAUDE.md`, and the page body calls `notFound()`; Next.js's not-found boundary falls back to root layout metadata, which is expected behavior, not a defect). No change made. **VERIFIED** via `curl -I` → `HTTP/1.1 404 Not Found`.

## 6. P1 fix — `/supplier/[id]` soft-404 (the task's own named P1 item)

The task described this as an open gap; on inspection it was **already partially fixed** in commits `8547b6e` / `b3f0f10` — a real `layout.tsx` with `generateMetadata` (server-side, correct title/description/canonical/JSON-LD via `src/lib/supplier-seo.ts`) already exists. **No canonical-tag work was needed here.**

What was still broken, **VERIFIED live**: a nonexistent supplier id returned HTTP 200.
```
curl -o /dev/null -w "%{http_code}" https://www.vyaparsethu.com/supplier/nonexistent-fake-id-12345
→ 200
```
`fetchSupplierForSeo()` (used by the layout) returned `null` for a missing id, which correctly produced a "Supplier Not Found" `<title>` — but the layout never called `notFound()`, so the client-rendered page.tsx still returned the same "Supplier not found" text at HTTP 200. Textbook Soft 404.

**Caught before fixing, not after:** `fetchSupplierForSeo` filtered `where: { id, role: 'SUPPLIER' }`, while the live public API it mirrors (`/api/supplier/[id]/route.ts`) resolves **any** user id with no role filter — consistent with `CLAUDE.md`'s dual-role architecture ("every account is simultaneously a buyer and supplier... role in DB is a display preference, not an access gate"). Gating the new `notFound()` on the role-filtered result would have 404'd real, live, buyer-role users' profile pages — an access-gate regression the architecture explicitly forbids. Fixed by dropping the role filter from `fetchSupplierForSeo` (matching the public API's actual existence semantics) before adding `notFound()` in the layout for ids that don't exist at all.

Both `tsc --noEmit` and `next build` pass with these changes; `/supplier/[id]` still builds as a dynamic (`ƒ`) route.

## 7. Reported, not fixed — `/rfq/[id]` has the identical soft-404 bug

**VERIFIED live:**
```
curl -o /dev/null -w "%{http_code}" https://www.vyaparsethu.com/rfq/nonexistent-fake-id-12345
→ 200
```
`src/app/rfq/[id]/page.tsx` is `'use client'`, fetches client-side, and renders an "error" state for a missing/expired RFQ — HTTP status stays 200 throughout. `src/app/rfq/[id]/layout.tsx` only sets a canonical, no title/description, no server-side existence check. Mechanically identical to the `/supplier/[id]` bug just fixed, and arguably a larger contributor given sitemap volume (up to 500 RFQ URLs, `changeFrequency: weekly`) and natural churn as RFQs leave `ACTIVE` status and drop out of the sitemap while their URLs may already be indexed.

**Not fixed in this commit.** This task's own scope guardrail says *"Do NOT touch marketplace, RFQ, quote, deal, wallet, escrow, or auth logic"* — `/rfq/[id]` is explicitly RFQ-scoped. Per this account's standing policy (evidence alone doesn't authorize a build — needs explicit approval), this is reported for a separate, deliberately-scoped follow-up rather than folded into an "SEO-only" commit that the instructions asked to keep isolated.

## 8. Fixed — orphan content: `/learn` hub + 3 guides

`/learn`, `/learn/what-is-b2b-marketplace`, `/learn/how-to-find-verified-b2b-suppliers-india`, `/learn/b2b-procurement-guide-india` are real, substantial guide pages with correct per-page canonicals — but **VERIFIED** absent from `sitemap.ts` and **VERIFIED** unlinked from `Header`, `Footer`, or the homepage (`grep` for `/learn` across `src/components` and `src/app/page.tsx`: no matches). An orphan page Google can only find by accident is a textbook contributor to "Discovered, currently not indexed."

**Fixed:**
- Added all 4 URLs to `sitemap.ts` (P2 sitemap hygiene).
- Added "Learn" and "Blog" links to the Footer's "Platform" section (`/blog` had the same problem — sitemapped but not footer-linked; not orphaned overall since it's linked from the homepage's likely nav, but adding it here costs nothing and closes the same gap).

Also fixed while in this file: `/learn`'s own `<title>` had the "| VyaparSethu" suffix baked into a plain string, which the root layout's `template: '%s | VyaparSethu'` then appended a second time. **VERIFIED live before fix:**
```html
<title>Learn B2B Procurement — Guides for Indian SMEs | VyaparSethu | VyaparSethu</title>
```
Fixed by wrapping in `title: { absolute: '...' }` (the pattern already used correctly elsewhere, e.g. `src/lib/supplier-seo.ts`). The 3 guide sub-pages do not have this bug (bare titles, correctly templated once) — checked individually, no changes needed there.

## 9. Reported, not fixed — the same title-double-suffix bug exists more widely

Systematic grep for a bare-string top-level `title:` field that already contains `"| VyaparSethu"` found the identical bug in ~12 more files: `tools/page.tsx`, `glossary/page.tsx`, `features/page.tsx`, `features/voice-rfq/page.tsx`, `features/regional-languages/page.tsx`, `founding-suppliers/page.tsx`, `how-verification-works/page.tsx`, `how-payment-works/page.tsx`, `media-kit/page.tsx`, `press/page.tsx`, `blog/layout.tsx`, `marketplace/layout.tsx`, plus the legal pages listed in §11 (template-literal variant, `` `X | ${LEGAL_ENTITY.platform}` ``). **VERIFIED** for `tools`, `glossary`, `press` via live `curl`:
```html
<title>Free B2B Tools — HSN Lookup, GST Calculator & More | VyaparSethu | VyaparSethu</title>
<title>B2B Trade Glossary — MSME, HSN, GST, RFQ & More | VyaparSethu | VyaparSethu</title>
```
**INFERRED, not confirmed individually**, for the rest (same code shape, not each re-curled). This is a real page-quality defect (double brand suffix in SERP snippets) but it doesn't itself cause a canonical-URL disagreement — it's a title-tag issue, not a canonical one — so it's lower priority than §5/§6 and was **not fixed in this commit** to keep the diff to the P0/P1 items with a direct, verified line to the GSC alert. `/learn` was the one exception fixed, because this audit was already touching that page for the sitemap addition. Recommend a small dedicated follow-up pass across the ~12 files above.

## 10. P2 fix — robots.txt gap

`middleware.ts`'s `PROTECTED_USER_PATHS` gates `/checkout`, `/wallet`, `/messages`, `/notifications`, `/negotiation`, `/rfq/create`, `/dashboard` behind an auth-token redirect. `robots.ts` already disallowed `/dashboard/` but not the other five. None are linked publicly or sitemapped (**VERIFIED** no internal links found), so this isn't an active indexing problem, but it's a real inconsistency between the auth gate and the crawl directives — a crawler that stumbles onto one of these would get bounced through a login-redirect rather than a clean disallow. Added the five paths to `robots.ts`'s disallow list. `/rfq/create` was deliberately left alone — it's intentionally public and in the sitemap (Speak/Post Requirement is a real, unauthenticated-visible marketing page even though submitting requires login).

## 11. Reported, not fixed — legal pages missing canonical

`consent`, `cookies`, `data-retention`, `privacy`, `refund-policy`, `shipping`, `terms`, and `(legal)/refund` all export `metadata` but none declare `alternates.canonical`, so each inherits the homepage canonical — same bug class as §5, same mechanism. **Not fixed in this commit.** These are `changeFrequency: 'yearly'`, `priority: 0.3` pages in the sitemap; Google essentially never treats generic legal boilerplate as competing for a query, so this is very unlikely to be either of the 2 flagged URLs, and batch-editing 8 files for a low-traffic page class would have pushed this past a "minimum, isolated" commit. Flagging as a defensible, mechanical follow-up (same one-line fix pattern as §5b) rather than doing it here. `downloads/b2b-glossary/page.tsx` has the same gap but is deliberately `robots: { index: false, follow: false }` — noindex pages don't need a canonical, not an issue.

`rfq/create/layout.tsx` and `voice-rfq/layout.tsx` also lack `alternates` — both left untouched: the former is explicitly RFQ-scoped (§7's guardrail), the latter is RFQ-adjacent enough (voice RFQ funnel) that I treated it the same way rather than guess at the line.

## 12. The 44 "Alternate page with proper canonical tag" — verified as working as intended, not touched

Per the task's own instruction, these are correct if their canonicals point to the right primary page, and should be kept, not removed. Cross-referencing the codebase's patterns, the most likely composition (**INFERRED**, no per-URL GSC list available — see §4):

- `/suppliers/{city}/{category}` variants (62 static pages, `next build` confirms `+59 more paths` beyond the 3 shown) that substantially overlap in template structure with `/suppliers/{city}` and `/categories/{category}` — each declares its own correct self-canonical (**VERIFIED** in code), so Google folding some into an "alternate, canonical is fine" bucket is expected, not a defect.
- `/location/{area}` pages for the 18 cities in `src/data/city-category-seo.ts` — each has a correct self-canonical, but for a city with zero live Business Pulse activity (**VERIFIED**: `pulse.hasActivity` gates all the page's dynamic sections; pre-Phase-D, essentially every city is in this state) the page's remaining unique content is a single placeholder sentence plus a category grid that's near-identical in text and link targets to `/suppliers/{city}`'s own grid. This is a plausible **contributing mechanism** to the broader duplicate-content pattern across the `/suppliers/{city}` / `/location/{area}` / `/industrial-cluster/{slug}` cluster (up to 3 pages describe the same place — confirmed for at least `bhiwandi`, `kalamboli`, `chakan`, `surat`, `rajkot`, which appear in both `CITIES` and `INDUSTRIAL_CLUSTERS`), but it does **not** by itself explain why only 2 specific URLs were flagged as outright conflicts rather than dozens showing up in this bucket or the 422 bucket — it's a plausible piece of the picture, not a confirmed cause of any specific URL. Correctly left alone: both page types serve genuinely different intents (directory vs. live-activity feed vs. cluster profile) and the task explicitly says don't merge or remove legitimate alternates.

No changes made in this section — verification only, as instructed.

## 13. The 422 "Discovered, currently not indexed" — grouped for diagnosis only, nothing changed

Per the task's explicit instruction, this was diagnosed by URL-pattern and reported, not "fixed" — this bucket is predominantly a domain-authority/crawl-budget outcome on a DR-~0 site, not a canonical defect.

| Pattern | Approx. count | Sitemapped? | Internally linked? | Likely reason |
|---|---|---|---|---|
| `/suppliers/{city}/{category}` | 62 | Yes | Yes (from `/suppliers/{city}`) | Long-tail combinatorial pages, thin crawl priority on a new/low-DR domain |
| `/location/{area}` | 18 | Yes | Yes | Thin when `pulse.hasActivity` is false (pre-Phase-D, essentially all of them today) — see §12 |
| `/supplier/{id}` + `/supplier/{id}/products/{slug}` | up to 1000 + products | Yes (claimed, active suppliers only) | Partially (via city/category pages, not a full directory crawl path) | Low per-page authority, high volume, new domain |
| `/rfq/{id}` | up to 500 | Yes (`ACTIVE`, public, non-seeded only) | Weakly | High churn — URLs leave the sitemap once an RFQ's status changes, but may already be indexed from when they were `ACTIVE`; new domain crawl budget |
| `/glossary/{term}` | 14 | Yes | Yes (from `/glossary`) | Low individual search demand terms, new domain |
| `/blog/{slug}` | 23 | Yes | Partially (no footer link before this fix — §8) | New domain, thin backlink profile |
| `/learn/*` | 4 | **No, until this fix** | **No, until this fix** | Orphan — see §8, now fixed |

Overall assessment (**INFERRED**): the 422 count is consistent with a young, DR-~0 domain publishing a large number of legitimately unique but individually low-demand pSEO pages faster than Google's crawl budget and trust signals can absorb them — exactly what the task describes as the expected, non-actionable explanation. No changes made to chase this number down; per instructions, it isn't the target.

## 14. Soft 404s (5), Redirect errors (2), Not Found (1) — no confirmed matches, one real mechanism documented

Without the specific 8 URLs (see §4), I could not map GSC's 5 Soft 404s / 2 redirect errors / 1 Not Found to exact pages. What I could verify:

- **Only known live soft-404 mechanism:** `/supplier/[id]` (fixed, §6) and `/rfq/[id]` (documented, not fixed, §7) for nonexistent ids.
- **Redirects:** the only application-level redirect is `next.config.js`'s single entry, `/rfq/new → /rfq/create` (308, permanent) — checked for chains/loops, none found (single hop, destination is a real live route). Middleware's auth-redirects (`/dashboard`, `/checkout` etc. → `/auth/phone-email`) are not sitemapped/public-linked so shouldn't be crawled, and are now robots-disallowed (§10) as belt-and-suspenders. No redirect-error mechanism identified in code; **UNKNOWN** whether the 2 GSC redirect errors are these paths, stale cached URLs from before a fix, or something outside the repo (e.g. a Vercel-level rule).
- **Categories/blog/glossary/location `[dynamic]` routes** all correctly call `notFound()` for a missing slug and were spot-verified returning real HTTP 404s (§3's table plus `categories`, `blog`, `location` all 404 on a fake slug — **VERIFIED**).
- **404 handling:** `src/app/not-found.tsx` is a standard client `not-found` page; `next build`'s and every `notFound()` call above route through it correctly with a genuine 404 status.

No changes made here beyond the `/supplier/[id]` fix already covered in §6 — insufficient evidence to safely touch anything else in this category without the actual flagged URLs.

## 15. Sitemap hygiene (P2) — verified clean, one gap fixed

Checked `sitemap.ts` for: wrong hostname (uses `SITE_URL` throughout — **VERIFIED** consistent), non-HTTPS URLs (none), stale category slugs (the file's own comments document a prior fix removing 36 dead static category slugs in favor of a live DB query with static-list fallback only on DB failure — **VERIFIED** current code), 3xx/404 URLs (none identified — RFQ/supplier pages are filtered to `ACTIVE`/`isPublic`/claimed+active respectively before being added). The one gap found and fixed was the `/learn` orphan (§8). No other contamination found.

## 16. Robots.txt audit — one gap fixed (§10), otherwise correct

`/api/`, `/admin/`, `/dashboard/`, and the account-management supplier subpaths are all correctly disallowed; the public supplier directory (`/suppliers/*`) and public profiles (`/supplier/[id]`) are correctly **not** disallowed (a prior fix, documented in `middleware.ts`'s own comments, specifically to stop an over-broad `/supplier` prefix match from blocking Googlebot on these). `sitemap:` directive present and correct.

## 17. Files changed

| File | Change | Why |
|---|---|---|
| `src/lib/supplier-seo.ts` | `fetchSupplierForSeo` no longer filters `role: 'SUPPLIER'` | Was silently role-gating a page the architecture says must not be role-gated (§6) |
| `src/app/supplier/[id]/layout.tsx` | Added `notFound()` for nonexistent supplier ids | Fixes verified live Soft 404 (§6) |
| `src/app/suppliers/layout.tsx` | **New file** — title/description/OG/canonical | Fixes verified live wrong-canonical-to-homepage bug (§5a) |
| `src/app/industrial-cluster/page.tsx` | Added `alternates.canonical` | Fixes verified live wrong-canonical-to-homepage bug (§5b) |
| `src/app/learn/page.tsx` | `title` wrapped in `{ absolute: ... }` | Fixes verified live double brand-suffix title (§8) |
| `src/app/sitemap.ts` | Added `/learn` + 3 guide URLs | Fixes verified orphan-page gap (§8) |
| `components/Footer.tsx` | Added "Learn" and "Blog" links to Platform section | Fixes verified missing internal links (§8) |
| `src/app/robots.ts` | Added 5 auth-gated paths to disallow | Consistency with `middleware.ts` (§10) |

No changes to `prisma/schema.prisma`, any `/api/*` route, RFQ/quote/deal/wallet/escrow logic, auth logic, or homepage structure.

## 18. Validation

- **`npx tsc --noEmit`**: pre-existing, unrelated errors only (payment services, traffic/voicebot services, test utilities — none in any file this audit touched); confirmed via targeted grep for the 5 changed files, zero matches.
- **`npx next build`**: exits 0, `✓ Compiled successfully`. All 4 `/learn` routes, `/suppliers`, `/industrial-cluster`, and `/supplier/[id]` present in the route manifest with expected static/dynamic markers (`○`/`ƒ`).
- **Representative URL checks** (production, before/after this commit deploys — "after" column is from the local `next build` static output, since the fix hasn't shipped yet):

| URL | Status | Canonical before | Canonical after (local build) | Title before | Title after |
|---|---|---|---|---|---|
| `/suppliers` | 200 | `.../` (bug) | `.../suppliers` | Homepage default | "Find Verified B2B Suppliers in India \| VyaparSethu" |
| `/industrial-cluster` | 200 | `.../` (bug) | `.../industrial-cluster` | Already correct | Unchanged |
| `/learn` | 200 | `.../learn` (already correct) | `.../learn` | "...VyaparSethu \| VyaparSethu" (bug) | "...VyaparSethu" |
| `/supplier/nonexistent-fake-id` | 200 (bug) | n/a | Will 404 once deployed | "Supplier Not Found" (200) | 404 |

Domain, robots, and sitemap checks are covered in §3, §15, §16 respectively. Since `sitemap.ts` and `robots.ts` are dynamic route handlers (`export const dynamic = 'force-dynamic'`), the static `next build` manifest doesn't exercise their served output — confirmed separately with `next start` against a local runtime:
```
curl localhost:3000/sitemap.xml | grep -c learn        → 4   (all 4 /learn URLs present)
curl localhost:3000/robots.txt                          → includes new Disallow: /checkout, /wallet, /messages, /notifications, /negotiation
curl localhost:3000/suppliers | grep canonical           → https://www.vyaparsethu.com/suppliers
curl localhost:3000/industrial-cluster | grep canonical  → https://www.vyaparsethu.com/industrial-cluster
```
All four served correctly at runtime, not just in source.

## 19. Remaining issues (not fixed, need a decision)

1. `/rfq/[id]` soft-404 — same bug as the one just fixed for `/supplier/[id]`, out of scope per this task's RFQ guardrail (§7). Needs explicit approval for a follow-up.
2. `bell24h.com → www.vyaparsethu.com` production redirect appears to contradict `CLAUDE.md`'s documented Phase 2 timing (§3). Needs a founder decision on whether that's intentional (and `CLAUDE.md` should be updated) or a misconfiguration.
3. Title double-brand-suffix bug in ~12 more files + 8 legal pages (§9, §11) — mechanical, low-risk, but deliberately left out of this "minimum, isolated" commit.
4. `/suppliers/manufacturers` — hardcoded, apparently fabricated supplier/rating data, not in sitemap, no metadata. Content/data-integrity issue outside this audit's scope; flagged for product review.
5. The exact identity of the 2 flagged URLs, the 5 Soft 404s, the 2 redirect errors, and the 1 Not Found is **UNKNOWN** — this session had no working GSC access (§4).

## 20. Google revalidation plan

1. Deploy this commit.
2. In GSC → Indexing → Pages, request re-indexing (URL Inspection → Request Indexing) for `https://www.vyaparsethu.com/suppliers` and `https://www.vyaparsethu.com/industrial-cluster` specifically, since those are the two concrete canonical fixes.
3. Check whether the "Duplicate, Google chose different canonical than user" count drops from 2 to 0 over the following 1–2 weeks (GSC re-evaluates on its own crawl schedule; don't expect instant movement).
4. If it's still 2 after reindexing, use URL Inspection on the flagged URLs directly (a GSC account with property access is needed — see §4) to get the actual URLs and re-run this diagnosis with real data instead of inference.
5. Do not expect the 422 "Discovered, not indexed" number to move meaningfully from this commit — per §13, that's expected to resolve gradually as domain authority and crawl budget grow, not from a code fix.
