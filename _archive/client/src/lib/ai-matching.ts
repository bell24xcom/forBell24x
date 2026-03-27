// Temporary native implementations to replace external dependencies
// import Fuse from 'fuse.js';
// import { debounce } from 'lodash';

// Simple native fuzzy search implementation
interface FuzzySearchResult<T> {
  item: T;
  score?: number;
}

class SimpleFuzzySearch<T> {
  private items: T[];
  private keys: Array<{ name: string; weight: number }>;

  constructor(
    items: T[],
    options: {
      keys: Array<{ name: string; weight: number }>;
      threshold: number;
      includeScore: boolean;
    }
  ) {
    this.items = items;
    this.keys = options.keys;
  }

  search(query: string): FuzzySearchResult<T>[] {
    const queryLower = query.toLowerCase();
    const results: FuzzySearchResult<T>[] = [];

    for (const item of this.items) {
      let score = 0;
      let matches = 0;

      for (const key of this.keys) {
        const value = (item as any)[key.name];
        if (Array.isArray(value)) {
          for (const val of value) {
            if (val.toLowerCase().includes(queryLower)) {
              score += key.weight;
              matches++;
              break;
            }
          }
        } else if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
          score += key.weight;
          matches++;
        }
      }

      if (matches > 0) {
        results.push({ item, score: 1 - score });
      }
    }

    return results.sort((a, b) => (a.score || 0) - (b.score || 0));
  }
}

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Core types for AI matching system
export interface RFQRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  targetPrice: string;
  deadline: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  verificationLevel: 'basic' | 'verified' | 'premium';
  yearEstablished: number;
  minOrderValue: number;
  maxOrderValue: number;
  responseTime: number; // hours
  completionRate: number; // percentage
  priceRange: 'budget' | 'mid-range' | 'premium';
  capacity: 'small' | 'medium' | 'large' | 'enterprise';
}

export interface MatchResult {
  supplier: Supplier;
  score: number;
  confidence: number;
  matchReasons: string[];
  concerns: string[];
  estimatedPrice: string;
  estimatedDelivery: string;
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_suitable';
}

// AI Matching Engine
export class AIMatchingEngine {
  private suppliers: Supplier[] = [];
  private fuseInstance: SimpleFuzzySearch<Supplier> | null = null;

  constructor(suppliers: Supplier[]) {
    this.suppliers = suppliers;
    this.initializeFuzzySearch();
  }

