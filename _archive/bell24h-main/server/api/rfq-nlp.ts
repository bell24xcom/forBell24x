// rfq-nlp.ts
import express from 'express';
import { analyzeRfqText } from '../services/nlpService';

const router = express.Router();

/**
 * @route POST /api/rfq/nlp-analyze
 * @desc Analyze RFQ text for NLP features (entities, intent, tags)
 * @body { text: string }
 * @returns { entities, topics, intent, autoTags }
 */
router.post('/nlp-analyze', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid text' });
  }
  try {
    const analysis = analyzeRfqText(text);
    return res.json(analysis);
  } catch (err) {
    return res.status(500).json({ error: 'NLP analysis failed' });
  }
});

export default router;
