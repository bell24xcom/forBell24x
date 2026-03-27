/**
 * Perplexity API for Bell24H
 * 
 * This API provides endpoints for calculating perplexity scores,
 * analyzing model quality, and explaining AI model predictions.
 */

import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import perplexityService from '../services/perplexity';
import aiExplainer from '../services/ai-explainer';
import videoMetrics from '../utils/video-metrics';

const router = Router();

/**
 * Calculate perplexity for a single text input
 * POST /api/perplexity/calculate
 */
router.post('/calculate', authenticateUser, async (req, res) => {
  try {
    const { text, model_name = 'default' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }
    
    const result = await perplexityService.calculatePerplexity(
      text, 
      model_name as 'default' | 'rfq' | 'product'
    );
    
    // Log the perplexity calculation for monitoring
    videoMetrics.updateVideoEngagementScore(
      'perplexity',
      'ai_model',
      result.normalizedPerplexity
    );
    
    return res.status(200).json({
      perplexity: result.perplexity,
      normalized_perplexity: result.normalizedPerplexity,
      tokens: result.tokens,
      complexity_category: result.complexityCategory,
      interpretation: perplexityService.interpretPerplexity(result.perplexity)
    });
  } catch (error) {
    console.error('Error calculating perplexity:', error);
    return res.status(500).json({ error: 'Failed to calculate perplexity' });
  }
});

/**
 * Calculate perplexity for multiple text inputs
 * POST /api/perplexity/batch-calculate
 */
router.post('/batch-calculate', authenticateUser, async (req, res) => {
  try {
    const { texts, model_name = 'default' } = req.body;
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'Array of text inputs is required' });
    }
    
    const results = await perplexityService.calculateBatchPerplexity(
      texts,
      model_name as 'default' | 'rfq' | 'product'
    );
    
    return res.status(200).json({
      results: results.map(result => ({
        perplexity: result.perplexity,
        normalized_perplexity: result.normalizedPerplexity,
        tokens: result.tokens,
        complexity_category: result.complexityCategory,
        interpretation: perplexityService.interpretPerplexity(result.perplexity)
      }))
    });
  } catch (error) {
    console.error('Error calculating batch perplexity:', error);
    return res.status(500).json({ error: 'Failed to calculate batch perplexity' });
  }
});

/**
 * Get SHAP-based explanation with perplexity for a text input
 * POST /api/perplexity/explain/shap
 */
router.post('/explain/shap', authenticateUser, async (req, res) => {
  try {
    const { 
      text, 
      model_type = 'rfq_classification'
    } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }
    
    const result = await aiExplainer.explainWithSHAP(
      text,
      model_type as 'rfq_classification' | 'bid_pricing' | 'product_categorization'
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating SHAP explanation:', error);
    return res.status(500).json({ error: 'Failed to generate SHAP explanation' });
  }
});

/**
 * Get LIME-based explanation with perplexity for a text input
 * POST /api/perplexity/explain/lime
 */
router.post('/explain/lime', authenticateUser, async (req, res) => {
  try {
    const { 
      text, 
      model_type = 'rfq_classification'
    } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }
    
    const result = await aiExplainer.explainWithLIME(
      text,
      model_type as 'rfq_classification' | 'bid_pricing' | 'product_categorization'
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating LIME explanation:', error);
    return res.status(500).json({ error: 'Failed to generate LIME explanation' });
  }
});

/**
 * Get combined explanation (SHAP + LIME + perplexity) for a text input
 * POST /api/perplexity/explain/full
 */
router.post('/explain/full', authenticateUser, async (req, res) => {
  try {
    const { 
      text, 
      model_type = 'rfq_classification'
    } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }
    
    const result = await aiExplainer.getFullExplanation(
      text,
      model_type as 'rfq_classification' | 'bid_pricing' | 'product_categorization'
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating full explanation:', error);
    return res.status(500).json({ error: 'Failed to generate full explanation' });
  }
});

/**
 * Validate AI model performance using perplexity metrics
 * POST /api/perplexity/validate-model
 */
router.post('/validate-model', authenticateUser, async (req, res) => {
  try {
    const { 
      samples, 
      model_name = 'default',
      threshold = 50 // Maximum acceptable perplexity
    } = req.body;
    
    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return res.status(400).json({ error: 'Array of sample texts is required' });
    }
    
    const results = await perplexityService.calculateBatchPerplexity(
      samples,
      model_name as 'default' | 'rfq' | 'product'
    );
    
    // Calculate validation metrics
    const avgPerplexity = results.reduce((sum, r) => sum + r.perplexity, 0) / results.length;
    const failedSamples = results.filter(r => r.perplexity > threshold);
    const passRate = 1 - (failedSamples.length / results.length);
    
    return res.status(200).json({
      validation: {
        average_perplexity: avgPerplexity,
        pass_rate: passRate,
        samples_tested: samples.length,
        samples_failed: failedSamples.length,
        threshold: threshold
      },
      samples_results: results.map((result, index) => ({
        sample_index: index,
        perplexity: result.perplexity,
        normalized_perplexity: result.normalizedPerplexity,
        complexity_category: result.complexityCategory,
        passed: result.perplexity <= threshold
      }))
    });
  } catch (error) {
    console.error('Error validating model:', error);
    return res.status(500).json({ error: 'Failed to validate model' });
  }
});

export default router;
