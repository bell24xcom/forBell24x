import { Request, Response } from 'express';
import { storage } from '../storage';

// Express namespace is extended in types/express.d.ts

/**
 * Handle product showcase submission with video
 */
export async function handleProductShowcase(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get data from request
    const { videoUrl, description, productName, category, price } = req.body;

    if (!videoUrl || !description || !productName) {
      return res.status(400).json({ error: 'Video URL, product name, and description are required' });
    }

    // Create product showcase record
    const showcaseData = {
      product_name: productName,
      description,
      category: category || 'general',
      price: price ? Number(price) : undefined,
      video_url: videoUrl,
      user_id: req.user!.id,
      created_at: new Date()
    };

    // Save to database (assuming there's a product_showcases table)
    // This function would need to be added to storage.ts
    const showcase = await storage.createProductShowcase?.(showcaseData);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Product showcase created successfully',
      showcase
    });
  } catch (error) {
    console.error('Error handling product showcase:', error);
    res.status(500).json({ 
      error: 'Failed to process product showcase',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Retrieve product showcases
 */
export async function getProductShowcases(req: Request, res: Response) {
  try {
    // Get query parameters
    const { category, userId, limit = '10', offset = '0' } = req.query;
    
    // Convert limit and offset to numbers
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    // Get showcases from database
    // This function would need to be added to storage.ts
    const showcases = await storage.getProductShowcases?.({
      category: category as string,
      userId: userId ? parseInt(userId as string, 10) : undefined,
      limit: limitNum,
      offset: offsetNum
    });

    // Return showcases
    res.json(showcases || []);
  } catch (error) {
    console.error('Error getting product showcases:', error);
    res.status(500).json({ error: 'Failed to retrieve product showcases' });
  }
}

/**
 * Get a specific product showcase by ID
 */
export async function getProductShowcaseById(req: Request, res: Response) {
  try {
    const showcaseId = parseInt(req.params.id, 10);
    
    if (isNaN(showcaseId)) {
      return res.status(400).json({ error: 'Invalid showcase ID' });
    }

    // Get showcase from database
    // This function would need to be added to storage.ts
    const showcase = await storage.getProductShowcaseById?.(showcaseId);

    if (!showcase) {
      return res.status(404).json({ error: 'Product showcase not found' });
    }

    // Return showcase
    res.json(showcase);
  } catch (error) {
    console.error('Error getting product showcase:', error);
    res.status(500).json({ error: 'Failed to retrieve product showcase' });
  }
}
