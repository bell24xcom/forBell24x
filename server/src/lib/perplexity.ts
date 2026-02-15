interface PerplexityConfig {
  apiKey: string;
  baseUrl: string;
  maxRetries: number;
  retryDelay: number;
  requestsPerMinute: number;
}

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

interface ChatCompletionOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
  stop?: string | string[];
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class PerplexityClient {
  // Queue management
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private requestCount = 0;
  
  // Configuration and state
  private config: PerplexityConfig;
  private requestInterval: number;
  private maxRetries: number;
  private retryDelay: number;
  
  // Supported models - using correct model names from Perplexity API
  private readonly supportedModels = [
    'llama-3-sonar-small-32k-chat',
    'llama-3-sonar-small-32k-online',
    'llama-3-sonar-large-32k-chat',
    'llama-3-sonar-large-32k-online',
    'llama-3-8b-instruct',
    'llama-3-70b-instruct',
    'mixtral-8x7b-instruct',
    'codellama-34b-instruct',
  ];

  constructor(config: Partial<PerplexityConfig> = {}) {
    const defaultConfig: PerplexityConfig = {
      apiKey: process.env.PERPLEXITY_API_KEY || '',
      baseUrl: 'https://api.perplexity.ai',
      maxRetries: 3,
      retryDelay: 1000,
      requestsPerMinute: 20,
    };

    this.config = {
      ...defaultConfig,
      ...config
    };
    
    if (!this.config.apiKey) {
      throw new Error('Perplexity API key is required');
    }

    this.maxRetries = this.config.maxRetries;
    this.retryDelay = this.config.retryDelay;
    this.requestInterval = Math.ceil((60 * 1000) / this.config.requestsPerMinute);
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    const nextRequest = this.requestQueue.shift();
    
    if (nextRequest) {
      try {
        await nextRequest();
      } finally {
        // Schedule next request after the interval
        setTimeout(() => {
          this.isProcessingQueue = false;
          this.processQueue();
        }, this.requestInterval);
      }
    } else {
      this.isProcessingQueue = false;
    }
  }

  private enqueueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          const result = await this.executeWithRetry(requestFn);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      this.requestQueue.push(executeRequest);
      this.processQueue();
    });
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retries = this.maxRetries,
    delay = this.retryDelay
  ): Promise<T> {
    try {
      // Ensure we respect rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.requestInterval) {
        await new Promise(resolve => setTimeout(resolve, this.requestInterval - timeSinceLastRequest));
      }
      
      this.lastRequestTime = Date.now();
      this.requestCount++;
      
      const response = await requestFn();
      return response;
    } catch (error: any) {
      if (retries <= 0) {
        throw error;
      }
      
      // Calculate backoff with jitter
      const backoff = delay * (2 ** (this.maxRetries - retries));
      const jitter = Math.random() * 0.2 * backoff; // Add up to 20% jitter
      const waitTime = backoff + jitter;
      
      console.warn(`Request failed, retrying in ${Math.round(waitTime)}ms... (${retries} retries left)`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.executeWithRetry(requestFn, retries - 1, delay);
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const requestId = Math.random().toString(36).substring(2, 8);
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const requestFn = async (): Promise<any> => {
      console.debug(`[${requestId}] ${options.method || 'GET'} ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const headers = new Headers({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...options.headers,
        });

        const requestOptions: RequestInit = {
          ...options,
          headers,
          signal: controller.signal,
        };

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '1') * 1000;
          const waitTime = Math.min(
            Math.max(retryAfter, 1000), // At least 1 second
            30000 // At most 30 seconds
          );
          
          console.warn(`[${requestId}] Rate limited. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.request(endpoint, options);
        }

        let responseData;
        try {
          responseData = await response.json();
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : 'Unknown error';
          console.error(`[${requestId}] Failed to parse JSON response:`, errorMessage);
          responseData = { error: { message: 'Invalid JSON response' } };
        }

        if (!response.ok) {
          const errorMessage = responseData?.error?.message || 'API request failed';
          console.error(`[${requestId}] API Error: ${response.status} - ${errorMessage}`);
          const error = new Error(errorMessage);
          (error as any).status = response.status;
          (error as any).code = responseData?.error?.code;
          (error as any).type = responseData?.error?.type;
          (error as any).response = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData
          };
          throw error;
        }

        console.debug(`[${requestId}] Request successful`);
        return responseData;
      } catch (error: unknown) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request to ${url} timed out after 30 seconds`);
        }
        throw error;
      }
    };
    
    return this.enqueueRequest(requestFn);
  }

  /**
   * Tests the connection to the Perplexity API and returns available models
   */
  async testConnection(): Promise<{ data: Model[] }> {
    try {
      console.log('Testing connection to Perplexity API...');
      
      // Test the connection by making a simple chat request
      const testMessage = 'Hello, this is a test connection.';
      const testResponse = await this.chat(testMessage, 'You are a helpful assistant.');
      
      if (testResponse) {
        console.log('✅ Successfully connected to Perplexity API');
        // Return the supported models
        return {
          data: [
            'sonar',
            'sonar-pro',
            'sonar-reasoning',
            'sonar-reasoning-pro',
            'sonar-deep-research',
            'r1-1776'
          ].map(model => ({
            id: model,
            object: 'model',
            created: Date.now(),
            owned_by: 'perplexity'
          }))
        };
      }
      
      throw new Error('Empty response from API');
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Connection test failed:', error.message);
        if ('response' in error && error.response) {
          const response = error.response as { status?: number; data?: any };
          console.error('Response status:', response.status);
          console.error('Response data:', response.data);
        } else {
          console.error('Error details:', error);
        }
      } else {
        console.error('❌ Connection test failed with unknown error');
      }
      throw error;
    }
  }

  /**
   * Creates a chat completion
   */
  async createChatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const {
      model,
      messages,
      temperature = 0.7,
      max_tokens,
      stream = false,
      ...otherOptions
    } = options;

    if (!model) {
      throw new Error('Model is required');
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array is required and cannot be empty');
    }

    const body = {
      model,
      messages,
      temperature: Math.min(Math.max(temperature, 0), 2),

    };

    return this.request('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Creates a chat completion with a single user message
   */
  async chat(
    message: string,
    systemMessage?: string,
    options: Omit<ChatCompletionOptions, 'messages' | 'model'> & { model?: string } = {}
  ): Promise<string> {
    const messages: Message[] = [];
    
    if (systemMessage) {
      messages.push({
        role: 'system',
        content: systemMessage,
      });
    }
    
    messages.push({
      role: 'user',
      content: message,
    });

    const response = await this.createChatCompletion({
      model: options.model || 'sonar',
      messages,
      ...options,
    });

    return response.choices[0]?.message?.content || '';
  }
}

export default PerplexityClient;
