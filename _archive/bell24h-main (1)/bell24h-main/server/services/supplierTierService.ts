// supplierTierService.ts
// Assigns supplier tiers based on metrics (RFQs completed, risk score, verification, etc.)

import { storage } from '../storage.js';

export type SupplierTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface SupplierTierResult {
  tier: SupplierTier;
  completedRFQs: number;
  riskScore?: number;
  isVerified?: boolean;
}

export async function getSupplierTier(userId: number): Promise<SupplierTierResult> {
  // Fetch supplier
  const supplier = await storage.getSupplierByUserId(userId);
  if (!supplier) {
    return { tier: 'Bronze', completedRFQs: 0 };
  }
  // Fetch completed RFQs (assuming status 'completed' or 'closed')
  const rfqs = await storage.getUserRFQs(userId);
  const completedRFQs = rfqs.filter(r => r.status === 'closed').length;
  const riskScore = supplier.risk_score;
  const isVerified = supplier.verification_status;

  // Tier logic
  let tier: SupplierTier = 'Bronze';
  if (isVerified && completedRFQs >= 30 && (riskScore ?? 100) <= 20) tier = 'Platinum';
  else if (isVerified && completedRFQs >= 15 && (riskScore ?? 100) <= 40) tier = 'Gold';
  else if (completedRFQs >= 5 && (riskScore ?? 100) <= 60) tier = 'Silver';
  // else Bronze

  return { tier, completedRFQs, riskScore, isVerified };
}
