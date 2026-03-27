import { Request, Response } from 'express';
import { storage } from '../storage';
import { v2 as cloudinary } from 'cloudinary';
import { rfqs } from '../../shared/schema';

// Express namespace is extended in types/express.d.ts

/**
 * Handle video RFQ submission with Cloudinary upload
 */
export async function handleVideoRFQ(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get data from request
    const { videoUrl, description, title, category, budget } = req.body;

    if (!videoUrl || !description) {
      return res.status(400).json({ error: 'Video URL and description are required' });
    }

    // Create RFQ record with video URL
    const rfqData = {
      title: title || 'Video RFQ',
      description,
      category: category || 'general',
      quantity: 1, // Default quantity for video RFQs
      budget: budget ? Number(budget) : undefined,
      video_url: videoUrl,
      user_id: req.user!.id,
      status: 'draft' as const 
    };

    // Save to database
    const rfq = await storage.createRFQ(rfqData);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Video RFQ created successfully',
      rfq
    });
  } catch (error) {
    console.error('Error handling video RFQ:', error);
    res.status(500).json({ 
      error: 'Failed to process video RFQ',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Process direct video upload (server-side upload)
 */
export async function uploadVideoToCloudinary(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    // Get video file from request
    const videoFile = req.files?.video;
    
    if (!videoFile || (!videoFile.path && !videoFile.tempFilePath)) {
      return res.status(400).json({ error: 'Invalid video file format' });
    }
    
    // Configure Cloudinary if not already configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ error: 'Cloudinary not configured' });
    }

    // Upload video to Cloudinary with null safety
    const filePath = videoFile.path || videoFile.tempFilePath;
    if (!filePath) {
      return res.status(400).json({ error: 'No valid file path found' });
    }
    
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'bell24h/rfq_videos'
    });

    // Return upload result
    res.json({
      success: true,
      videoUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    res.status(500).json({ 
      error: 'Failed to upload video', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get signed upload parameters for client-side upload
 */
export function getSignedUploadParams(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Generate signature and parameters
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      folder: 'bell24h/rfq_videos',
      resource_type: 'video'
    };
    
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET || ''
    );
    
    res.json({
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
      resource_type: params.resource_type,
      timestamp: params.timestamp
    });
  } catch (error) {
    console.error('Error generating signed upload params:', error);
    res.status(500).json({ error: 'Failed to generate upload parameters' });
  }
}
