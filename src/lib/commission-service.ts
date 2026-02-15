import { prisma } from './prisma';

interface CommissionRate {
  rfqCommission: number; // 2-5% of RFQ value
  transactionCommission: number; // 1-3% of transaction value
  subscriptionCommission: number; // 10-20% of subscription value
  premiumFeatureCommission: number; // 5-10% of premium feature value
}

interface CommissionCalculation {
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
}

interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  processedAt?: Date;
  failureReason?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
}

class CommissionService {
  private defaultRates: CommissionRate = {
    rfqCommission: 0.03, // 3%
    transactionCommission: 0.02, // 2%
    subscriptionCommission: 0.15, // 15%
    premiumFeatureCommission: 0.075 // 7.5%
  };

  // Calculate commission for different transaction types
  async calculateCommission(
    type: 'rfq' | 'transaction' | 'subscription' | 'premium_feature',
    amount: number,
    userId: string,
    metadata?: any
  ): Promise<CommissionCalculation> {
    try {
      // Get user's commission rate (could be customized based on user tier)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Determine commission rate based on type and user tier
      let commissionRate = this.defaultRates[`${type}Commission` as keyof CommissionRate];
      
      // Apply tier-based discounts
      if (user.company?.type === 'PREMIUM') {
        commissionRate *= 0.8; // 20% discount for premium users
      } else if (user.company?.type === 'ENTERPRISE') {
        commissionRate *= 0.6; // 40% discount for enterprise users
      }

      // Calculate commission
      const commissionAmount = amount * commissionRate;
      const platformFee = commissionAmount * 0.1; // 10% of commission goes to platform
      const netAmount = amount - commissionAmount;

      const calculation: CommissionCalculation = {
        baseAmount: amount,
        commissionRate,
        commissionAmount,
        platformFee,
        netAmount,
        currency: 'INR'
      };

      // Store commission record
      await this.recordCommission({
        userId,
        type,
        amount,
        commissionAmount,
        platformFee,
        metadata,
        calculation
      });

      return calculation;
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw error;
    }
  }

  // Record commission in database
  private async recordCommission(data: {
    userId: string;
    type: string;
    amount: number;
    commissionAmount: number;
    platformFee: number;
    metadata?: any;
    calculation: CommissionCalculation;
  }) {
    try {
      await prisma.commission.create({
        data: {
          userId: data.userId,
          type: data.type,
          baseAmount: data.amount,
          commissionAmount: data.commissionAmount,
          platformFee: data.platformFee,
          netAmount: data.calculation.netAmount,
          currency: data.calculation.currency,
          status: 'pending',
          metadata: data.metadata || {},
          calculatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error recording commission:', error);
      throw error;
    }
  }

  // Process commission payout
  async processPayout(
    userId: string,
    amount: number,
    bankDetails: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      accountHolderName: string;
    }
  ): Promise<PayoutRequest> {
    try {
      // Check if user has sufficient commission balance
      const totalCommissions = await this.getUserCommissionBalance(userId);
      
      if (totalCommissions < amount) {
        throw new Error('Insufficient commission balance');
      }

      // Create payout request
      const payoutRequest = await prisma.payoutRequest.create({
        data: {
          userId,
          amount,
          currency: 'INR',
          status: 'pending',
          requestedAt: new Date(),
          bankDetails: {
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            bankName: bankDetails.bankName,
            accountHolderName: bankDetails.accountHolderName
          }
        }
      });

      // Process payout (integrate with payment gateway)
      await this.executePayout(payoutRequest.id);

      return payoutRequest;
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  // Execute actual payout via payment gateway
  private async executePayout(payoutRequestId: string) {
    try {
      const payoutRequest = await prisma.payoutRequest.findUnique({
        where: { id: payoutRequestId }
      });

      if (!payoutRequest) {
        throw new Error('Payout request not found');
      }

      // Update status to processing
      await prisma.payoutRequest.update({
        where: { id: payoutRequestId },
        data: { status: 'processing' }
      });

      // Here you would integrate with Razorpay or other payment gateway
      // For now, we'll simulate a successful payout
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      // Update status to completed
      await prisma.payoutRequest.update({
        where: { id: payoutRequestId },
        data: { 
          status: 'completed',
          processedAt: new Date()
        }
      });

      // Mark commissions as paid
      await prisma.commission.updateMany({
        where: {
          userId: payoutRequest.userId,
          status: 'pending'
        },
        data: { status: 'paid' }
      });

    } catch (error) {
      // Update status to failed
      await prisma.payoutRequest.update({
        where: { id: payoutRequestId },
        data: { 
          status: 'failed',
          failureReason: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  // Get user's commission balance
  async getUserCommissionBalance(userId: string): Promise<number> {
    try {
      const result = await prisma.commission.aggregate({
        where: {
          userId,
          status: 'pending'
        },
        _sum: {
          commissionAmount: true
        }
      });

      return result._sum.commissionAmount || 0;
    } catch (error) {
      console.error('Error getting commission balance:', error);
      return 0;
    }
  }

  // Get user's commission history
  async getUserCommissionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;

      const [commissions, total] = await Promise.all([
        prisma.commission.findMany({
          where: { userId },
          orderBy: { calculatedAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.commission.count({
          where: { userId }
        })
      ]);

      return {
        commissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting commission history:', error);
      throw error;
    }
  }

  // Get payout history
  async getPayoutHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;

      const [payouts, total] = await Promise.all([
        prisma.payoutRequest.findMany({
          where: { userId },
          orderBy: { requestedAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.payoutRequest.count({
          where: { userId }
        })
      ]);

      return {
        payouts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting payout history:', error);
      throw error;
    }
  }

  // Get commission analytics
  async getCommissionAnalytics(userId: string, period: '7d' | '30d' | '90d' | '1y' = '30d') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [totalCommissions, totalPayouts, pendingCommissions] = await Promise.all([
        prisma.commission.aggregate({
          where: {
            userId,
            calculatedAt: { gte: startDate }
          },
          _sum: { commissionAmount: true },
          _count: true
        }),
        prisma.payoutRequest.aggregate({
          where: {
            userId,
            requestedAt: { gte: startDate },
            status: 'completed'
          },
          _sum: { amount: true },
          _count: true
        }),
        prisma.commission.aggregate({
          where: {
            userId,
            status: 'pending'
          },
          _sum: { commissionAmount: true }
        })
      ]);

      return {
        period,
        totalCommissions: totalCommissions._sum.commissionAmount || 0,
        totalPayouts: totalPayouts._sum.amount || 0,
        pendingCommissions: pendingCommissions._sum.commissionAmount || 0,
        commissionCount: totalCommissions._count,
        payoutCount: totalPayouts._count,
        availableBalance: (pendingCommissions._sum.commissionAmount || 0) - (totalPayouts._sum.amount || 0)
      };
    } catch (error) {
      console.error('Error getting commission analytics:', error);
      throw error;
    }
  }
}

export const commissionService = new CommissionService();
export type { CommissionCalculation, PayoutRequest, CommissionRate };
