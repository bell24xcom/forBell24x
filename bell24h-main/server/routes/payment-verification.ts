import express from 'express';
import { verifyPayment } from '../services/payment-verification';

const router = express.Router();

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
  try {
    const result = await verifyPayment(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Payment verification failed', details: error.message });
  }
});

export default router;
