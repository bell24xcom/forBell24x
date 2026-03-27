import { NextRequest, NextResponse } from 'next/server';
import { resendService } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, phone, inquiryType, subject, message } = await request.json();

    if (!name || !message) {
      return NextResponse.json({ success: false, error: 'Name and message are required' }, { status: 400 });
    }

    const subjectLine = subject
      ? `[Bell24h Contact] ${subject}`
      : `[Bell24h Contact] ${inquiryType || 'General'} inquiry from ${name}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1E40AF; color: white; padding: 20px 24px;">
          <h2 style="margin: 0;">New Contact Form Submission</h2>
          <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">Bell24h Contact Form</p>
        </div>
        <div style="padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: bold;">${name}</td></tr>
            ${email ? `<tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${email}</td></tr>` : ''}
            ${phone ? `<tr><td style="padding: 8px 0; color: #64748b;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>` : ''}
            ${company ? `<tr><td style="padding: 8px 0; color: #64748b;">Company</td><td style="padding: 8px 0;">${company}</td></tr>` : ''}
            <tr><td style="padding: 8px 0; color: #64748b;">Type</td><td style="padding: 8px 0;">${inquiryType || 'General'}</td></tr>
            ${subject ? `<tr><td style="padding: 8px 0; color: #64748b;">Subject</td><td style="padding: 8px 0;">${subject}</td></tr>` : ''}
          </table>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="color: #1e293b; white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        <div style="padding: 12px 24px; background: #f1f5f9; font-size: 12px; color: #64748b;">
          Bell24h · Digitex Studio · GSTIN: 27AAAPP9753F2ZF
        </div>
      </div>
    `;

    await resendService.sendEmail({
      to: 'bell24h.helpline@gmail.com',
      subject: subjectLine,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
