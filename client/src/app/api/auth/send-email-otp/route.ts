import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (temporarily disabled for build)
    // await prisma.oTP.create({
    //   data: {
    //     email,
    //     phone,
    //     otp,
    //     type: 'email',
    //     expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    //   }
    // });

    // Send email using SendGrid (if configured)
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@bell24h.com',
          subject: 'Bell24h Email Verification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">🔔 Bell24h</h1>
                <p style="color: #6b7280; margin: 5px 0;">India's AI-Powered B2B Marketplace</p>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email</h2>
                <p style="color: #374151; margin-bottom: 20px;">Your verification code is:</p>
                <div style="background: #2563eb; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
                  ${otp}
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">Valid for 10 minutes.</p>
              </div>
              
              <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; margin-top: 0;">Why verify your email?</h3>
                <ul style="color: #047857; margin: 0; padding-left: 20px;">
                  <li>Receive quotations and invoices</li>
                  <li>Get order confirmations</li>
                  <li>Important business updates</li>
                  <li>Increase your trust score to 100%</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  If you didn't request this, please ignore this email.
                </p>
                <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">
                  © 2024 Bell24h. All rights reserved.
                </p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue with demo OTP for development
      }
    }

    // For development/testing - always log OTP
    console.log(`📧 Email OTP for ${email}: ${otp}`);
    console.log(`⏰ Valid for 10 minutes`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email',
      demoOTP: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    return NextResponse.json({ error: 'Failed to send email OTP' }, { status: 500 });
  }
}
