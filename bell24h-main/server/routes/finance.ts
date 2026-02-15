import express from 'express';
import { processFinance } from '../services/embedded-finance';

const router = express.Router();

// POST /api/finance/process
router.post('/process', async (req, res) => {
  try {
    const result = await processFinance(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Finance processing failed', details: error.message });
  }
});

export default router;
