import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimId, verificationCode } = body;

    if (!claimId || !verificationCode) {
      return NextResponse.json(
        { error: 'Missing claimId or verificationCode' },
        { status: 400 }
      );
    }

    // Find claim
    const claim = await prisma.companyClaim.findUnique({
      where: { id: claimId },
      include: { scrapedCompany: true },
    });

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Verify code
    if (claim.verificationCode !== verificationCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (claim.status === 'CLAIMED') {
      return NextResponse.json(
        { error: 'Claim already verified' },
        { status: 400 }
      );
    }

    // Update claim status
    const updatedClaim = await prisma.companyClaim.update({
      where: { id: claimId },
      data: {
        status: 'CLAIMED',
        isEmailVerified: true,
        isPhoneVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Update company claim status
    await prisma.scrapedCompany.update({
      where: { id: claim.scrapedCompanyId },
      data: {
        claimStatus: 'CLAIMED',
        claimedAt: new Date(),
      },
    });

    // TODO: Create user account for supplier
    // TODO: Send welcome email/SMS
    // TODO: Trigger n8n workflow for welcome

    // Trigger n8n webhook for welcome workflow
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.bell24h.com/webhook/supplier-new';
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: claim.scrapedCompany.id,
          name: claim.claimedByName,
          mobile: claim.claimedByPhone,
          phone: claim.claimedByPhone,
          email: claim.claimedBy,
        }),
      });
    } catch (n8nError) {
      console.error('Failed to trigger n8n workflow:', n8nError);
      // Don't fail the verification if n8n fails
    }

    return NextResponse.json({
      success: true,
      message: 'Profile claimed successfully',
      claim: updatedClaim,
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify claim', details: error.message },
      { status: 500 }
    );
  }
}

