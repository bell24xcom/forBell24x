import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate — supplierId comes from JWT, not the request body
    const token =
      req.cookies.get('auth-token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const supplierId = payload.userId;

    // 2. Parse body — only leadId is accepted from the client
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    // 3. Find the RFQ (supplier leads feed passes RFQ IDs as leadId)
    const rfq = await prisma.rFQ.findFirst({
      where: {
        id: leadId,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            company: true,
            location: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // 4. Check if already unlocked by this supplier
    const existingUnlock = await prisma.leadSupplier.findFirst({
      where: {
        leadId,
        supplierId,
        unlocked: true,
      },
    });

    if (existingUnlock) {
      return NextResponse.json({
        success: true,
        lead: {
          id: rfq.id,
          buyerName: rfq.user?.name ?? null,
          buyerCompany: rfq.user?.company ?? null,
          buyerLocation: rfq.user?.location ?? null,
          buyerPhone: rfq.user?.phone ?? null,
          buyerEmail: rfq.user?.email ?? null,
          contactHidden: false,
        },
        message: 'Requirement already unlocked',
      });
    }

    // 5. Check credits
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId: supplierId },
    });

    if (!userCredits || userCredits.credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Purchase credits to unlock buyer details.' },
        { status: 400 },
      );
    }

    // 6. Deduct credit and record unlock atomically
    await prisma.$transaction([
      prisma.userCredits.update({
        where: { userId: supplierId },
        data: {
          credits: { decrement: 1 },
          spent: { increment: 1 },
        },
      }),
      prisma.leadSupplier.create({
        data: {
          leadId,
          supplierId,
          unlocked: true,
          unlockedAt: new Date(),
          credits: 1,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      lead: {
        id: rfq.id,
        buyerName: rfq.user?.name ?? null,
        buyerCompany: rfq.user?.company ?? null,
        buyerLocation: rfq.user?.location ?? null,
        buyerPhone: rfq.user?.phone ?? null,
        buyerEmail: rfq.user?.email ?? null,
        contactHidden: false,
      },
      message: 'Buyer details unlocked successfully.',
    });
  } catch (error) {
    console.error('Error unlocking lead:', error);
    return NextResponse.json(
      { error: 'Failed to unlock requirement. Please try again.' },
      { status: 500 },
    );
  }
}
