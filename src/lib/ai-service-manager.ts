import { OpenAI } from 'openai';

// NVIDIA API Configuration
const nvidiaClient = new OpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY
});

// Original OpenAI (for critical functions)
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class AIServiceManager {
  
  // Voice RFQ Processing - Use Minimax M2.1
async processVoiceRFQ(audioBuffer: Buffer, language: string = 'hindi') {
    const base64Audio = audioBuffer.toString('base64');
    
    const response = await nvidiaClient.chat.completions.create({
      model: 'minimaxai/minimax-m2.1',
      messages: [{
        role: 'user',
        content: [
          { type: 'audio', source: { type: 'base64', media_type: 'audio/mp3', data: base64Audio }},
          { type: 'text', text: `Transcribe this RFQ in ${language}` }
        ]
      }],
      temperature: 0.7,
      max_tokens: 2048
    });
    
    return response.choices[0].message.content;
  }

  // RFQ Matching - Use DeepSeek (90% cheaper!)
async matchRFQToSuppliers(rfqText: string) {
    const response = await nvidiaClient.chat.completions.create({
      model: 'deepseek-ai/deepseek-v3.2',
      messages: [{ role: 'user', content: `Match suppliers for: ${rfqText}` }],
      temperature: 0.5,
      max_tokens: 1024
    });
    
    return response.choices[0].message.content;
  }

  // Content Generation - Use Minimax M2.1
async generateContent(prompt: string) {
    const response = await nvidiaClient.chat.completions.create({
      model: 'minimaxai/minimax-m2.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    return response.choices[0].message.content;
  }

  // Chatbot - Use Kimi 2.5 (200K context!)
async chatWithSupplier(conversationHistory: any[], userMessage: string) {
    const response = await nvidiaClient.chat.completions.create({
      model: 'moonshotai/kimi-k2.5',
      messages: [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4096
    });
    
    return response.choices[0].message.content;
  }

  // CRITICAL FUNCTIONS - Keep GPT-4
async analyzeSentiment(negotiationText: string) {
    // Use original OpenAI for critical accuracy
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Analyze sentiment: ${negotiationText}` }],
      temperature: 0.3
    });
    
    return response.choices[0].message.content;
  }
}

export const aiService = new AIServiceManager();