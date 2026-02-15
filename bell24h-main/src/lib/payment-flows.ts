import Razorpay from 'razorpay';
import { validatePaymentRequest, validatePaymentAmount, validatePaymentMethod } from './payment-validation';
import { razorpaySecurityMiddleware, validateRazorpaySignature } from '../middleware/razorpay-security';
import { withRateLimit, paymentRateLimiter } from '../middleware/rate-limiter';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface PaymentFlowConfig {
  amount: number;
  currency: string;
  receipt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: Record<string, string>;
  callback_url?: string;
  method?: string;
}

export interface PaymentFlowResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  signature?: string;
  error?: string;
  data?: any;
}

// 1. CREATE ORDER FLOW
export async function createOrderFlow(config: PaymentFlowConfig): Promise<PaymentFlowResult> {
  try {
    // Validate input
    const validation = validatePaymentRequest(config);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Validate amount
    const amountValidation = validatePaymentAmount(config.amount, config.currency);
    if (!amountValidation.isValid) {
      return {
        success: false,
        error: amountValidation.error
      };
    }

    // Create Razorpay order
    const orderOptions = {
      amount: config.amount,
      currency: config.currency,
      receipt: config.receipt,
      notes: config.notes || {},
      partial_payment: false,
      callback_url: config.callback_url,
      callback_method: 'post' as const
    };

    const order = await razorpay.orders.create(orderOptions);

    return {
      success: true,
      orderId: order.id,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        created_at: order.created_at
      }
    };

  } catch (error: any) {
    console.error('Create order error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create order'
    };
  }
}

// 2. VERIFY PAYMENT FLOW
export async function verifyPaymentFlow(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<PaymentFlowResult> {
  try {
    // Validate signature
    const isValidSignature = validateRazorpaySignature(
      orderId,
      paymentId,
      signature,
      process.env.RAZORPAY_KEY_SECRET!
    );

    if (!isValidSignature) {
      return {
        success: false,
        error: 'Invalid payment signature'
      };
    }

    // Fetch payment details
    const payment = await razorpay.payments.fetch(paymentId);
    const order = await razorpay.orders.fetch(orderId);

    // Verify payment status
    if (payment.status !== 'captured') {
      return {
        success: false,
        error: `Payment not captured. Status: ${payment.status}`
      };
    }

    // Verify amount matches
    if (payment.amount !== order.amount) {
      return {
        success: false,
        error: 'Payment amount mismatch'
      };
    }

    return {
      success: true,
      paymentId: payment.id,
      orderId: order.id,
      data: {
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          created_at: payment.created_at
        },
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status
        }
      }
    };

  } catch (error: any) {
    console.error('Verify payment error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify payment'
    };
  }
}

// 3. REFUND FLOW
export async function refundPaymentFlow(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
): Promise<PaymentFlowResult> {
  try {
    // Fetch original payment
    const payment = await razorpay.payments.fetch(paymentId);
    
    if (payment.status !== 'captured') {
      return {
        success: false,
        error: 'Cannot refund uncaptured payment'
      };
    }

    // Validate refund amount
    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      return {
        success: false,
        error: 'Refund amount cannot exceed original payment amount'
      };
    }

    // Create refund
    const refundOptions: any = {
      amount: refundAmount,
      notes: notes || {}
    };

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    return {
      success: true,
      data: {
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
          created_at: refund.created_at
        },
        originalPayment: {
          id: payment.id,
          amount: payment.amount
        }
      }
    };

  } catch (error: any) {
    console.error('Refund error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process refund'
    };
  }
}

// 4. PARTIAL REFUND FLOW
export async function partialRefundFlow(
  paymentId: string,
  amount: number,
  notes?: Record<string, string>
): Promise<PaymentFlowResult> {
  try {
    // Validate amount
    const amountValidation = validatePaymentAmount(amount);
    if (!amountValidation.isValid) {
      return {
        success: false,
        error: amountValidation.error
      };
    }

    // Fetch original payment
    const payment = await razorpay.payments.fetch(paymentId);
    
    if (payment.status !== 'captured') {
      return {
        success: false,
        error: 'Cannot refund uncaptured payment'
      };
    }

    if (amount >= payment.amount) {
      return {
        success: false,
        error: 'Use full refund for amounts >= original payment'
      };
    }

    // Create partial refund
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount,
      notes: notes || {}
    });

    return {
      success: true,
      data: {
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
          created_at: refund.created_at
        },
        remainingAmount: payment.amount - amount
      }
    };

  } catch (error: any) {
    console.error('Partial refund error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process partial refund'
    };
  }
}

// 5. WALLET TRANSFER FLOW
export async function walletTransferFlow(
  fromUserId: string,
  toUserId: string,
  amount: number,
  description: string
): Promise<PaymentFlowResult> {
  try {
    // Validate amount
    const amountValidation = validatePaymentAmount(amount);
    if (!amountValidation.isValid) {
      return {
        success: false,
        error: amountValidation.error
      };
    }

    // Create virtual account for transfer
    const virtualAccount = await razorpay.virtualAccounts.create({
      receivers: {
        types: ['bank_account']
      },
      description: `Transfer from ${fromUserId} to ${toUserId}`,
      customer_id: fromUserId,
      notes: {
        transfer_type: 'wallet_to_wallet',
        from_user: fromUserId,
        to_user: toUserId,
        description: description
      }
    });

    return {
      success: true,
      data: {
        virtualAccount: {
          id: virtualAccount.id,
          status: virtualAccount.status,
          created_at: virtualAccount.created_at
        },
        transfer: {
          amount: amount,
          description: description,
          from: fromUserId,
          to: toUserId
        }
      }
    };

  } catch (error: any) {
    console.error('Wallet transfer error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process wallet transfer'
    };
  }
}

