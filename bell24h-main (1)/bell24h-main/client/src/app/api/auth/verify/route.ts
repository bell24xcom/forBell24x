import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify Auth Token API
 * Used by AuthContext to check if user is still authenticated
 */

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Check if it's a demo token
    if (token.startsWith('demo_auth_token_')) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'demo-user-1',
          name: 'Demo User',
          mobile: '9999999999',
          email: 'demo@bell24h.com',
          isBuyer: true,
          isSupplier: true
        }
      });
    }

    // TODO: Verify real JWT token here
    // For now, if token exists and is not demo, assume valid
    // In production, verify JWT signature and expiry
    
    return NextResponse.json({
      success: true,
      user: {
        id: 'user-1',
        name: 'User',
        mobile: '9999999999',
        isBuyer: true,
        isSupplier: true
      }
    });

  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Token verification failed' },
      { status: 401 }
    );
  }
}

