import { NextRequest, NextResponse } from 'next/server';

interface MSG91SendRequest {
  mobile: string;
  message: string;
  templateId: string;
  authKey: string;
  senderId: string;
  route: string;
  country: string;
}

interface MSG91VerifyRequest {
  mobile: string;
  otp: string;
  authKey: string;
}

// MSG91 API endpoints
const MSG91_SEND_URL = 'https://api.msg91.com/api/v5/otp';
const MSG91_VERIFY_URL = 'https://api.msg91.com/api/v5/otp/verify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, message, templateId, authKey, senderId, route, country }: MSG91SendRequest = body;

    // Validate required fields
    if (!mobile || !authKey) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and Auth Key are required' },
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
      mobile: `${country}${mobile}`,
      template_id: templateId || 'default_template',
      authkey: authKey,
      message: message,
      sender: senderId || 'BELL24',
      route: route || '4',
      country: country || '91'
    };

    // In production, make actual API call to MSG91
    // const response = await fetch(MSG91_SEND_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'authkey': authKey
    //   },
    //   body: JSON.stringify(msg91Payload)
    // });

    // For development/testing, return mock response
    const mockResponse = {
      success: true,
      requestId: `MSG91_${Date.now()}`,
      message: 'OTP sent successfully',
      mobile: mobile,
      templateId: templateId,
      timestamp: new Date().toISOString()
    };

    // Log the request for debugging
    console.log('MSG91 Send OTP Request:', {
      mobile: mobile,
      templateId: templateId,
      senderId: senderId,
      route: route,
      country: country,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

// Verify OTP endpoint
export async function PUT(request: NextRequest) {
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

    // For development/testing, return mock response
    // Mock verification logic - in production, this would be handled by MSG91
    const mockVerification = {
      success: true,
      message: 'OTP verified successfully',
      mobile: mobile,
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
    };

    // Log the verification request
    console.log('MSG91 Verify OTP Request:', {
      mobile: mobile,
      otp: otp,
      timestamp: new Date().toISOString()
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

// Get OTP status endpoint
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

    // In production, check OTP status with MSG91
    // const response = await fetch(`${MSG91_VERIFY_URL}?mobile=${mobile}&authkey=${authKey}`);

    // Mock status response
    const mockStatus = {
      success: true,
      mobile: mobile,
      status: 'active',
      attempts: 0,
      maxAttempts: 3,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
    };

    return NextResponse.json(mockStatus);

  } catch (error) {
    console.error('Error getting OTP status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get OTP status' },
      { status: 500 }
    );
  }
}
