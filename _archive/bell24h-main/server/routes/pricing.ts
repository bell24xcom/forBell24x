import express from 'express';
import { DynamicPricingService } from '../services/dynamic-pricing';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// POST /api/pricing/suggest
router.post('/suggest', authenticate, async (req, res) => {
  try {
    const { rfqId } = req.body;
    const suggestion = await DynamicPricingService.suggestPrice(rfqId);
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to suggest price' });
  }
});

// POST /api/pricing/optimize
router.post('/optimize', authenticate, async (req, res) => {
  try {
    const { rfqId } = req.body;
    const result = await DynamicPricingService.optimizePrice(rfqId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to optimize price' });
  }
});

// GET /api/pricing/market-based
router.get('/market-based', authenticate, async (req, res) => {
  try {
    const { industry } = req.query;
    const result = await DynamicPricingService.getMarketBasedPricing(industry || 'default');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market-based pricing' });
  }
});

export default router; 