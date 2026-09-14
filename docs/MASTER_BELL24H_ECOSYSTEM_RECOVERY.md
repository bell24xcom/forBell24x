# THE BELL24H ECOSYSTEM RECOVERY — Final Historical Reference

**Compiled:** 2026-08-03. This is the final pass of the Knowledge Recovery project, synthesizing all ten prior recovery documents plus new evidence gathered specifically this pass: live GitHub PR/Issue data from the old public repository (via `gh` CLI), live Vercel production environment variable names (via `vercel env ls` — names only, no values), and confirmation searches for several previously-unfound named entities.

Tags: **VERIFIED / INFERRED / UNKNOWN / ABANDONED / SUPERSEDED / REMOVED / NEVER IMPLEMENTED**. Where a source could not be accessed at all, this is stated as **SOURCE NOT ACCESSIBLE**, not guessed around.

---

## ⚠️ URGENT — NOT A HISTORICAL FINDING, ACTION NEEDED NOW

This pass surfaced three **open, unresolved, currently-live security disclosures** on the public `digitex-erp/bell24h` repository, filed by outside security researchers via responsible disclosure, none of them fixed:

- **Issue #14** (opened 2026-05-27, still OPEN): *"A real OpenAI API key (`sk-proj-...`) was found committed in plain text in `.env.local.txt`. Anyone who finds this repo can use this key, billed to your account. Revoke immediately at platform.openai.com/api-keys, then purge from git history."*
- **Issue #16** (opened 2026-06-15, still OPEN): full production environment secrets exposed in `.env.production.txt`, committed to git history, publicly visible.
- **Issue #17** (opened 2026-06-19, still OPEN): a local backup environment file (`.env.local.backup.1756844683945`) with exposed secrets, also in public git history.
- **PR #15** (opened 2026-06-10, still OPEN, never merged): an attempted fix for "accidental API key exposure in source files" — submitted, never merged.

**These are real, dated, still-open reports on a public repository, not a historical curiosity.** If any of these credentials (OpenAI key, production secrets, backup-file secrets) are still valid, they are exposed to anyone who finds the repo, right now. This is worth acting on independently of anything else in this document — rotating the OpenAI key and any production secrets that were ever in that repo, and deciding whether to purge/rewrite that repo's git history, is not something to defer until after reading the rest of this recovery. **VERIFIED**, directly via `gh issue view`.

---

## PART I — Source Accessibility (stated honestly, per the brief)

