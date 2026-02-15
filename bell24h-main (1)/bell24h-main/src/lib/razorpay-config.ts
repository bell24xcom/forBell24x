/**
 * Razorpay Configuration for Bell24h
 * Complete configuration with Merchant ID and live keys
 */

export const RAZORPAY_CONFIG = {
  // Live API Keys
  keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_RJjxcgaBo9j0UA',
  keySecret: process.env.RAZORPAY_KEY_SECRET || 'lwTxLReQSkVL7lbrr39XSoyG',
  merchantId: process.env.RAZORPAY_MERCHANT_ID || 'DwqbZimRZG6c3y',
  
  // Payment Configuration
  currency: 'INR',
  timeout: 300, // 5 minutes
  
  // Escrow Configuration
  escrow: {
    enabled: true,
    holdPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
    releaseThreshold: 0.8, // 80% satisfaction
  },
  
  // Webhook Configuration
  webhook: {
    secret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    events: [
      'payment.captured',
      'payment.failed',
      'order.paid',
      'order.failed',
      'refund.created',
      'refund.processed',
    ],
  },
  
  // Platform Information
  platform: {
    name: 'Bell24h',
    description: 'India\'s Fastest B2B Match-Making Engine',
    website: 'https://bell24h.com',
    support_email: 'digitex.studio@gmail.com',
    support_phone: '+919004962871',
  },
  
  // Payment Methods
  paymentMethods: {
    card: true,
    upi: true,
    netbanking: true,
    wallet: true,
    emi: true,
  },
  
  // Fees and Charges
  fees: {
    processing: 0.02, // 2% processing fee
    escrow: 0.025, // 2.5% escrow fee
    refund: 0.005, // 0.5% refund fee
  },
}

/**
 * Get Razorpay instance with configuration
 */
export function getRazorpayInstance() {
  const Razorpay = require('razorpay');
  
  return new Razorpay({
    key_id: RAZORPAY_CONFIG.keyId,
    key_secret: RAZORPAY_CONFIG.keySecret,
  });
}

/**
 * Get payment order options with Merchant ID
 */
export function getPaymentOrderOptions(orderData: {
  orderId: string;
  amount: number;
  currency?: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  enableEscrow?: boolean;
}) {
  const {
    orderId,
    amount,
    currency = RAZORPAY_CONFIG.currency,
    customerId,
    customerEmail,
    customerName,
    enableEscrow = true,
  } = orderData;

  return {
    amount: Math.round(amount * 100), // Convert to paise
    currency: currency.toUpperCase(),
    receipt: orderId,
    payment_capture: enableEscrow ? 0 : 1, // Manual capture for escrow
    notes: {
      order_id: orderId,
      customer_id: customerId,
      escrow_enabled: enableEscrow.toString(),
      merchant_id: RAZORPAY_CONFIG.merchantId,
      platform: RAZORPAY_CONFIG.platform.name,
      platform_url: RAZORPAY_CONFIG.platform.website,
    },
    customer: {
      id: customerId,
      email: customerEmail,
      name: customerName,
    },
  };
}

/**
 * Validate Razorpay configuration
 */
export function validateRazorpayConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!RAZORPAY_CONFIG.keyId) {
    errors.push('RAZORPAY_KEY_ID is required');
  }
  
  if (!RAZORPAY_CONFIG.keySecret) {
    errors.push('RAZORPAY_KEY_SECRET is required');
  }
  
  if (!RAZORPAY_CONFIG.merchantId) {
    errors.push('RAZORPAY_MERCHANT_ID is required');
  }
  
  if (!RAZORPAY_CONFIG.keyId.startsWith('rzp_')) {
    errors.push('Invalid RAZORPAY_KEY_ID format');
  }
  
  if (RAZORPAY_CONFIG.keyId.includes('test') && RAZORPAY_CONFIG.keySecret.includes('test')) {
    console.warn('⚠️ Using Razorpay test keys in production');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get Razorpay frontend configuration for client-side
 */
export function getRazorpayFrontendConfig() {
  return {
    key: RAZORPAY_CONFIG.keyId,
    currency: RAZORPAY_CONFIG.currency,
    name: RAZORPAY_CONFIG.platform.name,
    description: RAZORPAY_CONFIG.platform.description,
    image: '/logo.png', // Bell24h logo
    theme: {
      color: '#6366f1', // Indigo color matching Bell24h theme
    },
    prefill: {
      name: '',
      email: '',
      contact: '',
    },
    notes: {
      merchant_id: RAZORPAY_CONFIG.merchantId,
      platform: RAZORPAY_CONFIG.platform.name,
    },
    handler: function (response: any) {
      // This will be handled by the client-side payment handler
      console.log('Payment successful:', response);
    },
  };
}
