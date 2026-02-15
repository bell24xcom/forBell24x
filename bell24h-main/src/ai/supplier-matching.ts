// NLPAnalysis interface moved here for simplicity
interface NLPAnalysis {
  categories: string[];
  confidence: number;
  keywords: string[];
  urgency?: 'low' | 'medium' | 'high';
  sentiment?: 'positive' | 'negative' | 'neutral';
  extractedEntities?: {
    locations?: string[];
    products?: string[];
    quantities?: string[];
  };
}

// Supplier Matching Interfaces
export interface SupplierFeatures {
  rating: number;
  responseTime: number;
  location: string;
  priceCompetitiveness: number;
  pastPerformance: number;
  certifications: number;
  capacity: number;
  specialization: number;
  businessAge: number;
  financialHealth: number;
  sustainabilityScore: number;
  complianceScore: number;
}

export interface SHAPExplanation {
  featureName: string;
  value: number;
  shapValue: number;
  contribution: 'positive' | 'negative';
  importance: number;
  explanation: string;
  confidence: number;
}

export interface SupplierRecommendation {
  supplierId: string;
  supplierName: string;
  matchScore: number;
  confidence: number;
  shapExplanations: SHAPExplanation[];
  riskFactors: string[];
  strengths: string[];
  reasoning: string[];
  recommendations: string[];
}

export class SupplierMatcher {
  private shapModel: any = null;
  private featureWeights: Record<string, number> = {};

  constructor() {
    this.initializeSHAPModel();
    this.setupFeatureWeights();
  }

  private async initializeSHAPModel() {
    // In a real implementation, this would load a pre-trained model
    console.log('🤖 Initializing SHAP explainability engine...');
    // Simulate model loading
    this.shapModel = {
      loaded: true,
      version: '1.0.0',
      features: 12,
    };
  }

  private setupFeatureWeights() {
    // Define feature importance weights based on business requirements
    this.featureWeights = {
      rating: 0.25,
      responseTime: 0.15,
      location: 0.08,
      priceCompetitiveness: 0.18,
      pastPerformance: 0.12,
      certifications: 0.06,
      capacity: 0.04,
      specialization: 0.04,
      businessAge: 0.02,
      financialHealth: 0.03,
      sustainabilityScore: 0.02,
      complianceScore: 0.01,
    };
  }

