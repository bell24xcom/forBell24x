/**
 * Bell24H Dynamic Pricing System
 * Revenue Generation from First Month
 * 
 * Multiple Revenue Streams:
 * 1. Subscription Plans (Monthly/Annual)
 * 2. Transaction Fees (2-5% per transaction)
 * 3. Escrow Fees (1-2% per escrow transaction)
 * 4. Commission on High-Value Deals (2-5%)
 * 5. Lead Unlock Fees (₹500 per lead)
 * 6. Premium Features (AI Matching, Analytics, etc.)
 */

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
  limitations: string[];
  transactionFeeRate: number; // Percentage
  escrowFeeRate: number; // Percentage
  commissionRate: number; // Percentage
  maxRFQs: number | 'unlimited';
  maxSuppliers: number | 'unlimited';
  aiFeatures: boolean;
  prioritySupport: boolean;
  analytics: boolean;
  voiceRFQ: boolean;
  videoRFQ: boolean;
  hindiSupport: boolean;
  gstVerification: boolean;
  trustScoring: boolean;
  mobileApp: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  dedicatedManager: boolean;
  customIntegrations: boolean;
  sla: string;
  uptime: string;
  popular?: boolean;
  color: string;
}

export interface RevenueProjection {
  monthlyRevenue: number;
  annualRevenue: number;
  transactionFees: number;
  escrowFees: number;
  commissions: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  growthRate: number;
}

export const DYNAMIC_PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: '₹',
    features: [
      'Up to 5 RFQs per month',
      'Basic supplier matching',
      'Email support',
      'Mobile app access',
      'Basic analytics',
      'GST verification',
      'Text RFQ only',
      '2.5% transaction fee',
      '1.5% escrow fee'
    ],
    limitations: [
      'Limited AI features',
      'No priority support',
      'Basic reporting only',
      'No voice/video RFQ'
    ],
    transactionFeeRate: 2.5,
    escrowFeeRate: 1.5,
    commissionRate: 0,
    maxRFQs: 5,
    maxSuppliers: 50,
    aiFeatures: false,
    prioritySupport: false,
    analytics: true,
    voiceRFQ: false,
    videoRFQ: false,
    hindiSupport: false,
    gstVerification: true,
    trustScoring: false,
    mobileApp: true,
    apiAccess: false,
    whiteLabel: false,
    dedicatedManager: false,
    customIntegrations: false,
    sla: '24 hours',
    uptime: '99.5%',
    color: 'gray'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Best for growing businesses with regular transactions',
    monthlyPrice: 2999,
    annualPrice: 29999, // 2 months free
    currency: '₹',
    features: [
      'Unlimited RFQs',
      'Advanced AI matching',
      'Priority support',
      'Advanced analytics',
      'Voice & Video RFQ',
      'Hindi language support',
      'Trust scoring',
      '2% transaction fee',
      '1% escrow fee',
      '0.5% commission on deals',
      'API access',
      'Custom integrations'
    ],
    limitations: [
      'No white-label options',
      'No dedicated manager'
    ],
    transactionFeeRate: 2.0,
    escrowFeeRate: 1.0,
    commissionRate: 0.5,
    maxRFQs: 'unlimited',
    maxSuppliers: 'unlimited',
    aiFeatures: true,
    prioritySupport: true,
    analytics: true,
    voiceRFQ: true,
    videoRFQ: true,
    hindiSupport: true,
    gstVerification: true,
    trustScoring: true,
    mobileApp: true,
    apiAccess: true,
    whiteLabel: false,
    dedicatedManager: false,
    customIntegrations: true,
    sla: '4 hours',
    uptime: '99.9%',
    popular: true,
    color: 'blue'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large enterprises with high transaction volumes',
    monthlyPrice: 9999,
    annualPrice: 99999, // 2 months free
    currency: '₹',
    features: [
      'Everything in Professional',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced reporting',
      '1.5% transaction fee',
      '0.5% escrow fee',
      '0.25% commission on deals',
      'SLA guarantee',
      'Custom pricing for high volumes'
    ],
    limitations: [],
    transactionFeeRate: 1.5,
    escrowFeeRate: 0.5,
    commissionRate: 0.25,
    maxRFQs: 'unlimited',
    maxSuppliers: 'unlimited',
    aiFeatures: true,
    prioritySupport: true,
    analytics: true,
    voiceRFQ: true,
    videoRFQ: true,
    hindiSupport: true,
    gstVerification: true,
    trustScoring: true,
    mobileApp: true,
    apiAccess: true,
    whiteLabel: true,
    dedicatedManager: true,
    customIntegrations: true,
    sla: '1 hour',
    uptime: '99.99%',
    color: 'purple'
  }
];

