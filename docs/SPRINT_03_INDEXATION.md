# Sprint 03 — Indexation

**Parent program:** [ENTERPRISE_SEO_MASTER_PROGRAM.md](ENTERPRISE_SEO_MASTER_PROGRAM.md)
**Backlog items:** `SEO-P0-04` · `SEO-P1-03` · `SEO-P1-04` · `SEO-P2-06`
**Priority band:** P0 / P1
**Status:** ⏸ **Not started — must follow Sprint 1 T1**
**Created:** 2026-07-31

---

## Sprint goal

Give every indexable page its own identity — title, description, canonical, and OpenGraph — so Google can distinguish, attribute, and rank each one on its own merits.

## Why this sprint is second, not later

Sprint 1 T1 removes the inherited homepage canonical from the root layout. Until this sprint completes, the 87 affected routes emit **no** canonical at all. That is a better state than a wrong canonical, but it is an interim state. **Sprint 3 is what makes Sprint 1 T1 safe to have shipped.**

## Measured starting position

| Metric | Value | Source |
|---|---|---|
| Public page templates (excl. admin/dashboard/auth/supplier-account) | **125** | repo scan |
| …with a `metadata` or `generateMetadata` export | **42** | repo scan |
| …**without** any metadata export | **83** | repo scan |
| …setting `alternates.canonical` | **29** | repo scan |
| Sitemap URLs live-confirmed emitting homepage canonical | **16 / 16** | measured |
| Sitemap URLs sampled with correct self-canonical | **83 / 87** | measured |

The dynamic templates (`/categories/[category]`, `/blog/[slug]`, `/glossary/[term]`, `/suppliers/[city]`, `/location/[area]`) already use `generateMetadata` correctly and self-canonicalize. **The defect is concentrated in static informational pages.**

## Dependencies

| Dependency | Why |
|---|---|
| **Sprint 1 T1** | Remove the inherited canonical first, or every page fights the layout individually |
| **Sprint 1 T3/T4** | Sitemap membership and canonical must agree |
| Word System decision (`SEO-P2-06`) | Whether URL slugs change, or only copy |

---

## T1 — Build the metadata factory

**Est:** M · **Order:** first · **Prevents recurrence**

### Objective
Create one sanctioned way to construct page metadata, so a page cannot be added without a canonical, and the 80-file rollout that follows is mechanical rather than error-prone.

### Files
| File | Change |
|---|---|
| `src/lib/seo/metadata-factory.ts` | **New.** `buildMetadata({ path, title, description, ogImage?, noindex? })` returning a typed `Metadata` with `alternates.canonical`, `openGraph` (incl. `og:url === canonical`), and `twitter` |
| `src/lib/seo/metadata-factory.test.ts` | **New.** Unit tests |
| `lib/site-url.ts` | Read-only consumer — no change |

### Design requirements
1. `canonical` is **required**, not optional — the type system must make a canonical-less page impossible.
2. `og:url` is **derived from** canonical, never supplied independently. This structurally prevents `SEO-P1-03` recurring.
3. Title handling has one explicit rule for when the layout template applies and when `title.absolute` is used — preventing `SEO-P1-04`.
4. A Word System guard rejects banned vocabulary in `title` and `description` at build time.
5. Interoperates with the existing `src/lib/seo-manager.ts`, `src/lib/seo/supplier-metadata.ts`, and `src/lib/supplier-seo.ts` rather than duplicating them — audit those three first and fold them in or delegate to them.

### Dependencies
Sprint 1 T1.

### Risk — **Low.** New code, no production surface until adopted. The real risk is building a *fourth* metadata path alongside the three existing ones. Audit before writing.

### Testing
- Unit: canonical always present and absolute
- Unit: `og:url === canonical` for every input
- Unit: banned Word System terms rejected
- Unit: title template vs absolute behaves per the documented rule

### Rollback
Delete; nothing depends on it until T2.

