import express from 'express';
import { getCommunitySummary } from '../services/community-knowledge';
import { getCommunityInsights } from '../controllers/communityController';

const router = express.Router();

// Get community insights
router.get('/insights', getCommunityInsights);

// POST /api/community/summary
router.post('/summary', async (req, res) => {
  try {
    const summary = await getCommunitySummary(req.body.posts || []);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Community summary failed', details: error.message });
  }
});

export default router;
