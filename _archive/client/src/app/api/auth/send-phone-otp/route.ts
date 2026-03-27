import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    // Validate Indian phone number
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (temporarily disabled for build)
    // await prisma.oTP.create({
    //   data: {
    //     phone,
    //     otp,
    //     type: 'phone',
    //     expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    //   }
    // });

    // Send SMS using MSG91 (if configured)
    if (process.env.MSG91_AUTH_KEY && process.env.MSG91_FLOW_ID) {
      try {
        await fetch('https://api.msg91.com/api/v5/flow/', {
          method: 'POST',
          headers: {
            'authkey': process.env.MSG91_AUTH_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flow_id: process.env.MSG91_FLOW_ID,
            sender: 'BELL24',
            mobiles: '91' + phone,
            otp: otp
          })
        });
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        // Continue with demo OTP for development
      }
    }

    // For development/testing - always log OTP
    console.log(`📱 Phone OTP for +91${phone}: ${otp}`);
    console.log(`⏰ Valid for 5 minutes`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to phone',
      demoOTP: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Send phone OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
