import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import perplexityController from '../controllers/perplexityController';

const router = Router();

// Health check endpoint
router.get('/health', perplexityController.healthCheck);

// Chat endpoint with validation
router.post(
  '/chat',
  [
    body('message').isString().trim().notEmpty().withMessage('Message is required'),
    body('systemMessage').optional().isString().trim(),
    body('model').optional().isString().trim(),
    body('temperature').optional().isFloat({ min: 0, max: 2 }),
    body('maxTokens').optional().isInt({ min: 1 }),
    validateRequest,
  ],
  perplexityController.chat
);

// Conversation endpoint with validation
router.post(
  '/conversation',
  [
    body('messages')
      .isArray({ min: 1 })
      .withMessage('Messages array is required and cannot be empty'),
    body('messages.*.role')
      .isIn(['user', 'assistant', 'system'])
      .withMessage('Invalid role. Must be one of: user, assistant, system'),
    body('messages.*.content')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Message content is required'),
    body('model').optional().isString().trim(),
    body('temperature').optional().isFloat({ min: 0, max: 2 }),
    body('maxTokens').optional().isInt({ min: 1 }),
    validateRequest,
  ],
  perplexityController.conversation
);

export default router;
