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

    const { kycData } = await request.json();

    if (!kycData) {
      return NextResponse.json(
        { success: false, message: 'KYC data is required' },
        { status: 400 }
      );
    }

    // Store KYC data in user preferences JSON field
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const existingPrefs = (user.preferences as Record<string, unknown>) ?? {};

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        // Update verification status and store KYC data
        isVerified: false, // stays false until admin approves
        gstNumber: kycData.gstNumber || user.gstNumber,
        company: kycData.companyName || user.company,
        preferences: {
          ...existingPrefs,
          kyc: {
            ...kycData,
            submittedAt: new Date().toISOString(),
            status: 'pending', // pending | approved | rejected
          },
          kycCompleted: true,
        },
      },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        company: true,
        gstNumber: true,
        isVerified: true,
        preferences: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'KYC data submitted successfully. Verification pending.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
