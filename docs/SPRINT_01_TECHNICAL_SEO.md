# Sprint 01 — Technical SEO

**Parent program:** [ENTERPRISE_SEO_MASTER_PROGRAM.md](ENTERPRISE_SEO_MASTER_PROGRAM.md)
**Backlog items:** `SEO-P0-01` · `SEO-P0-02` · `SEO-P0-03` · `SEO-P1-05` · `SEO-P2-07` · `SEO-P3-01` · `SEO-P3-03`
**Priority band:** P0
**Status:** ⏸ **Not started — awaiting approval**
**Created:** 2026-07-31

---

## Sprint goal

Close the two remaining P0 defects that stop Google from correctly attributing and crawling VyaparSethu, and convert the *already-live* domain cutover into a properly executed migration.

## Why this sprint is first

The robots fix (`c937ae8`) removed the block on rendering. It did not fix **attribution** (16 sitemap URLs tell Google they are the homepage) or **crawl access** (the app returns 429 to fast crawlers). Until both are closed, every downstream sprint invests in pages Google either cannot reach or will not index separately.

## Blocking prerequisite

> ⚠️ **T7 requires a Founder decision (`SEO-P3-03` / Decision D1) before it can start.** T1–T6 are unblocked and can proceed immediately.

## Definition of done

- [ ] Zero sitemap URLs emit a non-self canonical (except recorded intentional dedupes)
- [ ] A 300-URL sequential crawl from one IP returns zero 429s
- [ ] 100% of sitemap URLs return HTTP 200
- [ ] `sitemap.xml` is a statically-generated index with per-namespace children
- [ ] All host/protocol combinations reach the canonical origin in ≤ 1 hop
- [ ] Domain posture ratified or reverted, and `CLAUDE.md` matches production
- [ ] The four CI invariants from Sprint 12 pass against the deployed result

---

## T1 — Remove the inherited root canonical

**Backlog:** `SEO-P0-01` · **Est:** S · **Order:** first

### Objective
Stop `src/app/layout.tsx` from broadcasting a homepage canonical to every page that does not override it, so the 16 affected sitemap URLs can be indexed on their own merits.

### Files
| File | Change |
|---|---|
| `src/app/layout.tsx` | Remove `alternates: { canonical: '/' }` (L24). **Keep** `metadataBase` (L15) — it is required for relative canonical resolution downstream |
| `src/app/page.tsx` | Add an explicit self-canonical for the homepage, which previously relied on the inherited value |

### Dependencies
None to remove the line. **T1 must be immediately followed by Sprint 3 (`SEO-P0-04`)**, which gives each page its own canonical — otherwise 87 routes emit *no* canonical between the two sprints.

### Risk — **Medium**
Between T1 and Sprint 3 completing, affected pages emit no canonical at all. Google then self-canonicalizes by default, which is **strictly better than a wrong canonical** but is not the end state. Accept this interim knowingly, or land T1 and Sprint 3's highest-value pages in the same release.

Do **not** attempt to "fix" this by leaving the layout canonical in place and overriding per page — that inverts the failure mode so a forgotten override silently de-indexes a page.

### Testing
1. Local: `npm run build && npm run start`, then `curl` the homepage and three affected routes; assert `rel=canonical` is self or absent, never the homepage on a non-homepage route.
2. Preview deploy: repeat against the preview URL.
3. Production: verify all 16 URLs from `SEO-P0-01` individually.
4. Add invariant **I2** (Sprint 12) before merging.

### Rollback
Single-line revert restoring `alternates: { canonical: '/' }`; redeploy (~3 min). No data or schema impact. Reverting restores a known-bad state, so prefer rolling *forward* with per-page canonicals.

### Acceptance criteria
- [ ] `alternates` removed from the root layout; `metadataBase` retained
- [ ] Homepage emits its own self-canonical
- [ ] All 16 listed URLs emit a self-referential canonical in production
- [ ] No route emits a canonical pointing at a different URL except recorded dedupes
- [ ] Invariant I2 passes in CI

---

## T2 — Exempt crawlers from the rate limiter

**Backlog:** `SEO-P0-02` · **Est:** M · **Order:** second

