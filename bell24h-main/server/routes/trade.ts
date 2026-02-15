import express from 'express';
import { TradeInsightsService } from '../services/trade-insights';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// GET /api/trade/insights
router.get('/insights', authenticate, async (req, res) => {
  try {
    const { country, product } = req.query;
    const insights = await TradeInsightsService.getTradeInsights(country, product);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trade insights' });
  }
});

// GET /api/trade/opportunities
router.get('/opportunities', authenticate, async (req, res) => {
  try {
    const { country, sector } = req.query;
    const opportunities = await TradeInsightsService.getTradeOpportunities(country, sector);
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trade opportunities' });
  }
});

// GET /api/trade/export-data
router.get('/export-data', authenticate, async (req, res) => {
  try {
    const { country, hsCode } = req.query;
    const data = await TradeInsightsService.getExportData(country, hsCode);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch export data' });
  }
});

export default router; 