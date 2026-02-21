import { OpenAI } from 'openai';

export class Bell24hAIClient {
  private clients: Map<string, OpenAI> = new Map();

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
    // Support both naming conventions: NVIDIA_MINIMAX_KEY (ours) and NVIDIA_API_KEY_MINIMAX (Cline's)
    const fallback = process.env.NVIDIA_API_KEY || '';

    this.clients.set('minimax', new OpenAI({
      baseURL: NVIDIA_BASE_URL,
      apiKey: process.env.NVIDIA_MINIMAX_KEY || process.env.NVIDIA_API_KEY_MINIMAX || fallback,
    }));

    this.clients.set('deepseek', new OpenAI({
      baseURL: NVIDIA_BASE_URL,
      apiKey: process.env.NVIDIA_DEEPSEEK_KEY || process.env.NVIDIA_API_KEY_DEEPSEEK || fallback,
    }));

    this.clients.set('kimi', new OpenAI({
      baseURL: NVIDIA_BASE_URL,
      apiKey: process.env.NVIDIA_KIMI_KEY || process.env.NVIDIA_API_KEY_KIMI ||
              process.env.NVIDIA_DEEPSEEK_KEY || process.env.NVIDIA_API_KEY_DEEPSEEK || fallback,
    }));

    this.clients.set('gpt-oss', new OpenAI({
      baseURL: NVIDIA_BASE_URL,
      apiKey: process.env.NVIDIA_GPT_OSS_KEY || process.env.NVIDIA_API_KEY_GPT_OSS || fallback,
    }));
  }

  // Model name constants
  static readonly MODELS = {
    MINIMAX: 'minimaxai/minimax-m2.1',
    DEEPSEEK: 'deepseek-ai/deepseek-v3.2',
    DEEPSEEK_EMBEDDINGS: 'deepseek-ai/deepseek-v3.2',
    KIMI: 'moonshotai/kimi-k2.5',
    GPT_OSS: 'openai/gpt-oss-20b',
  };

  getModel(serviceType: string): string {
    switch (serviceType) {
      case 'voice': case 'video': case 'multimodal': case 'voice-processing': case 'video-processing':
        return Bell24hAIClient.MODELS.MINIMAX;
      case 'text': case 'embeddings': case 'rfq-matching': case 'document-processing':
        return Bell24hAIClient.MODELS.DEEPSEEK;
      case 'long-context': case 'chatbot': case 'chat':
        return Bell24hAIClient.MODELS.KIMI;
      case 'cost-effective': case 'content-generation': case 'quote-generation':
        return Bell24hAIClient.MODELS.GPT_OSS;
      default:
        return Bell24hAIClient.MODELS.DEEPSEEK;
    }
  }

  // Unified chat completion method (used by service files)
  async createChatCompletion(
    serviceType: string,
    messages: Array<{ role: string; content: string | Array<any> }>,
    options?: { temperature?: number; maxTokens?: number; enableReasoning?: boolean }
  ) {
    const client = this.getClient(serviceType);
    if (!client) throw new Error(`No client for serviceType: ${serviceType}`);
    const model = this.getModel(serviceType);
    return (client as any).chat.completions.create({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    });
  }

  // Embeddings method (used by rfq-matching service)
  async createEmbeddings(texts: string[]) {
    const client = this.getClient('embeddings');
    if (!client) throw new Error('Embeddings client not available');
    return (client as any).embeddings.create({
      model: Bell24hAIClient.MODELS.DEEPSEEK_EMBEDDINGS,
      input: texts,
    });
  }

  // Multimodal method for audio/video input (used by voice-processing service)
  async processMultimodal(
    textPrompt: string,
    mediaFiles: Array<{ type: 'audio' | 'video' | 'image'; base64Data: string; mediaType: string }>,
    options?: { temperature?: number; maxTokens?: number }
  ) {
    const client = this.getClient('voice');
    if (!client) throw new Error('Multimodal client not available');

    const content: Array<any> = [{ type: 'text', text: textPrompt }];
    for (const media of mediaFiles) {
      if (media.type === 'audio') {
        content.push({ type: 'input_audio', input_audio: { data: media.base64Data, format: media.mediaType.split('/')[1] } });
      } else if (media.type === 'video') {
        content.push({ type: 'input_video', input_video: { data: media.base64Data, format: media.mediaType.split('/')[1] } });
      } else if (media.type === 'image') {
        content.push({ type: 'image_url', image_url: { url: `data:${media.mediaType};base64,${media.base64Data}` } });
      }
    }

    return (client as any).chat.completions.create({
      model: Bell24hAIClient.MODELS.MINIMAX,
      messages: [{ role: 'user', content }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    });
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