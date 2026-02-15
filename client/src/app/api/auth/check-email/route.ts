import { NextRequest, NextResponse } from 'next/server';

// Check if email already exists in the system
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log(`🔍 Checking if email exists: ${email}`);

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if email exists in database (mock implementation)
    const emailExists = await checkEmailInDatabase(email);

    if (emailExists) {
      return NextResponse.json({
        success: true,
        exists: true,
        message: 'Email already registered',
        data: {
          email,
          user: emailExists,
          suggestion: 'Please use login instead of registration'
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'Email available for registration',
        data: {
          email,
          canRegister: true
        }
      });
    }

  } catch (error) {
    console.error('❌ Check Email Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Check if email exists in database (mock implementation)
async function checkEmailInDatabase(email: string) {
  // In production, this would query your Prisma database
  // For now, return mock data for existing emails
  
  const existingEmails = [
    {
      id: 'user_1',
      email: 'digitex.studio@gmail.com',
      name: 'Existing User',
      phoneNumber: '+919004962871',
      role: 'buyer',
      isVerified: true
    },
    {
      id: 'user_2',
      email: 'digitex.studio@gmail.com',
      name: 'Admin User',
      phoneNumber: '+919004962871',
      role: 'admin',
      isVerified: true
    }
  ];

  // Check if email exists
  const user = existingEmails.find(u => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  return NextResponse.json({
    success: true,
    message: 'Email Check System Status',
    data: {
      status: 'ACTIVE',
      email: email || 'ALL',
      systemHealth: 'EXCELLENT',
      features: [
        'Email validation',
        'Database lookup',
        'Registration prevention',
        'User suggestion system'
      ]
    }
  });
}
