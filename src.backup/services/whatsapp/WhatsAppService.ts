import axios from 'axios';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { MediaHandler } from './MediaHandler';
import { TemplateManager } from './TemplateManager';
import { WebhookManager } from './WebhookManager';

interface WhatsAppConfig {
  apiKey: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookSecret: string;
}

interface MessageTemplate {
  name: string;
  language: string;
  components: any[];
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private mediaHandler: MediaHandler;
  private templateManager: TemplateManager;
  private webhookManager: WebhookManager;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    this.baseUrl = `https://graph.facebook.com/v17.0/${config.phoneNumberId}`;
    this.mediaHandler = new MediaHandler(this.baseUrl, config.apiKey);
    this.templateManager = new TemplateManager(this.baseUrl, config.apiKey);
    this.webhookManager = new WebhookManager(config.webhookSecret);
  }

  async sendTextMessage(to: string, text: string): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('WhatsApp message sent successfully', { to, messageId: response.data.messages[0].id });
    } catch (error) {
      logger.error('Error sending WhatsApp message', { error, to });
      throw error;
    }
  }

  async sendTemplateMessage(to: string, templateName: string, language: string, components: any[]): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
            components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('WhatsApp template message sent successfully', { to, templateName, messageId: response.data.messages[0].id });
    } catch (error) {
      logger.error('Error sending WhatsApp template message', { error, to, templateName });
      throw error;
    }
  }

  async sendMediaMessage(to: string, mediaUrl: string, type: 'image' | 'video' | 'document' | 'audio'): Promise<void> {
    try {
      const mediaId = await this.mediaHandler.uploadMedia(mediaUrl, type);
      
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type,
          [type]: { id: mediaId }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('WhatsApp media message sent successfully', { to, type, messageId: response.data.messages[0].id });
    } catch (error) {
      logger.error('Error sending WhatsApp media message', { error, to, type });
      throw error;
    }
  }

  async createTemplate(template: MessageTemplate): Promise<void> {
    try {
      await this.templateManager.createTemplate(template);
      logger.info('WhatsApp template created successfully', { templateName: template.name });
    } catch (error) {
      logger.error('Error creating WhatsApp template', { error, templateName: template.name });
      throw error;
    }
  }

  async deleteTemplate(templateName: string): Promise<void> {
    try {
      await this.templateManager.deleteTemplate(templateName);
      logger.info('WhatsApp template deleted successfully', { templateName });
    } catch (error) {
      logger.error('Error deleting WhatsApp template', { error, templateName });
      throw error;
    }
  }

  async getTemplates(): Promise<MessageTemplate[]> {
    try {
      const templates = await this.templateManager.getTemplates();
      logger.info('WhatsApp templates retrieved successfully');
      return templates;
    } catch (error) {
      logger.error('Error retrieving WhatsApp templates', { error });
      throw error;
    }
  }

  async setupWebhook(url: string): Promise<void> {
    try {
      await this.webhookManager.setupWebhook(url);
      logger.info('WhatsApp webhook setup successfully', { url });
    } catch (error) {
      logger.error('Error setting up WhatsApp webhook', { error, url });
      throw error;
    }
  }

  async verifyWebhook(token: string, challenge: string): Promise<string | null> {
    try {
      return await this.webhookManager.verifyWebhook(token, challenge);
    } catch (error) {
      logger.error('Error verifying WhatsApp webhook', { error });
      throw error;
    }
  }

  async handleWebhookEvent(payload: any): Promise<void> {
    try {
      await this.webhookManager.handleEvent(payload);
      logger.info('WhatsApp webhook event handled successfully', { eventType: payload.type });
    } catch (error) {
      logger.error('Error handling WhatsApp webhook event', { error, eventType: payload.type });
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService({
  apiKey: process.env.WHATSAPP_API_KEY || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || ''
}); 