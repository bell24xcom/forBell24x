import { OpenAI } from 'openai';

export class Bell24hAIClient {
  private clients: Map<string, OpenAI> = new Map();

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    // Minimax M2.1 for multimodal tasks
this.clients.set('minimax', new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: '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',
    }));

    // DeepSeek V3.2 for text and embeddings
this.clients.set('deepseek', new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: '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',
    }));

    // Kimi 2.5 for long-context tasks
this.clients.set('kimi', new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: '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',
    }));

    // AWS GPT-OSS for cost-effective text processing
this.clients.set('gpt-oss', new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: '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',
    }));
  }

  getClient(serviceType: string) {
    switch (serviceType) {
      case 'voice':
      case 'video':
      case 'multimodal':
        return this.clients.get('minimax');
      case 'text':
      case 'embeddings':
      case 'chat':
        return this.clients.get('deepseek');
      case 'long-context':
        return this.clients.get('kimi');
      case 'cost-effective':
        return this.clients.get('gpt-oss');
      default:
        throw new Error(`Unknown service type: ${serviceType}`);
    }
  }

  async processVoiceRFQ(audioBuffer: Buffer, language: string = 'hindi') {
const client = this.getClient('voice');
    if (!client) {
      throw new Error('Voice client not available');
    }
    const base64Audio = audioBuffer.toString('base64');

const response = await client.chat.completions.create({
      model: 'minimaxai/minimax-m2.1',
      messages: [{
        role: 'user',
        content: [{
          type: 'audio',
          source: {
            type: 'base64',
            media_type: 'audio/mp3',
            data: base64Audio
          }
        }, {
          type: 'text',
          text: `Transcribe this RFQ in ${language} and extract: product, quantity, delivery location, urgency level`
        }]
      }],
      temperature: 0.7,
      max_tokens: 2048
    });

    return response.choices[0].message.content;
  }

  async processVideoRFQ(videoBuffer: Buffer) {
const client = this.getClient('video');
    if (!client) {
      throw new Error('Video client not available');
    }
    const base64Video = videoBuffer.toString('base64');

const response = await client.chat.completions.create({
      model: 'minimaxai/minimax-m2.1',
      messages: [{
        role: 'user',
        content: [{
          type: 'video',
          source: {
            type: 'base64',
            media_type: 'video/mp4',
            data: base64Video
          }
        }, {
          type: 'text',
          text: 'Analyze this industrial product video. Identify machinery type, estimate capacity, note visible specifications'
        }]
      }],
      temperature: 0.5,
      max_tokens: 1024
    });

    return response.choices[0].message.content;
  }

  async generateContent(prompt: string, type: 'text' | 'multimodal' = 'text') {
const client = type === 'multimodal' ? this.getClient('minimax') : this.getClient('deepseek');
    if (!client) {
      throw new Error('Content generation client not available');
    }

    const response = await client.chat.completions.create({
      model: type === 'multimodal' ? 'minimaxai/minimax-m2.1' : 'deepseek-ai/deepseek-v3.2',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  }

  async getEmbeddings(text: string) {
const client = this.getClient('deepseek');
    if (!client) {
      throw new Error('Embeddings client not available');
    }

    const response = await client.embeddings.create({
      model: 'deepseek-ai/deepseek-v3.2',
      input: [text],
      dimensions: 1024
    });

    return response.data[0].embedding;
  }

  async analyzeLongDocument(documentText: string) {
const client = this.getClient('long-context');
    if (!client) {
      throw new Error('Long-context client not available');
    }

    const response = await client.chat.completions.create({
      model: 'moonshotai/kimi-k2.5',
      messages: [{
        role: 'user',
        content: documentText
      }],
      max_tokens: 4096,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  }
}

export const aiClient = new Bell24hAIClient();