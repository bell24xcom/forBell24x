import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import {
  createPaymentIntent,
  createSetupIntent,
  getCustomerPaymentMethods,
  attachPaymentMethod,
  detachPaymentMethod,
  createSubscription,
  cancelSubscription,
  createCheckoutSession,
  handleWebhookEvent,
  getOrCreateCustomer,
  STRIPE_CONFIG,
} from '../services/stripe/paymentService';
import { sendPaymentConfirmationEmail, sendPaymentFailedEmail } from '../services/emailService';

/**
 * Create a new payment intent
 */
export const createPaymentIntentHandler = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'usd', customerId, paymentMethodId, metadata = {} } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate currency
    if (!STRIPE_CONFIG.currencies.includes(currency.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Unsupported currency', 
        supportedCurrencies: STRIPE_CONFIG.currencies 
      });
    }

    // Get or create customer
    let stripeCustomerId = customerId;
    if (!stripeCustomerId) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const customer = await getOrCreateCustomer(userId, user.email, user.name || undefined);
      stripeCustomerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      customerId: stripeCustomerId,
      paymentMethodId,
      metadata: {
        userId,
        ...metadata,
      },
      setupFutureUsage: 'off_session',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      requiresAction: paymentIntent.status === 'requires_action',
      paymentMethodTypes: paymentIntent.payment_method_types,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
      code: error.code,
    });
  }
};

/**
 * Create a setup intent for saving payment methods
 */
export const createSetupIntentHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get or create customer
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await getOrCreateCustomer(userId, user.email, user.name || undefined);
    
    // Create setup intent
    const setupIntent = await createSetupIntent(customer.id, {
      userId,
      type: 'setup_intent',
    });

    res.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      status: setupIntent.status,
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create setup intent',
      code: error.code,
    });
  }
};

/**
 * Get customer's payment methods
 */
export const getPaymentMethodsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user with Stripe customer ID
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.stripeCustomerId) {
      return res.json({
        paymentMethods: [],
      });
    }

    // Get payment methods
    const paymentMethods = await getCustomerPaymentMethods(user.stripeCustomerId);
    
    // Format payment methods
    const formattedMethods = paymentMethods.map(method => ({
      id: method.id,
      type: method.type,
      card: method.card ? {
        brand: method.card.brand,
        last4: method.card.last4,
        expMonth: method.card.exp_month,
        expYear: method.card.exp_year,
      } : undefined,
      billingDetails: method.billing_details,
      created: method.created,
    }));

    res.json({
      paymentMethods: formattedMethods,
    });
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get payment methods',
      code: error.code,
    });
  }
};

/**
 * Attach a payment method to a customer
 */
export const attachPaymentMethodHandler = async (req: Request, res: Response) => {
  try {
    const { paymentMethodId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }

    // Get or create customer
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await getOrCreateCustomer(userId, user.email, user.name || undefined);
    
    // Attach payment method
    const paymentMethod = await attachPaymentMethod(paymentMethodId, customer.id);
    
    res.json({
      id: paymentMethod.id,
      type: paymentMethod.type,
      card: paymentMethod.card ? {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
      } : undefined,
      billingDetails: paymentMethod.billing_details,
      created: paymentMethod.created,
    });
  } catch (error) {
    console.error('Error attaching payment method:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to attach payment method',
      code: error.code,
    });
  }
};

/**
 * Detach a payment method from a customer
 */
export const detachPaymentMethodHandler = async (req: Request, res: Response) => {
  try {
    const { paymentMethodId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }

    // Verify the payment method belongs to the user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the payment method to verify ownership
    const paymentMethods = await getCustomerPaymentMethods(user.stripeCustomerId);
    const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
    
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    
    // Detach payment method
    await detachPaymentMethod(paymentMethodId);
    
    res.json({
      success: true,
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    console.error('Error detaching payment method:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to detach payment method',
      code: error.code,
    });
  }
};

/**
 * Create a subscription
 */
export const createSubscriptionHandler = async (req: Request, res: Response) => {
  try {
    const { priceId, paymentMethodId, trialPeriodDays } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Get or create customer
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await getOrCreateCustomer(userId, user.email, user.name || undefined);
    
    // Create subscription
    const subscription = await createSubscription({
      customerId: customer.id,
      priceId,
      paymentMethodId,
      trialPeriodDays,
      metadata: {
        userId,
        email: user.email,
      },
    });

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      latestInvoice: subscription.latest_invoice,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create subscription',
      code: error.code,
    });
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscriptionHandler = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd = true } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    // In a real application, you would want to verify that the subscription belongs to the user
    // This is a simplified example
    
    // Cancel subscription
    const subscription = await cancelSubscription(subscriptionId, cancelAtPeriodEnd);
    
    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at,
      currentPeriodEnd: subscription.current_period_end,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      code: error.code,
    });
  }
};

/**
 * Create a checkout session
 */
export const createCheckoutSessionHandler = async (req: Request, res: Response) => {
  try {
    const { priceId, successUrl, cancelUrl, mode = 'subscription', allowPromotionCodes = true } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Success URL and Cancel URL are required' });
    }

    // Get or create customer
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await getOrCreateCustomer(userId, user.email, user.name || undefined);
    
    // Create checkout session
    const session = await createCheckoutSession({
      priceId,
      customerId: customer.id,
      successUrl,
      cancelUrl,
      mode: mode as 'payment' | 'setup' | 'subscription',
      allowPromotionCodes,
      metadata: {
        userId,
        email: user.email,
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
      code: error.code,
    });
  }
};

/**
 * Handle Stripe webhook events
 */
export const handleWebhookHandler = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).json({ error: 'Missing signature or webhook secret' });
    }

    // Handle the webhook event
    const result = await handleWebhookEvent(req.body, signature, webhookSecret);
    
    res.json({ received: true, event: result.event });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Webhook handler failed',
      code: error.code,
    });
  }
};

export default {
  createPaymentIntentHandler,
  createSetupIntentHandler,
  getPaymentMethodsHandler,
  attachPaymentMethodHandler,
  detachPaymentMethodHandler,
  createSubscriptionHandler,
  cancelSubscriptionHandler,
  createCheckoutSessionHandler,
  handleWebhookHandler,
};
