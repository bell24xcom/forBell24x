import express from 'express';
import { verifyIdentity } from '../services/identity-reputation';

const router = express.Router();

// POST /api/identity/verify
router.post('/verify', async (req, res) => {
  try {
    const result = await verifyIdentity(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Identity verification failed', details: error.message });
  }
});

export default router;
