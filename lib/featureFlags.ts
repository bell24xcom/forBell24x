/**
 * Bell24h Feature Flags
 *
 * NEXT_PUBLIC_ flags are available client-side (bundled into JS).
 * Non-prefixed flags are server-side only.
 *
 * Launch Mode (set NEXT_PUBLIC_LAUNCH_MODE=true in Vercel env):
 *   - Shows "Mumbai Pilot Phase" banner on all pages
 *   - Restricts marketplace to LAUNCH_CITY and LAUNCH_CATEGORY
 *   - Admin can override via LAUNCH_ADMIN_OVERRIDE=true
 *
 * Usage logging is always on for free-phase monetization data.
 */

// ─── Client-side flags (NEXT_PUBLIC_) ────────────────────────────────────────
export const featureFlags = {
  // UI / performance features
  enableCanvas:    process.env.NEXT_PUBLIC_ENABLE_CANVAS    === 'true',
  enableThreeBell: process.env.NEXT_PUBLIC_ENABLE_THREE_BELL === 'true',
  enableAudio:     process.env.NEXT_PUBLIC_ENABLE_AUDIO      === 'true',

  // Launch mode — pilot phase
  launchMode:      process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true',
  launchCity:      process.env.NEXT_PUBLIC_LAUNCH_CITY     || 'Mumbai',
  launchCategory:  process.env.NEXT_PUBLIC_LAUNCH_CATEGORY || '',

  // Pricing enforcement (disabled for free 60-90 day pilot)
  strictPricing:   process.env.NEXT_PUBLIC_STRICT_PRICING === 'true',
} as const;

// ─── Server-side flags (not exposed to client) ────────────────────────────────
export const serverFlags = {
  // Launch mode marketplace filter — server enforced
  launchMode:           process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true',
  launchCity:           process.env.NEXT_PUBLIC_LAUNCH_CITY     || 'Mumbai',
  launchCategory:       process.env.NEXT_PUBLIC_LAUNCH_CATEGORY || '',
  launchAdminOverride:  process.env.LAUNCH_ADMIN_OVERRIDE === 'true',

  // Usage tracking — always on for monetization data
  trackUsage: true,

  // Rate limits for pilot (conservative for 13 users)
  maxRFQsPerDayBuyer:        Number(process.env.MAX_RFQS_PER_DAY)     || 10,
  maxQuotesPerDaySupplier:   Number(process.env.MAX_QUOTES_PER_DAY)   || 20,
  maxQuotesPerRFQSupplier:   1, // one quote per supplier per RFQ (already enforced)
} as const;
