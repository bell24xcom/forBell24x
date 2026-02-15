import { Request, Response } from 'express';
import * as storage from '../storage';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import * as ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

// Constants for video processing
const TEMP_DIR = path.join(process.cwd(), 'tmp');
const MAX_VIDEO_DURATION = 600; // 10 minutes in seconds
const DEFAULT_THUMBNAIL_TIME = '00:00:05'; // 5 seconds into video
const VIDEO_QUALITIES = {
  mobile: { bitrate: '800k', resolution: '640x360' },
  standard: { bitrate: '1500k', resolution: '1280x720' },
  high: { bitrate: '3000k', resolution: '1920x1080' }
};

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Process video analytics callback from Cloudinary
 */
export async function handleVideoAnalytics(req: Request, res: Response) {
  try {
    const { public_id, duration, width, height, format, bytes, tags } = req.body;
    
    if (!public_id) {
      return res.status(400).json({ error: 'Missing public_id parameter' });
    }
    
    // Store analytics data
    await storage.storeVideoAnalytics({
      public_id,
      duration: duration || 0,
      width: width || 0,
      height: height || 0,
      format: format || 'unknown',
      size_bytes: bytes || 0,
      tags: tags || [],
      created_at: new Date()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing video analytics:', error);
    res.status(500).json({ 
      error: 'Failed to process video analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Utility function to generate optimized upload parameters
 * Can be used across different features like Video RFQ and Product Showcase
 */
export async function getOptimizedUploadParams(userId: string, resourceType: 'rfq' | 'product_showcase' | 'marketing') {
  // Enhanced parameters for video optimization
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folderPrefix = resourceType === 'rfq' ? 'rfq_videos' : 
                       resourceType === 'product_showcase' ? 'product_showcases' : 'marketing';
  const uniqueFolder = `bell24h/${folderPrefix}/${userId}/${timestamp}`;
  
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'bell24h_videos';
  
  const params = {
    timestamp,
    folder: uniqueFolder,
    resource_type: 'video',
    upload_preset: uploadPreset,
    // Optimization parameters
    eager: 'q_auto:good,f_auto',
    eager_async: true,
    eager_notification_url: `${process.env.API_URL}/api/video-analytics/callback`,
    // Auto-tagging and moderation
    auto_tagging: 0.6, // Confidence threshold
    moderation: 'aws_rek',
    // Analytics
    analytics: true,
    notification_url: `${process.env.API_URL}/api/video-analytics/notification`
  };
  
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET || ''
  );
  
  return {
    ...params,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}

/**
 * Generate optimized signed upload parameters for client-side upload
 * Route handler for the API endpoint
 */
export function getOptimizedUploadParamsHandler(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const resourceType = (req.query.resourceType as 'rfq' | 'product_showcase' | 'marketing') || 'rfq';
    
    getOptimizedUploadParams(req.user.id, resourceType)
      .then(params => {
        res.json(params);
      })
      .catch(error => {
        console.error('Error generating optimized upload params:', error);
        res.status(500).json({ error: 'Failed to generate upload parameters' });
      });
  } catch (error) {
    console.error('Error generating optimized upload params:', error);
    res.status(500).json({ error: 'Failed to generate upload parameters' });
  }
}

/**
 * Generate a thumbnail at a specific timestamp
 */
export async function generateCustomThumbnail(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { videoUrl, timestamp = DEFAULT_THUMBNAIL_TIME } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    // Extract public_id from Cloudinary URL
    const urlParts = videoUrl.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    
    // Generate thumbnail with transformation
    const thumbnailOptions = {
      resource_type: 'video',
      transformation: [
        { width: 640, crop: 'scale' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
        { start_offset: timestamp }
      ]
    };
    
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.api.resource(publicId, thumbnailOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    res.json({
      success: true,
      thumbnailUrl: result.secure_url
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
}

/**
 * Track video view/activity
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
      video_id: videoId,
      user_id: req.user!.id,
      action, // play, pause, complete, etc.
      position: position || 0,
      duration: duration || 0,
      created_at: new Date()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking video activity:', error);
    res.status(500).json({ error: 'Failed to track video activity' });
  }
}

/**
 * Process uploaded video - analyze, optimize, generate adaptive streams
 */
export async function processVideo(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    // Extract public_id from Cloudinary URL
    const publicId = extractPublicId(videoUrl);
    
    // Create adaptive streaming formats (HLS and DASH)
    const adaptiveFormats = await createAdaptiveStreamingFormats(publicId);
    
    // Get video analytics
    const videoInfo = await getVideoInfo(publicId);
    
    // Generate preview GIF for enhanced sharing
    const previewGif = await generatePreviewGif(publicId);
    
    res.json({
      success: true,
      adaptiveStreaming: adaptiveFormats,
      videoInfo,
      previewGif
    });
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: 'Failed to process video' });
  }
}

/**
 * Helper function to extract public_id from Cloudinary URL
 */
function extractPublicId(url: string): string {
  const regex = /\/v\d+\/(.+?)\.(mp4|mov|avi|webm|mkv)/i;
  const match = url.match(regex);
  return match ? match[1] : '';
}

/**
 * Create adaptive streaming formats (HLS and DASH)
 */
async function createAdaptiveStreamingFormats(publicId: string) {
  // Generate adaptive streaming formats
  const hlsOptions = {
    streaming_profile: 'hls_1080p',
    format: 'm3u8'
  };
  
  const dashOptions = {
    streaming_profile: 'dash_1080p',
    format: 'mpd'
  };
  
  const [hlsResult, dashResult] = await Promise.all([
    new Promise<any>((resolve, reject) => {
      cloudinary.api.create_streaming_profile(publicId, hlsOptions, (error, result) => {
        if (error && error.http_code !== 409) reject(error); // 409 means already exists
        else resolve(result || { secure_url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${publicId}.m3u8` });
      });
    }),
    new Promise<any>((resolve, reject) => {
      cloudinary.api.create_streaming_profile(publicId, dashOptions, (error, result) => {
        if (error && error.http_code !== 409) reject(error); // 409 means already exists
        else resolve(result || { secure_url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${publicId}.mpd` });
      });
    })
  ]);
  
  return {
    hls: hlsResult.secure_url || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/sp_hls_1080p/${publicId}.m3u8`,
    dash: dashResult.secure_url || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/sp_dash_1080p/${publicId}.mpd`
  };
}

/**
 * Get video information from Cloudinary
 */
async function getVideoInfo(publicId: string) {
  return new Promise<any>((resolve, reject) => {
    cloudinary.api.resource(publicId, { resource_type: 'video' }, (error, result) => {
      if (error) reject(error);
      else resolve({
        duration: result.duration,
        format: result.format,
        width: result.width,
        height: result.height,
        bitrate: result.bit_rate,
        size: result.bytes,
        created_at: result.created_at
      });
    });
  });
}

/**
 * Generate a preview GIF for the video
 */
async function generatePreviewGif(publicId: string) {
  const transformation = [
    { width: 320, height: 240, crop: 'scale' },
    { delay: 200 },
    { effect: 'loop' },
    { start_offset: 0, end_offset: 3 } // 3 second preview
  ];
  
  return new Promise<string>((resolve) => {
    const gifUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      transformation,
      format: 'gif'
    });
    
    resolve(gifUrl);
  });
}

/**
 * Handle Cloudinary webhook notifications
 */
export function handleCloudinaryWebhook(req: Request, res: Response) {
  try {
    const notification = req.body;
    
    // Log the notification data
    console.log('Received Cloudinary notification:', JSON.stringify(notification));
    
    // For now, just acknowledge receipt
    res.status(200).send('OK');
    
    // TODO: Process webhook based on notification type
  } catch (error) {
    console.error('Error handling Cloudinary webhook:', error);
    res.status(200).send('OK'); // Always return 200 for webhooks
  }
}
