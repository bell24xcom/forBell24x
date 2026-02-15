import express from 'express';
import { 
  createExportConfig,
  updateExportConfig,
  deleteExportConfig,
  getExportConfigById,
  getExportConfigs,
  createExportSchedule,
  updateExportSchedule,
  getExportScheduleById,
  generateExport,
  exportTypes,
  exportPeriods
} from '../services/exportService.js';
import { authenticate } from '../middleware/auth.js';
import { format } from 'date-fns';

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

// Middleware to authenticate all export routes
router.use(authenticate);

// GET /api/export/types - Get available export types
router.get('/types', (req, res) => {
  res.json({
    success: true,
    types: exportTypes
  });
});

// GET /api/export/periods - Get available export periods
router.get('/periods', (req, res) => {
  res.json({
    success: true,
    periods: exportPeriods
  });
});

// POST /api/export/config - Create a new export configuration
router.post('/config', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const config = await createExportConfig({
      ...req.body,
      userId: req.user.id
    });

    // If schedule is provided, create a schedule
    if (req.body.schedule) {
      await createExportSchedule(config.id, req.body.schedule);
    }

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error creating export config:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create export config'
    });
  }
});

// GET /api/export/config - Get all export configurations
router.get('/config', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const configs = await getExportConfigs(req.user.id);
    res.json({
      success: true,
      configs
    });
  } catch (error) {
    console.error('Error fetching export configs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch export configs'
    });
  }
});

// GET /api/export/config/:id - Get a specific export configuration
router.get('/config/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const config = await getExportConfigById(req.params.id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Export configuration not found'
      });
    }

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching export config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch export config'
    });
  }
});

// PUT /api/export/config/:id - Update an export configuration
router.put('/config/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const config = await updateExportConfig(req.params.id, req.body);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Export configuration not found'
      });
    }

    // Update schedule if provided
    if (req.body.schedule) {
      await updateExportSchedule(config.id, req.body.schedule);
    }

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error updating export config:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update export config'
    });
  }
});

// DELETE /api/export/config/:id - Delete an export configuration
router.delete('/config/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = await deleteExportConfig(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Export configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Export configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting export config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete export config'
    });
  }
});

// GET /api/export/:id - Generate an export
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const buffer = await generateExport(req.params.id);
    
    const config = await getExportConfigById(req.params.id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Export configuration not found'
      });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=export_${format(new Date(), 'yyyy-MM-dd')}${exportTypes[config.type as keyof typeof exportTypes].extension}`);
    res.send(buffer);
  } catch (error) {
    console.error('Error generating export:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate export'
    });
  }
});

export default router;
