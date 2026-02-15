import { NextRequest, NextResponse } from 'next/server';

/**
 * Test-only API endpoint for Email OTP retrieval in CI/CD
 * This endpoint should ONLY exist in test/staging environments
 * Never deploy this to production!
 */

// Simple in-memory store for test email OTPs
const testEmailOtps: Record<string, { otp: string; timestamp: number }> = {};

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
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  // For testing, we'll generate a predictable OTP based on email
  // In real implementation, this would fetch from your email service
  const testOtp = generateTestEmailOtp(email);
  
  // Store the OTP
  testEmailOtps[email] = {
    otp: testOtp,
    timestamp: Date.now()
  };

  console.log(`🧪 Test Email OTP generated for ${email}: ${testOtp}`);

  return NextResponse.json({ 
    otp: testOtp,
    email: email,
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
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    // Store the OTP (simulating email service storing it)
    testEmailOtps[email] = {
      otp: otp,
      timestamp: Date.now()
    };

    console.log(`🧪 Test Email OTP stored for ${email}: ${otp}`);

    return NextResponse.json({ 
      success: true,
      message: 'Email OTP stored for testing'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

function generateTestEmailOtp(email: string): string {
  // Generate a predictable 6-digit OTP based on email
  // This makes testing consistent and repeatable
  const hash = email.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Generate 6-digit OTP
  const otp = Math.abs(hash) % 900000 + 100000;
  return otp.toString();
}
