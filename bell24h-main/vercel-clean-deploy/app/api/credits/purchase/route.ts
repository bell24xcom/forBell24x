import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const packages = {
  'starter': { credits: 2, amount: 1000 },
  'pro': { credits: 12, amount: 5000 },
  'enterprise': { credits: 30, amount: 10000 }
};

async function createRazorpayOrder(amount: number) {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `credit_purchase_${Date.now()}`
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order');
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { userId, package: pkg } = await req.json();

    if (!userId || !pkg || !packages[pkg]) {
      return NextResponse.json({
        error: 'Invalid request. userId and valid package required.'
      }, { status: 400 });
    }

    const selectedPkg = packages[pkg];

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(selectedPkg.amount);

    // Store purchase intent
    const purchase = await prisma.creditPurchase.create({
      data: {
        userId,
        credits: selectedPkg.credits,
        amount: selectedPkg.amount,
        razorpayId: razorpayOrder.id,
        status: 'pending'
      }
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: selectedPkg.amount,
      credits: selectedPkg.credits,
      purchaseId: purchase.id
    });

  } catch (error) {
    console.error('Error creating credit purchase:', error);
    return NextResponse.json({
      error: 'Failed to create purchase order. Please try again.'
    }, { status: 500 });
  }
}
