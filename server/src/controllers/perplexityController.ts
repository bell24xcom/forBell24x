import { Request, Response } from 'express';
import PerplexityService from '../services/perplexityService';

// Define types for our request bodies
type ChatRequest = {
  message: string;
  systemMessage?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

type ConversationRequest = {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

class PerplexityController {
  private service: ReturnType<typeof PerplexityService.getInstance>;

  constructor() {
    this.service = PerplexityService.getInstance();
    this.chat = this.chat.bind(this);
    this.conversation = this.conversation.bind(this);
    this.healthCheck = this.healthCheck.bind(this);
  }

  /**
   * Health check endpoint
   */
  public async healthCheck(_req: Request, res: Response) {
    try {
      const isHealthy = await this.service.testConnection();
      return res.status(200).json({
        status: 'success',
        data: {
          service: 'Perplexity AI',
          status: isHealthy ? 'operational' : 'degraded',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Health check failed:', error);
      return res.status(503).json({
        status: 'error',
        message: 'Service unavailable',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle single chat messages
   */
  public async chat(req: Request<{}, {}, ChatRequest>, res: Response) {
    try {
      const { message, systemMessage, model, temperature, maxTokens } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Message is required',
        });
      }

      const response = await this.service.getChatResponse(
        message,
        systemMessage,
        model,
        temperature,
        maxTokens
      );

      return res.status(200).json({
        status: 'success',
        data: {
          response,
          model: model || 'sonar',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Chat error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process chat request',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle conversation with context/memory
   */
  public async conversation(
    req: Request<{}, {}, ConversationRequest>,
    res: Response
  ) {
    try {
      const { messages, model, temperature, maxTokens } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Messages array is required and cannot be empty',
        });
      }

      const response = await this.service.getConversationResponse(
        messages,
        model,
        temperature,
        maxTokens
      );

      return res.status(200).json({
        status: 'success',
        data: {
          response,
          model: model || 'sonar',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Conversation error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process conversation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new PerplexityController();
