import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Track a video view
 * This endpoint can be called without authentication for public videos
 */
export const trackVideoView = async (req: Request, res: Response) => {
  try {
    const { videoId, videoType, duration, deviceInfo, userLocation, userDemographics } = req.body;
    
    let analyticsId: string | null = null;
    
    // Find the associated video analytics
    if (videoType === 'rfq') {
      const rfq = await prisma.rFQ.findUnique({
        where: { id: videoId },
        select: { videoAnalytics: true }
      });
      analyticsId = rfq?.videoAnalytics?.id || null;
    } else if (videoType === 'productShowcase') {
      const showcase = await prisma.productShowcase.findUnique({
        where: { id: videoId },
        select: { videoAnalytics: true }
      });
      analyticsId = showcase?.videoAnalytics?.id || null;
    }
    
    if (!analyticsId) {
      return res.status(404).json({ message: 'Video analytics not found' });
    }
    
    // Update the analytics
    const analytics = await prisma.videoAnalytics.update({
      where: { id: analyticsId },
      data: {
        views: { increment: 1 },
        watchTime: { increment: duration || 0 },
        // Update demographics if provided
        ...(userDemographics && {
          viewerDemographics: {
            // Merge with existing demographics
            // This is a simplified approach; a real implementation would be more sophisticated
            set: userDemographics
          }
        })
      }
    });
    
    res.status(200).json({ success: true, analyticsId });
  } catch (error) {
    console.error('Error tracking video view:', error);
    res.status(500).json({ message: 'Failed to track video view', error });
  }
};

/**
 * Update video analytics (authenticated)
 */
export const updateVideoAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      views,
      watchTime,
      engagement,
      clickThroughRate,
      conversionRate,
      regionHeatmap,
      viewerDemographics
    } = req.body;
    
    // Verify user has permissions (would be more robust in production)
    const userId = req.user?.id;
    
    // Update analytics
    const analytics = await prisma.videoAnalytics.update({
      where: { id },
      data: {
        ...(views !== undefined && { views }),
        ...(watchTime !== undefined && { watchTime }),
        ...(engagement !== undefined && { engagement }),
        ...(clickThroughRate !== undefined && { clickThroughRate }),
        ...(conversionRate !== undefined && { conversionRate }),
        ...(regionHeatmap && { regionHeatmap: { set: regionHeatmap } }),
        ...(viewerDemographics && { viewerDemographics: { set: viewerDemographics } })
      }
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error updating video analytics:', error);
    res.status(500).json({ message: 'Failed to update video analytics', error });
  }
};

/**
 * Get video analytics for a specific video
 */
export const getVideoAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const analytics = await prisma.videoAnalytics.findUnique({
      where: { id }
    });
    
    if (!analytics) {
      return res.status(404).json({ message: 'Video analytics not found' });
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    res.status(500).json({ message: 'Failed to fetch video analytics', error });
  }
};

/**
 * Get aggregated analytics across all videos
 */
export const getAggregatedAnalytics = async (req: Request, res: Response) => {
  try {
    const { videoType = 'all', startDate, endDate, companyId } = req.query;
    
    // Build the where clause
    const where: any = {};
    
    // Filter by date if provided
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    // Filter by video type
    if (videoType === 'rfq') {
      where.rfqId = { not: null };
    } else if (videoType === 'productShowcase') {
      where.productShowcaseId = { not: null };
    }
    
    // Filter by company if provided
    // This is more complex and would require joins in a real implementation
    
    // Get analytics data
    const analytics = await prisma.videoAnalytics.findMany({
      where,
      include: {
        rfq: companyId ? {
          where: { companyId: companyId as string },
          select: { title: true, companyId: true }
        } : { select: { title: true, companyId: true } },
        productShowcase: companyId ? {
          where: { companyId: companyId as string },
          select: { title: true, companyId: true }
        } : { select: { title: true, companyId: true } }
      }
    });
    
    // Calculate aggregated metrics
    const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
    const totalWatchTime = analytics.reduce((sum, item) => sum + item.watchTime, 0);
    const avgEngagement = analytics.length > 0
      ? analytics.reduce((sum, item) => sum + item.engagement, 0) / analytics.length
      : 0;
    const avgClickThroughRate = analytics.length > 0
      ? analytics.reduce((sum, item) => sum + item.clickThroughRate, 0) / analytics.length
      : 0;
    const avgConversionRate = analytics.length > 0
      ? analytics.reduce((sum, item) => sum + item.conversionRate, 0) / analytics.length
      : 0;
    
    res.json({
      totalVideos: analytics.length,
      totalViews,
      totalWatchTime,
      avgEngagement,
      avgClickThroughRate,
      avgConversionRate,
      videoBreakdown: analytics.map(a => ({
        id: a.id,
        title: a.rfq?.title || a.productShowcase?.title || 'Unknown',
        type: a.rfqId ? 'RFQ' : 'Product Showcase',
        views: a.views,
        watchTime: a.watchTime,
        engagement: a.engagement
      }))
    });
  } catch (error) {
    console.error('Error fetching aggregated analytics:', error);
    res.status(500).json({ message: 'Failed to fetch aggregated analytics', error });
  }
};

/**
 * Get heatmap data for a specific video
 */
export const getVideoHeatmap = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const analytics = await prisma.videoAnalytics.findUnique({
      where: { id },
      select: { regionHeatmap: true }
    });
    
    if (!analytics) {
      return res.status(404).json({ message: 'Video analytics not found' });
    }
    
    res.json(analytics.regionHeatmap || {});
  } catch (error) {
    console.error('Error fetching video heatmap:', error);
    res.status(500).json({ message: 'Failed to fetch video heatmap', error });
  }
};

/**
 * Get demographic data for a specific video
 */
export const getVideoDemographics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const analytics = await prisma.videoAnalytics.findUnique({
      where: { id },
      select: { viewerDemographics: true }
    });
    
    if (!analytics) {
      return res.status(404).json({ message: 'Video analytics not found' });
    }
    
    res.json(analytics.viewerDemographics || {});
  } catch (error) {
    console.error('Error fetching video demographics:', error);
    res.status(500).json({ message: 'Failed to fetch video demographics', error });
  }
};
