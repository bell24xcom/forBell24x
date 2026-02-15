import express from 'express';
import { StockMarketIntegrationService } from '../services/stock-market-integration';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// Test endpoint without authentication
router.get('/test', (req, res) => {
  res.json({ message: 'Market routes are working!', timestamp: new Date().toISOString() });
});

// GET /api/market/insights
router.get('/insights', authenticate, async (req, res) => {
  try {
    const { industry } = req.query;
    const insights = await StockMarketIntegrationService.generateMarketInsights(industry || 'default');
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market insights' });
  }
});

// GET /api/market/predict/:rfqId
router.get('/predict/:rfqId', authenticate, async (req, res) => {
  try {
    const analytics = await StockMarketIntegrationService.generatePredictiveAnalytics(req.params.rfqId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate predictive analytics' });
  }
});

// GET /api/market/trends
router.get('/trends', authenticate, async (req, res) => {
  try {
    const { symbols } = req.query;
    const symbolList = symbols ? symbols.split(',') : ['NIFTY50', 'SENSEX'];
    const data = await StockMarketIntegrationService.getStockData(symbolList);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market trends' });
  }
});

export default router; 