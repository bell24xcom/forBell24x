import { Resend } from 'resend';

// Only initialize Resend if API key is available (prevents build-time errors)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const WELCOME_EMAIL_TEMPLATE = (name: string, userType: 'supplier' | 'buyer') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Bell24h</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Bell24h!</h1>
            <p>India's Premier AI-Powered B2B Marketplace</p>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <p>Welcome to Bell24h! We're excited to have you join our platform as a ${userType}.</p>
            
            <h3>🚀 What's Next?</h3>
            <ul>
                <li>Complete your profile setup</li>
                <li>Explore our AI-powered features</li>
                <li>Connect with verified ${userType === 'supplier' ? 'buyers' : 'suppliers'}</li>
                <li>Start your first transaction</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bell24h.com'}" class="button">Get Started</a>
            
            <h3>✨ Key Features:</h3>
            <ul>
                <li>🎤 Voice RFQ Creation</li>
                <li>🤖 AI-Powered Matching</li>
                <li>🛡️ Secure Escrow Payments</li>
                <li>📊 Real-time Analytics</li>
                <li>💰 Fintech Integrations</li>
            </ul>
        </div>
        <div class="footer">
            <p>Made in India 🇮🇳 | GST Compliant | MSME Friendly</p>
            <p>© 2025 Bell24h. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const RFQ_NOTIFICATION_TEMPLATE = (supplierName: string, rfqDetails: any) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New RFQ Alert - Bell24h</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .rfq-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 New RFQ Alert!</h1>
            <p>You have a new Request for Quotation</p>
        </div>
        <div class="content">
            <h2>Hello ${supplierName},</h2>
            <p>You have received a new RFQ that matches your capabilities!</p>
            
            <div class="rfq-details">
                <h3>📋 RFQ Details:</h3>
                <p><strong>Product/Service:</strong> ${rfqDetails.product || 'Not specified'}</p>
                <p><strong>Quantity:</strong> ${rfqDetails.quantity || 'Not specified'}</p>
                <p><strong>Budget Range:</strong> ${rfqDetails.budget || 'Not specified'}</p>
                <p><strong>Delivery Timeline:</strong> ${rfqDetails.timeline || 'Not specified'}</p>
                <p><strong>Location:</strong> ${rfqDetails.location || 'Not specified'}</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bell24h.com'}/dashboard" class="button">View Full RFQ</a>
            
            <h3>💡 Quick Tips:</h3>
            <ul>
                <li>Respond within 24 hours for better chances</li>
                <li>Provide detailed pricing and specifications</li>
                <li>Include your certifications and quality standards</li>
                <li>Offer competitive payment terms</li>
            </ul>
        </div>
        <div class="footer">
            <p>Bell24h - India's Premier B2B Marketplace</p>
            <p>© 2025 Bell24h. All rights reserved.</p>
        </div>
    </div>
</html>
`;

const ORDER_CONFIRMATION_TEMPLATE = (orderDetails: any) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Bell24h</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
        .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Your order has been successfully placed</p>
        </div>
        <div class="content">
            <h2>Order Confirmation</h2>
            <p>Your order has been successfully placed and is being processed.</p>
            
            <div class="order-details">
                <h3>📦 Order Details:</h3>
                <p><strong>Order ID:</strong> ${orderDetails.orderId || 'N/A'}</p>
                <p><strong>Product:</strong> ${orderDetails.product || 'N/A'}</p>
                <p><strong>Quantity:</strong> ${orderDetails.quantity || 'N/A'}</p>
                <p><strong>Total Amount:</strong> ₹${orderDetails.amount || 'N/A'}</p>
                <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod || 'N/A'}</p>
                <p><strong>Expected Delivery:</strong> ${orderDetails.deliveryDate || 'N/A'}</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bell24h.com'}/dashboard" class="button">Track Order</a>
            
            <h3>📞 Need Help?</h3>
            <p>If you have any questions about your order, please contact our support team.</p>
        </div>
        <div class="footer">
            <p>Bell24h - India's Premier B2B Marketplace</p>
            <p>© 2025 Bell24h. All rights reserved.</p>
        </div>
    </div>
</html>
`;

export async function sendWelcomeEmail(
  to: string,
  name: string,
  userType: 'supplier' | 'buyer' = 'buyer'
) {
  if (!resend) {
    console.warn('Resend not initialized - skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: `Welcome to Bell24h, ${name}! 🎉`,
      html: WELCOME_EMAIL_TEMPLATE(name, userType),
    });

    if (error) {
      console.error('Welcome email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error };
  }
}

export async function sendRFQNotification(to: string, supplierName: string, rfqDetails: any) {
  if (!resend) {
    console.warn('Resend not initialized - skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: `New RFQ Alert - ${rfqDetails.product || 'Product'} 📋`,
      html: RFQ_NOTIFICATION_TEMPLATE(supplierName, rfqDetails),
    });

    if (error) {
      console.error('RFQ notification error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('RFQ notification error:', error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmation(to: string, orderDetails: any) {
  if (!resend) {
    console.warn('Resend not initialized - skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: `Order Confirmed - ${orderDetails.orderId} ✅`,
      html: ORDER_CONFIRMATION_TEMPLATE(orderDetails),
    });

    if (error) {
      console.error('Order confirmation error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Order confirmation error:', error);
    return { success: false, error };
  }
}

export async function sendTestEmail() {
  if (!resend) {
    console.warn('Resend not initialized - skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['test@example.com'],
      subject: 'Bell24h Test Email',
      html: '<h1>Test Email from Bell24h</h1><p>This is a test email to verify the email service is working.</p>',
    });

    if (error) {
      console.error('Test email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Test email error:', error);
    return { success: false, error };
  }
}