| Source | Accessible? | What was actually recovered |
|---|---|---|
| Current repository (full git history, branches, tags, files) | **VERIFIED accessible** | Fully covered across Pass 0–2F and the Knowledge Book |
| Old GitHub repo (`digitex-erp/bell24h`) — git history, branches, tags | **VERIFIED accessible** — cloned directly | Full history, 24 branches, 0 tags (Pass 0/prior turns) |
| Old repo — Pull Requests | **VERIFIED accessible this pass** via `gh pr list` | 15 PRs found; confirms `feature/blockchain-integration` (PR #12) and `feature/shap-lime-integration` (PR #13) were both **actually merged**, not left dormant on unmerged branches as this recovery previously assumed — see correction below |
| Old repo — Issues | **VERIFIED accessible this pass** via `gh issue list` | 3 open security disclosures (above), 0 closed issues found |
| Cloudflare — live dashboard, build/deployment history, Worker configs, Wrangler configs, functions, redirects, domains | **SOURCE NOT ACCESSIBLE** — no Cloudflare account credentials available to this session. Everything known about Cloudflare comes from repository-committed documentation files (`_archive/*/CLOUDFLARE-*.md`), not the live account |
| Vercel — deployment history, environment variable **names** | **VERIFIED accessible** via authenticated `vercel` CLI, used throughout this session | Live deployment list confirmed (4 recent Ready/Production deployments); full production env var name list captured (below) |
| Vercel — Cron jobs, Functions list, Build evolution beyond what's visible via CLI | **PARTIAL** — this session's CLI access shows deployments and env names, not a full historical build-log archive |
| Render — dashboard, deployment history | **SOURCE NOT ACCESSIBLE** — no Render account credentials. What's known: the service's own code (`ai-explainability-service/`) and a direct, successful live health check (`GET /health` → 200) |
| Local sibling projects | **VERIFIED accessible** — filesystem access, catalogued in Pass 0, several opened directly across Pass 2A/2F |
| AI transcripts (local `.txt` files, `.aider.chat.history.md`) | **VERIFIED accessible and read** — several opened directly (Pass 2A/2F); confirmed this pass: **no ChatGPT export files found anywhere searched** |
| Previous Claude/ChatGPT conversations (as another session's memory, not a local file) | **SOURCE NOT ACCESSIBLE** — no mechanism exists for this session to read another session's memory. Stated plainly since the first time this was asked, unchanged since |

## PART II — Correction from this pass's new evidence

**Blockchain and SHAP/LIME were both actually MERGED into the old repo's main branch, not left dormant on unmerged feature branches.** `gh pr list` confirms: PR #12 ("🚀 Complete Blockchain Integration with AI Features") **MERGED** 2025-10-19; PR #13 ("feat: Add SHAP/LIME AI Insights with Complete E2E Testing") **MERGED** 2025-10-22. Prior passes in this recovery (correctly, based on the evidence available at the time — branch existence and commit counts) implied these were long-running, unmerged experimental branches. They were experimental at first, but both **were completed and merged** before the old repo went silent in February 2026. This explains why `contracts/BellEscrow.sol` etc. and the SHAP/LIME service code exist in the current repo's very first days — they were inherited from an already-merged state of the old repo, not cherry-picked from a stray branch. **Confidence: VERIFIED, corrects an inference from Pass 2A/2B/2C.**

## PART III — Confirmed absent, searched again this pass

**"3DFabrica" / "3D Fabrica," "Sampling Hub"**: searched with and without spacing, across the current repo and all local text/markdown files — **NOT FOUND**, zero matches anywhere.
**ChatGPT export files**: searched by filename pattern across the entire local Projects directory — **NOT FOUND**.
**"Bell365," "ICE Bandhu," "Business Export Leads Link"/"BELL" acronym**: confirmed absent again, consistent with every prior pass that searched for them.

## PART IV — Live Vercel Production Environment (names only, per instruction — no values retrieved or displayed)

`CRON_SECRET`, `MSG91_TEMPLATE_ID`, `PILOT_OTP_IN_RESPONSE`, `CLOUDINARY_UPLOAD_PRESET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_API_KEY`, `NEXT_PUBLIC_VIDEO_RFQ_ENABLED`, `GST_API_KEY`, `PYTHON_EXPLAINER_URL`, `ADMIN_API_KEY`, `BELL24H_V2_EXPORT_KEY`, `BELL24H_V2_URL`, `MSG91_WA_AUTH_KEY`, `MSG91_WA_PHONE`, `MUAPI_API_KEY`, `EXPORT_API_KEY`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_GA_ID`, `FROM_EMAIL`, `AGENT_MODE`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `GROQ_API_KEY`, `NVIDIA_MINIMAX_KEY`, `NVIDIA_DEEPSEEK_KEY`, `NVIDIA_API_KEY`, `NODE_ENV`, `DIRECT_URL`, `NEXT_PUBLIC_MSG91_WIDGET_ID`, `NEXT_PUBLIC_MSG91_TOKEN_AUTH`, `JWT_REFRESH_SECRET`, `NEXT_PUBLIC_LAUNCH_MODE`, `NEXT_PUBLIC_LAUNCH_CITY`, `INSFORGE_URL`, `INSFORGE_API_KEY`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `JWT_SECRET`, `DATABASE_URL`, `RAZORPAY_KEY_SECRET`, `MSG91_SENDER_ID`, `RAZORPAY_KEY_ID`, `MSG91_AUTH_KEY`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, `NEXT_PUBLIC_INSFORGE_BASE_URL`.

**New findings this list reveals, not previously known:**
- **`GST_API_KEY` is configured in production** — meaning real GST-verification infrastructure credentials exist, even though the specific route this session audited (`api/supplier/gst`) doesn't call any external API. **This softens Pass 2D/2F's "GST verification is entirely fake" finding** — the key exists; it's unconfirmed this pass whether *any* route actually uses it. **UNKNOWN**, worth a direct follow-up.
- **`NVIDIA_MINIMAX_KEY`, `NVIDIA_DEEPSEEK_KEY`, `NVIDIA_API_KEY` are all currently configured** — updates Pass 2C's "NVIDIA's current relevance: UNKNOWN" to "NVIDIA is very likely still actively used," though which routes call it was not re-traced this pass.
- **`BELL24H_V2_EXPORT_KEY` / `BELL24H_V2_URL`** — a "V2" system referenced by name for the first time in this entire recovery. **UNKNOWN** what this is; no document read across any pass explains it.
- **`INSFORGE_URL`, `INSFORGE_API_KEY`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, `NEXT_PUBLIC_INSFORGE_BASE_URL` are still configured in current production**, despite InsForge being abandoned as the backend within 24–48 hours of the old repo's start. Consistent with the admin diagnostics route's own `legacyInsforge` check (Pass 2A/2E) — the platform's own code already flags these as a security-hygiene negative. **VERIFIED** they're still present; **INFERRED** they're vestigial/unused, based on the "no live route uses InsForge except the now-fixed Ratings route" finding from earlier this session.
- **`NEXT_PUBLIC_LAUNCH_MODE`, `NEXT_PUBLIC_LAUNCH_CITY`, `AGENT_MODE`** — three flags never encountered in any document across this recovery. **UNKNOWN** purpose.

## PART V — Timelines

**Bell24h Evolution Timeline, Architecture Timeline, Technology Timeline, Infrastructure Timeline, AI Timeline, Marketplace Timeline, Automation Timeline, Deployment Timeline** — all eight are already fully constructed in `MASTER_BELL24H_KNOWLEDGE_BOOK.md` §2 (unified timeline) and the individual Pass 2A–2F documents' own evolution tables (Escrow's 5-generation table, Trust Score's 3-implementation history, the Hosting/Database/Auth/Payment/Messaging evolution tables in Pass 2E, the Brand/Business/Pricing tables in Pass 2F). Rather than repeat those tables verbatim a third time, this document adds only the one new dated correction from Part II above (blockchain and SHAP/LIME merge dates) and treats the rest as already-established, cross-referenced here.

## PART VI — Dependency Maps

**Database:** InsForge (Supabase-based) → Prisma + Neon (`us-east-1` project) → Prisma + Neon (`ap-southeast-1` project, current).
**Hosting:** Cloudflare Pages → (Netlify migration planned, never executed) → Vercel (current, main app) + Render.com (current, SHAP/LIME).
**Authentication:** InsForge/Supabase-backed MSG91 OTP → Prisma-backed MSG91 OTP (current) + JWT/cookie sessions.
**Payments:** planned Razorpay+RazorpayX+Nodal Account (regulated) → what shipped: Razorpay for deposits + Prisma-native wallet ledger (current).
**Automation:** n8n on Oracle Cloud VM → (Vercel Cron considered, rejected) → GitHub Actions (current).
**AI/Escrow:** Polygon blockchain plan → merged into old-repo main (Oct 2025, per Part II correction) → Sepolia-targeting deploy script (contradicts the Polygon plan) → dormant in current repo → **current, actually-live mechanism**: Prisma wallet-ledger simulation, unrelated to either blockchain generation.
**Memory/"OS":** no direct predecessor found → Business Operating Memory + `BusinessLifeEvent` (built specifically for VyaparSethu, no evidence of an equivalent in the old repo's 7-model schema).
**Marketplace:** Day-1 old-repo RFQ+AI → matured through Voice/Video RFQ additions → current full RFQ→Quote→Deal chain, largely unchanged in concept since 2025-05-04, substantially rebuilt in implementation since.

## PART VII — Disposition (completed / partial / never started / abandoned / merged elsewhere / reusable / ready for Bell24h-OS)

| Item | Disposition |
|---|---|
| RFQ/Quote/Deal chain | **Completed**, active |
| Concierge Quote | **Partial** (backend only) |
| Blockchain escrow | **Merged elsewhere then abandoned** — actually completed and merged into the old repo (Part II correction), then not carried into live current-repo use |
| SHAP/LIME | **Completed, merged, reusable, currently active** (flagged off) |
| Trust Score (unified formula) | **Never started** as specified — three ad-hoc pieces exist instead |
| Real GST/Udyam verification | **Never started** in the audited route; **partially started** at the infrastructure level (`GST_API_KEY` exists, unconfirmed usage) |
| Withdraw | **Never started** |
| Multi-org/team/ACL | **Abandoned** |
| RevenueCat | **Completed** (per old-repo commit history) then **abandoned** at the repo transition |
| AI Provider Manager / Prompt Studio / Image/Video/Voice Studios / GraphRAG / Qdrant | **Never started** as named systems |
| Knowledge Graph | **Completed** (existence), depth **unconfirmed** |
| CL4R1T4S prompt library | **Completed**, reusable, currently active as reference material — **ready for Bell24h-OS** if a formal internal-prompt-library feature is ever built, since the vendoring/organization pattern already exists |
| Business Operating Memory | **Completed**, active — the one component genuinely **ready to be the core of "Bell24h-OS"** if that name is ever formalized as a real, bounded product rather than an aspirational module list |
| Multi-Agent Web Agency architecture | **Not part of this ecosystem at all** — belongs to a separate project; not applicable to "ready for Bell24h-OS" |

## PART VIII — Final Confidence Assessment

Highest confidence: this session's own direct, live-traced code and production audits; this pass's live `gh` and `vercel` data (both freshly pulled, directly attributable, not inferred). Next: dated, internally consistent planning documents cross-referenced against code. Lowest: any older percentage-based completion document (100% contradiction rate across this whole recovery, per the Knowledge Book's Lessons Learned).

**One live action item repeated for emphasis, because it matters more than anything else in this document:** three open security disclosures on a public repository, one confirming a real exposed OpenAI key. See the top of this document.

No code, no commits, no pushes, no refactoring, no implementation, no estimates. Stopping here per the brief.
