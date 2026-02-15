import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { Payment, PaymentCreateInput, PaymentUpdateInput } from '../models/PaymentModel';
import { emailService } from './emailService';
import { verifyWithProvider } from '../utils/paymentUtils';

const prisma = new PrismaClient();

class PaymentService {
  /**
   * Create a new payment record
   */
  async createPayment(paymentData: PaymentCreateInput): Promise<Payment> {
    try {
      const payment = await prisma.payment.create({
        data: {
          id: uuidv4(),
          paymentId: paymentData.paymentId,
          orderId: paymentData.orderId,
          userId: paymentData.userId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'USD',
          status: paymentData.status || 'pending',
          provider: paymentData.provider,
          providerData: paymentData.providerData || {},
          metadata: paymentData.metadata || {},
          verified: false,
        },
      });

      return payment as unknown as Payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<Payment | null> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id },
      });
      return payment as unknown as Payment | null;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new Error('Failed to fetch payment');
    }
  }

  /**
   * Get payment by payment ID
   */
  async getPaymentByPaymentId(paymentId: string): Promise<Payment | null> {
    try {
      const payment = await prisma.payment.findFirst({
        where: { paymentId },
      });
      return payment as unknown as Payment | null;
    } catch (error) {
      console.error('Error fetching payment by payment ID:', error);
      throw new Error('Failed to fetch payment by payment ID');
    }
  }

  /**
   * Update payment
   */
  async updatePayment(id: string, data: PaymentUpdateInput): Promise<Payment> {
    try {
      const payment = await prisma.payment.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return payment as unknown as Payment;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw new Error('Failed to update payment');
    }
  }

  /**
   * Process payment with provider
   */
  async processPayment(paymentId: string, paymentMethod: any): Promise<Payment> {
    const payment = await this.getPaymentByPaymentId(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    try {
      // Process payment with the provider
      const result = await verifyWithProvider(paymentId, payment.provider);
      
      // Update payment status
      const updatedPayment = await this.updatePayment(payment.id, {
        status: result.status as PaymentStatus,
        verified: result.verified,
        verifiedAt: result.verified ? new Date() : payment.verifiedAt,
        lastVerifiedAt: new Date(),
        providerData: {
          ...(payment.providerData as object || {}),
          paymentMethod,
          lastVerification: {
            timestamp: new Date().toISOString(),
            status: result.status,
            verified: result.verified,
          },
        },
      });

      // Send notification
      await this.sendPaymentNotification(updatedPayment);

      return updatedPayment;
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Update payment status to failed
      await this.updatePayment(payment.id, {
        status: 'failed',
        lastVerifiedAt: new Date(),
        providerData: {
          ...(payment.providerData as object || {}),
          error: error instanceof Error ? error.message : 'Unknown error',
          lastVerification: {
            timestamp: new Date().toISOString(),
            status: 'failed',
            verified: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });

      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Payment> {
    const payment = await this.getPaymentByPaymentId(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'succeeded') {
      throw new Error('Only succeeded payments can be refunded');
    }

    try {
      // Process refund with the provider
      // This is a simplified example - in a real app, you would call the payment provider's API
      const refundAmount = amount || payment.amount;
      
      // Update payment status to refunded
      const updatedPayment = await this.updatePayment(payment.id, {
        status: 'refunded',
        providerData: {
          ...(payment.providerData as object || {}),
          refund: {
            amount: refundAmount,
            reason: reason || 'Refund requested',
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Send refund notification
      await this.sendRefundNotification(updatedPayment, refundAmount, reason);

      return updatedPayment;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Send payment notification
   */
  private async sendPaymentNotification(payment: Payment): Promise<void> {
    try {
      const emailData = {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        date: new Date().toISOString(),
      };

      await emailService.sendTemplateEmail(
        'user@example.com', // Replace with actual user email
        payment.status === 'succeeded' ? 'payment_confirmation' : 'payment_failed',
        emailData
      );
    } catch (error) {
      console.error('Error sending payment notification:', error);
      // Don't throw error to avoid breaking the payment flow
    }
  }

  /**
   * Send refund notification
   */
  private async sendRefundNotification(payment: Payment, amount: number, reason?: string): Promise<void> {
    try {
      const emailData = {
        orderId: payment.orderId,
        amount: amount,
        currency: payment.currency,
        reason: reason || 'Refund processed',
        date: new Date().toISOString(),
      };

      await emailService.sendTemplateEmail(
        'user@example.com', // Replace with actual user email
        'refund_processed',
        emailData
      );
    } catch (error) {
      console.error('Error sending refund notification:', error);
      // Don't throw error to avoid breaking the refund flow
    }
  }

  /**
   * List payments with pagination and filters
   */
  async listPayments(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{ payments: Payment[]; total: number }> {
    const {
      limit = 10,
      offset = 0,
      status,
      startDate,
      endDate,
    } = options;

    try {
      const where: any = { userId };
      
      if (status) {
        where.status = status;
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where }),
      ]);

      return {
        payments: payments as unknown as Payment[],
        total,
      };
    } catch (error) {
      console.error('Error listing payments:', error);
      throw new Error('Failed to list payments');
    }
  }
}

export const paymentService = new PaymentService();
