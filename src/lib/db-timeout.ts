/**
 * Bounds how long a caller waits on a DB call before falling back to a static catalog.
 *
 * Caveat: `Promise.race` abandons the caller's wait on the slow call — it does NOT
 * cancel the underlying Prisma query. That query keeps running against Postgres and
 * still holds a connection-pool slot until it naturally resolves (or the pool's own
 * statement timeout fires). This utility bounds request latency; it does not bound
 * DB load. True cancellation would need a query-level timeout (e.g. Prisma's
 * `$queryRawUnsafe` with `statement_timeout`, or a connection-pool setting) — out of
 * scope here.
 */

export class DbTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`DB operation exceeded ${timeoutMs}ms timeout`);
    this.name = 'DbTimeoutError';
  }
}

export async function withDbTimeout<T>(fn: () => Promise<T>, timeoutMs = 1500): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new DbTimeoutError(timeoutMs)), timeoutMs);
  });
  try {
    return await Promise.race([fn(), timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
