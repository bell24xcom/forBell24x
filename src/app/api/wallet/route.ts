import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/jwt';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

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

    // Find user's wallet first (WalletTransaction links via walletId, not userId)
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return NextResponse.json({
        success: true,
        balance: 0,
        transactions: [],
      });
    }

    // Get transaction history
    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Calculate balance from wallet model
    const totalBalance = wallet.balance;

    return NextResponse.json({
      success: true,
      balance: totalBalance,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
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

/**
 * POST /api/wallet
 *
 * VS-SECURITY-P0-CLOSE-01 — Admin-only direct wallet credit.
 *
 * This endpoint bypasses Razorpay and directly credits a wallet. That is only
 * safe when performed by a verified platform admin. Non-admin callers must use
 * the Razorpay-verified flow: POST /api/payment/create-order + POST /api/payment/verify.
 *
 * Authorization: ADMIN role required (JWT with role=ADMIN, or ADMIN_TOKEN header).
 * Audit log: every credit is recorded with admin identity and reason.
 */
export async function POST(request: NextRequest) {
  // Enforce admin-only access
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await request.json();
    const { userId, amount, description } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      );
    }

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find or create wallet for the target user
    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 },
      });
    }

    // Atomic credit
    const [transaction] = await prisma.$transaction([
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount,
          description: description || `Admin manual credit by ${auth.userId}`,
          reference: `admin_credit_${Date.now()}`,
        },
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      }),
    ]);

    console.info(
      `[wallet/POST] Admin credit: adminId=${auth.userId} targetUserId=${userId} amount=${amount} reason="${description || 'none'}"`
    );

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('[wallet/POST] Error applying admin credit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}