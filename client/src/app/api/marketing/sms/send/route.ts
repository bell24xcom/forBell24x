import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for SMS sending
const SMSSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().min(1, 'Message is required'),
  template: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  campaignId: z.string().optional()
})

/**
 * POST /api/marketing/sms/send - Send SMS via MSG91
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = SMSSchema.parse(body)

    const { phone, message, template, priority, campaignId } = validatedData

    // Send SMS via MSG91 API
    const smsResponse = await sendSMSViaMSG91(phone, message, template)

    if (smsResponse.success) {
      // Log SMS delivery
      await logSMSDelivery({
        phone,
        message,
        template,
        priority,
        campaignId,
        status: 'sent',
        messageId: smsResponse.messageId || 'unknown'
      })

      return NextResponse.json({
        success: true,
        message: 'SMS sent successfully',
        data: {
          phone,
          messageId: smsResponse.messageId,
          status: 'sent',
          priority,
          sentAt: new Date().toISOString()
        }
      })
    } else {
      throw new Error(smsResponse.error || 'Failed to send SMS')
    }

  } catch (error) {
    console.error('SMS API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}

/**
 * Send SMS via MSG91 API
 */
async function sendSMSViaMSG91(phone: string, message: string, template?: string) {
  try {
    const authKey = process.env.MSG91_AUTH_KEY
    const senderId = process.env.MSG91_SENDER_ID || 'BELL24H'

    if (!authKey) {
      throw new Error('MSG91 auth key not configured')
    }

    // Format phone number for India
    const formattedPhone = phone.startsWith('+91') ? phone.slice(3) : 
                          phone.startsWith('91') ? phone.slice(2) : phone

    const smsData = {
      authkey: authKey,
      mobiles: `91${formattedPhone}`,
      message: message,
      sender: senderId,
      route: '4', // Transactional route
      country: '91', // India country code
      ...(template && { template: template })
    }

    const response = await fetch('https://api.msg91.com/api/sendhttp.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(smsData).toString()
    })

    const responseText = await response.text()

    if (response.ok && responseText && responseText !== 'error') {
      return {
        success: true,
        messageId: responseText,
        status: 'sent'
      }
    } else {
      return {
        success: false,
        error: responseText || 'Unknown error from MSG91'
      }
    }

  } catch (error) {
    console.error('MSG91 API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Log SMS delivery for tracking
 */
async function logSMSDelivery(data: {
  phone: string;
  message: string;
  template?: string;
  priority: string;
  campaignId?: string;
  status: string;
  messageId: string;
}) {
  try {
    // This would typically save to a database
    console.log('SMS Delivery Logged:', {
      ...data,
      timestamp: new Date().toISOString()
    })

    // If campaignId is provided, update campaign stats
    if (data.campaignId) {
      await updateCampaignStats(data.campaignId, 'sms_sent')
    }

  } catch (error) {
    console.error('Failed to log SMS delivery:', error)
  }
}

/**
 * Update campaign statistics
 */
async function updateCampaignStats(campaignId: string, action: string) {
  try {
    // This would update the campaign statistics in the database
    console.log(`Campaign ${campaignId} stats updated for ${action}`)
  } catch (error) {
    console.error('Failed to update campaign stats:', error)
  }
}
