import axios from 'axios';
import { logger } from '../../utils/logger';
import { redisService } from '../cache/RedisService';

interface Template {
  name: string;
  language: string;
  category: string;
  components: TemplateComponent[];
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  buttons?: TemplateButton[];
}

interface TemplateButton {
  type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
  text: string;
  url?: string;
  phone_number?: string;
}

export class TemplateManager {
  private baseUrl: string;
  private apiKey: string;
  private cacheKey = 'whatsapp:templates';

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async createTemplate(template: Template): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/message_templates`,
        {
          name: template.name,
          language: template.language,
          category: template.category,
          components: template.components
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Cache the template
      await this.cacheTemplate(template);

      logger.info('Template created successfully', { templateName: template.name });
    } catch (error) {
      logger.error('Error creating template', { error, templateName: template.name });
      throw error;
    }
  }

  async getTemplates(): Promise<Template[]> {
    try {
      // Try to get from cache first
      const cachedTemplates = await redisService.get<Template[]>(this.cacheKey);
      if (cachedTemplates) {
        return cachedTemplates;
      }

      // Fetch from API
      const response = await axios.get(
        `${this.baseUrl}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const templates = response.data.data;
      
      // Cache the templates
      await redisService.set(this.cacheKey, templates, 3600); // Cache for 1 hour

      return templates;
    } catch (error) {
      logger.error('Error getting templates', { error });
      throw error;
    }
  }

  async getTemplate(name: string): Promise<Template | null> {
    try {
      const templates = await this.getTemplates();
      return templates.find(t => t.name === name) || null;
    } catch (error) {
      logger.error('Error getting template', { error, templateName: name });
      throw error;
    }
  }

  async deleteTemplate(name: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/message_templates/${name}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      // Remove from cache
      await this.removeTemplateFromCache(name);

      logger.info('Template deleted successfully', { templateName: name });
    } catch (error) {
      logger.error('Error deleting template', { error, templateName: name });
      throw error;
    }
  }

  async updateTemplate(name: string, template: Partial<Template>): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/message_templates/${name}`,
        template,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update cache
      await this.updateTemplateInCache(name, template);

      logger.info('Template updated successfully', { templateName: name });
    } catch (error) {
      logger.error('Error updating template', { error, templateName: name });
      throw error;
    }
  }

  private async cacheTemplate(template: Template): Promise<void> {
    try {
      const templates = await this.getTemplates();
      const existingIndex = templates.findIndex(t => t.name === template.name);
      
      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }

      await redisService.set(this.cacheKey, templates, 3600);
    } catch (error) {
      logger.error('Error caching template', { error, templateName: template.name });
      throw error;
    }
  }

  private async removeTemplateFromCache(name: string): Promise<void> {
    try {
      const templates = await this.getTemplates();
      const filteredTemplates = templates.filter(t => t.name !== name);
      await redisService.set(this.cacheKey, filteredTemplates, 3600);
    } catch (error) {
      logger.error('Error removing template from cache', { error, templateName: name });
      throw error;
    }
  }

  private async updateTemplateInCache(name: string, updates: Partial<Template>): Promise<void> {
    try {
      const templates = await this.getTemplates();
      const templateIndex = templates.findIndex(t => t.name === name);
      
      if (templateIndex >= 0) {
        templates[templateIndex] = {
          ...templates[templateIndex],
          ...updates
        };
        await redisService.set(this.cacheKey, templates, 3600);
      }
    } catch (error) {
      logger.error('Error updating template in cache', { error, templateName: name });
      throw error;
    }
  }

  async validateTemplate(template: Template): Promise<boolean> {
    try {
      // Validate template name
      if (!template.name.match(/^[a-zA-Z0-9_]+$/)) {
        throw new Error('Template name can only contain letters, numbers, and underscores');
      }

      // Validate language code
      if (!template.language.match(/^[a-z]{2}_[A-Z]{2}$/)) {
        throw new Error('Invalid language code format (e.g., en_US)');
      }

      // Validate components
      if (!template.components || template.components.length === 0) {
        throw new Error('Template must have at least one component');
      }

      // Validate each component
      for (const component of template.components) {
        if (!this.validateComponent(component)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Error validating template', { error, templateName: template.name });
      return false;
    }
  }

  private validateComponent(component: TemplateComponent): boolean {
    try {
      // Validate component type
      if (!['HEADER', 'BODY', 'FOOTER', 'BUTTONS'].includes(component.type)) {
        throw new Error('Invalid component type');
      }

      // Validate format for media components
      if (component.type === 'HEADER' && component.format) {
        if (!['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format)) {
          throw new Error('Invalid component format');
        }
      }

      // Validate text for text components
      if (component.type !== 'BUTTONS' && !component.text) {
        throw new Error('Text components must have text content');
      }

      // Validate buttons
      if (component.type === 'BUTTONS' && component.buttons) {
        for (const button of component.buttons) {
          if (!this.validateButton(button)) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      logger.error('Error validating component', { error });
      return false;
    }
  }

  private validateButton(button: TemplateButton): boolean {
    try {
      // Validate button type
      if (!['URL', 'PHONE_NUMBER', 'QUICK_REPLY'].includes(button.type)) {
        throw new Error('Invalid button type');
      }

      // Validate button text
      if (!button.text || button.text.length > 20) {
        throw new Error('Button text must be between 1 and 20 characters');
      }

      // Validate URL for URL buttons
      if (button.type === 'URL' && !button.url) {
        throw new Error('URL buttons must have a URL');
      }

      // Validate phone number for phone number buttons
      if (button.type === 'PHONE_NUMBER' && !button.phone_number) {
        throw new Error('Phone number buttons must have a phone number');
      }

      return true;
    } catch (error) {
      logger.error('Error validating button', { error });
      return false;
    }
  }
} 