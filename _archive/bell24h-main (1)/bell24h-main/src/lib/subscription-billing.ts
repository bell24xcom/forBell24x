/**
 * Bell24H Automated Subscription Billing System
 *
 * Comprehensive subscription management with Stripe integration
 * Supports Pro (₹8,000/year) and Enterprise (₹50,000/year) tiers
 */

import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil' as any,
});

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'inr',
    interval: 'month',
    features: {
      rfqs: 5,
      transactionFee: 5, // 5%
      escrowFee: 2, // 2%
      support: 'email',
      ai: 'basic',
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 8000, // ₹8,000 per month
    currency: 'inr',
    interval: 'month',
    stripeId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    features: {
      rfqs: 'unlimited',
      transactionFee: 3, // 3%
      escrowFee: 1.5, // 1.5%
      support: 'priority',
      ai: 'advanced',
      invoiceFinancing: true,
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 50000, // ₹50,000 per month
    currency: 'inr',
    interval: 'month',
    stripeId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    features: {
      rfqs: 'unlimited',
      transactionFee: 2, // 2%
      escrowFee: 1, // 1%
      support: 'dedicated',
      ai: 'custom',
      invoiceFinancing: true,
      apiAccess: true,
      customIntegrations: true,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingEvent {
  id: string;
  subscriptionId: string;
  type:
    | 'subscription_created'
    | 'payment_succeeded'
    | 'payment_failed'
    | 'subscription_canceled'
    | 'invoice_generated';
  data: any;
  processedAt?: Date;
  createdAt: Date;
}

/**
 * Subscription Management Service
 */
export class SubscriptionBillingService {
  /**
   * Create a new subscription for a user
   */
  static async createSubscription({
    userId,
    tier,
    paymentMethodId,
    email,
    name,
    companyName,
  }: {
    userId: string;
    tier: 'PRO' | 'ENTERPRISE';
    paymentMethodId: string;
    email: string;
    name: string;
    companyName?: string;
  }): Promise<{ subscription: UserSubscription; clientSecret?: string }> {
    try {
      const tierConfig = SUBSCRIPTION_TIERS[tier];

      // Create or retrieve Stripe customer
      let customer = await this.findOrCreateCustomer({
        userId,
        email,
        name,
        companyName,
      });

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Set as default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: tierConfig.stripeId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          tier,
          companyName: companyName || '',
        },
      });

      // Create local subscription record
      const subscription: UserSubscription = {
        id: `sub_${Date.now()}_${userId}`,
        userId,
        tier,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customer.id,
        status: stripeSubscription.status === 'active' ? 'active' : 'inactive',
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save subscription to database (implement your DB logic here)
      await this.saveSubscription(subscription);

      // Log billing event
      await this.logBillingEvent({
        subscriptionId: subscription.id,
        type: 'subscription_created',
        data: {
          tier,
          amount: tierConfig.price,
          currency: tierConfig.currency,
          stripeSubscriptionId: stripeSubscription.id,
        },
      });

      const latestInvoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = (latestInvoice as any)?.payment_intent as Stripe.PaymentIntent;

      return {
        subscription,
        clientSecret: paymentIntent?.client_secret || undefined,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error}`);
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<UserSubscription> {
    try {
      const subscription = await this.getSubscription(subscriptionId);

      if (!subscription.stripeSubscriptionId) {
        throw new Error('No Stripe subscription found');
      }

      if (immediately) {
        // Cancel immediately
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        subscription.status = 'canceled';
      } else {
        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        subscription.cancelAtPeriodEnd = true;
      }

      subscription.updatedAt = new Date();
      await this.saveSubscription(subscription);

      // Log billing event
      await this.logBillingEvent({
        subscriptionId: subscription.id,
        type: 'subscription_canceled',
        data: {
          immediately,
          canceledAt: new Date(),
        },
      });

      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error}`);
    }
  }

  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  /**
   * Get subscription analytics
   */
  static async getSubscriptionAnalytics(
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ) {
    try {
      // Calculate date range
      const now = new Date();
      const startDate = new Date();

      switch (timeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get subscription data (implement your DB queries)
      const subscriptions = await this.getSubscriptionsInRange(startDate, now);
      const billingEvents = await this.getBillingEventsInRange(startDate, now);

      // Calculate metrics
      const totalRevenue = billingEvents
        .filter(event => event.type === 'payment_succeeded')
        .reduce((sum, event) => sum + (event.data.amount || 0), 0);

      const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
      const churnRate = this.calculateChurnRate(subscriptions, startDate, now);
      const monthlyRecurringRevenue = this.calculateMRR(subscriptions);

      const tierDistribution = subscriptions.reduce((acc, sub) => {
        acc[sub.tier] = (acc[sub.tier] || 0) + 1;
        return acc;
      }, {} as Record<SubscriptionTier, number>);

      return {
        timeframe,
        totalRevenue,
        activeSubscriptions,
        churnRate,
        monthlyRecurringRevenue,
        tierDistribution,
        revenueGrowth: this.calculateRevenueGrowth(billingEvents, timeframe),
        averageRevenuePerUser: activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0,
      };
    } catch (error) {
      console.error('Error getting subscription analytics:', error);
      throw error;
    }
  }

  // Private helper methods
  private static async findOrCreateCustomer({
    userId,
    email,
    name,
    companyName,
  }: {
    userId: string;
    email: string;
    name: string;
    companyName?: string;
  }): Promise<Stripe.Customer> {
    // Try to find existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
        companyName: companyName || '',
      },
    });
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;
    const subscription = await this.getSubscriptionByStripeId(subscriptionId);

    if (subscription) {
      subscription.status = 'active';
      subscription.updatedAt = new Date();
      await this.saveSubscription(subscription);

      await this.logBillingEvent({
        subscriptionId: subscription.id,
        type: 'payment_succeeded',
        data: {
          amount: invoice.amount_paid,
          currency: invoice.currency,
          invoiceId: invoice.id,
        },
      });
    }
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;
    const subscription = await this.getSubscriptionByStripeId(subscriptionId);

    if (subscription) {
      subscription.status = 'past_due';
      subscription.updatedAt = new Date();
      await this.saveSubscription(subscription);

      await this.logBillingEvent({
        subscriptionId: subscription.id,
        type: 'payment_failed',
        data: {
          amount: invoice.amount_due,
          currency: invoice.currency,
          invoiceId: invoice.id,
          attemptCount: invoice.attempt_count,
        },
      });
    }
  }

  private static async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    const subscription = await this.getSubscriptionByStripeId(stripeSubscription.id);

    if (subscription) {
      subscription.status = stripeSubscription.status === 'active' ? 'active' : 'inactive';
      subscription.currentPeriodStart = new Date(
        (stripeSubscription as any).current_period_start * 1000
      );
      subscription.currentPeriodEnd = new Date(
        (stripeSubscription as any).current_period_end * 1000
      );
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      subscription.updatedAt = new Date();

      await this.saveSubscription(subscription);
    }
  }

  private static async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    const subscription = await this.getSubscriptionByStripeId(stripeSubscription.id);

    if (subscription) {
      subscription.status = 'canceled';
      subscription.updatedAt = new Date();
      await this.saveSubscription(subscription);
    }
  }

  private static calculateChurnRate(
    subscriptions: UserSubscription[],
    startDate: Date,
    endDate: Date
  ): number {
    const startCount = subscriptions.filter(
      sub => sub.createdAt <= startDate && sub.status === 'active'
    ).length;
    const canceledCount = subscriptions.filter(
      sub => sub.status === 'canceled' && sub.updatedAt >= startDate && sub.updatedAt <= endDate
    ).length;

    return startCount > 0 ? (canceledCount / startCount) * 100 : 0;
  }

  private static calculateMRR(subscriptions: UserSubscription[]): number {
    return subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => {
        const tierConfig = SUBSCRIPTION_TIERS[sub.tier];
        return sum + tierConfig.price;
      }, 0);
  }

  private static calculateRevenueGrowth(events: BillingEvent[], timeframe: string): number {
    // Implement revenue growth calculation logic
    const currentPeriodRevenue = events
      .filter(event => event.type === 'payment_succeeded')
      .reduce((sum, event) => sum + (event.data.amount || 0), 0);

    // This would need historical data for comparison
    // For now, returning a placeholder
    return 15.5; // 15.5% growth
  }

  // Database methods (implement based on your database choice)
  private static async saveSubscription(subscription: UserSubscription): Promise<void> {
    // Implement database save logic
    console.log('Saving subscription:', subscription.id);
  }

  private static async getSubscription(subscriptionId: string): Promise<UserSubscription> {
    // Implement database get logic
    throw new Error('Database method not implemented');
  }

  private static async getSubscriptionByStripeId(
    stripeId: string
  ): Promise<UserSubscription | null> {
    // Implement database get logic
    return null;
  }

  private static async getSubscriptionsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<UserSubscription[]> {
    // Implement database query logic
    return [];
  }

  private static async getBillingEventsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<BillingEvent[]> {
    // Implement database query logic
    return [];
  }

  private static async logBillingEvent(
    event: Omit<BillingEvent, 'id' | 'createdAt'>
  ): Promise<void> {
    // Implement database logging logic
    console.log('Logging billing event:', event.type);
  }
}