### Objective
Ensure Googlebot, Bingbot, and approved third-party crawlers can crawl the full 684-URL sitemap without receiving HTTP 429, while preserving abuse protection for ordinary traffic.

### Files
| File | Change |
|---|---|
| `src/middleware.ts` | Rework the global limiter (L11-13, L138-142): exempt verified crawler UAs, and/or raise the HTML threshold |
| `.env` / Vercel env | Upstash credentials **only if** the durable-limiter option is chosen |

### Dependencies
- Decision on approach (below)
- Upstash Redis provisioning if Option C is chosen
- Approved crawler list depends on Decision **D2** (AI crawler policy) — but Googlebot/Bingbot exemption does not, so do not block on D2

### Approach options
| Option | Description | Trade-off |
|---|---|---|
| **A — UA allowlist** | Skip the limiter for known crawler UAs | Simplest. UA strings are spoofable, so pair with a reasonable ceiling |
| **B — Raise HTML limit** | Increase `MAX_REQUESTS` for HTML | Blunt; weakens abuse protection for everyone |
| **C — Durable keyed limiting** | Move to Upstash Redis, per-UA-class limits | Correct long-term; the code already anticipates this (comment at L9-10). Required anyway for `SEO-P4-01` |

**Recommendation: A now, C when Sprint 10 forces it.** Reverse-DNS verification of Googlebot is the robust form of A if spoofing becomes a concern.

### Risk — **Medium**
`src/middleware.ts` carries domain redirect, forbidden-path blocking, OTP rate limiting, admin auth gating, protected-route gating, CSP, and security headers **in one file**. A mistake here can break authentication or expose admin routes.

**Mandatory controls:**
- Ship as an **isolated commit** touching only the global limiter
- Do **not** modify `OTP_PATHS` / `isOtpRateLimited` — MSG91 charges per SMS and that limit is a cost control
- Do **not** modify the admin or protected-route gates
- Verify on a preview deployment before production

### Testing
1. Unit: limiter returns false for exempted UAs and still limits a generic UA past threshold.
2. Preview: 300 sequential HTML requests with a Googlebot UA → assert zero 429.
3. Preview: 300 rapid requests with a generic UA → assert limiting still engages.
4. Preview regression: OTP endpoints still limit at 5/10 min; `/admin/*` still redirects without `admin-token`; a protected path still 307s without `auth-token`.
5. Production: repeat 2 and 4 after deploy.

### Rollback
Revert the isolated commit; redeploy. Because it is isolated, rollback cannot disturb auth or CSP.

### Acceptance criteria
- [ ] 300 sequential HTML requests from one IP with a crawler UA → **zero** 429
- [ ] Generic-UA abuse protection still engages at a documented threshold
- [ ] OTP limiting unchanged and verified
- [ ] Admin and protected-route gating unchanged and verified
- [ ] Shipped as an isolated commit
- [ ] Approach and threshold recorded in [SEO_DECISIONS.md](SEO_DECISIONS.md)

---

## T3 — Purge non-200 URLs from the sitemap

**Backlog:** `SEO-P0-03` · **Est:** S

### Objective
Guarantee every submitted URL is a crawlable, indexable 200.

### Files
| File | Change |
|---|---|
| `src/app/sitemap.ts` | Exclude routes matching `PROTECTED_USER_PATHS` / `PROTECTED_SUPPLIER_PATHS`; ideally import the lists rather than duplicating them |

### Dependencies
None. Pairs naturally with T4.

### Risk — **Low**
The only real risk is over-exclusion — the protected-path lists use `startsWith`, and a careless match could drop the **public** `/suppliers/*` directory. `src/middleware.ts:90-94` documents a previous incident of exactly this kind, where a bare `/supplier` prefix also matched `/suppliers/*`. Match precisely and assert public namespaces survive.

### Testing
1. Unit: `/rfq/create` excluded; `/suppliers`, `/suppliers/kalamboli`, `/suppliers/[city]/[category]` all retained.
2. Full sweep: every `<loc>` returns 200 (script this; it becomes invariant I2).
3. Compare URL count before/after — the delta should be exactly the intended exclusions.

