import express from 'express';
import { analyzeResilience } from '../services/supplychain-resilience';

const router = express.Router();

// POST /api/resilience/analyze
router.post('/analyze', async (req, res) => {
  try {
    const result = await analyzeResilience(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Resilience analysis failed', details: error.message });
  }
});

export default router;
