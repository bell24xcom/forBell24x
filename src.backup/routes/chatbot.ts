import express from 'express';
import { ChatBotService } from '../services/chatbot/ChatBotService';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { logger } from '../utils/logger';
import { Conversation } from '../models/Conversation';

const router = express.Router();
const chatbotService = new ChatBotService();

// Message routes
router.post(
  '/messages',
  auth,
  validateRequest({
    body: {
      type: 'object',
      required: ['userId', 'message'],
      properties: {
        userId: { type: 'string' },
        message: { type: 'string' },
        context: { type: 'object' }
      }
    }
  }),
  async (req, res) => {
    try {
      const { userId, message, context } = req.body;

      // Get or create conversation
      let conversation = await Conversation.findOneActive(userId, 'CHATBOT');
      if (!conversation) {
        conversation = await Conversation.create({
          userId,
          channel: 'CHATBOT',
          messages: []
        });
      }

      // Process message
      const response = await chatbotService.processMessage(message, context);
      
      // Add messages to conversation
      await conversation.addMessage({
        type: 'USER',
        content: message,
        metadata: {
          intent: response.intent,
          confidence: response.confidence,
          entities: response.entities,
          sentiment: response.sentiment
        }
      });

      await conversation.addMessage({
        type: 'BOT',
        content: response.message,
        metadata: {
          intent: response.intent,
          confidence: response.confidence
        }
      });

      res.json(response);
    } catch (error) {
      logger.error('Error processing chatbot message', { error });
      res.status(500).json({ error: 'Failed to process message' });
    }
  }
);

// Intent routes
router.post(
  '/intents',
  auth,
  validateRequest({
    body: {
      type: 'object',
      required: ['name', 'examples', 'responses'],
      properties: {
        name: { type: 'string' },
        examples: { type: 'array', items: { type: 'string' } },
        responses: { type: 'array', items: { type: 'string' } }
      }
    }
  }),
  async (req, res) => {
    try {
      const { name, examples, responses } = req.body;
      await chatbotService.trainIntent(name, examples, responses);
      res.json({ message: 'Intent trained successfully' });
    } catch (error) {
      logger.error('Error training intent', { error });
      res.status(500).json({ error: 'Failed to train intent' });
    }
  }
);

router.get('/intents', auth, async (req, res) => {
  try {
    const intents = await chatbotService.getIntents();
    res.json(intents);
  } catch (error) {
    logger.error('Error getting intents', { error });
    res.status(500).json({ error: 'Failed to get intents' });
  }
});

router.delete('/intents/:name', auth, async (req, res) => {
  try {
    await chatbotService.deleteIntent(req.params.name);
    res.json({ message: 'Intent deleted successfully' });
  } catch (error) {
    logger.error('Error deleting intent', { error });
    res.status(500).json({ error: 'Failed to delete intent' });
  }
});

// Conversation routes
router.get('/conversations', auth, async (req, res) => {
  try {
    const { userId, status, limit = 10, offset = 0 } = req.query;
    const query: any = { channel: 'CHATBOT' };
    
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await Conversation.countDocuments(query);

    res.json({
      conversations,
      total,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('Error getting conversations', { error });
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    logger.error('Error getting conversation', { error });
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

router.post(
  '/conversations/:id/close',
  auth,
  validateRequest({
    body: {
      type: 'object',
      properties: {
        summary: { type: 'string' }
      }
    }
  }),
  async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      await conversation.close(req.body.summary);
      res.json({ message: 'Conversation closed successfully' });
    } catch (error) {
      logger.error('Error closing conversation', { error });
      res.status(500).json({ error: 'Failed to close conversation' });
    }
  }
);

router.post(
  '/conversations/:id/feedback',
  auth,
  validateRequest({
    body: {
      type: 'object',
      required: ['rating'],
      properties: {
        rating: { type: 'number', minimum: 1, maximum: 5 },
        comment: { type: 'string' }
      }
    }
  }),
  async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      await conversation.addFeedback(req.body.rating, req.body.comment);
      res.json({ message: 'Feedback added successfully' });
    } catch (error) {
      logger.error('Error adding feedback', { error });
      res.status(500).json({ error: 'Failed to add feedback' });
    }
  }
);

// Analytics routes
router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await chatbotService.analyzeConversations(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(analytics);
  } catch (error) {
    logger.error('Error getting analytics', { error });
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router; 