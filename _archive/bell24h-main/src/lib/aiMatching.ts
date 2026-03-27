export interface Supplier {
  id: number;
  name: string;
  categories: string[];
  rating: number;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  complianceScore: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  marketPosition: number;
  financialRating: number;
  certifications: string[];
  experience: number; // years
  capacity: number; // production capacity
  leadTime: number; // days
}

export interface RFQ {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: Date;
  requirements: string;
  location?: {
    city: string;
    state: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  urgency: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface MatchScore {
  supplier: Supplier;
  score: number;
  breakdown: {
    categoryMatch: number;
    budgetCompatibility: number;
    rating: number;
    locationProximity: number;
    compliance: number;
    deliveryHistory: number;
    quality: number;
    capacity: number;
    leadTime: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export async function matchSuppliersToRFQ(rfq: RFQ, suppliers: Supplier[]): Promise<MatchScore[]> {
  try {
    const response = await fetch('/api/ai/match-suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rfq,
        suppliers
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI matching results');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in AI matching:', error);
    // Fallback to local matching algorithm
    return performLocalMatching(rfq, suppliers);
  }
}

export function performLocalMatching(rfq: RFQ, suppliers: Supplier[]): MatchScore[] {
  return suppliers
    .map(supplier => calculateMatchScore(supplier, rfq))
    .sort((a, b) => b.score - a.score);
}

export function calculateMatchScore(supplier: Supplier, rfq: RFQ): MatchScore {
  // Initialize scoring breakdown
  const breakdown = {
    categoryMatch: 0,
    budgetCompatibility: 0,
    rating: 0,
    locationProximity: 0,
    compliance: 0,
    deliveryHistory: 0,
    quality: 0,
    capacity: 0,
    leadTime: 0
  };

  // 1. Category Match (25% weight)
  if (supplier.categories.includes(rfq.category)) {
    breakdown.categoryMatch = 25;
  } else if (supplier.categories.some(cat => 
    cat.toLowerCase().includes(rfq.category.toLowerCase()) || 
    rfq.category.toLowerCase().includes(cat.toLowerCase())
  )) {
    breakdown.categoryMatch = 15; // Partial match
  }

  // 2. Budget Compatibility (20% weight)
  if (supplier.priceRange.min <= rfq.budget && supplier.priceRange.max >= rfq.budget) {
    breakdown.budgetCompatibility = 20;
  } else if (supplier.priceRange.max >= rfq.budget * 0.8) {
    breakdown.budgetCompatibility = 15; // Within 20% of budget
  } else if (supplier.priceRange.max >= rfq.budget * 0.6) {
    breakdown.budgetCompatibility = 10; // Within 40% of budget
  }

  // 3. Rating Score (15% weight)
  breakdown.rating = (supplier.rating / 5) * 15;

  // 4. Location Proximity (10% weight)
  if (rfq.location) {
    breakdown.locationProximity = calculateLocationScore(supplier.location, rfq.location);
  }

  // 5. Compliance Score (10% weight)
  breakdown.compliance = (supplier.complianceScore / 100) * 10;

  // 6. Delivery History (8% weight)
  breakdown.deliveryHistory = (supplier.onTimeDeliveryRate / 100) * 8;

  // 7. Quality Rating (7% weight)
  breakdown.quality = (supplier.qualityRating / 5) * 7;

  // 8. Capacity Assessment (3% weight)
  if (supplier.capacity >= rfq.budget * 0.1) { // Assuming capacity relates to budget
    breakdown.capacity = 3;
  }

  // 9. Lead Time (2% weight)
  const daysUntilDeadline = Math.ceil((rfq.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (supplier.leadTime <= daysUntilDeadline) {
    breakdown.leadTime = 2;
  } else if (supplier.leadTime <= daysUntilDeadline * 1.5) {
    breakdown.leadTime = 1;
  }

  // Calculate total score
  const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);

  // Generate recommendations
  const recommendations = generateRecommendations(breakdown, supplier, rfq);

  // Determine risk level
  const riskLevel = calculateRiskLevel(breakdown, supplier);

  return {
    supplier,
    score: Math.min(Math.round(totalScore), 100),
    breakdown,
    recommendations,
    riskLevel
  };
}

function calculateLocationScore(supplierLocation: any, rfqLocation: any): number {
  if (!supplierLocation || !rfqLocation) return 0;

  // Simple location scoring based on city/state match
  if (supplierLocation.city === rfqLocation.city) return 10;
  if (supplierLocation.state === rfqLocation.state) return 7;
  if (supplierLocation.country === rfqLocation.country) return 5;

  // TODO: Implement actual distance calculation using coordinates
  // if (supplierLocation.coordinates && rfqLocation.coordinates) {
  //   const distance = calculateDistance(supplierLocation.coordinates, rfqLocation.coordinates);
  //   if (distance < 50) return 8; // Within 50km
  //   if (distance < 200) return 5; // Within 200km
  //   if (distance < 500) return 3; // Within 500km
  // }

  return 0;
}

function generateRecommendations(breakdown: any, supplier: Supplier, rfq: RFQ): string[] {
  const recommendations: string[] = [];

  if (breakdown.categoryMatch < 25) {
    recommendations.push('Consider expanding product categories to include this RFQ type');
  }

  if (breakdown.budgetCompatibility < 20) {
    recommendations.push('Review pricing strategy to better align with market requirements');
  }

  if (breakdown.rating < 12) {
    recommendations.push('Focus on improving customer satisfaction and ratings');
  }

  if (breakdown.compliance < 8) {
    recommendations.push('Enhance compliance certifications and quality standards');
  }

  if (breakdown.deliveryHistory < 6) {
    recommendations.push('Improve on-time delivery performance');
  }

  if (breakdown.quality < 5) {
    recommendations.push('Invest in quality improvement initiatives');
  }

  if (breakdown.leadTime < 2) {
    recommendations.push('Optimize production processes to reduce lead times');
  }

  // Positive recommendations
  if (breakdown.categoryMatch === 25) {
    recommendations.push('Excellent category alignment with RFQ requirements');
  }

  if (breakdown.budgetCompatibility === 20) {
    recommendations.push('Perfect budget range match');
  }

  if (breakdown.locationProximity >= 8) {
    recommendations.push('Strong local presence advantage');
  }

  return recommendations;
}

function calculateRiskLevel(breakdown: any, supplier: Supplier): 'low' | 'medium' | 'high' {
  const criticalFactors = [
    breakdown.compliance,
    breakdown.deliveryHistory,
    breakdown.quality
  ];

  const averageCriticalScore = criticalFactors.reduce((sum, score) => sum + score, 0) / criticalFactors.length;

  if (averageCriticalScore >= 7 && supplier.financialRating >= 4) {
    return 'low';
  } else if (averageCriticalScore >= 5 && supplier.financialRating >= 3) {
    return 'medium';
  } else {
    return 'high';
  }
}

// Utility function for distance calculation (Haversine formula)
export function calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Batch matching for multiple RFQs
export async function batchMatchSuppliers(rfqs: RFQ[], suppliers: Supplier[]): Promise<Map<number, MatchScore[]>> {
  const results = new Map<number, MatchScore[]>();
  
  for (const rfq of rfqs) {
    const matches = performLocalMatching(rfq, suppliers);
    results.set(rfq.id, matches);
  }
  
  return results;
}

// Supplier ranking based on multiple criteria
export function rankSuppliers(suppliers: Supplier[], criteria: {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  location?: string;
}): Supplier[] {
  return suppliers
    .filter(supplier => {
      if (criteria.category && !supplier.categories.includes(criteria.category)) return false;
      if (criteria.minRating && supplier.rating < criteria.minRating) return false;
      if (criteria.maxPrice && supplier.priceRange.min > criteria.maxPrice) return false;
      if (criteria.location && supplier.location.city !== criteria.location) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by rating first, then by compliance score
      if (a.rating !== b.rating) return b.rating - a.rating;
      return b.complianceScore - a.complianceScore;
    });
}