  private initializeFuzzySearch() {
    const options = {
      keys: [
        { name: 'name', weight: 0.3 },
        { name: 'categories', weight: 0.4 },
        { name: 'location', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
    };

    this.fuseInstance = new SimpleFuzzySearch(this.suppliers, options);
  }

  public async findMatches(requirement: RFQRequirement): Promise<MatchResult[]> {
    const searchQuery = `${requirement.category} ${requirement.title}`;
    const fuzzyResults = this.fuseInstance?.search(searchQuery) || [];

    const matches: MatchResult[] = [];

    for (const result of fuzzyResults.slice(0, 10)) {
      const supplier = result.item;
      const baseScore = 1 - (result.score || 0);

      if (baseScore < 0.3) continue;

      const matchResult = this.calculateMatch(requirement, supplier, baseScore);
      matches.push(matchResult);
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  private calculateMatch(
    requirement: RFQRequirement,
    supplier: Supplier,
    baseScore: number
  ): MatchResult {
    let totalScore = baseScore;
    const matchReasons: string[] = [];
    const concerns: string[] = [];

    // Category matching
    const categoryMatch = this.calculateCategoryMatch(requirement.category, supplier.categories);
    totalScore += categoryMatch.score * 0.4;
    if (categoryMatch.score > 0.8) {
      matchReasons.push(categoryMatch.reason);
    }

    // Location proximity
    const locationMatch = this.calculateLocationMatch(requirement.location, supplier.location);
    totalScore += locationMatch.score * 0.2;
    if (locationMatch.score > 0.7) {
      matchReasons.push(locationMatch.reason);
    } else if (locationMatch.score < 0.3) {
      concerns.push(locationMatch.reason);
    }

    // Quality score
    const qualityScore = supplier.rating / 5;
    totalScore += qualityScore * 0.25;
    if (supplier.rating >= 4.5) {
      matchReasons.push(`Excellent rating: ${supplier.rating}/5`);
    }

    // Verification level
    const verificationBonus = { basic: 0, verified: 0.1, premium: 0.15 };
    totalScore += verificationBonus[supplier.verificationLevel];

    const finalScore = Math.min(totalScore / 2, 1);
    const confidence = this.calculateConfidence(finalScore, matchReasons, concerns);
    const recommendation = this.determineRecommendation(finalScore, concerns.length);

    return {
      supplier,
      score: finalScore,
      confidence,
      matchReasons,
      concerns,
      estimatedPrice: this.estimatePrice(requirement.targetPrice, supplier),
      estimatedDelivery: this.estimateDelivery(requirement.urgency),
      recommendation,
    };
  }

  private calculateCategoryMatch(
    reqCategory: string,
    supplierCategories: string[]
  ): { score: number; reason: string } {
    const reqCat = reqCategory.toLowerCase();

    for (const cat of supplierCategories) {
      if (cat.toLowerCase() === reqCat) {
        return { score: 1.0, reason: `Exact category match: ${cat}` };
      }
    }

    for (const cat of supplierCategories) {
      if (cat.toLowerCase().includes(reqCat) || reqCat.includes(cat.toLowerCase())) {
        return { score: 0.8, reason: `Related category: ${cat}` };
      }
    }

    return { score: 0.2, reason: 'Different category specialization' };
  }

  private calculateLocationMatch(
    reqLocation: string,
    supplierLocation: string
  ): { score: number; reason: string } {
    if (!reqLocation || !supplierLocation) {
      return { score: 0.5, reason: 'Location not specified' };
    }

    if (reqLocation.toLowerCase() === supplierLocation.toLowerCase()) {
      return { score: 1.0, reason: 'Same location' };
    }

    const sameCities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'];
    const reqCity = sameCities.find(city => reqLocation.toLowerCase().includes(city));
    const suppCity = sameCities.find(city => supplierLocation.toLowerCase().includes(city));

    if (reqCity && suppCity && reqCity === suppCity) {
      return { score: 0.9, reason: 'Same metro area' };
    }

    return { score: 0.4, reason: 'Different location' };
  }

  private calculateConfidence(score: number, matchReasons: string[], concerns: string[]): number {
    let confidence = score * 0.7;

    if (matchReasons.length > 2) confidence += 0.1;
    if (concerns.length > 2) confidence -= 0.15;

    return Math.max(0, Math.min(1, confidence));
  }

  private determineRecommendation(
    score: number,
    concernCount: number
  ): 'highly_recommended' | 'recommended' | 'consider' | 'not_suitable' {
    if (score >= 0.85 && concernCount <= 1) return 'highly_recommended';
    if (score >= 0.7 && concernCount <= 2) return 'recommended';
    if (score >= 0.5) return 'consider';
    return 'not_suitable';
  }

  private estimatePrice(targetPrice: string, supplier: Supplier): string {
    if (!targetPrice) return 'Price on request';

    const priceNum = this.extractPriceNumber(targetPrice);
    if (!priceNum) return 'Price on request';

    let multiplier = 1;
    if (supplier.priceRange === 'budget') multiplier = 0.85;
    else if (supplier.priceRange === 'premium') multiplier = 1.2;

    const estimated = priceNum * multiplier;
    return `₹${estimated.toLocaleString('en-IN')}`;
  }

  private estimateDelivery(urgency: string): string {
    const days = { high: 7, medium: 21, low: 45 };
    const estimatedDays = days[urgency as keyof typeof days] || 21;

    if (estimatedDays <= 7) return `${estimatedDays} days`;
    return `${Math.round(estimatedDays / 7)} weeks`;
  }

  private extractPriceNumber(priceStr: string): number | null {
    const cleaned = priceStr.replace(/[₹$,\s]/g, '');
    if (cleaned.toLowerCase().includes('lakh')) {
      const num = parseFloat(cleaned.replace(/lakh.*/, ''));
      return num * 100000;
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // Debounced search for real-time matching
  public debouncedSearch = debounce(this.findMatches.bind(this), 300);
}
