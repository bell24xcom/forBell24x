import express from 'express';
import { videoUpload, uploadVideoWithPrivacy, deleteVideo } from '../utils/cloudinary';
import { authenticate } from '../middleware/authenticate';
import { VideoRFQModel } from '../models/VideoRFQ';
import { RFQProcessingService } from '../services/rfq-processing';

const router = express.Router();

// Upload video RFQ
router.post('/upload', 
  authenticate,
  videoUpload.single('video'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      // Upload video with privacy masking if requested
      const videoData = await uploadVideoWithPrivacy(req.file, {
        maskBuyerDetails: req.body.maskBuyerDetails === 'true',
        maskSensitiveInfo: req.body.maskSensitiveInfo === 'true'
      });

      // Create Video RFQ record
      const videoRFQ = await VideoRFQModel.create({
        userId: req.user.id,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        requirements: JSON.parse(req.body.requirements || '[]'),
        budget: parseFloat(req.body.budget),
        videoPublicId: videoData.publicId,
        videoUrl: videoData.url,
        videoDuration: videoData.duration,
        status: 'processing'
      });

      // Start RFQ processing
      RFQProcessingService.processVideoRFQ(videoRFQ.id);

      res.status(201).json(videoRFQ);
    } catch (error) {
      console.error('Error handling video RFQ upload:', error);
      res.status(500).json({ error: 'Failed to process video RFQ' });
    }
});

// Get video RFQ details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const videoRFQ = await VideoRFQModel.findById(req.params.id)
      .populate('matches')
      .populate('buyer', 'name company');

    if (!videoRFQ) {
      return res.status(404).json({ error: 'Video RFQ not found' });
    }

    // Check access permission
    if (videoRFQ.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(videoRFQ);
  } catch (error) {
    console.error('Error fetching video RFQ:', error);
    res.status(500).json({ error: 'Failed to fetch video RFQ' });
  }
});

// Update video RFQ
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const videoRFQ = await VideoRFQModel.findById(req.params.id);

    if (!videoRFQ) {
      return res.status(404).json({ error: 'Video RFQ not found' });
    }

    // Check ownership
    if (videoRFQ.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'requirements', 'budget', 'status'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(videoRFQ, updates);
    await videoRFQ.save();

    res.json(videoRFQ);
  } catch (error) {
    console.error('Error updating video RFQ:', error);
    res.status(500).json({ error: 'Failed to update video RFQ' });
  }
});

// Delete video RFQ
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const videoRFQ = await VideoRFQModel.findById(req.params.id);

    if (!videoRFQ) {
      return res.status(404).json({ error: 'Video RFQ not found' });
    }

    // Check ownership
    if (videoRFQ.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete video from Cloudinary
    if (videoRFQ.videoPublicId) {
      await deleteVideo(videoRFQ.videoPublicId);
    }

    // Delete RFQ record
    await videoRFQ.remove();

    res.json({ message: 'Video RFQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting video RFQ:', error);
    res.status(500).json({ error: 'Failed to delete video RFQ' });
  }
});

// List user's video RFQs
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const query = {
      userId: req.user.id,
      ...(status && { status })
    };

    const videoRFQs = await VideoRFQModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('matches', 'supplier rating price');

    const total = await VideoRFQModel.countDocuments(query);

    res.json({
      videoRFQs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error listing video RFQs:', error);
    res.status(500).json({ error: 'Failed to list video RFQs' });
  }
});

export default router; 