  async recommendSuppliers(
    rfqId: string,
    suppliers: any[],
    rfqAnalysis: NLPAnalysis
  ): Promise<SupplierRecommendation[]> {
    const recommendations: SupplierRecommendation[] = [];

    for (const supplier of suppliers) {
      const features = this.extractSupplierFeatures(supplier, rfqAnalysis);
      const matchScore = this.calculateMatchScore(features, rfqAnalysis);
      const shapExplanations = this.generateSHAPExplanations(features, matchScore, rfqAnalysis);
      const confidence = this.calculateConfidence(shapExplanations, features);

      recommendations.push({
        supplierId: supplier.id,
        supplierName: supplier.name,
        matchScore,
        confidence,
        shapExplanations,
        riskFactors: this.identifyRiskFactors(features, supplier),
        strengths: this.identifyStrengths(features, supplier),
        reasoning: this.generateReasoning(shapExplanations, features),
        recommendations: this.generateRecommendations(features, rfqAnalysis),
      });
    }

    return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10); // Top 10 recommendations
  }

  private extractSupplierFeatures(supplier: any, rfqAnalysis: NLPAnalysis): SupplierFeatures {
    return {
      rating: supplier.rating || 0,
      responseTime: this.parseResponseTime(supplier.responseTime || '24 hours'),
      location: supplier.location || '',
      priceCompetitiveness: this.calculatePriceScore(supplier, rfqAnalysis),
      pastPerformance: this.calculatePerformanceScore(supplier),
      certifications: supplier.certifications?.length || 0,
      capacity: this.estimateCapacity(supplier),
      specialization: this.calculateSpecializationScore(supplier, rfqAnalysis),
      businessAge: this.calculateBusinessAge(supplier),
      financialHealth: this.calculateFinancialHealth(supplier),
      sustainabilityScore: this.calculateSustainabilityScore(supplier),
      complianceScore: this.calculateComplianceScore(supplier),
    };
  }

  private calculateMatchScore(features: SupplierFeatures, rfqAnalysis: NLPAnalysis): number {
    let score = 0;

    // Weighted scoring based on feature importance
    score += this.normalizeRating(features.rating) * this.featureWeights.rating;
    score += this.normalizeResponseTime(features.responseTime) * this.featureWeights.responseTime;
    score +=
      this.calculateLocationScore(features.location, rfqAnalysis) * this.featureWeights.location;
    score += features.priceCompetitiveness * this.featureWeights.priceCompetitiveness;
    score += features.pastPerformance * this.featureWeights.pastPerformance;
    score +=
      this.normalizeCertifications(features.certifications) * this.featureWeights.certifications;
    score += features.capacity * this.featureWeights.capacity;
    score += features.specialization * this.featureWeights.specialization;
    score += this.normalizeBusinessAge(features.businessAge) * this.featureWeights.businessAge;
    score += features.financialHealth * this.featureWeights.financialHealth;
    score += features.sustainabilityScore * this.featureWeights.sustainabilityScore;
    score += features.complianceScore * this.featureWeights.complianceScore;

    // Apply urgency multiplier
    if (rfqAnalysis.urgency === 'high') {
      score *= 1.2; // Boost suppliers with fast response times
    }

    return Math.min(score, 1); // Cap at 1.0
  }

  private generateSHAPExplanations(
    features: SupplierFeatures,
    matchScore: number,
    rfqAnalysis: NLPAnalysis
  ): SHAPExplanation[] {
    const explanations: SHAPExplanation[] = [];

    // Generate SHAP values for each feature
    const baseScore = 0.5; // Baseline score

    // Rating SHAP
    const ratingContribution =
      (this.normalizeRating(features.rating) - 0.5) * this.featureWeights.rating;
    explanations.push({
      featureName: 'Supplier Rating',
      value: features.rating,
      shapValue: ratingContribution,
      contribution: ratingContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.rating,
      explanation: `Rating of ${features.rating}/5.0 ${
        ratingContribution > 0 ? 'positively' : 'negatively'
      } impacts recommendation by ${Math.abs(ratingContribution).toFixed(3)}`,
      confidence: this.calculateFeatureConfidence(features.rating, 5.0),
    });

    // Response Time SHAP
    const responseContribution =
      (this.normalizeResponseTime(features.responseTime) - 0.5) * this.featureWeights.responseTime;
    explanations.push({
      featureName: 'Response Time',
      value: features.responseTime,
      shapValue: responseContribution,
      contribution: responseContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.responseTime,
      explanation: `${features.responseTime} hour response time ${
        responseContribution > 0 ? 'helps' : 'hurts'
      } ranking`,
      confidence: this.calculateFeatureConfidence(features.responseTime, 24),
    });

    // Price Competitiveness SHAP
    const priceContribution =
      (features.priceCompetitiveness - 0.5) * this.featureWeights.priceCompetitiveness;
    explanations.push({
      featureName: 'Price Competitiveness',
      value: features.priceCompetitiveness,
      shapValue: priceContribution,
      contribution: priceContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.priceCompetitiveness,
      explanation: `Price competitiveness score of ${(features.priceCompetitiveness * 100).toFixed(
        0
      )}% ${priceContribution > 0 ? 'adds' : 'reduces'} value`,
      confidence: this.calculateFeatureConfidence(features.priceCompetitiveness, 1.0),
    });

    // Past Performance SHAP
    const performanceContribution =
      (features.pastPerformance - 0.5) * this.featureWeights.pastPerformance;
    explanations.push({
      featureName: 'Past Performance',
      value: features.pastPerformance,
      shapValue: performanceContribution,
      contribution: performanceContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.pastPerformance,
      explanation: `Historical performance score of ${(features.pastPerformance * 100).toFixed(
        0
      )}% ${performanceContribution > 0 ? 'strengthens' : 'weakens'} recommendation`,
      confidence: this.calculateFeatureConfidence(features.pastPerformance, 1.0),
    });

    // Location SHAP
    const locationScore = this.calculateLocationScore(features.location, rfqAnalysis);
    const locationContribution = (locationScore - 0.5) * this.featureWeights.location;
    explanations.push({
      featureName: 'Location Match',
      value: locationScore,
      shapValue: locationContribution,
      contribution: locationContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.location,
      explanation: `Location (${features.location}) ${
        locationContribution > 0 ? 'provides' : 'creates'
      } geographic ${locationContribution > 0 ? 'advantage' : 'challenge'}`,
      confidence: this.calculateFeatureConfidence(locationScore, 1.0),
    });

    // Certifications SHAP
    const certScore = this.normalizeCertifications(features.certifications);
    const certContribution = (certScore - 0.5) * this.featureWeights.certifications;
    explanations.push({
      featureName: 'Certifications',
      value: features.certifications,
      shapValue: certContribution,
      contribution: certContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.certifications,
      explanation: `${features.certifications} certification(s) ${
        certContribution > 0 ? 'enhance' : 'limit'
      } credibility`,
      confidence: this.calculateFeatureConfidence(features.certifications, 10),
    });

    // Capacity SHAP
    const capacityContribution = (features.capacity - 0.5) * this.featureWeights.capacity;
    explanations.push({
      featureName: 'Production Capacity',
      value: features.capacity,
      shapValue: capacityContribution,
      contribution: capacityContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.capacity,
      explanation: `Production capacity score of ${(features.capacity * 100).toFixed(0)}% ${
        capacityContribution > 0 ? 'supports' : 'limits'
      } order fulfillment`,
      confidence: this.calculateFeatureConfidence(features.capacity, 1.0),
    });

    // Specialization SHAP
    const specializationContribution =
      (features.specialization - 0.5) * this.featureWeights.specialization;
    explanations.push({
      featureName: 'Specialization Match',
      value: features.specialization,
      shapValue: specializationContribution,
      contribution: specializationContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.specialization,
      explanation: `Specialization alignment of ${(features.specialization * 100).toFixed(0)}% ${
        specializationContribution > 0 ? 'matches' : 'mismatches'
      } requirements`,
      confidence: this.calculateFeatureConfidence(features.specialization, 1.0),
    });

    // Financial Health SHAP
    const financialContribution =
      (features.financialHealth - 0.5) * this.featureWeights.financialHealth;
    explanations.push({
      featureName: 'Financial Health',
      value: features.financialHealth,
      shapValue: financialContribution,
      contribution: financialContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.financialHealth,
      explanation: `Financial health score of ${(features.financialHealth * 100).toFixed(
        0
      )}% indicates ${financialContribution > 0 ? 'stable' : 'risky'} business`,
      confidence: this.calculateFeatureConfidence(features.financialHealth, 1.0),
    });

    // Sustainability SHAP
    const sustainabilityContribution =
      (features.sustainabilityScore - 0.5) * this.featureWeights.sustainabilityScore;
    explanations.push({
      featureName: 'Sustainability Score',
      value: features.sustainabilityScore,
      shapValue: sustainabilityContribution,
      contribution: sustainabilityContribution > 0 ? 'positive' : 'negative',
      importance: this.featureWeights.sustainabilityScore,
      explanation: `ESG score of ${(features.sustainabilityScore * 100).toFixed(0)}% ${
        sustainabilityContribution > 0 ? 'supports' : 'challenges'
      } sustainable procurement`,
      confidence: this.calculateFeatureConfidence(features.sustainabilityScore, 1.0),
    });

    return explanations.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));
  }

  private calculateConfidence(explanations: SHAPExplanation[], features: SupplierFeatures): number {
    // Calculate confidence based on SHAP value consistency and feature reliability
    const positiveCount = explanations.filter(e => e.contribution === 'positive').length;
    const totalCount = explanations.length;
    const baseConfidence = positiveCount / totalCount;

    // Adjust confidence based on feature reliability
    let reliabilityScore = 0;
    if (features.rating >= 4.0) reliabilityScore += 0.2;
    if (features.certifications >= 3) reliabilityScore += 0.1;
    if (features.pastPerformance >= 0.8) reliabilityScore += 0.15;
    if (features.businessAge >= 5) reliabilityScore += 0.05;

    return Math.min(baseConfidence + reliabilityScore, 1.0);
  }

  private identifyRiskFactors(features: SupplierFeatures, supplier: any): string[] {
    const risks: string[] = [];

    if (features.rating < 3.5) risks.push('Below average rating (< 3.5/5.0)');
    if (features.responseTime > 24) risks.push('Slow response time (> 24 hours)');
    if (features.pastPerformance < 0.6) risks.push('Inconsistent past performance (< 60%)');
    if (features.certifications === 0) risks.push('No certifications on file');
    if (features.financialHealth < 0.5) risks.push('Poor financial health indicators');
    if (features.capacity < 0.3) risks.push('Limited production capacity');
    if (features.businessAge < 2) risks.push('New business (< 2 years)');
    if (features.complianceScore < 0.7) risks.push('Low compliance score');

    return risks;
  }

  private identifyStrengths(features: SupplierFeatures, supplier: any): string[] {
    const strengths: string[] = [];

    if (features.rating > 4.5) strengths.push('Excellent customer rating (4.5+/5.0)');
    if (features.responseTime < 4) strengths.push('Very fast response time (< 4 hours)');
    if (features.pastPerformance > 0.9) strengths.push('Outstanding past performance (90%+)');
    if (features.certifications > 5) strengths.push('Multiple certifications (5+)');
    if (features.financialHealth > 0.8) strengths.push('Strong financial health');
    if (features.capacity > 0.8) strengths.push('High production capacity');
    if (features.businessAge > 10) strengths.push('Established business (10+ years)');
    if (features.sustainabilityScore > 0.8) strengths.push('Excellent sustainability score');
    if (supplier.verified) strengths.push('Verified supplier status');
    if (supplier.premiumMember) strengths.push('Premium member benefits');

    return strengths;
  }

  private generateReasoning(explanations: SHAPExplanation[], features: SupplierFeatures): string[] {
    const reasoning: string[] = [];

    // Top 3 positive factors
    const positiveFactors = explanations
      .filter(e => e.contribution === 'positive')
      .slice(0, 3)
      .map(e => `${e.featureName}: ${e.explanation}`);

    if (positiveFactors.length > 0) {
      reasoning.push(`Top strengths: ${positiveFactors.join('; ')}`);
    }

    // Top 3 negative factors
    const negativeFactors = explanations
      .filter(e => e.contribution === 'negative')
      .slice(0, 3)
      .map(e => `${e.featureName}: ${e.explanation}`);

    if (negativeFactors.length > 0) {
      reasoning.push(`Areas of concern: ${negativeFactors.join('; ')}`);
    }

    return reasoning;
  }

  private generateRecommendations(features: SupplierFeatures, rfqAnalysis: NLPAnalysis): string[] {
    const recommendations: string[] = [];

    if (features.rating < 4.0) {
      recommendations.push('Request recent customer references before proceeding');
    }

    if (features.responseTime > 12) {
      recommendations.push('Set clear communication expectations and timelines');
    }

    if (features.pastPerformance < 0.7) {
      recommendations.push('Consider milestone-based payments to manage risk');
    }

    if (features.certifications < 3) {
      recommendations.push('Verify quality certifications relevant to your industry');
    }

    if (features.financialHealth < 0.6) {
      recommendations.push('Request financial guarantees or insurance coverage');
    }

    if (rfqAnalysis.urgency === 'high' && features.responseTime > 8) {
      recommendations.push('This supplier may not meet urgent timeline requirements');
    }

    return recommendations;
  }

  // Helper methods for feature normalization and scoring
  private normalizeRating(rating: number): number {
    return Math.min(rating / 5.0, 1.0);
  }

  private normalizeResponseTime(hours: number): number {
    // Inverse relationship - faster response = higher score
    return Math.max(0, 1 - hours / 48);
  }

  private normalizeCertifications(count: number): number {
    return Math.min(count / 10, 1.0);
  }

  private normalizeBusinessAge(years: number): number {
    return Math.min(years / 20, 1.0);
  }

  private calculateFeatureConfidence(value: number, maxValue: number): number {
    return Math.min(value / maxValue, 1.0);
  }

  private parseResponseTime(responseTime: string): number {
    const match = responseTime.match(/(\d+)/);
    return match ? parseInt(match[1]) : 24;
  }

  private calculatePriceScore(supplier: any, rfqAnalysis: NLPAnalysis): number {
    // Simulate price competitiveness (0-1 scale)
    const baseScore = 0.6 + Math.random() * 0.4;

    // Adjust based on RFQ sentiment
    if (rfqAnalysis.sentiment === 'positive') {
      return Math.min(baseScore + 0.1, 1.0);
    } else if (rfqAnalysis.sentiment === 'negative') {
      return Math.max(baseScore - 0.1, 0.0);
    }

    return baseScore;
  }

  private calculatePerformanceScore(supplier: any): number {
    // Simulate past performance score
    return 0.6 + Math.random() * 0.4;
  }

  private estimateCapacity(supplier: any): number {
    // Simulate capacity score
    return 0.5 + Math.random() * 0.5;
  }

  private calculateSpecializationScore(supplier: any, rfqAnalysis: NLPAnalysis): number {
    // Calculate how well supplier specialization matches RFQ categories
    const categoryMatch = rfqAnalysis.categories.length > 0 ? 0.7 : 0.5;
    return categoryMatch + Math.random() * 0.3;
  }

  private calculateLocationScore(supplierLocation: string, rfqAnalysis: NLPAnalysis): number {
    // Calculate location proximity score
    const detectedLocations = rfqAnalysis.extractedEntities?.locations || [];

    if (detectedLocations.length === 0) {
      return 0.5; // Neutral if no location specified
    }

    // Check if supplier location matches any detected locations
    const isMatch = detectedLocations.some(loc =>
      supplierLocation.toLowerCase().includes(loc.toLowerCase())
    );

    return isMatch ? 0.9 : 0.3;
  }

  private calculateBusinessAge(supplier: any): number {
    // Simulate business age calculation
    return Math.floor(Math.random() * 15) + 1;
  }

  private calculateFinancialHealth(supplier: any): number {
    // Simulate financial health score
    return 0.5 + Math.random() * 0.5;
  }

  private calculateSustainabilityScore(supplier: any): number {
    // Simulate sustainability/ESG score
    return 0.4 + Math.random() * 0.6;
  }

  private calculateComplianceScore(supplier: any): number {
    // Simulate compliance score
    return 0.6 + Math.random() * 0.4;
  }
}
