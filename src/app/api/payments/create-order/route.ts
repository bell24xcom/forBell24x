import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      orderId: `demo_${Date.now()}`,
      amount: body.amount || 0,
      currency: 'INR',
      status: 'demo_mode'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Payment creation failed' }, { status: 500 });
  }
}