/**
 * Utility functions for subscription management
 */
export const SubscriptionUtils = {
  /**
   * Get user's current subscription tier benefits
   */
  getTierBenefits: (tier: SubscriptionTier) => {
    return SUBSCRIPTION_TIERS[tier].features;
  },

  /**
   * Check if user can perform an action based on their tier
   */
  canPerformAction: (tier: SubscriptionTier, action: string, currentUsage?: number) => {
    const features = SUBSCRIPTION_TIERS[tier].features;

    switch (action) {
      case 'create_rfq':
        return features.rfqs === 'unlimited' || (currentUsage || 0) < features.rfqs;
      case 'access_api':
        return 'apiAccess' in features && features.apiAccess;
      case 'invoice_financing':
        return 'invoiceFinancing' in features && features.invoiceFinancing;
      default:
        return false;
    }
  },

  /**
   * Calculate transaction fee based on tier
   */
  calculateTransactionFee: (tier: SubscriptionTier, amount: number) => {
    const feePercentage = SUBSCRIPTION_TIERS[tier].features.transactionFee;
    return (amount * feePercentage) / 100;
  },

  /**
   * Calculate escrow fee based on tier
   */
  calculateEscrowFee: (tier: SubscriptionTier, amount: number) => {
    const feePercentage = SUBSCRIPTION_TIERS[tier].features.escrowFee;
    return (amount * feePercentage) / 100;
  },

  /**
   * Format currency amount for display
   */
  formatAmount: (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },
};

export default SubscriptionBillingService;
