# MASTER CLASSIFICATION — Pass 1

**Compiled:** 2026-08-03. Source: `MASTER_INDEX.csv` only — no new filesystem scan was run, and no file content was read except where filename/path alone was ambiguous (in practice, none required opening this pass). Classification method: keyword matching against each row's `relative_path` + `filename` + `parent_folder`, lowercased. This is a **mechanical, first-pass** classification, not a verified reading of each document — treat every category assignment as **INFERRED from filename/path**, not **VERIFIED from content**.

Companion file: `MASTER_CLASSIFICATION.csv` (4,449 rows: id, filename, repository, categories, status, confidence, related_repositories, related_artifacts_note — the latter two columns are intentionally blank this pass, see §6).

---

## 1. Category Statistics

| Category | Count |
|---|---|
| Legacy (path signal, see note below) | 1,313 |
| Infrastructure | 1,105 |
| Deployment | 919 |
| **Unknown** | 893 |
| Marketing | 693 |
| Agents | 636 |
| Documentation | 564 |
| Automation | 311 |
| DevOps | 274 |
| n8n | 248 |
| AI | 219 |
| Testing | 203 |
| QA | 203 |
| Implementation Plan | 94 |
| API | 65 |
| Architecture | 63 |
| SEO | 62 |
| RFQ | 54 |
| SQL Migration | 53 |
| Database | 51 |
| Supplier | 41 |
| Analytics | 27 |
| Feature Specification | 25 |
| Prompt Engineering | 20 |
| Research | 18 |
| Security | 10 |
| Authentication | 10 |
| Compliance | 10 |
| Escrow | 10 |
| Payments | 9 |
| Design | 9 |
| Roadmap | 7 |
| Conversation Archive | 6 |
| Branding | 6 |
| Business Vision | 2 |
| Legal | 2 |
| Marketplace | 2 |
| Product Vision | 1 |
| LLM | 1 |

Categories from the requested list with **zero matches** this pass: Buyer, Wallet, CRM, Meeting Notes, Deprecated, GraphRAG, Qdrant, SHAP/LIME (folded into AI — see note), Agents-as-a-distinct-concept (see note). A zero count means no filename/path evidence was found — it does not mean the topic doesn't exist in the codebase (Wallet and CRM in particular are confirmed to exist as real, working features from this session's earlier direct code audits; they just don't appear as keywords in enough *filenames* to surface here).

**Note on multi-category rows:** every artifact can carry multiple category tags (e.g., a file can be both `RFQ` and `AI`). The counts above are category-instance counts, not row counts — they will not sum to 4,449.

---

## 2. Repository Statistics

| Repository | Artifacts |
|---|---|
| current-repo | 2,731 |
| old-digitex-erp-bell24h | 1,252 |
| sibling-web-agency | 388 |
| sibling-bell24h-clean | 24 |
| sibling-bell24h-main | 14 |
| projects-root | 11 |
| sibling-bell24h-live | 6 |
| sibling-bell24x-complete | 6 |
| sibling-bell24h-migration-package | 5 |
| sibling-bell24h-final | 4 |
| sibling-bell24h-working | 4 |
| sibling-bell24x-clean | 4 |

---

## 3. Legacy vs Active vs Archived

| Status | Count | Basis |
|---|---|---|
| Archived | 1,768 | `current-repo` artifacts under `_archive/`, plus all `sibling-*` folders |
| Active | 1,418 | `current-repo` artifacts NOT under `_archive/` |
| Legacy | 1,263 | All of `old-digitex-erp-bell24h` + `projects-root` loose files |

This status field was assigned **per-repository, mechanically** (see §6 for the exact rule), not per-document. It is a coarse signal: an "Active" current-repo file could still itself describe a long-dead plan (e.g., a root-level `.md` status report from February that nothing has touched since) — status here means "which physical location the file lives in," not "is this information still true." Confirming the latter is Pass 2/3 work, not this pass.

---

## 4. Cross-Category Relationships (observed, not yet verified)

