import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { leadId, supplierId } = await req.json();

    if (!leadId || !supplierId) {
      return NextResponse.json({
        error: 'leadId and supplierId are required'
      }, { status: 400 });
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({
        error: 'Lead not found'
      }, { status: 404 });
    }

    // Check if already unlocked by this supplier
    const existingUnlock = await prisma.leadSupplier.findFirst({
      where: {
        leadId,
        supplierId,
        unlocked: true
      }
    });

    if (existingUnlock) {
      return NextResponse.json({
        success: true,
        lead: {
          ...lead,
          contactHidden: false
        },
        message: 'Lead already unlocked'
      });
    }

    // Check credits
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId: supplierId }
    });

    if (!userCredits || userCredits.credits < 1) {
      return NextResponse.json({
        error: 'Insufficient credits. Please purchase credits to unlock leads.'
      }, { status: 400 });
    }

    // Deduct credit and unlock lead
    await prisma.$transaction([
      prisma.userCredits.update({
        where: { userId: supplierId },
        data: {
          credits: { decrement: 1 },
          spent: { increment: 1 }
        }
      }),
      prisma.leadSupplier.create({
        data: {
          leadId,
          supplierId,
          unlocked: true,
          unlockedAt: new Date(),
          credits: 1
        }
      })
    ]);

    // Get updated lead details
    const updatedLead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    return NextResponse.json({
      success: true,
      lead: {
        ...updatedLead,
        contactHidden: false
      },
      message: 'Lead unlocked successfully! Contact details are now visible.'
    });

  } catch (error) {
    console.error('Error unlocking lead:', error);
    return NextResponse.json({
      error: 'Failed to unlock lead. Please try again.'
    }, { status: 500 });
  }
}
