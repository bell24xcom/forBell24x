/**
 * Small, synchronous, per-process cache abstraction for read-heavy service layers
 * (currently: product-intelligence and industry-intelligence). Deliberately separate
 * from `src/lib/cache.ts` (`CacheManager`), which is an async, Redis-wired singleton
 * used elsewhere in the app — that cache requires `await` on every read, which doesn't
 * fit the synchronous cache-then-fallback-to-DB pattern these services use today.
 *
 * Swapping in a Redis-backed store later means implementing this same interface
 * (or an async variant of it) and constructing that instead — service code only ever
 * depends on `CacheStore<T>`, never on `MemoryCacheStore` directly.
 */

export interface CacheStore<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttlMs: number): void;
  delete(key: string): void;
  clear(): void;
}

export class MemoryCacheStore<T> implements CacheStore<T> {
  private store = new Map<string, { value: T; expires: number }>();

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expires <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expires: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** Dev-only visibility into cache size; not a substitute for real metrics. */
  stats(): { size: number } {
    return { size: this.store.size };
  }
}

export function createMemoryCache<T>(): CacheStore<T> {
  return new MemoryCacheStore<T>();
}
