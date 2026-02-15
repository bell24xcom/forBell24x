import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, { otp: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStorage.set(phone, { otp, expires });

    // In a real application, you would send SMS here
    console.log(`OTP for ${phone}: ${otp}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      phone: phone
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}