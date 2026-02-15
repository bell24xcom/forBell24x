import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';

type PaymentResponse = {
  id: string;
  amount: number;
  currency: string;
  status: 'created' | 'captured' | 'failed';
};

type PaymentRequest = {
  amount: number;
  currency?: string;
  receipt?: string;
};

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createPayment(orderOptions: PaymentRequest): Promise<PaymentResponse> {
    try {
      const options = {
        amount: orderOptions.amount * 100, // Convert to paise
        currency: orderOptions.currency || 'INR',
        receipt: orderOptions.receipt || `rcpt_${Date.now()}`,
        payment_capture: 1, // Auto-capture payment
      };

      const response = await this.razorpay.orders.create(options);
      return {
        id: response.id,
        amount: response.amount,
        currency: response.currency,
        status: 'created',
      };
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  async verifyPayment(paymentId: string): Promise<boolean> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment.status === 'captured';
    } catch (error) {
      return false;
    }
  }
}
