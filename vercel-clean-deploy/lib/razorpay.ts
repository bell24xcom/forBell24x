// lib/razorpay.ts - Razorpay Payment API Integration
import Razorpay from 'razorpay';

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

interface CreateOrderParams {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

interface PaymentVerificationParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

class RazorpayService {
  private razorpay: Razorpay;
  private config: RazorpayConfig;

  constructor() {
    this.config = {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || ''
    };

    this.razorpay = new Razorpay({
      key_id: this.config.keyId,
      key_secret: this.config.keySecret
    });
  }

  async createOrder({ 
    amount, 
    currency = 'INR', 
    receipt, 
    notes = {} 
  }: CreateOrderParams): Promise<{ success: boolean; order?: any; error?: string }> {
    try {
      // Validate configuration
      if (!this.config.keyId || !this.config.keySecret) {
        return {
          success: false,
          error: 'Razorpay not configured - Missing API keys'
        };
      }

      // Validate amount (minimum ₹1)
      if (amount < 100) {
        return {
          success: false,
          error: 'Minimum amount is ₹1.00 (100 paise)'
        };
      }

      const orderOptions = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: receipt || `order_${Date.now()}`,
        notes: {
          platform: 'bell24h',
          ...notes
        }
      };

      const order = await this.razorpay.orders.create(orderOptions);

      return {
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          created_at: order.created_at
        }
      };

    } catch (error) {
      console.error('Razorpay Create Order Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order'
      };
    }
  }

  async verifyPayment({ 
    razorpayOrderId, 
    razorpayPaymentId, 
    razorpaySignature 
  }: PaymentVerificationParams): Promise<{ success: boolean; payment?: any; error?: string }> {
    try {
      if (!this.config.keySecret) {
        return {
          success: false,
          error: 'Razorpay not configured - Missing key secret'
        };
      }

      const crypto = require('crypto');
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', this.config.keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpaySignature) {
        // Payment is verified, fetch payment details
        const payment = await this.razorpay.payments.fetch(razorpayPaymentId);
        
        return {
          success: true,
          payment: {
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            created_at: payment.created_at
          }
        };
      } else {
        return {
          success: false,
          error: 'Invalid payment signature'
        };
      }

    } catch (error) {
      console.error('Razorpay Verification Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<{ success: boolean; refund?: any; error?: string }> {
    try {
      if (!this.config.keyId || !this.config.keySecret) {
        return {
          success: false,
          error: 'Razorpay not configured - Missing API keys'
        };
      }

      const refundOptions: any = {
        payment_id: paymentId
      };

      if (amount) {
        refundOptions.amount = amount * 100; // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundOptions);

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
          created_at: refund.created_at
        }
      };

    } catch (error) {
      console.error('Razorpay Refund Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      };
    }
  }

  // Health check for Razorpay service
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      if (!this.config.keyId || !this.config.keySecret) {
        return {
          status: 'error',
          message: 'Razorpay not configured - Missing API keys'
        };
      }

      // Test with a minimal order creation
      const testOrder = await this.createOrder({
        amount: 100, // ₹1
        receipt: 'health_check_test'
      });

      if (testOrder.success) {
        return {
          status: 'healthy',
          message: 'Razorpay service is operational'
        };
      } else {
        return {
          status: 'warning',
          message: `Razorpay service issue: ${testOrder.error}`
        };
      }

    } catch (error) {
      return {
        status: 'error',
        message: `Razorpay service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get Razorpay key for frontend
  getKeyId(): string {
    return this.config.keyId;
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();

// Export types
export type { CreateOrderParams, PaymentVerificationParams, RazorpayConfig };
