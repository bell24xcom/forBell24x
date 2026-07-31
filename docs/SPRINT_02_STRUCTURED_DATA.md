# Sprint 02 — Structured Data

**Parent program:** [ENTERPRISE_SEO_MASTER_PROGRAM.md](ENTERPRISE_SEO_MASTER_PROGRAM.md)
**Backlog items:** `SEO-P1-02`
**Priority band:** P1
**Status:** ⏸ **Not started — awaiting Sprint 1 and Sprint 3**
**Created:** 2026-07-31

---

## Sprint goal

Close the structured-data gap on the largest namespace on the site, centralise JSON-LD construction, and validate what already ships — without introducing a single fabricated claim.

## Starting position — better than assumed

An early draft of this program assumed structured data was largely missing. **Live inspection disproved that.** Measured JSON-LD block counts:

| Template | Blocks | Types emitted |
|---|---|---|
| `/` | 10 | Organization, WebSite, SearchAction, EntryPoint, LocalBusiness, ContactPoint, PostalAddress, GeoCoordinates, Country, WebPage, FAQPage, Question, Answer, SpeakableSpecification |
| `/blog/[slug]` | 10 | + **Article**, **BreadcrumbList**, ListItem, ImageObject |
| `/glossary/[term]` | 12 | + **DefinedTerm**, **DefinedTermSet**, **BreadcrumbList**, FAQPage |
| **`/categories/[category]`** | **6** | **Global types only — no BreadcrumbList, no ItemList, no Product** |

The blog and glossary templates are exemplary. **The category namespace — 454 of 684 sitemap URLs (66%) — is the outlier.** This sprint is therefore narrower and lower-risk than a greenfield schema build.

## Business value

Rich results lift CTR without requiring ranking gains, and schema is the strongest machine-readable input to entity understanding — which Sprints 5, 7, and 10 all compound on. Breadcrumb rich results across 454 category URLs is the single largest available SERP-presentation win.

## Dependencies

| Dependency | Why |
|---|---|
| **Sprint 1 (T1, T3, T4)** | Canonicals and sitemap must be correct before schema `@id` and `url` reference them |
| **Sprint 3 (`SEO-P0-04`)** | Schema `name`/`description` should align with page metadata, not diverge from it |
| Real supplier/product data | Gates T4 and T5 — see the truthfulness rule |

---

## The truthfulness rule (binding)

> **No `AggregateRating`, `review`, `reviewCount`, `ratingValue`, `offerCount`, or any aggregate numeric claim may be emitted unless backed by real, verifiable data in the database.**

This follows from two `CLAUDE.md` principles — *no public zeros* and *no fake suppliers* — and from Google's structured-data policies. Fabricated markup risks a **manual action**, which is materially worse than having no rich results at all.

Where real data does not yet exist, the correct behaviour is to **omit the property**, not to emit a zero or a placeholder.

---

## T1 — Audit and validate existing JSON-LD

**Est:** M · **Order:** first

### Objective
Establish a verified baseline of what already ships and fix any invalid or over-claiming markup before adding more.

### Tasks
1. Extract and validate every JSON-LD block on one URL per template against Google Rich Results Test and the Schema.org validator.
2. Review the **global `LocalBusiness`** currently emitted on every page — including category and blog pages. Assess whether a site-wide `LocalBusiness` with `PostalAddress` and `GeoCoordinates` on non-location pages is an over-claim. `Organization` may be the more accurate global type, with `LocalBusiness` reserved for genuine location pages.
3. Verify `Organization` details match the operating entity (Digitex Studio; VyaparSethu Technologies Private Limited when registration completes).
4. Verify `WebSite` + `SearchAction` `EntryPoint` target resolves to a working search URL.
5. Confirm `FAQPage` blocks correspond to Q&A **visible on the page** — Google requires this.
6. Confirm `SpeakableSpecification` selectors point at real elements.
7. Check all `name`/`description` values for Word System compliance.

### Files
Discovery task — likely `src/app/layout.tsx` and whichever component injects the global blocks. Locate before editing.

### Risk — **Low-Medium**
Removing or narrowing an existing type could lose an already-earned rich result. Measure current GSC Enhancements coverage **before** changing anything, so any loss is attributable.

### Testing
- Rich Results Test + Schema.org validator: zero errors on all four templates
- GSC Enhancements baseline captured before changes
- Automated JSON-LD parse test in CI

### Rollback
Revert per-type. Each block is independent.

