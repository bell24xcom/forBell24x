// app/api/auth/send-email-otp/route.ts - Email OTP sending (Demo mode)
import { NextRequest, NextResponse } from 'next/server';
import { safeQuery } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address format'
      }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    try {
      await safeQuery(
        `INSERT INTO otp_verifications (phone, otp, expires_at, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         ON CONFLICT (phone) 
         DO UPDATE SET otp = $2, expires_at = $3, created_at = NOW()`,
        [phone, otp, expiresAt]
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with demo OTP if database fails
    }

    // Demo mode - no Resend keys required
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to email (Demo mode)',
      demoOTP: otp,
      warning: 'Running in demo mode - OTP not actually sent to email'
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send email OTP. Please try again.'
    }, { status: 500 });
  }
}