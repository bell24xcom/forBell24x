import * as shap from 'shap';
import { LIME } from 'lime-js';
import { SupplierModel } from '../models/Supplier';
import { RFQModel } from '../models/RFQ';
import { AIMatchingService } from './ai-matching';

interface FeatureImportance {
  feature: string;
  importance: number;
  description: string;
}

interface ExplanationResult {
  matchScore: number;
  features: FeatureImportance[];
  localExplanation: string;
  globalExplanation: string;
  confidenceScore: number;
}

export class AIExplainabilityService {
  /**
   * Generate SHAP values for supplier matching
   */
  static async explainMatch(rfqId: string, supplierId: string): Promise<ExplanationResult> {
    try {
      const rfq = await RFQModel.findById(rfqId);
      const supplier = await SupplierModel.findById(supplierId);

      if (!rfq || !supplier) {
        throw new Error('RFQ or Supplier not found');
      }

      // Get match score and features from AI matching service
      const matchResult = await AIMatchingService.calculateMatchScore(rfq, supplier);

      // Calculate SHAP values for feature importance
      const shapValues = await this.calculateSHAPValues(matchResult.features);

      // Generate LIME explanation for local interpretability
      const limeExplanation = await this.generateLIMEExplanation(
        matchResult.features,
        matchResult.score
      );

      // Format feature importance with descriptions
      const featureImportance = shapValues.map(shap => ({
        feature: shap.feature,
        importance: shap.value,
        description: this.getFeatureDescription(shap.feature, shap.value)
      }));

      return {
        matchScore: matchResult.score,
        features: featureImportance,
        localExplanation: limeExplanation,
        globalExplanation: this.generateGlobalExplanation(featureImportance),
        confidenceScore: this.calculateConfidenceScore(shapValues)
      };
    } catch (error) {
      console.error('Error generating match explanation:', error);
      throw error;
    }
  }

  /**
   * Explain supplier risk score
   */
  static async explainRiskScore(supplierId: string): Promise<ExplanationResult> {
    try {
      const supplier = await SupplierModel.findById(supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      // Get risk score and contributing factors
      const riskResult = await AIMatchingService.calculateRiskScore(supplier);

      // Calculate SHAP values for risk factors
      const shapValues = await this.calculateSHAPValues(riskResult.factors);

      // Generate LIME explanation for risk assessment
      const limeExplanation = await this.generateLIMEExplanation(
        riskResult.factors,
        riskResult.score
      );

      // Format risk factors with descriptions
      const featureImportance = shapValues.map(shap => ({
        feature: shap.feature,
        importance: shap.value,
        description: this.getRiskFactorDescription(shap.feature, shap.value)
      }));

      return {
        matchScore: riskResult.score,
        features: featureImportance,
        localExplanation: limeExplanation,
        globalExplanation: this.generateRiskExplanation(featureImportance),
        confidenceScore: this.calculateConfidenceScore(shapValues)
      };
    } catch (error) {
      console.error('Error generating risk explanation:', error);
      throw error;
    }
  }

  /**
   * Calculate SHAP values for feature importance
   */
  private static async calculateSHAPValues(features: any): Promise<Array<{ feature: string; value: number }>> {
    try {
      // Initialize SHAP explainer
      const explainer = new shap.KernelExplainer(features);
      
      // Calculate SHAP values
      const shapValues = await explainer.shap_values(features);

      // Format SHAP values
      return Object.entries(shapValues).map(([feature, value]) => ({
        feature,
        value: Number(value)
      }));
    } catch (error) {
      console.error('Error calculating SHAP values:', error);
      throw error;
    }
  }

  /**
   * Generate LIME explanation for local interpretability
   */
  private static async generateLIMEExplanation(features: any, score: number): Promise<string> {
    try {
      const lime = new LIME({
        kernelWidth: 0.75,
        numSamples: 1000
      });

      const explanation = await lime.explain(features, score);
      return this.formatLIMEExplanation(explanation);
    } catch (error) {
      console.error('Error generating LIME explanation:', error);
      throw error;
    }
  }

  /**
   * Format LIME explanation into user-friendly text
   */
  private static formatLIMEExplanation(explanation: any): string {
    const factors = explanation.getTopFeatures(5);
    return factors.map(factor => 
      `${factor.feature} ${factor.weight > 0 ? 'positively' : 'negatively'} impacts the score by ${Math.abs(factor.weight).toFixed(2)} points`
    ).join('. ');
  }

  /**
   * Generate human-readable description for feature importance
   */
  private static getFeatureDescription(feature: string, importance: number): string {
    const impact = importance > 0 ? 'positively' : 'negatively';
    const magnitude = Math.abs(importance);
    let strength = 'slightly';
    
    if (magnitude > 0.7) strength = 'very strongly';
    else if (magnitude > 0.5) strength = 'strongly';
    else if (magnitude > 0.3) strength = 'moderately';

    return `This factor ${strength} ${impact} influences the match (${(magnitude * 100).toFixed(1)}% impact)`;
  }

  /**
   * Generate human-readable description for risk factors
   */
  private static getRiskFactorDescription(factor: string, importance: number): string {
    const impact = importance > 0 ? 'increases' : 'decreases';
    const magnitude = Math.abs(importance);
    let risk = 'slightly';
    
    if (magnitude > 0.7) risk = 'significantly';
    else if (magnitude > 0.5) risk = 'moderately';
    else if (magnitude > 0.3) risk = 'somewhat';

    return `This factor ${risk} ${impact} the risk score (${(magnitude * 100).toFixed(1)}% impact)`;
  }

  /**
   * Generate global explanation from feature importance
   */
  private static generateGlobalExplanation(features: FeatureImportance[]): string {
    const topFeatures = features
      .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
      .slice(0, 3);

    return `This match is primarily based on ${topFeatures.map(f => f.feature.toLowerCase()).join(', ')}. ` +
      `The most significant factor is ${topFeatures[0].feature.toLowerCase()}, ` +
      `which accounts for ${(Math.abs(topFeatures[0].importance) * 100).toFixed(1)}% of the decision.`;
  }

  /**
   * Generate risk-specific explanation
   */
  private static generateRiskExplanation(features: FeatureImportance[]): string {
    const riskFactors = features
      .filter(f => f.importance > 0)
      .sort((a, b) => b.importance - a.importance);

    const protectiveFactors = features
      .filter(f => f.importance < 0)
      .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));

    return `Key risk factors include ${riskFactors.slice(0, 2).map(f => f.feature.toLowerCase()).join(' and ')}. ` +
      `However, this is partially offset by strong ${protectiveFactors[0]?.feature.toLowerCase() || 'protective factors'}.`;
  }

  /**
   * Calculate confidence score based on SHAP values
   */
  private static calculateConfidenceScore(shapValues: Array<{ feature: string; value: number }>): number {
    const totalImportance = shapValues.reduce((sum, { value }) => sum + Math.abs(value), 0);
    const maxImportance = Math.max(...shapValues.map(({ value }) => Math.abs(value)));
    
    // Higher confidence if there are clear dominant factors
    return Math.min(maxImportance / (totalImportance / shapValues.length) * 100, 100);
  }
} 