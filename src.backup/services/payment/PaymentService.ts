import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import Stripe from 'stripe';
import { logger } from '../../utils/logger';
import { PaymentIntent, PaymentMethod, Transaction, PaymentAnalytics } from '../types';

export class PaymentService extends EventEmitter {
  private prisma: PrismaClient;
  private redis: Redis;
  private stripe: Stripe;
  private cacheTTL: number = 300; // 5 minutes

  constructor(prisma: PrismaClient, redis: Redis, stripeKey: string) {
    super();
    this.prisma = prisma;
    this.redis = redis;
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16'
    });
  }

  // Payment Processing
  public async createPaymentIntent(amount: number, currency: string, metadata: any): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata
      });

      await this.prisma.paymentIntent.create({
        data: {
          id: paymentIntent.id,
          amount,
          currency,
          status: paymentIntent.status,
          metadata
        }
      });

      this.emit('payment:created', paymentIntent);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  public async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      await this.prisma.paymentIntent.update({
        where: { id: paymentIntentId },
        data: {
          status: paymentIntent.status,
          paymentMethodId
        }
      });

      this.emit('payment:confirmed', paymentIntent);
      return paymentIntent;
    } catch (error) {
      logger.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Payment Method Management
  public async addPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: userId
      });

      await this.prisma.paymentMethod.create({
        data: {
          id: paymentMethod.id,
          userId,
          type: paymentMethod.type,
          last4: paymentMethod.card?.last4,
          brand: paymentMethod.card?.brand,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year
        }
      });

      this.emit('paymentMethod:added', paymentMethod);
      return paymentMethod;
    } catch (error) {
      logger.error('Error adding payment method:', error);
      throw error;
    }
  }

  public async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);
      await this.prisma.paymentMethod.delete({
        where: { id: paymentMethodId }
      });

      this.emit('paymentMethod:removed', paymentMethodId);
    } catch (error) {
      logger.error('Error removing payment method:', error);
      throw error;
    }
  }

  // Transaction Management
  public async getTransaction(transactionId: string): Promise<Transaction> {
    const cacheKey = `transaction:${transactionId}`;
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        paymentIntent: true,
        paymentMethod: true
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Cache the result
    await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(transaction));

    return transaction;
  }

  public async listTransactions(userId: string, filters: any = {}): Promise<Transaction[]> {
    const cacheKey = `transactions:${userId}:${JSON.stringify(filters)}`;
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        ...filters
      },
      include: {
        paymentIntent: true,
        paymentMethod: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Cache the result
    await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(transactions));

    return transactions;
  }

  // Payment Analytics
  public async getPaymentAnalytics(timeRange: string): Promise<PaymentAnalytics> {
    const cacheKey = `payment:analytics:${timeRange}`;
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [totalRevenue, averageTransactionValue, successRate, refundRate] = await Promise.all([
      this.calculateTotalRevenue(timeRange),
      this.calculateAverageTransactionValue(timeRange),
      this.calculateSuccessRate(timeRange),
      this.calculateRefundRate(timeRange)
    ]);

    const analytics: PaymentAnalytics = {
      totalRevenue,
      averageTransactionValue,
      successRate,
      refundRate,
      timestamp: new Date()
    };

    // Cache the result
    await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(analytics));

    return analytics;
  }

  // Private helper methods
  private async calculateTotalRevenue(timeRange: string): Promise<number> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: this.getDateFromTimeRange(timeRange)
        }
      },
      select: {
        amount: true
      }
    });

    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  private async calculateAverageTransactionValue(timeRange: string): Promise<number> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: this.getDateFromTimeRange(timeRange)
        }
      },
      select: {
        amount: true
      }
    });

    return transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
  }

  private async calculateSuccessRate(timeRange: string): Promise<number> {
    const [succeeded, total] = await Promise.all([
      this.prisma.transaction.count({
        where: {
          status: 'SUCCEEDED',
          createdAt: {
            gte: this.getDateFromTimeRange(timeRange)
          }
        }
      }),
      this.prisma.transaction.count({
        where: {
          createdAt: {
            gte: this.getDateFromTimeRange(timeRange)
          }
        }
      })
    ]);

    return (succeeded / total) * 100;
  }

  private async calculateRefundRate(timeRange: string): Promise<number> {
    const [refunded, total] = await Promise.all([
      this.prisma.transaction.count({
        where: {
          status: 'REFUNDED',
          createdAt: {
            gte: this.getDateFromTimeRange(timeRange)
          }
        }
      }),
      this.prisma.transaction.count({
        where: {
          status: 'SUCCEEDED',
          createdAt: {
            gte: this.getDateFromTimeRange(timeRange)
          }
        }
      })
    ]);

    return (refunded / total) * 100;
  }

  private getDateFromTimeRange(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
    }
  }

  // Webhook handling
  public async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        case 'charge.refunded':
          await this.handleRefund(event.data.object as Stripe.Charge);
          break;
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.prisma.transaction.create({
      data: {
        id: paymentIntent.id,
        userId: paymentIntent.metadata.userId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'SUCCEEDED',
        paymentIntentId: paymentIntent.id,
        paymentMethodId: paymentIntent.payment_method as string
      }
    });

    this.emit('payment:succeeded', paymentIntent);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.prisma.transaction.create({
      data: {
        id: paymentIntent.id,
        userId: paymentIntent.metadata.userId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'FAILED',
        paymentIntentId: paymentIntent.id,
        paymentMethodId: paymentIntent.payment_method as string,
        error: paymentIntent.last_payment_error?.message
      }
    });

    this.emit('payment:failed', paymentIntent);
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    await this.prisma.transaction.update({
      where: { id: charge.payment_intent as string },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundAmount: charge.amount_refunded / 100
      }
    });

    this.emit('payment:refunded', charge);
  }
} 