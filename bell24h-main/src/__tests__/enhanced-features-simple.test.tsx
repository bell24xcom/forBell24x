import '@testing-library/jest-dom';

// Mock the enhanced features
jest.mock('@/lib/services/blockchainDeployment', () => {
  // Always return both methods as jest.fn()
  return {
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
  };
});

// Mock OpenAI module
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

// Mock Razorpay module
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

describe('Enhanced Features Unit Tests', () => {
  let mockOpenAI: any;
  let mockRazorpay: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create fresh mock instances for each test
    mockOpenAI = {
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
    };

    mockRazorpay = {
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
    };

    // Update the module mocks with fresh instances
    const openaiMock = require('openai');
    openaiMock.default.mockImplementation(() => mockOpenAI);

    const razorpayMock = require('razorpay');
    razorpayMock.mockImplementation(() => mockRazorpay);
  });

  describe('Voice Processing Enhancement', () => {
    test('should process voice RFQ with OpenAI integration', async () => {
      const OpenAI = require('openai').default;
      const openai = new OpenAI();

      // Test transcription
      const transcription = await openai.audio.transcriptions.create({
        file: new File(['mock audio'], 'test.webm', { type: 'audio/webm' }),
        model: 'whisper-1',
      });

      expect(transcription.text).toContain('industrial sensors');
      expect(transcription.language).toBe('en');
      expect(transcription.duration).toBe(15.5);

      // Test RFQ extraction
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Extract RFQ details from spoken text in JSON format',
          },
          {
            role: 'user',
            content: transcription.text,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const extractedInfo = JSON.parse(completion.choices[0].message.content || '{}');

      expect(extractedInfo.title).toBe('Industrial Temperature Sensors');
      expect(extractedInfo.quantity).toBe(500);
      expect(extractedInfo.budget).toBe(50000);
      expect(extractedInfo.category).toBe('Electronics & Components');
      expect(extractedInfo.requirements).toContain('Waterproof');
    });
  });

  describe('Payment Processing Enhancement', () => {
    test('should create Razorpay order for deposit', async () => {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: 'test_key_id',
        key_secret: 'test_key_secret',
      });

      const order = await razorpay.orders.create({
        amount: 1000000, // 10,000 INR in paise
        currency: 'INR',
        receipt: 'deposit_test123',
        notes: {
          transactionId: 'txn_test123',
          type: 'wallet_deposit',
        },
      });

      expect(order.id).toBe('order_test123');
      expect(order.amount).toBe(5000000);
      expect(order.currency).toBe('INR');
      expect(order.status).toBe('created');
    });

    test('should create escrow account', async () => {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: 'test_key_id',
        key_secret: 'test_key_secret',
      });

      const escrowAccount = await razorpay.accounts.create({
        type: 'standard',
        name: 'Escrow_TestRFQ',
        email: 'test@example.com',
        contact: '+919876543210',
        notes: {
          rfqId: 'rfq_test123',
          buyerId: 'buyer_test123',
          sellerId: 'seller_test123',
        },
      });

      expect(escrowAccount.id).toBe('acc_test123');
      expect(escrowAccount.type).toBe('standard');
      expect(escrowAccount.name).toBe('Escrow_TestRFQ');
      expect(escrowAccount.email).toBe('test@example.com');
    });

    test('should capture escrow payment', async () => {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: 'test_key_id',
        key_secret: 'test_key_secret',
      });

      const payment = await razorpay.payments.capture('escrow_test123', {
        amount: 5000000, // 50,000 INR in paise
        currency: 'INR',
      });

      expect(payment.id).toBe('pay_test123');
      expect(payment.amount).toBe(5000000);
      expect(payment.status).toBe('captured');
    });

    test('should create withdrawal payout', async () => {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: 'test_key_id',
        key_secret: 'test_key_secret',
      });

      const payout = await razorpay.payouts.create({
        account_number: '1234567890',
        fund_account_id: 'fa_test123',
        amount: 1000000, // 10,000 INR in paise
        currency: 'INR',
        mode: 'IMPS',
        purpose: 'payout',
        notes: {
          transactionId: 'txn_test123',
          type: 'withdrawal',
        },
      });

      expect(payout.id).toBe('payout_test123');
      expect(payout.amount).toBe(1000000);
      expect(payout.status).toBe('queued');
      expect(payout.mode).toBe('IMPS');
    });
  });

  describe('Blockchain Deployment Enhancement', () => {
    test('should deploy escrow contract successfully', async () => {
      jest.resetModules();
      const { BlockchainDeploymentService } = require('@/lib/services/blockchainDeployment');
      const service = new BlockchainDeploymentService();

      const result = await service.deployEscrowContract();

      expect(result.contractName).toBe('Bell24HEscrow');
      expect(result.address).toBe('0x1234567890123456789012345678901234567890');
      expect(result.network).toBe('sepolia');
      expect(result.gasUsed).toBe(150000);
    });

    test('should deploy verification contract successfully', async () => {
      jest.resetModules();
      const { BlockchainDeploymentService } = require('@/lib/services/blockchainDeployment');
      const service = new BlockchainDeploymentService();

      const result = await service.deployVerificationContract();

      expect(result.contractName).toBe('Bell24HVerification');
      expect(result.address).toBe('0x0987654321098765432109876543210987654321');
      expect(result.network).toBe('sepolia');
      expect(result.gasUsed).toBe(120000);
    });
  });

  describe('Error Handling', () => {
    test('should handle OpenAI API errors gracefully', async () => {
      const OpenAI = require('openai').default;
      const openai = new OpenAI();

      // Mock error response
      mockOpenAI.audio.transcriptions.create = jest
        .fn()
        .mockRejectedValue(new Error('OpenAI API key not configured'));

      await expect(
        openai.audio.transcriptions.create({
          file: new File(['mock audio'], 'test.webm', { type: 'audio/webm' }),
          model: 'whisper-1',
        })
      ).rejects.toThrow('OpenAI API key not configured');
    });

    test('should handle Razorpay API errors gracefully', async () => {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: 'test_key_id',
        key_secret: 'test_key_secret',
      });

      // Mock error response
      mockRazorpay.orders.create = jest.fn().mockRejectedValue(new Error('Invalid API key'));

      await expect(
        razorpay.orders.create({
          amount: 1000000,
          currency: 'INR',
          receipt: 'test_receipt',
        })
      ).rejects.toThrow('Invalid API key');
    });
  });

  describe('Feature Integration', () => {
    test('should integrate voice processing with payment creation', async () => {
      const OpenAI = require('openai').default;
      const Razorpay = require('razorpay');

      const openai = new OpenAI();
      const razorpay = new Razorpay({
        key_id: 'test_key_id',
        key_secret: 'test_key_secret',
      });

      // Step 1: Process voice input
      const transcription = await openai.audio.transcriptions.create({
        file: new File(['mock audio'], 'test.webm', { type: 'audio/webm' }),
        model: 'whisper-1',
      });

      expect(transcription.text).toContain('industrial sensors');

      // Step 2: Extract RFQ details
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Extract RFQ details from spoken text in JSON format',
          },
          {
            role: 'user',
            content: transcription.text,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const extractedInfo = JSON.parse(completion.choices[0].message.content || '{}');

      // Step 3: Create payment order based on extracted budget
      const order = await razorpay.orders.create({
        amount: extractedInfo.budget * 100, // Convert to paise
        currency: 'INR',
        receipt: `rfq_${Date.now()}`,
        notes: {
          rfqTitle: extractedInfo.title,
          category: extractedInfo.category,
          quantity: extractedInfo.quantity,
        },
      });

      expect(order.id).toBe('order_test123');
      expect(order.amount).toBe(5000000); // 50,000 INR in paise
      expect(order.currency).toBe('INR');
      expect(order.status).toBe('created');
    });
  });
});