export const ADDITIONAL_REVENUE_STREAMS = {
  LEAD_UNLOCK: {
    price: 500,
    currency: '₹',
    description: 'Per lead unlock fee'
  },
  PREMIUM_FEATURES: {
    AI_MATCHING: {
      price: 999,
      currency: '₹',
      period: 'month',
      description: 'Advanced AI matching'
    },
    ANALYTICS_PRO: {
      price: 1499,
      currency: '₹',
      period: 'month',
      description: 'Advanced analytics dashboard'
    },
    VOICE_VIDEO_RFQ: {
      price: 1999,
      currency: '₹',
      period: 'month',
      description: 'Voice and Video RFQ features'
    }
  },
  COMMISSION_STRUCTURE: {
    LOW_VALUE: {
      threshold: 100000, // ₹1 lakh
      rate: 0.02, // 2%
      description: 'Deals under ₹1 lakh'
    },
    MEDIUM_VALUE: {
      threshold: 1000000, // ₹10 lakh
      rate: 0.03, // 3%
      description: 'Deals ₹1-10 lakh'
    },
    HIGH_VALUE: {
      threshold: 10000000, // ₹1 crore
      rate: 0.05, // 5%
      description: 'Deals above ₹10 lakh'
    }
  }
};

export class PricingCalculator {
  /**
   * Calculate revenue projection for first month
   */
  static calculateFirstMonthRevenue(
    userCount: number,
    avgTransactionValue: number,
    transactionsPerUser: number,
    subscriptionDistribution: { starter: number; professional: number; enterprise: number }
  ): RevenueProjection {
    const totalUsers = userCount;
    const proUsers = Math.floor(totalUsers * subscriptionDistribution.professional);
    const enterpriseUsers = Math.floor(totalUsers * subscriptionDistribution.enterprise);
    const starterUsers = totalUsers - proUsers - enterpriseUsers;

    // Subscription Revenue
    const monthlySubscriptionRevenue = 
      (proUsers * DYNAMIC_PRICING_TIERS[1].monthlyPrice) +
      (enterpriseUsers * DYNAMIC_PRICING_TIERS[2].monthlyPrice);

    // Transaction Fees
    const totalTransactions = totalUsers * transactionsPerUser;
    const totalTransactionValue = totalTransactions * avgTransactionValue;
    
    const transactionFees = 
      (starterUsers * transactionsPerUser * avgTransactionValue * 0.025) +
      (proUsers * transactionsPerUser * avgTransactionValue * 0.02) +
      (enterpriseUsers * transactionsPerUser * avgTransactionValue * 0.015);

    // Escrow Fees (assuming 30% of transactions use escrow)
    const escrowTransactions = totalTransactions * 0.3;
    const escrowFees = 
      (starterUsers * transactionsPerUser * 0.3 * avgTransactionValue * 0.015) +
      (proUsers * transactionsPerUser * 0.3 * avgTransactionValue * 0.01) +
      (enterpriseUsers * transactionsPerUser * 0.3 * avgTransactionValue * 0.005);

    // Commission on High-Value Deals (assuming 10% of transactions are high-value)
    const highValueTransactions = totalTransactions * 0.1;
    const highValueAmount = highValueTransactions * avgTransactionValue * 2; // 2x average for high-value
    const commissions = highValueAmount * 0.05; // 5% commission

    // Lead Unlock Fees (assuming 20% of users unlock 5 leads per month)
    const leadUnlockFees = totalUsers * 0.2 * 5 * ADDITIONAL_REVENUE_STREAMS.LEAD_UNLOCK.price;

    const totalRevenue = monthlySubscriptionRevenue + transactionFees + escrowFees + commissions + leadUnlockFees;

    return {
      monthlyRevenue: totalRevenue,
      annualRevenue: totalRevenue * 12,
      transactionFees,
      escrowFees,
      commissions,
      subscriptionRevenue: monthlySubscriptionRevenue,
      totalRevenue,
      growthRate: 0.15 // 15% monthly growth assumption
    };
  }

