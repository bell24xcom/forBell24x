import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RazorpayXService } from '../payment/razorpayx.service';
import { NotificationService } from '../notification/notification.service';
import { CreateWalletDto, DepositDto, WithdrawDto, TransferDto } from './dto';
import { Wallet, Transaction, TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayXService: RazorpayXService,
    private readonly notificationService: NotificationService
  ) {}

  async getAllWallets(query: any): Promise<{ data: Wallet[]; total: number; pagination: any }> {
    try {
      const { page = 1, limit = 20, userId, type, status } = query;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (userId) where.userId = userId;
      if (type) where.type = type;
      if (status) where.status = status;

      const [wallets, total] = await Promise.all([
        this.prisma.wallet.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            transactions: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        }),
        this.prisma.wallet.count({ where })
      ]);

      return {
        data: wallets,
        total,
        pagination: {
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.logger.error('Error fetching wallets:', error);
      throw error;
    }
  }

  async getWalletById(id: string): Promise<Wallet> {
    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      return wallet;
    } catch (error) {
      this.logger.error(`Error fetching wallet ${id}:`, error);
      throw error;
    }
  }

  async getWalletByUserId(userId: string): Promise<Wallet> {
    try {
      const wallet = await this.prisma.wallet.findFirst({
        where: { userId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!wallet) {
        throw new Error('Wallet not found for user');
      }

      return wallet;
    } catch (error) {
      this.logger.error(`Error fetching wallet for user ${userId}:`, error);
      throw error;
    }
  }

  async createWallet(dto: CreateWalletDto): Promise<Wallet> {
    try {
      // Create RazorpayX account
      const razorpayAccount = await this.razorpayXService.createAccount({
        name: dto.userId, // Will be updated with actual user name
        email: dto.userId, // Will be updated with actual user email
        contact: dto.userId, // Will be updated with actual user contact
        type: 'individual'
      });

      const wallet = await this.prisma.wallet.create({
        data: {
          ...dto,
          razorpayAccountId: razorpayAccount.id,
          balance: 0,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      this.logger.log(`Wallet created: ${wallet.id}`);
      return wallet;
    } catch (error) {
      this.logger.error('Error creating wallet:', error);
      throw error;
    }
  }

  async deposit(walletId: string, dto: DepositDto): Promise<Transaction> {
    try {
      const wallet = await this.getWalletById(walletId);

      // Create RazorpayX payment link
      const paymentLink = await this.razorpayXService.createPaymentLink({
        amount: dto.amount * 100, // Convert to paise
        currency: dto.currency,
        description: dto.description || 'Wallet deposit',
        reference_id: `deposit_${walletId}_${Date.now()}`,
        callback_url: `${process.env.APP_URL}/api/wallet/deposit/callback`,
        callback_method: 'get'
      });

      // Create transaction record
      const transaction = await this.prisma.transaction.create({
        data: {
          walletId,
          type: TransactionType.DEPOSIT,
          amount: dto.amount,
          currency: dto.currency,
          method: dto.method,
          reference: dto.reference || paymentLink.id,
          description: dto.description,
          status: TransactionStatus.PENDING,
          metadata: {
            paymentLinkId: paymentLink.id,
            paymentLinkUrl: paymentLink.short_url,
            razorpayAccountId: wallet.razorpayAccountId
          },
          createdAt: new Date()
        }
      });

      // Send notification
      await this.notificationService.sendDepositNotification(wallet.user.email, {
        amount: dto.amount,
        currency: dto.currency,
        paymentLink: paymentLink.short_url
      });

      this.logger.log(`Deposit initiated: ${transaction.id}`);
      return transaction;
    } catch (error) {
      this.logger.error(`Error processing deposit for wallet ${walletId}:`, error);
      throw error;
    }
  }

  async withdraw(walletId: string, dto: WithdrawDto): Promise<Transaction> {
    try {
      const wallet = await this.getWalletById(walletId);

      // Check sufficient balance
      if (wallet.balance < dto.amount) {
        throw new Error('Insufficient balance');
      }

      // Process withdrawal through RazorpayX
      const payout = await this.razorpayXService.createPayout({
        account_number: wallet.razorpayAccountId,
        fund_account_id: dto.accountDetails.accountNumber,
        amount: dto.amount * 100, // Convert to paise
        currency: dto.currency,
        mode: dto.method === 'bank_transfer' ? 'IMPS' : 'UPI',
        purpose: 'payout',
        queue_if_low_balance: true,
        reference_id: `withdraw_${walletId}_${Date.now()}`,
        narration: dto.description || 'Wallet withdrawal'
      });

      // Create transaction record
      const transaction = await this.prisma.transaction.create({
        data: {
          walletId,
          type: TransactionType.WITHDRAWAL,
          amount: dto.amount,
          currency: dto.currency,
          method: dto.method,
          reference: dto.reference || payout.id,
          description: dto.description,
          status: TransactionStatus.PENDING,
          metadata: {
            payoutId: payout.id,
            accountDetails: dto.accountDetails
          },
          createdAt: new Date()
        }
      });

      // Update wallet balance
      await this.prisma.wallet.update({
        where: { id: walletId },
        data: {
          balance: wallet.balance - dto.amount,
          updatedAt: new Date()
        }
      });

      // Send notification
      await this.notificationService.sendWithdrawalNotification(wallet.user.email, {
        amount: dto.amount,
        currency: dto.currency,
        method: dto.method
      });

      this.logger.log(`Withdrawal initiated: ${transaction.id}`);
      return transaction;
    } catch (error) {
      this.logger.error(`Error processing withdrawal for wallet ${walletId}:`, error);
      throw error;
    }
  }

  async transfer(walletId: string, dto: TransferDto): Promise<Transaction> {
    try {
      const sourceWallet = await this.getWalletById(walletId);
      const targetWallet = await this.getWalletById(dto.toWalletId);

      // Check sufficient balance
      if (sourceWallet.balance < dto.amount) {
        throw new Error('Insufficient balance');
      }

      // Create internal transfer
      const transaction = await this.prisma.transaction.create({
        data: {
          walletId,
          type: TransactionType.TRANSFER,
          amount: dto.amount,
          currency: dto.currency,
          method: 'internal',
          reference: `transfer_${walletId}_${dto.toWalletId}_${Date.now()}`,
          description: dto.description || 'Internal transfer',
          status: TransactionStatus.COMPLETED,
          metadata: {
            toWalletId: dto.toWalletId,
            targetWalletOwner: targetWallet.user.firstName + ' ' + targetWallet.user.lastName
          },
          createdAt: new Date()
        }
      });

      // Update both wallet balances
      await Promise.all([
        this.prisma.wallet.update({
          where: { id: walletId },
          data: {
            balance: sourceWallet.balance - dto.amount,
            updatedAt: new Date()
          }
        }),
        this.prisma.wallet.update({
          where: { id: dto.toWalletId },
          data: {
            balance: targetWallet.balance + dto.amount,
            updatedAt: new Date()
          }
        })
      ]);

      // Send notifications
      await Promise.all([
        this.notificationService.sendTransferNotification(sourceWallet.user.email, {
          amount: dto.amount,
          currency: dto.currency,
          toUser: targetWallet.user.firstName + ' ' + targetWallet.user.lastName,
          type: 'sent'
        }),
        this.notificationService.sendTransferNotification(targetWallet.user.email, {
          amount: dto.amount,
          currency: dto.currency,
          fromUser: sourceWallet.user.firstName + ' ' + sourceWallet.user.lastName,
          type: 'received'
        })
      ]);

      this.logger.log(`Transfer completed: ${transaction.id}`);
      return transaction;
    } catch (error) {
      this.logger.error(`Error processing transfer for wallet ${walletId}:`, error);
      throw error;
    }
  }

  async getBalance(walletId: string): Promise<{ balance: number; currency: string }> {
    try {
      const wallet = await this.getWalletById(walletId);
      return {
        balance: wallet.balance,
        currency: wallet.currency
      };
    } catch (error) {
      this.logger.error(`Error fetching balance for wallet ${walletId}:`, error);
      throw error;
    }
  }

  async getTransactions(walletId: string, query: any): Promise<{ data: Transaction[]; total: number; pagination: any }> {
    try {
      const { page = 1, limit = 20, type, status, startDate, endDate } = query;
      const skip = (page - 1) * limit;

      const where: any = { walletId };
      if (type) where.type = type;
      if (status) where.status = status;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [transactions, total] = await Promise.all([
        this.prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.transaction.count({ where })
      ]);

      return {
        data: transactions,
        total,
        pagination: {
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.logger.error(`Error fetching transactions for wallet ${walletId}:`, error);
      throw error;
    }
  }

  async getStatement(walletId: string, query: any): Promise<any> {
    try {
      const { startDate, endDate, format = 'json' } = query;
      
      const where: any = { walletId };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const transactions = await this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'asc' }
      });

      const wallet = await this.getWalletById(walletId);

      const statement = {
        walletId,
        walletOwner: wallet.user.firstName + ' ' + wallet.user.lastName,
        currency: wallet.currency,
        period: {
          startDate: startDate || transactions[0]?.createdAt,
          endDate: endDate || transactions[transactions.length - 1]?.createdAt
        },
        summary: {
          totalTransactions: transactions.length,
          totalDeposits: transactions.filter(t => t.type === TransactionType.DEPOSIT).reduce((sum, t) => sum + t.amount, 0),
          totalWithdrawals: transactions.filter(t => t.type === TransactionType.WITHDRAWAL).reduce((sum, t) => sum + t.amount, 0),
          totalTransfers: transactions.filter(t => t.type === TransactionType.TRANSFER).reduce((sum, t) => sum + t.amount, 0),
          currentBalance: wallet.balance
        },
        transactions
      };

      return statement;
    } catch (error) {
      this.logger.error(`Error generating statement for wallet ${walletId}:`, error);
      throw error;
    }
  }

  async getRazorpayXAccount(walletId: string): Promise<any> {
    try {
      const wallet = await this.getWalletById(walletId);
      
      if (!wallet.razorpayAccountId) {
        throw new Error('RazorpayX account not found');
      }

      const account = await this.razorpayXService.getAccount(wallet.razorpayAccountId);
      return account;
    } catch (error) {
      this.logger.error(`Error fetching RazorpayX account for wallet ${walletId}:`, error);
      throw error;
    }
  }

  async syncWithRazorpayX(walletId: string): Promise<void> {
    try {
      const wallet = await this.getWalletById(walletId);
      
      if (!wallet.razorpayAccountId) {
        throw new Error('RazorpayX account not found');
      }

      // Sync account details
      const account = await this.razorpayXService.getAccount(wallet.razorpayAccountId);
      
      // Sync transactions
      const transactions = await this.razorpayXService.getTransactions(wallet.razorpayAccountId);
      
      // Update wallet with latest balance
      await this.prisma.wallet.update({
        where: { id: walletId },
        data: {
          balance: account.balance / 100, // Convert from paise
          updatedAt: new Date()
        }
      });

      this.logger.log(`Synced wallet ${walletId} with RazorpayX`);
    } catch (error) {
      this.logger.error(`Error syncing wallet ${walletId} with RazorpayX:`, error);
      throw error;
    }
  }

  async freezeWallet(walletId: string): Promise<Wallet> {
    try {
      const wallet = await this.prisma.wallet.update({
        where: { id: walletId },
        data: {
          status: 'FROZEN',
          updatedAt: new Date()
        }
      });

      this.logger.log(`Wallet frozen: ${walletId}`);
      return wallet;
    } catch (error) {
      this.logger.error(`Error freezing wallet ${walletId}:`, error);
      throw error;
    }
  }

  async unfreezeWallet(walletId: string): Promise<Wallet> {
    try {
      const wallet = await this.prisma.wallet.update({
        where: { id: walletId },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });

      this.logger.log(`Wallet unfrozen: ${walletId}`);
      return wallet;
    } catch (error) {
      this.logger.error(`Error unfreezing wallet ${walletId}:`, error);
      throw error;
    }
  }
} 