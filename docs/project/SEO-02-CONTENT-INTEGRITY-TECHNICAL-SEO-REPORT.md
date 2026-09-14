# SEO-02 — Content Integrity + Technical SEO Safety

**Status:** IMPLEMENTED, VALIDATED — not committed, not pushed, not deployed.
**Date:** 2026-08-19
**Predecessor:** SEO-01 Reconciliation Report (delivered in-conversation, not a repo file)
**Scope:** Exactly the six approved fixes below. No architecture change, no category expansion, no provider/integration change.

---

## 1. Baseline

```
repository:  bell24xcom/forBell24x
HEAD:        a6390fb39bcb8ec36ce5e4a61ac1ce4b50c2d812
origin/main: a6390fb39bcb8ec36ce5e4a61ac1ce4b50c2d812  (matched)
git status:  dirty — same 49-line baseline present since the JWT hardening
             sprints (H6-12/H6-13 work, MASTER docs, etc.), none created by
             this sprint
```

## 2. Files Changed

```
 src/app/faq/page.tsx                | 35 ++++++++++++++++++++++-------------
 src/app/founding-suppliers/page.tsx | 11 ++++++++++-
 src/app/how-it-works/page.tsx       |  5 +++++
 src/data/blog-posts.ts              | 27 +++++++++++++++------------
 src/lib/schema/faq-schema.ts        | 23 +++++++++++++++++++++++
 5 files changed, 75 insertions(+), 26 deletions(-)
```
No other file was touched by this sprint. `/voice-rfq` and `/features/voice-rfq` were **not** modified (confirmed via `git diff --stat` — zero changes attributable to this sprint on either).

## 3. `/faq` Claim Corrections — **IMPLEMENTED, VERIFIED**

| Claim removed | Replacement |
|---|---|
| "AI transcribes and extracts specifications in 3 seconds" | "AI transcribes what you say and extracts structured specifications for you to review before posting" |
| "Average time to first quotation... under 4 hours. 73% of Requirements receive at least 3 quotations within 24 hours. Urgent Requirements... sent as WhatsApp alerts... immediately" | Rewritten without any unverified number; the WhatsApp-urgent-alert claim was independently confirmed to have **zero implementation evidence** anywhere in `src/lib/whatsapp/` or `src/lib/outreach/` and was removed entirely, not just the number |
| "Average time to post: 87 seconds" | Removed; kept the verified "works over a standard mobile data connection" framing already established on `/features/voice-rfq` |
| "Scores are updated daily at 2 AM IST using a rolling 90-day window" (Trade Confidence Score) | Removed the cadence claim — SEO-01 found no cron job anywhere in `src/app/api/cron/*` that computes `trustScore`. The formula composition (kept) is real and documented in `CLAUDE.md`; the "updates daily" operational claim was not. |

