import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUser, updateUser, users } from '@/lib/mock-users';

export async function POST(request: NextRequest) {
  try {
    const { userId, kycData, phone } = await request.json();

    if (!userId || !kycData) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create user in mock database
    const userIndex = findOrCreateUser(userId, phone);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User not found and unable to create' },
        { status: 404 }
      );
    }

    // Update user with KYC data
    const updatedUser = updateUser(userIndex, {
      kycCompleted: true,
      kycData: {
        ...kycData,
        submittedAt: new Date().toISOString(),
        status: 'pending' // pending, approved, rejected
      }
    });

    return NextResponse.json({
      success: true,
      message: 'KYC data submitted successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
