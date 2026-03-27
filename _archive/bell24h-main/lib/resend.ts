// lib/resend.ts - Resend Email Service Integration
import { Resend } from 'resend';

interface ResendConfig {
  apiKey: string;
  fromEmail: string;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

class ResendService {
  private resend: Resend;
  private config: ResendConfig;

  constructor() {
    this.config = {
      apiKey: process.env.RESEND_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@bell24h.com'
    };

    this.resend = new Resend(this.config.apiKey);
  }

  async sendEmail({ 
    to, 
    subject, 
    html, 
    text, 
    from 
  }: SendEmailParams): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // Validate configuration
      if (!this.config.apiKey) {
        return {
          success: false,
          message: 'Resend not configured',
          error: 'RESEND_API_KEY not found in environment variables'
        };
      }

      // Validate email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const recipients = Array.isArray(to) ? to : [to];
      
      for (const email of recipients) {
        if (!emailRegex.test(email)) {
          return {
            success: false,
            message: 'Invalid email address',
            error: `Invalid email: ${email}`
          };
        }
      }

      const result = await this.resend.emails.send({
        from: from || this.config.fromEmail,
        to: recipients,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      });

      if (result.error) {
        return {
          success: false,
          message: 'Failed to send email',
          error: result.error.message
        };
      }

      return {
        success: true,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.error('Resend Error:', error);
      return {
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendOTPEmail({ 
    to, 
    otp, 
    phone 
  }: { 
    to: string; 
    otp: string; 
    phone: string; 
  }): Promise<{ success: boolean; message: string; error?: string }> {
    const subject = 'Bell24h OTP Verification';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔔 Bell24h</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">OTP Verification</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Your OTP for phone number <strong>${phone}</strong> is:
          </p>
          <div style="background: #1f2937; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 4px;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This OTP is valid for 5 minutes. Do not share it with anyone.
          </p>
          <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Security Note:</strong> Bell24h will never ask for your OTP via email or phone call.
            </p>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© 2025 Bell24h Technologies Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendWelcomeEmail({ 
    to, 
    name, 
    phone 
  }: { 
    to: string; 
    name?: string; 
    phone: string; 
  }): Promise<{ success: boolean; message: string; error?: string }> {
    const subject = 'Welcome to Bell24h - Your B2B Marketplace';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚀 Welcome to Bell24h!</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">
            Hello ${name || 'there'}! 👋
          </h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Welcome to India's leading B2B marketplace! Your account has been successfully created with phone number <strong>${phone}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #6b7280; line-height: 1.8;">
              <li>📝 Create RFQs and find verified suppliers</li>
              <li>💳 Use secure escrow for safe transactions</li>
              <li>💰 Manage payments with our digital wallet</li>
              <li>🔍 Browse our verified supplier directory</li>
              <li>📊 Track your transactions and analytics</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://bell24h.com/dashboard" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Need help?</strong> Contact our support team at support@bell24h.com or call +91-XXXX-XXXX-XX
            </p>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© 2025 Bell24h Technologies Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendTransactionEmail({ 
    to, 
    type, 
    amount, 
    transactionId, 
    status 
  }: { 
    to: string; 
    type: string; 
    amount: number; 
    transactionId: string; 
    status: string; 
  }): Promise<{ success: boolean; message: string; error?: string }> {
    const subject = `Transaction ${status} - ₹${amount.toLocaleString()}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">💳 Transaction Update</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Transaction ${status}</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">Transaction ID:</span>
              <span style="color: #1f2937; font-weight: bold;">${transactionId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">Type:</span>
              <span style="color: #1f2937;">${type}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">Amount:</span>
              <span style="color: #1f2937; font-weight: bold; font-size: 18px;">₹${amount.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Status:</span>
              <span style="color: ${status === 'completed' ? '#10b981' : '#f59e0b'}; font-weight: bold;">
                ${status.toUpperCase()}
              </span>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://bell24h.com/transactions" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Transaction
            </a>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© 2025 Bell24h Technologies Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Health check for Resend service
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      if (!this.config.apiKey) {
        return {
          status: 'error',
          message: 'Resend not configured - API_KEY missing'
        };
      }

      // Test with a simple email validation
      const testResult = await this.sendEmail({
        to: 'test@example.com',
        subject: 'Health Check',
        html: '<p>Test email</p>'
      });

      if (testResult.success) {
        return {
          status: 'healthy',
          message: 'Resend service is operational'
        };
      } else {
        return {
          status: 'warning',
          message: `Resend service issue: ${testResult.error}`
        };
      }

    } catch (error) {
      return {
        status: 'error',
        message: `Resend service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const resendService = new ResendService();

// Export types
export type { SendEmailParams, ResendConfig };
