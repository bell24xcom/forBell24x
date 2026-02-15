import { PrismaClient, Transaction as PrismaTransaction, PaymentGateway, TransactionStatus, TransactionType } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';
import { stripe } from '../lib/stripe';
import Razorpay from 'razorpay';
import { transactionSecurityService } from './transactionSecurityService';
import { logger } from '../utils/logger';

type TransactionData = Omit<PrismaTransaction, 'id' | 'walletId' | 'createdAt' | 'updatedAt'>;

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

class WalletService {
  private prisma: PrismaClient;

  constructor(prismaInstance: PrismaClient = prisma) {
    this.prisma = prismaInstance;
  }

  /**
   * Create a new wallet for a user
   */
  async createWallet(userId: string, countryCode: string = 'IN', email?: string, phone?: string) {
    return this.prisma.$transaction(async (tx) => {
      // Determine the appropriate payment gateway based on country
      const gateway = this.getPreferredGateway(countryCode);
      
      // Create wallet
      const wallet = await tx.wallet.create({
        data: {
          userId,
          balance: 0,
          escrowBalance: 0,
          currency: countryCode === 'IN' ? 'INR' : 'USD', // Default currency based on country
          status: 'active',
          gateway,
          country: countryCode,
          isEscrowEnabled: false,
          escrowThreshold: 500000, // ₹5 lakh default threshold
        },
      });

      // Initialize payment gateway specific accounts if needed
      if (gateway === PaymentGateway.STRIPE && email) {
        await this.initializeStripeCustomer(wallet, email);
      } else if (gateway === PaymentGateway.RAZORPAY && (email || phone)) {
        await this.initializeRazorpayContact(wallet, email, phone);
      }

      return wallet;
    });
  }

