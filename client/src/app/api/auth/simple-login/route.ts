import { NextResponse } from 'next/server';

// Simple authentication for immediate launch
export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();

    // Simple validation
    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 });
    }

    // Demo OTP validation (replace with real OTP system later)
    if (otp === '123456') {
      // Create simple session
      const sessionData = {
        userId: 'demo-user-' + Date.now(),
        phone: phone,
        verified: true,
        timestamp: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        user: sessionData,
        message: 'Login successful'
      });
    } else {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
