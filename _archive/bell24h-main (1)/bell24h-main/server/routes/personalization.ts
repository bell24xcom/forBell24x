import express from 'express';
import { getPersonalizedDashboard } from '../services/personalization';

const router = express.Router();

// POST /api/personalization/dashboard
router.post('/dashboard', async (req, res) => {
  try {
    const config = await getPersonalizedDashboard(req.body);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Personalization failed', details: error.message });
  }
});

export default router;
