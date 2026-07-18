/**
 * Shared pagination shape for list functions across service layers. Offset-based today
 * (backing arrays are small, cached catalogs — not a real pagination problem at this
 * scale), but the return shape is chosen so a future cursor-based backend can populate
 * the same fields without a breaking type change.
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function paginate<T>(all: T[], { page, pageSize }: PaginationParams): PaginatedResult<T> {
  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);
  return { items, total: all.length, page, pageSize, hasMore: start + pageSize < all.length };
}
