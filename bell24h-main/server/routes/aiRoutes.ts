import { Router } from 'express';
import { getRFQRecommendations, getRFQAcceptancePrediction } from '../controllers/aiController';

const router = Router();

router.post('/rfq-recommendations', getRFQRecommendations);
router.post('/rfq-acceptance', getRFQAcceptancePrediction);

export default router;
