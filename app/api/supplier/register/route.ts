import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/supplier/register - Register new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      fullName, email, phone, designation,
      companyName, companyType, yearEstablished, employeeCount, industry,
      businessDescription, certifications, exportExperience,
      panNumber, aadharNumber
    } = body;

    // Basic validation
    if (!fullName || !email || !phone || !companyName) {
      return NextResponse.json({
        success: false,
        message: 'Required fields missing',
      }, { status: 400 });
    }

    // TODO: Create supplier in database
    // TODO: Send verification email

    console.log('Supplier registration:', {
      fullName,
      email,
      companyName,
      industry,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email for verification.',
      supplier: {
        id: 'demo-supplier-' + Date.now(),
        email,
        companyName,
      },
    });
  } catch (error) {
    console.error('Error registering supplier:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed',
    }, { status: 500 });
  }
}
