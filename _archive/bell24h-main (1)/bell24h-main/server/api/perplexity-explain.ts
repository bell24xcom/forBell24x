/**
 * Perplexity Explanation API Endpoint
 * 
 * This endpoint provides combined AI explainability services including:
 * - SHAP feature attribution
 * - LIME local explanations
 * - Perplexity text complexity analysis
 * - Combined confidence metrics
 * - Data quality assessment
 */

import express from 'express';
import { authenticate } from '../middleware/auth';
import perplexityService from '../services/perplexity';
import aiExplainer from '../services/ai-explainer';
import { handleApiError } from '../utils/error-handler';

const router = express.Router();

/**
 * SHAP-based model explanations with perplexity integration
 */
router.post('/shap', authenticate, async (req, res) => {
  try {
    const { text, model_type = 'rfq_classification' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }
    
    // Get SHAP explanation
    const shapExplanation = await aiExplainer.explainWithSHAP(text, model_type);
    
    // Add perplexity analysis to the explanation
    const perplexityResult = await perplexityService.calculatePerplexity(text, model_type);
    
    // Format the response
    const response = {
      ...shapExplanation,
      perplexity: {
        score: perplexityResult.perplexity,
        normalizedScore: perplexityResult.normalizedPerplexity,
        tokens: perplexityResult.tokens,
        category: perplexityResult.complexityCategory,
        interpretation: perplexityService.interpretPerplexity(perplexityResult.perplexity)
      },
      modelConfidence: shapExplanation.modelConfidence || 0.5
    };
    
    return res.json(response);
  } catch (error) {
    return handleApiError(error, res);
  }
});

/**
 * LIME-based model explanations with perplexity integration
 */
router.post('/lime', authenticate, async (req, res) => {
  try {
    const { text, model_type = 'rfq_classification' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }
    
    // Get LIME explanation
    const limeExplanation = await aiExplainer.explainWithLIME(text, model_type);
    
    // Add perplexity analysis to the explanation
    const perplexityResult = await perplexityService.calculatePerplexity(text, model_type);
    
    // Format the response
    const response = {
      ...limeExplanation,
      perplexity: {
        score: perplexityResult.perplexity,
        normalizedScore: perplexityResult.normalizedPerplexity,
        tokens: perplexityResult.tokens,
        category: perplexityResult.complexityCategory,
        interpretation: perplexityService.interpretPerplexity(perplexityResult.perplexity)
      },
      modelConfidence: limeExplanation.modelConfidence || 0.5
    };
    
    return res.json(response);
  } catch (error) {
    return handleApiError(error, res);
  }
});

/**
 * Combined full explanation including SHAP, LIME, perplexity, and data quality
 */
router.post('/full', authenticate, async (req, res) => {
  try {
    const { text, model_type = 'rfq_classification' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }
    
    // Get both SHAP and LIME explanations in parallel
    const [shapExplanation, limeExplanation, perplexityResult] = await Promise.all([
      aiExplainer.explainWithSHAP(text, model_type),
      aiExplainer.explainWithLIME(text, model_type),
      perplexityService.calculatePerplexity(text, model_type)
    ]);
    
    // Generate data quality assessment
    const dataQualityAssessment = await generateDataQualityAssessment(
      text, 
      perplexityResult, 
      shapExplanation,
      limeExplanation,
      model_type
    );
    
    // Calculate combined confidence
    const shapWeight = 0.4;
    const limeWeight = 0.3;
    const perplexityWeight = 0.3;
    
    const perplexityConfidence = 1 - (perplexityResult.normalizedPerplexity / 100);
    const combinedConfidence = (
      (shapExplanation.modelConfidence || 0.5) * shapWeight +
      (limeExplanation.modelConfidence || 0.5) * limeWeight +
      perplexityConfidence * perplexityWeight
    );
    
    // Format the full response
    const response = {
      shap: {
        ...shapExplanation,
        modelConfidence: shapExplanation.modelConfidence || 0.5
      },
      lime: {
        ...limeExplanation,
        modelConfidence: limeExplanation.modelConfidence || 0.5
      },
      perplexity: {
        score: perplexityResult.perplexity,
        normalizedScore: perplexityResult.normalizedPerplexity,
        tokens: perplexityResult.tokens,
        category: perplexityResult.complexityCategory,
        interpretation: perplexityService.interpretPerplexity(perplexityResult.perplexity)
      },
      combinedConfidence,
      dataQualitySummary: dataQualityAssessment.summary,
      businessRecommendations: dataQualityAssessment.recommendations || [],
      modelSpecificMetrics: dataQualityAssessment.modelSpecificMetrics || {}
    };
    
    return res.json(response);
  } catch (error) {
    return handleApiError(error, res);
  }
});

