import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchaseId } = await req.json();
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !purchaseId) {
      return NextResponse.json({ 
        error: 'Missing required payment verification data' 
      }, { status: 400 });
    }
    
    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ 
        error: 'Invalid payment signature' 
      }, { status: 400 });
    }
    
    // Get purchase details
    const purchase = await prisma.creditPurchase.findUnique({
      where: { id: purchaseId }
    });
    
    if (!purchase) {
      return NextResponse.json({ 
        error: 'Purchase not found' 
      }, { status: 404 });
    }
    
    if (purchase.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Purchase already processed' 
      }, { status: 400 });
    }
    
    // Update purchase status and add credits
    await prisma.$transaction([
      prisma.creditPurchase.update({
        where: { id: purchaseId },
        data: { status: 'completed' }
      }),
      prisma.userCredits.upsert({
        where: { userId: purchase.userId },
        update: {
          credits: { increment: purchase.credits }
        },
        create: {
          userId: purchase.userId,
          credits: purchase.credits
        }
      })
    ]);
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment verified successfully! Credits have been added to your account.',
      credits: purchase.credits
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ 
      error: 'Failed to verify payment. Please contact support.' 
    }, { status: 500 });
  }
}