// 6. ESCROW PAYMENT FLOW
export async function escrowPaymentFlow(
  buyerId: string,
  sellerId: string,
  amount: number,
  orderId: string,
  description: string
): Promise<PaymentFlowResult> {
  try {
    // Validate amount (higher limits for escrow)
    if (amount < 1000 || amount > 50000000) {
      return {
        success: false,
        error: 'Escrow amount must be between ₹10 and ₹5,00,000'
      };
    }

    // Create escrow order
    const escrowOrder = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `escrow_${orderId}_${Date.now()}`,
      notes: {
        escrow_type: 'buyer_seller',
        buyer_id: buyerId,
        seller_id: sellerId,
        order_id: orderId,
        description: description,
        status: 'pending_delivery'
      }
    });

    return {
      success: true,
      orderId: escrowOrder.id,
      data: {
        escrowOrder: {
          id: escrowOrder.id,
          amount: escrowOrder.amount,
          currency: escrowOrder.currency,
          receipt: escrowOrder.receipt,
          status: escrowOrder.status,
          created_at: escrowOrder.created_at
        },
        escrow: {
          buyer: buyerId,
          seller: sellerId,
          amount: amount,
          orderId: orderId,
          description: description
        }
      }
    };

  } catch (error: any) {
    console.error('Escrow payment error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create escrow payment'
    };
  }
}

// 7. RELEASE ESCROW FLOW
export async function releaseEscrowFlow(
  escrowOrderId: string,
  paymentId: string,
  signature: string,
  releaseType: 'delivery_confirmed' | 'dispute_resolved' | 'timeout'
): Promise<PaymentFlowResult> {
  try {
    // Verify payment first
    const verification = await verifyPaymentFlow(escrowOrderId, paymentId, signature);
    if (!verification.success) {
      return verification;
    }

    // Fetch escrow order details
    const order = await razorpay.orders.fetch(escrowOrderId);
    
    if (!order.notes || !order.notes.escrow_type) {
      return {
        success: false,
        error: 'Not a valid escrow order'
      };
    }

    // Create release transaction
    const releaseTransaction = await razorpay.payments.capture(paymentId, order.amount, 'INR');

    return {
      success: true,
      data: {
        release: {
          transactionId: releaseTransaction.id,
          amount: releaseTransaction.amount,
          status: releaseTransaction.status,
          released_at: new Date().toISOString()
        },
        escrow: {
          orderId: escrowOrderId,
          releaseType: releaseType,
          buyer: order.notes.buyer_id,
          seller: order.notes.seller_id
        }
      }
    };

  } catch (error: any) {
    console.error('Release escrow error:', error);
    return {
      success: false,
      error: error.message || 'Failed to release escrow payment'
    };
  }
}

// 8. PAYMENT STATUS FLOW
export async function getPaymentStatusFlow(paymentId: string): Promise<PaymentFlowResult> {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    
    return {
      success: true,
      data: {
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          description: payment.description,
          created_at: payment.created_at,
          captured_at: payment.captured_at
        }
      }
    };

  } catch (error: any) {
    console.error('Get payment status error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payment status'
    };
  }
}

// 9. PAYMENT HISTORY FLOW
export async function getPaymentHistoryFlow(
  userId: string,
  limit: number = 10,
  skip: number = 0
): Promise<PaymentFlowResult> {
  try {
    const payments = await razorpay.payments.all({
      count: limit,
      skip: skip
    });

    return {
      success: true,
      data: {
        payments: payments.items.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          created_at: payment.created_at,
          description: payment.description
        })),
        count: payments.count,
        total: payments.count
      }
    };

  } catch (error: any) {
    console.error('Get payment history error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payment history'
    };
  }
}

// 10. COMPREHENSIVE PAYMENT FLOW TESTER
export async function testPaymentFlows(): Promise<{
  success: boolean;
  results: Record<string, PaymentFlowResult>;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}> {
  const results: Record<string, PaymentFlowResult> = {};
  
  try {
    // Test 1: Create Order
    const orderResult = await createOrderFlow({
      amount: 10000, // ₹100
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210'
      }
    });
    results.createOrder = orderResult;

    // Test 2: Get Payment Status (using a mock payment ID)
    const statusResult = await getPaymentStatusFlow('pay_test123');
    results.getPaymentStatus = statusResult;

    // Test 3: Payment History
    const historyResult = await getPaymentHistoryFlow('user_test123', 5, 0);
    results.getPaymentHistory = historyResult;

    // Test 4: Validation Tests
    const validationTests = {
      validAmount: validatePaymentAmount(10000),
      invalidAmount: validatePaymentAmount(50),
      validMethod: validatePaymentMethod('card'),
      invalidMethod: validatePaymentMethod('invalid')
    };
    results.validationTests = {
      success: true,
      data: validationTests
    };

    // Calculate summary
    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(result => result.success).length;
    const failed = total - passed;

    return {
      success: failed === 0,
      results,
      summary: { total, passed, failed }
    };

  } catch (error: any) {
    return {
      success: false,
      results,
      summary: { total: 0, passed: 0, failed: 1 }
    };
  }
}

// Export all payment flows with middleware
export const secureCreateOrderFlow = withRateLimit(createOrderFlow, paymentRateLimiter);
export const secureVerifyPaymentFlow = withRateLimit(verifyPaymentFlow, paymentRateLimiter);
export const secureRefundFlow = withRateLimit(refundPaymentFlow, paymentRateLimiter);
export const secureEscrowFlow = withRateLimit(escrowPaymentFlow, paymentRateLimiter);
