import { PrismaClient, TransactionType, TransactionStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export class TransactionSecurityService {
  private readonly MAX_DAILY_AMOUNT = 1000000; // ₹10 lakh
  private readonly MAX_SINGLE_TRANSACTION = 100000; // ₹1 lakh
  private readonly SUSPICIOUS_THRESHOLD = 50000; // ₹50k
  private readonly MAX_DAILY_TRANSACTIONS = 50;
  private readonly RISK_SCORE_THRESHOLD = 0.7;

  constructor(private readonly prisma: PrismaClient) {}

  async validateTransaction(transaction: {
    userId: string;
    amount: number;
    type: TransactionType;
    currency: string;
    metadata?: any;
  }): Promise<{ isValid: boolean; riskScore: number; reason?: string }> {
    try {
      // Check transaction limits
      const dailyTotal = await this.getDailyTransactionTotal(transaction.userId);
      if (dailyTotal + transaction.amount > this.MAX_DAILY_AMOUNT) {
        return {
          isValid: false,
          riskScore: 1,
          reason: 'Daily transaction limit exceeded'
        };
      }

      // Check single transaction limit
      if (transaction.amount > this.MAX_SINGLE_TRANSACTION) {
        return {
          isValid: false,
          riskScore: 1,
          reason: 'Single transaction limit exceeded'
        };
      }

      // Check daily transaction count
      const dailyCount = await this.getDailyTransactionCount(transaction.userId);
      if (dailyCount >= this.MAX_DAILY_TRANSACTIONS) {
        return {
          isValid: false,
          riskScore: 1,
          reason: 'Daily transaction count limit exceeded'
        };
      }

      // Calculate risk score
      const riskScore = await this.calculateRiskScore(transaction);
      
      // Check for suspicious patterns
      const suspiciousPatterns = await this.detectSuspiciousPatterns(transaction);
      if (suspiciousPatterns.length > 0) {
        await this.flagSuspiciousTransaction(transaction, suspiciousPatterns);
        return {
          isValid: false,
          riskScore: Math.max(riskScore, 0.8),
          reason: `Suspicious patterns detected: ${suspiciousPatterns.join(', ')}`
        };
      }

      return {
        isValid: riskScore < this.RISK_SCORE_THRESHOLD,
        riskScore,
        reason: riskScore >= this.RISK_SCORE_THRESHOLD ? 'High risk transaction' : undefined
      };
    } catch (error) {
      logger.error('Transaction validation error:', error);
      throw error;
    }
  }

  private async getDailyTransactionTotal(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.transaction.aggregate({
      where: {
        wallet: {
          userId
        },
        createdAt: {
          gte: today
        },
        status: TransactionStatus.COMPLETED
      },
      _sum: {
        amount: true
      }
    });

    return result._sum.amount || 0;
  }

  private async getDailyTransactionCount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.transaction.count({
      where: {
        wallet: {
          userId
        },
        createdAt: {
          gte: today
        }
      }
    });
  }

  private async calculateRiskScore(transaction: {
    userId: string;
    amount: number;
    type: TransactionType;
    currency: string;
    metadata?: any;
  }): Promise<number> {
    let riskScore = 0;

    // Amount-based risk
    if (transaction.amount > this.SUSPICIOUS_THRESHOLD) {
      riskScore += 0.3;
    }

    // Transaction type risk
    if (transaction.type === TransactionType.WITHDRAWAL) {
      riskScore += 0.2;
    }

    // User history risk
    const userHistory = await this.getUserTransactionHistory(transaction.userId);
    if (userHistory.recentFailedTransactions > 0) {
      riskScore += 0.2;
    }

    // Velocity risk
    if (userHistory.recentTransactionCount > 10) {
      riskScore += 0.1;
    }

    // Location risk (if available in metadata)
    if (transaction.metadata?.location) {
      const locationRisk = await this.calculateLocationRisk(transaction.metadata.location);
      riskScore += locationRisk;
    }

    return Math.min(riskScore, 1);
  }

  private async detectSuspiciousPatterns(transaction: {
    userId: string;
    amount: number;
    type: TransactionType;
    currency: string;
    metadata?: any;
  }): Promise<string[]> {
    const patterns: string[] = [];

    // Check for round numbers
    if (transaction.amount % 10000 === 0) {
      patterns.push('Round number transaction');
    }

    // Check for rapid transactions
    const recentTransactions = await this.getRecentTransactions(transaction.userId);
    if (recentTransactions.length > 0) {
      const timeSinceLastTransaction = Date.now() - new Date(recentTransactions[0].createdAt).getTime();
      if (timeSinceLastTransaction < 60000) { // Less than 1 minute
        patterns.push('Rapid transaction');
      }
    }

    // Check for unusual amount patterns
    if (this.isUnusualAmount(transaction.amount)) {
      patterns.push('Unusual amount pattern');
    }

    return patterns;
  }

  private async flagSuspiciousTransaction(
    transaction: {
      userId: string;
      amount: number;
      type: TransactionType;
      currency: string;
      metadata?: any;
    },
    patterns: string[]
  ): Promise<void> {
    await this.prisma.suspiciousTransaction.create({
      data: {
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        currency: transaction.currency,
        patterns: patterns,
        metadata: transaction.metadata,
        status: 'flagged'
      }
    });

    // Log the suspicious transaction
    logger.warn('Suspicious transaction flagged', {
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      patterns
    });
  }

  private async getUserTransactionHistory(userId: string): Promise<{
    recentFailedTransactions: number;
    recentTransactionCount: number;
  }> {
    const recentTransactions = await this.getRecentTransactions(userId);
    
    return {
      recentFailedTransactions: recentTransactions.filter(t => t.status === TransactionStatus.FAILED).length,
      recentTransactionCount: recentTransactions.length
    };
  }

  private async getRecentTransactions(userId: string, limit: number = 10) {
    return this.prisma.transaction.findMany({
      where: {
        wallet: {
          userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }

  private isUnusualAmount(amount: number): boolean {
    // Check for common fraud patterns
    const unusualPatterns = [
      amount === 99999,
      amount === 999999,
      amount === 100000,
      amount === 1000000
    ];
    
    return unusualPatterns.some(pattern => pattern);
  }

  private async calculateLocationRisk(location: any): Promise<number> {
    // Implement location-based risk calculation
    // This could check against known fraud locations, VPN usage, etc.
    return 0.1; // Default risk score
  }
}

export const transactionSecurityService = new TransactionSecurityService(prisma); 