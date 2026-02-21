import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request.headers.get('authorization'), request.cookies.get('auth-token')?.value);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Get wallet balance
    const balance = await prisma.walletTransaction.aggregate({
      where: { userId, type: 'CREDIT' },
      _sum: { amount: true },
    });

    const debits = await prisma.walletTransaction.aggregate({
      where: { userId, type: 'DEBIT' },
      _sum: { amount: true },
    });

    const totalBalance = (balance._sum.amount || 0) - (debits._sum.amount || 0);

    // Get transaction history
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      balance: totalBalance,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request.headers.get('authorization'), request.cookies.get('auth-token')?.value);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Parse request body
    const body = await request.json();
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create wallet transaction
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId,
        type: 'CREDIT',
        amount,
        description: description || 'Wallet top-up',
        status: 'COMPLETED',
      },
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('Error adding funds to wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}