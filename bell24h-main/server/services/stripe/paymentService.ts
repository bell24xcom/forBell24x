import Stripe from 'stripe';
import { db } from '../../server';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10', // Use the latest API version
  typescript: true,
});

// Stripe configuration
export const STRIPE_CONFIG = {
  paymentMethods: ['card', 'alipay', 'bancontact', 'eps', 'giropay', 'p24', 'sepa_debit', 'sofort'],
  currencies: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'],
  defaultCurrency: 'usd',
  defaultLocale: 'auto',
} as const;

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  customerId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
  description?: string;
  setupFutureUsage?: 'on_session' | 'off_session';
  offSession?: boolean;
  confirm?: boolean;
  receiptEmail?: string;
  returnUrl?: string;
}

/**
 * Create a payment intent
 */
export const createPaymentIntent = async (params: CreatePaymentIntentParams) => {
  try {
    const {
      amount,
      currency = 'usd',
      customerId,
      paymentMethodId,
      metadata = {},
      description = '',
      setupFutureUsage,
      offSession = false,
      confirm = false,
      receiptEmail,
      returnUrl,
    } = params;

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: currency.toLowerCase(),
      metadata,
      description,
      payment_method_types: STRIPE_CONFIG.paymentMethods as any[],
      capture_method: 'automatic',
      confirm,
      confirmation_method: confirm ? 'manual' : 'automatic',
      setup_future_usage: setupFutureUsage,
      off_session: offSession,
    };

    if (customerId) {
      paymentIntentParams.customer = customerId;
    }

    if (paymentMethodId) {
      paymentIntentParams.payment_method = paymentMethodId;
    }

    if (receiptEmail) {
      paymentIntentParams.receipt_email = receiptEmail;
    }

    if (returnUrl) {
      paymentIntentParams.return_url = returnUrl;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm a payment intent
 */
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId?: string,
  receiptEmail?: string
) => {
  try {
    const params: Stripe.PaymentIntentConfirmParams = {};
    
    if (paymentMethodId) {
      params.payment_method = paymentMethodId;
    }
    
    if (receiptEmail) {
      params.receipt_email = receiptEmail;
    }
    
    return await stripe.paymentIntents.confirm(paymentIntentId, params);
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw error;
  }
};

/**
 * Create a customer in Stripe
 */
export const createCustomer = async (
  email: string,
  name?: string,
  metadata: Record<string, string> = {}
) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Get or create a customer in Stripe
 */
export const getOrCreateCustomer = async (userId: string, email: string, name?: string) => {
  try {
    // Check if user exists in database
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // If user already has a Stripe customer ID, return it
    if (user.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        if (!customer.deleted) {
          return customer as Stripe.Customer;
        }
      } catch (error) {
        // Customer not found in Stripe, continue to create a new one
        console.warn(`Customer ${user.stripeCustomerId} not found in Stripe, creating a new one`);
      }
    }

    // Create a new customer in Stripe
    const customer = await createCustomer(email, name, { userId });
    
    // Update user with the new Stripe customer ID
    await db.update(users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(users.id, userId));

    return customer;
  } catch (error) {
    console.error('Error in getOrCreateCustomer:', error);
    throw error;
  }
};

/**
 * Create a setup intent for saving payment methods
 */
export const createSetupIntent = async (customerId: string, metadata: Record<string, string> = {}) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: STRIPE_CONFIG.paymentMethods as any[],
      metadata,
    });
    return setupIntent;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw error;
  }
};

/**
 * Get customer's payment methods
 */
export const getCustomerPaymentMethods = async (customerId: string, type: Stripe.PaymentMethodListParams.Type = 'card') => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });
    return paymentMethods.data;
  } catch (error) {
    console.error('Error getting customer payment methods:', error);
    throw error;
  }
};

/**
 * Attach a payment method to a customer
 */
export const attachPaymentMethod = async (paymentMethodId: string, customerId: string) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    return paymentMethod;
  } catch (error) {
    console.error('Error attaching payment method:', error);
    throw error;
  }
};

/**
 * Detach a payment method from a customer
 */
export const detachPaymentMethod = async (paymentMethodId: string) => {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error('Error detaching payment method:', error);
    throw error;
  }
};

/**
 * Create a subscription
 */
export const createSubscription = async ({
  customerId,
  priceId,
  paymentMethodId,
  metadata = {},
  trialPeriodDays,
  defaultPaymentMethod = true,
}: {
  customerId: string;
  priceId: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
  defaultPaymentMethod?: boolean;
}) => {
  try {
    // Attach payment method if provided
    if (paymentMethodId) {
      await attachPaymentMethod(paymentMethodId, customerId);

      // Set as default payment method if requested
      if (defaultPaymentMethod) {
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }
    }

    // Create subscription
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
      metadata,
      off_session: true,
    };

    if (trialPeriodDays) {
      subscriptionParams.trial_period_days = trialPeriodDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd = false) => {
  try {
    if (cancelAtPeriodEnd) {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * Create a checkout session
 */
export const createCheckoutSession = async ({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  metadata = {},
  mode: modeParam = 'subscription',
  allowPromotionCodes = true,
  subscriptionData,
  lineItems,
}: {
  priceId?: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  mode?: 'payment' | 'setup' | 'subscription';
  allowPromotionCodes?: boolean;
  subscriptionData?: Stripe.Checkout.SessionCreateParams.SubscriptionData;
  lineItems?: Stripe.Checkout.SessionCreateParams.LineItem[];
}) => {
  try {
    const mode: 'payment' | 'setup' | 'subscription' = modeParam;
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: STRIPE_CONFIG.paymentMethods as any[],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      metadata,
      allow_promotion_codes: allowPromotionCodes,
      subscription_data: subscriptionData,
      line_items: lineItems || (priceId ? [
        {
          price: priceId,
          quantity: 1,
        },
      ] : undefined),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Handle Stripe webhook events
 */
export const handleWebhookEvent = async (payload: Buffer, signature: string, webhookSecret: string) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(failedPaymentIntent);
        break;
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(failedInvoice);
        break;
      // Add more event handlers as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { success: true, event };
  } catch (error) {
    console.error('Error handling webhook event:', error);
    throw error;
  }
};

// Webhook event handlers
const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  // Handle successful checkout session
  console.log('Checkout session completed:', session.id);
  // Add your business logic here
};

const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  // Handle successful payment
  console.log('Payment intent succeeded:', paymentIntent.id);
  // Add your business logic here
};

const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  // Handle failed payment
  console.log('Payment intent failed:', paymentIntent.id);
  // Add your business logic here
};

const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  // Handle successful subscription payment
  console.log('Invoice payment succeeded:', invoice.id);
  // Add your business logic here
};

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  // Handle failed subscription payment
  console.log('Invoice payment failed:', invoice.id);
  // Add your business logic here
};

export default {
  createPaymentIntent,
  confirmPaymentIntent,
  createCustomer,
  getOrCreateCustomer,
  createSetupIntent,
  getCustomerPaymentMethods,
  attachPaymentMethod,
  detachPaymentMethod,
  createSubscription,
  cancelSubscription,
  createCheckoutSession,
  handleWebhookEvent,
  STRIPE_CONFIG,
};
