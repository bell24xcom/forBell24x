/**
 * AI Explainability Service for Bell24H
 * 
 * This service provides utilities for explaining AI model predictions
 * using SHAP, LIME, and perplexity metrics to enhance model transparency.
 */

import perplexityService from './perplexity';
import fetch from 'node-fetch';

// Types for feature attribution
export type Feature = {
  name: string;
  value: any;
  importance: number;
  description?: string;
};

export type ExplanationResult = {
  prediction: any;
  baseValue: number;
  features: Feature[];
  perplexity?: {
    score: number;
    normalizedScore: number;
    tokens: number;
    category: string;
    interpretation: string;
  };
  modelConfidence?: number;
  dataQualityScore?: number;
};

/**
 * SHAP-based explanation for text classification
 * SHAP (SHapley Additive exPlanations) values show how much each feature 
 * contributes to pushing the model output from the base value
 * 
 * @param text - Input text to explain
 * @param modelType - Type of model being explained
 * @returns Explanation result with feature attributions
 */
export const explainWithSHAP = async (
  text: string,
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization'
): Promise<ExplanationResult> => {
  try {
    const resp = await fetch('http://localhost:8008/explain/shap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_type: modelType })
    });
    if (resp.ok) {
      const data = await resp.json();
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid response from SHAP microservice');
      }
      const shapData = data as { summary?: string; features?: any[]; importances?: number[] };
      return {
        prediction: { summary: shapData.summary ?? '' },
        baseValue: 0.5,
        features: (shapData.features || []).map((name: string, i: number) => ({
          name,
          value: null,
          importance: shapData.importances ? shapData.importances[i] : 0,
          description: undefined
        })),
        modelConfidence: 1,
        dataQualityScore: 100
      };
    }
    throw new Error('Non-200 response from SHAP microservice');
  } catch (err) {
    // In production, do not fallback to simulation, just throw
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SHAP microservice unavailable in production: ' + err);
    }
    // In development, fallback to simulation
    console.warn('SHAP microservice unavailable, falling back to simulation:', err);
    console.warn('SHAP microservice unavailable, falling back to simulation:', err);
    // Fallback to simulation
    // (Paste the original simulation code here)
    // --- BEGIN SIMULATION ---
    const perplexityResult = await perplexityService.calculatePerplexity(
      text,
      modelType === 'rfq_classification' ? 'rfq' : 
        modelType === 'product_categorization' ? 'product' : 'default'
    );
    const features = extractTextFeatures(text, modelType);
    const baseValue = 0.5;
    let totalImportance = 0;
    const enhancedFeatures = features.map(feature => {
      const perplexityFactor = Math.max(0.5, 1 - (perplexityResult.normalizedPerplexity / 200));
      let importance = feature.importance * perplexityFactor;
      totalImportance += importance;
      return { ...feature, importance };
    });
    if (totalImportance > 0) {
      enhancedFeatures.forEach(feature => {
        feature.importance = feature.importance / totalImportance;
      });
    }
    enhancedFeatures.sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));
    const importanceStdDev = calculateStandardDeviation(
      enhancedFeatures.map(f => f.importance)
    );
    const modelConfidence = Math.min(1, Math.max(0, importanceStdDev * 2));
    const dataQualityScore = Math.min(
      100, 
      Math.max(0, 
        perplexityResult.normalizedPerplexity * 0.7 + 
        (enhancedFeatures.length / 20) * 30
      )
    );
    return {
      prediction: simulatePrediction(modelType, enhancedFeatures),
      baseValue,
      features: enhancedFeatures,
      perplexity: {
        score: perplexityResult.perplexity,
        normalizedScore: perplexityResult.normalizedPerplexity,
        tokens: perplexityResult.tokens,
        category: perplexityResult.complexityCategory,
        interpretation: perplexityService.interpretPerplexity(perplexityResult.perplexity)
      },
      modelConfidence,
      dataQualityScore
    };
    // --- END SIMULATION ---
  }
};

/**
 * LIME-based explanation for text classification
 * LIME (Local Interpretable Model-agnostic Explanations) explains predictions by
 * approximating the model locally with an interpretable model
 * 
 * @param text - Input text to explain
 * @param modelType - Type of model being explained
 * @returns Explanation result with feature attributions
 */
