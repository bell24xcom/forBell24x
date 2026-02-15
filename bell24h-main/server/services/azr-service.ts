/**
 * AZR (Absolute Zero Reasoner) Service for Bell24H
 * 
 * This service provides advanced reasoning and explainability capabilities
 * by integrating with the AZR framework.
 */

import { ExplanationResult } from './ai-explainer';
import { ModelExplanation } from '../types/explanation';
import { logger } from '../utils/logger';

// Types for AZR integration
type AZRReasoningConfig = {
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization' | 'supplier_risk' | 'esg_scoring';
  context?: Record<string, any>;
  ruleset?: string[];
  depth?: number;
};

type AZRReasoningResult = {
  explanation: string;
  confidence: number;
  reasoningPath: {
    step: number;
    rule: string;
    result: any;
  }[];
  metadata: Record<string, any>;
};

/**
 * AZR Reasoner Client
 * Handles communication with the AZR reasoning service
 */
class AZRReasoner {
  private baseUrl: string;
  private apiKey: string | null;

  constructor() {
    this.baseUrl = process.env.AZR_BASE_URL || 'http://localhost:3001';
    this.apiKey = process.env.AZR_API_KEY || null;
  }

  /**
   * Generate an explanation using AZR
   */
  async explain(
    input: any,
    config: AZRReasoningConfig
  ): Promise<AZRReasoningResult> {
    try {
      const response = await fetch(`${this.baseUrl}/reasoning/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          input,
          config: {
            modelType: config.modelType,
            context: config.context || {},
            ruleset: config.ruleset || ['default'],
            depth: config.depth || 3,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`AZR API error: ${error}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('AZR explanation failed:', error);
      throw new Error(`Failed to generate AZR explanation: ${error.message}`);
    }
  }

  /**
   * Convert AZR explanation to the standard explanation format
   */
  toStandardExplanation(
    azrResult: AZRReasoningResult,
    modelType: string
  ): ExplanationResult {
    return {
      prediction: azrResult.metadata.prediction || null,
      baseValue: 0, // AZR doesn't use base value concept
      features: Object.entries(azrResult.metadata.features || {}).map(([name, value]) => ({
        name,
        value,
        importance: azrResult.metadata.featureImportances?.[name] || 0,
        description: azrResult.metadata.featureDescriptions?.[name],
      })),
      modelConfidence: azrResult.confidence,
      reasoningPath: azrResult.reasoningPath,
      explanation: azrResult.explanation,
    };
  }
}

// Create a singleton instance
export const azrReasoner = new AZRReasoner();

/**
 * Get explanation with AZR reasoning
 */
export const explainWithAZR = async (
  input: any,
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization' | 'supplier_risk' | 'esg_scoring',
  context: Record<string, any> = {}
): Promise<ExplanationResult> => {
  try {
    const result = await azrReasoner.explain(input, {
      modelType,
      context,
    });
    
    return azrReasoner.toStandardExplanation(result, modelType);
  } catch (error) {
    logger.error('AZR explanation failed:', error);
    // Fallback to standard explanation if AZR fails
    throw error;
  }
};

/**
 * Generate a human-readable explanation from the reasoning path
 */
export const generateHumanReadableExplanation = (reasoningPath: any[]): string => {
  if (!reasoningPath?.length) {
    return 'No reasoning path available.';
  }

  return reasoningPath
    .map((step, index) => {
      return `${index + 1}. ${step.rule}: ${JSON.stringify(step.result, null, 2)}`;
    })
    .join('\n');
};

/**
 * Get supplier risk score with explanation
 */
export const getSupplierRiskScore = async (supplierData: any): Promise<{
  score: number;
  explanation: string;
  reasoningPath: any[];
  riskFactors: Array<{
    factor: string;
    score: number;
    impact: 'high' | 'medium' | 'low';
  }>;
}> => {
  const result = await azrReasoner.explain(supplierData, {
    modelType: 'supplier_risk',
  });

  return {
    score: result.confidence,
    explanation: result.explanation,
    reasoningPath: result.reasoningPath,
    riskFactors: result.metadata.riskFactors || [],
  };
};

export default {
  azrReasoner,
  explainWithAZR,
  generateHumanReadableExplanation,
  getSupplierRiskScore,
};
