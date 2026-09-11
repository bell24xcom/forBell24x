# MASTER INDEX — Pass 0: Mechanical Enumeration Only

**Compiled:** 2026-08-03. This is inventory only — no file was opened for content, no document was read or described. Every row below is metadata produced by walking the filesystem and git refs directly. The row-level detail lives in the companion file `MASTER_INDEX.csv` (4,449 rows); this document holds the repository/branch/tag structure and the pass completion report.

Tagging: **VERIFIED** = confirmed by direct command output this pass. **INFERRED** = a reasonable read of the evidence, not directly confirmed. **UNKNOWN** = genuinely undetermined. **NOT INSPECTED** = known to exist, not yet opened/walked.

---

## 1. Repository Inventory

| Repository | Path | Remote | Branch count | Tag count | Commit count | Confidence |
|---|---|---|---|---|---|---|
| current-repo | `C:\Users\Sanika\Projects\bell24h` | `https://github.com/bell24xcom/forBell24x.git` | 4 local, 5 remote-tracked | 12 | 556 (main) | **VERIFIED** |
| old-digitex-erp-bell24h | cloned to scratchpad (read-only, not part of this repo) | `https://github.com/digitex-erp/bell24h.git` | 1 local (main, checked out), 23 remote-tracked (not checked out — see §2) | 0 | 576 (main) | **VERIFIED** |
| sibling-bell24h-clean | `C:\Users\Sanika\Projects\bell24h-clean` | UNKNOWN — not yet checked whether it has its own `.git` | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** beyond file listing |
| sibling-bell24h-deploy | `C:\Users\Sanika\Projects\bell24h-deploy` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** — excluded from this pass entirely; a 264MB `bell24h-deploy.zip` sits alongside it in the parent folder and was cataloged as a single archive item, but neither the zip's contents nor this folder's contents were walked |
| sibling-bell24h-final | `C:\Users\Sanika\Projects\bell24h-final` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** beyond file listing (4 files found) |
| sibling-bell24h-live | `C:\Users\Sanika\Projects\bell24h-live` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** beyond file listing (6 files found) |
| sibling-bell24h-main | `C:\Users\Sanika\Projects\bell24h-main` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** beyond file listing (14 files found) — distinct from `_archive/bell24h-main` inside the current repo, and distinct from the old repo's own nested `bell24h-maingit/bell24h-main/` |
| sibling-bell24h-migration-package | `C:\Users\Sanika\Projects\bell24h-migration-package` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** beyond file listing (5 files found, includes `MIGRATION_COMPLETE_SUMMARY.md`, `NEON_DATABASE_MIGRATION.md`, `ZERO_DOWNTIME_DEPLOYMENT.md` — names only, not read) |
| sibling-bell24h-working | `C:\Users\Sanika\Projects\bell24h-working` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** beyond file listing (4 files found) |
| sibling-bell24x-clean | `C:\Users\Sanika\Projects\bell24x-clean` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** beyond file listing (4 files found) |
| sibling-bell24x-complete | `C:\Users\Sanika\Projects\bell24x-complete` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** beyond file listing (6 files found) |
| sibling-web-agency | `C:\Users\Sanika\Projects\Web-Agency` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | **NOT INSPECTED** beyond file listing (388 files found — this is a real, separate "Multi-Agent Web Agency" concept, not yet content-read at all) |
| projects-root (not a repo) | `C:\Users\Sanika\Projects\` (loose files only) | n/a | n/a | n/a | n/a | **VERIFIED** as loose files, not a project — 11 items: a 264MB deploy zip, saved conversation-style `.txt` transcripts (dated Aug–Sep 2025), standalone HTML mockups (dated June 2025), a logo image, and a second zip (`Multi-Agent-Web-Agency-main.zip`) |

**Excluded from this pass entirely, per your scoping in the earlier turn:** any Google Drive documents (connector existence unconfirmed), any previous Claude/ChatGPT session memory (not accessible by any means), Supabase/Replit/Databutton/Bolt.new/Shogo.ai projects (no evidence any of these were ever used, and no credentials to check even if they were).

---

## 2. Branch Inventory

### current-repo (`bell24xcom/forBell24x`)

| Branch | Tip commit | Tip date | Local/remote | Notes |
|---|---|---|---|---|
| main | `b732e92` | 2026-08-02 | both | Active |
| digitex-erp-bell24h | `fa14c9e` | 2025-12-15 | local only | One commit ahead of its merge-base with main ("Allow dashboard access"). Tip date (2025-12-15) predates this repo's own first commit (2026-02-16) — **UNKNOWN** how a branch in this repo has a tip older than the repo's genesis commit; not yet resolved this pass, flagged for Pass 2/3 |
| domain/site-url-refactor | `535b7f3` | 2026-06-04 | local + remote | — |
| temp/bell24h-update | `18dde79` | 2026-01-28 | local only | **VERIFIED** — root commit 2025-11-22, zero shared ancestry with main (confirmed via `git merge-base` in the prior pass), a genuinely separate Vite+React+Gemini lineage, already reported in detail last turn |
| claude/upgrade-nextjs-security-mL5SG | `1157d39` | 2026-02-25 | remote only | Not yet inspected for content |
| claude/serene-edison-KohOl | `083d1d6` | 2026-05-25 | remote only | Not yet inspected for content |
| claude/setup-bell24h-production-uVsIs | `9082c56` | 2026-02-18 | remote only | Not yet inspected for content |

### old-digitex-erp-bell24h (`digitex-erp/bell24h`)

| Branch | Tip commit | Tip date | Notes |
|---|---|---|---|
| main | `963473935` | 2026-02-13 | Checked out and fully indexed this pass |
| bell24h | `290a0fea8` | 2025-09-18 | **NOT INSPECTED** for unique file content — tip predates main's own final commits by 5 months, suggesting this may be an earlier snapshot/checkpoint branch |
| claude/document-project-architecture-QHk0Z | `8d9bda17f` | 2026-01-08 | **NOT INSPECTED** |
| claude/fix-issue-nS9R3 | `e78cd2f7e` | 2025-12-15 | **NOT INSPECTED** |
| cursor/bc-3f33e627-...-cb35 | `6c1ab8d1e` | 2025-09-28 | **NOT INSPECTED** — one of 8 Cursor-IDE-generated branches, all named with the same `cursor/bc-<uuid>` pattern |
| cursor/bc-77bbdb7e-...-5aaa | `a79a26dbb` | 2025-09-28 | **NOT INSPECTED** |
| cursor/bc-8281f1df-...-19ff | `c94b6e15c` | 2025-09-28 | **NOT INSPECTED** |
| cursor/bc-851973d8-...-f5e8 | `de16e6148` | 2025-09-30 | **NOT INSPECTED** |
| cursor/debug-tailwind-css-and-tsconfig-errors-13f9 | `5c884c3f9` | 2025-09-17 | **NOT INSPECTED** |
| cursor/fix-compare-quotes-page-prerendering-error-80b8 | `40b446b2d` | 2025-09-28 | **NOT INSPECTED** |
| cursor/fix-javascript-errors-and-avatar-paths-4013 | `dadf52b85` | 2025-09-28 | **NOT INSPECTED** |
| cursor/fix-unresponsive-terminal-and-install-dependencies-6692 | `db6a1285c` | 2025-09-17 | **NOT INSPECTED** |
| cursor/realistic-implementation-and-testing-plan-0d91 | `6e5a5b512` | 2025-09-17 | **NOT INSPECTED** — name suggests a self-aware "let's be realistic" planning branch, worth prioritizing in Pass 2 |
| cursor/resolve-dns-problem-from-image-b21d | `062128f56` | 2025-09-17 | **NOT INSPECTED** |
| dev/live-e2e-stable | `59f23b0c1` | 2025-10-21 | **NOT INSPECTED** |
| feature/blockchain-integration | `8b60d8a24` | 2025-10-19 | **VERIFIED**, partially — 391 unique commits vs main, final commit content already read in the prior pass (contracts confirmed identical to current repo). Full file tree not yet enumerated |
| feature/shap-lime-integration | `e2ccdf887` | 2025-10-23 | **VERIFIED**, partially — 403 unique commits vs main; `ai-explainability-service/main.py` at this branch's tip already confirmed identical to what's live in the current repo. Full file tree not yet enumerated |
| pr/auto-stable | `ddbddd784` | 2026-01-02 | **NOT INSPECTED** |
| pr/dev-live-e2e | `c1e91014a` | 2025-10-21 | **NOT INSPECTED** |
| snyk-upgrade-925e1ce5... | `f4bae810b` | 2025-10-02 | **NOT INSPECTED** — automated dependency-security-scan branch |
| snyk-upgrade-9f754383... | `3b747ae63` | 2025-04-17 | **NOT INSPECTED** — the earliest-dated branch tip found anywhere in either repo |

23 branches total on the old repo; only `main` has been file-enumerated this pass. **This is the single largest acknowledged gap in this Pass 0** — the blockchain and SHAP/LIME branches alone represent 794 commits combined that have not had their full file trees walked (only spot-checked in the prior turn).

---

## 3. Tag Inventory

### current-repo

| Tag | Tip commit | Date |
|---|---|---|
| v1.0-stable | `6b3e3d0` | UNKNOWN — no committer date returned by `git for-each-ref` for this tag |
| v1.1-stable | `9c323e0` | UNKNOWN |
| v1.2-stable | `a802a37` | UNKNOWN |
| v2.0-stable | `76ddbac` | UNKNOWN |
| v2.1-stable | `a6741ec` | UNKNOWN |
| v2.2-stable | `71b7ab5` | UNKNOWN |
| v2.3-stable | `1cd291b` | UNKNOWN |
| v2.4-stable | `e819feb` | UNKNOWN |
| v2.5-stable | `1af9c6c` | 2026-03-29 |
| v2.6-stable | `bee83f5` | 2026-03-30 |
| v2.7-stable | `2816a9a` | UNKNOWN |
| v2.8-stable | `983eac6` | UNKNOWN |

Note: dates came back empty for most tags via `%(committerdate:short)` this pass — likely lightweight tags pointing at annotated-tag objects rather than commits directly, which needs a different git query to resolve. Dates for v2.5/v2.6 were resolved in a prior turn via `git log -1` on the tag name directly rather than `for-each-ref`; the same technique would resolve the rest but wasn't re-run this pass. **NOT INSPECTED further this pass.**

### old-digitex-erp-bell24h

**Zero tags.** VERIFIED (`git tag` returns empty).

---

## 4. File Enumeration Summary

**Total artifacts cataloged in `MASTER_INDEX.csv`: 4,449 rows.**

By repository:

| Repository | Files indexed |
|---|---|
| current-repo | 2,731 |
| old-digitex-erp-bell24h (main branch only) | 1,252 |
| sibling-bell24h-clean | 24 |
| sibling-bell24h-final | 4 |
| sibling-bell24h-live | 6 |
| sibling-bell24h-main | 14 |
| sibling-bell24h-migration-package | 5 |
| sibling-bell24h-working | 4 |
| sibling-bell24x-clean | 4 |
| sibling-bell24x-complete | 6 |
| sibling-web-agency | 388 |
| projects-root (loose files) | 11 |

By file type (top entries):

| Type | Count |
|---|---|
| Markdown (.md) | 2,035 |
| JSON | 833 |
| PowerShell (.ps1) | 309 |
| Text (.txt) | 282 |
| Python (.py) | 187 |
| Shell (.sh) | 181 |
| CommonJS (.cjs) | 180 |
| YAML (.yml/.yaml) | 127 |
| SQL | 75 |
| Env-file variants (.env.*) | ~43 |
| TOML | 33 |
| Dockerfile | 25 |
| PDF | 17 |
| CSV | 4 |
| ZIP | 5 |
| HTML | 4 |
| JPEG | 1 |

**Exclusions applied to every source** (generated/dependency artifacts, not historical project material): `node_modules`, `.git`, `.next`, `dist`, `build`, `.venv`, `venv`, `coverage`, `test-results`, `playwright-report`, `.pytest_cache`, `site-packages`, `__pycache__`. This exclusion list was refined mid-pass after an initial run started pulling in a Python virtual environment's third-party package internals (a `venv` folder without the leading dot, which the first exclusion pattern missed) — the corrected run is what's reflected in the counts above.

---

## 5. Pass 0 Completion Report

**Items completed:**
- 2 primary git repositories fully identified, branch-listed, and tag-listed
- 1 repository (current) fully file-enumerated
- 1 repository (old, main branch only) fully file-enumerated
- 9 sibling local folders file-enumerated (shallow — files listed, not read)
- 11 loose root-level files cataloged
- 4,449 total artifacts recorded in `MASTER_INDEX.csv`

**Items remaining (explicitly NOT inspected, not silently omitted):**
- 23 non-main branches in the old repo — file trees not walked (only 2 of them spot-checked for one file each in the prior turn)
- `sibling-bell24h-deploy` folder and its 264MB zip — neither opened
- Internal contents of the 5 ZIP files found — cataloged as single archive entries only, not extracted, per your Pass 0 instruction
- Whether any of the 9 sibling folders are themselves git repositories with their own branch/commit history — not checked
- Tag dates for 10 of 12 current-repo tags — query technique needs adjustment
- Content of any file, anywhere — zero files were opened for reading this pass, by design

**Coverage percentage:** Meaningful only if a denominator is agreed on. By repository count: 2 of 2 primary repos discovered, 1 of 2 fully file-enumerated (50%), branches: 5 of 30 total branches across both repos have had any file-level inspection (~17%), sibling folders: 9 of 9 discovered and shallow-listed (100% of what's known to exist), file-content reading: 0% (by design — Pass 0 is metadata only).

Waiting for approval before Pass 1 (categorization).
