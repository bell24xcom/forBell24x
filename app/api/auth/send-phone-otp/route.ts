// app/api/auth/send-phone-otp/route.ts - Phone OTP sending (Demo mode)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone number
    if (!phone || !/^\+?[1-9]\d{9,14}$/.test(phone)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format'
      }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in memory (demo mode - in production, use proper OTP service)
    // In a real application, you would store this in a database or Redis
    console.log(`Demo OTP for ${phone}: ${otp} (expires at ${new Date(expiresAt).toISOString()})`);

    // Demo mode - no MSG91 keys required
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully (Demo mode)',
      demoOTP: otp,
      warning: 'Running in demo mode - OTP not actually sent'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send OTP. Please try again.'
    }, { status: 500 });
  }
}