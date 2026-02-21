import { Bell24hAIClient } from '@/lib/ai-client';

export class VoiceProcessingService {
  private aiClient: Bell24hAIClient;

  constructor() {
    this.aiClient = new Bell24hAIClient();
  }

  async processVoiceRFQ({ audioBase64, audioFormat, language = 'hi' }) {
    try {
      const result = await this.aiClient.processVoiceRFQ(
        Buffer.from(audioBase64, 'base64'),
        language
      );

      // Parse the AI response to extract RFQ details
      const extractedData = this.parseVoiceResponse(result);

      return {
        success: true,
        rfq: extractedData,
        transcript: result,
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      return {
        success: false,
        error: 'Failed to process voice RFQ',
      };
    }
  }

  private parseVoiceResponse(response: string) {
    // Simple parsing logic - in production this would be more sophisticated
    const titleMatch = response.match(/title:\s*(.*)/i);
    const categoryMatch = response.match(/category:\s*(.*)/i);
    const descriptionMatch = response.match(/description:\s*(.*)/i);
    const quantityMatch = response.match(/quantity:\s*(\d+)/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : 'RFQ Request',
      category: categoryMatch ? categoryMatch[1].trim() : 'General',
      description: descriptionMatch ? descriptionMatch[1].trim() : response,
      quantity: quantityMatch ? parseInt(quantityMatch[1]) : 1,
    };
  }
}

export const voiceProcessingService = new VoiceProcessingService();