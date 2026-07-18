/**
 * Thrown by optimistic-locking update paths (product-intelligence, industry-intelligence
 * service layers) when the caller's expected `version` no longer matches the stored row —
 * i.e. someone else updated it first. Callers must not silently overwrite in that case.
 */
export class VersionConflictError extends Error {
  constructor(public readonly slug: string, public readonly expectedVersion: number) {
    super(`Version conflict on "${slug}": expected version ${expectedVersion}, but it has changed`);
    this.name = 'VersionConflictError';
  }
}
