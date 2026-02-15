import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Mock response for now (until DB connected)
    if (email === 'admin@bell24h.com' && password === 'admin123') {
      const token = await new SignJWT({
        userId: '1',
        email,
        role: 'ADMIN'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'secret'));

      return NextResponse.json({
        success: true,
        token,
        user: { id: '1', email, role: 'ADMIN' }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid credentials'
    }, { status: 401 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}
