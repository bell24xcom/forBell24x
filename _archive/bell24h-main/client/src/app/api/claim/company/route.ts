import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// MSG91 OTP service (you'll need to implement this)
async function sendOTP(phone: string, code: string): Promise<boolean> {
  try {
    // TODO: Integrate with MSG91 API
    // For now, just log
    console.log(`Sending OTP ${code} to ${phone}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
}

// Email verification service
async function sendEmailVerification(email: string, code: string): Promise<boolean> {
  try {
    // TODO: Integrate with email service
    console.log(`Sending verification code ${code} to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyId, 
      claimedBy, 
      claimedByName, 
      claimedByPhone, 
      claimedByRole, 
      verificationMethod 
    } = body;

    // Validate required fields
    if (!companyId || !claimedBy || !claimedByName || !claimedByPhone || !claimedByRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if company exists and is unclaimed
    const company = await prisma.scrapedCompany.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (company.claimStatus !== 'UNCLAIMED') {
      return NextResponse.json(
        { error: 'Company already claimed or pending' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create claim request
    const claim = await prisma.companyClaim.create({
      data: {
        scrapedCompanyId: companyId,
        claimedBy,
        claimedByName,
        claimedByPhone,
        claimedByRole,
        verificationMethod: verificationMethod || 'PHONE',
        verificationCode,
        status: 'PENDING',
        benefits: {
          freeListing: true,
          featuredBadge: true,
          prioritySupport: true,
          value: 30000,
        },
      },
    });

    // Send verification code via SMS/Email
    let sent = false;
    if (verificationMethod === 'PHONE' || !verificationMethod) {
      sent = await sendOTP(claimedByPhone, verificationCode);
    } else {
      sent = await sendEmailVerification(claimedBy, verificationCode);
    }

    if (!sent) {
      // Still create the claim, but log the error
      console.error('Failed to send verification code, but claim created');
    }

    // Update company claim status
    await prisma.scrapedCompany.update({
      where: { id: companyId },
      data: {
        claimStatus: 'PENDING',
        claimId: claim.id,
      },
    });

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      message: 'Verification code sent',
    });
  } catch (error: any) {
    console.error('Claim error:', error);
    return NextResponse.json(
      { error: 'Failed to create claim', details: error.message },
      { status: 500 }
    );
  }
}

