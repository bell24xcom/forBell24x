
// RazorpayX Test Configuration for Bell24H B2B Marketplace
export const RAZORPAY_TEST_CONFIG = {
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_TEST_KEY',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_TEST_SECRET',
  currency: 'INR',
  name: 'Bell24H B2B Marketplace',
  description: 'B2B Transaction for Bell24H',
  prefill: {
    name: 'Test User',
    email: 'test@bell24h.com',
    contact: '+919876543210',
  },
  notes: {
    address: 'Bell24H B2B Marketplace',
    merchant_order_id: 'BELL24H_ORDER_',
  },
  theme: {
    color: '#2563eb',
  },
};

// Initialize Razorpay instance for testing
export const razorpayTest = new Razorpay({
  key_id: RAZORPAY_TEST_CONFIG.key_id,
  key_secret: RAZORPAY_TEST_CONFIG.key_secret,
});

// Test transaction amounts for B2B marketplace
export const TEST_AMOUNTS = {
  MIN: 100, // ₹100 minimum
  SMALL: 1000, // ₹1,000
  MEDIUM: 50000, // ₹50,000
  LARGE: 500000, // ₹5,00,000
  MAX: 1000000, // ₹10,00,000 maximum
};

// Payment test scenarios for B2B transactions
export const PAYMENT_TEST_SCENARIOS = [
  {
    id: 'rfq_payment',
    name: 'RFQ Payment Test',
    amount: TEST_AMOUNTS.MEDIUM,
    description: 'Payment for RFQ creation and supplier matching',
    category: 'RFQ_Services',
  },
  {
    id: 'escrow_deposit',
    name: 'Escrow Deposit Test',
    amount: TEST_AMOUNTS.LARGE,
    description: 'Escrow deposit for B2B transaction security',
    category: 'Escrow_Services',
  },
  {
    id: 'wallet_topup',
    name: 'Wallet Top-up Test',
    amount: TEST_AMOUNTS.SMALL,
    description: 'Wallet recharge for quick transactions',
    category: 'Wallet_Services',
  },
  {
    id: 'subscription_payment',
    name: 'Premium Subscription Test',
    amount: TEST_AMOUNTS.MEDIUM,
    description: 'Premium membership for advanced features',
    category: 'Subscription_Services',
  },
];

// Webhook verification for security
export const verifyWebhookSignature = (
  body: string,
  signature: string,
  secret: string
): boolean => {
  const crypto = require('crypto');
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};

// Test payment creation
export const createTestPayment = async (amount: number, currency: string = 'INR') => {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `BELL24H_TEST_${Date.now()}`,
      notes: {
        test_transaction: 'true',
        marketplace: 'Bell24H',
        environment: 'test',
      },
    };

    const order = await razorpayTest.orders.create(options);
    return {
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };
  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test payment verification
export const verifyTestPayment = async (paymentId: string, orderId: string, signature: string) => {
  try {
    const crypto = require('crypto');
    const text = `${orderId}|${paymentId}`;
    const signature_expected = crypto
      .createHmac('sha256', RAZORPAY_TEST_CONFIG.key_secret)
      .update(text)
      .digest('hex');

    if (signature_expected === signature) {
      return {
        success: true,
        verified: true,
        payment_id: paymentId,
        order_id: orderId,
      };
    } else {
      return {
        success: false,
        verified: false,
        error: 'Signature verification failed',
      };
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test wallet operations
export const testWalletOperations = {
  deposit: async (amount: number, userId: string) => {
    const payment = await createTestPayment(amount);
    if (payment.success) {
      return {
        success: true,
        transaction_id: payment.order_id,
        amount,
        type: 'deposit',
        user_id: userId,
        status: 'pending',
      };
    }
    return { success: false, error: 'Deposit failed' };
  },

  withdraw: async (amount: number, userId: string) => {
    // Simulate withdrawal process
    return {
      success: true,
      transaction_id: `WITHDRAW_${Date.now()}`,
      amount,
      type: 'withdrawal',
      user_id: userId,
      status: 'processing',
    };
  },

  getBalance: async (userId: string) => {
    // Simulate balance check
    return {
      success: true,
      balance: 50000, // ₹50,000 test balance
      currency: 'INR',
      user_id: userId,
    };
  },
};

// Test escrow operations for B2B transactions
export const testEscrowOperations = {
  createEscrow: async (amount: number, buyerId: string, supplierId: string, rfqId: string) => {
    const payment = await createTestPayment(amount);
    if (payment.success) {
      return {
        success: true,
        escrow_id: `ESCROW_${Date.now()}`,
        amount,
        buyer_id: buyerId,
        supplier_id: supplierId,
        rfq_id: rfqId,
        status: 'pending',
        payment_id: payment.order_id,
      };
    }
    return { success: false, error: 'Escrow creation failed' };
  },

  releaseEscrow: async (escrowId: string, supplierId: string) => {
    return {
      success: true,
      escrow_id: escrowId,
      supplier_id: supplierId,
      status: 'released',
      released_at: new Date().toISOString(),
    };
  },

  refundEscrow: async (escrowId: string, buyerId: string) => {
    return {
      success: true,
      escrow_id: escrowId,
      buyer_id: buyerId,
      status: 'refunded',
      refunded_at: new Date().toISOString(),
    };
  },
};

// Test data for B2B marketplace
export const TEST_B2B_DATA = {
  buyers: [
    {
      id: 'BUYER_001',
      name: 'TechManufacturing Pvt Ltd',
      email: 'procurement@techmanufacturing.com',
      gstin: '27AABCT1234A1Z5',
      balance: 500000,
    },
    {
      id: 'BUYER_002',
      name: 'Green Farms Cooperative',
      email: 'purchasing@greenfarms.coop',
      gstin: '03AABCF5678B2Z9',
      balance: 3000000,
    },
  ],
  suppliers: [
    {
      id: 'SUPPLIER_001',
      name: 'TechSensors India Pvt Ltd',
      email: 'sales@techsensors.in',
      gstin: '27AABCS9876C3Z1',
      rating: 4.8,
    },
    {
      id: 'SUPPLIER_002',
      name: 'Green Agriculture Solutions',
      email: 'orders@greenagri.com',
      gstin: '03AABCS4321D4Z7',
      rating: 4.9,
    },
  ],
  rfqs: [
    {
      id: 'RFQ_001',
      title: 'Industrial IoT Sensors for Smart Manufacturing',
      budget: { min: 400000, max: 600000 },
      buyer_id: 'BUYER_001',
      status: 'active',
    },
    {
      id: 'RFQ_002',
      title: 'Organic Fertilizers for Large Scale Farming',
      budget: { min: 3000000, max: 4500000 },
      buyer_id: 'BUYER_002',
      status: 'active',
    },
  ],
};

// Payment test utilities
export const generateTestReport = (testResults: any[]) => {
  const totalTests = testResults.length;
  const passedTests = testResults.filter(result => result.success).length;
  const failedTests = totalTests - passedTests;

  return {
    summary: {
      total_tests: totalTests,
      passed: passedTests,
      failed: failedTests,
      success_rate: ((passedTests / totalTests) * 100).toFixed(2) + '%',
    },
    details: testResults,
    timestamp: new Date().toISOString(),
    environment: 'test',
    marketplace: 'Bell24H',
  };
};