  /**
   * Get wallet by user ID
   */
  async getWallet(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: { 
        transactions: { 
          where: { 
            type: { not: TransactionType.ESCROW_HOLD } // Don't include escrow holds in main transactions
          },
          orderBy: { createdAt: 'desc' }, 
          take: 10 
        } 
      }
    });
  }

  /**
   * Get wallet by wallet ID
   */
  async getWalletById(walletId: string) {
    return this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        transactions: {
          where: { 
            type: { not: TransactionType.ESCROW_HOLD } // Don't include escrow holds in main transactions
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        escrowHolds: {
          where: { status: TransactionStatus.HELD_IN_ESCROW },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });
  }

  /**
   * Create a transaction and handle automatic escrow activation.
   */
  async createTransaction(
    walletId: string, 
    data: TransactionData & { buyerId?: string; sellerId?: string; escrowHoldId?: string; }
  ) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new Error(`Wallet with ID ${walletId} not found.`);
      }

      // Validate transaction security
      const securityValidation = await transactionSecurityService.validateTransaction({
        userId: wallet.userId,
        amount: data.amount,
        type: data.type,
        currency: data.currency || wallet.currency,
        metadata: data.metadata
      });

      if (!securityValidation.isValid) {
        logger.warn('Transaction security validation failed', {
          walletId,
          userId: wallet.userId,
          amount: data.amount,
          type: data.type,
          reason: securityValidation.reason,
          riskScore: securityValidation.riskScore
        });

        throw new Error(`Transaction security validation failed: ${securityValidation.reason}`);
      }

      // Create the main transaction record
      const transaction = await tx.transaction.create({
        data: {
          ...data,
          walletId,
          netAmount: data.netAmount !== undefined ? data.netAmount : (data.amount - (data.fee || 0)),
          escrowHoldId: data.escrowHoldId,
          metadata: {
            ...data.metadata,
            securityValidation: {
              riskScore: securityValidation.riskScore,
              validatedAt: new Date().toISOString()
            }
          }
        },
      });

      // Update wallet balance based on transaction type and status
      if (data.status === TransactionStatus.COMPLETED || data.status === TransactionStatus.HELD_IN_ESCROW) { 
        const updateData: any = {};
        
        switch (data.type) {
          case TransactionType.DEPOSIT:
          case TransactionType.REFUND:
          case TransactionType.ESCROW_RELEASE:
          case TransactionType.ESCROW_REFUND:
            updateData.balance = { increment: data.netAmount !== undefined ? data.netAmount : data.amount };
            break;
          
          case TransactionType.WITHDRAWAL:
          case TransactionType.PAYMENT:
            updateData.balance = { decrement: data.amount };
            break;

          default:
            if (data.amount > 0) {
              updateData.balance = { increment: data.netAmount !== undefined ? data.netAmount : data.amount };
            } else if (data.amount < 0) {
              updateData.balance = { decrement: Math.abs(data.amount) }; 
            }
            break;
        }

        if (Object.keys(updateData).length > 0) {
          await tx.wallet.update({
            where: { id: walletId },
            data: updateData,
          });
        }
      }

      return transaction;
    });
  }

  /**
   * Credit funds to a wallet
   */
  async credit(data: {
    userId: string;
    amount: number;
    currency: string;
    type: TransactionType;
    gateway: PaymentGateway;
    referenceId?: string;
    description?: string;
    metadata?: any;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: data.userId },
      });

      if (!wallet) {
        wallet = await this.createWallet(data.userId, data.metadata?.countryCode);
      }

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: data.amount,
          fee: 0,
          netAmount: data.amount,
          type: data.type,
          status: TransactionStatus.COMPLETED,
          gateway: data.gateway,
          referenceId: data.referenceId || `cr_${uuidv4()}`,
          description: data.description,
          metadata: data.metadata,
          processedAt: new Date(),
        },
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: data.amount,
          },
        },
      });

      return transaction;
    });
  }

  /**
   * Debit funds from a wallet
   */
  async debit(data: {
    userId: string;
    amount: number;
    currency: string;
    type: TransactionType;
    gateway: PaymentGateway;
    referenceId?: string;
    description?: string;
    metadata?: any;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Get wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: data.userId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check sufficient balance
      if (wallet.balance < data.amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: -data.amount, // Negative for debits
          fee: 0,
          netAmount: -data.amount,
          type: data.type,
          status: TransactionStatus.COMPLETED,
          gateway: data.gateway,
          referenceId: data.referenceId || `db_${uuidv4()}`,
          description: data.description,
          metadata: data.metadata,
          processedAt: new Date(),
        },
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: data.amount,
          },
        },
      });

      return transaction;
    });
  }

  /**
   * Get transaction history with pagination
   */
  async getTransactions(
    walletId: string, 
    filters: {
      type?: TransactionType;
      status?: TransactionStatus;
      gateway?: PaymentGateway;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { walletId };
    
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.gateway) where.gateway = filters.gateway;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  /**
   * Update wallet status
   */
  async updateWalletStatus(walletId: string, status: 'active' | 'frozen' | 'closed') {
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { status }
    });
  }

  /**
   * Toggle escrow feature for a wallet
   */
  async toggleEscrow(walletId: string, isEnabled: boolean) {
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { isEscrowEnabled: isEnabled },
    });
  }

  /**
   * Update escrow threshold for a wallet
   * @param walletId - The ID of the wallet to update
   * @param threshold - The new threshold amount in the smallest currency unit (e.g., paise for INR)
   * @returns The updated wallet
   */
  async updateEscrowThreshold(walletId: string, threshold: number) {
    if (threshold < 0) {
      throw new Error('Threshold cannot be negative');
    }
    
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { escrowThreshold: threshold }
    });
  }

  /**
   * Get preferred payment gateway based on country
   */
  private getPreferredGateway(countryCode: string): PaymentGateway {
    // Use Razorpay for India, Stripe for others
    return countryCode === 'IN' ? PaymentGateway.RAZORPAY : PaymentGateway.STRIPE;
  }

  /**
   * Initialize Stripe customer for a wallet
   */
  private async initializeStripeCustomer(wallet: any, email: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          walletId: wallet.id,
          userId: wallet.userId,
        },
      });

      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { stripeCustomerId: customer.id },
      });

      return customer;
    } catch (error) {
      console.error('Error initializing Stripe customer:', error);
      // Don't fail wallet creation if Stripe initialization fails
      return null;
    }
  }

  /**
   * Initialize Razorpay contact for a wallet
   */
  private async initializeRazorpayContact(wallet: any, email?: string, phone?: string) {
    try {
      if (!email && !phone) {
        throw new Error('Email or phone is required for Razorpay contact');
      }

      const contactData: any = {
        name: `User ${wallet.userId.substring(0, 8)}`,
        type: 'customer',
        reference_id: `user_${wallet.userId}`,
        notes: {
          walletId: wallet.id,
          userId: wallet.userId,
        },
      };

      if (email) contactData.email = email;
      if (phone) contactData.contact = phone.replace(/[^0-9]/g, ''); // Remove non-numeric chars

      const contact = await razorpay.contacts.create(contactData);

      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { 
          razorpayContactId: contact.id,
          contactId: contact.id, // For backward compatibility
        },
      });

      return contact;
    } catch (error) {
      console.error('Error initializing Razorpay contact:', error);
      // Don't fail wallet creation if Razorpay initialization fails
      return null;
    }
  }
}

export const walletService = new WalletService();