Post-edit sweep of `/faq` for `3 seconds|87 seconds|90 seconds|12 languages|guaranteed|73%|0.4`: **CLEAN**. "24 hours" remains (2 occurrences) — left in place deliberately, as established platform pillar language (`CLAUDE.md`'s "Faster Trade" pillar), not one of the specifically-flagged unsupported numbers, and out of scope to touch under this sprint.

## 4. Pilot Article Decision — **IMPLEMENTED, REQUIRES FOUNDER/CONTENT AWARENESS**

Located: `src/data/blog-posts.ts`, slug `voice-rfq-indian-smes` — confirmed live (has a `slug`, sitemap includes `/blog/{slug}` for every entry in `BLOG_POSTS`, build confirms `/blog/voice-rfq-indian-smes` in the compiled route table).

**Scope of fabrication found — larger than SEO-01's original three flagged stats:**
- Title: "How Indian SMEs Are Cutting Procurement Time by **80%**" — fabricated
- Excerpt: "Speaking it takes **90 seconds**" — fabricated
- Body: "Groq Whisper transcribes in **3 seconds**" — fabricated
- Body: "One tap to post to **200+ verified steel suppliers**" — fabricated
- Body: an entire **"Results from our first pilot suppliers"** section — 87 seconds, 73% response rate, 0.4 clarification rounds — **no pilot exists anywhere in this repository**; this reads as an invented customer/usage case study
- Body: "works offline for the first 30 seconds, then syncs" — an unverified technical behavior claim with no supporting evidence found; removed on the same precautionary basis

**Action taken:** rewrote title, excerpt, and body to describe the real mechanism only (voice → Groq Whisper transcription → AI field extraction → user review → post), using the same claim-safe language pattern already established and approved via H6-11A on `/features/voice-rfq`. No new statistic, pilot, or customer reference was invented to replace what was removed, per explicit instruction.

**Flagging for founder/content approval, not blocking on it:** this was a full content rewrite (title + excerpt + roughly half the body), not a narrow line edit. The correction itself required no new judgment calls beyond "remove what's unsupported and describe the real mechanism," which doesn't need approval — but the resulting copy/voice is a content decision worth a founder read before this is considered final marketing copy, separate from the integrity fix itself.

**Same pattern found elsewhere, explicitly NOT touched (out of scope for SEO-02):**
- `blog-posts.ts` lines 48, 613, 658, 1093 — "90 seconds" claims in **other, different blog posts**
- `blog-posts.ts` line 225 — a different post: "200+ verified steel suppliers... Average response: 4.2 quotes in 18 hours"
- `src/data/outreachTemplates.ts` line 105 — "Join 200+ verified packaging suppliers" (outreach/WhatsApp template copy — explicitly a DO-NOT-TOUCH area this sprint regardless)
- `src/app/compare/vyaparsethu-vs-indiamart/page.tsx` — "AI extracts specs in 3 seconds"

These are **REQUIRES FOUNDER/CONTENT APPROVAL** items for a future SEO-03 sprint — the same fabrication pattern is systemic across the blog content, not isolated to the one article this sprint was scoped to fix.

## 5. Founding Suppliers Title Fix — **IMPLEMENTED, VERIFIED**

Changed `title: 'Founding Supplier Programme | VyaparSethu'` (plain string) to `title: { absolute: 'Founding Supplier Programme | VyaparSethu' }`, the same fix pattern already applied to `/voice-rfq` and `/learn`. `openGraph.title` was left untouched — Next.js's `title.template` does not apply to `openGraph.title`, so it was never subject to the double-suffix bug.

**Verified against rendered HTML** (production build, `next start` via standalone server, `curl`):
```
Before this fix (established by SEO-01): "Founding Supplier Programme | VyaparSethu | VyaparSethu"
After:  <title>Founding Supplier Programme | VyaparSethu</title>
```
Confirmed correct, single suffix.

## 6. Twitter Metadata Changes — **IMPLEMENTED, VERIFIED**

Added page-specific `twitter: { card: 'summary_large_image', title, description }` to `/faq`, `/how-it-works`, `/founding-suppliers`, mirroring each page's own existing (accurate) `openGraph` values — no new claims introduced.

**Verified against rendered HTML** — all three pages now emit page-specific `<meta name="twitter:title">` / `<meta name="twitter:description">` (previously absent; would have inherited the generic root layout description).

## 7. FAQ Schema Reuse — **IMPLEMENTED, VERIFIED**

Added a generic `faqPageSchema(faqs)` builder to `src/lib/schema/faq-schema.ts`, following the same reusable-shape pattern the module's existing `breadcrumbSchema()` helper already establishes. `/faq/page.tsx` now calls `faqPageSchema(FAQS)` instead of inline-constructing the JSON-LD object.

**Deliberately did not** import the module's existing `voiceRFQFAQ` export onto `/faq` — that content is `/features/voice-rfq`'s own 5 voice-specific questions, not `/faq`'s 14 general questions. Importing it verbatim would have created a mismatch between the page's visible content and its structured data (a schema-validity problem, and a direct violation of the mission's own instruction not to blindly import a shared schema's content). No second FAQ schema *module* was created — one file (`faq-schema.ts`) remains the sole home for FAQ-related schema logic.

**Verified against rendered HTML:** exactly one `"@type":"FAQPage"` block on `/faq`, matching the page's own 14 visible questions.

## 8. Breadcrumb Schema Changes — **IMPLEMENTED, VERIFIED (with one scope note)**

Added `breadcrumbSchema()` (reused, not reimplemented) to `/faq` — this page had **no** breadcrumb schema before.

**`/how-it-works` and `/founding-suppliers` were deliberately left unchanged.** Both already have their own working `BreadcrumbList` JSON-LD (implemented inline, pre-dating this sprint) — each already satisfies "exactly one BreadcrumbList per page." Replacing an already-correct, already-functioning implementation with the shared helper for its own sake would have been unnecessary content/code churn on pages this sprint doesn't need to touch. Confirmed via rendered HTML: both still show exactly one `"@type":"BreadcrumbList"`.

## 9. Unsupported-Claim Sweep — Full Classification

| Term | Remaining matches | Classification |
|---|---|---|
| `3 seconds` | 6 files: `faq-schema.ts` (own doc-comment, listing what was excluded), `compare/vyaparsethu-vs-indiamart/page.tsx`, `blog-posts.ts` (own new doc-comment), `load-testing-system.ts`/`real-integration-testing.ts` (unrelated — test infrastructure timeout constants), `marketDataService.ts` (unrelated — demo interval) | (1) legitimate code/comment/doc — 4 of 6; (2) unsupported public claim — `compare/vyaparsethu-vs-indiamart/page.tsx` (out of scope this sprint) |
| `87 seconds` | 0 | Fully removed |
| `90 seconds` | 15 files, incl. 4 more locations in `blog-posts.ts` (different posts) and Hindi-language content | (2) unsupported public marketing claim — same systemic pattern, out of scope this sprint; several other hits are glossary/tools/marketplace pages not independently audited this sprint |
| `12 languages` | 2: `faq-schema.ts`, `features/voice-rfq/page.tsx` — both are the **doc-comments explaining what was deliberately excluded** | (1) legitimate documentation |
| `24 hours` | Not re-swept exhaustively (established platform pillar language, 47 files repo-wide per SEO-01) | (4) intentionally excluded from this sprint — not a fabricated statistic, a stated design goal |
| `73%` | 0 | Fully removed |
| `0.4` | Not meaningfully searchable — matches CSS values, version numbers, decimals across hundreds of unrelated files | Not classified — literal string search has no signal for this term |
| `200+ verified` | `blog-posts.ts` (a different post), `outreachTemplates.ts` (WhatsApp template — explicit DO-NOT-TOUCH area) | (2) unsupported public claim / (3)+DO-NOT-TOUCH — both out of scope this sprint |
| `Trade Confidence Score updated daily` | 0 (as an exact phrase) | Fully removed from `/faq`; the underlying formula-without-cadence claim remains, correctly |
| `guaranteed response` | 0 | Not found anywhere |
| `Razorpay escrow` | 0 | Not found anywhere (matches CLAUDE.md's word-substitution rule — "Protected Payment" is used instead) |

## 10. Validation Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` (scoped) | **1 pre-existing, unrelated error** — `src/data/blog-posts.ts:1118`, a `Set` spread/iteration TS2802 in unrelated helper code (`BLOG_CATEGORIES = [...new Set(...)]`), 1000+ lines from anything this sprint touched. Confirmed via `git diff` that this sprint's changes don't reach that line. TypeScript errors are ignored at build time project-wide (established convention, every prior sprint this session). |
| `npx next lint` (scoped) | **PASS** — `✔ No ESLint warnings or errors` |
| `npx next build` | **PASS** — exit 0, zero "Failed to compile"; `/faq`, `/how-it-works`, `/founding-suppliers`, `/features/voice-rfq`, `/voice-rfq`, `/blog/voice-rfq-indian-smes` all present in the compiled route table |

## 11. Regression Checks — **VERIFIED**

Local production server (`node .next/standalone/server.js`), rendered HTML inspected directly via `curl`:

| Page | Title | Canonical | Twitter | FAQPage | BreadcrumbList | Organization |
|---|---|---|---|---|---|---|
| `/faq` | Correct, single suffix | ✅ | ✅ (new) | ✅ ×1 (via shared helper) | ✅ ×1 (new) | ✅ ×1 |
| `/how-it-works` | Correct, single suffix | ✅ | ✅ (new) | ✅ ×1 (pre-existing) | ✅ ×1 (pre-existing, untouched) | ✅ ×1 |
| `/founding-suppliers` | **Fixed** — single suffix, no more double `\| VyaparSethu` | ✅ | ✅ (new) | ✅ ×1 (pre-existing) | ✅ ×1 (pre-existing, untouched) | ⚠️ **×2 — pre-existing duplication, see below** |
| `/features/voice-rfq` (regression) | Unchanged, correct | ✅ | ✅ (unchanged) | ✅ ×1 | ✅ ×1 | ✅ ×1 |
| `/voice-rfq` (regression) | Unchanged | — | — | — | — | — |

`/voice-rfq` confirmed still serving the functional product (200 OK, `MediaRecorder`-based recording UI, correct title), and `git diff --stat -- src/app/voice-rfq/` shows **zero changes** — untouched, as required.

**⚠️ Pre-existing finding, NOT introduced by this sprint, NOT fixed (out of scope):** `/founding-suppliers` renders **two** `Organization` JSON-LD blocks — one from the global root `layout.tsx` (the correct, sitewide one) and one from the page's own local `orgLd` object, which pre-dates SEO-02 and even carries **conflicting data** (`foundingDate: '2024'` on the page vs. `'2026'` in the root layout, and a `founder` field the global block doesn't have). This directly contradicts SEO-01's blanket assumption that "Organization schema remains global and is not duplicated" — that was true in general but **not** true specifically on this page. Not fixed here: removing/reconciling it wasn't one of the six approved SEO-02 fixes, and doing so unilaterally would be scope expansion. Flagged here explicitly rather than silently passing the validation checklist.

## 12. Exact Git Diff Summary

```
 src/app/faq/page.tsx                | 35 ++++++++++++++++++++++-------------
 src/app/founding-suppliers/page.tsx | 11 ++++++++++-
 src/app/how-it-works/page.tsx       |  5 +++++
 src/data/blog-posts.ts              | 27 +++++++++++++++------------
 src/lib/schema/faq-schema.ts        | 23 +++++++++++++++++++++++
 5 files changed, 75 insertions(+), 26 deletions(-)
```
No category architecture, category data files, sitemap, robots, payment, WhatsApp, Cloudinary, Video RFQ, Bell24h-OS, or RFQ core files were touched — confirmed via `git status`/`git diff --stat`, all pre-existing baseline items unchanged.

## 13. Deliberately NOT Changed

- `/voice-rfq` — untouched, per explicit instruction (functional product route)
- `/features/voice-rfq` — untouched (no schema-import dependency required it)
- `/how-it-works` and `/founding-suppliers`'s existing inline `BreadcrumbList` — left as-is, already correct
- The pre-existing duplicate `Organization` schema on `/founding-suppliers` — found, not fixed (out of scope)
- Every other blog post/page carrying the same "90 seconds"/"200+ verified"/"3 seconds" pattern besides `voice-rfq-indian-smes` — found via the sweep, not fixed (out of scope, systemic, needs its own sprint)
- Category architecture, sitemap, robots, and every other explicitly listed DO-NOT-MODIFY area

## 14. Remaining SEO-03 Dependencies

1. **Founder/content approval** on the rewritten `voice-rfq-indian-smes` article's final copy/voice
2. **Founder decision** on the systemic fabricated-statistics pattern across other blog posts (§9/§4) — likely its own sprint, given the scope
3. **Reconcile the duplicate Organization schema** on `/founding-suppliers` (delete the page-local `orgLd`, or intentionally keep a page-specific one and remove the conflicting `foundingDate`/`founder` mismatch — a decision, not just a deletion)
4. Category data consolidation and a noindex mechanism (carried forward from SEO-01, unchanged, not part of SEO-02's scope)
5. Trade Confidence Score cron implementation, if the platform wants to reintroduce a "daily update" claim honestly
