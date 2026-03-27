import dotenv from 'dotenv';

dotenv.config();

type PaymentProvider = 'stripe' | 'paypal' | 'razorpay' | 'other';

interface PaymentProviderConfig {
  enabled: boolean;
  name: string;
  credentials: {
    secretKey: string;
    publishableKey?: string;
    webhookSecret?: string;
    clientId?: string;
  };
  settings: {
    currency: string;
    minAmount: number;
    maxAmount: number;
    feePercentage: number;
    fixedFee: number;
  };
}

const paymentConfig: Record<PaymentProvider, PaymentProviderConfig> = {
  stripe: {
    enabled: !!process.env.STRIPE_SECRET_KEY,
    name: 'Stripe',
    credentials: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    settings: {
      currency: 'usd',
      minAmount: 0.5, // $0.50
      maxAmount: 100000, // $100,000
      feePercentage: 2.9, // 2.9%
      fixedFee: 0.3, // $0.30
    },
  },
  paypal: {
    enabled: !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_SECRET,
    name: 'PayPal',
    credentials: {
      secretKey: process.env.PAYPAL_SECRET || '',
      clientId: process.env.PAYPAL_CLIENT_ID,
      webhookSecret: process.env.PAYPAL_WEBHOOK_ID,
    },
    settings: {
      currency: 'usd',
      minAmount: 1, // $1.00
      maxAmount: 100000, // $100,000
      feePercentage: 3.49, // 3.49%
      fixedFee: 0, // $0.00
    },
  },
  razorpay: {
    enabled: !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET,
    name: 'Razorpay',
    credentials: {
      secretKey: process.env.RAZORPAY_KEY_SECRET || '',
      clientId: process.env.RAZORPAY_KEY_ID,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    },
    settings: {
      currency: 'inr',
      minAmount: 1, // ₹1.00
      maxAmount: 10000000, // ₹10,000,000
      feePercentage: 2.5, // 2.5%
      fixedFee: 0, // ₹0.00
    },
  },
  other: {
    enabled: false,
    name: 'Other',
    credentials: {
      secretKey: '',
    },
    settings: {
      currency: 'usd',
      minAmount: 0,
      maxAmount: 0,
      feePercentage: 0,
      fixedFee: 0,
    },
  },
};

// Get enabled payment providers
export const enabledPaymentProviders = Object.entries(paymentConfig)
  .filter(([_, config]) => config.enabled)
  .map(([key]) => key as PaymentProvider);

// Get provider configuration
export const getPaymentProviderConfig = (provider: PaymentProvider) => {
  return paymentConfig[provider] || paymentConfig.other;
};

// Validate if a provider is enabled
export const isProviderEnabled = (provider: PaymentProvider) => {
  return paymentConfig[provider]?.enabled || false;
};

// Get default currency for a provider
export const getProviderCurrency = (provider: PaymentProvider) => {
  return paymentConfig[provider]?.settings.currency || 'usd';
};

// Get supported currencies
export const getSupportedCurrencies = () => {
  return {
    usd: 'US Dollar',
    eur: 'Euro',
    gbp: 'British Pound',
    jpy: 'Japanese Yen',
    inr: 'Indian Rupee',
    // Add more currencies as needed
  };
};

// Get currency symbol
export const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    usd: '$',
    eur: '€',
    gbp: '£',
    jpy: '¥',
    inr: '₹',
  };
  return symbols[currency.toLowerCase()] || '$';
};

export default paymentConfig;
