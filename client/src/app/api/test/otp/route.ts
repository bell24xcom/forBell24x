import { NextRequest, NextResponse } from 'next/server';

/**
 * Test-only API endpoint for OTP retrieval in CI/CD
 * This endpoint should ONLY exist in test/staging environments
 * Never deploy this to production!
 */

// Simple in-memory store for test OTPs
const testOtps: Record<string, { otp: string; timestamp: number }> = {};

export async function GET(request: NextRequest) {
  // Security check - only allow in test environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  // Check for authorization token
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.OTP_API_KEY;
  
  if (!expectedToken || !authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'Phone parameter required' }, { status: 400 });
  }

  // For testing, we'll generate a predictable OTP based on phone
  // In real implementation, this would fetch from your SMS service
  const testOtp = generateTestOtp(phone);
  
  // Store the OTP
  testOtps[phone] = {
    otp: testOtp,
    timestamp: Date.now()
  };

  console.log(`🧪 Test OTP generated for ${phone}: ${testOtp}`);

  return NextResponse.json({ 
    otp: testOtp,
    phone: phone,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
  });
}

export async function POST(request: NextRequest) {
  // Security check - only allow in test environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  // Check for authorization token
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.OTP_API_KEY;
  
  if (!expectedToken || !authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 });
    }

    // Store the OTP (simulating SMS service storing it)
    testOtps[phone] = {
      otp: otp,
      timestamp: Date.now()
    };

    console.log(`🧪 Test OTP stored for ${phone}: ${otp}`);

    return NextResponse.json({ 
      success: true,
      message: 'OTP stored for testing'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

function generateTestOtp(phone: string): string {
  // Generate a predictable 6-digit OTP based on phone number
  // This makes testing consistent and repeatable
  const hash = phone.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Generate 6-digit OTP
  const otp = Math.abs(hash) % 900000 + 100000;
  return otp.toString();
}
