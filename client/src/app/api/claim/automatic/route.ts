import { NextRequest, NextResponse } from 'next/server';

// Automatic Company Claim API
// Handles automatic claim processing with early user benefits
export async function POST(request: NextRequest) {
  try {
    const { companyId, claimData } = await request.json();

    console.log(`🎯 Processing automatic claim for company: ${companyId}`);

    // Validate claim data
    const validation = await validateClaimData(claimData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid claim data', details: validation.errors },
        { status: 400 }
      );
    }

    // Process claim with early user benefits
    const claimResult = await processClaimWithBenefits(companyId, claimData);

    // Send welcome package
    await sendWelcomePackage(claimResult);

    // Update analytics
    await updateClaimAnalytics(claimResult);

    return NextResponse.json({
      success: true,
      message: 'Claim processed successfully with early user benefits!',
      data: {
        claimId: claimResult.claimId,
        companyId,
        benefits: claimResult.benefits,
        status: 'ACTIVE',
        welcomePackage: claimResult.welcomePackage,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Automatic Claim Processing Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process claim',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Validate claim data
async function validateClaimData(claimData: any) {
  const errors = [];
  
  if (!claimData.companyName) errors.push('Company name is required');
  if (!claimData.contactEmail) errors.push('Contact email is required');
  if (!claimData.contactPhone) errors.push('Contact phone is required');
  if (!claimData.category) errors.push('Category is required');

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Process claim with early user benefits
async function processClaimWithBenefits(companyId: string, claimData: any) {
  console.log(`💰 Processing claim with early user benefits for ${claimData.companyName}`);

  const claimId = `claim_${Date.now()}_${companyId}`;
  
  // Early user benefits package
  const benefits = {
    freeLifetimeBasic: {
      value: 12000,
      description: 'FREE Lifetime Basic Plan',
      status: 'ACTIVE',
      activatedAt: new Date()
    },
    sixMonthsPremium: {
      value: 18000,
      description: '6 Months Premium Plan FREE',
      status: 'ACTIVE',
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
    },
    earlyUserBadge: {
      badge: 'FOUNDER_MEMBER',
      description: 'Founder Member Badge',
      status: 'ACTIVE',
      benefits: [
        'Priority in all searches',
        'Featured company listing',
        'Dedicated success manager',
        'Exclusive founder benefits'
      ]
    },
    prioritySupport: {
      description: 'Priority Customer Support',
      status: 'ACTIVE',
      responseTime: '2 hours'
    }
  };

  // Welcome package
  const welcomePackage = {
    email: {
      subject: '🎉 Welcome to Bell24h Founder\'s Club!',
      template: 'founder-welcome',
      benefits: benefits
    },
    sms: {
      message: `Welcome to Bell24h Founder's Club! You've received FREE lifetime basic (₹12K) + 6 months premium (₹18K). Total value: ₹30K! Login: bell24h.com/dashboard`,
      sent: false
    },
    onboarding: {
      steps: [
        'Complete company profile',
        'Verify business documents',
        'Set up payment methods',
        'Access premium features',
        'Join founder community'
      ],
      currentStep: 1
    }
  };

  const claimResult = {
    claimId,
    companyId,
    companyName: claimData.companyName,
    category: claimData.category,
    benefits,
    welcomePackage,
    status: 'ACTIVE',
    createdAt: new Date(),
    totalValue: 30000 // ₹30K total value
  };

  // Save to database
  await saveClaimToDatabase(claimResult);

  return claimResult;
}

// Send welcome package
async function sendWelcomePackage(claimResult: any) {
  console.log(`📧 Sending welcome package to ${claimResult.companyName}`);

  // Send welcome email
  await sendWelcomeEmail(claimResult);

  // Send welcome SMS
  await sendWelcomeSMS(claimResult);

  // Create onboarding sequence
  await createOnboardingSequence(claimResult);
}

// Send welcome email
async function sendWelcomeEmail(claimResult: any) {
  const emailData = {
    to: claimResult.contactEmail,
    subject: '🎉 Welcome to Bell24h Founder\'s Club!',
    template: 'founder-welcome',
    data: {
      companyName: claimResult.companyName,
      benefits: claimResult.benefits,
      totalValue: claimResult.totalValue,
      dashboardUrl: 'https://bell24h.com/dashboard',
      claimId: claimResult.claimId
    }
  };

  console.log(`📧 Sending welcome email to ${emailData.to}`);
  
  // This would integrate with your email service
  // await sendEmail(emailData);
}

// Send welcome SMS
async function sendWelcomeSMS(claimResult: any) {
  const smsData = {
    to: claimResult.contactPhone,
    message: `Welcome to Bell24h Founder's Club! You've received FREE lifetime basic (₹12K) + 6 months premium (₹18K). Total value: ₹30K! Login: bell24h.com/dashboard`,
    sender: 'BELL24H'
  };

  console.log(`📱 Sending welcome SMS to ${smsData.to}`);
  
  // This would integrate with MSG91
  // await sendSMS(smsData);
}

// Create onboarding sequence
async function createOnboardingSequence(claimResult: any) {
  console.log(`🎯 Creating onboarding sequence for ${claimResult.companyName}`);

  const onboardingSteps = [
    {
      step: 1,
      title: 'Complete Company Profile',
      description: 'Add your company details and verification',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    {
      step: 2,
      title: 'Verify Business Documents',
      description: 'Upload and verify your business documents',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    },
    {
      step: 3,
      title: 'Set Up Payment Methods',
      description: 'Configure your payment and billing',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
    },
    {
      step: 4,
      title: 'Access Premium Features',
      description: 'Explore and activate premium features',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 96 * 60 * 60 * 1000) // 96 hours
    },
    {
      step: 5,
      title: 'Join Founder Community',
      description: 'Connect with other founder members',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 120 * 60 * 60 * 1000) // 120 hours
    }
  ];

  // Save onboarding sequence
  await saveOnboardingSequence(claimResult.claimId, onboardingSteps);

  return onboardingSteps;
}

// Save claim to database
async function saveClaimToDatabase(claimResult: any) {
  console.log(`💾 Saving claim to database: ${claimResult.claimId}`);
  
  // This would integrate with your Prisma database
  // const savedClaim = await prisma.claim.create({
  //   data: claimResult
  // });
  
  return claimResult;
}

// Save onboarding sequence
async function saveOnboardingSequence(claimId: string, steps: any[]) {
  console.log(`📋 Saving onboarding sequence for claim: ${claimId}`);
  
  // This would integrate with your Prisma database
  // const savedSequence = await prisma.onboardingSequence.create({
  //   data: {
  //     claimId,
  //     steps
  //   }
  // });
  
  return steps;
}

// Update claim analytics
async function updateClaimAnalytics(claimResult: any) {
  console.log(`📊 Updating claim analytics for ${claimResult.companyName}`);

  const analytics = {
    totalClaims: 1,
    totalValue: claimResult.totalValue,
    category: claimResult.category,
    timestamp: new Date(),
    earlyUserBenefits: {
      freeLifetimeBasic: 1,
      sixMonthsPremium: 1,
      earlyUserBadges: 1,
      prioritySupport: 1
    }
  };

  return analytics;
}

// GET endpoint to check claim status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const claimId = searchParams.get('claimId');

  return NextResponse.json({
    success: true,
    message: 'Automatic Claim System Status',
    data: {
      status: 'ACTIVE',
      claimId: claimId || 'ALL',
      totalClaims: 0, // This would come from database
      totalValue: 0, // This would come from database
      earlyUserBenefits: {
        freeLifetimeBasic: 0,
        sixMonthsPremium: 0,
        earlyUserBadges: 0,
        prioritySupport: 0
      },
      systemHealth: 'EXCELLENT'
    }
  });
}
