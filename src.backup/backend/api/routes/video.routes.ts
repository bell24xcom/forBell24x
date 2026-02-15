import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { validateCreateVideo, validateVideoAnalysis } from '../validators/video.validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();
const controller = new VideoController();

// Read routes (with auth)
router.get('/', authMiddleware, (req, res) => controller.getAllVideos(req, res));
router.get('/:id', authMiddleware, (req, res) => controller.getVideo(req, res));
router.get('/:id/stream', authMiddleware, (req, res) => controller.streamVideo(req, res));
router.get('/:id/thumbnail', authMiddleware, (req, res) => controller.getVideoThumbnail(req, res));
router.get('/:id/transcode/status', authMiddleware, (req, res) => controller.getTranscodeStatus(req, res));
router.get('/:id/analysis', authMiddleware, (req, res) => controller.getVideoAnalysis(req, res));
router.get('/:id/ai/results', authMiddleware, (req, res) => controller.getAIResults(req, res));
router.get('/:id/annotations', authMiddleware, (req, res) => controller.getVideoAnnotations(req, res));
router.get('/:id/captions', authMiddleware, (req, res) => controller.getVideoCaptions(req, res));
router.get('/:id/quality', authMiddleware, (req, res) => controller.getVideoQuality(req, res));
router.get('/formats/supported', authMiddleware, (req, res) => controller.getSupportedFormats(req, res));
router.get('/codecs/available', authMiddleware, (req, res) => controller.getAvailableCodecs(req, res));
router.get('/analytics/usage', authMiddleware, (req, res) => controller.getVideoUsageAnalytics(req, res));
router.get('/storage/status', authMiddleware, (req, res) => controller.getStorageStatus(req, res));
router.get('/batch/:batchId/status', authMiddleware, (req, res) => controller.getBatchStatus(req, res));

// Write routes (with auth)
router.post('/upload', authMiddleware, uploadMiddleware.single('video'), (req, res) => controller.uploadVideo(req, res));
router.post('/', authMiddleware, validateCreateVideo, (req, res) => controller.createVideo(req, res));
router.put('/:id', authMiddleware, validateCreateVideo, (req, res) => controller.updateVideo(req, res));
router.post('/:id/transcode', authMiddleware, (req, res) => controller.transcodeVideo(req, res));
router.post('/:id/analyze', authMiddleware, validateVideoAnalysis, (req, res) => controller.analyzeVideo(req, res));
router.post('/:id/ai/process', authMiddleware, (req, res) => controller.processVideoAI(req, res));
router.post('/:id/annotate', authMiddleware, (req, res) => controller.annotateVideo(req, res));
router.post('/:id/caption', authMiddleware, (req, res) => controller.generateCaptions(req, res));
router.post('/:id/compress', authMiddleware, (req, res) => controller.compressVideo(req, res));
router.post('/:id/watermark', authMiddleware, (req, res) => controller.addWatermark(req, res));
router.post('/:id/trim', authMiddleware, (req, res) => controller.trimVideo(req, res));

// Admin routes (with role-based access)
router.post('/batch/process', authMiddleware, roleMiddleware, (req, res) => controller.batchProcessVideos(req, res));

export default router; 