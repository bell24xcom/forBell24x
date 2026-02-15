import Stripe from 'stripe';
import { db } from '../server';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10', // Use the latest API version
  typescript: true,
});

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  customerId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export const createPaymentIntent = async ({
  amount,
  currency,
  customerId,
  paymentMethodId,
  metadata = {},
  description = '',
}: CreatePaymentIntentParams) => {
  try {
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency,
      metadata,
      description,
      automatic_payment_methods: {
        enabled: true,
      },
    };

    if (customerId) {
      paymentIntentParams.customer = customerId;
    }

    if (paymentMethodId) {
      paymentIntentParams.payment_method = paymentMethodId;
      paymentIntentParams.confirm = true;
      paymentIntentParams.off_session = true;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const createCustomer = async (email: string, name?: string) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const createSetupIntent = async (customerId: string) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
    return setupIntent;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw error;
  }
};

export const getCustomerPaymentMethods = async (customerId: string) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  } catch (error) {
    console.error('Error getting customer payment methods:', error);
    throw error;
  }
};

export const attachPaymentMethod = async (
  paymentMethodId: string,
  customerId: string
) => {
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

export const detachPaymentMethod = async (paymentMethodId: string) => {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error('Error detaching payment method:', error);
    throw error;
  }
};

export const createSubscription = async ({
  customerId,
  priceId,
  paymentMethodId,
  metadata = {},
}: {
  customerId: string;
  priceId: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Update the customer's default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
      metadata,
      off_session: true,
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const deleted = await stripe.subscriptions.cancel(subscriptionId);
    return deleted;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export const createCheckoutSession = async ({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      metadata,
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const handleWebhook = async (payload: string, signature: string) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle successful checkout
        break;
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        // Handle successful payment
        break;
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        // Handle failed payment
        break;
      // Add more event handlers as needed
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};

export default {
  createPaymentIntent,
  createCustomer,
  createSetupIntent,
  getCustomerPaymentMethods,
  attachPaymentMethod,
  detachPaymentMethod,
  createSubscription,
  cancelSubscription,
  createCheckoutSession,
  handleWebhook,
};
