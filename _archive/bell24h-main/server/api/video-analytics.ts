import { Request, Response } from 'express';
import { storage } from '../storage';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

/**
 * Track video viewing and interaction analytics
 */
export async function trackVideoActivity(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { videoId, action, position, duration } = req.body;
    
    if (!videoId || !action) {
      return res.status(400).json({ error: 'VideoId and action are required' });
    }
    
    // Store video activity data
    await storage.trackVideoActivity({
      id: uuidv4(),
      video_id: videoId,
      user_id: req.user!.id,
      action, // play, pause, complete, progress_25, progress_50, progress_75
      position: position || 0,
      duration: duration || 0,
      device_info: req.headers['user-agent'] || '',
      ip_address: req.ip || '',
      created_at: new Date()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking video activity:', error);
    res.status(500).json({ error: 'Failed to track video activity' });
  }
}

/**
 * Get video analytics for a specific video
 */
export async function getVideoAnalytics(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const videoId = req.params.id;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }
    
    // Get summary analytics for the video
    const analytics = await storage.getVideoAnalytics(videoId);
    
    // Get view count
    const viewCount = await storage.getVideoViewCount(videoId);
    
    // Get engagement metrics
    const engagementMetrics = await storage.getVideoEngagementMetrics(videoId);
    
    // Get device breakdown
    const deviceBreakdown = await storage.getVideoDeviceBreakdown(videoId);
    
    res.json({
      analytics,
      viewCount,
      engagementMetrics,
      deviceBreakdown
    });
  } catch (error) {
    console.error('Error retrieving video analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve video analytics' });
  }
}

/**
 * Generate adaptive streaming formats for a video
 */
export async function generateAdaptiveStreaming(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    // Extract public ID from Cloudinary URL
    const publicId = extractPublicIdFromUrl(videoUrl);
    
    if (!publicId) {
      return res.status(400).json({ error: 'Invalid Cloudinary video URL' });
    }
    
    // Create HLS and DASH streaming profiles
    const hlsUrl = await createStreamingProfile(publicId, 'hls_1080p');
    const dashUrl = await createStreamingProfile(publicId, 'dash_1080p');
    
    // Store the streaming URLs in the database
    await storage.updateVideoStreaming(publicId, {
      hls_url: hlsUrl,
      dash_url: dashUrl,
      updated_at: new Date()
    });
    
    res.json({
      success: true,
      adaptiveStreaming: {
        hls: hlsUrl,
        dash: dashUrl
      },
      publicId
    });
  } catch (error) {
    console.error('Error generating adaptive streaming:', error);
    res.status(500).json({ error: 'Failed to generate adaptive streaming' });
  }
}

/**
 * Generate a thumbnail at a specific timestamp
 */
export async function generateThumbnail(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { videoUrl, timestamp = 0 } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    // Extract public ID from Cloudinary URL
    const publicId = extractPublicIdFromUrl(videoUrl);
    
    if (!publicId) {
      return res.status(400).json({ error: 'Invalid Cloudinary video URL' });
    }
    
    // Generate thumbnail with Cloudinary transformations
    const thumbnailUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        { start_offset: timestamp },
        { width: 640, crop: 'scale' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    res.json({
      success: true,
      thumbnailUrl,
      publicId,
      timestamp
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
}

/**
 * Helper function to extract public ID from Cloudinary URL
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+?)\.[a-zA-Z0-9]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

/**
 * Create a streaming profile for adaptive streaming
 */
async function createStreamingProfile(publicId: string, format: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.api.create_transformation(
      `${format}_${publicId}`,
      {
        streaming_profile: format,
        format: format === 'hls_1080p' ? 'm3u8' : 'mpd'
      },
      (error: any, result: any) => {
        if (error && error.http_code !== 409) { // 409 means already exists
          reject(error);
        } else {
          // Construct the URL for the streaming format
          const extension = format.startsWith('hls') ? 'm3u8' : 'mpd';
          const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/sp_${format}/${publicId}.${extension}`;
          resolve(url);
        }
      }
    );
  });
}

/**
 * Optimize a video with Cloudinary's AI-based compression
 */
export async function optimizeVideo(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { videoUrl, quality = 'auto' } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    // Extract public ID from Cloudinary URL
    const publicId = extractPublicIdFromUrl(videoUrl);
    
    if (!publicId) {
      return res.status(400).json({ error: 'Invalid Cloudinary video URL' });
    }
    
    // Generate optimized video with AI-based compression
    const optimizedUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        { quality: quality },
        { fetch_format: 'auto' }
      ]
    });
    
    res.json({
      success: true,
      optimizedUrl,
      publicId,
      quality
    });
  } catch (error) {
    console.error('Error optimizing video:', error);
    res.status(500).json({ error: 'Failed to optimize video' });
  }
}

/**
 * Check if a video is processable (not corrupted)
 */
export async function validateVideo(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    // Extract public ID from Cloudinary URL
    const publicId = extractPublicIdFromUrl(videoUrl);
    
    if (!publicId) {
      return res.status(400).json({ error: 'Invalid Cloudinary video URL' });
    }
    
    // Get the resource info from Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.api.resource(
        publicId, 
        { resource_type: 'video' },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    // Check if video is valid
    const isValid = !!(result as any).duration;
    
    res.json({
      success: true,
      isValid,
      details: result
    });
  } catch (error) {
    console.error('Error validating video:', error);
    res.status(500).json({ error: 'Failed to validate video' });
  }
}
