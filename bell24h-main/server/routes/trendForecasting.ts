import express from 'express';
import { 
  createForecast,
  getForecasts,
  getForecastById,
  deleteForecast,
  updateForecast,
  forecastTypes,
  forecastPeriods
} from '../services/trendForecastingService.js';
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

// Middleware to authenticate all trend forecasting routes
router.use(authenticate);

// GET /api/forecast/types - Get available forecast types
router.get('/types', (req, res) => {
  res.json({
    success: true,
    types: forecastTypes
  });
});

// GET /api/forecast/periods - Get available forecast periods
router.get('/periods', (req, res) => {
  res.json({
    success: true,
    periods: forecastPeriods
  });
});

// POST /api/forecast - Create a new forecast
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const forecast = await createForecast(req.body);
    res.json({
      success: true,
      forecast
    });
  } catch (error) {
    console.error('Error creating forecast:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create forecast'
    });
  }
});

// GET /api/forecast - Get all forecasts
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const forecasts = await getForecasts(req.user.id);
    res.json({
      success: true,
      forecasts
    });
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forecasts'
    });
  }
});

// GET /api/forecast/:id - Get a specific forecast
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const forecast = await getForecastById(req.params.id);
    if (!forecast) {
      return res.status(404).json({
        success: false,
        message: 'Forecast not found'
      });
    }

    res.json({
      success: true,
      forecast
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forecast'
    });
  }
});

// PUT /api/forecast/:id - Update a forecast
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const forecast = await updateForecast(req.params.id, req.body);
    if (!forecast) {
      return res.status(404).json({
        success: false,
        message: 'Forecast not found'
      });
    }

    res.json({
      success: true,
      forecast
    });
  } catch (error) {
    console.error('Error updating forecast:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update forecast'
    });
  }
});

// DELETE /api/forecast/:id - Delete a forecast
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = await deleteForecast(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Forecast not found'
      });
    }

    res.json({
      success: true,
      message: 'Forecast deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete forecast'
    });
  }
});

export default router;
