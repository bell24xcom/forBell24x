import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get User Subscription Status
 * Item 24: Pro Tier Subscription System
 */

// Force dynamic rendering - this API uses request.url which requires dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'current-user-id'; // TODO: Get from auth

    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!subscription) {
      return NextResponse.json({
        success: true,
        plan: 'free',
        isPremium: false,
        features: {
          aiInsights: false,
          premiumFeatures: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      plan: subscription.planId,
      isPremium: subscription.planId === 'pro' || subscription.planId === 'enterprise',
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isEarlyAdopter: subscription.isEarlyAdopter
      },
      features: {
        aiInsights: subscription.planId === 'pro' || subscription.planId === 'enterprise',
        premiumFeatures: subscription.planId === 'pro' || subscription.planId === 'enterprise'
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}

