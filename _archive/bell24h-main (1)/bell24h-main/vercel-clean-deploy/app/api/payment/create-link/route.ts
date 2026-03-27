import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: NextRequest) {
  try {
    const { amount, description, customer } = await req.json();

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ 
        error: 'Razorpay configuration missing' 
      }, { status: 500 });
    }

    // Create Razorpay payment link
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount, // Amount in paise
        currency: 'INR',
        description: description,
        customer: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone
        },
        notify: {
          sms: true,
          email: true
        },
        reminder_enable: true,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        callback_method: 'get'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Razorpay error:', error);
      return NextResponse.json({ 
        error: 'Failed to create payment link' 
      }, { status: 500 });
    }

    const paymentLink = await response.json();

    return NextResponse.json({
      success: true,
      paymentLink: paymentLink.short_url,
      paymentId: paymentLink.id
    });

  } catch (error) {
    console.error('Payment link creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
