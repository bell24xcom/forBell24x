import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();
const analyticsController = new AnalyticsController();

// Apply rate limiting to all analytics routes
router.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Apply authentication to all analytics routes
router.use(authenticateJWT);

// User engagement metrics
router.get('/user/:userId/engagement', analyticsController.getUserEngagement.bind(analyticsController));

// Business metrics
router.get('/business', analyticsController.getBusinessMetrics.bind(analyticsController));

// System health metrics
router.get('/health', analyticsController.getSystemHealth.bind(analyticsController));

// Track user behavior
router.post('/track', analyticsController.trackUserBehavior.bind(analyticsController));

// Export analytics data
router.get('/export', analyticsController.exportAnalytics.bind(analyticsController));

export default router; 