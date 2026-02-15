import express from 'express';
import { 
  getDashboardMetrics,
  getDashboardConfig,
  updateDashboardConfig,
  getWidgetData
} from '../services/dashboardService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware to authenticate all dashboard routes
router.use(authenticate);

// GET /api/dashboard/metrics - Get dashboard metrics
router.get('/metrics', async (req: AuthenticatedRequest, res) => {
  try {
    const metrics = await getDashboardMetrics();
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics'
    });
  }
});

// GET /api/dashboard/config - Get dashboard configuration
router.get('/config', async (req: AuthenticatedRequest, res) => {
  try {
    const config = await getDashboardConfig(parseInt(req.user.id.toString()));
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching dashboard config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard config'
    });
  }
});

// PUT /api/dashboard/config - Update dashboard configuration
router.put('/config', async (req: AuthenticatedRequest, res) => {
  try {
    const config = await updateDashboardConfig(parseInt(req.user.id.toString()), req.body);
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error updating dashboard config:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update dashboard config'
    });
  }
});

// GET /api/dashboard/widget/:id - Get widget data
router.get('/widget/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const widgetData = await getWidgetData(req.params.id);
    res.json({
      success: true,
      data: widgetData
    });
  } catch (error) {
    console.error('Error fetching widget data:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch widget data'
    });
  }
});

export default router;
