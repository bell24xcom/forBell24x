import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear user session cookie
    response.cookies.set('user_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/'
    });

    // Clear OTP cookie if exists
    response.cookies.set('demo_otp', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/'
    });

    console.log('✅ User logged out successfully');

    return response;

  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Logout failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
