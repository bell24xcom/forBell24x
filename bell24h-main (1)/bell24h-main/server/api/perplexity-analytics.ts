/**
 * Advanced Perplexity Analytics API
 * 
 * Exposes endpoints for enhanced perplexity analysis features including
 * temporal trends, competitive intelligence, market segmentation, 
 * success prediction, and more.
 */

import express from 'express';
import authenticateUser from '../middleware/authenticate';
import perplexityAnalytics from '../services/perplexity-analytics';
import perplexityService from '../services/perplexity';
import aiExplainer from '../services/ai-explainer';

const router = express.Router();

/**
 * Get temporal perplexity trends
 * POST /api/perplexity-analytics/temporal-trends
 */
router.post('/temporal-trends', authenticateUser, async (req, res) => {
  try {
    const { entityType, timeframe, segmentBy } = req.body;
    
    if (!entityType || !timeframe) {
      return res.status(400).json({ 
        error: 'Missing required parameters: entityType and timeframe are required' 
      });
    }
    
    const trends = await perplexityAnalytics.analyzeTemporalTrends(
      entityType,
      timeframe,
      segmentBy
    );
    
    return res.status(200).json(trends);
  } catch (error) {
    console.error('Error analyzing temporal trends:', error);
    return res.status(500).json({ error: 'Failed to analyze temporal trends' });
  }
});

/**
 * Get competitive intelligence insights
 * POST /api/perplexity-analytics/competitive-intelligence
 */
router.post('/competitive-intelligence', authenticateUser, async (req, res) => {
  try {
    const { entityId, entityType, competitorIds } = req.body;
    
    if (!entityId || !entityType) {
      return res.status(400).json({ 
        error: 'Missing required parameters: entityId and entityType are required' 
      });
    }
    
    const insights = await perplexityAnalytics.analyzeCompetitiveIntelligence(
      entityId,
      entityType,
      competitorIds
    );
    
    return res.status(200).json(insights);
  } catch (error) {
    console.error('Error analyzing competitive intelligence:', error);
    return res.status(500).json({ error: 'Failed to analyze competitive intelligence' });
  }
});

/**
 * Identify market segments
 * POST /api/perplexity-analytics/market-segments
 */
router.post('/market-segments', authenticateUser, async (req, res) => {
  try {
    const { entityType, segmentationCriteria, minSegmentSize } = req.body;
    
    if (!entityType || !segmentationCriteria) {
      return res.status(400).json({ 
        error: 'Missing required parameters: entityType and segmentationCriteria are required' 
      });
    }
    
    const segments = await perplexityAnalytics.identifyMarketSegments(
      entityType,
      segmentationCriteria,
      minSegmentSize || 5
    );
    
    return res.status(200).json(segments);
  } catch (error) {
    console.error('Error identifying market segments:', error);
    return res.status(500).json({ error: 'Failed to identify market segments' });
  }
});

/**
 * Predict success probability
 * POST /api/perplexity-analytics/predict-success
 */
router.post('/predict-success', authenticateUser, async (req, res) => {
  try {
    const { text, entityType, modelType } = req.body;
    
    if (!text || !entityType || !modelType) {
      return res.status(400).json({ 
        error: 'Missing required parameters: text, entityType, and modelType are required' 
      });
    }
    
    const prediction = await perplexityAnalytics.predictSuccessProbability(
      text,
      entityType,
      modelType
    );
    
    return res.status(200).json(prediction);
  } catch (error) {
    console.error('Error predicting success probability:', error);
    return res.status(500).json({ error: 'Failed to predict success probability' });
  }
});

/**
 * Generate text improvements
 * POST /api/perplexity-analytics/text-improvements
 */
