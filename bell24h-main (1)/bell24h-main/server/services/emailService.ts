import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import { PaymentStatus } from '../models/PaymentModel';

// Types
export type EmailType = 
  | 'payment_confirmation' 
  | 'payment_failed' 
  | 'order_confirmation' 
  | 'order_shipped' 
  | 'password_reset' 
  | 'account_verification'
  | 'escrow_created'
  | 'escrow_released'
  | 'escrow_refunded'
  | 'escrow_threshold_updated';

export interface EmailData {
  email: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface EmailTemplateData {
  type: EmailType;
  orderId?: string;
  amount?: number;
  currency?: string;
  status?: PaymentStatus | string;
  [key: string]: any;
}

// Email template mapping
const EMAIL_TEMPLATES: Record<EmailType, (data: EmailTemplateData) => Omit<EmailData, 'email'>> = {
  // Escrow related emails
  escrow_created: (data) => ({
    subject: `Escrow Hold Created - ${data.referenceId || 'Your Order'}`,
    template: 'escrow-created',
    context: {
      orderId: data.orderId,
      referenceId: data.referenceId,
      amount: data.amount,
      currency: data.currency,
      releaseDate: data.releaseDate ? new Date(data.releaseDate).toLocaleDateString() : 'Upon completion',
      ...data.context,
    },
  }),

  escrow_released: (data) => ({
    subject: `Escrow Funds Released - ${data.referenceId || 'Your Order'}`,
    template: 'escrow-released',
    context: {
      orderId: data.orderId,
      referenceId: data.referenceId,
      amount: data.amount,
      currency: data.currency,
      releaseDate: new Date().toLocaleDateString(),
      ...data.context,
    },
  }),

  escrow_refunded: (data) => ({
    subject: `Escrow Refund Processed - ${data.referenceId || 'Your Order'}`,
    template: 'escrow-refunded',
    context: {
      orderId: data.orderId,
      referenceId: data.referenceId,
      amount: data.amount,
      currency: data.currency,
      refundDate: new Date().toLocaleDateString(),
      reason: data.reason || 'Refund processed',
      ...data.context,
    },
  }),

  escrow_threshold_updated: (data) => ({
    subject: 'Escrow Threshold Updated',
    template: 'escrow-threshold-updated',
    context: {
      threshold: data.threshold,
      currency: data.currency,
      date: new Date().toLocaleDateString(),
      ...data.context,
    },
  }),
  payment_confirmation: (data) => ({
    subject: 'Payment Confirmed',
    template: 'payment-confirmation',
    context: {
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency,
      date: format(new Date(), 'MMMM d, yyyy'),
    },
  }),
  payment_failed: (data) => ({
    subject: 'Payment Failed',
    template: 'payment-failed',
    context: {
      orderId: data.orderId,
      reason: data.reason || 'Payment could not be processed',
      date: format(new Date(), 'MMMM d, yyyy'),
    },
  }),
  order_confirmation: (data) => ({
    subject: 'Order Confirmed',
    template: 'order-confirmation',
    context: {
      orderId: data.orderId,
      items: data.items || [],
      total: data.total,
      currency: data.currency,
      date: format(new Date(), 'MMMM d, yyyy'),
    },
  }),
  order_shipped: (data) => ({
    subject: 'Your Order Has Shipped',
    template: 'order-shipped',
    context: {
      orderId: data.orderId,
      trackingNumber: data.trackingNumber,
      carrier: data.carrier,
      estimatedDelivery: data.estimatedDelivery,
    },
  }),
  password_reset: (data) => ({
    subject: 'Password Reset Request',
    template: 'password-reset',
    context: {
      resetLink: data.resetLink,
      expiresIn: '24 hours',
    },
  }),
  account_verification: (data) => ({
    subject: 'Verify Your Email Address',
    template: 'account-verification',
    context: {
      verificationLink: data.verificationLink,
      expiresIn: '24 hours',
    },
  }),
};

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    // Configure nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    });

