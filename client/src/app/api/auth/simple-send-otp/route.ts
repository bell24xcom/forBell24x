import { NextResponse } from 'next/server';

// Simple OTP sending for immediate launch
export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    // Simple validation
    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: 'Valid 10-digit phone number required' }, { status: 400 });
    }

    // Generate demo OTP
    const otp = '123456';
    
    // In production, send real SMS here
    console.log(`📱 OTP for +91${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      demoOTP: otp // For development only
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
