import { Prisma, PrismaClient, TransactionStatus, TransactionType, PaymentGateway } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { walletService } from './walletService';
import { emailService } from './emailService';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

type PrismaTransaction = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;

type EscrowHoldWithRelations = Prisma.EscrowHoldGetPayload<{
  include: {
    transactions: true;
    buyer: true;
    seller: true;
    wallet: true;
  };
}>;

type CreateEscrowHoldParams = {
  walletId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  buyerId: string;
  sellerId: string;
  orderId?: string;
  metadata?: Record<string, any>;
  releaseDate?: Date;
  sendNotifications?: boolean;
};

type ReleaseEscrowParams = {
  escrowHoldId: string;
  metadata?: Record<string, any>;
  sendNotifications?: boolean;
};

type RefundEscrowParams = {
  escrowHoldId: string;
  reason?: string;
  metadata?: Record<string, any>;
  sendNotifications?: boolean;
};

export class EscrowService {
  private prisma: PrismaClient;

  constructor(prismaInstance: PrismaClient = prisma) {
    this.prisma = prismaInstance;
  }

  /**
   * Get an escrow hold by ID
   */
  async getEscrowHold(escrowHoldId: string): Promise<EscrowHoldWithRelations | null> {
    return this.prisma.escrowHold.findUnique({
      where: { id: escrowHoldId },
      include: {
        transactions: true,
        buyer: true,
        seller: true,
        wallet: true,
      },
    });
  }

  /**
   * Create a new escrow hold
   */
  async createEscrowHold({
    walletId,
    amount,
    currency,
    gateway,
    buyerId,
    sellerId,
    orderId,
    metadata = {},
    releaseDate,
    sendNotifications = true,
  }: CreateEscrowHoldParams): Promise<EscrowHoldWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      // Check if wallet has sufficient balance
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const availableBalance = wallet.balance - (wallet.escrowBalance || 0);
      if (availableBalance < amount) {
        throw new Error('Insufficient balance for escrow hold');
      }

      // Get user details for notifications
      const [buyer, seller] = await Promise.all([
        tx.user.findUnique({ where: { id: buyerId } }),
        tx.user.findUnique({ where: { id: sellerId } })
      ]);

      if (!buyer || !seller) {
        throw new Error('Buyer or seller not found');
      }

      const referenceId = `escrow-${Date.now()}`;
      const txReferenceId = `escrow-tx-${Date.now()}`;

      // Create escrow hold
      const escrowHold = await tx.escrowHold.create({
        data: {
          walletId,
          amount,
          currency,
          status: TransactionStatus.HELD_IN_ESCROW,
          gateway,
          referenceId,
          buyerId,
          sellerId,
          orderId,
          metadata,
          releaseDate,
          transactions: {
            create: {
              id: uuidv4(),
              amount,
              currency,
              type: TransactionType.ESCROW_HOLD,
              status: TransactionStatus.COMPLETED,
              gateway,
              referenceId: txReferenceId,
              metadata: {
                ...metadata,
                action: 'create_escrow_hold',
                walletId,
                buyerId,
                sellerId,
                orderId
              }
            }
          }
        },
      });

