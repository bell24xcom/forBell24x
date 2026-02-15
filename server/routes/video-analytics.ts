import express from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Import controllers from their implementation file
import {
  trackVideoView,
  updateVideoAnalytics,
  getVideoAnalytics,
  getAggregatedAnalytics,
  getVideoHeatmap,
  getVideoDemographics
} from '../controllers/videoAnalyticsController';

// Track a video view (can be called without authentication for public videos)
router.post(
  '/view',
  [
    body('videoId').notEmpty().withMessage('Video ID is required'),
    body('videoType').isIn(['rfq', 'productShowcase']).withMessage('Video type must be rfq or productShowcase'),
    body('duration').optional().isNumeric().withMessage('Duration must be a number'),
    body('deviceInfo').optional(),
    body('userLocation').optional(),
    body('userDemographics').optional(),
  ],
  validateRequest,
  trackVideoView
);

// Update video analytics (authenticated)
router.patch(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid analytics ID'),
    body('views').optional().isInt().withMessage('Views must be an integer'),
    body('watchTime').optional().isNumeric().withMessage('Watch time must be a number'),
    body('engagement').optional().isFloat({ min: 0, max: 100 }).withMessage('Engagement must be between 0 and 100'),
    body('clickThroughRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Click-through rate must be between 0 and 100'),
    body('conversionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Conversion rate must be between 0 and 100'),
    body('regionHeatmap').optional(),
    body('viewerDemographics').optional(),
  ],
  validateRequest,
  updateVideoAnalytics
);

// Get video analytics for a specific video
router.get(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid analytics ID'),
  ],
  validateRequest,
  getVideoAnalytics
);

// Get aggregated analytics across all videos
router.get(
  '/aggregated',
  authenticate,
  [
    query('videoType').optional().isIn(['rfq', 'productShowcase', 'all']).withMessage('Video type must be rfq, productShowcase, or all'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    query('companyId').optional().isUUID().withMessage('Invalid company ID'),
  ],
  validateRequest,
  getAggregatedAnalytics
);

// Get heatmap data for a specific video
router.get(
  '/:id/heatmap',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid analytics ID'),
  ],
  validateRequest,
  getVideoHeatmap
);

// Get demographic data for a specific video
router.get(
  '/:id/demographics',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid analytics ID'),
  ],
  validateRequest,
  getVideoDemographics
);

export default router;
