import express from 'express';
import { explainWithSHAP, explainWithLIME } from '../services/ai-explainer';

const router = express.Router();

// POST /api/explain/shap
router.post('/explain/shap', async (req, res) => {
  try {
    const { text, modelType = 'rfq_classification' } = req.body;
    const explanation = await explainWithSHAP(text, modelType);
    res.json(explanation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate SHAP explanation', details: error.message });
  }
});

// POST /api/explain/lime
router.post('/explain/lime', async (req, res) => {
  try {
    const { text, modelType = 'rfq_classification' } = req.body;
    const explanation = await explainWithLIME(text, modelType);
    res.json(explanation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate LIME explanation', details: error.message });
  }
});

export default router;
