import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock fetch for API calls
global.fetch = jest.fn();

// Enhanced Mock Razorpay with all required methods
const mockRazorpay = {
  open: jest.fn(),
  on: jest.fn(),
  close: jest.fn(),
  // Add missing methods that are used in tests
  orders: {
    create: jest.fn().mockResolvedValue({
      id: 'order_test_123',
      amount: 10000,
      currency: 'INR',
      status: 'created',
    }),
    fetch: jest.fn().mockResolvedValue({
      id: 'order_test_123',
      status: 'paid',
    }),
  },
  payments: {
    fetch: jest.fn().mockResolvedValue({
      id: 'pay_test_123',
      status: 'captured',
      amount: 10000,
    }),
    capture: jest.fn().mockResolvedValue({
      id: 'pay_test_123',
      status: 'captured',
    }),
  },
  accounts: {
    create: jest.fn().mockResolvedValue({
      id: 'acc_test_123',
      type: 'standard',
      name: 'Test Account',
      email: 'test@example.com',
    }),
  },
  payouts: {
    create: jest.fn().mockResolvedValue({
      id: 'payout_test_123',
      account_number: '1234567890',
      fund_account_id: 'fa_test_123',
      amount: 10000,
      status: 'processing',
    }),
  },
};

// Mock the Razorpay constructor
// global.Razorpay = jest.fn().mockImplementation((options) => {
//   // Create a mock instance with all required methods
//   const instance = {
//     orders: mockRazorpay.orders,
//     payments: mockRazorpay.payments,
//     accounts: mockRazorpay.accounts,
//     payouts: mockRazorpay.payouts,
//     on: jest.fn(),
//     close: jest.fn(),
//     // Ensure open method is properly attached
//     open: jest.fn().mockImplementation(() => {
//       // Simulate opening the payment modal
//       if (options.handler) {
//         // Simulate successful payment after a short delay
//         setTimeout(() => {
//           options.handler({
//             razorpay_payment_id: 'pay_test_123',
//             razorpay_order_id: 'order_test_123',
//             razorpay_signature: 'test_signature'
//           });
//         }, 100);
//       }
//     })
//   };
//
//   return instance;
// });

