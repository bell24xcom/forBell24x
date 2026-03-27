import { PerplexityClient } from '../lib/perplexity';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

class PerplexityService {
  private client: PerplexityClient;
  private static instance: PerplexityService;

  private constructor() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set in environment variables');
    }

    this.client = new PerplexityClient({
      apiKey,
      requestsPerMinute: 20, // Adjust based on your needs
      maxRetries: 3,
      retryDelay: 1000,
    });
  }

  public static getInstance(): PerplexityService {
    if (!PerplexityService.instance) {
      PerplexityService.instance = new PerplexityService();
    }
    return PerplexityService.instance;
  }

  /**
   * Get a response for a single message
   */
  public async getChatResponse(
    message: string,
    systemMessage: string = 'You are a helpful assistant.',
    model: string = 'sonar',
    temperature: number = 0.7,
    maxTokens: number = 500
  ): Promise<string> {
    try {
      return await this.client.chat(
        message,
        systemMessage,
        { model, temperature, max_tokens: maxTokens }
      );
    } catch (error) {
      console.error('Error in getChatResponse:', error);
      throw new Error('Failed to get chat response');
    }
  }

  /**
   * Get a response for a conversation with multiple messages
   */
  public async getConversationResponse(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    model: string = 'sonar',
    temperature: number = 0.7,
    maxTokens: number = 500
  ): Promise<string> {
    try {
      const response = await this.client.createChatCompletion({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error in getConversationResponse:', error);
      throw new Error('Failed to get conversation response');
    }
  }

  /**
   * Test the connection to the Perplexity API
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.client.testConnection();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export default PerplexityService;
