import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { rlvrController } from '../controllers/rlvrController';

const router = express.Router();

// Apply authentication middleware to all RLVR routes
router.use(authenticateToken);

// Model management
router.post('/model', rlvrController.createModel);
router.get('/model/:modelId/info', rlvrController.getModelInfo);
router.post('/model/:modelId/save', rlvrController.saveModel);
router.post('/model/:modelId/load', rlvrController.loadModel);

// Training and evaluation
router.post('/train/:modelId', rlvrController.trainModel);
router.get('/evaluate/:modelId', rlvrController.evaluateModel);

// Inference
router.post('/action', rlvrController.getOptimalAction);
router.post('/experience', rlvrController.recordExperience);

// Application-specific endpoints
router.post('/optimize-pricing', rlvrController.optimizePricing);
router.post('/recommend-suppliers', rlvrController.recommendSuppliers);
router.post('/inventory-optimization', rlvrController.optimizeInventory);

export default router;
