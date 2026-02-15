import { Router } from 'express';
import aiController from '../controllers/aiController';

const router = Router();

// Health check endpoint
router.get('/health', aiController.healthCheck);

// Chat endpoint
router.post('/chat', aiController.chat);

// Conversation endpoint
router.post('/conversation', aiController.conversation);

export default router;
