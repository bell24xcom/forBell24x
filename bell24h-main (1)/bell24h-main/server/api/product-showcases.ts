import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import * as storage from '../storage';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { validateRequest } from '../middleware/validate';
import { getOptimizedUploadParams } from './video-processing';

const router = Router();

// Schema for creating a product showcase
const createProductShowcaseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1),
  price: z.number().positive().optional(),
  video_url: z.string().url('Valid video URL is required').optional(),
  thumbnail_url: z.string().url().optional(),
  public_id: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

// Schema for updating a product showcase
const updateProductShowcaseSchema = createProductShowcaseSchema.partial();

/**
 * Get signed upload parameters for client-side upload
 * POST /api/product-showcases/upload-params
 */
router.post('/upload-params', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const params = await getOptimizedUploadParams(req.user.id, 'product_showcase');
    res.json(params);
  } catch (error: any) {
    console.error('Error generating upload params:', error);
    res.status(500).json({ error: error.message || 'Failed to generate upload parameters' });
  }
});

/**
 * Create a new product showcase
 * POST /api/product-showcases
 */
router.post('/', authenticate, validateRequest(createProductShowcaseSchema), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const showcaseData = {
      ...req.body,
      id: uuidv4(),
      user_id: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    };

    const showcase = await storage.createProductShowcase(showcaseData);

    // Track video analytics if a video was included
    if (showcaseData.video_url && showcaseData.public_id) {
      try {
        await storage.trackVideoActivity({
          video_id: showcaseData.public_id,
          user_id: req.user.id,
          activity_type: 'upload',
          resource_type: 'product_showcase',
          resource_id: showcase.id,
          metadata: JSON.stringify({
            title: showcaseData.title,
            category: showcaseData.category
          })
        });
      } catch (analyticsError) {
        console.error('Error tracking video analytics:', analyticsError);
        // Continue even if analytics tracking fails
      }
    }

    res.status(201).json(showcase);
  } catch (error: any) {
    console.error('Error creating product showcase:', error);
    res.status(500).json({ error: error.message || 'Failed to create product showcase' });
  }
});

/**
 * Get all product showcases (with optional filters)
 * GET /api/product-showcases
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, user_id, status } = req.query;
    
    const filters: any = {};
    if (category) filters.category = category as string;
    if (user_id) filters.user_id = user_id as string;
    if (status) filters.status = status as string;
    
    const showcases = await storage.getProductShowcases(filters);
    res.json(showcases);
  } catch (error: any) {
    console.error('Error fetching product showcases:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch product showcases' });
  }
});

/**
 * Get a specific product showcase by ID
 * GET /api/product-showcases/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const showcase = await storage.getProductShowcase(id);
    
    if (!showcase) {
      return res.status(404).json({ error: 'Product showcase not found' });
    }
    
    // Track view analytics if there's a video
    if (req.user && showcase.video_url && showcase.public_id) {
      try {
        await storage.trackVideoActivity({
          video_id: showcase.public_id,
          user_id: req.user.id,
          activity_type: 'view',
          resource_type: 'product_showcase',
          resource_id: showcase.id,
          metadata: JSON.stringify({
            referrer: req.headers.referer || 'direct'
          })
        });
      } catch (analyticsError) {
        console.error('Error tracking video analytics:', analyticsError);
        // Continue even if analytics tracking fails
      }
    }
    
    res.json(showcase);
  } catch (error: any) {
    console.error('Error fetching product showcase:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch product showcase' });
  }
});

/**
 * Update a product showcase
 * PUT /api/product-showcases/:id
 */
router.put('/:id', authenticate, validateRequest(updateProductShowcaseSchema), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const id = req.params.id;
    const existingShowcase = await storage.getProductShowcase(id);
    
    if (!existingShowcase) {
      return res.status(404).json({ error: 'Product showcase not found' });
    }
    
    // Check ownership or admin permission
    if (existingShowcase.user_id !== req.user.id) {
      const hasPermission = await storage.checkUserPermission(
        req.user.id,
        'product_showcase',
        'edit',
        id
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'You do not have permission to update this product showcase'
        });
      }
    }
    
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    const updatedShowcase = await storage.updateProductShowcase(id, updateData);
    
    res.json(updatedShowcase);
  } catch (error: any) {
    console.error('Error updating product showcase:', error);
    res.status(500).json({ error: error.message || 'Failed to update product showcase' });
  }
});

/**
 * Delete a product showcase
 * DELETE /api/product-showcases/:id
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const id = req.params.id;
    const existingShowcase = await storage.getProductShowcase(id);
    
    if (!existingShowcase) {
      return res.status(404).json({ error: 'Product showcase not found' });
    }
    
    // Check ownership or admin permission
    if (existingShowcase.user_id !== req.user.id) {
      const hasPermission = await storage.checkUserPermission(
        req.user.id,
        'product_showcase',
        'delete',
        id
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'You do not have permission to delete this product showcase'
        });
      }
    }
    
    await storage.deleteProductShowcase(id);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting product showcase:', error);
    res.status(500).json({ error: error.message || 'Failed to delete product showcase' });
  }
});

/**
 * Track video engagement for analytics
 * POST /api/product-showcases/:id/track-video
 */
router.post('/:id/track-video', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { id } = req.params;
    const { activity_type, video_id, metadata } = req.body;
    
    if (!activity_type || !video_id) {
      return res.status(400).json({ error: 'Activity type and video ID are required' });
    }
    
    const showcase = await storage.getProductShowcase(id);
    if (!showcase) {
      return res.status(404).json({ error: 'Product showcase not found' });
    }
    
    // Record the video activity
    await storage.trackVideoActivity({
      video_id,
      user_id: req.user.id,
      activity_type,
      resource_type: 'product_showcase',
      resource_id: id,
      metadata: metadata ? JSON.stringify(metadata) : null
    });
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error tracking video activity:', error);
    res.status(500).json({ error: error.message || 'Failed to track video activity' });
  }
});

/**
 * Get video analytics for a product showcase
 * GET /api/product-showcases/:id/video-analytics
 */
router.get('/:id/video-analytics', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { id } = req.params;
    
    const showcase = await storage.getProductShowcase(id);
    if (!showcase) {
      return res.status(404).json({ error: 'Product showcase not found' });
    }
    
    // Check ownership or permission
    if (showcase.user_id !== req.user.id) {
      const hasPermission = await storage.checkUserPermission(
        req.user.id,
        'product_showcase',
        'view',
        id
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'You do not have permission to view analytics for this product showcase'
        });
      }
    }
    
    if (!showcase.public_id) {
      return res.status(404).json({ error: 'No video found for this product showcase' });
    }
    
    // Get video analytics
    const analytics = await storage.getVideoAnalytics(showcase.public_id);
    
    res.json(analytics);
  } catch (error: any) {
    console.error('Error fetching video analytics:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch video analytics' });
  }
});

export default router;
