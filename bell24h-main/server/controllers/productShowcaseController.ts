import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Create a new product showcase
 */
export const createProductShowcase = async (req: Request, res: Response) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, productId } = req.body;
    const userId = req.user?.id;
    
    // Get user's company ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create product showcase
    const productShowcase = await prisma.productShowcase.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        product: { connect: { id: productId } },
        company: { connect: { id: user.companyId } },
        videoAnalytics: {
          create: {
            views: 0,
            watchTime: 0,
            engagement: 0,
            clickThroughRate: 0,
            conversionRate: 0,
            regionHeatmap: {},
            viewerDemographics: {}
          }
        }
      },
      include: {
        videoAnalytics: true
      }
    });
    
    res.status(201).json(productShowcase);
  } catch (error) {
    console.error('Error creating product showcase:', error);
    res.status(500).json({ message: 'Failed to create product showcase', error });
  }
};

/**
 * Get a product showcase by ID
 */
export const getProductShowcase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const productShowcase = await prisma.productShowcase.findUnique({
      where: { id },
      include: {
        videoAnalytics: true,
        product: true
      }
    });
    
    if (!productShowcase) {
      return res.status(404).json({ message: 'Product showcase not found' });
    }
    
    res.json(productShowcase);
  } catch (error) {
    console.error('Error fetching product showcase:', error);
    res.status(500).json({ message: 'Failed to fetch product showcase', error });
  }
};

/**
 * Update a product showcase
 */
export const updateProductShowcase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, thumbnailUrl } = req.body;
    const userId = req.user?.id;
    
    // Get user's company ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify ownership
    const existingShowcase = await prisma.productShowcase.findFirst({
      where: {
        id,
        companyId: user.companyId
      }
    });
    
    if (!existingShowcase) {
      return res.status(403).json({ message: 'Unauthorized to update this showcase' });
    }
    
    const updatedShowcase = await prisma.productShowcase.update({
      where: { id },
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl
      },
      include: {
        videoAnalytics: true
      }
    });
    
    res.json(updatedShowcase);
  } catch (error) {
    console.error('Error updating product showcase:', error);
    res.status(500).json({ message: 'Failed to update product showcase', error });
  }
};

/**
 * Delete a product showcase
 */
export const deleteProductShowcase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Get user's company ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify ownership
    const existingShowcase = await prisma.productShowcase.findFirst({
      where: {
        id,
        companyId: user.companyId
      }
    });
    
    if (!existingShowcase) {
      return res.status(403).json({ message: 'Unauthorized to delete this showcase' });
    }
    
    // Delete associated video analytics
    await prisma.videoAnalytics.deleteMany({
      where: { productShowcaseId: id }
    });
    
    // Delete the showcase
    await prisma.productShowcase.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product showcase:', error);
    res.status(500).json({ message: 'Failed to delete product showcase', error });
  }
};

/**
 * List product showcases with filtering
 */
export const listProductShowcases = async (req: Request, res: Response) => {
  try {
    const { productId, companyId, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {};
    
    if (productId) {
      where.productId = productId as string;
    }
    
    if (companyId) {
      where.companyId = companyId as string;
    }
    
    const [showcases, totalCount] = await Promise.all([
      prisma.productShowcase.findMany({
        where,
        include: {
          videoAnalytics: true,
          product: true
        },
        skip,
        take: parseInt(limit as string),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.productShowcase.count({ where })
    ]);
    
    res.json({
      data: showcases,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error listing product showcases:', error);
    res.status(500).json({ message: 'Failed to list product showcases', error });
  }
};

/**
 * Get analytics for a product showcase
 */
export const getProductShowcaseAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const analytics = await prisma.videoAnalytics.findUnique({
      where: { productShowcaseId: id }
    });
    
    if (!analytics) {
      return res.status(404).json({ message: 'Analytics not found for this showcase' });
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching showcase analytics:', error);
    res.status(500).json({ message: 'Failed to fetch showcase analytics', error });
  }
};
