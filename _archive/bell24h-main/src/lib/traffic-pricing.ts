// Bell24h 2.0 - Traffic-Based Pricing Engine
// Dynamic pricing based on impressions, traffic tier, and market conditions

export interface TrafficPricingConfig {
  basePrice: number;
  impressions: number;
  clicks: number;
  conversions: number;
  trafficTier: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  category: string;
  msmeDiscount?: boolean;
}

export interface PricingResult {
  basePrice: number;
  trafficPrice: number;
  msmePrice?: number;
  cpm: number; // Cost per thousand impressions
  conversionRate: number;
  trafficMultiplier: number;
  tierMultiplier: number;
}

// Traffic tier multipliers
const TRAFFIC_TIER_MULTIPLIERS = {
  FREE: 1.0,
  BRONZE: 1.1,
  SILVER: 1.25,
  GOLD: 1.5,
  PLATINUM: 2.0,
};

// Category-specific CPM rates (₹ per 1000 impressions)
const CATEGORY_CPM_RATES = {
  'steel': 0.25,
  'aluminum': 0.20,
  'copper': 0.30,
  'machinery': 0.40,
  'electronics': 0.35,
  'textiles': 0.15,
  'chemicals': 0.45,
  'automotive': 0.50,
  'construction': 0.30,
  'agriculture': 0.20,
  'default': 0.20,
};

// MSME discount percentage
const MSME_DISCOUNT_PERCENTAGE = 0.15; // 15% discount

/**
 * Calculate traffic-based pricing for products
 */
export function calculateTrafficPricing(config: TrafficPricingConfig): PricingResult {
  const {
    basePrice,
    impressions,
    clicks,
    conversions,
    trafficTier,
    category,
    msmeDiscount = false,
  } = config;

  // Get category-specific CPM rate
  const cpmRate = CATEGORY_CPM_RATES[category.toLowerCase()] || CATEGORY_CPM_RATES.default;
  
  // Calculate CPM (Cost Per Mille - per 1000 impressions)
  const cpm = cpmRate * TRAFFIC_TIER_MULTIPLIERS[trafficTier];
  
  // Calculate traffic multiplier based on impressions
  const trafficMultiplier = 1 + (impressions / 1000) * 0.1; // 10% boost per 1K impressions
  
  // Get tier multiplier
  const tierMultiplier = TRAFFIC_TIER_MULTIPLIERS[trafficTier];
  
  // Calculate conversion rate
  const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;
  
  // Calculate traffic price
  const trafficPrice = Math.round(
    (basePrice + cpm * impressions) * trafficMultiplier * tierMultiplier
  );
  
  // Calculate MSME price if applicable
  let msmePrice: number | undefined;
  if (msmeDiscount) {
    msmePrice = Math.round(trafficPrice * (1 - MSME_DISCOUNT_PERCENTAGE));
  }

  return {
    basePrice,
    trafficPrice,
    msmePrice,
    cpm,
    conversionRate,
    trafficMultiplier,
    tierMultiplier,
  };
}

/**
 * Update traffic analytics and recalculate pricing
 */
export async function updateTrafficAnalytics(
  userId: string,
  productId: string,
  page: string,
  impression: boolean = false,
  click: boolean = false,
  conversion: boolean = false
) {
  try {
    const response = await fetch('/api/traffic/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        productId,
        page,
        impression,
        click,
        conversion,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update traffic analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating traffic analytics:', error);
    throw error;
  }
}

/**
 * Get real-time pricing for a product
 */
export async function getRealTimePricing(productId: string): Promise<PricingResult> {
  try {
    const response = await fetch(`/api/products/${productId}/pricing`);
    
    if (!response.ok) {
      throw new Error('Failed to get real-time pricing');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting real-time pricing:', error);
    throw error;
  }
}

/**
 * Calculate traffic tier based on user activity
 */
export function calculateTrafficTier(
  totalImpressions: number,
  totalClicks: number,
  totalConversions: number,
  daysActive: number
): 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' {
  const avgDailyImpressions = totalImpressions / Math.max(daysActive, 1);
  const conversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions) * 100 : 0;
  
  // Tier calculation based on daily impressions and conversion rate
  if (avgDailyImpressions >= 1000 && conversionRate >= 5) {
    return 'PLATINUM';
  } else if (avgDailyImpressions >= 500 && conversionRate >= 3) {
    return 'GOLD';
  } else if (avgDailyImpressions >= 200 && conversionRate >= 2) {
    return 'SILVER';
  } else if (avgDailyImpressions >= 50 && conversionRate >= 1) {
    return 'BRONZE';
  } else {
    return 'FREE';
  }
}

/**
 * Get pricing display components
 */
export function getPricingDisplay(pricing: PricingResult) {
  return {
    basePrice: `₹${pricing.basePrice.toLocaleString()}`,
    trafficPrice: `₹${pricing.trafficPrice.toLocaleString()}`,
    msmePrice: pricing.msmePrice ? `₹${pricing.msmePrice.toLocaleString()}` : null,
    cpm: `₹${pricing.cpm.toFixed(2)}`,
    conversionRate: `${pricing.conversionRate.toFixed(1)}%`,
    trafficMultiplier: `${(pricing.trafficMultiplier * 100 - 100).toFixed(0)}%`,
    tierMultiplier: `${(pricing.tierMultiplier * 100 - 100).toFixed(0)}%`,
  };
}

/**
 * Format price with traffic indicators
 */
export function formatTrafficPrice(
  basePrice: number,
  trafficPrice: number,
  showTrafficIndicator: boolean = true
): string {
  const formattedPrice = `₹${trafficPrice.toLocaleString()}`;
  
  if (!showTrafficIndicator || trafficPrice === basePrice) {
    return formattedPrice;
  }
  
  const difference = trafficPrice - basePrice;
  const indicator = difference > 0 ? '↗' : '↘';
  
  return `${formattedPrice} ${indicator}`;
}
