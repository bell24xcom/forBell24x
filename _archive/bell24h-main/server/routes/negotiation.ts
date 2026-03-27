import express from 'express';
import { runNegotiation, getNegotiationExplanation } from '../services/negotiation-agent';

const router = express.Router();

// POST /api/negotiation/run
router.post('/run', async (req, res) => {
  try {
    const result = await runNegotiation(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Negotiation failed', details: error.message });
  }
});

// POST /api/negotiation/explain
router.post('/explain', async (req, res) => {
  try {
    const { input, finalPrice } = req.body;
    const explanation = await getNegotiationExplanation(input, finalPrice);
    res.json(explanation);
  } catch (error) {
    res.status(500).json({ error: 'Explainability failed', details: error.message });
  }
});

export default router;