/**
 * Helper function to generate data quality assessment
 */
async function generateDataQualityAssessment(
  text: string,
  perplexityResult: any,
  shapExplanation: any,
  limeExplanation: any,
  modelType: string
) {
  // Extract key metrics for assessment
  const perplexity = perplexityResult.perplexity;
  const normalizedPerplexity = perplexityResult.normalizedPerplexity;
  const complexityCategory = perplexityResult.complexityCategory;
  const tokenCount = perplexityResult.tokens;
  
  // Get feature importance agreement between SHAP and LIME
  const shapFeatures = new Set(shapExplanation.features.map((f: any) => f.name));
  const limeFeatures = new Set(limeExplanation.features.map((f: any) => f.name));
  const commonFeatures = [...shapFeatures].filter(f => limeFeatures.has(f));
  const featureAgreementRate = commonFeatures.length / Math.max(shapFeatures.size, limeFeatures.size);
  
  // Calculate data quality metrics
  const qualityIssues: string[] = [];
  let qualityScore = 1.0;
  let businessRecommendations: string[] = [];
  let modelSpecificMetrics: any = {};
  
  // Check for text length issues
  if (tokenCount < 5) {
    qualityIssues.push("Text is too short for reliable analysis");
    qualityScore -= 0.3;
    businessRecommendations.push("Request more detailed information");
  } else if (tokenCount > 500) {
    qualityIssues.push("Text is unusually long, which may affect precision");
    qualityScore -= 0.1;
    businessRecommendations.push("Consider summarizing the input for better results");
  }
  
  // Check for complexity issues
  if (complexityCategory === 'very-high') {
    qualityIssues.push("Text has very high complexity, which may reduce model reliability");
    qualityScore -= 0.2;
    businessRecommendations.push("Simplify language and use standard terminology");
  }
  
  // Check for feature agreement issues
  if (featureAgreementRate < 0.3) {
    qualityIssues.push("Low agreement between explanation methods suggests potential data ambiguity");
    qualityScore -= 0.25;
    businessRecommendations.push("Clarify ambiguous terms and be more specific");
  }
  
  // Model-specific quality checks and business logic
  switch (modelType) {
    case 'rfq_classification':
      // RFQ-specific analysis
      const hasQuantityTerms = /\b\d+\s*(units|pieces|kg|tons|pounds|items|pcs)\b/i.test(text);
      const hasTimeframeTerms = /\b(delivery|deadline|by|within|asap|urgently)\b/i.test(text);
      const hasProductSpecifications = /\b(specifications?|specs?|dimensions|size|material)\b/i.test(text);
      const hasBudgetInfo = /\b(budget|cost|price|quote|estimate)\b/i.test(text);
      
      // Calculate RFQ completeness score
      const rfqCompleteness = [
        hasQuantityTerms ? 0.25 : 0,
        hasTimeframeTerms ? 0.25 : 0,
        hasProductSpecifications ? 0.25 : 0,
        hasBudgetInfo ? 0.25 : 0
      ].reduce((sum, val) => sum + val, 0);
      
      modelSpecificMetrics.rfq = {
        completeness: rfqCompleteness,
        hasQuantity: hasQuantityTerms,
        hasTimeframe: hasTimeframeTerms,
        hasSpecifications: hasProductSpecifications,
        hasBudget: hasBudgetInfo,
        priority: hasTimeframeTerms && /\b(urgent|asap|immediately)\b/i.test(text) ? 'high' : 'normal'
      };
      
      if (!hasQuantityTerms) {
        qualityIssues.push("No quantity specifications found, which is unusual for RFQs");
        qualityScore -= 0.15;
        businessRecommendations.push("Add specific quantities required for the products");
      }
      
      if (!hasTimeframeTerms) {
        qualityIssues.push("No timeframe/deadline specifications found");
        qualityScore -= 0.1;
        businessRecommendations.push("Specify delivery timeframe expectations");
      }
      
      if (!hasProductSpecifications) {
        qualityIssues.push("Missing product specifications or details");
        qualityScore -= 0.1;
        businessRecommendations.push("Include detailed product specifications");
      }
      
      if (!hasBudgetInfo) {
        qualityIssues.push("No budget or price expectations mentioned");
        qualityScore -= 0.05;
        businessRecommendations.push("Add budget expectations or price range");
      }
      break;
      
    case 'bid_pricing':
      // Bid pricing specific analysis
      const hasCompetitiveTerms = /\b(competitive|market rate|best offer)\b/i.test(text);
      const hasPriceBreakdown = /\b(breakdown|itemized|detailed pricing)\b/i.test(text);
      const hasVolumeDiscount = /\b(volume discount|bulk discount|quantity discount)\b/i.test(text);
      const hasDeliveryInfo = /\b(shipping|delivery cost|logistics|transport)\b/i.test(text);
      const hasPricingTiers = /\b(tiers?|levels?|pricing options)\b/i.test(text);
      
      // Calculate bid completeness score
      const bidCompleteness = [
        hasCompetitiveTerms ? 0.2 : 0,
        hasPriceBreakdown ? 0.2 : 0,
        hasVolumeDiscount ? 0.2 : 0,
        hasDeliveryInfo ? 0.2 : 0,
        hasPricingTiers ? 0.2 : 0
      ].reduce((sum, val) => sum + val, 0);
      
      modelSpecificMetrics.bid = {
        completeness: bidCompleteness,
        hasCompetitiveTerms,
        hasPriceBreakdown,
        hasVolumeDiscount,
        hasDeliveryInfo,
        hasPricingTiers,
        pricingStrategy: hasCompetitiveTerms ? 'competitive' : 
                         hasPricingTiers ? 'tiered' : 
                         hasVolumeDiscount ? 'volume-based' : 'standard'
      };
      
      if (!hasPriceBreakdown) {
        qualityIssues.push("Bid lacks price breakdown or itemized costs");
        qualityScore -= 0.15;
        businessRecommendations.push("Provide detailed price breakdown for better evaluation");
      }
      
      if (!hasDeliveryInfo) {
        qualityIssues.push("Missing delivery or shipping cost information");
        qualityScore -= 0.1;
        businessRecommendations.push("Include delivery/shipping costs or terms");
      }
      break;
      
    case 'product_categorization':
      // Product categorization specific analysis
      const hasMaterialInfo = /\b(made of|material|composition|contains)\b/i.test(text);
      const hasDimensionsInfo = /\b(dimensions|size|length|width|height|weight)\b/i.test(text);
      const hasApplicationInfo = /\b(used for|application|suitable for|designed for)\b/i.test(text);
      const hasFeatureInfo = /\b(features|functions|capabilities|specifications)\b/i.test(text);
      const hasCategoryTerms = /\b(category|type|class|classification|group)\b/i.test(text);
      
      // Calculate product description completeness
      const productCompleteness = [
        hasMaterialInfo ? 0.2 : 0,
        hasDimensionsInfo ? 0.2 : 0,
        hasApplicationInfo ? 0.2 : 0,
        hasFeatureInfo ? 0.2 : 0,
        hasCategoryTerms ? 0.2 : 0
      ].reduce((sum, val) => sum + val, 0);
      
      // Identify potential industry categories
      const industrialTerms = /\b(industrial|manufacturing|factory|machinery|equipment|commercial)\b/i.test(text);
      const consumerTerms = /\b(consumer|retail|household|personal|home|individual)\b/i.test(text);
      const electronicsTerms = /\b(electronic|digital|device|circuit|power|voltage)\b/i.test(text);
      const constructionTerms = /\b(construction|building|structural|architectural|concrete|steel)\b/i.test(text);
      
      let likelyCategories: string[] = [];
      if (industrialTerms) likelyCategories.push('Industrial');
      if (consumerTerms) likelyCategories.push('Consumer');
      if (electronicsTerms) likelyCategories.push('Electronics');
      if (constructionTerms) likelyCategories.push('Construction');
      
      modelSpecificMetrics.product = {
        completeness: productCompleteness,
        hasMaterialInfo,
        hasDimensionsInfo,
        hasApplicationInfo,
        hasFeatureInfo,
        hasCategoryTerms,
        likelyCategories: likelyCategories.length > 0 ? likelyCategories : ['Uncategorized'],
        confidence: productCompleteness * (likelyCategories.length > 0 ? 1 : 0.5)
      };
      
      if (!hasMaterialInfo && !hasDimensionsInfo) {
        qualityIssues.push("Missing physical characteristics (material, dimensions)");
        qualityScore -= 0.2;
        businessRecommendations.push("Add material composition and physical dimensions");
      }
      
      if (!hasApplicationInfo) {
        qualityIssues.push("No application or use-case specified");
        qualityScore -= 0.15;
        businessRecommendations.push("Specify intended use cases or applications");
      }
      break;
      
    default:
      // Default checks if model type is not recognized
      break;
  }
  
  // Generate natural language summary with business context
  let summary = "";
  const modelTypeName = modelType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (qualityIssues.length === 0) {
    summary = `Data quality for ${modelTypeName} is good with ${tokenCount} tokens analyzed. ` +
              `The text has ${complexityCategory} complexity with a perplexity score of ${perplexity.toFixed(2)}. ` +
              `Feature agreement between explanation methods is strong (${Math.round(featureAgreementRate * 100)}%).`;
              
    if (modelSpecificMetrics.rfq) {
      summary += ` RFQ completeness: ${Math.round(modelSpecificMetrics.rfq.completeness * 100)}%, ` +
                `Priority: ${modelSpecificMetrics.rfq.priority}.`;
    } else if (modelSpecificMetrics.bid) {
      summary += ` Bid completeness: ${Math.round(modelSpecificMetrics.bid.completeness * 100)}%, ` +
                `Strategy: ${modelSpecificMetrics.bid.pricingStrategy}.`;
    } else if (modelSpecificMetrics.product) {
      summary += ` Product description completeness: ${Math.round(modelSpecificMetrics.product.completeness * 100)}%, ` +
                `Likely categories: ${modelSpecificMetrics.product.likelyCategories.join(', ')}.`;
    }
  } else {
    summary = `Data quality assessment for ${modelTypeName} found ${qualityIssues.length} potential issues: ` +
              `${qualityIssues.join("; ")}. Overall quality score: ${Math.round(qualityScore * 100)}%. `;
              
    if (businessRecommendations.length > 0) {
      summary += `Business recommendations: ${businessRecommendations.join("; ")}.`;
    }
  }
  
  return {
    issues: qualityIssues,
    score: qualityScore,
    summary,
    recommendations: businessRecommendations,
    modelSpecificMetrics
  };
}

export default router;
