import { Request, Response } from 'express';
import PerplexityService from '../services/perplexityService';

class AIController {
  private perplexity: ReturnType<typeof PerplexityService.getInstance>;

  constructor() {
    this.perplexity = PerplexityService.getInstance();
    this.chat = this.chat.bind(this);
    this.conversation = this.conversation.bind(this);
    this.healthCheck = this.healthCheck.bind(this);
  }

  /**
   * Simple chat endpoint
   */
  public async chat(req: Request, res: Response) {
    try {
      const { message, systemMessage, model, temperature, maxTokens } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await this.perplexity.getChatResponse(
        message,
        systemMessage,
        model,
        temperature,
        maxTokens
      );

      res.json({ response });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Conversation endpoint for multi-turn dialogs
   */
  public async conversation(req: Request, res: Response) {
    try {
      const { messages, model, temperature, maxTokens } = req.body;
      
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const response = await this.perplexity.getConversationResponse(
        messages,
        model,
        temperature,
        maxTokens
      );

      res.json({ response });
    } catch (error) {
      console.error('Conversation error:', error);
      res.status(500).json({ 
        error: 'Failed to process conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Health check endpoint
   */
  public async healthCheck(_req: Request, res: Response) {
    try {
      const isHealthy = await this.perplexity.testConnection();
      res.json({ 
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({ 
        status: 'unhealthy',
        error: 'Service unavailable',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new AIController();
