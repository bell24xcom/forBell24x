import express from 'express';
import { verifySupplier } from '../services/supplier-verification';

const router = express.Router();

// POST /api/supplier/verify
router.post('/verify', async (req, res) => {
  try {
    const result = await verifySupplier(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Supplier verification failed', details: error.message });
  }
});

export default router;
