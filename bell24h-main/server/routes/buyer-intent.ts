import express from 'express';
import { analyzeBuyerIntent } from '../services/buyer-intent';

const router = express.Router();

// POST /api/buyer-intent/analyze
router.post('/analyze', async (req, res) => {
  try {
    const result = await analyzeBuyerIntent(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Buyer intent analysis failed', details: error.message });
  }
});

export default router;
