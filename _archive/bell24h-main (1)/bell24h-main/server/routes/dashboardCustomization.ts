import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  getDashboardTemplates,
  getDashboardTemplateById,
  createDashboardTemplate,
  updateDashboardTemplate,
  deleteDashboardTemplate,
  getTemplatesByCategory,
  getTemplatesByTags,
  getPopularTemplates,
  getHighestRatedTemplates
} from '../services/dashboardCustomizationService.js';

const router = express.Router();

// Get all dashboard templates
router.get('/', authenticate, async (req, res) => {
  try {
    const templates = await getDashboardTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard templates', error: error.message });
  }
});

// Get dashboard template by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const template = await getDashboardTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Dashboard template not found' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard template', error: error.message });
  }
});

// Create new dashboard template
router.post('/', authenticate, async (req, res) => {
  try {
    const template = await createDashboardTemplate(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create dashboard template', error: error.message });
  }
});

// Update dashboard template
router.put('/:id', authenticate, async (req, res) => {
  try {
    const template = await updateDashboardTemplate(req.params.id, req.body);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Dashboard template not found' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update dashboard template', error: error.message });
  }
});

// Delete dashboard template
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const success = await deleteDashboardTemplate(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Dashboard template not found' });
    }
    res.json({ success: true, message: 'Dashboard template deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete dashboard template', error: error.message });
  }
});

// Get templates by category
router.get('/category/:category', authenticate, async (req, res) => {
  try {
    const templates = await getTemplatesByCategory(req.params.category);
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch templates by category', error: error.message });
  }
});

// Get templates by tags
router.get('/tags', authenticate, async (req, res) => {
  try {
    const tags = req.query.tags as string;
    const templates = await getTemplatesByTags(tags.split(','));
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch templates by tags', error: error.message });
  }
});

// Get popular templates
router.get('/popular', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const templates = await getPopularTemplates(limit);
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch popular templates', error: error.message });
  }
});

// Get highest rated templates
router.get('/rated', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const templates = await getHighestRatedTemplates(limit);
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch highest rated templates', error: error.message });
  }
});

export default router;
