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
  sellerWalletId?: string; // Optional: explicitly specify which wallet receives funds
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

type CheckEscrowRulesParams = {
  walletId: string;
  amount: number;
  orderType?: string;
};

type CheckEscrowRulesResult = {
  isEscrowRequired: boolean;
  reason?: 'AMOUNT_THRESHOLD' | 'HIGH_RISK_ORDER_TYPE' | 'MANUAL_ESCROW_ENABLED';
  wallet?: any;
};

export class EscrowService {
  private prisma: PrismaClient;

  constructor(prismaInstance: PrismaClient = prisma) {
    this.prisma = prismaInstance;
  }

  /**
   * Check rules to determine if escrow is required for a transaction.
   */
  async checkEscrowRules({
    walletId,
    amount,
    orderType,
  }: CheckEscrowRulesParams): Promise<CheckEscrowRulesResult> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new Error('Wallet not found for escrow rule check');
    }

    // Rule 1: Manual escrow enabled on the wallet
    if (wallet.isEscrowEnabled) {
      return {
        isEscrowRequired: true,
        reason: 'MANUAL_ESCROW_ENABLED',
        wallet,
      };
    }

    // Rule 2: Amount threshold
    // Ensure escrowThreshold is treated as a number (it should be Float in schema)
    const threshold = typeof wallet.escrowThreshold === 'number' ? wallet.escrowThreshold : parseFloat(wallet.escrowThreshold as any);
    if (amount >= threshold) {
      return {
        isEscrowRequired: true,
        reason: 'AMOUNT_THRESHOLD',
        wallet,
      };
    }

    // Rule 3: High-risk order type
    const highRiskOrderTypes = ['DIRECT_PURCHASE']; // Add other high-risk types here
    if (orderType && highRiskOrderTypes.includes(orderType.toUpperCase())) {
      return {
        isEscrowRequired: true,
        reason: 'HIGH_RISK_ORDER_TYPE',
        wallet,
      };
    }

    return {
      isEscrowRequired: false,
      wallet,
    };
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
    sellerWalletId, // Optional: may be provided directly
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

      // Determine the seller's wallet if not explicitly provided
      let targetSellerWalletId = sellerWalletId;
      if (!targetSellerWalletId) {
        // Find all active wallets for the seller
        const sellerWallets = await tx.wallet.findMany({
          where: { 
            userId: sellerId,
            status: 'active', // Only consider active wallets
          },
        });

        if (!sellerWallets || sellerWallets.length === 0) {
          throw new Error('No active seller wallets found');
        }

        // Find the best matching wallet based on currency
        let selectedWallet = sellerWallets.find(wallet => 
          wallet.currency === currency && 
          wallet.isEscrowEnabled === true
        );

        // If no wallet with matching currency and escrow enabled, just match currency
        if (!selectedWallet) {
          selectedWallet = sellerWallets.find(wallet => 
            wallet.currency === currency
          );
        }

        // If no currency match at all, use the first wallet
        if (!selectedWallet) {
          selectedWallet = sellerWallets[0];
        }

        targetSellerWalletId = selectedWallet.id;
      }

      const referenceId = `escrow-${Date.now()}`;

      // Create escrow hold
      const escrowHold = await tx.escrowHold.create({
        data: {
          id: uuidv4(),
          walletId,
          amount,
          currency,
          status: TransactionStatus.HELD_IN_ESCROW,
          gateway,
          referenceId,
          buyerId,
          sellerId,
          sellerWalletId: targetSellerWalletId, // Store the determined seller wallet ID
          orderId,
          metadata,
          releaseDate,
        },
        include: {
          buyer: true,
          seller: true,
          wallet: true
        }
      });

      // Now, create the transaction record using WalletService for the payer's wallet
      // This transaction reflects the funds moving into escrow from the payer's main balance.
      await walletService.createTransaction(walletId, {
        amount: -amount, // Negative amount to debit payer's main balance
        currency,
        type: TransactionType.ESCROW_HOLD,
        status: TransactionStatus.HELD_IN_ESCROW, // This status will trigger balance update in WalletService
        gateway,
        referenceId: escrowHold.referenceId, // Or a new specific tx reference
        description: `Escrow hold for order ${orderId || escrowHold.id}`,
        metadata: {
          ...metadata,
          action: 'create_escrow_hold_transaction',
          escrowHoldId: escrowHold.id,
          buyerId,
          sellerId,
          orderId,
        },
        fee: 0, // Assuming no extra fee for the hold transaction itself
        netAmount: -amount, // Net amount is also negative
      });

      // Update wallet escrow balance
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          escrowBalance: {
            increment: amount,
          },
        },
      });

      // Send notifications if enabled
      if (sendNotifications) {
        try {
          await this.sendEscrowCreatedNotifications({
            escrowHold,
            buyer,
            seller,
            wallet,
            amount,
            currency,
            orderId,
            referenceId,
            releaseDate,
          });
        } catch (error) {
          logger.error('Failed to send escrow created notifications', { error });
        }
      }

      return escrowHold;
    });
  }

  /**
   * Release funds from escrow
   */
  async releaseEscrow({
    escrowHoldId,
    metadata = {},
    sendNotifications = true,
  }: ReleaseEscrowParams): Promise<EscrowHoldWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const escrowHold = await tx.escrowHold.findUnique({
        where: { id: escrowHoldId },
        include: {
          wallet: true, // Payer's wallet
          buyer: true,
          seller: true,
        },
      });

      if (!escrowHold) {
        throw new Error('Escrow hold not found');
      }
      
      // First try to use the stored sellerWalletId (most reliable)
      let sellerWalletId = escrowHold.sellerWalletId;
      
      // Fall back to finding the seller's wallet if sellerWalletId isn't stored
      if (!sellerWalletId) {
        console.warn(`sellerWalletId not found on escrow hold ${escrowHoldId}, attempting to find best matching wallet`);
        
        // Find all active wallets for the seller
        const sellerWallets = await tx.wallet.findMany({
          where: { 
            userId: escrowHold.sellerId,
            status: 'active',
          },
        });

        if (!sellerWallets || sellerWallets.length === 0) {
          throw new Error('No active seller wallets found');
        }

        // Find the best matching wallet based on currency
        let selectedWallet = sellerWallets.find(wallet => 
          wallet.currency === escrowHold.currency
        );

        // If no currency match at all, use the first wallet
        if (!selectedWallet) {
          selectedWallet = sellerWallets[0];
        }

        sellerWalletId = selectedWallet.id;
      }
      
      // Verify the seller wallet exists and is accessible
      const sellerWallet = await tx.wallet.findUnique({
        where: { id: sellerWalletId },
      });
      
      if (!sellerWallet) {
        throw new Error(`Seller wallet with ID ${sellerWalletId} not found`);
      }

      if (escrowHold.status !== TransactionStatus.HELD_IN_ESCROW) {
        throw new Error(`Escrow is not in a valid state for release: ${escrowHold.status}`);
      }

      const referenceId = `escrow-release-${Date.now()}`;

      // Update escrow hold status
      const updatedEscrow = await tx.escrowHold.update({
        where: { id: escrowHoldId },
        data: {
          status: TransactionStatus.RELEASED,
          metadata: {
            ...(escrowHold.metadata as object || {}),
            releasedAt: new Date().toISOString(),
            ...metadata,
          },
        },
        include: {
          buyer: true,
          seller: true,
          wallet: true,
        },
      });

      // Create release transaction for the SELLER's wallet using WalletService
      // This transaction credits the seller's main balance.
      await walletService.createTransaction(sellerWalletId, {
        amount: escrowHold.amount, // Positive amount to credit seller's main balance
        currency: escrowHold.currency,
        type: TransactionType.ESCROW_RELEASE,
        status: TransactionStatus.COMPLETED, // This status will trigger balance update in WalletService
        gateway: escrowHold.gateway,
        referenceId, // Use the release-specific referenceId
        description: `Escrow funds released from hold ${escrowHold.id}`,
        metadata: {
          ...metadata,
          action: 'escrow_release_to_seller',
          escrowHoldId: escrowHold.id,
          originalPayerWalletId: escrowHold.walletId,
          buyerId: escrowHold.buyerId,
        },
        fee: 0, // Assuming no fee for the seller on release, or handle separately
        netAmount: escrowHold.amount,
      });

      // Update PAYER's wallet escrowBalance (decrement)
      await tx.wallet.update({
        where: { id: escrowHold.walletId }, // This is the original payer's wallet
        data: {
          escrowBalance: {
            decrement: escrowHold.amount,
          },
        },
      });

      // Send notifications if enabled
      if (sendNotifications) {
        try {
          await this.sendEscrowReleasedNotifications(updatedEscrow, metadata);
        } catch (error) {
          logger.error('Failed to send escrow released notifications', { error });
        }
      }

      return updatedEscrow;
    });
  }

  /**
   * Refund escrow to buyer
   */
  async refundEscrow({
    escrowHoldId,
    reason = 'Refund processed',
    metadata = {},
    sendNotifications = true,
  }: RefundEscrowParams): Promise<EscrowHoldWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const escrowHold = await tx.escrowHold.findUnique({
        where: { id: escrowHoldId },
        include: {
          wallet: true, // Payer's/Buyer's wallet (target for refund)
          buyer: true,
          seller: true,
        },
      });

      if (!escrowHold) {
        throw new Error('Escrow hold not found');
      }

      if (escrowHold.status !== TransactionStatus.HELD_IN_ESCROW) {
        throw new Error(`Escrow is not in a valid state for refund: ${escrowHold.status}`);
      }

      const referenceId = `escrow-refund-${Date.now()}`;

      // Update escrow hold status
      const updatedEscrow = await tx.escrowHold.update({
        where: { id: escrowHoldId },
        data: {
          status: TransactionStatus.REFUNDED,
          metadata: {
            ...(escrowHold.metadata as object || {}),
            refundedAt: new Date().toISOString(),
            refundReason: reason,
            ...metadata,
          },
        },
        include: {
          buyer: true,
          seller: true,
          wallet: true,
        },
      });

      // Create refund transaction using WalletService for the PAYER's/BUYER's wallet
      // This transaction credits their main balance.
      await walletService.createTransaction(escrowHold.walletId, {
        amount: escrowHold.amount, // Positive amount to credit their main balance
        currency: escrowHold.currency,
        type: TransactionType.ESCROW_REFUND,
        status: TransactionStatus.COMPLETED, // This status will trigger balance update in WalletService
        gateway: escrowHold.gateway,
        referenceId, // Use the refund-specific referenceId
        description: `Escrow funds refunded from hold ${escrowHold.id}. Reason: ${reason}`,
        metadata: {
          ...metadata,
          action: 'escrow_refund_to_payer',
          escrowHoldId: escrowHold.id,
          reason,
        },
        fee: 0, // Assuming no fee for the refund itself, or handle separately
        netAmount: escrowHold.amount,
      });

      // Update PAYER's/BUYER's wallet: decrement escrowBalance.
      // The main balance increment is handled by the walletService.createTransaction call above.
      await tx.wallet.update({
        where: { id: escrowHold.walletId },
        data: {
          escrowBalance: {
            decrement: escrowHold.amount,
          },
        },
      });

      // Send notifications if enabled
      if (sendNotifications) {
        try {
          await this.sendEscrowRefundedNotifications(updatedEscrow, { ...metadata, reason });
        } catch (error) {
          logger.error('Failed to send escrow refunded notifications', { error });
        }
      }

      return updatedEscrow;
    });
  }

  /**
   * Send notifications when an escrow is created
   */
  private async sendEscrowCreatedNotifications({
    escrowHold,
    buyer,
    seller,
    wallet,
    amount,
    currency,
    orderId,
    referenceId,
    releaseDate,
  }: {
    escrowHold: EscrowHoldWithRelations;
    buyer: any;
    seller: any;
    wallet: any;
    amount: number;
    currency: string;
    orderId?: string;
    referenceId: string;
    releaseDate?: Date;
  }) {
    const amountFormatted = (amount / 100).toFixed(2);
    const releaseDateFormatted = releaseDate ? new Date(releaseDate).toLocaleDateString() : 'Upon order completion';

    // Notify buyer
    if (buyer.email) {
      await emailService.sendEmail({
        to: buyer.email,
        subject: `Escrow Hold Created - ${referenceId}`,
        template: 'escrow-created',
        context: {
          name: buyer.name || 'Customer',
          amount: amountFormatted,
          currency,
          orderId,
          referenceId,
          releaseDate: releaseDateFormatted,
          supportEmail: 'support@example.com',
        },
      });
    }

    // Notify seller
    if (seller.email) {
      await emailService.sendEmail({
        to: seller.email,
        subject: `Escrow Hold Created - ${referenceId}`,
        template: 'escrow-created-seller',
        context: {
          name: seller.name || 'Seller',
          amount: amountFormatted,
          currency,
          orderId,
          referenceId,
          releaseDate: releaseDateFormatted,
          buyerEmail: buyer.email || 'customer',
          supportEmail: 'support@example.com',
        },
      });
    }
  }

  /**
   * Send notifications when escrow is released
   */
  private async sendEscrowReleasedNotifications(
    escrowHold: EscrowHoldWithRelations,
    metadata: Record<string, any> = {}
  ) {
    const { buyer, seller, amount, currency, referenceId, orderId } = escrowHold;
    const amountFormatted = (amount / 100).toFixed(2);

    // Notify buyer
    if (buyer?.email) {
      await emailService.sendEmail({
        to: buyer.email,
        subject: `Escrow Funds Released - ${referenceId}`,
        template: 'escrow-released',
        context: {
          name: buyer.name || 'Customer',
          amount: amountFormatted,
          currency,
          orderId,
          referenceId,
          releaseDate: new Date().toLocaleDateString(),
          supportEmail: 'support@example.com',
          ...metadata,
        },
      });
    }

    // Notify seller
    if (seller?.email) {
      await emailService.sendEmail({
        to: seller.email,
        subject: `Escrow Funds Released - ${referenceId}`,
        template: 'escrow-released-seller',
        context: {
          name: seller.name || 'Seller',
          amount: amountFormatted,
          currency,
          orderId,
          referenceId,
          buyerEmail: buyer?.email || 'customer',
          supportEmail: 'support@example.com',
          ...metadata,
        },
      });
    }
  }

  /**
   * Send notifications when escrow is refunded
   */
  private async sendEscrowRefundedNotifications(
    escrowHold: EscrowHoldWithRelations,
    metadata: Record<string, any> = {},
  ) {
    const { buyer, seller, amount, currency, referenceId, orderId } = escrowHold;
    const amountFormatted = (amount / 100).toFixed(2);
    const reason = metadata.reason || 'Refund processed';

    // Notify buyer
    if (buyer?.email) {
      await emailService.sendEmail({
        to: buyer.email,
        subject: `Escrow Refund Processed - ${referenceId}`,
        template: 'escrow-refunded',
        context: {
          name: buyer.name || 'Customer',
          amount: amountFormatted,
          currency,
          orderId,
          referenceId,
          reason,
          refundDate: new Date().toLocaleDateString(),
          supportEmail: 'support@example.com',
          ...metadata,
        },
      });
    }

    // Notify seller
    if (seller?.email) {
      await emailService.sendEmail({
        to: seller.email,
        subject: `Escrow Refund Processed - ${referenceId}`,
        template: 'escrow-refunded-seller',
        context: {
          name: seller.name || 'Seller',
          amount: amountFormatted,
          currency,
          orderId,
          referenceId,
          reason,
          buyerEmail: buyer?.email || 'customer',
          supportEmail: 'support@example.com',
          ...metadata,
        },
      });
    }
  }
}

export const escrowService = new EscrowService();
