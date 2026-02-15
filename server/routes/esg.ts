import express from 'express';
import { calculateESG } from '../services/esg-scoring';

const router = express.Router();

// POST /api/esg/calculate
router.post('/calculate', async (req, res) => {
  try {
    const result = await calculateESG(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'ESG calculation failed', details: error.message });
  }
});

export default router;
