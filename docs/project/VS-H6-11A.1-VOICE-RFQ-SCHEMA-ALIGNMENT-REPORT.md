# VS-H6-11A.1 — Voice RFQ Schema Architecture Alignment Report

**Date:** 12 Aug 2026
**Scope:** Micro-fix only — extract page-local schema into a reusable module. No feature work, no content/design change. Not committed — awaiting review.

---

## 1. Baseline

`git status` clean except the still-uncommitted H6-11A page rewrite (expected — nothing from this week's Voice RFQ work has been committed yet). Local `HEAD` = `origin/main` = `72c323c1` (the H6-10A payment-control cleanup). No reset, rebase, or unrelated pull performed.

---

## 2. Existing Page-Local Schema (before this change)

`src/app/features/voice-rfq/page.tsx` defined two consts directly in the file: `faqLd` (a plain object, `@type: FAQPage`, 5 questions) and `breadcrumbLd` (a plain object, `@type: BreadcrumbList`, 2 items, built by hand). Both were serialized inline via `<script type="application/ld+json">`, and `faqLd.mainEntity` was also mapped over to render the visible FAQ accordion.

---

## 3. Reusable Schema Module Created

**New file:** `src/lib/schema/faq-schema.ts`

- `voiceRFQFAQ` — exported as a static object, content identical to the `faqLd` H6-11A had already corrected (no "12 languages," no processing/posting-time numbers, no automatic-WhatsApp claim, no `?type=voice` reference). Nothing reintroduced from the original, unverified draft.
- `breadcrumbSchema(items)` — exported as a function, matching the shape specified in the brief (`{ name, url }[]` → `BreadcrumbList` JSON-LD).

**Import path note:** the original draft's usage example showed `import { faqSchema } from '@/lib/schema/faq-schema'`. Per this repo's actual alias convention (`@/` resolves to the repo root, not `src/` — confirmed in `CLAUDE.md` and consistent with every other `src/lib/*` import seen across this codebase), the correct import for a file at `src/lib/schema/faq-schema.ts` is `@/src/lib/schema/faq-schema`, not `@/lib/schema/faq-schema` (which would incorrectly resolve to a nonexistent root-level `lib/schema/`). Used the correct path; `tsc`/`next build` both confirm it resolves.

---

## 4. Page Rewiring

`src/app/features/voice-rfq/page.tsx`:
- Added `import { voiceRFQFAQ, breadcrumbSchema } from '@/src/lib/schema/faq-schema';`
- Removed the local `faqLd` const entirely (5-question object, ~45 lines).
- Replaced the local `breadcrumbLd` object with `breadcrumbSchema([{ name: 'Home', url: SITE_URL }, { name: 'Voice RFQ', url: \`${SITE_URL}/features/voice-rfq\` }])`.
- Updated the JSON-LD `<script>` tag to serialize `voiceRFQFAQ` instead of the removed `faqLd`.
- Updated the visible FAQ accordion's `.map()` to iterate `voiceRFQFAQ.mainEntity` instead of `faqLd.mainEntity`.
- Confirmed via grep: zero remaining references to `faqLd` anywhere in the file.

**Nothing else changed.** H1, CTA destinations, canonical, metadata, page content, and styling are untouched — confirmed by diffing only the schema-related hunks, not re-reading the whole file as if it were new.

---

## 5. Files Changed

| File | Change |
|---|---|
| `src/lib/schema/faq-schema.ts` | **New** — `voiceRFQFAQ`, `breadcrumbSchema()` |
| `src/app/features/voice-rfq/page.tsx` | Modified — import added, two local consts removed/replaced, two references updated |
| `tsconfig.tsbuildinfo` | Routine build-cache regeneration from running `tsc` — not a source change, same pattern as every prior session this week |

`git status` confirms no other file touched.

---

## 6. `/voice-rfq` Regression Verification

`git diff --stat -- src/app/voice-rfq/` — **empty**. The live functional Voice RFQ application was not opened for editing at any point in this task. Confirmed live locally: `curl http://localhost:3000/voice-rfq` → `200`, same response size as before this change (5.24 kB in the build manifest, unchanged).

---

## 7. TypeScript Result

`npx tsc --noEmit -p tsconfig.json` — clean. Grepped specifically for both touched files/paths in the full output: zero matches (no errors introduced).

---

## 8. Build Result

`npx next build` — `EXIT:0`. Both `/features/voice-rfq` and `/voice-rfq` present in the route manifest as static (`○`) routes, sizes consistent with before (`/features/voice-rfq`: 284 B, was 283 B — negligible, expected float from the refactor; `/voice-rfq`: 5.24 kB, unchanged).

---

## 9. JSON-LD Verification (live, local, not inferred from source)

| Check | Result |
|---|---|
| `<title>` | `Voice RFQ India — Post B2B Requirements by Speaking \| VyaparSethu` — single suffix, unchanged |
| Canonical | `https://www.vyaparsethu.com/features/voice-rfq` — self-referencing, unchanged |
| `FAQPage` blocks on page | Exactly 1 |
| `BreadcrumbList` blocks on page | Exactly 1 |
| `Organization` blocks on page | Exactly 1 (the root layout's — this page still adds none, no duplication introduced by the refactor) |
| `Question` entities in the FAQPage block | 5, matching the pre-refactor count exactly |
| Breadcrumb items | `Home`, `Voice RFQ` — correct, matches pre-refactor content |

---

## 10. Final Status

Schema architecture now aligned with the approved reusable-module design: `voiceRFQFAQ` and `breadcrumbSchema()` live in `src/lib/schema/faq-schema.ts` and are available for future SEO pages to import rather than re-declare. `/voice-rfq` is untouched and confirmed still functional. `/features/voice-rfq` serves byte-for-byte equivalent JSON-LD and metadata to before this refactor — this was a structural move, not a content change.

---

## 11. Finalization Pass (H6-11A.1 + H6-11A combined)

Re-verified everything above fresh in a follow-up pass rather than trusting the prior results, immediately before staging for commit:

- Re-confirmed `origin/main` unchanged (`72c323c1`) and working tree matched exactly what this report already described — nothing drifted between the original alignment pass and finalization.
- Re-grepped `faq-schema.ts` and `page.tsx` for every forbidden claim ("12 languages," timing numbers, WhatsApp, `?type=voice`) — the only matches are in code comments explaining what was deliberately excluded, not in actual content.
- Re-ran `tsc --noEmit` and `next build` clean (`EXIT:0`) from scratch.
- Re-ran the local production smoke test: `/features/voice-rfq` and `/voice-rfq` both 200, title/canonical unchanged, exactly one `FAQPage`, one `BreadcrumbList`, one `Organization` block.
- Diff-audited the full working tree: only `src/app/features/voice-rfq/page.tsx`, the new `src/lib/schema/faq-schema.ts`, `tsconfig.tsbuildinfo` (routine cache), and this report's own doc files are part of this change. No unrelated file touched — nothing to stop for.

**Final verdict: ready to commit and push as one unit — H6-11A (SEO landing page) + H6-11A.1 (schema alignment) together, since neither was committed separately.**
