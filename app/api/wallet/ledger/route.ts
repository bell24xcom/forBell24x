import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'all';

  const rangeMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
  const since = rangeMap[range]
    ? new Date(Date.now() - rangeMap[range] * 86400000)
    : new Date('2000-01-01');

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.userId } });
    if (!wallet) {
      return NextResponse.json({ success: true, balance: 0, transactions: [], currency: 'INR' });
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Compute running balance from oldest to newest, then reverse
    let running = wallet.balance;
    const withBalance = [...transactions].reverse().map(tx => {
      const snapshot = running;
      running -= tx.type === 'CREDIT' ? tx.amount : -tx.amount;
      return { ...tx, balanceAfter: snapshot };
    }).reverse();

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      transactions: withBalance,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Ledger error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ledger' }, { status: 500 });
  }
}
