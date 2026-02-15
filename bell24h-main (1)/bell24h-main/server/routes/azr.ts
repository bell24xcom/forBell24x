import express from 'express';
import { body, validationResult } from 'express-validator';
import { azrReasoner, explainWithAZR, getSupplierRiskScore } from '../services/azr-service';
import { logger } from '../utils/logger';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/azr/explain
 * @desc    Get explanation using AZR
 * @access  Private
 */
router.post(
  '/explain',
  authenticateJWT,
  [
    body('input').exists().withMessage('Input is required'),
    body('modelType')
      .isIn(['rfq_classification', 'bid_pricing', 'product_categorization', 'supplier_risk', 'esg_scoring'])
      .withMessage('Invalid model type'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { input, modelType, context } = req.body;
      
      const result = await explainWithAZR(input, modelType, context || {});
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('AZR explanation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate explanation',
      });
    }
  }
);

/**
 * @route   POST /api/azr/supplier-risk
 * @desc    Get supplier risk score with explanation
 * @access  Private
 */
router.post(
  '/supplier-risk',
  authenticateJWT,
  [
    body('supplierData').exists().withMessage('Supplier data is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { supplierData } = req.body;
      
      const result = await getSupplierRiskScore(supplierData);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Supplier risk analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to analyze supplier risk',
      });
    }
  }
);

/**
 * @route   GET /api/azr/health
 * @desc    Check AZR service health
 * @access  Private
 */
router.get('/health', authenticateJWT, async (req, res) => {
  try {
    // Simple health check by making a test request
    await azrReasoner.explain(
      { test: 'health-check' },
      { modelType: 'rfq_classification' }
    );
    
    res.json({
      success: true,
      status: 'operational',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('AZR health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unavailable',
      message: 'AZR service is not available',
      error: error.message,
    });
  }
});

export default router;