export const explainWithLIME = async (
  text: string,
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization'
): Promise<ExplanationResult> => {
  try {
    const resp = await fetch('http://localhost:8008/explain/lime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_type: modelType })
    });
    if (resp.ok) {
      const data = await resp.json();
if (typeof data !== 'object' || data === null) {
  throw new Error('Invalid response from LIME microservice');
}
const limeData = data as { summary?: string; words?: string[]; weights?: number[] };
return {
  prediction: { summary: limeData.summary ?? '' },
  baseValue: 0.5,
  features: (limeData.words || []).map((name: string, i: number) => ({
    name,
    value: null,
    importance: limeData.weights ? limeData.weights[i] : 0,
    description: undefined
  })),
  modelConfidence: 1,
  dataQualityScore: 100
};
    } else {
      throw new Error('Non-200 response from LIME microservice');
    }
  } catch (error) {
    // Handle error gracefully
    return {
      prediction: { summary: 'LIME explanation failed' },
      baseValue: 0.5,
      features: [],
      modelConfidence: 0,
      dataQualityScore: 0
    };
  }
};

/**
 * Combined explanation using both SHAP and LIME with perplexity analysis
 * 
 * @param text - Input text to explain
 * @param modelType - Type of model being explained
 * @returns Combined explanation results
 */
export const getFullExplanation = async (
  text: string,
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization'
): Promise<{
  shap: ExplanationResult;
  lime: ExplanationResult;
  perplexity: {
    score: number;
    normalizedScore: number;
    tokens: number;
    category: string;
    interpretation: string;
  };
  combinedConfidence: number;
  dataQualitySummary: string;
}> => {
  // Get both SHAP and LIME explanations
  const [shapResult, limeResult] = await Promise.all([
    explainWithSHAP(text, modelType),
    explainWithLIME(text, modelType)
  ]);
  
  // Calculate a combined confidence score
  const combinedConfidence = (
    (shapResult.modelConfidence || 0.5) * 0.6 + 
    (limeResult.modelConfidence || 0.5) * 0.4
  );
  
  // Data quality summary based on perplexity and model confidence
  let dataQualitySummary = '';
  const perplexityScore = shapResult.perplexity?.score || 0;
  
  if (perplexityScore < 10 && combinedConfidence > 0.8) {
    dataQualitySummary = 'Excellent data quality with highly predictable text and confident model predictions.';
  } else if (perplexityScore < 50 && combinedConfidence > 0.6) {
    dataQualitySummary = 'Good data quality with standard business text and reliable model predictions.';
  } else if (perplexityScore < 200 && combinedConfidence > 0.4) {
    dataQualitySummary = 'Moderate data quality with somewhat complex text and acceptable model predictions.';
  } else {
    dataQualitySummary = 'Potentially problematic data quality with complex or unusual text patterns. Model predictions may be less reliable.';
  }
  
  return {
    shap: shapResult,
    lime: limeResult,
    perplexity: shapResult.perplexity!,
    combinedConfidence,
    dataQualitySummary
  };
};

/**
 * Extract text features based on model type
 * 
 * @param text - Input text
 * @param modelType - Type of model
 * @returns Extracted features
 */