### Acceptance criteria
- [ ] Factory exists, fully typed, canonical non-optional
- [ ] `og:url` structurally derived from canonical
- [ ] Word System guard implemented and tested
- [ ] Relationship to the three existing SEO libs documented — folded in or delegated, never duplicated
- [ ] 100% unit coverage on the factory

---

## T2 — Roll metadata out to public pages

**Est:** **L** (largest task in the program) · **Order:** second

### Objective
Every indexable public route exports its own metadata with a self-canonical, a unique title, and a unique description.

### Scope and batching

83 pages have no metadata; 13 more have metadata without a canonical. **Batch by commercial value, not alphabetically.**

| Batch | Pages | Contents |
|---|---|---|
| **B1 — sitemap-submitted** | 16 | The live-confirmed offenders: `/about`, `/contact`, `/cookies`, `/help`, `/industrial-cluster`, `/pricing`, `/privacy`, `/refund-policy`, `/suppliers`, `/terms`, `/tools/gst-calculator`, `/tools/hsn-lookup`, `/tools/packaging-calculator`, `/video-rfq`, `/voice-rfq` (+ `/rfq/create`, excluded by Sprint 1 T3) |
| **B2 — commercial** | ~15 | `/escrow`, `/payment-security`, `/fintech`, `/gst-registration`, `/products`, `/products-categories`, `/products-search`, `/compare`, `/rfq-compare`, `/advertising`, `/services/*` |
| **B3 — help & legal** | ~15 | `/help/*`, `/legal/*`, `/compliance/*`, `/data-deletion`, `/report-issue` |
| **B4 — remainder** | ~40 | Everything else; triage each as *indexable* or *`noindex`* |

**B4 is a triage batch, not a metadata batch.** Many of these — `/login`, `/register`, `/demo-login`, `/checkout/[dealId]`, `/claim/[token]`, `/quote/[token]`, `/messages`, `/notifications`, `/onboarding`, `/profile`, `/orders/received`, `/quotes/my-quotes`, `/deals/[id]/receipt`, `/review/[dealId]`, `/crm/leads`, `/dashboard-analytics` — are transactional, tokenised, or private and should be **`noindex`**, not given SEO metadata.

### Files
~85 `src/app/**/page.tsx` files, plus `src/lib/seo/metadata-factory.ts` (consumer).

### Dependencies
T1. Sprint 1 T1.

### Risk — **Low per file, Medium in aggregate.** 85 files is a large copy-paste surface. Two specific hazards:

1. **Wrong canonical worse than none.** A copy-paste error pointing page B's canonical at page A actively de-indexes B. Assert per batch.
2. **Indexing something private.** B4 contains tokenised URLs (`/claim/[token]`, `/quote/[token]`). Adding indexable metadata to these would expose token-bearing URLs to the index. **Default B4 to `noindex` and justify each exception.**

### Testing
Per batch, before merging the next:
1. Assert every route in the batch self-canonicalizes.
2. Assert zero duplicate titles or descriptions across the cumulative set.
3. Assert `og:url === canonical`.
4. Assert every B4 `noindex` decision is deliberate and recorded.
5. Preview-deploy verification before production.

### Rollback
Per batch — each is an independent commit. Revert one without disturbing the others.

### Acceptance criteria
- [ ] 100% of indexable public routes export metadata via the factory
- [ ] 100% set a self-referential canonical
- [ ] Zero duplicate titles across indexable routes
- [ ] Zero duplicate descriptions across indexable routes
- [ ] All 16 B1 URLs verified in production
- [ ] Every B4 route explicitly classified indexable or `noindex`, with tokenised routes `noindex`
- [ ] Invariants I2, I3, I4 pass in CI

---

## T3 — Fix OpenGraph inheritance

**Est:** S · **Largely absorbed by T1/T2**

### Objective
`og:url` equals canonical, and `og:title`/`og:description` are page-specific, on every indexable route.

