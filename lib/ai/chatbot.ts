/**
 * Chatbot Service
 * Uses Kimi K2.5 via NVIDIA (200K context window).
 * Replaces: GPT-4 function calling
 * Cost: 60% cheaper than OpenAI GPT-4
 */
import { aiClient } from '@/lib/ai-client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatContext {
  userId: string;
  userType: 'buyer' | 'supplier';
  currentRFQ?: any;
  conversationHistory: ChatMessage[];
  userProfile?: {
    name?: string;
    company?: string;
    industry?: string;
    location?: string;
  };
}

export interface ChatResponse {
  message: string;
  suggestedActions?: Array<{ label: string; action: string; data?: any }>;
  confidence: number;
  requiresHumanReview?: boolean;
}

export class ChatbotService {
  /**
   * Handle a chat message with full context
   */
  async chat(userMessage: string, context: ChatContext): Promise<ChatResponse> {
    const systemPrompt = this.buildSystemPrompt(context);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...context.conversationHistory.slice(-10),
      { role: 'user', content: userMessage },
    ];

    try {
      const response = await aiClient.createChatCompletion(
        'chatbot', // Kimi K2.5 - 200K context
        messages.map(m => ({ role: m.role, content: m.content })),
        { temperature: 0.7, maxTokens: 1000 }
      );

      const aiMessage = response.choices[0]?.message?.content ||
        'I apologize, I could not process that request. Please try again.';

      return {
        message: aiMessage,
        suggestedActions: this.extractSuggestedActions(aiMessage, context),
        confidence: this.calculateConfidence(aiMessage),
        requiresHumanReview: aiMessage.length < 50,
      };
    } catch (err) {
      console.error('[ChatbotService] Error:', err);
      return {
        message: 'I\'m temporarily unavailable. Please try again in a moment.',
        confidence: 0,
        requiresHumanReview: true,
      };
    }
  }

  private buildSystemPrompt(context: ChatContext): string {
    const base = `You are Bell24h AI Assistant, an expert in B2B procurement and RFQ management for Bell24h.com — India's AI-powered B2B marketplace.

User: ${context.userType === 'buyer' ? 'Buyer' : 'Supplier'}
Company: ${context.userProfile?.company || 'Not provided'}
Industry: ${context.userProfile?.industry || 'Not provided'}
Location: ${context.userProfile?.location || 'India'}

You help with: RFQ creation, supplier matching, quote comparison, pricing guidance, GST compliance, logistics, and procurement best practices. You understand Hindi and English (and code-mixed speech).`;

    if (context.userType === 'buyer') {
      return `${base}

Focus on: Creating clear RFQs, finding suppliers, comparing quotes, negotiation tips.
Suggest actions: [CREATE_RFQ], [BROWSE_SUPPLIERS], [COMPARE_QUOTES], [VIEW_PRICING]`;
    }
    return `${base}

Focus on: Understanding RFQs, crafting quotes, highlighting capabilities, pricing strategy.
Suggest actions: [BROWSE_RFQS], [CREATE_QUOTE], [UPDATE_PROFILE], [VIEW_LEADS]`;
  }

  private extractSuggestedActions(
    message: string,
    context: ChatContext
  ): Array<{ label: string; action: string; data?: any }> {
    const actions: Array<{ label: string; action: string }> = [];
    // Fixed regex patterns (Cline had malformed ones)
    if (/\[CREATE_RFQ\]/i.test(message)) actions.push({ label: 'Create RFQ', action: 'create-rfq' });
    if (/\[BROWSE_SUPPLIERS\]/i.test(message)) actions.push({ label: 'Browse Suppliers', action: 'browse-suppliers' });
    if (/\[COMPARE_QUOTES\]/i.test(message)) actions.push({ label: 'Compare Quotes', action: 'compare-quotes' });
    if (/\[BROWSE_RFQS\]/i.test(message)) actions.push({ label: 'Browse RFQs', action: 'browse-rfqs' });
    if (/\[CREATE_QUOTE\]/i.test(message)) actions.push({ label: 'Create Quote', action: 'create-quote' });
    if (/\[VIEW_PRICING\]/i.test(message)) actions.push({ label: 'View Pricing', action: 'view-pricing' });
    if (/\[VIEW_LEADS\]/i.test(message)) actions.push({ label: 'View Leads', action: 'view-leads' });
    if (context.currentRFQ && context.userType === 'supplier') {
      actions.push({ label: 'Submit Quote', action: 'submit-quote' });
    }
    return actions;
  }

  private calculateConfidence(message: string): number {
    let confidence = 80;
    const uncertain = ['might', 'maybe', 'not sure', 'possibly', 'I think'];
    for (const phrase of uncertain) {
      if (message.toLowerCase().includes(phrase)) confidence -= 8;
    }
    if (message.length < 50) confidence -= 15;
    if (message.includes('₹') || message.includes('GST')) confidence += 5;
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Guide user through creating an RFQ via conversation
   */
  async assistRFQCreation(
    conversationHistory: ChatMessage[],
    context: ChatContext
  ): Promise<{ rfqDraft: any; nextQuestion?: string; isComplete: boolean }> {
    const systemPrompt = `Extract RFQ information from this conversation.
Required: title, description, category. Optional: quantity, unit, deadline, specifications, budget.

Respond ONLY with JSON:
{
  "rfqDraft": {"title":"","description":"","category":"","quantity":null,"unit":null,"deadline":null,"specifications":{},"budget":null},
  "nextQuestion": "What is the...?" or null,
  "isComplete": false
}`;

    try {
      const response = await aiClient.createChatCompletion(
        'chatbot',
        [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
        ],
        { temperature: 0.3, maxTokens: 800 }
      );

      const content = response.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {
        rfqDraft: {},
        nextQuestion: 'Could you describe what product or service you need to purchase?',
        isComplete: false,
      };
    }
  }

  /**
   * Compare multiple supplier quotes and recommend the best one
   */
  async compareQuotes(
    rfq: any,
    quotes: any[]
  ): Promise<{ comparison: string; recommendation: string; topSuppliers: string[] }> {
    const prompt = `Compare these ${quotes.length} supplier quotes for this RFQ:
RFQ: ${rfq.title} | Category: ${rfq.category}
Quotes: ${JSON.stringify(quotes, null, 2)}

Provide: 1) Comparison of price/delivery/quality, 2) Clear recommendation, 3) Top 3 suppliers ranked.
Respond with JSON: {"comparison":"...","recommendation":"...","topSuppliers":["name1","name2","name3"]}`;

    try {
      const response = await aiClient.createChatCompletion(
        'chatbot',
        [
          { role: 'system', content: 'You are an expert procurement analyst. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.4, maxTokens: 1500 }
      );
      const content = response.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {
        comparison: 'Unable to compare quotes automatically. Please review manually.',
        recommendation: 'Consider price, delivery timeline, and supplier rating.',
        topSuppliers: quotes.slice(0, 3).map(q => q.supplierName || q.supplierId),
      };
    }
  }

  /**
   * Answer supplier questions about an RFQ
   */
  async answerRFQQuestion(rfq: any, question: string): Promise<string> {
    try {
      const response = await aiClient.createChatCompletion(
        'chatbot',
        [{
          role: 'user',
          content: `Answer this supplier question about the RFQ:
RFQ: ${JSON.stringify(rfq, null, 2)}
Question: "${question}"
If info is not in the RFQ, suggest what the supplier should clarify with the buyer.`
        }],
        { temperature: 0.6, maxTokens: 400 }
      );
      return response.choices[0]?.message?.content || 'Please contact the buyer directly for clarification.';
    } catch {
      return 'Unable to answer automatically. Please contact the buyer directly.';
    }
  }

  /**
   * Multilingual chat support (Hindi/English code-mixing)
   */
  async chatMultilingual(
    userMessage: string,
    detectedLanguage: 'hi' | 'en' | string,
    context: ChatContext
  ): Promise<ChatResponse> {
    const langInstruction = detectedLanguage === 'hi'
      ? 'Respond in Hindi (Devanagari script). You may use English technical terms.'
      : 'Respond in English.';

    const systemPrompt = `${this.buildSystemPrompt(context)}
${langInstruction}
Handle Hindi-English code-mixed speech naturally.`;

    try {
      const response = await aiClient.createChatCompletion(
        'chatbot',
        [
          { role: 'system', content: systemPrompt },
          ...context.conversationHistory.slice(-8).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
        ],
        { temperature: 0.7, maxTokens: 800 }
      );

      const aiMessage = response.choices[0]?.message?.content || 'मैं अभी उत्तर देने में असमर्थ हूं।';
      return {
        message: aiMessage,
        suggestedActions: this.extractSuggestedActions(aiMessage, context),
        confidence: 85,
      };
    } catch {
      return {
        message: detectedLanguage === 'hi'
          ? 'क्षमा करें, मैं अभी उपलब्ध नहीं हूं। कृपया पुनः प्रयास करें।'
          : 'I\'m temporarily unavailable. Please try again.',
        confidence: 0,
        requiresHumanReview: true,
      };
    }
  }
}

export const chatbotService = new ChatbotService();
