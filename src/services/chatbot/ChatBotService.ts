import { OpenAI } from 'openai';
import { redisService } from '../cache/RedisService';
import { logger } from '../../utils/logger';
import { IntentRecognizer } from './IntentRecognizer';
import { ResponseGenerator } from './ResponseGenerator';
import { ConversationManager } from './ConversationManager';

interface ChatBotConfig {
  openaiApiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface Intent {
  name: string;
  confidence: number;
  entities: Record<string, any>;
}

interface Response {
  text: string;
  type: 'text' | 'button' | 'quick_reply' | 'template';
  options?: any[];
}

export class ChatBotService {
  private openai: OpenAI;
  private config: ChatBotConfig;
  private intentRecognizer: IntentRecognizer;
  private responseGenerator: ResponseGenerator;
  private conversationManager: ConversationManager;

  constructor(config: ChatBotConfig) {
    this.config = config;
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.intentRecognizer = new IntentRecognizer(this.openai, config);
    this.responseGenerator = new ResponseGenerator(this.openai, config);
    this.conversationManager = new ConversationManager(redisService);
  }

  async processMessage(userId: string, message: string): Promise<Response> {
    try {
      // Get conversation history
      const history = await this.conversationManager.getHistory(userId);

      // Recognize intent
      const intent = await this.intentRecognizer.recognize(message, history);

      // Generate response
      const response = await this.responseGenerator.generate(message, intent, history);

      // Update conversation history
      await this.conversationManager.addMessage(userId, {
        role: 'user',
        content: message
      });
      await this.conversationManager.addMessage(userId, {
        role: 'assistant',
        content: response.text
      });

      logger.info('ChatBot message processed successfully', { userId, intent: intent.name });
      return response;
    } catch (error) {
      logger.error('Error processing ChatBot message', { error, userId });
      throw error;
    }
  }

  async handleIntent(userId: string, intent: Intent): Promise<Response> {
    try {
      const response = await this.responseGenerator.generateFromIntent(intent);
      logger.info('ChatBot intent handled successfully', { userId, intent: intent.name });
      return response;
    } catch (error) {
      logger.error('Error handling ChatBot intent', { error, userId, intent: intent.name });
      throw error;
    }
  }

  async getConversationHistory(userId: string): Promise<any[]> {
    try {
      const history = await this.conversationManager.getHistory(userId);
      logger.info('ChatBot conversation history retrieved successfully', { userId });
      return history;
    } catch (error) {
      logger.error('Error retrieving ChatBot conversation history', { error, userId });
      throw error;
    }
  }

  async clearConversationHistory(userId: string): Promise<void> {
    try {
      await this.conversationManager.clearHistory(userId);
      logger.info('ChatBot conversation history cleared successfully', { userId });
    } catch (error) {
      logger.error('Error clearing ChatBot conversation history', { error, userId });
      throw error;
    }
  }

  async trainIntent(intentName: string, examples: string[]): Promise<void> {
    try {
      await this.intentRecognizer.trainIntent(intentName, examples);
      logger.info('ChatBot intent trained successfully', { intentName });
    } catch (error) {
      logger.error('Error training ChatBot intent', { error, intentName });
      throw error;
    }
  }

  async addResponseTemplate(intentName: string, template: string): Promise<void> {
    try {
      await this.responseGenerator.addTemplate(intentName, template);
      logger.info('ChatBot response template added successfully', { intentName });
    } catch (error) {
      logger.error('Error adding ChatBot response template', { error, intentName });
      throw error;
    }
  }

  async getIntentConfidence(message: string): Promise<Record<string, number>> {
    try {
      const confidences = await this.intentRecognizer.getConfidences(message);
      logger.info('ChatBot intent confidences retrieved successfully');
      return confidences;
    } catch (error) {
      logger.error('Error retrieving ChatBot intent confidences', { error });
      throw error;
    }
  }

  async analyzeConversation(userId: string): Promise<any> {
    try {
      const history = await this.conversationManager.getHistory(userId);
      const analysis = await this.conversationManager.analyzeConversation(history);
      logger.info('ChatBot conversation analyzed successfully', { userId });
      return analysis;
    } catch (error) {
      logger.error('Error analyzing ChatBot conversation', { error, userId });
      throw error;
    }
  }
}

export const chatBotService = new ChatBotService({
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 150
}); 