### Measured defect
`/categories/textiles` has a correct page title and a correct self-canonical, but emits `og:title` = `"VyaparSethu — Protected Trade Infrastructure"` and `og:url` = `https://www.vyaparsethu.com` — so `og:url` contradicts `rel=canonical` on the same page.

This matters disproportionately in India, where WhatsApp and LinkedIn sharing is a primary B2B distribution channel, and increasingly for AI-assistant link previews.

### Files
`src/lib/seo/metadata-factory.ts` (structural fix); `src/app/categories/[category]/page.tsx` and any other `generateMetadata` route that sets metadata without OpenGraph.

### Dependencies
T1, T2.

### Risk — **Low.**

### Testing
- Assert `og:url === canonical` across all indexable routes (invariant I4)
- Sample 5 URLs through a social-preview debugger
- Assert `og:image` resolves 200 on every route

### Rollback
Revert; OG returns to inherited defaults.

### Acceptance criteria
- [ ] `og:url === rel=canonical` on 100% of indexable routes
- [ ] `og:title`/`og:description` page-specific
- [ ] `og:image` resolves 200 everywhere; branded default is a documented deliberate choice
- [ ] `twitter:card` consistent with OpenGraph
- [ ] Invariant I4 in CI

---

## T4 — Fix the duplicated brand suffix

**Est:** XS

### Objective
No live title contains a repeated brand token.

### Measured defect
`/cookies` renders `Cookie Policy | VyaparSethu | VyaparSethu` — a title already containing the brand has the root layout's title template applied on top.

`/industrial-cluster` demonstrates the correct pattern: `title: { absolute: 'Industrial Clusters — Business Intelligence | VyaparSethu' }`.

### Files
`src/app/layout.tsx` (title template), `src/lib/seo/metadata-factory.ts` (rule enforcement), affected pages.

### Dependencies
T1.

### Risk — **Very Low.**

### Testing
- Regex assertion across all indexable routes: brand token appears at most once per title
- Assert titles ≤ 60 characters where practical

### Rollback
Revert.

### Acceptance criteria
- [ ] Zero titles with a repeated brand token
- [ ] Documented rule for template vs `title.absolute`
- [ ] Rule enforced in the factory, not by convention
- [ ] Titles ≤ 60 characters where practical

---

## T5 — Word System compliance sweep

**Est:** M · **Partly blocked on a Founder decision**

### Objective
Eliminate banned vocabulary from all live metadata and structured data, and decide separately whether URL slugs change.

### Measured violations
- `/voice-rfq` title: `"Voice RFQ — Speak Your Requirement"` → must be "Speak Requirement"
- `/blog/how-to-write-effective-rfq` — "RFQ" in both slug and title

### Two-part scope

| Part | Risk | Decision |
|---|---|---|
| **5a — copy** (titles, descriptions, H1s, JSON-LD `name`/`description`) | Low | Proceed; no decision needed |
| **5b — URL slugs** (`/voice-rfq` → `/speak-requirement`, blog slugs) | **Medium-High** | ⚠️ **Founder decision required.** Slugs carry indexed equity; changing them requires 301s and temporary ranking volatility |

**Recommendation: do 5a now, defer 5b.** The Word System governs *user-facing copy*; URLs are infrastructure. Changing indexed slugs for vocabulary compliance is a poor trade before the pages have earned meaningful equity — and a better trade later would be to keep the URLs and fix only what users read.

### Files
5a: metadata across affected pages, `src/lib/schema/*`, factory guard. 5b (if approved): route directories, `sitemap.ts`, `next.config.js` or `vercel.json` redirects, internal links.

### Dependencies
T1 (guard). Founder decision for 5b.

### Risk
5a **Low**. 5b **Medium-High** — every renamed slug needs a 301, internal links must be updated to point at the new URL rather than through a redirect, and the sitemap must list only new URLs.

### Testing
- Automated Word System linter over metadata and JSON-LD; zero violations
- Assert "Parcha" appears nowhere in the codebase or output
- If 5b: 301 map verified end-to-end, zero chains > 1 hop, zero internal links to old URLs, GSC coverage monitored 14 days

