import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const testVideoComponentsRouter = express.Router();

// Mock Cloudinary config (replace with your actual Cloudinary credentials if available)
const CLOUDINARY_CLOUD_NAME = 'your-cloud-name'; // Use your actual cloud name if available
const CLOUDINARY_API_KEY = 'your-api-key'; // Use your actual API key if available
const CLOUDINARY_API_SECRET = 'your-api-secret'; // Use your actual API secret if available

// Generate Cloudinary upload parameters without database dependency
testVideoComponentsRouter.get('/upload-params', (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Generate signature for Cloudinary
    const signature = crypto.createHash('sha1')
      .update(`timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
      .digest('hex');
    
    // Return upload parameters for direct-to-Cloudinary upload
    res.json({
      timestamp,
      signature,
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      folder: 'test-uploads'
    });
  } catch (error) {
    console.error('Error generating upload parameters:', error);
    res.status(500).json({ error: 'Failed to generate upload parameters' });
  }
});

// Mock endpoint for tracking video analytics
testVideoComponentsRouter.post('/track-video', (req, res) => {
  try {
    const { 
      activity_type, 
      video_id, 
      position, 
      duration, 
      device_info, 
      metadata 
    } = req.body;
    
    // Log the analytics data (would normally be saved to database)
    console.log('Video analytics tracked:', {
      id: uuidv4(),
      activity_type,
      video_id,
      position,
      duration,
      device_info,
      metadata,
      created_at: new Date().toISOString()
    });
    
    // Return success response
    res.json({ 
      success: true, 
      message: 'Analytics event recorded (test mode)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error tracking video activity:', error);
    res.status(500).json({ error: 'Failed to track video activity' });
  }
});

export default testVideoComponentsRouter;
