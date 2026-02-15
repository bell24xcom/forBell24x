import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 });
    }

    // Find OTP record
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { phone }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'OTP not found. Please request a new OTP.' }, { status: 400 });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ error: 'OTP expired. Please request a new OTP.' }, { status: 400 });
    }

    // Check if OTP is already verified
    if (otpRecord.isVerified) {
      return NextResponse.json({ error: 'OTP already used. Please request a new OTP.' }, { status: 400 });
    }

    // Check attempt limit
    if (otpRecord.attempts >= 3) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new OTP.' }, { status: 400 });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      await prisma.otpVerification.update({
        where: { phone },
        data: { attempts: otpRecord.attempts + 1 }
      });

      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    // OTP is valid - mark as verified
    await prisma.otpVerification.update({
      where: { phone },
      data: { isVerified: true }
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // Create new user with default supplier role
      user = await prisma.user.create({
        data: {
          phone,
          name: `User ${phone.slice(-4)}`,
          email: `${phone}@bell24h.com`,
          company: 'New Company',
          role: 'SUPPLIER',
          isActive: true,
          verified: true
        }
      });
    } else {
      // Update existing user as verified
      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true, isActive: true }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role,
        verified: user.verified
      },
      token
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ 
      error: 'Failed to verify OTP. Please try again.' 
    }, { status: 500 });
  }
}