### Rollback
5a: revert. 5b: **not cleanly reversible once indexed** — reverting means a second migration. Decide once.

### Acceptance criteria
- [ ] Zero banned terms in any live title, description, H1, or JSON-LD `name`/`description`
- [ ] Word System linter in CI covering metadata and structured data
- [ ] Founder decision on 5b recorded in [SEO_DECISIONS.md](SEO_DECISIONS.md)
- [ ] If 5b proceeds: 301 map verified, internal links updated, sitemap lists only new URLs

---

## T6 — Publish the indexation policy

**Est:** S · **Order:** alongside T2 B4

### Objective
Produce an explicit, code-enforced statement of which route classes are indexable, which are `noindex`, and which are sitemap-eligible — so the decision is never made implicitly again.

### Files
`docs/SEO_DECISIONS.md` (policy), `src/lib/seo/indexation-policy.ts` (enforcement), `src/app/sitemap.ts` (consumer).

### Dependencies
T2 B4 triage. Aligns with `SEO-P2-03` and `SEO-P2-04` in Sprint 8.

### Risk — **Medium.** This is where a mistake indexes a private or tokenised page. Default-deny: a route class is `noindex` unless explicitly classified indexable.

**Constraint:** indexation policy is a **metadata** concern. Per `CLAUDE.md`, do **not** add role-based access checks to API routes as part of this work.

### Testing
- Every route class has an explicit classification; no route is unclassified
- Assert no tokenised route (`[token]`, `[dealId]`) is indexable
- Assert sitemap membership matches policy exactly
- Assert middleware-protected paths are never indexable

### Rollback
Revert; policy reverts to implicit.

### Acceptance criteria
- [ ] Policy documented per route class with rationale
- [ ] Enforced in code, not by convention
- [ ] Zero unclassified public routes
- [ ] Zero tokenised routes indexable
- [ ] Sitemap membership derives from the policy
- [ ] No role-based access checks added to API routes

---

## Execution order

```
T1 ──► T2(B1) ──► T2(B2) ──► T2(B3) ──► T2(B4) ──► T6
       │
       ├──► T3   (absorbed into factory; verify per batch)
       ├──► T4   (ship with B1)
       └──► T5a  (ship with each batch)

T5b ──► blocked on Founder decision
```

**Ship B1 first and validate in production before starting B2.** B1 is the 16 URLs with confirmed live impact; validating it proves the factory works before it is applied to 70 more files.

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Copy-paste canonical error | **High** (85 files) | High | Per-batch self-canonical assertion; batch-sized commits |
| Tokenised URL made indexable | Medium | **Critical** | Default-deny in T6; explicit assertion against `[token]`/`[dealId]` routes |
| A fourth metadata path created | Medium | Medium | Audit the three existing SEO libs in T1 before writing |
| Canonical gap persists (Sprint 1 T1 shipped, Sprint 3 stalls) | Medium | Medium | Ship B1 in the same release as Sprint 1 T1 if possible |
| Slug migration destabilises rankings | Medium (if 5b) | High | Defer 5b; recommendation is copy-only |

## Definition of done

- [ ] 100% of indexable public routes export metadata via the factory with a self-canonical
- [ ] Zero duplicate titles or descriptions
- [ ] `og:url === canonical` everywhere
- [ ] Zero repeated brand tokens in titles
- [ ] Zero Word System violations in metadata and structured data
- [ ] Indexation policy documented and code-enforced
- [ ] Invariants I2, I3, I4 pass in CI
- [ ] All 16 B1 URLs verified self-canonical in production

## Out of scope

Structured data beyond `name`/`description` compliance (Sprint 2) · supplier profile thin-content gate (Sprint 8) · quotation lifecycle (Sprint 8) · `hreflang` (Sprint 6) · programmatic page coverage gate (Sprint 4) · any `prisma/schema.prisma` change · any API route change.
