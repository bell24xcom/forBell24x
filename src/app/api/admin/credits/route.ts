/**
 * Admin Credit Management — /api/admin/credits
 *
 * GET  ?userId=<id>            — view credit balance + purchase history for a user
 * POST { action, userId, ... } — grant or deduct credits for a user
 *
 * Actions:
 *   grant  { userId, amount, reason }  — add credits (founder cohort onboarding, etc.)
 *   deduct { userId, amount, reason }  — remove credits (refund, correction)
 *
 * Auth: ADMIN role required (JWT or ADMIN_TOKEN env var).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// ── GET: view balance + history ────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    // Return a paginated summary of all users' credit balances
    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20', 10));
    const skip  = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.userCredits.findMany({
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, company: true, phone: true, role: true },
          },
        },
      }),
      prisma.userCredits.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: rows.map(r => ({
        userId:    r.userId,
        credits:   r.credits,
        spent:     r.spent,
        updatedAt: r.updatedAt,
        user:      r.user,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }

  // Single user detail
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, company: true, phone: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  const [credits, purchases] = await Promise.all([
    prisma.userCredits.findUnique({ where: { userId } }),
    prisma.creditPurchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    success: true,
    user,
    credits: credits
      ? { balance: credits.credits, spent: credits.spent, updatedAt: credits.updatedAt }
      : { balance: 0, spent: 0, updatedAt: null },
    purchases,
  });
}

// ── POST: grant or deduct credits ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action, userId, amount, reason } = body as Record<string, unknown>;

  if (!action || !userId || !amount) {
    return NextResponse.json(
      { success: false, error: 'action, userId, and amount are required' },
      { status: 400 }
    );
  }

  if (action !== 'grant' && action !== 'deduct') {
    return NextResponse.json(
      { success: false, error: 'action must be "grant" or "deduct"' },
      { status: 400 }
    );
  }

  const parsedAmount = parseInt(String(amount), 10);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json(
      { success: false, error: 'amount must be a positive integer' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: String(userId) },
    select: { id: true, name: true, company: true },
  });
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  if (action === 'grant') {
    const updated = await prisma.userCredits.upsert({
      where:  { userId: user.id },
      create: { userId: user.id, credits: parsedAmount, spent: 0 },
      update: { credits: { increment: parsedAmount } },
    });

    console.info('[admin/credits] grant', {
      adminId: auth.userId,
      userId:  user.id,
      amount:  parsedAmount,
      reason:  reason ?? 'no reason provided',
      newBalance: updated.credits,
    });

    return NextResponse.json({
      success:    true,
      action:     'grant',
      userId:     user.id,
      amountGranted: parsedAmount,
      newBalance: updated.credits,
      reason,
    });
  }

  // action === 'deduct'
  const current = await prisma.userCredits.findUnique({ where: { userId: user.id } });
  const currentBalance = current?.credits ?? 0;

  if (currentBalance < parsedAmount) {
    return NextResponse.json(
      {
        success: false,
        error: `Insufficient balance. User has ${currentBalance} credit(s); tried to deduct ${parsedAmount}.`,
      },
      { status: 400 }
    );
  }

  const updated = await prisma.userCredits.update({
    where: { userId: user.id },
    data:  { credits: { decrement: parsedAmount }, spent: { increment: parsedAmount } },
  });

  console.info('[admin/credits] deduct', {
    adminId: auth.userId,
    userId:  user.id,
    amount:  parsedAmount,
    reason:  reason ?? 'no reason provided',
    newBalance: updated.credits,
  });

  return NextResponse.json({
    success:       true,
    action:        'deduct',
    userId:        user.id,
    amountDeducted: parsedAmount,
    newBalance:    updated.credits,
    reason,
  });
}
