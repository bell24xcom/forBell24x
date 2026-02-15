import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Subscription Subscribe API
 * Item 24: Pro Tier Subscription System
 * 
 * Creates subscription and payment order via RazorpayX
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planId, billingCycle, paymentMethod } = body;

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'User ID and Plan ID are required' },
        { status: 400 }
      );
    }

    // Get plan details
    const plans = {
      free: { price: 0, priceYearly: 0 },
      pro: { price: 1500, priceYearly: 15000 },
      enterprise: { price: 5000, priceYearly: 50000 }
    };

    const plan = plans[planId as keyof typeof plans];
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
    const duration = billingCycle === 'yearly' ? 365 : 30; // days

    // Check for early adopter discount
    const isEarlyAdopter = await checkEarlyAdopterEligibility(userId);
    const finalAmount = isEarlyAdopter ? 0 : amount;

    // Create RazorpayX order
    const razorpayOrder = await createRazorpayOrder({
      amount: finalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `sub_${userId}_${Date.now()}`,
      notes: {
        userId,
        planId,
        billingCycle,
        isEarlyAdopter: isEarlyAdopter.toString()
      }
    });

    // Create subscription record in database
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        billingCycle,
        amount: finalAmount,
        status: 'PENDING',
        razorpayOrderId: razorpayOrder.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        isEarlyAdopter
      }
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        planId,
        amount: finalAmount,
        billingCycle,
        isEarlyAdopter
      },
      payment: {
        orderId: razorpayOrder.id,
        amount: finalAmount,
        currency: 'INR',
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

async function checkEarlyAdopterEligibility(userId: string): Promise<boolean> {
  // Check if user is in first 100 early adopters
  const earlyAdopterCount = await prisma.subscription.count({
    where: {
      isEarlyAdopter: true,
      status: 'ACTIVE'
    }
  });

  return earlyAdopterCount < 100;
}

async function createRazorpayOrder(orderData: any) {
  // TODO: Integrate with RazorpayX API
  // For now, return mock order
  return {
    id: `order_${Date.now()}`,
    amount: orderData.amount,
    currency: orderData.currency,
    receipt: orderData.receipt
  };
}

