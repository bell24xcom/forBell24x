import { NextRequest } from 'next/server';

/**
 * Standardized cron authentication using Authorization: Bearer CRON_SECRET
 * All cron routes must use this function for consistent authentication.
 */
export function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // If no CRON_SECRET is configured, allow requests (for local dev)
  if (!cronSecret) return true;

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Helper to get cron auth header for internal fetch calls
 */
export function getCronHeaders(): Record<string, string> {
  const cronSecret = process.env.CRON_SECRET;
  return cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {};
}
