import express from 'express';
import { convertCurrency } from '../services/multi-currency';

const router = express.Router();

// POST /api/currency/convert
router.post('/convert', async (req, res) => {
  try {
    const result = await convertCurrency(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Currency conversion failed', details: error.message });
  }
});

export default router;
