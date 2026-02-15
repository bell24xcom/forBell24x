import express, { Request, Response } from 'express';
import { AICategoryService } from '../../src/services/AICategoryService';

export function setupAICategoryRoutes(app: express.Application) {
  const router = express.Router();
  const aiService = new AICategoryService(process.env.PERPLEXITY_API_KEY || '');

  // Generate category suggestions
  router.post('/suggest', async (req: Request, res: Response): Promise<void> => {
    try {
      const { industry, count = 5 } = req.body;
      
      if (!industry) {
        res.status(400).json({ 
          success: false, 
          error: 'Industry parameter is required' 
        });
        return;
      }

      const suggestions = await aiService.generateCategorySuggestions(industry, count);
      
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Error in /api/ai-categories/suggest:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate category suggestions'
      });
    }
  });

  // Generate category page content
  router.post('/generate-page', async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.body;
      
      if (!category) {
        res.status(400).json({ 
          success: false, 
          error: 'Category parameter is required' 
        });
        return;
      }

      const content = await aiService.generateCategoryPageContent(category);
      
      res.json({
        success: true,
        data: { content }
      });
    } catch (error) {
      console.error('Error in /api/ai-categories/generate-page:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate category page content'
      });
    }
  });

  app.use('/api/ai-categories', router);
}
