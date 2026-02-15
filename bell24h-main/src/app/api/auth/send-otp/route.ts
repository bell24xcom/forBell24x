import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number. Please enter a valid 10-digit number.' },
        { status: 400 }
      );
    }

    // TODO: Integrate with MSG91 API
    // For now, return success (mock implementation)
    console.log(`📱 OTP sent to +91${phoneNumber} (mock)`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}