function extractTextFeatures(
  text: string,
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization'
): Feature[] {
  const features: Feature[] = [];
  const lowerText = text.toLowerCase();
  
  // Common feature extraction based on model type
  switch (modelType) {
    case 'rfq_classification':
      // RFQ classification features
      features.push(
        { 
          name: 'has_quantity', 
          value: /\b(qty|quantity|units|pieces|pcs)\b/.test(lowerText), 
          importance: 0.15,
          description: 'Text mentions quantity-related terms'
        },
        { 
          name: 'has_deadline', 
          value: /\b(deadline|due|by|within|days|weeks|months)\b/.test(lowerText), 
          importance: 0.12,
          description: 'Text mentions deadline-related terms'
        },
        { 
          name: 'has_specifications', 
          value: /\b(spec|specification|details|dimensions|requirements)\b/.test(lowerText), 
          importance: 0.18,
          description: 'Text includes product specifications'
        }
      );
      break;
      
    case 'bid_pricing':
      // Bid pricing features
      features.push(
        { 
          name: 'has_price_references', 
          value: /\b(price|cost|quote|rate|budget)\b/.test(lowerText), 
          importance: 0.2,
          description: 'Text mentions price-related terms'
        },
        { 
          name: 'has_quantity_discounts', 
          value: /\b(discount|bulk|volume|wholesale)\b/.test(lowerText), 
          importance: 0.15,
          description: 'Text refers to quantity discounts'
        },
        { 
          name: 'has_negotiation_terms', 
          value: /\b(negotiate|offer|proposal|terms|agreement)\b/.test(lowerText), 
          importance: 0.12,
          description: 'Text includes negotiation terms'
        }
      );
      break;
      
    case 'product_categorization':
      // Product categorization features
      features.push(
        { 
          name: 'has_category_terms', 
          value: /\b(category|type|class|group|kind)\b/.test(lowerText), 
          importance: 0.1,
          description: 'Text includes category-related terms'
        },
        { 
          name: 'has_material_mentions', 
          value: /\b(material|made of|consists of|composition)\b/.test(lowerText), 
          importance: 0.15,
          description: 'Text mentions product materials'
        },
        { 
          name: 'has_application_terms', 
          value: /\b(used for|application|purpose|function)\b/.test(lowerText), 
          importance: 0.18,
          description: 'Text indicates product application or purpose'
        }
      );
      break;
  }
  
  // Common features for all model types
  features.push(
    { 
      name: 'text_length', 
      value: text.length, 
      importance: 0.05,
      description: `Text length: ${text.length} characters`
    },
    { 
      name: 'has_numeric_values', 
      value: /\d+/.test(lowerText), 
      importance: 0.08,
      description: 'Text contains numeric values'
    },
    { 
      name: 'sentence_count', 
      value: (text.match(/[.!?]+/g) || []).length, 
      importance: 0.04,
      description: `Number of sentences: ${(text.match(/[.!?]+/g) || []).length}`
    }
  );
  
  return features;
}

/**
 * Simulate a model prediction based on features
 * 
 * @param modelType - Type of model
 * @param features - Extracted features
 * @returns Simulated prediction
 */
function simulatePrediction(
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization',
  features: Feature[]
): any {
  switch (modelType) {
    case 'rfq_classification':
      // Simulate RFQ classification (e.g., urgent, standard, informational)
      const hasDeadline = features.find(f => f.name === 'has_deadline')?.value || false;
      const hasQuantity = features.find(f => f.name === 'has_quantity')?.value || false;
      
      if (hasDeadline && hasQuantity) {
        return { category: 'urgent', confidence: 0.85 };
      } else if (hasQuantity) {
        return { category: 'standard', confidence: 0.72 };
      } else {
        return { category: 'informational', confidence: 0.68 };
      }
      
    case 'bid_pricing':
      // Simulate bid pricing recommendation
      const hasPriceRefs = features.find(f => f.name === 'has_price_references')?.value || false;
      const hasQuantityDiscounts = features.find(f => f.name === 'has_quantity_discounts')?.value || false;
      
      if (hasPriceRefs && hasQuantityDiscounts) {
        return { 
          suggestedBid: 'competitive', 
          priceRange: { min: 950, max: 1200 },
          confidence: 0.78
        };
      } else if (hasPriceRefs) {
        return { 
          suggestedBid: 'standard', 
          priceRange: { min: 1100, max: 1400 },
          confidence: 0.65
        };
      } else {
        return { 
          suggestedBid: 'premium', 
          priceRange: { min: 1300, max: 1800 },
          confidence: 0.6
        };
      }
      
    case 'product_categorization':
      // Simulate product categorization
      const hasMaterialMentions = features.find(f => f.name === 'has_material_mentions')?.value || false;
      const hasApplicationTerms = features.find(f => f.name === 'has_application_terms')?.value || false;
      
      if (hasMaterialMentions && hasApplicationTerms) {
        return { 
          category: 'industrial', 
          subCategories: ['manufacturing', 'components'],
          confidence: 0.82
        };
      } else if (hasMaterialMentions) {
        return { 
          category: 'consumer', 
          subCategories: ['household'],
          confidence: 0.71
        };
      } else {
        return { 
          category: 'services', 
          subCategories: ['consulting'],
          confidence: 0.63
        };
      }
      
    default:
      return { prediction: 'unknown', confidence: 0.5 };
  }
}

/**
 * Calculate standard deviation for an array of numbers
 * 
 * @param values - Array of numeric values
 * @returns Standard deviation
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Get a score indicating how common a word is (0-1)
 * 
 * @param word - Input word
 * @returns Commonality score (0 = rare, 1 = very common)
 */
function commonWordScore(word: string): number {
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
  ]);
  
  return commonWords.has(word.toLowerCase()) ? 1 : 0.2;
}

export default {
  explainWithSHAP,
  explainWithLIME,
  getFullExplanation
};
