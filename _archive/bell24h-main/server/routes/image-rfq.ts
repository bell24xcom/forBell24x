import express from 'express';
import { processImageRFQ, explainImageAnalysis } from '../api/image-rfq';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /api/image-rfq
 * @desc Process an image for RFQ creation using Google Vision API
 * @access Private
 */
router.post('/', isAuthenticated, processImageRFQ);

/**
 * @route GET /api/image-rfq/:imageRfqId/explain
 * @desc Get SHAP/LIME explanation for image analysis
 * @access Private
 */
router.get('/:imageRfqId/explain', isAuthenticated, explainImageAnalysis);

export default router;
