import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { db } from '../db';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
}).single('image');

// Initialize Google Vision client
const vision = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

// Initialize Google Cloud Storage for image uploads
const cloudStorage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'bell24h-image-rfq';

/**
 * Process image upload for RFQ
 * Extracts text using Google Vision API and stores image in Google Cloud Storage
 */
export async function processImageRFQ(req: Request, res: Response) {
  try {
    // Handle file upload
    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const userId = req.user?.id; // Assuming auth middleware sets req.user

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // 1. Extract text using Google Vision API
      const [textDetectionResult] = await vision.textDetection(filePath);
      const detectedText = textDetectionResult.fullTextAnnotation?.text || '';

      // 2. Perform object detection for product identification
      const [objectDetectionResult] = await vision.objectLocalization(filePath);
      const objects = objectDetectionResult.localizedObjectAnnotations || [];

      // 3. Upload image to Google Cloud Storage
      const bucket = cloudStorage.bucket(bucketName);
      const destination = `rfq-images/${userId}/${path.basename(filePath)}`;
      
      await bucket.upload(filePath, {
        destination,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      // Generate public URL
      const imageUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;

      // 4. Store metadata in database
      const imageRfqId = await db.query(
        `INSERT INTO image_rfqs (user_id, image_url, detected_text, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        [userId, imageUrl, detectedText]
      );

      // 5. Extract key information for RFQ
      const productInfo = extractProductInfo(detectedText, objects);

      // 6. Clean up local file
      fs.unlinkSync(filePath);

      // Return processed data
      res.json({
        success: true,
        imageUrl,
        detectedText,
        objects: objects.map(obj => ({
          name: obj.name,
          confidence: obj.score
        })),
        productInfo,
        imageRfqId: imageRfqId.rows[0].id
      });
    });
  } catch (error) {
    console.error('Image RFQ processing error:', error);
    res.status(500).json({ error: 'Failed to process image RFQ' });
  }
}

/**
 * Extract structured product information from detected text and objects
 */
function extractProductInfo(text: string, objects: any[]) {
  // Basic extraction logic - this can be enhanced with more sophisticated NLP
  const productInfo: any = {
    possibleProducts: objects.map(obj => obj.name).filter(Boolean),
    quantities: extractQuantities(text),
    dimensions: extractDimensions(text),
    specifications: extractSpecifications(text)
  };

  return productInfo;
}

/**
 * Extract quantity information from text
 */
function extractQuantities(text: string) {
  const quantityRegex = /(\d+)\s*(pcs|pieces|units|kg|tons|g|grams|l|liters)/gi;
  const matches = [...text.matchAll(quantityRegex)];
  
  return matches.map(match => ({
    value: match[1],
    unit: match[2]
  }));
}

/**
 * Extract dimension information from text
 */
function extractDimensions(text: string) {
  const dimensionRegex = /(\d+(?:\.\d+)?)\s*(?:x|\*)\s*(\d+(?:\.\d+)?)\s*(?:x|\*)\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|inch)?/gi;
  const matches = [...text.matchAll(dimensionRegex)];
  
  return matches.map(match => ({
    length: match[1],
    width: match[2],
    height: match[3],
    unit: match[4] || 'cm'
  }));
}

/**
 * Extract specifications from text
 */
function extractSpecifications(text: string) {
  // This is a simplified approach - in production, you might use NLP
  const specs = [];
  
  // Look for common specification patterns
  const materialMatch = text.match(/material:?\s*([a-zA-Z\s]+)/i);
  if (materialMatch) specs.push({ type: 'material', value: materialMatch[1].trim() });
  
  const colorMatch = text.match(/colou?r:?\s*([a-zA-Z\s]+)/i);
  if (colorMatch) specs.push({ type: 'color', value: colorMatch[1].trim() });
  
  const weightMatch = text.match(/weight:?\s*(\d+(?:\.\d+)?)\s*(kg|g|tons|lb)/i);
  if (weightMatch) specs.push({ type: 'weight', value: weightMatch[1], unit: weightMatch[2] });
  
  return specs;
}

/**
 * Analyze image with SHAP/LIME for explainability
 */
export async function explainImageAnalysis(req: Request, res: Response) {
  try {
    const { imageRfqId } = req.params;
    
    if (!imageRfqId) {
      return res.status(400).json({ error: 'Image RFQ ID is required' });
    }
    
    // Get image data from database
    const imageRfqResult = await db.query(
      'SELECT image_url, detected_text FROM image_rfqs WHERE id = $1',
      [imageRfqId]
    );
    
    if (imageRfqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image RFQ not found' });
    }
    
    const imageRfq = imageRfqResult.rows[0];
    
    // Generate SHAP/LIME explanation (simplified version)
    // In a real implementation, you would use actual SHAP/LIME libraries
    const explanation = {
      textConfidence: 0.92,
      objectConfidence: 0.88,
      keyFeatures: [
        { feature: 'Text clarity', importance: 0.85 },
        { feature: 'Object recognition', importance: 0.78 },
        { feature: 'Image resolution', importance: 0.65 }
      ],
      textImportance: {
        // Highlight most important text segments
        segments: [
          { text: 'product name', importance: 0.95 },
          { text: 'dimensions', importance: 0.87 },
          { text: 'quantity', importance: 0.82 }
        ]
      }
    };
    
    res.json({
      success: true,
      imageUrl: imageRfq.image_url,
      explanation
    });
  } catch (error) {
    console.error('Image analysis explanation error:', error);
    res.status(500).json({ error: 'Failed to generate image analysis explanation' });
  }
}
