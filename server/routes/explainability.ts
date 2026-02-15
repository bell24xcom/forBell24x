import express from 'express';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Explainability routes are working!', timestamp: new Date().toISOString() });
});

export default router; 