import { aiClient } from '../lib/ai-client';
import { BELL24H_PLANS } from '../lib/subscription-plans';

export class AIService {
  async processRFQ(rfqData: any, userId: string) {
    // Check user subscription level
    const userPlan = await this.getUserPlan(userId);

    // Process based on RFQ type
    if (rfqData.type === 'voice') {
      return this.processVoiceRFQ(rfqData.audio, userPlan);
    } else if (rfqData.type === 'video') {
      return this.processVideoRFQ(rfqData.video, userPlan);
    } else {
      return this.processTextRFQ(rfqData.text, userPlan);
    }
  }

  private async processVoiceRFQ(audioBuffer: Buffer, plan: string) {
    try {
      const result = await aiClient.processVoiceRFQ(audioBuffer);
      return { success: true, data: result };
    } catch (error) {
      // Fallback to text processing if voice fails
      return this.processTextRFQ('Voice content not available', plan);
    }
  }

  private async processVideoRFQ(videoBuffer: Buffer, plan: string) {
    try {
      const result = await aiClient.processVideoRFQ(videoBuffer);
      return { success: true, data: result };
    } catch (error) {
      // Fallback to text processing if video fails
      return this.processTextRFQ('Video content not available', plan);
    }
  }

  private async processTextRFQ(text: string, plan: string) {
    const client = plan === 'enterprise' ? aiClient.getClient('minimax') : aiClient.getClient('deepseek');

const response = await client.chat.completions.create({
      model: plan === 'enterprise' ? 'minimaxai/minimax-m2.1' : 'deepseek-ai/deepseek-v3.2',
      messages: [{
        role: 'user',
        content: `Analyze this RFQ:\n\n${text}\n\nExtract: product type, quantity, specifications, delivery requirements, urgency`
      }],
      temperature: 0.7,
      max_tokens: 1000
    });

    return { success: true, data: response.choices[0].message.content };
  }

  async generateSupplierContent(supplierData: any, plan: string) {
    const prompt = `Create professional supplier profile for:\n\nCompany: ${supplierData.companyName}\nIndustry: ${supplierData.industry}\nLocation: ${supplierData.location}\nSpecialization: ${supplierData.specialization}\nCertifications: ${supplierData.certifications}\nYears in business: ${supplierData.yearsInBusiness}`;

    const content = await aiClient.generateContent(prompt, 'multimodal');

    return { success: true, content };
  }

  async matchSuppliers(rfqData: any, userId: string) {
    // Get user's preferred suppliers
    const preferredSuppliers = await this.getUserPreferredSuppliers(userId);

    // Generate embeddings for RFQ
    const rfqEmbedding = await aiClient.getEmbeddings(rfqData.text);

    // Match with supplier embeddings
    const matches = await this.findBestMatches(rfqEmbedding, preferredSuppliers);

    return { success: true, matches };
  }

  async analyzeSentiment(text: string) {
    // Use GPT-4 for critical sentiment analysis
const openaiClient = new (await import('openai')).default({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Analyze the sentiment of this B2B communication:\n\n${text}\n\nFocus on: urgency, tone, negotiation stance, potential concerns`
      }],
      temperature: 0.3
    });

    return { success: true, sentiment: response.choices[0].message.content };
  }

  private async getUserPlan(userId: string) {
    // In a real implementation, this would check the user's subscription
    // For now, return a default plan
    return 'pro'; // or 'enterprise', 'free'
  }

  private async getUserPreferredSuppliers(userId: string) {
    // Return list of preferred supplier IDs
    return [1, 2, 3, 4, 5]; // Example supplier IDs
  }

  private async findBestMatches(rfqEmbedding: number[], supplierIds: number[]) {
    // In a real implementation, this would calculate similarity scores
    // For now, return dummy matches
    return [
      { supplierId: supplierIds[0], score: 0.95 },
      { supplierId: supplierIds[1], score: 0.89 },
      { supplierId: supplierIds[2], score: 0.85 }
    ];
  }
}

export const aiService = new AIService();