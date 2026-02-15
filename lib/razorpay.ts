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
          {
            type: 'audio',
            source: {
              type: 'base64',
              media_type: 'audio/mp3',
              data: base64Audio
            }
          },
          {
            type: 'text',
            text: `Transcribe this RFQ in ${language} and extract: product, quantity, delivery location, urgency level`
          }
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
      messages: [{
        role: 'user',
        content: `Analyze this RFQ and suggest matching suppliers:\n\n${rfqText}`
      }],
      temperature: 0.5,
      max_tokens: 1024,
      extra_body: { thinking: true }
    });
    
    return response.choices[0].message.content;
  }

  // Content Generation - Use Minimax M2.1
  async generateContent(prompt: string) {
    const response = await nvidiaClient.chat.completions.create({
      model: 'minimaxai/minimax-m2.1',
      messages: [{
        role: 'user',
        content: prompt
      }],
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
      max_tokens: 4096,
      extra_body: { thinking: true }
    });
    
    return response.choices[0].message.content;
  }

  // CRITICAL FUNCTIONS - Keep GPT-4
  async analyzeSentiment(negotiationText: string) {
    // Use original OpenAI for critical accuracy
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Analyze sentiment in B2B negotiation:\n\n${negotiationText}`
      }],
      temperature: 0.3
    });
    
    return response.choices[0].message.content;
  }
}

export const aiService = new AIServiceManager();import Razorpay from 'razorpay';
import crypto from 'crypto';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be defined');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: any;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: any;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  created_at: number;
}

export async function createRazorpayOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes?: Record<string, string>
): Promise<RazorpayOrder> {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes: notes || {},
    });
    return order as unknown as RazorpayOrder;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}

export function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const text = orderId + "|" + paymentId;
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest("hex");
  return generated_signature === signature;
}

export function verifyRazorpayWebhook(
  body: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

export async function getRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment as unknown as RazorpayPayment;
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error);
    throw new Error('Failed to fetch payment details');
  }
}