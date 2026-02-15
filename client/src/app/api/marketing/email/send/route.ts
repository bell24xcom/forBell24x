import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for email sending
const EmailSchema = z.object({
  to: z.string().email('Valid email address is required'),
  subject: z.string().min(1, 'Subject is required'),
  template: z.string().optional(),
  data: z.record(z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  campaignId: z.string().optional()
})

/**
 * POST /api/marketing/email/send - Send email via Resend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = EmailSchema.parse(body)

    const { to, subject, template, data, priority, campaignId } = validatedData

    // Generate email content
    const emailContent = await generateEmailContent(template, data, subject)

    // Send email via Resend API
    const emailResponse = await sendEmailViaResend(to, subject, emailContent.html, emailContent.text)

    if (emailResponse.success) {
      // Log email delivery
      await logEmailDelivery({
        to,
        subject,
        template,
        priority,
        campaignId,
        status: 'sent',
        messageId: emailResponse.messageId
      })

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        data: {
          to,
          subject,
          messageId: emailResponse.messageId,
          status: 'sent',
          priority,
          sentAt: new Date().toISOString()
        }
      })
    } else {
      throw new Error(emailResponse.error || 'Failed to send email')
    }

  } catch (error) {
    console.error('Email API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

/**
 * Generate email content based on template
 */
async function generateEmailContent(template?: string, data?: any, subject?: string) {
  const templateData = data || {}
  
  switch (template) {
    case 'company-claim-email':
      return generateCompanyClaimEmail(templateData)
    case 'welcome-early-user':
      return generateWelcomeEmail(templateData)
    case 'verification-email':
      return generateVerificationEmail(templateData)
    default:
      return generateDefaultEmail(templateData, subject || '')
  }
}

/**
 * Generate company claim email template
 */
function generateCompanyClaimEmail(data: any) {
  const { companyName, category, claimUrl, benefits } = data
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Claim Your FREE Bell24h Profile</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .benefits { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .benefit-item { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745; }
        .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Exclusive Opportunity for ${companyName}!</h1>
          <p>Bell24h has identified you as a leading ${category} company</p>
        </div>
        
        <div class="content">
          <h2>Claim Your FREE Company Profile Worth ₹30,000+!</h2>
          
          <p>Dear ${companyName} Team,</p>
          
          <p>Bell24h has identified your company as a top player in the ${category} industry. We're offering you an exclusive opportunity to claim your FREE company profile with incredible benefits!</p>
          
          <div class="benefits">
            <h3>🎁 EARLY USER BENEFITS (Limited Time Only):</h3>
            <div class="benefit-item">✅ FREE Lifetime Basic Plan (₹12,000 value)</div>
            <div class="benefit-item">✅ 6 Months Premium FREE (₹18,000 value)</div>
            <div class="benefit-item">✅ Early User Badge & Priority Support</div>
            <div class="benefit-item">✅ Featured in category searches</div>
            <div class="benefit-item">✅ Dedicated success manager</div>
          </div>
          
          <p><strong>⏰ URGENT:</strong> Only 1000 companies can claim this offer. You're company #${Math.floor(Math.random() * 500) + 1} - secure your FREE spot now!</p>
          
          <div style="text-align: center;">
            <a href="${claimUrl}" class="cta-button">🚀 CLAIM MY FREE PROFILE NOW</a>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>✅ Verify your company details</li>
            <li>✅ Profile activated within 24 hours</li>
            <li>✅ Start receiving qualified leads immediately</li>
            <li>✅ Access to premium features for 6 months FREE</li>
          </ul>
          
          <p>Don't miss this exclusive opportunity to grow your business with Bell24h!</p>
          
          <p>Best regards,<br>
          <strong>Bell24h Team</strong><br>
          India's Fastest B2B Match-Making Engine</p>
        </div>
        
        <div class="footer">
          <p>This is an exclusive offer for verified companies. If you're not interested, simply ignore this email.</p>
          <p>© 2025 Bell24h. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Exclusive Opportunity for ${companyName}!
    
    Bell24h has identified you as a leading ${category} company.
    
    Claim Your FREE Company Profile Worth ₹30,000+!
    
    EARLY USER BENEFITS:
    ✅ FREE Lifetime Basic Plan (₹12,000 value)
    ✅ 6 Months Premium FREE (₹18,000 value)
    ✅ Early User Badge & Priority Support
    ✅ Featured in category searches
    ✅ Dedicated success manager
    
    URGENT: Only 1000 companies can claim this offer.
    
    Claim now: ${claimUrl}
    
    Best regards,
    Bell24h Team
  `
  
  return { html, text }
}

/**
 * Generate welcome email template
 */
function generateWelcomeEmail(data: any) {
  const { companyName, category, benefits, dashboardUrl } = data
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Bell24h!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .benefits { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .cta-button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Bell24h, ${companyName}!</h1>
          <p>Your profile is now live and ready to receive qualified leads</p>
        </div>
        
        <div class="content">
          <h2>Congratulations on claiming your FREE profile!</h2>
          
          <p>Dear ${companyName} Team,</p>
          
          <p>Welcome to Bell24h! Your company profile has been successfully activated and is now live on our platform. You're now part of India's fastest-growing B2B marketplace!</p>
          
          <div class="benefits">
            <h3>🎁 Your Early User Benefits (Now Active):</h3>
            <p><strong>Total Value: ₹30,000+ in FREE benefits!</strong></p>
            <ul>
              <li>✅ FREE Lifetime Basic Plan (₹12,000 value)</li>
              <li>✅ 6 Months Premium FREE (₹18,000 value)</li>
              <li>✅ Early User Badge & Priority Support</li>
              <li>✅ Featured in ${category} category searches</li>
              <li>✅ Dedicated success manager</li>
            </ul>
          </div>
          
          <h3>What's Next?</h3>
          <ol>
            <li><strong>Complete Your Profile:</strong> Add products, services, and company details</li>
            <li><strong>Upload Certificates:</strong> Showcase your certifications and credentials</li>
            <li><strong>Set Up Notifications:</strong> Get instant alerts for new RFQs</li>
            <li><strong>Start Receiving Leads:</strong> Qualified buyers will find you automatically</li>
          </ol>
          
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="cta-button">🚀 Access Your Dashboard</a>
          </div>
          
          <p><strong>Need Help?</strong></p>
          <p>Our dedicated success manager will contact you within 24 hours to help you get started. In the meantime, feel free to reach out to our support team.</p>
          
          <p>Welcome aboard, and happy selling!</p>
          
          <p>Best regards,<br>
          <strong>Bell24h Success Team</strong><br>
          support@bell24h.com | +91-9876543210</p>
        </div>
        
        <div class="footer">
          <p>© 2025 Bell24h. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Welcome to Bell24h, ${companyName}!
    
    Your profile is now live and ready to receive qualified leads.
    
    Congratulations on claiming your FREE profile!
    
    Your Early User Benefits (Now Active):
    Total Value: ₹30,000+ in FREE benefits!
    ✅ FREE Lifetime Basic Plan (₹12,000 value)
    ✅ 6 Months Premium FREE (₹18,000 value)
    ✅ Early User Badge & Priority Support
    ✅ Featured in ${category} category searches
    ✅ Dedicated success manager
    
    What's Next?
    1. Complete Your Profile: Add products, services, and company details
    2. Upload Certificates: Showcase your certifications and credentials
    3. Set Up Notifications: Get instant alerts for new RFQs
    4. Start Receiving Leads: Qualified buyers will find you automatically
    
    Access Your Dashboard: ${dashboardUrl}
    
    Best regards,
    Bell24h Success Team
  `
  
  return { html, text }
}

/**
 * Generate verification email template
 */
function generateVerificationEmail(data: any) {
  const { claimId, verificationUrl, companyName } = data
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Company Claim</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        .cta-button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔐 Verify Your Company Claim</h2>
        </div>
        <div class="content">
          <p>Dear ${companyName} Team,</p>
          <p>Please verify your company claim by clicking the button below:</p>
          <a href="${verificationUrl}" class="cta-button">Verify Claim</a>
          <p>This link will expire in 24 hours.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Verify Your Company Claim
    
    Dear ${companyName} Team,
    
    Please verify your company claim by visiting: ${verificationUrl}
    
    This link will expire in 24 hours.
  `
  
  return { html, text }
}

/**
 * Generate default email template
 */
function generateDefaultEmail(data: any, subject: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>${subject}</h2>
        <p>${data.message || 'This is an automated message from Bell24h.'}</p>
        <p>Best regards,<br>Bell24h Team</p>
      </div>
    </body>
    </html>
  `
  
  const text = `${subject}\n\n${data.message || 'This is an automated message from Bell24h.'}\n\nBest regards,\nBell24h Team`
  
  return { html, text }
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(to: string, subject: string, html: string, text: string) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    
    if (!apiKey) {
      throw new Error('Resend API key not configured')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bell24h <noreply@bell24h.com>',
        to: [to],
        subject: subject,
        html: html,
        text: text
      })
    })

    const responseData = await response.json()

    if (response.ok) {
      return {
        success: true,
        messageId: responseData.id,
        status: 'sent'
      }
    } else {
      return {
        success: false,
        error: responseData.message || 'Failed to send email'
      }
    }

  } catch (error) {
    console.error('Resend API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Log email delivery for tracking
 */
async function logEmailDelivery(data: {
  to: string;
  subject: string;
  template?: string;
  priority: string;
  campaignId?: string;
  status: string;
  messageId: string;
}) {
  try {
    console.log('Email Delivery Logged:', {
      ...data,
      timestamp: new Date().toISOString()
    })

    if (data.campaignId) {
      await updateCampaignStats(data.campaignId, 'email_sent')
    }

  } catch (error) {
    console.error('Failed to log email delivery:', error)
  }
}

/**
 * Update campaign statistics
 */
async function updateCampaignStats(campaignId: string, action: string) {
  try {
    console.log(`Campaign ${campaignId} stats updated for ${action}`)
  } catch (error) {
    console.error('Failed to update campaign stats:', error)
  }
}
