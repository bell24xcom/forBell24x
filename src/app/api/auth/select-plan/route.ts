import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, extractToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(
      request.headers.get('authorization'),
      request.cookies.get('auth-token')?.value
    );

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { success: false, message: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const isTrial = planId === 'professional';
    const trialEndDate = isTrial
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const existingPrefs = (user.preferences as Record<string, unknown>) ?? {};

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        preferences: {
          ...existingPrefs,
          plan: planId,
          planSelected: true,
          planStartDate: new Date().toISOString(),
          planStatus: isTrial ? 'trial' : 'active',
          isTrial,
          trialEndDate,
          trialDaysRemaining: isTrial ? 90 : null,
        },
      },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        preferences: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Plan selected successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Plan selection error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
