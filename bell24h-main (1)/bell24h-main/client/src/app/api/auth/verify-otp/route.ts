import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { mobile, otp } = await req.json();
  if (!mobile || !otp) {
    return NextResponse.json({ success: false, message: 'Mobile & OTP required' }, { status: 400 });
  }
  // TODO: Integrate with MSG91 for real verification
  return NextResponse.json({
    success: true,
    token: 'demo-jwt',
    user: {
      mobile,
      name: 'Demo User',
      role: 'buyer',
    },
  });
}
