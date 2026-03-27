import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/supplier/profile - Get supplier profile
export async function GET(request: NextRequest) {
  try {
    // TODO: Get supplier ID from auth session
    // For now, return demo profile data

    const profile = {
      companyName: 'Demo Supplier Co.',
      email: 'supplier@bell24h.com',
      phone: '+91 9876543210',
      city: 'Mumbai',
      state: 'Maharashtra',
      category: 'Industrial Machinery',
      description: 'Leading supplier of industrial machinery and equipment.',
      website: 'https://demo-supplier.com',
      gstNumber: '',
      verified: false,
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error fetching supplier profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch profile',
    }, { status: 500 });
  }
}

// PUT /api/supplier/profile - Update supplier profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Get supplier ID from auth session
    // TODO: Update profile in database

    console.log('Profile update request:', body);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: body,
    });
  } catch (error) {
    console.error('Error updating supplier profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update profile',
    }, { status: 500 });
  }
}
