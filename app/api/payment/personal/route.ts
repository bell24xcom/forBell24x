import { NextRequest, NextResponse } from 'next/server';
import { jwt } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await jwt.authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get transactions for the user
    const buyerTransactions = await prisma.transaction.findMany({
      where: { buyerId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    const supplierTransactions = await prisma.transaction.findMany({
      where: { supplierId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    // Combine and sort transactions
    const allTransactions = [
      ...buyerTransactions.map(tx => ({ ...tx, type: 'debit' as const })),
      ...supplierTransactions.map(tx => ({ ...tx, type: 'credit' as const })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Calculate summary
    const totalSpent = buyerTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalEarned = supplierTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const balance = totalEarned - totalSpent;

    return NextResponse.json({
      success: true,
      transactions: allTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        description: tx.description,
        createdAt: tx.createdAt,
      })),
      summary: {
        totalSpent,
        totalEarned,
        balance,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}