### Acceptance criteria
- [ ] Baseline documented: every type emitted, per template
- [ ] Zero validator errors across all templates
- [ ] `LocalBusiness` scope decision recorded in [SEO_DECISIONS.md](SEO_DECISIONS.md)
- [ ] All FAQ markup corresponds to visible on-page content
- [ ] All `name`/`description` values Word System-compliant

---

## T2 — Centralise JSON-LD builders

**Est:** M · **Order:** second

### Objective
Make `src/lib/schema/` the only sanctioned way to construct JSON-LD, so no template hand-rolls markup and every `@id` is consistent.

### Files
| File | Change |
|---|---|
| `src/lib/schema/organization.ts` | Global Organization + WebSite + SearchAction |
| `src/lib/schema/breadcrumb.ts` | `BreadcrumbList` from the shared slug resolver |
| `src/lib/schema/product.ts` | `Product` / `Offer` from `src/data/product-intelligence-catalog.ts` |
| `src/lib/schema/place.ts` | `Place` / `AdministrativeArea` from `src/data/industrial-clusters.ts` |
| `src/lib/schema/item-list.ts` | `ItemList` for collection pages |
| `src/lib/schema/ids.ts` | Stable `@id` minting — the seam Sprint 5 (Knowledge Graph) plugs into |
| `src/components/JsonLd.tsx` | Single render component |

### Dependencies
T1 (know what exists before replacing it).

### Risk — **Low.** Pure refactor if output is byte-comparable. Snapshot existing output first and diff.

### Testing
- Snapshot test: refactored output matches pre-refactor output for unchanged types
- Type-level tests for each builder
- CI JSON-LD parse-and-validate across all templates

### Rollback
Revert the refactor commit; templates return to inline construction.

### Acceptance criteria
- [ ] Zero hand-rolled JSON-LD in any `page.tsx`
- [ ] Every builder unit-tested
- [ ] `@id` values stable, unique, and referentially consistent
- [ ] Output snapshot-diffed against baseline with no unintended changes

---

## T3 — BreadcrumbList on the category namespace

**Est:** M · **Order:** third · **Highest value in this sprint**

### Objective
Emit valid `BreadcrumbList` on all 454 `/categories/*` URLs, derived from the same slug resolver that produces canonical and sitemap values.

### Files
| File | Change |
|---|---|
| `src/app/categories/page.tsx` | Add breadcrumb |
| `src/app/categories/[category]/page.tsx` | Add breadcrumb |
| `src/lib/schema/breadcrumb.ts` | Builder (from T2) |

### Dependencies
T2. Sprint 1 T1 (canonical correctness). **Critically:** the shared slug resolver — `75c440a`, `7760306`, and `c13466b` were all slug-resolution fixes, so breadcrumbs must not introduce a fourth independent slug path.

### Risk — **Low-Medium.** A breadcrumb referencing an unresolvable slug produces invalid markup at scale. Derive from the resolver; never construct paths by string concatenation.

### Testing
- Rich Results Test on 5 category URLs including one with a known historical slug issue (`/categories/batteries`, which cross-canonicals to `/categories/ev-batteries` — breadcrumb must reflect the **canonical** target)
- Assert every breadcrumb `item` URL returns 200
- Assert breadcrumb leaf URL equals the page canonical
- GSC Enhancements → Breadcrumbs monitored 14 days

### Rollback
Revert; category pages return to global-only schema.

### Acceptance criteria
- [ ] `BreadcrumbList` on 100% of `/categories/*`
- [ ] Every `item` URL returns 200
- [ ] Leaf URL equals page canonical
- [ ] Cross-canonical cases resolve to the canonical target
- [ ] Zero Rich Results errors
- [ ] GSC reports valid Breadcrumb items for the namespace

---

## T4 — ItemList on collection pages

**Est:** M · **Gated on real data**

### Objective
Describe category and supplier-listing pages as ordered collections so search engines and AI systems can enumerate their contents.

### Files
`src/app/categories/[category]/page.tsx`, `src/app/suppliers/[city]/page.tsx`, `src/app/suppliers/[city]/[category]/page.tsx`, `src/lib/schema/item-list.ts`.

### Dependencies
T2, T3. **Real listings.** An `ItemList` with zero or one item is worse than none, and an empty collection page violates the *no public zeros* principle regardless of markup.

### Risk — **Medium.** This is where the truthfulness rule bites hardest — the temptation is to pad lists with placeholder suppliers. Do not. Gate emission on a minimum real-item count, consistent with the Sprint 4 coverage gate (`SEO-P2-05`).