### Rollback
Revert; the sitemap regenerates on next request/deploy. No persistence.

### Acceptance criteria
- [ ] `/rfq/create` absent from the sitemap
- [ ] 100% of sitemap URLs return 200
- [ ] Public `/suppliers/*` namespace intact (explicitly asserted)
- [ ] Protected-path lists imported, not duplicated
- [ ] Invariant I2 covers status as well as canonical

---

## T4 — Convert the sitemap to a static index

**Backlog:** `SEO-P1-05` · **Est:** M

### Objective
Replace the single 124 KB `force-dynamic` sitemap with a statically-generated index plus per-namespace children, enabling per-template indexation diagnostics and creating headroom for Sprints 4 and 6.

### Files
| File | Change |
|---|---|
| `src/app/sitemap.ts` | Becomes the index; drop `dynamic = 'force-dynamic'` |
| `src/app/sitemap/[segment]/route.ts` *(or per-namespace `sitemap.ts` files)* | New child sitemaps: static, categories, suppliers, city×category, blog, glossary, location, clusters |
| `src/app/robots.ts` | **Additive only** — declare the index. Never add a `Disallow` |

### Dependencies
T3 (exclusion logic should exist before it is split across children).

### Risk — **Low**
Two things to watch: (1) child routes must generate statically (`○`/`●`) or the problem is simply distributed rather than solved; (2) the previous sitemap URL must keep working — `sitemap.xml` stays the entry point, now returning an index.

### Testing
1. Build log: assert child sitemaps are `○`/`●`, not `ƒ`.
2. XML validation of index and every child.
3. Assert each child < 50,000 URLs and < 50 MB.
4. Sum of child URLs equals the previous total minus intended exclusions.
5. Production: `robots.txt` declares the index; GSC accepts it.

### Rollback
Revert to the single-file sitemap. GSC tolerates sitemap structure changes; resubmit the old URL.

### Acceptance criteria
- [ ] `sitemap.xml` returns a valid `<sitemapindex>`
- [ ] Every child validates and is statically generated
- [ ] Each child within size and count limits
- [ ] `robots.txt` declares the index (additive change only)
- [ ] GSC shows per-child submitted/indexed counts
- [ ] Zero non-200, zero non-self-canonical across all children

---

## T5 — Collapse the two-hop `http://` apex redirect

**Backlog:** `SEO-P2-07` · **Est:** S

### Objective
Every host/protocol combination reaches the canonical origin in one hop.

### Files
Platform configuration (Vercel domain settings), possibly `vercel.json`. **No application code.**

### Dependencies
**T7 / Decision D1** — the canonical origin must be settled first, or this is done twice.

### Risk — **Low**, but domain-level. A misconfiguration can make the site unreachable. Change one host at a time and verify between changes.

### Testing
`curl -sIL` each of: `http://vyaparsethu.com`, `https://vyaparsethu.com`, `http://www.vyaparsethu.com`, `https://www.vyaparsethu.com`, plus both bell24h.com forms. Assert ≤ 1 hop and no loops.

### Rollback
Restore previous domain configuration in the Vercel dashboard.

### Acceptance criteria
- [ ] All six host/protocol combinations reach the canonical origin in ≤ 1 hop
- [ ] No redirect loops
- [ ] HSTS unaffected

---

## T6 — Remove the dead robots template

**Backlog:** `SEO-P3-01` · **Est:** XS

### Objective
Eliminate the mechanism by which the fixed `/_next` bug returns.

### Files
| File | Change |
|---|---|
| `src/scripts/generate-global-sitemaps.ts` | Remove `Disallow: /_next/` (L324), or delete the script entirely if the multi-country plan is dormant |

### Dependencies
Founder call on whether the multi-country sitemap plan is still live.

### Risk — **Very Low.** The script is not referenced in `package.json` scripts nor the Vercel `buildCommand`, and writes `robots-{cc}.txt` rather than `robots.txt`.

### Testing
Repo-wide grep for `Disallow: /_next` returns zero hits outside `_archive/`. This becomes invariant **I1**.

### Rollback
Revert. Zero production impact — the script does not execute in any pipeline.

