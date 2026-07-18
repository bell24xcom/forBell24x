# Product & Industry Intelligence — Hardening Architecture (Phase 2C)

Scope: `src/lib/product-intelligence/`, `src/lib/industry-intelligence/`, their static
fallback catalogs in `src/data/`, and the two read-only admin routes that consume them
(`src/app/api/admin/product-intelligence/route.ts`, `.../industry-intelligence/route.ts`).
No schema migration was needed or made — every change here is application-layer.

## 1. N+1 elimination

Both modules previously fetched a slug list, then called a single-slug getter once per
slug (`Promise.all(slugs.map(getX))`, or in the two graph builders, a sequential
`for...of` + `await` loop — worse, since it doesn't even parallelize). Each of those
per-slug calls was its own `findUnique` round trip, even in cases where a `findMany`
had *just* fetched the same rows moments earlier via the list path.

**Fix**: both `service.ts` files gained a batch primitive:

```ts
getProductRecordsBySlugs(slugs: string[]): Promise<Map<string, ProductIntelligenceRecord | null>>
getIndustryRecordsBySlugs(slugs: string[]): Promise<Map<string, IndustryIntelligenceRecord | null>>
```

Behavior: if the list cache is warm, resolve entirely from memory (zero DB calls). If
not, check the per-slug cache for hits, and issue exactly **one**
`findMany({ where: { slug: { in: misses } } })` for whatever's left — never one query
per slug. The static-catalog fallback files (`src/data/*-catalog.ts`) expose a matching
`getProductRecords`/`getIndustryRecords(slugs)` that wraps this in the DB-timeout guard
(§3) and falls back per-slug to the static catalog.

Every call site that used to loop (`engine.ts`'s `listProducts`/`listIndustries`,
`getRelatedProducts`, `getProductIndustries`/`getIndustryProducts`, both `catalogStats`
fallbacks, and both graph builders' `buildProductGraph`/`buildIndustrySubgraph`) now
calls the batch function once and reads from the returned `Map`. `getClusterRecord()`
was left untouched everywhere — it's a synchronous static lookup (`src/data/industrial-clusters.ts`),
never a DB call, so it was never part of the N+1 problem.

## 2. Optimistic locking

Both Prisma models already carry `slug @unique` and `version Int @default(1)` — no
migration required. Previously, `update`/`upsert` always did
`version: { increment: 1 }` unconditionally: two concurrent editors would both "win,"
the second silently discarding the first's change.

**Fix**: `updateProductRecord(slug, patch, expectedVersion)` /
`updateIndustryRecord(slug, patch, expectedVersion)` now run

```ts
prisma.<model>.updateMany({ where: { slug, version: expectedVersion }, data: { ...patch, version: { increment: 1 } } })
```

If `count === 0`, the row's version had already moved — throw `VersionConflictError`
(`src/lib/version-conflict.ts`) rather than silently overwriting. `upsertProductRecord`/
`upsertIndustryRecord` accept an **optional** third `expectedVersion` param: when given,
the same conditional update runs first, falling through to `create` only if a follow-up
lookup confirms the row doesn't exist at all (not merely because `count === 0` — that's
ambiguous between "row missing" and "stale version," so existence is checked explicitly
before treating it as a create). When `expectedVersion` is omitted, the old unconditional
`upsert` remains available — documented as unsafe under concurrent writers, kept only
for non-racing callers such as a future one-off import script. **No route calls these
mutation functions today** (confirmed: only the two GET routes touch these modules), so
this was a safe, isolated signature change with zero blast radius on the current API
surface. Whichever future admin write endpoint gets built should catch
`VersionConflictError` and return HTTP 409.

## 3. Cache architecture

`src/lib/cache/cache-store.ts` defines a minimal `CacheStore<T>` interface
(`get/set/delete/clear`) and a `MemoryCacheStore<T>` implementation. Both `service.ts`
files now hold a `listCache: CacheStore<Record[]>` and `bySlugCache: CacheStore<Record | null>`
instance instead of raw `Map`/nullable-object state — same 60s TTL, same behavior, just
behind an interface.

This is intentionally **not** the same as the existing `src/lib/cache.ts` `CacheManager`
— that's a larger, async, Redis-wired singleton (`ioredis` dynamic import gated on
`REDIS_URL`) used elsewhere in the app. Its `get`/`set` are `async`, which doesn't fit
how these two services read their cache synchronously inline (no `await` on a cache
hit). Extending `CacheManager` for this narrow, high-frequency, low-write use case would
have meant `await`-ing every cache read across both modules for no behavioral gain today.

**Future Redis path**: implement `CacheStore<T>` (or an async variant of it) backed by
Redis — or backed by the existing `CacheManager` — and swap the `createMemoryCache()`
call in each `service.ts` for the new constructor. Service code never imports
`MemoryCacheStore` directly, only the `CacheStore<T>` interface, so this swap touches
two lines total when it happens. **Redis is not integrated in this phase** — this is
architecture-only, per the explicit instruction not to integrate it yet.

