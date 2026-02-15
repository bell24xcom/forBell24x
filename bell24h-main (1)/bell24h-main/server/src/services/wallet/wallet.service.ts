import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

type TransactionType = 'credit' | 'debit';

type WalletTransaction = {
  userId: string;
  amount: number;
  type: TransactionType;
  description?: string;
};

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    return wallet?.balance || 0;
  }

  async createTransaction(
    transaction: WalletTransaction
  ): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      // 1. Get current balance
      const wallet = await prisma.wallet.findUnique({
        where: { userId: transaction.userId },
      });

      // 2. Calculate new balance
      const currentBalance = wallet?.balance || 0;
      const newBalance =
        transaction.type === 'credit'
          ? currentBalance + transaction.amount
          : currentBalance - transaction.amount;

      // 3. Update wallet
      await prisma.wallet.upsert({
        where: { userId: transaction.userId },
        update: { balance: newBalance },
        create: {
          userId: transaction.userId,
          balance: newBalance,
        },
      });

      // 4. Record transaction
      await prisma.transaction.create({
        data: {
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description || '',
          balanceAfter: newBalance,
        },
      });
    });
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      // 1. Get the transaction to rollback
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) return;

      // 2. Get current wallet balance
      const wallet = await prisma.wallet.findUnique({
        where: { userId: transaction.userId },
      });

      if (!wallet) return;

      // 3. Calculate reversed balance
      const reverseAmount = transaction.amount;
      const reverseType = transaction.type === 'credit' ? 'debit' : 'credit';
      const newBalance = 
        reverseType === 'credit'
          ? wallet.balance + reverseAmount
          : wallet.balance - reverseAmount;

      // 4. Update wallet
      await prisma.wallet.update({
        where: { userId: transaction.userId },
        data: { balance: newBalance },
      });

      // 5. Record reversal transaction
      await prisma.transaction.create({
        data: {
          userId: transaction.userId,
          amount: reverseAmount,
          type: reverseType,
          description: `Rollback of ${transactionId}`,
          balanceAfter: newBalance,
        },
      });

      // 6. Mark original transaction as rolled back
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { description: `${transaction.description || ''} [ROLLED BACK]` },
      });
    });
  }
}
