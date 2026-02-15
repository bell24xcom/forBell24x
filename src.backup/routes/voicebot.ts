import express from 'express';
import { VoiceBotService } from '../services/voicebot/VoiceBotService';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { logger } from '../utils/logger';
import { Conversation } from '../models/Conversation';

const router = express.Router();
const voicebotService = new VoiceBotService();

// Call routes
router.post(
  '/calls',
  auth,
  validateRequest({
    body: {
      type: 'object',
      required: ['phoneNumber'],
      properties: {
        phoneNumber: { type: 'string' },
        context: { type: 'object' }
      }
    }
  }),
  async (req, res) => {
    try {
      const { phoneNumber, context } = req.body;
      const callSession = await voicebotService.handleIncomingCall(phoneNumber, context);
      res.json(callSession);
    } catch (error) {
      logger.error('Error handling incoming call', { error });
      res.status(500).json({ error: 'Failed to handle call' });
    }
  }
);

router.post(
  '/calls/:sessionId/transfer',
  auth,
  validateRequest({
    body: {
      type: 'object',
      required: ['agentId'],
      properties: {
        agentId: { type: 'string' },
        reason: { type: 'string' }
      }
    }
  }),
  async (req, res) => {
    try {
      const { agentId, reason } = req.body;
      await voicebotService.transferCall(req.params.sessionId, agentId, reason);
      res.json({ message: 'Call transferred successfully' });
    } catch (error) {
      logger.error('Error transferring call', { error });
      res.status(500).json({ error: 'Failed to transfer call' });
    }
  }
);

router.post('/calls/:sessionId/end', auth, async (req, res) => {
  try {
    await voicebotService.endCall(req.params.sessionId);
    res.json({ message: 'Call ended successfully' });
  } catch (error) {
    logger.error('Error ending call', { error });
    res.status(500).json({ error: 'Failed to end call' });
  }
});

router.get('/calls/:sessionId/transcript', auth, async (req, res) => {
  try {
    const transcript = await voicebotService.getCallTranscript(req.params.sessionId);
    res.json(transcript);
  } catch (error) {
    logger.error('Error getting call transcript', { error });
    res.status(500).json({ error: 'Failed to get transcript' });
  }
});

// Voice command routes
router.post(
  '/commands',
  auth,
  validateRequest({
    body: {
      type: 'object',
      required: ['phrase', 'action'],
      properties: {
        phrase: { type: 'string' },
        action: { type: 'string' },
        parameters: { type: 'object' }
      }
    }
  }),
  async (req, res) => {
    try {
      const { phrase, action, parameters } = req.body;
      await voicebotService.addVoiceCommand(phrase, action, parameters);
      res.json({ message: 'Voice command added successfully' });
    } catch (error) {
      logger.error('Error adding voice command', { error });
      res.status(500).json({ error: 'Failed to add voice command' });
    }
  }
);

router.get('/commands', auth, async (req, res) => {
  try {
    const commands = await voicebotService.getVoiceCommands();
    res.json(commands);
  } catch (error) {
    logger.error('Error getting voice commands', { error });
    res.status(500).json({ error: 'Failed to get voice commands' });
  }
});

router.delete('/commands/:phrase', auth, async (req, res) => {
  try {
    await voicebotService.removeVoiceCommand(req.params.phrase);
    res.json({ message: 'Voice command removed successfully' });
  } catch (error) {
    logger.error('Error removing voice command', { error });
    res.status(500).json({ error: 'Failed to remove voice command' });
  }
});

// Voice settings routes
router.put(
  '/settings/voice',
  auth,
  validateRequest({
    body: {
      type: 'object',
      properties: {
        language: { type: 'string' },
        voice: { type: 'string' },
        speed: { type: 'number' },
        pitch: { type: 'number' }
      }
    }
  }),
  async (req, res) => {
    try {
      await voicebotService.updateVoiceSettings(req.body);
      res.json({ message: 'Voice settings updated successfully' });
    } catch (error) {
      logger.error('Error updating voice settings', { error });
      res.status(500).json({ error: 'Failed to update voice settings' });
    }
  }
);

router.get('/settings/voice', auth, async (req, res) => {
  try {
    const settings = await voicebotService.getVoiceSettings();
    res.json(settings);
  } catch (error) {
    logger.error('Error getting voice settings', { error });
    res.status(500).json({ error: 'Failed to get voice settings' });
  }
});

// Conversation routes
router.get('/conversations', auth, async (req, res) => {
  try {
    const { userId, status, limit = 10, offset = 0 } = req.query;
    const query: any = { channel: 'VOICEBOT' };
    
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

// Analytics routes
router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await voicebotService.analyzeCalls(
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