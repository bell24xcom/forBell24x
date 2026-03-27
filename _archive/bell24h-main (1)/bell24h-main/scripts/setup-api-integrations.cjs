const fs = require('fs');
const path = require('path');

/**
 * API Integration Setup Script
 * Configures external API connections for enhanced features
 */

class APIIntegrationSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.apiDir = path.join(this.projectRoot, 'lib', 'api');
    this.configDir = path.join(this.projectRoot, 'config');
  }

  async createAPIDirectory() {
    console.log('📁 Creating API integration directory structure...');

    const directories = [
      'lib/api',
      'lib/api/analytics',
      'lib/api/ai',
      'lib/api/payments',
      'lib/api/email',
      'lib/api/external',
      'config/api'
    ];

    directories.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  async createAnalyticsAPI() {
    console.log('📊 Creating Analytics API integration...');

    const analyticsAPI = `// Analytics API Integration
import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  page_url: string;
  event_data: Record<string, any>;
  timestamp: Date;
}

interface AnalyticsMetrics {
  page_views: number;
  unique_visitors: number;
  bounce_rate: number;
  conversion_rate: number;
  avg_session_duration: number;
}

export class AnalyticsAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ANALYTICS_API_KEY || '';
    this.baseUrl = process.env.ANALYTICS_BASE_URL || 'https://api.analytics.com';
  }

  async trackEvent(event: AnalyticsEvent): Promise<boolean> {
    try {
      const response = await fetch(\`\${this.baseUrl}/events\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.apiKey}\`,
        },
        body: JSON.stringify(event),
      });

      return response.ok;
    } catch (error) {
      console.error('Analytics tracking error:', error);
      return false;
    }
  }

  async getMetrics(timeRange: string = '7d'): Promise<AnalyticsMetrics | null> {
    try {
      const response = await fetch(\`\${this.baseUrl}/metrics?range=\${timeRange}\`, {
        headers: {
          'Authorization': \`Bearer \${this.apiKey}\`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Analytics fetch error:', error);
      return null;
    }
  }

  async getTopPages(limit: number = 10): Promise<Array<{page: string, views: number, bounce_rate: number}> | null> {
    try {
      const response = await fetch(\`\${this.baseUrl}/pages/top?limit=\${limit}\`, {
        headers: {
          'Authorization': \`Bearer \${this.apiKey}\`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top pages');
      }

      return await response.json();
    } catch (error) {
      console.error('Top pages fetch error:', error);
      return null;
    }
  }
}

// API Routes
export async function POST(request: NextRequest) {
  const analytics = new AnalyticsAPI();
  const event = await request.json();
  
  const success = await analytics.trackEvent(event);
  
  return NextResponse.json({ success });
}

export async function GET(request: NextRequest) {
  const analytics = new AnalyticsAPI();
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('range') || '7d';
  
  const metrics = await analytics.getMetrics(timeRange);
  
  return NextResponse.json(metrics);
}
`;

    const analyticsPath = path.join(this.apiDir, 'analytics', 'index.ts');
    fs.writeFileSync(analyticsPath, analyticsAPI);
    console.log('✅ Created Analytics API integration');
  }

  async createAIIntegration() {
    console.log('🤖 Creating AI Integration...');

    const aiIntegration = `// AI Integration for Bell24h
import OpenAI from 'openai';

interface AIInsight {
  type: 'optimization' | 'trend' | 'alert' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  confidence: number;
}

interface ContentGenerationRequest {
  type: 'product_description' | 'email_campaign' | 'rfq_response' | 'marketing_copy';
  context: string;
  tone?: 'professional' | 'casual' | 'persuasive';
  length?: 'short' | 'medium' | 'long';
}

export class AIIntegration {
  private openai: OpenAI;
  private nanoBananaAPI: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.nanoBananaAPI = process.env.NANO_BANANA_API_URL || '';
  }

  async generateInsights(data: any): Promise<AIInsight[]> {
    try {
      const prompt = \`Analyze the following business data and provide actionable insights:
      
Data: \${JSON.stringify(data, null, 2)}

Please provide insights in the following format:
1. Type: optimization, trend, alert, or recommendation
2. Title: Brief descriptive title
3. Description: Detailed explanation
4. Impact: high, medium, or low
5. Action: Specific actionable recommendation
6. Confidence: 0-100 confidence score

Focus on:
- Marketing campaign optimization
- User behavior patterns
- Revenue opportunities
- Performance improvements
- Risk identification\`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      return this.parseInsights(response || '');
    } catch (error) {
      console.error('AI insights generation error:', error);
      return [];
    }
  }

  async generateContent(request: ContentGenerationRequest): Promise<string> {
    try {
      const prompt = \`Generate \${request.type} content with the following requirements:
      
Context: \${request.context}
Tone: \${request.tone || 'professional'}
Length: \${request.length || 'medium'}

Please create engaging, professional content that aligns with B2B marketplace standards.\`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Content generation error:', error);
      return 'Content generation failed. Please try again.';
    }
  }

  async callNanoBananaAPI(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(\`\${this.nanoBananaAPI}\${endpoint}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${process.env.NANO_BANANA_API_KEY}\`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(\`Nano Banana API error: \${response.statusText}\`);
      }

      return await response.json();
    } catch (error) {
      console.error('Nano Banana API error:', error);
      throw error;
    }
  }

  private parseInsights(response: string): AIInsight[] {
    // Simple parsing - in production, use more robust parsing
    const insights: AIInsight[] = [];
    const lines = response.split('\\n').filter(line => line.trim());
    
    let currentInsight: Partial<AIInsight> = {};
    
    for (const line of lines) {
      if (line.includes('Type:')) {
        if (Object.keys(currentInsight).length > 0) {
          insights.push(currentInsight as AIInsight);
        }
        currentInsight = { type: line.split('Type:')[1]?.trim() as any };
      } else if (line.includes('Title:')) {
        currentInsight.title = line.split('Title:')[1]?.trim() || '';
      } else if (line.includes('Description:')) {
        currentInsight.description = line.split('Description:')[1]?.trim() || '';
      } else if (line.includes('Impact:')) {
        currentInsight.impact = line.split('Impact:')[1]?.trim() as any;
      } else if (line.includes('Action:')) {
        currentInsight.action = line.split('Action:')[1]?.trim() || '';
      } else if (line.includes('Confidence:')) {
        currentInsight.confidence = parseInt(line.split('Confidence:')[1]?.trim() || '0');
      }
    }
    
    if (Object.keys(currentInsight).length > 0) {
      insights.push(currentInsight as AIInsight);
    }
    
    return insights;
  }
}

export const aiIntegration = new AIIntegration();
`;

    const aiPath = path.join(this.apiDir, 'ai', 'index.ts');
    fs.writeFileSync(aiPath, aiIntegration);
    console.log('✅ Created AI Integration');
  }

  async createPaymentIntegration() {
    console.log('💳 Creating Payment Integration...');

    const paymentIntegration = `// Payment Integration for Bell24h
import Stripe from 'stripe';

interface PaymentIntent {
  amount: number;
  currency: string;
  customer_id?: string;
  metadata?: Record<string, string>;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export class PaymentIntegration {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  async createPaymentIntent(paymentData: PaymentIntent): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        customer: paymentData.customer_id,
        metadata: paymentData.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  }

  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw error;
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        expand: ['data.product'],
      });

      return prices.data.map(price => ({
        id: price.id,
        name: (price.product as Stripe.Product).name,
        price: price.unit_amount || 0,
        interval: price.recurring?.interval as 'month' | 'year',
        features: (price.product as Stripe.Product).metadata?.features?.split(',') || [],
      }));
    } catch (error) {
      console.error('Subscription plans fetch error:', error);
      return [];
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<boolean> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
          break;
      }

      return true;
    } catch (error) {
      console.error('Webhook handling error:', error);
      return false;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // Handle successful payment
    console.log('Payment succeeded:', paymentIntent.id);
    // Update database, send confirmation email, etc.
  }

  private async handleSubscriptionPayment(invoice: Stripe.Invoice) {
    // Handle subscription payment
    console.log('Subscription payment succeeded:', invoice.id);
    // Update subscription status, extend access, etc.
  }

  private async handleSubscriptionCancellation(subscription: Stripe.Subscription) {
    // Handle subscription cancellation
    console.log('Subscription cancelled:', subscription.id);
    // Update access, send notification, etc.
  }
}

export const paymentIntegration = new PaymentIntegration();
`;

    const paymentPath = path.join(this.apiDir, 'payments', 'index.ts');
    fs.writeFileSync(paymentPath, paymentIntegration);
    console.log('✅ Created Payment Integration');
  }

  async createAPIConfig() {
    console.log('⚙️ Creating API configuration...');

    const apiConfig = `// API Configuration
export const API_CONFIG = {
  // Analytics
  ANALYTICS: {
    ENABLED: process.env.ANALYTICS_ENABLED === 'true',
    API_KEY: process.env.ANALYTICS_API_KEY,
    BASE_URL: process.env.ANALYTICS_BASE_URL,
    TRACKING_ID: process.env.ANALYTICS_TRACKING_ID,
  },

  // AI Services
  AI: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NANO_BANANA_API_KEY: process.env.NANO_BANANA_API_KEY,
    NANO_BANANA_API_URL: process.env.NANO_BANANA_API_URL,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  },

  // Payments
  PAYMENTS: {
    STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // Email
  EMAIL: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FROM_EMAIL: process.env.FROM_EMAIL,
  },

  // External APIs
  EXTERNAL: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  },
};

export const validateAPIConfig = () => {
  const required = [
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'SMTP_HOST',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing required API configuration:', missing);
    return false;
  }

  return true;
};
`;

    const configPath = path.join(this.configDir, 'api.ts');
    fs.writeFileSync(configPath, apiConfig);
    console.log('✅ Created API configuration');
  }

  async createAPIEndpoints() {
    console.log('🔗 Creating API endpoints...');

    const endpoints = [
      {
        path: 'app/api/analytics/route.ts',
        content: `import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsAPI } from '@/lib/api/analytics';

export async function GET(request: NextRequest) {
  const analytics = new AnalyticsAPI();
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('range') || '7d';
  
  const metrics = await analytics.getMetrics(timeRange);
  
  return NextResponse.json(metrics);
}

export async function POST(request: NextRequest) {
  const analytics = new AnalyticsAPI();
  const event = await request.json();
  
  const success = await analytics.trackEvent(event);
  
  return NextResponse.json({ success });
}`
      },
      {
        path: 'app/api/ai/insights/route.ts',
        content: `import { NextRequest, NextResponse } from 'next/server';
import { aiIntegration } from '@/lib/api/ai';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const insights = await aiIntegration.generateInsights(data);
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}`
      },
      {
        path: 'app/api/ai/content/route.ts',
        content: `import { NextRequest, NextResponse } from 'next/server';
import { aiIntegration } from '@/lib/api/ai';

export async function POST(request: NextRequest) {
  try {
    const { type, context, tone, length } = await request.json();
    const content = await aiIntegration.generateContent({
      type,
      context,
      tone,
      length,
    });
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}`
      },
      {
        path: 'app/api/payments/create-intent/route.ts',
        content: `import { NextRequest, NextResponse } from 'next/server';
import { paymentIntegration } from '@/lib/api/payments';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, customer_id, metadata } = await request.json();
    
    const paymentIntent = await paymentIntegration.createPaymentIntent({
      amount,
      currency,
      customer_id,
      metadata,
    });
    
    return NextResponse.json({ 
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id 
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}`
      }
    ];

    endpoints.forEach(endpoint => {
      const fullPath = path.join(this.projectRoot, endpoint.path);
      const dir = path.dirname(fullPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, endpoint.content);
      console.log(`✅ Created API endpoint: ${endpoint.path}`);
    });
  }

  async setupComplete() {
    console.log('\\n🎉 API Integration Setup Complete!');
    console.log('\\n📋 Next Steps:');
    console.log('1. Add API keys to your .env.local file');
    console.log('2. Install required dependencies:');
    console.log('   npm install openai stripe');
    console.log('3. Test API endpoints:');
    console.log('   npm run dev');
    console.log('4. Visit /admin to test the enhanced features');
    console.log('\\n🔧 Required Environment Variables:');
    console.log('- OPENAI_API_KEY');
    console.log('- STRIPE_SECRET_KEY');
    console.log('- NANO_BANANA_API_KEY (optional)');
    console.log('- ANALYTICS_API_KEY (optional)');
  }
}

// CLI Interface
async function main() {
  const setup = new APIIntegrationSetup();

  try {
    await setup.createAPIDirectory();
    await setup.createAnalyticsAPI();
    await setup.createAIIntegration();
    await setup.createPaymentIntegration();
    await setup.createAPIConfig();
    await setup.createAPIEndpoints();
    await setup.setupComplete();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = APIIntegrationSetup;
`;

  }
}

// CLI Interface
async function main() {
  const setup = new APIIntegrationSetup();
  
  try {
    await setup.createAPIDirectory();
    await setup.createAnalyticsAPI();
    await setup.createAIIntegration();
    await setup.createPaymentIntegration();
    await setup.createAPIConfig();
    await setup.createAPIEndpoints();
    await setup.setupComplete();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = APIIntegrationSetup;
