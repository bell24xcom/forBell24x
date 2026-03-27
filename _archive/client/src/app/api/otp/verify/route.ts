import { NextRequest, NextResponse } from 'next/server';

interface MSG91VerifyRequest {
  mobile: string;
  otp: string;
  authKey: string;
}

// MSG91 API endpoint for verification
const MSG91_VERIFY_URL = 'https://api.msg91.com/api/v5/otp/verify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, otp, authKey }: MSG91VerifyRequest = body;

    // Validate required fields
    if (!mobile || !otp || !authKey) {
      return NextResponse.json(
        { success: false, error: 'Mobile number, OTP, and Auth Key are required' },
        { status: 400 }
      );
    }

    // Validate OTP format
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format. Must be 6 digits' },
        { status: 400 }
      );
    }

    // Validate mobile number format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    // Prepare MSG91 API request
    const msg91Payload = {
      mobile: mobile,
      otp: otp,
      authkey: authKey
    };

    // In production, make actual API call to MSG91
    // const response = await fetch(MSG91_VERIFY_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'authkey': authKey
    //   },
    //   body: JSON.stringify(msg91Payload)
    // });

    // const result = await response.json();

    // For development/testing, return mock response
    const mockVerification = {
      success: true,
      message: 'OTP verified successfully',
      mobile: mobile,
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      requestId: `VERIFY_${Date.now()}`
    };

    // Log the verification request
    console.log('MSG91 Verify OTP Request:', {
      mobile: mobile,
      otp: otp,
      timestamp: new Date().toISOString(),
      success: true
    });

    return NextResponse.json(mockVerification);

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

// Get verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile');
    const authKey = searchParams.get('authKey');

    if (!mobile || !authKey) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and Auth Key are required' },
        { status: 400 }
      );
    }

    // Mock verification status response
    const mockStatus = {
      success: true,
      mobile: mobile,
      verified: true,
      verifiedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
      expiresAt: new Date(Date.now() + 4 * 60 * 1000).toISOString(), // 4 minutes from now
      attempts: 1,
      maxAttempts: 3
    };

    return NextResponse.json(mockStatus);

  } catch (error) {
    console.error('Error getting verification status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get verification status' },
      { status: 500 }
    );
  }
}