  /**
   * Calculate pricing based on user behavior and market conditions
   */
  static calculateDynamicPricing(
    userTier: string,
    transactionVolume: number,
    avgTransactionValue: number,
    marketConditions: 'bull' | 'bear' | 'stable' = 'stable'
  ): { transactionFee: number; escrowFee: number; commission: number } {
    const baseTier = DYNAMIC_PRICING_TIERS.find(tier => tier.id === userTier);
    if (!baseTier) throw new Error('Invalid user tier');

    let transactionFee = baseTier.transactionFeeRate;
    let escrowFee = baseTier.escrowFeeRate;
    let commission = baseTier.commissionRate;

    // Volume discounts
    if (transactionVolume > 100) {
      transactionFee *= 0.8; // 20% discount
      escrowFee *= 0.8;
    } else if (transactionVolume > 50) {
      transactionFee *= 0.9; // 10% discount
      escrowFee *= 0.9;
    }

    // High-value transaction discounts
    if (avgTransactionValue > 1000000) { // Above ₹10 lakh
      transactionFee *= 0.7; // 30% discount
      escrowFee *= 0.7;
    } else if (avgTransactionValue > 500000) { // Above ₹5 lakh
      transactionFee *= 0.8; // 20% discount
      escrowFee *= 0.8;
    }

    // Market condition adjustments
    switch (marketConditions) {
      case 'bull':
        transactionFee *= 1.1; // 10% increase
        escrowFee *= 1.1;
        break;
      case 'bear':
        transactionFee *= 0.9; // 10% decrease
        escrowFee *= 0.9;
        break;
      case 'stable':
      default:
        // No change
        break;
    }

    return {
      transactionFee: Math.round(transactionFee * 100) / 100,
      escrowFee: Math.round(escrowFee * 100) / 100,
      commission: Math.round(commission * 100) / 100
    };
  }

  /**
   * Get pricing recommendations for new users
   */
  static getPricingRecommendation(
    businessSize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise',
    expectedMonthlyTransactions: number,
    avgTransactionValue: number
  ): { recommendedTier: string; reasoning: string; projectedMonthlyCost: number } {
    let recommendedTier = 'starter';
    let reasoning = '';
    let projectedMonthlyCost = 0;

    if (businessSize === 'enterprise' || expectedMonthlyTransactions > 100) {
      recommendedTier = 'enterprise';
      reasoning = 'High transaction volume and enterprise needs require maximum features and lowest fees';
      projectedMonthlyCost = DYNAMIC_PRICING_TIERS[2].monthlyPrice + 
        (expectedMonthlyTransactions * avgTransactionValue * 0.015);
    } else if (businessSize === 'large' || expectedMonthlyTransactions > 50) {
      recommendedTier = 'professional';
      reasoning = 'Growing business with regular transactions benefits from Professional features and competitive fees';
      projectedMonthlyCost = DYNAMIC_PRICING_TIERS[1].monthlyPrice + 
        (expectedMonthlyTransactions * avgTransactionValue * 0.02);
    } else if (businessSize === 'medium' || expectedMonthlyTransactions > 20) {
      recommendedTier = 'professional';
      reasoning = 'Medium business with moderate transactions can benefit from Professional features';
      projectedMonthlyCost = DYNAMIC_PRICING_TIERS[1].monthlyPrice + 
        (expectedMonthlyTransactions * avgTransactionValue * 0.02);
    } else {
      recommendedTier = 'starter';
      reasoning = 'Small business or startup can start with free tier and upgrade as needed';
      projectedMonthlyCost = expectedMonthlyTransactions * avgTransactionValue * 0.025;
    }

    return {
      recommendedTier,
      reasoning,
      projectedMonthlyCost: Math.round(projectedMonthlyCost)
    };
  }
}

export const REVENUE_OPTIMIZATION_STRATEGIES = {
  // Early bird pricing for first 1000 users
  EARLY_BIRD: {
    professional: 1999, // 33% off
    enterprise: 6999, // 30% off
    validUntil: '2024-12-31',
    maxUsers: 1000
  },
  
  // Referral program
  REFERRAL: {
    referrerReward: 1000, // ₹1000 credit
    refereeReward: 500, // ₹500 credit
    maxRewards: 10000 // ₹10,000 per user
  },
  
  // Volume incentives
  VOLUME_INCENTIVES: {
    monthlyTransactions: {
      threshold: 50,
      discount: 0.1 // 10% off fees
    },
    annualValue: {
      threshold: 1000000, // ₹10 lakh
      discount: 0.15 // 15% off fees
    }
  }
};