router.post('/text-improvements', authenticateUser, async (req, res) => {
  try {
    const { text, targetAudience, entityType, modelType } = req.body;
    
    if (!text || !targetAudience || !entityType || !modelType) {
      return res.status(400).json({ 
        error: 'Missing required parameters: text, targetAudience, entityType, and modelType are required' 
      });
    }
    
    const improvements = await perplexityAnalytics.generateTextImprovements(
      text,
      targetAudience,
      entityType,
      modelType
    );
    
    return res.status(200).json(improvements);
  } catch (error) {
    console.error('Error generating text improvements:', error);
    return res.status(500).json({ error: 'Failed to generate text improvements' });
  }
});

/**
 * Get or update customer perplexity profile
 * POST /api/perplexity-analytics/customer-profile
 */
router.post('/customer-profile', authenticateUser, async (req, res) => {
  try {
    const { customerId, recentTexts } = req.body;
    
    if (!customerId || !recentTexts || !Array.isArray(recentTexts)) {
      return res.status(400).json({ 
        error: 'Missing required parameters: customerId and recentTexts array are required' 
      });
    }
    
    const profile = await perplexityAnalytics.updateCustomerPerplexityProfile(
      customerId,
      recentTexts
    );
    
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error updating customer perplexity profile:', error);
    return res.status(500).json({ error: 'Failed to update customer perplexity profile' });
  }
});

/**
 * Analyze multilingual perplexity
 * POST /api/perplexity-analytics/multilingual
 */
router.post('/multilingual', authenticateUser, async (req, res) => {
  try {
    const { text, languageCode, entityType } = req.body;
    
    if (!text || !languageCode || !entityType) {
      return res.status(400).json({ 
        error: 'Missing required parameters: text, languageCode, and entityType are required' 
      });
    }
    
    const analysis = await perplexityAnalytics.analyzeMultilingualPerplexity(
      text,
      languageCode,
      entityType
    );
    
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing multilingual perplexity:', error);
    return res.status(500).json({ error: 'Failed to analyze multilingual perplexity' });
  }
});

/**
 * Full business analytics with perplexity
 * POST /api/perplexity-analytics/business-insights
 */
router.post('/business-insights', authenticateUser, async (req, res) => {
  try {
    const { text, entityType, modelType, customerId } = req.body;
    
    if (!text || !entityType || !modelType) {
      return res.status(400).json({ 
        error: 'Missing required parameters: text, entityType, and modelType are required' 
      });
    }
    
    // Calculate base perplexity
    const perplexityResult = await perplexityService.calculatePerplexity(text);
    
    // Get SHAP and LIME explanations
    const shapExplanation = await aiExplainer.explainWithSHAP(text, modelType);
    const limeExplanation = await aiExplainer.explainWithLIME(text, modelType);
    
    // Get success prediction
    const successPrediction = await perplexityAnalytics.predictSuccessProbability(
      text,
      entityType,
      modelType
    );
    
    // Get text improvements
    const textImprovements = await perplexityAnalytics.generateTextImprovements(
      text,
      'business', // Default to business audience
      entityType,
      modelType
    );
    
    // Get customer-specific insights if customerId is provided
    let customerProfile = undefined;
    if (customerId) {
      customerProfile = await perplexityAnalytics.updateCustomerPerplexityProfile(
        customerId,
        [text]
      );
    }
    
    // Combine all insights into a comprehensive response
    const response = {
      perplexity: {
        score: perplexityResult.perplexity,
        normalizedScore: perplexityResult.normalizedPerplexity,
        category: perplexityResult.complexityCategory,
        interpretation: perplexityService.interpretPerplexity(perplexityResult.perplexity)
      },
      explanations: {
        shap: shapExplanation,
        lime: limeExplanation
      },
      businessInsights: {
        successProbability: successPrediction.probability,
        keyFactors: successPrediction.keyFactors,
        recommendedActions: successPrediction.recommendedActions
      },
      textOptimization: {
        originalText: textImprovements.originalText,
        improvedText: textImprovements.improvedText,
        improvementRationale: textImprovements.improvementRationale,
        businessImpact: textImprovements.businessImpact
      },
      customerContext: customerProfile
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error generating business insights:', error);
    return res.status(500).json({ error: 'Failed to generate business insights' });
  }
});

export default router;
