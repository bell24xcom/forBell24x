import express from 'express';
import { 
  getMetrics,
  getMetricById,
  getMetricValues,
  getPerformanceMetricsConfig,
  updatePerformanceMetricsConfig
} from '../services/performanceMetricsService.js';
import { authenticate } from '../middleware/auth.js';

// Extend express Request interface to include user
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

const router = express.Router();

// Middleware to authenticate all performance metrics routes
router.use(authenticate);

// GET /api/metrics - Get all performance metrics
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const metrics = await getMetrics();
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics'
    });
  }
});

// GET /api/metrics/:id - Get a specific metric
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const metric = await getMetricById(req.params.id);
    if (!metric) {
      return res.status(404).json({
        success: false,
        message: 'Metric not found'
      });
    }

    res.json({
      success: true,
      metric
    });
  } catch (error) {
    console.error('Error fetching metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metric'
    });
  }
});

// GET /api/metrics/:id/values - Get metric values
router.get('/:id/values', async (req: AuthenticatedRequest, res) => {
  try {
    const { period = 'day' } = req.query;
    const values = await getMetricValues(req.params.id, period as 'day' | 'week' | 'month');
    res.json({
      success: true,
      values
    });
  } catch (error) {
    console.error('Error fetching metric values:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metric values'
    });
  }
});

// GET /api/metrics/config - Get performance metrics configuration
router.get('/config', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const config = await getPerformanceMetricsConfig(req.user.id);
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching metrics config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics config'
    });
  }
});

// PUT /api/metrics/config - Update performance metrics configuration
router.put('/config', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const config = await updatePerformanceMetricsConfig(req.user.id, req.body);
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error updating metrics config:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update metrics config'
    });
  }
});

export default router;
