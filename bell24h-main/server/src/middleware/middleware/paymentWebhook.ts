import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getPaymentProviderConfig } from '../config/paymentConfig';
import { PaymentProvider } from '../models/PaymentModel';

export const verifyPaymentWebhook = (provider: PaymentProvider) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = getWebhookSignature(req, provider);
      const payload = req.body;
      
      // Get the raw body for signature verification
      const rawBody = (req as any).rawBody || JSON.stringify(payload);
      
      // Get webhook secret from config
      const config = getPaymentProviderConfig(provider);
      const webhookSecret = config.credentials.webhookSecret;
      
      if (!webhookSecret) {
        console.error(`Webhook secret not configured for ${provider}`);
        return res.status(500).json({ error: 'Webhook not configured' });
      }
      
      // Verify the webhook signature
      const isValid = await verifyWebhookSignature(provider, rawBody, signature, webhookSecret);
      
      if (!isValid) {
        console.error(`Invalid webhook signature from ${provider}`);
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      // Attach provider to request for use in route handlers
      (req as any).paymentProvider = provider;
      
      next();
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return res.status(400).json({ error: 'Invalid webhook' });
    }
  };
};

/**
 * Get the webhook signature from the request headers
 */
function getWebhookSignature(req: Request, provider: PaymentProvider): string {
  switch (provider) {
    case 'stripe':
      return req.headers['stripe-signature'] as string;
    case 'paypal':
      return req.headers['paypal-transmission-id'] as string;
    case 'razorpay':
      return `${req.headers['x-razorpay-signature']}`;
    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}

/**
 * Verify the webhook signature based on the provider
 */
async function verifyWebhookSignature(
  provider: PaymentProvider,
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    switch (provider) {
      case 'stripe':
        return verifyStripeWebhook(payload, signature, secret);
      case 'paypal':
        return verifyPayPalWebhook(payload, signature, secret);
      case 'razorpay':
        return verifyRazorpayWebhook(payload, signature, secret);
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error verifying ${provider} webhook:`, error);
    return false;
  }
}

/**
 * Verify Stripe webhook signature
 */
function verifyStripeWebhook(payload: string, signature: string, secret: string): boolean {
  const crypto = require('crypto');
  const stripe = require('stripe')(secret);
  
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      secret
    );
    return !!event;
  } catch (err) {
    return false;
  }
}

/**
 * Verify PayPal webhook signature
 */
async function verifyPayPalWebhook(
  payload: string | Buffer,
  transmissionId: string,
  webhookId: string
): Promise<boolean> {
  try {
    const auth = await getPayPalAuthToken();
    const response = await fetch(
      `https://api-m.paypal.com/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.access_token}`,
        },
        body: JSON.stringify({
          transmission_id: transmissionId,
          transmission_time: new Date().toISOString(),
          cert_url: '', // PayPal will provide this in the webhook
          webhook_id: webhookId,
          webhook_event: typeof payload === 'string' ? JSON.parse(payload) : payload,
        }),
      }
    );

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Error verifying PayPal webhook:', error);
    return false;
  }
}

/**
 * Get PayPal auth token for API requests
 */
async function getPayPalAuthToken() {
  const config = getPaymentProviderConfig('paypal');
  const auth = Buffer.from(
    `${config.credentials.clientId}:${config.credentials.secretKey}`
  ).toString('base64');

  const response = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  return response.json();
}

/**
 * Verify Razorpay webhook signature
 */
function verifyRazorpayWebhook(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const generatedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (error) {
    console.error('Error verifying Razorpay webhook:', error);
    return false;
  }
}
