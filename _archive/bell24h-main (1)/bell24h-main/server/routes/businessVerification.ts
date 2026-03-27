import express from 'express';
import { verifyBusiness } from '../services/businessVerificationService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware to authenticate all verification routes
router.use(authenticateToken);

// POST /api/verify-business - Submit business for verification
router.post('/', async (req, res) => {
  try {
    const { businessName, taxId, address, country, region } = req.body;
    
    // Validate required fields
    if (!businessName || !taxId || !address || !country || !region) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields for business verification' 
      });
    }
    
    // Call verification service
    const verificationResult = await verifyBusiness(
      businessName,
      taxId,
      address,
      country,
      region
    );
    
    // Return verification result
    return res.status(200).json({
      success: true,
      verification: verificationResult
    });
  } catch (error) {
    console.error('Business verification route error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during business verification'
    });
  }
});

// GET /api/verify-business/status/:businessId - Get verification status
router.get('/status/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // In production, fetch from database
    // For now, return mock data
    return res.status(200).json({
      success: true,
      status: {
        businessId,
        verified: true,
        verificationDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        verificationLevel: 'standard'
      }
    });
  } catch (error) {
    console.error('Business verification status route error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching verification status'
    });
  }
});

export default router;
