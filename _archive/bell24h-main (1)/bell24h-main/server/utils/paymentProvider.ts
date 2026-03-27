import Stripe from 'stripe';
import axios from 'axios';
import { PaymentProvider, PaymentStatus } from '../models/PaymentModel';
import { getPaymentProviderConfig } from '../config/paymentConfig';

interface PaymentVerificationResult {
  status: string;
  verified: boolean;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
  error?: string;
}

class PaymentProviderService {
  private stripe: Stripe | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    const stripeConfig = getPaymentProviderConfig('stripe');
    if (stripeConfig.enabled && stripeConfig.credentials.secretKey) {
      this.stripe = new Stripe(stripeConfig.credentials.secretKey, {
        apiVersion: '2023-10-16', // Use the latest API version
      });
    }
  }

  /**
   * Verify payment with the respective provider
   */
  async verifyPayment(
    paymentId: string,
    provider: PaymentProvider
  ): Promise<PaymentVerificationResult> {
    try {
      switch (provider) {
        case 'stripe':
          return this.verifyStripePayment(paymentId);
        case 'paypal':
          return this.verifyPayPalPayment(paymentId);
        case 'razorpay':
          return this.verifyRazorpayPayment(paymentId);
        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error verifying ${provider} payment:`, error);
      return {
        status: 'failed',
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a payment intent with Stripe
   */
  async createStripePaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string> = {}
  ) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: this.toStripeAmount(amount, currency),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id,
      amount: this.fromStripeAmount(paymentIntent.amount, currency),
      currency: paymentIntent.currency,
      status: this.mapStripeStatus(paymentIntent.status),
    };
  }

  /**
   * Verify a Stripe payment
   */
  private async verifyStripePayment(paymentId: string): Promise<PaymentVerificationResult> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

    return {
      status: this.mapStripeStatus(paymentIntent.status),
      verified: paymentIntent.status === 'succeeded',
      amount: this.fromStripeAmount(paymentIntent.amount, paymentIntent.currency),
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    };
  }

  /**
   * Verify a PayPal payment
   */
  private async verifyPayPalPayment(paymentId: string): Promise<PaymentVerificationResult> {
    const paypalConfig = getPaymentProviderConfig('paypal');
    if (!paypalConfig.enabled) {
      throw new Error('PayPal is not configured');
    }

    // Get access token
    const authResponse = await axios.post(
      'https://api-m.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        auth: {
          username: paypalConfig.credentials.clientId || '',
          password: paypalConfig.credentials.secretKey,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = authResponse.data.access_token;

    // Get order details
    const orderResponse = await axios.get(
      `https://api-m.paypal.com/v2/checkout/orders/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const order = orderResponse.data;
    const status = this.mapPayPalStatus(order.status);
    const amount = parseFloat(order.purchase_units[0]?.amount?.value || '0');
    const currency = order.purchase_units[0]?.amount?.currency_code || 'USD';

    return {
      status,
      verified: status === 'succeeded',
      amount,
      currency,
      metadata: order,
    };
  }

  /**
   * Verify a Razorpay payment
   */
  private async verifyRazorpayPayment(paymentId: string): Promise<PaymentVerificationResult> {
    const razorpayConfig = getPaymentProviderConfig('razorpay');
    if (!razorpayConfig.enabled) {
      throw new Error('Razorpay is not configured');
    }

    const authString = Buffer.from(
      `${razorpayConfig.credentials.clientId}:${razorpayConfig.credentials.secretKey}`
    ).toString('base64');

    const response = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const payment = response.data;
    const status = this.mapRazorpayStatus(payment.status);

    return {
      status,
      verified: status === 'captured',
      amount: payment.amount / 100, // Convert from paise to currency unit
      currency: payment.currency,
      metadata: payment,
    };
  }

  /**
   * Convert amount to Stripe's smallest currency unit (e.g., cents)
   */
  private toStripeAmount(amount: number, currency: string): number {
    // Zero-decimal currencies
    const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
    
    if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
      return Math.round(amount);
    }
    
    return Math.round(amount * 100);
  }

  /**
   * Convert from Stripe's smallest currency unit to standard amount
   */
  private fromStripeAmount(amount: number, currency: string): number {
    // Zero-decimal currencies
    const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
    
    if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
      return amount;
    }
    
    return amount / 100;
  }

  /**
   * Map Stripe status to our internal status
   */
  private mapStripeStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'succeeded': 'succeeded',
      'processing': 'pending',
      'requires_payment_method': 'failed',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'canceled': 'failed',
      'failed': 'failed',
    };

    return statusMap[status] || 'pending';
  }

  /**
   * Map PayPal status to our internal status
   */
  private mapPayPalStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'COMPLETED': 'succeeded',
      'APPROVED': 'pending',
      'CREATED': 'pending',
      'SAVED': 'pending',
      'PAYER_ACTION_REQUIRED': 'pending',
      'VOIDED': 'failed',
      'CANCELLED': 'failed',
      'FAILED': 'failed',
    };

    return statusMap[status] || 'pending';
  }

  /**
   * Map Razorpay status to our internal status
   */
  private mapRazorpayStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'captured': 'succeeded',
      'authorized': 'pending',
      'created': 'pending',
      'pending': 'pending',
      'refunded': 'refunded',
      'failed': 'failed',
      'cancelled': 'failed',
    };

    return statusMap[status] || 'pending';
  }
}

export const paymentProviderService = new PaymentProviderService();
