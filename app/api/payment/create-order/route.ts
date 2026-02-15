import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', description, customerName, customerEmail, customerPhone } = await request.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Customer name and email are required' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        description: description || 'Bell24h Payment',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || '',
        platform: 'Bell24h B2B Marketplace'
      }
    });

    console.log('✅ Razorpay order created:', order.id);

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        description: description || 'Bell24h Payment',
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        }
      }
    });

  } catch (error) {
    console.error('❌ Razorpay order creation failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle payment verification
export async function PUT(request: NextRequest) {
  try {
    const { orderId, paymentId, signature } = await request.json();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Payment verified successfully
    console.log('✅ Payment verified:', paymentId);

    return NextResponse.json({
      success: true,
      data: {
        paymentId,
        orderId,
        status: 'verified',
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
