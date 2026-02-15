import express from 'express';
import explainabilityFeedbackRouter from '../api/explainability-feedback';

const router = express.Router();

// Mount the explainability feedback API
router.use('/', explainabilityFeedbackRouter);

export default router;
