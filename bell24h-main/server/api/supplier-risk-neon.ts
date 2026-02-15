/**
 * Supplier Risk Scoring API with Neon Integration
 * 
 * This API provides endpoints for supplier risk scoring with SHAP/LIME explainability,
 * using Neon PostgreSQL for data storage and retrieval.
 */

import express from 'express';
import aiExplainer from '../services/ai-explainer';
import neonDb from '../services/neon-db';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

/**
 * GET /api/supplier-risk-neon/:id
 * Returns supplier risk score with SHAP/LIME explainability from Neon database
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    
    if (isNaN(supplierId)) {
      return res.status(400).json({ error: 'Invalid supplier ID' });
    }
    
    // Get supplier risk data from Neon
    const riskData = await neonDb.getSupplierRiskScore(supplierId);
    
    if (!riskData) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    // If we have features stored, use them directly
    if (riskData.features && riskData.features.length > 0) {
      return res.json({
        supplierId,
        riskScore: riskData.riskScore,
        explanation: {
          features: riskData.features,
          modelConfidence: calculateConfidence(riskData.features),
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // If no features stored, generate explanation using AI explainer
    // Get supplier profile text for explanation
    const supplier = await neonDb.getSupplier(supplierId);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    // Construct input text for explanation
    const inputText = `
      Supplier ID: ${supplierId}
      Name: ${supplier.name || 'Unknown'}
      Industry: ${supplier.industry || 'Unknown'}
      Location: ${supplier.location || 'Unknown'}
      Years Active: ${supplier.years_active || 'Unknown'}
      Credit Score: ${supplier.credit_score || 'Unknown'}
      Compliance: ${supplier.compliance_status || 'Unknown'}
    `;
    
    // Get SHAP/LIME explanation
    const explanation = await aiExplainer.getFullExplanation(inputText, 'rfq_classification');
    
    // Store features for future use
    if (explanation.shap && explanation.shap.features) {
      try {
        await neonDb.saveSupplierRiskScore(
          supplierId,
          riskData.riskScore,
          explanation.shap.features
        );
      } catch (err) {
        console.error('Error saving supplier risk features:', err);
        // Continue even if saving fails
      }
    }
    
    return res.json({
      supplierId,
      riskScore: riskData.riskScore,
      explanation
    });
  } catch (err) {
    console.error('Error in supplier risk explainability:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/supplier-risk-neon/:id/recalculate
 * Recalculates supplier risk score and explanations
 */
router.post('/:id/recalculate', authenticate, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    
    if (isNaN(supplierId)) {
      return res.status(400).json({ error: 'Invalid supplier ID' });
    }
    
    // Get supplier
    const supplier = await neonDb.getSupplier(supplierId);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    // Construct input text for explanation
    const inputText = `
      Supplier ID: ${supplierId}
      Name: ${supplier.name || 'Unknown'}
      Industry: ${supplier.industry || 'Unknown'}
      Location: ${supplier.location || 'Unknown'}
      Years Active: ${supplier.years_active || 'Unknown'}
      Credit Score: ${supplier.credit_score || 'Unknown'}
      Compliance: ${supplier.compliance_status || 'Unknown'}
    `;
    
    // Get SHAP/LIME explanation
    const explanation = await aiExplainer.getFullExplanation(inputText, 'rfq_classification');
    
    // Calculate new risk score based on features
    const riskScore = calculateRiskScore(explanation.shap.features);
    
    // Store new risk score and features
    await neonDb.saveSupplierRiskScore(
      supplierId,
      riskScore,
      explanation.shap.features
    );
    
    return res.json({
      supplierId,
      riskScore,
      explanation,
      message: 'Risk score recalculated successfully'
    });
  } catch (err) {
    console.error('Error recalculating supplier risk:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Calculate model confidence from feature importance distribution
 */
function calculateConfidence(features: any[]): number {
  if (!features || features.length === 0) return 0.5;
  
  // Calculate standard deviation of feature importances
  const importances = features.map(f => f.importance);
  const mean = importances.reduce((sum, val) => sum + val, 0) / importances.length;
  const squaredDiffs = importances.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / importances.length;
  const stdDev = Math.sqrt(variance);
  
  // Higher standard deviation often indicates more confident predictions
  // as the model is relying more heavily on specific features
  return Math.min(1, Math.max(0, stdDev * 2));
}

/**
 * Calculate risk score from feature importances
 */
function calculateRiskScore(features: any[]): number {
  if (!features || features.length === 0) return 0.5;
  
  // Base score
  let score = 0.5;
  
  // Adjust score based on features
  for (const feature of features) {
    // Negative features increase risk
    if (feature.name.includes('compliance') && feature.importance < 0) {
      score += 0.1 * Math.abs(feature.importance);
    }
    
    if (feature.name.includes('credit') && feature.importance < 0) {
      score += 0.15 * Math.abs(feature.importance);
    }
    
    // Positive features decrease risk
    if (feature.name.includes('years_active') && feature.importance > 0) {
      score -= 0.05 * feature.importance;
    }
    
    if (feature.name.includes('rating') && feature.importance > 0) {
      score -= 0.1 * feature.importance;
    }
  }
  
  // Ensure score is between 0 and 1
  return Math.min(1, Math.max(0, score));
}

export default router;
