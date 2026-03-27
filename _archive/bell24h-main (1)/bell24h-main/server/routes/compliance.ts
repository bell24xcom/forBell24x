import express from 'express';
import { runComplianceCheck } from '../services/compliance-intelligence';

const router = express.Router();

// POST /api/compliance/check
router.post('/check', async (req, res) => {
  try {
    const result = await runComplianceCheck(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Compliance check failed', details: error.message });
  }
});

export default router;