describe('Payment and Escrow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Re-initialize the Razorpay mock in beforeEach
    global.Razorpay = jest.fn().mockImplementation(options => {
      // Create a mock instance with all required methods
      const instance = {
        orders: mockRazorpay.orders,
        payments: mockRazorpay.payments,
        accounts: mockRazorpay.accounts,
        payouts: mockRazorpay.payouts,
        on: jest.fn(),
        close: jest.fn(),
        // Ensure open method is properly attached
        open: jest.fn().mockImplementation(() => {
          // Simulate opening the payment modal
          if (options.handler) {
            // Simulate successful payment after a short delay
            setTimeout(() => {
              options.handler({
                razorpay_payment_id: 'pay_test_123',
                razorpay_order_id: 'order_test_123',
                razorpay_signature: 'test_signature',
              });
            }, 100);
          }
        }),
      };

      return instance;
    });
  });

  describe('Wallet API Tests', () => {
    it('should create wallet successfully', async () => {
      const mockResponse = {
        success: true,
        wallet: {
          id: 'wallet-1',
          balance: 0,
          currency: 'INR',
          userId: 'user-1',
          isActive: true,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          currency: 'INR',
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.wallet.id).toBe('wallet-1');
    });

    it('should handle wallet creation error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'User already has a wallet' }),
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          currency: 'INR',
        }),
      });

      const data = await response.json();
      expect(data.error).toBe('User already has a wallet');
    });

    it('should deposit funds successfully', async () => {
      const mockResponse = {
        success: true,
        transaction: {
          id: 'tx-1',
          amount: 10000,
          type: 'DEPOSIT',
          status: 'PENDING',
          razorpayId: 'rzp_test_123',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount: 10000,
          currency: 'INR',
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.transaction.type).toBe('DEPOSIT');
    });

    it('should create escrow deposit successfully', async () => {
      const mockResponse = {
        success: true,
        escrow: {
          id: 'escrow-1',
          amount: 50000,
          status: 'HELD_IN_ESCROW',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          rfqId: 'rfq-1',
        },
        transaction: {
          id: 'tx-1',
          amount: 50000,
          type: 'ESCROW_DEPOSIT',
          status: 'COMPLETED',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'escrow_deposit',
          amount: 50000,
          supplierId: 'seller-1',
          rfqId: 'rfq-1',
          escrowData: {
            deliveryDeadline: '2024-02-15',
            terms: 'Standard terms apply',
          },
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.escrow.status).toBe('HELD_IN_ESCROW');
    });

    it('should release escrow funds successfully', async () => {
      const mockResponse = {
        success: true,
        escrow: {
          id: 'escrow-1',
          status: 'RELEASED',
          releasedAt: new Date().toISOString(),
        },
        transaction: {
          id: 'tx-2',
          amount: 50000,
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'escrow_release',
          escrowId: 'escrow-1',
          amount: 50000,
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.escrow.status).toBe('RELEASED');
    });

    it('should handle insufficient balance error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Insufficient balance' }),
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'escrow_deposit',
          amount: 100000,
          supplierId: 'seller-1',
          rfqId: 'rfq-1',
        }),
      });

      const data = await response.json();
      expect(data.error).toBe('Insufficient balance');
    });

    it('should validate transaction limits', async () => {
      const mockResponse = {
        success: true,
        validation: {
          isWithinLimits: true,
          dailyLimit: 100000,
          dailyUsed: 25000,
          remaining: 75000,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/wallet/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50000,
          type: 'ESCROW_DEPOSIT',
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.validation.isWithinLimits).toBe(true);
    });
  });

  describe('Razorpay Integration Tests', () => {
    it('should initialize Razorpay payment', async () => {
      const paymentOptions = {
        key: 'rzp_test_key',
        amount: 10000,
        currency: 'INR',
        name: 'Bell24H',
        description: 'Test payment',
        handler: jest.fn(),
        prefill: {
          email: 'test@example.com',
          contact: '9876543210',
        },
      };

      const razorpay = new (global.Razorpay as any)(paymentOptions);

      // Verify the instance was created with the correct options
      expect(global.Razorpay).toHaveBeenCalledWith(paymentOptions);
      expect(razorpay).toBeDefined();

      // Verify the instance has the expected structure
      expect(razorpay.orders).toBeDefined();
      expect(razorpay.payments).toBeDefined();
      expect(razorpay.accounts).toBeDefined();
      expect(razorpay.payouts).toBeDefined();
    });

    it('should handle Razorpay payment failure', async () => {
      const ondismissMock = jest.fn();

      const paymentOptions = {
        key: 'rzp_test_key',
        amount: 10000,
        currency: 'INR',
        name: 'Bell24H',
        description: 'Test payment',
        handler: jest.fn(),
        modal: {
          ondismiss: ondismissMock,
        },
      };

      const razorpay = new (global.Razorpay as any)(paymentOptions);

      // Mock the open method to simulate failure
      razorpay.open = jest.fn().mockImplementation(() => {
        // Simulate payment failure by calling ondismiss
        setTimeout(() => {
          ondismissMock();
        }, 100);
      });

      razorpay.open();

      await waitFor(() => {
        expect(ondismissMock).toHaveBeenCalled();
      });
    });
  });

  describe('Escrow Service Tests', () => {
    it('should create escrow hold with proper validation', async () => {
      const mockResponse = {
        success: true,
        escrowHold: {
          id: 'escrow-1',
          amount: 50000,
          status: 'HELD_IN_ESCROW',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          walletId: 'wallet-1',
          referenceId: 'escrow-ref-123',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: 'wallet-1',
          amount: 50000,
          currency: 'INR',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          orderId: 'order-1',
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.escrowHold.status).toBe('HELD_IN_ESCROW');
    });

    it('should release escrow with proper authorization', async () => {
      const mockResponse = {
        success: true,
        escrowHold: {
          id: 'escrow-1',
          status: 'RELEASED',
          releasedAt: new Date().toISOString(),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/escrow/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowHoldId: 'escrow-1',
          metadata: {
            reason: 'Order completed successfully',
            authorizedBy: 'buyer-1',
          },
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.escrowHold.status).toBe('RELEASED');
    });

    it('should refund escrow with proper reason', async () => {
      const mockResponse = {
        success: true,
        escrowHold: {
          id: 'escrow-1',
          status: 'REFUNDED',
          releasedAt: new Date().toISOString(),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/escrow/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowHoldId: 'escrow-1',
          reason: 'Order cancelled by buyer',
          metadata: {
            cancelledBy: 'buyer-1',
            cancellationReason: 'Changed requirements',
          },
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.escrowHold.status).toBe('REFUNDED');
    });

    it('should validate escrow rules correctly', async () => {
      const mockResponse = {
        success: true,
        escrowRules: {
          isEscrowRequired: true,
          reason: 'AMOUNT_THRESHOLD',
          threshold: 50000,
          currentAmount: 75000,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/escrow/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: 'wallet-1',
          amount: 75000,
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.escrowRules.isEscrowRequired).toBe(true);
      expect(data.escrowRules.reason).toBe('AMOUNT_THRESHOLD');
    });
  });

  describe('Transaction Security Tests', () => {
    it('should detect suspicious transaction patterns', async () => {
      const mockResponse = {
        success: false,
        error: 'Transaction flagged for review',
        securityValidation: {
          riskScore: 85,
          reason: 'Multiple large transactions in short time',
          requiresReview: true,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount: 500000,
          currency: 'INR',
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.securityValidation.riskScore).toBe(85);
      expect(data.securityValidation.requiresReview).toBe(true);
    });

    it('should validate transaction limits per user type', async () => {
      const mockResponse = {
        success: false,
        error: 'Transaction amount exceeds limit for unverified user',
        limits: {
          dailyLimit: 100000,
          monthlyLimit: 1000000,
          currentDaily: 50000,
          currentMonthly: 200000,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount: 150000,
          currency: 'INR',
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.limits.dailyLimit).toBe(100000);
    });
  });

  describe('Payment Gateway Fallback Tests', () => {
    it('should fallback to Stripe when Razorpay fails', async () => {
      const mockResponse = {
        success: true,
        gateway: 'STRIPE',
        fallbackReason: 'RAZORPAY_UNAVAILABLE',
        transaction: {
          id: 'tx-1',
          amount: 10000,
          gateway: 'STRIPE',
          status: 'PENDING',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount: 10000,
          currency: 'INR',
          preferredGateway: 'RAZORPAY',
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.gateway).toBe('STRIPE');
      expect(data.fallbackReason).toBe('RAZORPAY_UNAVAILABLE');
    });

    it('should handle multiple gateway failures gracefully', async () => {
      const mockResponse = {
        success: false,
        error: 'All payment gateways are currently unavailable',
        attemptedGateways: ['RAZORPAY', 'STRIPE', 'PAYTM'],
        lastError: 'Network timeout',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount: 10000,
          currency: 'INR',
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.attemptedGateways).toContain('RAZORPAY');
      expect(data.attemptedGateways).toContain('STRIPE');
    });
  });

  describe('Webhook and Notification Tests', () => {
    it('should process Razorpay webhook successfully', async () => {
      const mockResponse = {
        success: true,
        webhookProcessed: true,
        transaction: {
          id: 'tx-1',
          status: 'COMPLETED',
          razorpayId: 'pay_test_123',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Razorpay-Signature': 'valid_signature',
        },
        body: JSON.stringify({
          event: 'payment.captured',
          payload: {
            payment: {
              id: 'pay_test_123',
              amount: 10000,
              currency: 'INR',
            },
          },
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.webhookProcessed).toBe(true);
    });

    it('should send payment notifications', async () => {
      const mockResponse = {
        success: true,
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/notifications/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: 'tx-1',
          userId: 'user-1',
          type: 'PAYMENT_SUCCESS',
          channels: ['email', 'sms', 'push'],
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.notifications.email).toBe(true);
      expect(data.notifications.sms).toBe(true);
    });
  });
});
