// Payment API Client for Bell24H
// Handles all payment-related operations including Razorpay integration

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  razorpayKey: string;
  planDetails: {
    planId: string;
    planName: string;
    price: number;
    currency: string;
  };
}

export interface PaymentVerification {
  success: boolean;
  message: string;
  subscription: {
    planId: string;
    planName: string;
    activatedAt: string;
    expiresAt: string;
  };
  invoice: {
    invoiceId: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export interface SubscriptionStatus {
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  usage: {
    voiceRfqUsed: number;
    voiceRfqLimit: number;
    supplierContactsUsed: number;
    supplierContactsLimit: number;
    aiSearchesUsed: number;
    aiSearchesLimit: number;
  };
  billing: {
    nextBillingDate?: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
  };
}

export interface PaymentError {
  code: string;
  message: string;
  details?: any;
}

class PaymentAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  // Create payment order
  async createOrder(
    planId: string,
    userId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<PaymentOrder> {
    try {
      const response = await fetch(`${this.baseURL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment order');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
    planId: string,
    userId: string
  ): Promise<PaymentVerification> {
    try {
      const response = await fetch(`${this.baseURL}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          razorpay_signature: razorpaySignature,
          planId,
          userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment verification failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Get subscription status
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const response = await fetch(`${this.baseURL}/api/subscription/status?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch subscription status');
      }

      const data = await response.json();
      return data.subscription;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(userId: string, action: string, planId?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/subscription/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          planId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subscription');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Initialize Razorpay payment
  async initializeRazorpayPayment(orderData: PaymentOrder, planName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Load Razorpay script if not already loaded
        if (!(window as any).Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => this.createRazorpayInstance(orderData, planName, resolve, reject);
          script.onerror = () => reject(new Error('Failed to load Razorpay script'));
          document.head.appendChild(script);
        } else {
          this.createRazorpayInstance(orderData, planName, resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private createRazorpayInstance(
    orderData: PaymentOrder,
    planName: string,
    resolve: () => void,
    reject: (error: Error) => void
  ) {
    try {
      const options = {
        key: orderData.razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Bell24H',
        description: `Subscription: ${planName}`,
        order_id: orderData.orderId,
        handler: function (response: any) {
          resolve();
          return response;
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          },
        },
        prefill: {
          name: 'User Name', // In real app, get from user profile
          email: 'user@example.com',
          contact: '+91-98765-43210',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      reject(error as Error);
    }
  }

  // Process complete payment flow
  async processPayment(
    planId: string,
    userId: string,
    amount: number
  ): Promise<PaymentVerification> {
    try {
      // Step 1: Create order
      const orderData = await this.createOrder(planId, userId, amount);

      // Step 2: Initialize Razorpay
      const planName = orderData.planDetails.planName;
      await this.initializeRazorpayPayment(orderData, planName);

      // Step 3: Return order data for further processing
      return {
        success: true,
        message: 'Payment order created successfully',
        subscription: {
          planId,
          planName,
          activatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        invoice: {
          invoiceId: `INV_${Date.now()}`,
          amount,
          currency: 'INR',
          status: 'pending',
        },
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Handle payment success
  async handlePaymentSuccess(
    razorpayResponse: any,
    planId: string,
    userId: string
  ): Promise<PaymentVerification> {
    try {
      const verification = await this.verifyPayment(
        razorpayResponse.razorpay_payment_id,
        razorpayResponse.razorpay_order_id,
        razorpayResponse.razorpay_signature,
        planId,
        userId
      );

      return verification;
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      // In a real implementation, this would fetch from API
      // For now, return mock data
      return [
        {
          id: 'pay_123456789',
          amount: 75000,
          currency: 'INR',
          status: 'captured',
          planName: 'Professional Plan',
          date: new Date().toISOString(),
          invoiceId: 'INV_123456789',
        },
        {
          id: 'pay_987654321',
          amount: 15000,
          currency: 'INR',
          status: 'captured',
          planName: 'Basic Plan',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          invoiceId: 'INV_987654321',
        },
      ];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Generate invoice
  async generateInvoice(userId: string, planId: string, paymentDetails: any): Promise<any> {
    try {
      // In a real implementation, this would call an API
      const invoiceId = `INV_${Date.now()}_${userId}`;

      return {
        invoiceId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        gstAmount: paymentDetails.amount * 0.18,
        totalAmount: paymentDetails.amount * 1.18,
        status: 'paid',
        generatedAt: new Date().toISOString(),
        planName: paymentDetails.planName,
      };
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<any> {
    try {
      return await this.updateSubscription(userId, 'cancel');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Upgrade subscription
  async upgradeSubscription(userId: string, planId: string): Promise<any> {
    try {
      return await this.updateSubscription(userId, 'upgrade', planId);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }

  // Downgrade subscription
  async downgradeSubscription(userId: string, planId: string): Promise<any> {
    try {
      return await this.updateSubscription(userId, 'downgrade', planId);
    } catch (error) {
      console.error('Error downgrading subscription:', error);
      throw error;
    }
  }

  // Reactivate subscription
  async reactivateSubscription(userId: string): Promise<any> {
    try {
      return await this.updateSubscription(userId, 'reactivate');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  // Check payment method validity
  async validatePaymentMethod(userId: string): Promise<boolean> {
    try {
      // In a real implementation, this would validate with payment processor
      return true;
    } catch (error) {
      console.error('Error validating payment method:', error);
      return false;
    }
  }

  // Get billing information
  async getBillingInfo(userId: string): Promise<any> {
    try {
      const subscription = await this.getSubscriptionStatus(userId);
      return subscription.billing;
    } catch (error) {
      console.error('Error fetching billing info:', error);
      throw error;
    }
  }

  // Update payment method
  async updatePaymentMethod(userId: string, paymentMethod: any): Promise<any> {
    try {
      // In a real implementation, this would update payment method
      return {
        success: true,
        message: 'Payment method updated successfully',
      };
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const paymentAPI = new PaymentAPI();
