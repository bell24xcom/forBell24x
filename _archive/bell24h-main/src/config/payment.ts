// Payment Gateway Configuration
export const paymentConfig = {
  razorpay: {
    keyId: 'rzp_live_mk8XL8QrrZ4rjn',
    keySecret: 'AKs4G2qmWx2YjhdOwzhrsZTL',
    currency: 'INR',
    features: ['UPI', 'NetBanking', 'Cards', 'Wallets'],
    compliance: ['GST', 'UPI'],
    escrow: true,
    milestoneReleases: true
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_key_here',
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_here',
    currencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'],
    features: ['Cards', 'Bank Transfers', 'Digital Wallets'],
    international: true,
    crossBorder: true
  }
};

// Payment Router Configuration
export const paymentRouter = {
  indianSuppliers: 'razorpay',
  internationalSuppliers: 'stripe',
  autoDetect: (supplier: any) => {
    return supplier.country === 'IN' ? 'razorpay' : 'stripe';
  }
};

// Enhanced Wallet Configuration
export const walletConfig = {
  supportedCurrencies: ['INR', 'USD', 'EUR'],
  escrowEnabled: true,
  milestoneReleases: true,
  dualGateway: true,
  compliance: {
    india: ['UPI', 'GST'],
    international: ['PCI', 'GDPR']
  }
}; 
