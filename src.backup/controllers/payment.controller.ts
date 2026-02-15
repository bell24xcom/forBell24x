import { Request, Response } from 'express';
import { PaymentService } from '../services/payment/PaymentService';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { stripe } from '../lib/stripe';

const paymentService = new PaymentService(prisma, redis, process.env.STRIPE_SECRET_KEY!);

export class PaymentController {
  // Create payment intent
  public async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency, metadata } = req.body;
      const paymentIntent = await paymentService.createPaymentIntent(amount, currency, metadata);
      res.json(paymentIntent);
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  }

  // Confirm payment
  public async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;
      const paymentIntent = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);
      res.json(paymentIntent);
    } catch (error) {
      logger.error('Error confirming payment:', error);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  }

  // Add payment method
  public async addPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { paymentMethodId } = req.body;
      const userId = req.user!.id;
      const paymentMethod = await paymentService.addPaymentMethod(userId, paymentMethodId);
      res.json(paymentMethod);
    } catch (error) {
      logger.error('Error adding payment method:', error);
      res.status(500).json({ error: 'Failed to add payment method' });
    }
  }

  // Remove payment method
  public async removePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { paymentMethodId } = req.params;
      await paymentService.removePaymentMethod(paymentMethodId);
      res.status(200).json({ message: 'Payment method removed successfully' });
    } catch (error) {
      logger.error('Error removing payment method:', error);
      res.status(500).json({ error: 'Failed to remove payment method' });
    }
  }

  // Get transaction
  public async getTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const transaction = await paymentService.getTransaction(transactionId);
      res.json(transaction);
    } catch (error) {
      logger.error('Error getting transaction:', error);
      res.status(500).json({ error: 'Failed to get transaction' });
    }
  }

  // List transactions
  public async listTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const filters = req.query;
      const transactions = await paymentService.listTransactions(userId, filters);
      res.json(transactions);
    } catch (error) {
      logger.error('Error listing transactions:', error);
      res.status(500).json({ error: 'Failed to list transactions' });
    }
  }

  // Get payment analytics
  public async getPaymentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { timeRange } = req.query;
      const analytics = await paymentService.getPaymentAnalytics(timeRange as string);
      res.json(analytics);
    } catch (error) {
      logger.error('Error getting payment analytics:', error);
      res.status(500).json({ error: 'Failed to get payment analytics' });
    }
  }

  // Handle Stripe webhook
  public async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const sig = req.headers['stripe-signature'];
      if (!sig) {
        res.status(400).json({ error: 'No signature found' });
        return;
      }

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      await paymentService.handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      logger.error('Error handling webhook:', error);
      res.status(400).json({ error: 'Webhook error' });
    }
  }
} 