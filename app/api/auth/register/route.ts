import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, company, email, phone, userType, category, location } = await request.json();

    // Validate required fields
    if (!name || !company || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Check if email/phone already exists
    // 2. Hash password if using password-based auth
    // 3. Save user to database
    // 4. Send verification email/SMS
    // 5. Generate JWT token

    const user = {
      id: 'user_' + Date.now(),
      name,
      company,
      email,
      phone,
      userType,
      category,
      location,
      verified: false,
      createdAt: new Date().toISOString()
    };

    console.log('New user registration:', user);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please verify your account.',
      user: user
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}