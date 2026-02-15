// Payment service for BELL24H marketplace
// Note: In a real application, this would be server-side only
// This is a client-side wrapper for payment operations

class PaymentService {
  private razorpayKey: string;

  constructor() {
    this.razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  }

  async createOrder(amount: number, currency = 'INR') {
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment order creation failed:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, orderId, signature }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  async processSubscription(planId: string, userId: string) {
    const plans = {
      basic: { amount: 999, features: ['Basic features'] },
      pro: { amount: 4999, features: ['Pro features', 'AI matching'] },
      enterprise: { amount: 24999, features: ['All features', 'Priority support'] },
    };

    const plan = plans[planId as keyof typeof plans];
    if (!plan) throw new Error('Invalid plan');

    return await this.createOrder(plan.amount);
  }

  // Initialize Razorpay payment
  async initializePayment(orderData: any, options: any = {}) {
    return new Promise((resolve, reject) => {
      const rzp = new (window as any).Razorpay({
        key: this.razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'BELL24H',
        description: orderData.description || 'BELL24H Marketplace Payment',
        order_id: orderData.id,
        handler: (response: any) => {
          resolve(response);
        },
        prefill: {
          name: options.name || '',
          email: options.email || '',
          contact: options.phone || '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled'));
          },
        },
        ...options,
      });

      rzp.open();
    });
  }

  // Get subscription plans
  async getSubscriptionPlans() {
    try {
      const response = await fetch('/api/payments/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(paymentId: string, amount: number, reason: string) {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, amount, reason }),
      });

      if (!response.ok) {
        throw new Error('Refund processing failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(userId: string) {
    try {
      const response = await fetch(`/api/payments/history?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();

// Payment types
export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  description?: string;
}
