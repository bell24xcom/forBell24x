import { Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import { Payment, PaymentStatus, PaymentCreateInput } from '../models/PaymentModel';
import { prisma } from '../utils/prisma';
import { sendPaymentConfirmationEmail, sendPaymentFailedEmail } from '../services/emailService';
import { 
  verifyWebhookSignature, 
  createWebhookDelivery, 
  updateWebhookDelivery,
  retryFailedWebhooks 
} from '../utils/webhookUtils';
import { WebhookStatus, User } from '@prisma/client';
import { getClientIp } from '../utils/requestUtils';
import { stripe } from '../services/stripeService';
import { db } from '../../src/server';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';

// Payment provider configurations
type PaymentProvider = 'stripe' | 'paypal' | 'razorpay';

// Stripe configuration
const STRIPE_CONFIG = {
  paymentMethods: ['card', 'alipay', 'bancontact', 'eps', 'giropay', 'p24', 'sepa_debit', 'sofort'],
  currencies: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'],
  defaultCurrency: 'usd',
  defaultLocale: 'auto',
};

type WebhookProcessor = {
  verifyWebhook: (payload: any, signature: string, secret: string) => Promise<boolean>;
  processEvent: (event: any) => Promise<void>;
};

const PAYMENT_PROVIDERS: Record<PaymentProvider, WebhookProcessor> = {
  stripe: {
    verifyWebhook: verifyStripeWebhook,
    processEvent: processStripeEvent,
  },
  paypal: {
    verifyWebhook: verifyPayPalWebhook,
    processEvent: processPayPalEvent,
  },
  razorpay: {
    verifyWebhook: verifyRazorpayWebhook,
    processEvent: processRazorpayEvent,
  },
} as const;

/**
 * Verify payment webhook from payment provider
 */
export const verifyPaymentWebhook = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const provider = req.params.provider as PaymentProvider;
  const ipAddress = getClientIp(req);
  let webhookDelivery;

  try {
    // Log incoming webhook for debugging
    console.log(`[${new Date().toISOString()}] Received webhook from ${provider}`, {
      ip: ipAddress,
      path: req.path,
      headers: req.headers,
    });

    if (!PAYMENT_PROVIDERS[provider]) {
      throw new Error('Unsupported payment provider');
    }

    const signature = getSignatureFromRequest(req, provider);
    const payload = req.body;
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new Error('Missing request body');
    }

    // Create webhook delivery record
    webhookDelivery = await createWebhookDelivery(
      payload.type || 'unknown',
      payload,
      req.originalUrl,
      provider
    );

    const webhookSecret = getWebhookSecret(provider);
    const isValid = await verifyWebhookSignature(payload, signature, webhookSecret);

    if (!isValid) {
      const error = new Error('Invalid webhook signature');
      error.name = 'WebhookVerificationError';
      throw error;
    }

    // Process the event
    await PAYMENT_PROVIDERS[provider].processEvent(payload);

    // Update delivery status
    if (webhookDelivery) {
      await updateWebhookDelivery(
        webhookDelivery.id,
        WebhookStatus.DELIVERED,
        { success: true },
        null
      );
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Webhook error:`, error);
    
    // Update delivery status with error
    if (webhookDelivery) {
      await updateWebhookDelivery(
        webhookDelivery.id,
        WebhookStatus.FAILED,
        null,
        error.message
      );
    }

    // Schedule retry for transient errors
    if (isTransientError(error) && webhookDelivery) {
      setTimeout(() => retryFailedWebhooks(), 5 * 60 * 1000); // Retry after 5 minutes
    }

    res.status(400).json({ 
      error: 'Webhook processing failed',
      requestId: webhookDelivery?.id,
      timestamp: new Date().toISOString(),
      executionTime: `${Date.now() - startTime}ms`
    });
  }
};

// Helper function to determine if an error is transient
function isTransientError(error: Error): boolean {
  // List of error types that might be transient
  const transientErrors = [
    'NetworkError',
    'TimeoutError',
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED'
  ];

  return transientErrors.some(type => 
    error.name.includes(type) || 
    error.message.includes(type)
  );
}

function getSignatureFromRequest(req: Request, provider: PaymentProvider): string {
  const headers = req.headers;
  
  switch (provider) {
    case 'stripe':
      return headers['stripe-signature'] as string;
    case 'paypal':
      return headers['paypal-transmission-id'] as string;
    case 'razorpay':
      return headers['x-razorpay-signature'] as string;
    default:
      return '';
  }
}

function getWebhookSecret(provider: PaymentProvider): string {
  const envVar = `${provider.toUpperCase()}_WEBHOOK_SECRET`;
  const secret = process.env[envVar];
  
  if (!secret) {
    throw new Error(`Missing webhook secret for provider: ${provider}`);
  }
  
  return secret;
}

/**
 * Verify a payment status with idempotency support
 */
export const verifyPayment = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const userId = req.user?.id;
  
  // Validate required fields
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check for idempotency
  if (idempotencyKey) {
    const existingOperation = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingOperation) {
      return res.status(200).json({
        ...existingOperation.response,
        idempotencyReplayed: true,
      });
    }
  }

  try {
    const { paymentId, provider } = req.body;

    if (!paymentId || !provider) {
      throw new Error('Missing required fields: paymentId and provider are required');
    }

    // Start a transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Verify payment with the provider
      const payment = await verifyWithProvider(paymentId, provider);

      // Store idempotency key if provided
      if (idempotencyKey) {
        await tx.idempotencyKey.create({
          data: {
            key: idempotencyKey,
            userId,
            requestPath: req.path,
            requestParams: JSON.stringify(req.body),
            response: payment,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
      }

      return payment;
    });

    // Log successful verification
    console.log(`[${new Date().toISOString()}] Payment verified`, {
      paymentId,
      provider,
      userId,
      executionTime: `${Date.now() - startTime}ms`,
    });

    res.json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Payment verification error:`, {
      error: error.message,
      stack: error.stack,
      userId,
      paymentId: req.body.paymentId,
      provider: req.body.provider,
      executionTime: `${Date.now() - startTime}ms`,
    });

    // Return appropriate status code based on error type
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ 
      error: error.message || 'Failed to verify payment',
      code: error.code,
      requestId: req.id,
    });
  }
};

