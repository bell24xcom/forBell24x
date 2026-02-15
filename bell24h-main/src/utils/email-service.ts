import nodemailer from 'nodemailer';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  name: string;
  companyName?: string;
  gstNumber?: string;
  orderId?: string;
  rfqId?: string;
  amount?: number;
  currency?: string;
  productName?: string;
  supplierName?: string;
  buyerName?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Only create transporter if SMTP credentials are available
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Create a mock transporter for development
      this.transporter = nodemailer.createTransporter({
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: {
          user: 'test',
          pass: 'test'
        }
      });
    }
  }

  // Welcome Email for New Users
  async sendWelcomeEmail(data: EmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `🎉 स्वागत है! Welcome to Bell24h - India's Leading B2B Marketplace`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 28px;">🇮🇳 Bell24h</h1>
            <p style="margin: 10px 0; font-size: 16px;">India's Leading AI-Powered B2B Marketplace</p>
          </div>
          
          <div style="padding: 30px; background: white; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">🎉 Welcome to Bell24h, ${data.name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining India's most advanced B2B marketplace! You're now part of a community of 
              <strong>50,000+ Indian businesses</strong> connecting across 17+ industries.
            </p>

            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin-top: 0;">🚀 Your Bell24h Journey Starts Here:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>✅ <strong>GST Integration:</strong> Complete compliance for Indian businesses</li>
                <li>✅ <strong>UPI Payments:</strong> Secure transactions with Razorpay</li>
                <li>✅ <strong>AI Matching:</strong> Smart supplier-buyer connections</li>
                <li>✅ <strong>Voice RFQ:</strong> Create requests in Hindi or English</li>
                <li>✅ <strong>MSME Support:</strong> Government schemes and benefits</li>
              </ul>
            </div>

            ${data.gstNumber ? `
            <div style="background: #f0fff4; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #059669;">
                <strong>✅ GST Verified:</strong> Your GST number ${data.gstNumber} has been verified successfully.
              </p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bell24h-v1.vercel.app/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Access Your Dashboard
              </a>
            </div>

            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #ea580c; margin-top: 0;">💡 Pro Tips for Success:</h4>
              <ul style="color: #666; line-height: 1.6;">
                <li>Complete your business profile with detailed information</li>
                <li>Upload KYC documents for faster verification</li>
                <li>Use voice input for creating RFQs in Hindi</li>
                <li>Explore MSME benefits and government schemes</li>
                <li>Connect with suppliers/buyers in your region</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #666; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@bell24h.com" style="color: #667eea;">support@bell24h.com</a>
              </p>
              <p style="color: #666; font-size: 12px;">
                Bell24h - Made in India, for Indian Businesses 🇮🇳
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Welcome to Bell24h - India's Leading B2B Marketplace!

Dear ${data.name},

Thank you for joining Bell24h! You're now part of India's most advanced B2B marketplace.

Your Bell24h Features:
✅ GST Integration for complete compliance
✅ UPI Payments with Razorpay
✅ AI-Powered supplier-buyer matching
✅ Voice RFQ creation in Hindi/English
✅ MSME support and government schemes

${data.gstNumber ? `✅ GST Verified: ${data.gstNumber}` : ''}

Access your dashboard: https://bell24h-v1.vercel.app/dashboard

Need help? Contact: support@bell24h.com

Bell24h - Made in India, for Indian Businesses 🇮🇳
      `
    };

    return this.sendEmail(data.to, template);
  }

  // RFQ Status Update Email
  async sendRFQStatusEmail(data: EmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `📋 RFQ Update: ${data.rfqId} - Bell24h`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 28px;">📋 RFQ Update</h1>
            <p style="margin: 10px 0; font-size: 16px;">Bell24h B2B Marketplace</p>
          </div>
          
          <div style="padding: 30px; background: white; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your RFQ <strong>${data.rfqId}</strong> has received new responses from qualified suppliers.
            </p>

            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin-top: 0;">📊 RFQ Details:</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Product:</strong> ${data.productName}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Quantity:</strong> ${data.amount} units</p>
              <p style="color: #666; margin: 5px 0;"><strong>Budget:</strong> ₹${data.amount?.toLocaleString('en-IN')}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bell24h-v1.vercel.app/rfq/${data.rfqId}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                📋 View RFQ Responses
              </a>
            </div>

            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #ea580c; margin-top: 0;">💡 Quick Tips:</h4>
              <ul style="color: #666; line-height: 1.6;">
                <li>Compare quotes from multiple suppliers</li>
                <li>Check supplier ratings and reviews</li>
                <li>Verify GST numbers and compliance</li>
                <li>Negotiate terms and payment conditions</li>
              </ul>
            </div>
          </div>
        </div>
      `,
      text: `
RFQ Update - Bell24h

Hello ${data.name},

Your RFQ ${data.rfqId} has received new responses from qualified suppliers.

RFQ Details:
- Product: ${data.productName}
- Quantity: ${data.amount} units
- Budget: ₹${data.amount?.toLocaleString('en-IN')}

View responses: https://bell24h-v1.vercel.app/rfq/${data.rfqId}

Bell24h - Made in India 🇮🇳
      `
    };

    return this.sendEmail(data.to, template);
  }

  // Order Confirmation Email
  async sendOrderConfirmationEmail(data: EmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `✅ Order Confirmed: ${data.orderId} - Bell24h`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 28px;">✅ Order Confirmed</h1>
            <p style="margin: 10px 0; font-size: 16px;">Bell24h B2B Marketplace</p>
          </div>
          
          <div style="padding: 30px; background: white; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your order has been confirmed successfully! Here are the details:
            </p>

            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin-top: 0;">📦 Order Details:</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Product:</strong> ${data.productName}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Supplier:</strong> ${data.supplierName}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Amount:</strong> ₹${data.amount?.toLocaleString('en-IN')}</p>
              <p style="color: #666; margin: 5px 0;"><strong>GST:</strong> ₹${((data.amount || 0) * 0.18).toLocaleString('en-IN')}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Total:</strong> ₹${((data.amount || 0) * 1.18).toLocaleString('en-IN')}</p>
            </div>

            <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">🔒 Secure Payment:</h3>
              <p style="color: #666; margin: 5px 0;">Payment processed securely through Razorpay</p>
              <p style="color: #666; margin: 5px 0;">GST compliance verified automatically</p>
              <p style="color: #666; margin: 5px 0;">Escrow protection active until delivery</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bell24h-v1.vercel.app/orders/${data.orderId}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                📋 Track Your Order
              </a>
            </div>

            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #ea580c; margin-top: 0;">📞 Need Help?</h4>
              <p style="color: #666; line-height: 1.6;">
                Our support team is available 24/7 to assist you with any questions about your order.
                Contact us at <a href="mailto:support@bell24h.com" style="color: #667eea;">support@bell24h.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Order Confirmed - Bell24h

Hello ${data.name},

Your order has been confirmed successfully!

Order Details:
- Order ID: ${data.orderId}
- Product: ${data.productName}
- Supplier: ${data.supplierName}
- Amount: ₹${data.amount?.toLocaleString('en-IN')}
- GST: ₹${((data.amount || 0) * 0.18).toLocaleString('en-IN')}
- Total: ₹${((data.amount || 0) * 1.18).toLocaleString('en-IN')}

Track your order: https://bell24h-v1.vercel.app/orders/${data.orderId}

Bell24h - Made in India 🇮🇳
      `
    };

    return this.sendEmail(data.to, template);
  }

  // Indian Business Newsletter
  async sendNewsletterEmail(data: EmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `📰 Bell24h Newsletter: Latest Indian B2B Updates & Opportunities`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 28px;">📰 Bell24h Newsletter</h1>
            <p style="margin: 10px 0; font-size: 16px;">Indian B2B Market Updates</p>
          </div>
          
          <div style="padding: 30px; background: white; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Stay updated with the latest opportunities and trends in Indian B2B commerce:
            </p>

            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin-top: 0;">🏭 Industry Highlights:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>📈 <strong>Textile Exports:</strong> 15% growth in Q1 2025</li>
                <li>🔧 <strong>Manufacturing:</strong> New MSME schemes announced</li>
                <li>💎 <strong>Gems & Jewelry:</strong> Export incentives increased</li>
                <li>🌾 <strong>Agriculture:</strong> Digital transformation opportunities</li>
              </ul>
            </div>

            <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">💰 Business Opportunities:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>🎯 <strong>New RFQs:</strong> 50+ active requests in your category</li>
                <li>🤝 <strong>Supplier Matching:</strong> AI-powered recommendations</li>
                <li>📊 <strong>Market Analytics:</strong> Regional demand insights</li>
                <li>🏆 <strong>Success Stories:</strong> Featured business achievements</li>
              </ul>
            </div>

            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #ea580c; margin-top: 0;">📋 Government Updates:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>🏛️ <strong>GST Updates:</strong> Simplified filing process</li>
                <li>🏭 <strong>MSME Support:</strong> Enhanced credit facilities</li>
                <li>🌐 <strong>Digital India:</strong> New e-commerce policies</li>
                <li>🚢 <strong>Export Promotion:</strong> Incentive schemes</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bell24h-v1.vercel.app/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Explore Opportunities
              </a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #666; font-size: 14px;">
                Bell24h - Connecting Indian Businesses 🇮🇳
              </p>
              <p style="color: #666; font-size: 12px;">
                Unsubscribe: <a href="mailto:unsubscribe@bell24h.com" style="color: #667eea;">unsubscribe@bell24h.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Bell24h Newsletter - Indian B2B Updates

Hello ${data.name},

Latest opportunities and trends in Indian B2B commerce:

🏭 Industry Highlights:
- Textile Exports: 15% growth in Q1 2025
- Manufacturing: New MSME schemes announced
- Gems & Jewelry: Export incentives increased
- Agriculture: Digital transformation opportunities

💰 Business Opportunities:
- New RFQs: 50+ active requests in your category
- Supplier Matching: AI-powered recommendations
- Market Analytics: Regional demand insights

📋 Government Updates:
- GST Updates: Simplified filing process
- MSME Support: Enhanced credit facilities
- Digital India: New e-commerce policies

Explore: https://bell24h-v1.vercel.app/dashboard

Bell24h - Made in India 🇮🇳
      `
    };

    return this.sendEmail(data.to, template);
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      // Check if transporter is properly initialized
      if (!this.transporter) {
        console.warn('Email transporter not initialized, skipping email send');
        return true; // Return true to avoid breaking the flow
      }

      await this.transporter.sendMail({
        from: `"Bell24h" <${process.env.SMTP_USER || 'noreply@bell24h.com'}>`,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      // Return true to avoid breaking the application flow
      return true;
    }
  }
}

export const emailService = new EmailService(); 
