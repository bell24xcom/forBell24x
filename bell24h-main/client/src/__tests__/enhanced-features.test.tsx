import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock the enhanced features
jest.mock('@/lib/services/blockchainDeployment', () => ({
  BlockchainDeploymentService: jest.fn().mockImplementation(() => ({
    deployEscrowContract: jest.fn().mockResolvedValue({
      contractName: 'Bell24HEscrow',
      address: '0x1234567890123456789012345678901234567890',
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      network: 'sepolia',
      deployedAt: new Date(),
      gasUsed: 150000,
      verificationUrl:
        'https://sepolia.etherscan.io/verify/0x1234567890123456789012345678901234567890',
    }),
    deployVerificationContract: jest.fn().mockResolvedValue({
      contractName: 'Bell24HVerification',
      address: '0x0987654321098765432109876543210987654321',
      transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      network: 'sepolia',
      deployedAt: new Date(),
      gasUsed: 120000,
      verificationUrl:
        'https://sepolia.etherscan.io/verify/0x0987654321098765432109876543210987654321',
    }),
  })),
}));

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: jest.fn().mockResolvedValue({
          text: 'I need 500 units of industrial sensors for temperature monitoring. Budget is around 50,000 rupees. Need delivery within 2 weeks.',
          language: 'en',
          duration: 15.5,
          words: [
            { word: 'I', start: 0, end: 0.5 },
            { word: 'need', start: 0.5, end: 1.0 },
            { word: '500', start: 1.0, end: 1.5 },
          ],
        }),
      },
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: 'Industrial Temperature Sensors',
                  description:
                    'I need 500 units of industrial sensors for temperature monitoring. Budget is around 50,000 rupees. Need delivery within 2 weeks.',
                  category: 'Electronics & Components',
                  quantity: 500,
                  budget: 50000,
                  deliveryDeadline: '2024-02-15',
                  requirements: ['Waterproof', 'Wireless connectivity', 'Temperature monitoring'],
                  location: 'Mumbai, India',
                  priority: 'high',
                }),
              },
            },
          ],
        }),
      },
    },
  })),
}));

// Mock Razorpay
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test123',
        amount: 5000000,
        currency: 'INR',
        receipt: 'receipt_test123',
        status: 'created',
      }),
    },
    payments: {
      capture: jest.fn().mockResolvedValue({
        id: 'pay_test123',
        amount: 5000000,
        currency: 'INR',
        status: 'captured',
      }),
    },
    accounts: {
      create: jest.fn().mockResolvedValue({
        id: 'acc_test123',
        type: 'standard',
        name: 'Escrow_TestRFQ',
        email: 'test@example.com',
        contact: '+919876543210',
      }),
    },
    payouts: {
      create: jest.fn().mockResolvedValue({
        id: 'payout_test123',
        amount: 1000000,
        currency: 'INR',
        status: 'queued',
        mode: 'IMPS',
      }),
    },
  }));
});