    this.fromEmail = process.env.EMAIL_FROM || 'noreply@bell24h.com';
  }

  /**
   * Send an email using a template
   */
  async sendTemplateEmail(
    to: string,
    type: EmailType,
    templateData: EmailTemplateData
  ): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES[type](templateData);
      
      // In a real app, you would render the email template here
      const html = this.renderTemplate(template.template, template.context);
      
      // Create the complete email data with the recipient's email
      const emailData: EmailData = {
        email: to,
        ...template,
      };
      
      await this.transporter.sendMail({
        from: `"Bell24H" <${this.fromEmail}>`,
        to: emailData.email,
        subject: emailData.subject,
        html,
        text: this.htmlToText(html),
      });
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send a custom email
   */
  async sendEmail(to: string, subject: string, html: string, context: Record<string, any> = {}): Promise<boolean> {
    try {
      const emailData: EmailData = {
        email: to,
        subject,
        template: 'custom',
        context: {
          ...context,
          subject,
        },
      };
      
      await this.transporter.sendMail({
        from: `"Bell24H" <${this.fromEmail}>`,
        to: emailData.email,
        subject: emailData.subject,
        html,
        text: this.htmlToText(html),
      });
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Render email template (simplified)
   */
  /**
   * Render escrow email templates
   */
  private renderEscrowTemplate(templateName: string, context: Record<string, any>): string {
    const { amount, currency, orderId, referenceId, ...rest } = context;
    const formattedAmount = amount ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount / 100) : '';

    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${templateName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .details { margin: 15px 0; padding: 15px; background-color: #f9fafb; border-radius: 4px; }
          .detail-row { display: flex; margin-bottom: 8px; }
          .detail-label { font-weight: bold; min-width: 150px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${templateName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h1>
        </div>
        <div class="content">
    `;

    let content = '';

    switch (templateName) {
      case 'escrow-created':
        content = `
          <p>Hello,</p>
          <p>An escrow hold has been created for your order.</p>
          <div class="details">
            <div class="detail-row"><span class="detail-label">Order ID:</span> ${orderId || 'N/A'}</div>
            <div class="detail-row"><span class="detail-label">Reference ID:</span> ${referenceId || 'N/A'}</div>
            <div class="detail-row"><span class="detail-label">Amount:</span> ${formattedAmount}</div>
            <div class="detail-row"><span class="detail-label">Status:</span> Held in Escrow</div>
            ${context.releaseDate ? `<div class="detail-row"><span class="detail-label">Scheduled Release:</span> ${context.releaseDate}</div>` : ''}
          </div>
          <p>The funds will be held in escrow until the order is completed or the release date is reached.</p>
        `;
        break;

      case 'escrow-released':
        content = `
          <p>Hello,</p>
          <p>The escrow hold for your order has been released and the funds have been transferred to the seller.</p>
          <div class="details">
            <div class="detail-row"><span class="detail-label">Order ID:</span> ${orderId || 'N/A'}</div>
            <div class="detail-row"><span class="detail-label">Reference ID:</span> ${referenceId || 'N/A'}</div>
            <div class="detail-row"><span class="detail-label">Amount Released:</span> ${formattedAmount}</div>
            <div class="detail-row"><span class="detail-label">Release Date:</span> ${new Date().toLocaleDateString()}</div>
          </div>
          <p>Thank you for your business!</p>
        `;
        break;

      case 'escrow-refunded':
        content = `
          <p>Hello,</p>
          <p>The escrow hold for your order has been refunded.</p>
          <div class="details">
            <div class="detail-row"><span class="detail-label">Order ID:</span> ${orderId || 'N/A'}</div>
            <div class="detail-row"><span class="detail-label">Reference ID:</span> ${referenceId || 'N/A'}</div>
            <div class="detail-row"><span class="detail-label">Amount Refunded:</span> ${formattedAmount}</div>
            <div class="detail-row"><span class="detail-label">Refund Date:</span> ${new Date().toLocaleDateString()}</div>
            ${context.reason ? `<div class="detail-row"><span class="detail-label">Reason:</span> ${context.reason}</div>` : ''}
          </div>
          <p>If you have any questions, please contact our support team.</p>
        `;
        break;

      case 'escrow-threshold-updated':
        content = `
          <p>Hello,</p>
          <p>Your escrow threshold has been updated.</p>
          <div class="details">
            <div class="detail-row"><span class="detail-label">New Threshold:</span> ${formattedAmount}</div>
            <div class="detail-row"><span class="detail-label">Updated On:</span> ${new Date().toLocaleDateString()}</div>
          </div>
          <p>This threshold determines the minimum transaction amount that will trigger escrow holds.</p>
        `;
        break;

      default:
        content = `
          <p>Hello,</p>
          <p>This is a notification regarding your escrow transaction.</p>
          <div class="details">
            ${Object.entries(context).map(([key, value]) => 
              `<div class="detail-row"><span class="detail-label">${key}:</span> ${value}</div>`
            ).join('')}
          </div>
        `;
    }

    const footer = `
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
      </body>
      </html>
    `;

    return baseTemplate + content + footer;
  }

  /**
   * Render email template (simplified)
   */
  private renderTemplate(templateName: string, context: Record<string, any>): string {
    // Handle escrow templates
    if (templateName.startsWith('escrow-')) {
      return this.renderEscrowTemplate(templateName, context);
    }
    
    // Default template rendering
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${context.subject || 'Bell24H Notification'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { margin-top: 20px; font-size: 12px; text-align: center; color: #777; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bell24H</h1>
          </div>
          <div class="content">
            <h2>${context.subject || 'Notification'}</h2>
            <p>${JSON.stringify(context, null, 2).replace(/\n/g, '<br>')}</p>
            ${context.actionUrl ? `<a href="${context.actionUrl}" class="button">${context.actionText || 'Take Action'}</a>` : ''}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Bell24H. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Convert HTML to plain text (simplified)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Export a singleton instance
export const emailService = new EmailService();

// Helper function for sending verification emails
export const sendVerificationEmail = async (
  email: string,
  data: EmailTemplateData
): Promise<boolean> => {
  try {
    const emailData = {
      ...data,
      email,
    };
    return await emailService.sendTemplateEmail(email, 'account_verification', emailData);
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};
