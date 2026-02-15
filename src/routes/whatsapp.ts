import express from 'express';
import { WhatsAppService } from '../services/whatsapp/WhatsAppService';
import { TemplateManager } from '../services/whatsapp/TemplateManager';
import { MediaHandler } from '../services/whatsapp/MediaHandler';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { logger } from '../utils/logger';

const router = express.Router();
const whatsappService = new WhatsAppService(
  process.env.WHATSAPP_API_URL!,
  process.env.WHATSAPP_API_KEY!
);
const templateManager = new TemplateManager(
  process.env.WHATSAPP_API_URL!,
  process.env.WHATSAPP_API_KEY!
);
const mediaHandler = new MediaHandler(
  process.env.WHATSAPP_API_URL!,
  process.env.WHATSAPP_API_KEY!
);

// Message routes
router.post(
  '/messages',
  auth,
  validateRequest({
    body: {
      type: 'object',
      required: ['to', 'type'],
      properties: {
        to: { type: 'string' },
        type: { type: 'string', enum: ['TEXT', 'TEMPLATE', 'MEDIA'] },
        content: { type: 'string' },
        template: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            language: { type: 'string' },
            components: { type: 'array' }
          }
        },
        media: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['IMAGE', 'VIDEO', 'DOCUMENT'] },
            url: { type: 'string' }
          }
        }
      }
    }
  }),
  async (req, res) => {
    try {
      const { to, type, content, template, media } = req.body;
      let response;

      switch (type) {
        case 'TEXT':
          response = await whatsappService.sendMessage(to, content);
          break;
        case 'TEMPLATE':
          response = await whatsappService.sendTemplateMessage(to, template);
          break;
        case 'MEDIA':
          response = await whatsappService.sendMediaMessage(to, media);
          break;
        default:
          throw new Error('Invalid message type');
      }

      res.json(response);
    } catch (error) {
      logger.error('Error sending WhatsApp message', { error });
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// Template routes
router.post(
  '/templates',
  auth,
  validateRequest({
    body: {
      type: 'object',
      required: ['name', 'language', 'category', 'components'],
      properties: {
        name: { type: 'string' },
        language: { type: 'string' },
        category: { type: 'string' },
        components: { type: 'array' }
      }
    }
  }),
  async (req, res) => {
    try {
      const template = req.body;
      const isValid = await templateManager.validateTemplate(template);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid template' });
      }

      await templateManager.createTemplate(template);
      res.json({ message: 'Template created successfully' });
    } catch (error) {
      logger.error('Error creating template', { error });
      res.status(500).json({ error: 'Failed to create template' });
    }
  }
);

router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await templateManager.getTemplates();
    res.json(templates);
  } catch (error) {
    logger.error('Error getting templates', { error });
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

router.delete('/templates/:name', auth, async (req, res) => {
  try {
    await templateManager.deleteTemplate(req.params.name);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    logger.error('Error deleting template', { error });
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Media routes
router.post(
  '/media',
  auth,
  validateRequest({
    body: {
      type: 'object',
      required: ['type', 'file'],
      properties: {
        type: { type: 'string', enum: ['IMAGE', 'VIDEO', 'DOCUMENT'] },
        file: { type: 'string' }
      }
    }
  }),
  async (req, res) => {
    try {
      const { type, file } = req.body;
      const mediaId = await mediaHandler.uploadMedia(type, file);
      res.json({ mediaId });
    } catch (error) {
      logger.error('Error uploading media', { error });
      res.status(500).json({ error: 'Failed to upload media' });
    }
  }
);

router.get('/media/:mediaId', auth, async (req, res) => {
  try {
    const media = await mediaHandler.downloadMedia(req.params.mediaId);
    res.json(media);
  } catch (error) {
    logger.error('Error downloading media', { error });
    res.status(500).json({ error: 'Failed to download media' });
  }
});

router.delete('/media/:mediaId', auth, async (req, res) => {
  try {
    await mediaHandler.deleteMedia(req.params.mediaId);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    logger.error('Error deleting media', { error });
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Webhook route
router.post('/webhook', async (req, res) => {
  try {
    const { body } = req;
    
    // Verify webhook signature
    const signature = req.headers['x-whatsapp-signature'];
    if (!whatsappService.verifyWebhookSignature(signature, body)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process webhook
    await whatsappService.processWebhook(body);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Error processing webhook', { error });
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default router; 