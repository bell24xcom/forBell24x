import express from 'express';
import { 
  createMarketingCampaign, 
  getRegionalCampaigns, 
  getRegionalMarketingInsights,
  generateRegionalAdCreatives
} from '../services/regionalMarketingService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to authenticate all marketing routes
router.use(authenticateToken);

// POST /api/regional-marketing/campaigns - Create a new marketing campaign
router.post('/campaigns', async (req, res) => {
  try {
    const campaignData = req.body;
    
    // Validate required fields
    if (!campaignData.name || !campaignData.region || !campaignData.language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required campaign data'
      });
    }
    
    const newCampaign = await createMarketingCampaign(campaignData);
    
    return res.status(201).json({
      success: true,
      data: newCampaign
    });
  } catch (error) {
    console.error('Error creating marketing campaign:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create marketing campaign'
    });
  }
});

// GET /api/regional-marketing/campaigns/:region - Get campaigns for a region
router.get('/campaigns/:region', async (req, res) => {
  try {
    const { region } = req.params;
    
    if (!region) {
      return res.status(400).json({
        success: false,
        message: 'Region is required'
      });
    }
    
    const campaigns = await getRegionalCampaigns(region);
    
    return res.status(200).json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    console.error('Error fetching regional campaigns:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch regional campaigns'
    });
  }
});

// GET /api/regional-marketing/insights/:region - Get marketing insights for a region
router.get('/insights/:region', async (req, res) => {
  try {
    const { region } = req.params;
    
    if (!region) {
      return res.status(400).json({
        success: false,
        message: 'Region is required'
      });
    }
    
    const insights = await getRegionalMarketingInsights(region);
    
    return res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error fetching regional marketing insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch regional marketing insights'
    });
  }
});

// POST /api/regional-marketing/creatives - Generate ad creatives
router.post('/creatives', async (req, res) => {
  try {
    const { region, language, product, targetAudience } = req.body;
    
    if (!region || !language || !product) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    const creatives = await generateRegionalAdCreatives(
      region,
      language,
      product,
      targetAudience || []
    );
    
    return res.status(200).json({
      success: true,
      data: creatives
    });
  } catch (error) {
    console.error('Error generating ad creatives:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate ad creatives'
    });
  }
});

export default router;
