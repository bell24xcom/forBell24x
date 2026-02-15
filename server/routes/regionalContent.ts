import express from 'express';
import { getRegionalContent, getAvailableRegions } from '../services/regionalContentService.js';

const router = express.Router();

// GET /api/regional-content/regions - Get available regions and languages
router.get('/regions', async (req, res) => {
  try {
    const regions = await getAvailableRegions();
    return res.status(200).json({
      success: true,
      data: regions
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available regions'
    });
  }
});

// GET /api/regional-content/:region/:language/:contentType - Get content for region/language
router.get('/:region/:language/:contentType', async (req, res) => {
  try {
    const { region, language, contentType } = req.params;
    
    if (!region || !language || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    const content = await getRegionalContent(region, language, contentType);
    
    return res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching regional content:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch regional content'
    });
  }
});

export default router;
