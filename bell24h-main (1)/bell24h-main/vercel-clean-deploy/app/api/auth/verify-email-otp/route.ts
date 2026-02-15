import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, otp, phone } = await request.json();

    if (!email || !otp || !phone) {
      return NextResponse.json({ error: 'Email, OTP, and phone are required' }, { status: 400 });
    }

    // Find OTP in database
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        otp,
        type: 'email',
        expiresAt: { gt: new Date() }
      }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Find user by phone (since phone is primary)
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user with email verification
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        emailVerified: true,
        trustScore: 100, // Phone + Email verified
        lastLoginAt: new Date()
      }
    });

    // Delete used OTP
    await prisma.oTP.delete({
      where: { id: otpRecord.id }
    });

    console.log(`✅ Email verified for user: ${updatedUser.id}`);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        phoneVerified: updatedUser.phoneVerified,
        emailVerified: updatedUser.emailVerified,
        trustScore: updatedUser.trustScore,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Verify email OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify email OTP' }, { status: 500 });
  }
}
