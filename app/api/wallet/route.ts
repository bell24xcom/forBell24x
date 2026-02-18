import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    const userId = payload.userId;

    // Find or return empty wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    return NextResponse.json({
      success: true,
      wallet: {
        balance: wallet?.balance ?? 0,
        currency: wallet?.currency ?? 'INR',
        transactions: wallet?.transactions ?? [],
      },
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load wallet' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    const userId = payload.userId;

    const { amount, description, reference } = await request.json();
    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ success: false, error: 'Valid amount required' }, { status: 400 });
    }

    const depositAmount = parseFloat(amount);

    // Find or create wallet, then credit
    const wallet = await prisma.wallet.upsert({
      where: { userId },
      create: { userId, balance: depositAmount, currency: 'INR' },
      update: { balance: { increment: depositAmount } },
    });

    const txn = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'credit',
        amount: depositAmount,
        description: description || 'Wallet deposit',
        reference: reference || null,
      },
    });

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      transaction: txn,
    }, { status: 201 });
  } catch (error) {
    console.error('Wallet POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to add funds' }, { status: 500 });
  }
}
