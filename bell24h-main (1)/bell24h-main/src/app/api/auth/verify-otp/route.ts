import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please enter a 6-digit code.' },
        { status: 400 }
      );
    }

    // TODO: Integrate with MSG91 API for real verification
    // For now, accept any 6-digit OTP (mock implementation)
    console.log(`✅ OTP verified for +91${phoneNumber} (mock)`);

    // Generate a mock JWT token (in production, use a real JWT library)
    const mockToken = `mock-jwt-${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        token: mockToken,
        user: {
          id: `user-${phoneNumber}`,
          phoneNumber,
          name: 'Demo User',
          email: `${phoneNumber}@bell24h.com`,
          role: 'buyer',
          isVerified: true,
          loginMethod: 'otp',
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'OTP verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