The largest category overlaps, by nature of the keyword rules used:
- **Infrastructure + Deployment** — near-total overlap by design (Cloudflare/Netlify/Railway/Oracle/Vercel/render.yaml files trigger both).
- **Automation + n8n** — n8n is a subset of automation; every n8n-tagged file is also automation-tagged.
- **Testing + QA** — tagged identically by the same rule; effectively one category split into two labels for reporting purposes only.
- **AI + SHAP/LIME** — the `feature/shap-lime-integration`-related paths and `ai-explainability-service/` files carry both tags.
- **Documentation** is the most common secondary tag across almost every other category, since most artifacts are markdown docs *about* something else.

---

## 5. Coverage

- **4,449 of 4,449 indexed artifacts received a classification pass** (100% of Pass 0's index).
- **893 (20%) landed in Unknown** — no keyword in path/filename matched any rule. This is disclosed, not hidden; a meaningful fraction of these are almost certainly classifiable with 5 more seconds of human judgment per file (e.g., a filename like `PRISMA_FIX_COMPLETE.md` should probably tag Database, but wasn't written with a term the current ruleset catches) — the ruleset is a first pass, not exhaustive.
- **Zero files were opened for content this pass.** Every classification is filename/path-derived only, per your instruction.

---

## 6. Methodology, stated plainly

- **Categories**: rule-based keyword matching (regex over lowercased path). A file gets every category whose keyword appears anywhere in its path — deliberately permissive (favors false positives over false negatives, since a missed category is worse than an extra one for a recovery project).
- **Status**: purely repository-location-based — `current-repo` outside `_archive/` → Active; `current-repo` inside `_archive/` → Archived; `old-digitex-erp-bell24h` → Legacy; any `sibling-*` folder → Archived; `projects-root` loose files → Legacy. This is a coarse proxy, explicitly not a content judgment.
- **Confidence**: every row reads "medium-high (filename/path keyword match, content not read)" unless it fell into Unknown, which reads "low." This is intentionally uniform and blunt — a real per-file confidence score would require reading the file, which is out of scope for this pass.
- **Related repositories / related artifacts**: left blank in the CSV this pass. Doing this properly (e.g., noticing that `BELL24H_PLANNED_VS_IMPLEMENTED_FEATURES.md` exists in both the current repo and the old repo, as already confirmed by direct comparison in an earlier turn) requires cross-referencing filenames across repositories — that's explicitly Pass 3 ("cross-reference everything... documents copied between repositories"), not this pass. Populating it now would mean either doing Pass 3's job early or filling the column with unverified guesses, neither of which is right for a classification-only pass.

## 7. Items Requiring Manual Review

1. **The "Agents" category (636 hits) is almost certainly over-broad.** 239 of those are a genuine, distinct thing — a `.agents/` directory in the current repo containing what looks like Claude Code skill definitions (`product-marketing.md`, `ab-testing/evals/evals.json`, `SKILL.md`, etc.) — a real artifact category worth its own attention in Pass 2. The remaining ~397 are the word "agent" appearing as a substring somewhere in a path (e.g., "freelancer-ai-agent.zip", "user-agent" in some config), which is a much weaker signal than the `.agents/` folder match. These two very different things are currently flattened into one count.
2. **"Legacy" as both a category tag and a status value is confusing** — a category tag gets applied when `_archive` or `archive/` appears in the path; the status field separately marks whole repositories as Legacy. These aren't contradictory, but a reader skimming the CSV could conflate them. Worth renaming one of them before Pass 2 if it'll cause confusion.
3. **893 Unknown items** — worth a quick pass to see if a handful of additional keyword rules (e.g., "fix," "status," "summary" as generic report-type signals) would meaningfully shrink this bucket, versus accepting that some fraction of 4,449 files (config boilerplate, `.env.example` variants, generated lockfiles) genuinely don't belong to any topical category and Unknown is the correct answer for them.
4. **10 of 12 current-repo tag dates are still unresolved** from Pass 0 — unrelated to this pass but still open.
5. **23 of 24 old-repo branches still have zero file-level presence in the index** — this pass classified only what Pass 0 actually indexed, so branch-unique files remain entirely unclassified because they're not yet cataloged at all.

Waiting for approval before Pass 2 (category-by-category reading and summarization).
