import { Router } from 'express';
import { getUserEngagement, getRFQTrends, getPaymentStats } from '../controllers/analyticsController';

const router = Router();

router.get('/user-engagement', getUserEngagement);
router.get('/rfq-trends', getRFQTrends);
router.get('/payment-stats', getPaymentStats);

export default router;
