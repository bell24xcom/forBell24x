/**
 * Single source of truth for a supplier's Trust Score.
 *
 * The score itself is written to User.trustScore by several event-driven
 * bonus rules (OTP verification, onboarding, KYC, profile claim, reviews —
 * see their respective routes). This module does not compute a score; it
 * exists so every *reader* of trust score goes through one place, rather
 * than re-deriving a competing number from raw profile fields the way
 * src/app/api/supplier/[id]/route.ts and src/app/api/supplier/stats/route.ts
 * used to (found during the Trust Score consolidation sprint, 2026-08-03 —
 * those two routes computed their own ad-hoc formula and never matched the
 * stored value shown everywhere else in the app).
 */
export function getTrustScore(user: { trustScore: number }): number {
  return user.trustScore;
}