// Helper functions for different payment providers
async function verifyStripeWebhook(payload: any, signature: string, secret: string): Promise<boolean> {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      secret
    );
    return true;
  } catch (err) {
    console.error('Stripe webhook verification failed:', err);
    return false;
  }
}

async function processStripeEvent(event: any) {
  try {
    const { type, data } = event;
    const paymentIntent = data.object;

    switch (type) {
      case 'payment_intent.succeeded':
        await handleSuccessfulPayment(paymentIntent.id, 'stripe');
        break;
      case 'payment_intent.payment_failed':
        await handleFailedPayment(paymentIntent.id, 'stripe');
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled Stripe event type: ${type}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error processing Stripe event:', errorMessage);
    throw new Error(`Failed to process Stripe event: ${errorMessage}`);
  }
}

async function verifyPayPalWebhook(payload: any, signature: string, secret: string): Promise<boolean> {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
      
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(`sha256=${expectedSignature}`, 'utf8')
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error verifying PayPal webhook:', errorMessage);
    return false;
  }
}

async function processPayPalEvent(event: any) {
  try {
    const { event_type, resource } = event;
    
    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handleSuccessfulPayment(resource.id, 'paypal');
        break;
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.FAILED':
        await handleFailedPayment(resource.id, 'paypal');
        break;
      default:
        console.log(`Unhandled PayPal event type: ${event_type}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error processing PayPal event:', errorMessage);
    throw new Error(`Failed to process PayPal event: ${errorMessage}`);
  }
}

async function verifyRazorpayWebhook(payload: any, signature: string, secret: string): Promise<boolean> {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
      
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error verifying Razorpay webhook:', errorMessage);
    return false;
  }
}

async function processRazorpayEvent(event: any) {
  try {
    const { event: eventType, payload } = event;
    
    switch (eventType) {
      case 'payment.captured':
        await handleSuccessfulPayment(payload.payment.entity.id, 'razorpay');
        break;
      case 'payment.failed':
        await handleFailedPayment(payload.payment.entity.id, 'razorpay');
        break;
      default:
        console.log(`Unhandled Razorpay event type: ${eventType}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error processing Razorpay event:', errorMessage);
    throw new Error(`Failed to process Razorpay event: ${errorMessage}`);
  }
}

// Helper functions
async function verifyWithProvider(paymentId: string, provider: PaymentProvider) {
  try {
    switch (provider) {
      case 'stripe':
        return await verifyWithStripe(paymentId);
      case 'paypal':
        return await verifyWithPayPal(paymentId);
      case 'razorpay':
        return await verifyWithRazorpay(paymentId);
      default:
        throw new Error('Unsupported payment provider');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error verifying payment with ${provider}:`, errorMessage);
    return { verified: false, status: 'verification_failed' };
  }
}

async function handleSuccessfulPayment(paymentId: string, provider: PaymentProvider) {
  try {
    // Update payment status in database
    const payment = await Payment.findByPaymentId(paymentId);
    
    if (!payment) {
      console.error(`Payment not found: ${paymentId}`);
      return;
    }

    await Payment.updateByPaymentId(paymentId, {
      status: 'succeeded',
      verified: true,
      verifiedAt: new Date(),
      lastVerifiedAt: new Date(),
    });

    // Update order status
    await prisma.order.updateMany({
      where: { paymentId },
      data: { status: 'paid', paymentStatus: 'verified' },
    });

    // Send confirmation email
    const order = await prisma.order.findFirst({
      where: { paymentId },
      include: { user: true },
    });

    if (order?.user?.email) {
      await sendVerificationEmail(order.user.email, {
        type: 'payment_confirmation',
        orderId: order.id,
        amount: payment.amount,
        currency: payment.currency,
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error handling successful payment:', errorMessage);
    throw new Error(`Failed to handle successful payment: ${errorMessage}`);
  }
}

async function handleFailedPayment(paymentId: string, provider: PaymentProvider) {
  try {
    // Update payment status in database
    await Payment.updateByPaymentId(paymentId, {
      status: 'failed',
      verified: false,
      lastVerifiedAt: new Date(),
    });

    // Update order status
    await prisma.order.updateMany({
      where: { paymentId },
      data: { status: 'payment_failed', paymentStatus: 'failed' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error handling failed payment:', errorMessage);
    throw new Error(`Failed to handle failed payment: ${errorMessage}`);
  }
}

// Provider-specific verification functions
async function verifyWithStripe(paymentId: string) {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    
    return {
      verified: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error verifying with Stripe:', errorMessage);
    return { verified: false, status: 'verification_failed' };
  }
}

async function verifyWithPayPal(paymentId: string) {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');
    
    const { data } = await axios.get(
      `${process.env.PAYPAL_API_URL || 'https://api-m.paypal.com'}/v2/payments/captures/${paymentId}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      verified: data.status === 'COMPLETED',
      status: data.status,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error verifying with PayPal:', errorMessage);
    return { verified: false, status: 'verification_failed' };
  }
}

async function verifyWithRazorpay(paymentId: string) {
  try {
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString('base64');
    
    const { data } = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      verified: data.status === 'captured',
      status: data.status,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error verifying with Razorpay:', errorMessage);
    return { verified: false, status: 'verification_failed' };
  }
}
