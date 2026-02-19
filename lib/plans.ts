/**
 * Bell24h Subscription Plan Definitions
 * All KYC/identity fields are OPTIONAL but raise trust score.
 * Plan controls platform capabilities (how much you can do, not who you are).
 */

export type Plan = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface PlanFeatures {
  label: string;
  monthlyPriceINR: number;
  maxRFQsPerMonth: number;        // -1 = unlimited
  maxQuotesPerRFQ: number;        // -1 = unlimited
  canUseEscrow: boolean;
  canUseAIMatching: boolean;
  contactUnlocksPerMonth: number; // -1 = unlimited
  prioritySupport: boolean;
  analyticsAccess: boolean;
  apiAccess: boolean;
}

export const PLANS: Record<Plan, PlanFeatures> = {
  FREE: {
    label: 'Free',
    monthlyPriceINR: 0,
    maxRFQsPerMonth: 2,
    maxQuotesPerRFQ: 5,
    canUseEscrow: false,
    canUseAIMatching: false,
    contactUnlocksPerMonth: 0,
    prioritySupport: false,
    analyticsAccess: false,
    apiAccess: false,
  },
  PRO: {
    label: 'Pro',
    monthlyPriceINR: 2999,
    maxRFQsPerMonth: 20,
    maxQuotesPerRFQ: -1,
    canUseEscrow: true,
    canUseAIMatching: true,
    contactUnlocksPerMonth: 20,
    prioritySupport: true,
    analyticsAccess: true,
    apiAccess: false,
  },
  ENTERPRISE: {
    label: 'Enterprise',
    monthlyPriceINR: 9999,
    maxRFQsPerMonth: -1,
    maxQuotesPerRFQ: -1,
    canUseEscrow: true,
    canUseAIMatching: true,
    contactUnlocksPerMonth: -1,
    prioritySupport: true,
    analyticsAccess: true,
    apiAccess: true,
  },
};

/** Check a specific feature for a given plan */
export function canDo(plan: Plan, feature: keyof PlanFeatures): boolean | number {
  return PLANS[plan][feature];
}

/** Human-readable limit string */
export function formatLimit(value: number): string {
  return value === -1 ? 'Unlimited' : String(value);
}

/** GST number format validator (India) */
export function isValidGST(gst: string): boolean {
  // Format: 2-digit state code + 10-char PAN + 1 entity + Z + 1 checksum
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.trim().toUpperCase());
}

/** Udyam registration number format validator */
export function isValidUdyam(udyam: string): boolean {
  // Format: UDYAM-XX-00-0000000 (state code - 2 alpha - 7 digits)
  return /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(udyam.trim().toUpperCase());
}