### Testing
- Assert `ItemList` emits only above the item threshold
- Assert `numberOfItems` equals actual rendered items
- Validator clean on 5 sampled URLs
- Explicit test: a below-threshold page emits **no** `ItemList` and **no** zero count

### Rollback
Revert; collection pages keep breadcrumbs only.

### Acceptance criteria
- [ ] `ItemList` only where real items meet the threshold
- [ ] `numberOfItems` matches rendered reality exactly
- [ ] Zero placeholder or fabricated entries
- [ ] Below-threshold pages emit no ItemList and no zero metric
- [ ] Threshold recorded in `SEO_DECISIONS.md`

---

## T5 — Product / Offer on product-intelligence pages

**Est:** M · **Gated on real data**

### Objective
Emit `Product` markup with HSN classification on `/product-intelligence/[slug]`, sourced from the existing static catalog.

### Files
`src/app/product-intelligence/[slug]/page.tsx`, `src/lib/schema/product.ts`, reading `src/data/product-intelligence-catalog.ts`.

### Dependencies
T2. Catalog completeness.

### Risk — **Medium.** `Offer` requires price and availability. If VyaparSethu does not hold authoritative prices, **omit `Offer` entirely** — emit `Product` alone. Do not synthesize price ranges.

HSN belongs in `additionalProperty` as a `PropertyValue`, not in a field reserved for other semantics.

### Testing
- Rich Results Test on 5 product pages
- Assert `Offer` absent wherever real price data is absent
- Assert HSN renders as `additionalProperty`
- Cross-check catalog values against `src/data/hsn-codes.ts`

### Rollback
Revert per-type.

### Acceptance criteria
- [ ] `Product` on all product-intelligence pages with catalog entries
- [ ] `Offer` only where real price and availability exist
- [ ] HSN as `additionalProperty` / `PropertyValue`
- [ ] Zero fabricated price, availability, or rating data
- [ ] Validator clean

---

## T6 — Place markup on cluster and location pages

**Est:** S

### Objective
Give geographic pages proper `Place` semantics — the schema foundation Sprint 6 builds on.

### Files
`src/app/industrial-cluster/[slug]/page.tsx`, `src/app/location/[area]/page.tsx`, `src/lib/schema/place.ts`, reading `src/data/industrial-clusters.ts`.

### Dependencies
T2. Cluster coordinate data.

### Risk — **Low.** Only accuracy: incorrect coordinates mislead local ranking. Verify a sample against a real map.

### Testing
- Validator clean on 5 cluster pages
- Spot-check 5 coordinate pairs against a real map
- Assert `containedInPlace` hierarchy matches `geographic-intelligence/hierarchy.ts`

### Rollback
Revert.

### Acceptance criteria
- [ ] `Place` / `AdministrativeArea` on all cluster and location pages
- [ ] Coordinates verified on a sample
- [ ] Hierarchy consistent with the geographic registry
- [ ] Validator clean

---

## Execution order

```
T1 ──► T2 ──┬──► T3 ──► T4        (T4 gated on real listings)
            ├──► T5               (gated on catalog + price policy)
            └──► T6
```

T3 is the highest-value task; T4 and T5 are data-gated and may slip to a later wave without blocking the sprint.

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Fabricated aggregate data ships | Medium | **Critical** (manual action) | Truthfulness rule; explicit tests asserting omission when data is absent |
| Global `LocalBusiness` is an over-claim | Medium | Medium | T1 audit; narrow to `Organization` if warranted |
| Breadcrumbs introduce a fourth slug path | Medium | High | Derive from the shared resolver only |
| Losing an existing rich result during refactor | Low | Medium | GSC baseline before changes; snapshot diff in T2 |
| `ItemList` on thin collections | Medium | High | Threshold gate aligned with `SEO-P2-05` |

## Definition of done

- [ ] Zero structured-data errors in GSC Enhancements across all templates
- [ ] `BreadcrumbList` on 100% of the category namespace
- [ ] All JSON-LD constructed through `src/lib/schema/`
- [ ] Zero fabricated ratings, reviews, counts, or prices anywhere in the codebase
- [ ] CI validates JSON-LD on every build
- [ ] Every `@id` stable and unique — the seam Sprint 5 requires

## Out of scope

Entity resolution and `sameAs` enrichment (Sprint 5) · `hreflang` (Sprint 6) · `llms.txt` and AI-crawler policy (Sprint 7) · supplier profile indexation policy (Sprint 8) · any schema implying autonomous transaction capability (Sprint 10).
