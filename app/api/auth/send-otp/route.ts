import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: 'Valid 10-digit phone number required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await prisma.otpVerification.upsert({
      where: { phone },
      update: { 
        otp, 
        expiresAt,
        attempts: 0,
        isVerified: false
      },
      create: {
        phone,
        otp,
        expiresAt,
        attempts: 0,
        isVerified: false
      }
    });

    // Send OTP via MSG91
    const msg91Response = await sendOTPViaMSG91(phone, otp);

    if (msg91Response.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent successfully',
        phone: phone.replace(/(\d{5})(\d{5})/, '$1****$2') // Mask phone number
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send OTP. Please try again.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ 
      error: 'Failed to send OTP. Please try again.' 
    }, { status: 500 });
  }
}

async function sendOTPViaMSG91(phone: string, otp: string) {
  try {
    const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
    const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
    const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;

    if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID || !MSG91_SENDER_ID) {
      console.error('MSG91 credentials not configured');
      return { success: false, error: 'MSG91 not configured' };
    }

    const url = 'https://api.msg91.com/api/v5/otp';
    const data = {
      template_id: MSG91_TEMPLATE_ID,
      mobile: `+91${phone}`,
      authkey: MSG91_AUTH_KEY,
      sender: MSG91_SENDER_ID,
      message: `Your Bell24h OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok && result.type === 'success') {
      return { success: true, data: result };
    } else {
      console.error('MSG91 API Error:', result);
      return { success: false, error: result.message || 'Failed to send OTP' };
    }

  } catch (error) {
    console.error('MSG91 API Error:', error);
    return { success: false, error: 'Network error' };
  }
}