      // Update wallet's escrow balance
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          escrowBalance: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: walletId,
          amount: -amount, // Negative because amount is being held
          fee: 0,
          netAmount: -amount,
          netAmount: -data.amount,
          type: TransactionType.ESCROW_HOLD,
          status: TransactionStatus.HELD_IN_ESCROW,
          gateway: data.gateway,
          referenceId: escrowHold.referenceId,
          orderId: data.orderId,
          description: `Escrow hold for order ${data.orderId || 'N/A'}`,
          metadata: data.metadata,
          processedAt: new Date(),
          escrowHoldId: escrowHold.id,
        },
      });

      return escrowHold;
    });
  }

  /**
   * Release funds from escrow to seller
   */
  async releaseEscrow(escrowHoldId: string, metadata: any = {}): Promise<EscrowHoldWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const escrowHold = await tx.escrowHold.findUnique({
        where: { id: escrowHoldId },
      });

      if (!escrowHold) {
        throw new Error('Escrow hold not found');
      }

      if (escrowHold.status !== TransactionStatus.HELD_IN_ESCROW) {
        throw new Error('Escrow is not in a valid state for release');
      }

      // Update escrow hold status
      const updatedEscrow = await tx.escrowHold.update({
        where: { id: escrowHoldId },
        data: {
          status: TransactionStatus.RELEASED,
          releasedAt: new Date(),
          metadata: { ...(escrowHold.metadata as any), ...metadata },
        },
      });

      // Update wallet balances
      await tx.wallet.update({
        where: { id: escrowHold.walletId },
        data: {
          escrowBalance: {
            decrement: escrowHold.amount,
          },
        },
      });

      // Create transaction record for release
      await tx.transaction.create({
        data: {
          walletId: escrowHold.walletId,
          amount: escrowHold.amount,
          fee: 0,
          netAmount: escrowHold.amount,
          type: TransactionType.ESCROW_RELEASE,
          status: TransactionStatus.RELEASED,
          gateway: escrowHold.gateway,
          referenceId: `rel_${uuidv4()}`,
          orderId: escrowHold.orderId || undefined,
          description: `Escrow release for order ${escrowHold.orderId || 'N/A'}`,
          metadata: { ...metadata, escrowHoldId: escrowHold.id },
          processedAt: new Date(),
          relatedTransactionId: undefined, // TODO: Link to original hold transaction
        },
      });

      // Credit seller's wallet
      await walletService.credit({
        userId: escrowHold.sellerId,
        amount: escrowHold.amount,
        currency: escrowHold.currency,
        type: TransactionType.ESCROW_RELEASE,
        gateway: escrowHold.gateway,
        referenceId: `payout_${uuidv4()}`,
        description: `Payment received from escrow for order ${escrowHold.orderId || 'N/A'}`,
        metadata: { escrowHoldId: escrowHold.id },
      });

      return updatedEscrow;
    });
  }

  /**
   * Refund escrow amount back to buyer
   */
  async refundEscrow(escrowHoldId: string, metadata: any = {}): Promise<EscrowHoldWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const escrowHold = await tx.escrowHold.findUnique({
        where: { id: escrowHoldId },
      });

      if (!escrowHold) {
        throw new Error('Escrow hold not found');
      }

      if (escrowHold.status !== TransactionStatus.HELD_IN_ESCROW) {
        throw new Error('Escrow is not in a valid state for refund');
      }

      // Update escrow hold status
      const updatedEscrow = await tx.escrowHold.update({
        where: { id: escrowHoldId },
        data: {
          status: TransactionStatus.REFUNDED,
          releasedAt: new Date(),
          metadata: { ...(escrowHold.metadata as any), ...metadata },
        },
      });

      // Update wallet balances
      await tx.wallet.update({
        where: { id: escrowHold.walletId },
        data: {
          escrowBalance: {
            decrement: escrowHold.amount,
          },
          balance: {
            increment: escrowHold.amount, // Return to available balance
          },
        },
      });

      // Create transaction record for refund
      await tx.transaction.create({
        data: {
          walletId: escrowHold.walletId,
          amount: escrowHold.amount,
          fee: 0,
          netAmount: escrowHold.amount,
          type: TransactionType.ESCROW_REFUND,
          status: TransactionStatus.REFUNDED,
          gateway: escrowHold.gateway,
          referenceId: `ref_${uuidv4()}`,
          orderId: escrowHold.orderId || undefined,
          description: `Escrow refund for order ${escrowHold.orderId || 'N/A'}`,
          metadata: { ...metadata, escrowHoldId: escrowHold.id },
          processedAt: new Date(),
          relatedTransactionId: undefined, // TODO: Link to original hold transaction
        },
      });

      return updatedEscrow;
    });
  }

  /**
   * Get escrow hold by ID with related transactions
   */
  async getEscrowHold(escrowHoldId: string): Promise<EscrowHoldWithRelations | null> {
    return this.prisma.escrowHold.findUnique({
      where: { id: escrowHoldId },
      include: {
        transactions: true,
      },
    });
  }

  /**
   * List escrow holds for a wallet
   */
  async listEscrowHolds(walletId: string, filters: {
    status?: TransactionStatus;
    gateway?: PaymentGateway;
    orderId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { walletId };
    
    if (filters.status) where.status = filters.status;
    if (filters.gateway) where.gateway = filters.gateway;
    if (filters.orderId) where.orderId = filters.orderId;

    const [items, total] = await Promise.all([
      this.prisma.escrowHold.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get the most recent transaction
          },
        },
      }),
      this.prisma.escrowHold.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }
}

export const escrowService = new EscrowService();
