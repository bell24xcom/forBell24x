import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUser, users } from '@/lib/mock-users';

export async function POST(request: NextRequest) {
  try {
    const { userId, planId } = await request.json();

    if (!userId || !planId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user in mock database
    const userIndex = findUserById(userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate trial end date for Professional plan
    const isTrial = planId === 'professional';
    const trialEndDate = isTrial ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() : null;

    // Update user with selected plan
    const updatedUser = updateUser(userIndex, {
      planSelected: true,
      plan: planId,
      planStartDate: new Date().toISOString(),
      planStatus: isTrial ? 'trial' : 'active',
      isTrial: isTrial,
      trialEndDate: trialEndDate,
      trialDaysRemaining: isTrial ? 90 : null
    });

    return NextResponse.json({
      success: true,
      message: 'Plan selected successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Plan selection error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