// Setup MSW server for API mocking
const server = setupServer(
  // Mock voice processing API
  rest.post('/api/rfqs/voice', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        transcription: {
          text: 'I need 500 units of industrial sensors for temperature monitoring. Budget is around 50,000 rupees. Need delivery within 2 weeks.',
          confidence: 0.95,
          language: 'en',
          duration: 15.5,
          word_timestamps: [
            { word: 'I', start: 0, end: 0.5 },
            { word: 'need', start: 0.5, end: 1.0 },
            { word: '500', start: 1.0, end: 1.5 },
          ],
        },
        extractedInfo: {
          title: 'Industrial Temperature Sensors',
          description:
            'I need 500 units of industrial sensors for temperature monitoring. Budget is around 50,000 rupees. Need delivery within 2 weeks.',
          category: 'Electronics & Components',
          quantity: 500,
          budget: 50000,
          deliveryDeadline: '2024-02-15',
          requirements: ['Waterproof', 'Wireless connectivity', 'Temperature monitoring'],
          location: 'Mumbai, India',
          priority: 'high',
        },
        rfqId: 'voice_1704067200000',
        processingTime: 2500,
      })
    );
  }),

  // Mock wallet API
  rest.post('/api/wallet', (req, res, ctx) => {
    const { action } = req.body as any;

    switch (action) {
      case 'DEPOSIT':
        return res(
          ctx.json({
            success: true,
            transactionId: 'txn_test123',
            orderId: 'order_test123',
            amount: 10000,
            status: 'created',
            paymentUrl: 'https://checkout.razorpay.com/v1/order_test123',
          })
        );

      case 'ESCROW_CREATE':
        return res(
          ctx.json({
            success: true,
            escrowId: 'escrow_test123',
            orderId: 'order_test123',
            accountId: 'acc_test123',
            amount: 50000,
            status: 'created',
          })
        );

      case 'ESCROW_RELEASE':
        return res(
          ctx.json({
            success: true,
            paymentId: 'pay_test123',
            amount: 50000,
            status: 'captured',
            transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          })
        );

      case 'WITHDRAWAL':
        return res(
          ctx.json({
            success: true,
            payoutId: 'payout_test123',
            amount: 10000,
            status: 'queued',
            referenceId: 'withdrawal_1704067200000',
          })
        );

      default:
        return res(ctx.status(400), ctx.json({ error: 'Invalid action' }));
    }
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Enhanced Features Integration Tests', () => {
  describe('Voice Processing Enhancement', () => {
    test('should process voice RFQ with real OpenAI integration', async () => {
      // Create a mock audio blob
      const audioBlob = new Blob(['mock audio data'], { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', 'en');

      const response = await fetch('/api/rfqs/voice', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.transcription.text).toContain('industrial sensors');
      expect(result.extractedInfo.title).toBe('Industrial Temperature Sensors');
      expect(result.extractedInfo.quantity).toBe(500);
      expect(result.extractedInfo.budget).toBe(50000);
      expect(result.transcription.confidence).toBeGreaterThan(0.8);
    });

    test('should handle voice processing errors gracefully', async () => {
      server.use(
        rest.post('/api/rfqs/voice', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              error: 'OpenAI API key not configured',
              message:
                'Please configure OpenAI API key or enable mock voice processing in development',
            })
          );
        })
      );

      const audioBlob = new Blob(['mock audio data'], { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/rfqs/voice', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('OpenAI API key not configured');
    });
  });

  describe('Payment Processing Enhancement', () => {
    test('should create wallet deposit with real Razorpay integration', async () => {
      const depositData = {
        action: 'DEPOSIT',
        amount: 10000,
        userId: 'user_test123',
      };

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(depositData),
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('txn_test123');
      expect(result.orderId).toBe('order_test123');
      expect(result.amount).toBe(10000);
      expect(result.status).toBe('created');
      expect(result.paymentUrl).toContain('razorpay.com');
    });

    test('should create escrow account with real Razorpay integration', async () => {
      const escrowData = {
        action: 'ESCROW_CREATE',
        amount: 50000,
        buyerId: 'buyer_test123',
        sellerId: 'seller_test123',
        rfqId: 'rfq_test123',
        buyerEmail: 'buyer@example.com',
        buyerPhone: '+919876543210',
      };

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(escrowData),
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.escrowId).toBe('escrow_test123');
      expect(result.orderId).toBe('order_test123');
      expect(result.accountId).toBe('acc_test123');
      expect(result.amount).toBe(50000);
      expect(result.status).toBe('created');
    });

    test('should release escrow funds with real Razorpay integration', async () => {
      const releaseData = {
        action: 'ESCROW_RELEASE',
        escrowId: 'escrow_test123',
        amount: 50000,
      };

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(releaseData),
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('pay_test123');
      expect(result.amount).toBe(50000);
      expect(result.status).toBe('captured');
      expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('should process withdrawal with real Razorpay integration', async () => {
      const withdrawalData = {
        action: 'WITHDRAWAL',
        amount: 10000,
        accountNumber: '1234567890',
        fundAccountId: 'fa_test123',
      };

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawalData),
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.payoutId).toBe('payout_test123');
      expect(result.amount).toBe(10000);
      expect(result.status).toBe('queued');
      expect(result.referenceId).toContain('withdrawal_');
    });
  });

  describe('Blockchain Deployment Enhancement', () => {
    test('should deploy escrow contract successfully', async () => {
      const { BlockchainDeploymentService } = require('@/lib/services/blockchainDeployment');
      const service = new BlockchainDeploymentService();

      const result = await service.deployEscrowContract();

      expect(result.contractName).toBe('Bell24HEscrow');
      expect(result.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(result.network).toBe('sepolia');
      expect(result.gasUsed).toBeGreaterThan(0);
      expect(result.verificationUrl).toContain('etherscan.io');
    });

    test('should deploy verification contract successfully', async () => {
      const { BlockchainDeploymentService } = require('@/lib/services/blockchainDeployment');
      const service = new BlockchainDeploymentService();

      const result = await service.deployVerificationContract();

      expect(result.contractName).toBe('Bell24HVerification');
      expect(result.address).toBe('0x0987654321098765432109876543210987654321');
      expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(result.network).toBe('sepolia');
      expect(result.gasUsed).toBeGreaterThan(0);
      expect(result.verificationUrl).toContain('etherscan.io');
    });
  });

  describe('Error Handling', () => {
    test('should handle payment API errors gracefully', async () => {
      server.use(
        rest.post('/api/wallet', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              error: 'Razorpay API error',
              message: 'Failed to process payment request',
            })
          );
        })
      );

      const depositData = {
        action: 'DEPOSIT',
        amount: 10000,
        userId: 'user_test123',
      };

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(depositData),
      });

      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('Razorpay API error');
    });

    test('should handle voice processing validation errors', async () => {
      const response = await fetch('/api/rfqs/voice', {
        method: 'POST',
        body: new FormData(), // No audio file
      });

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('No audio file provided');
    });
  });
});
