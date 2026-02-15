import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, { otp: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Get stored OTP
    const storedData = otpStorage.get(phone);

    if (!storedData) {
      return NextResponse.json(
        { success: false, message: 'OTP not found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
      otpStorage.delete(phone);
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid, remove it from storage
    otpStorage.delete(phone);

    // Generate mock user data and token
    const user = {
      id: 'user_' + Date.now(),
      name: 'User Name',
      email: 'user@example.com',
      phone: phone,
      role: 'user',
      verified: true
    };

    const token = 'mock_jwt_token_' + Date.now();

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: user,
      token: token
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}