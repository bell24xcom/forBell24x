import express from 'express';
import { executeTrade } from '../services/trading';

const router = express.Router();

// POST /api/trading/execute
router.post('/execute', async (req, res) => {
  try {
    const result = await executeTrade(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Trade execution failed', details: error.message });
  }
});

export default router;