### Acceptance criteria
- [ ] Zero `Disallow: /_next` occurrences in active source
- [ ] Decision recorded in `SEO_DECISIONS.md` (fix vs delete)
- [ ] Invariant I1 greps the whole repo, not just `src/app/robots.ts`

---

## T7 — Ratify or revert the domain migration ⚠️

**Backlog:** `SEO-P3-03` · **Est:** M · **Owner:** Founder (decision), Engineering (execution)

### Objective
Resolve the contradiction between production (301 live) and `CLAUDE.md` (bell24h.com primary until 50+ suppliers), and — if ratified — execute the migration properly so accumulated authority transfers instead of leaking.

### Files
| File | Change |
|---|---|
| `CLAUDE.md` | Update the *Controlled Rebrand Scope* section to match reality |
| `lib/site-url.ts` | Reconcile the `https://www.bell24h.com` default with the deployed `NEXT_PUBLIC_SITE_URL` |
| `src/middleware.ts` | Only if reverting: `REDIRECT_BELL24H_TO_VYAPARSETHU` handling (L6, L120-123) |
| Vercel env | `REDIRECT_BELL24H_TO_VYAPARSETHU`, `NEXT_PUBLIC_SITE_URL` |
| *(external)* | GSC Change of Address |

### Dependencies
**Founder Decision D1.** GSC access to both properties. Blocks T5.

### Risk — **Medium-High** — the only task in this sprint touching live redirect behaviour and the canonical host. A canonical-host mistake suppresses the entire site.

### Testing
1. Redirect-chain assertions for all six host/protocol forms.
2. Assert zero canonical or sitemap URL references the non-primary domain.
3. GSC: both properties verified; Change of Address accepted.
4. Monitor index coverage on both properties for 14 days post-change.

### Rollback
Toggle `REDIRECT_BELL24H_TO_VYAPARSETHU` in Vercel env — no code deploy required. **Note:** a filed GSC Change of Address is not cleanly reversible, so file it only after the decision is final.

### Acceptance criteria
- [ ] Founder decision recorded as D1 in `SEO_DECISIONS.md`
- [ ] If ratified: both GSC properties verified, Change of Address filed, sitemap submitted, ≥ 12-month 301 commitment documented
- [ ] If reverted: env unset, `NEXT_PUBLIC_SITE_URL` reconciled, redirects removed
- [ ] `CLAUDE.md` matches production
- [ ] Zero canonical or sitemap URL on the non-primary domain
- [ ] "Formerly Bell24h" footer note present during transition

---

## Execution order

```
T6 ──────────────────────────────► (independent, ship anytime)

T1 ──► T3 ──► T4 ──────────────► validate
       │
T2 ────┘  (independent of T1; isolated commit)

D1 ──► T7 ──► T5                (blocked on Founder)
```

**Recommended release grouping**

| Release | Tasks | Rationale |
|---|---|---|
| **1.1** | T6, T2 | Zero-risk cleanup + isolated middleware change. Ship separately so the middleware change can be reverted alone |
| **1.2** | T1, T3, T4 | Canonical + sitemap correctness as one coherent change |
| **1.3** | T7, T5 | After D1 only |

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Middleware change breaks auth | Low | **Critical** | Isolated commit; preview verification; explicit auth regression tests (T2 testing step 4) |
| Canonical gap between T1 and Sprint 3 | **High** | Low | Accepted knowingly — absent canonical beats wrong canonical. Land high-value pages in the same release |
| Over-exclusion drops public `/suppliers/*` | Medium | High | Explicit retention assertions (T3); prior incident documented at `middleware.ts:90-94` |
| Domain change suppresses site | Low | **Critical** | Single-toggle rollback; 14-day coverage monitoring; file Change of Address only after D1 is final |
| Child sitemaps ship as `ƒ` | Medium | Low | Build-log assertion in T4 testing |

## Out of scope

Per-page metadata (Sprint 3) · structured data (Sprint 2) · `/categories` ISR (Sprint 9) · fonts and images (Sprint 9) · AI crawler directives (Sprint 7) · any `prisma/schema.prisma` change · any API route change · any role-based access check.
