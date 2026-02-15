import express from 'express';
import aiExplainer from '../services/ai-explainer';
import neonDb from '../services/neon-db';

const router = express.Router();

/**
 * GET /api/supplier-risk-explain/:id
 * Returns supplier risk score and SHAP/LIME explainability
 */
router.get('/:id', async (req, res) => {
  try {
    // Fetch supplier data from database
    const supplierId = parseInt(req.params.id, 10);
    if (isNaN(supplierId)) {
      return res.status(400).json({ error: 'Invalid supplier ID' });
    }
    const supplier = await neonDb.getSupplier(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    const riskData = await neonDb.getSupplierRiskScore(supplierId);
    // Prepare supplier profile text for AI explainer
    const supplierProfile = `Supplier ID: ${supplier.id}\nIndustry: ${supplier.industry || 'N/A'}\nLocation: ${supplier.location || 'N/A'}\nYears Active: ${supplier.years_active || 'N/A'}\nCredit Score: ${supplier.credit_score || 'N/A'}\nCompliance: ${(supplier.compliance || []).join(', ')}`;
    // Call the AI explainer for SHAP/LIME explanations using real data
    const explanation = await aiExplainer.getFullExplanation(supplierProfile, 'rfq_classification');
    // Use the real risk score from DB if available
    const riskScore = riskData ? riskData.riskScore : null;
    return res.json({
      supplierId: supplier.id,
      supplierProfile: supplierProfile,
      riskScore,
      explanation
    });
  } catch (err) {
    console.error('Error in supplier risk explainability:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
