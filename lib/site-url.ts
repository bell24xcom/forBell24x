/**
 * Single source of truth for the public site origin.
 *
 * Domain cutover (bell24h.com -> vyaparsethu.com) is a ONE-LINE change:
 * set NEXT_PUBLIC_SITE_URL in the deployment environment. No code edits needed.
 *
 * Default stays bell24h.com so behaviour is unchanged until the env var flips.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bell24h.com'
).replace(/\/+$/, '');

/** Bare host (no protocol), e.g. "www.bell24h.com" — for display text. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');
