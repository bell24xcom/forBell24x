/**
 * Type definitions for database interactions
 */

// Define QueryResult type for consistent database interactions
export interface QueryResult<T = Record<string, unknown>> extends Array<T> {
  rowCount?: number;
  rowsAffected?: number;
  command?: string;
  fields?: any[];
}

// Helper function to convert database results to proper type
export function ensureArray<T>(result: T[] | any): T[] {
  if (Array.isArray(result)) {
    return result;
  }
  return result?.rows || [];
}
