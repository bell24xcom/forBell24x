import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Demo credentials for testing
    const demoUsers = [
      {
        email: 'admin@bell24h.com',
        password: 'admin123',
        id: 'admin_001',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'user@bell24h.com',
        password: 'user123',
        id: 'user_001',
        name: 'Test User',
        role: 'user'
      },
      {
        email: 'supplier@bell24h.com',
        password: 'supplier123',
        id: 'supplier_001',
        name: 'Supplier User',
        role: 'supplier'
      }
    ];

    // Find user
    const user = demoUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create user session
    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verified: true,
      loginMethod: 'email'
    };

    console.log('✅ Email Login Successful:', userSession);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userSession.id,
        email: userSession.email,
        name: userSession.name,
        role: userSession.role
      }
    });

    // Set user session cookie
    response.cookies.set('user_session', JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
