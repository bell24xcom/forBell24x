import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Supplier Onboarding Webhook
 * Item 23: n8n workflow integration for welcome emails/SMS
 * 
 * This endpoint is called by n8n when a new supplier signs up
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, email, phone, name } = body;

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Get supplier data
    const supplier = await prisma.scrapedCompany.findUnique({
      where: { id: supplierId },
      include: { claim: true }
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Prepare onboarding data for n8n
    const onboardingData = {
      supplierId: supplier.id,
      name: supplier.name,
      email: email || supplier.email,
      phone: phone || supplier.phone,
      city: supplier.city,
      state: supplier.state,
      category: supplier.category,
      claimStatus: supplier.claimStatus,
      onboardingDate: new Date().toISOString(),
      welcomeEmailSent: false,
      welcomeSMSSent: false,
      profileComplete: false
    };

    // Return data for n8n to process
    return NextResponse.json({
      success: true,
      data: onboardingData,
      webhooks: {
        email: {
          url: `${process.env.N8N_WEBHOOK_URL}/supplier-welcome-email`,
          method: 'POST',
          payload: {
            to: onboardingData.email,
            template: 'supplier-welcome',
            variables: {
              name: onboardingData.name,
              category: onboardingData.category,
              dashboardLink: `https://bell24h.com/supplier/dashboard`,
              supportEmail: 'support@bell24h.com'
            }
          }
        },
        sms: {
          url: `${process.env.N8N_WEBHOOK_URL}/supplier-welcome-sms`,
          method: 'POST',
          payload: {
            to: onboardingData.phone,
            template: 'supplier-welcome-sms',
            message: `Welcome to Bell24h, ${onboardingData.name}! Complete your profile: https://bell24h.com/supplier/profile/edit`
          }
        }
      }
    });

  } catch (error) {
    console.error('Supplier onboarding webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process onboarding' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check onboarding status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    const supplier = await prisma.scrapedCompany.findUnique({
      where: { id: supplierId },
      select: {
        id: true,
        name: true,
        claimStatus: true,
        email: true,
        phone: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        supplierId: supplier?.id,
        name: supplier?.name,
        claimStatus: supplier?.claimStatus,
        onboardingComplete: supplier?.claimStatus === 'CLAIMED',
        nextSteps: [
          'Complete company profile',
          'Add product catalog',
          'Verify GST information',
          'Set up payment methods'
        ]
      }
    });

  } catch (error) {
    console.error('Get onboarding status error:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding status' },
      { status: 500 }
    );
  }
}

