import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { mobile } = await req.json();
  // TODO: Integrate with MSG91 API if keys are present.
  // For now, always return success.
  if (!mobile || mobile.length < 10) {
    return NextResponse.json({ success: false, message: 'Invalid mobile number.' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