## 4. DB timeout protection

`src/lib/db-timeout.ts` exports `withDbTimeout(fn, timeoutMs = 1500)`, used from the
`src/data/*-catalog.ts` fallback layer (not from `service.ts`, which stays a pure Prisma
layer) around every DB call: `listProductSlugs`, `getProductRecord`, `getProductRecords`,
and the Industry equivalents. On timeout, a `DbTimeoutError` is thrown, a single
`console.warn` is logged, and the static catalog answers the request instead — the
page never blocks on a hung DB call.

**Caveat, stated plainly**: `Promise.race` abandons the *caller's wait* on the slow
call — it does not cancel the underlying Prisma query. That query keeps running against
Postgres and still holds a connection-pool slot until it resolves naturally (or the
pool's own statement timeout fires, if one is configured — none is today). This utility
bounds request latency; it does not bound DB load. True query cancellation would need a
Postgres-level `statement_timeout` or a Prisma query-level timeout — out of scope for
this phase.

## 5. Pagination

`src/lib/pagination.ts` defines the shared shape:

```ts
interface PaginationParams { page: number; pageSize: number; }
interface PaginatedResult<T> { items: T[]; total: number; page: number; pageSize: number; hasMore: boolean; }
```

`listProductRecords`/`listIndustryRecords` (service layer) and `listProducts`/
`listIndustries` (engine layer) are overloaded: called with no arguments, behavior and
return type are unchanged (every existing caller uses this form); called with
`{ page, pageSize }`, they return a `PaginatedResult<T>`. Pagination is offset-based
against the already-cached, already-materialized full array — genuine cursor
pagination isn't a real problem at this catalog's scale (low hundreds of rows), but the
returned shape is deliberately cursor-adaptable (`items/total/page/pageSize/hasMore`)
so a future cursor-based backend wouldn't need a breaking type change.

Both admin GET routes now accept optional `?page=&pageSize=`: when both are present and
are positive integers, the list branch returns the paginated shape instead of the full
list; otherwise, response shape is identical to before. No UI consumes these params yet.

## 6. Performance analysis

No live benchmark was run this session (no seed/migrate, no production traffic access
per this phase's constraints) — the table below is a structural before/after based on
reading the rewritten code, not measured numbers.

| Function | DB calls before (cold cache, N related slugs) | DB calls after |
|---|---|---|
| `listProducts()` / `listIndustries()` | 1 (`findMany` for slug list) + N (`findUnique` each) | 1 (`findMany`), or 0 if list cache warm |
| `getRelatedProducts(slug)` | 1 + N | 1 (batched), or 0 if list cache warm |
| `getProductIndustries(slug)` / `getIndustryProducts(slug)` | 1 + N | 1 (batched), or 0 if list cache warm |
| `buildProductGraph(slug)` | 1 + I + R (sequential, not even parallel) | 1 + up to 2 batched calls (industries, related products), run concurrently via `Promise.all` |
| `buildIndustrySubgraph(slug)` | 1 + P (sequential) | 1 + 1 batched call |
| `catalogStats()` / `industryCatalogStats()` | 1 + N (fallback path only) | 1 batched (fallback path only) |

Worst case for any list/graph function is now **O(1) DB round trips** regardless of how
many related slugs are involved (previously O(N)). Cache hit ratio and real memory
footprint aren't measurable without production traffic; structurally, the worst case is
"first request after the 60s TTL expires," which costs exactly one `findMany` for the
whole catalog, not one query per related item.

**Instrumentation note**: `MemoryCacheStore` exposes a dev-only `stats(): { size }`
getter. A per-call `console.debug` query counter across every raw `prisma.*` call site
was considered (to get real, session-observable query counts in local dev) but dropped
to keep this batch's diff to the minimal reviewable size — listed as a remaining
weakness/optional follow-up below.

## 7. Future work (explicitly out of scope for this phase)

- **Redis-backed `CacheStore`**: implement the interface from §3 against Redis (or the
  existing `CacheManager`), gated behind the same kind of env check `CacheManager`
  already uses (`REDIS_URL`).
- **Query cancellation**: a real Postgres `statement_timeout` or Prisma-level query
  timeout, since `withDbTimeout` only bounds the caller's wait today, not DB load (§4).
- **Cursor-based pagination**: only worth it if either catalog grows well beyond a few
  hundred rows; today's offset-based approach against an in-memory cached array is
  sufficient.
- **Search indexing**: `search.ts`'s in-memory substring filter over `listProducts()`
  is fine at current catalog size; a real search index (e.g. Postgres full-text or an
  external index) would matter at much larger scale.
- **Dev-only query-count instrumentation**: deferred per §6.
