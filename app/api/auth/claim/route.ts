import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { claimId } = await request.json();
    if (!claimId) return NextResponse.json({ success: false, error: 'claimId required' }, { status: 400 });

    // Find the unclaimed profile
    const unclaimedProfile = await prisma.user.findFirst({
      where: { id: claimId, isClaimed: false },
      select: {
        id: true, company: true, location: true, gstNumber: true,
        preferences: true, trustScore: true,
      },
    });

    if (!unclaimedProfile) {
      return NextResponse.json({ success: false, error: 'Profile not found or already claimed' }, { status: 404 });
    }

    const prefs = unclaimedProfile.preferences as Record<string, unknown> | null;

    // Copy business data to the claiming user (only fill empty fields)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { company: true, location: true, gstNumber: true, trustScore: true },
    });

    await prisma.user.update({
      where: { id: user.userId },
      data: {
        company:    currentUser?.company    || unclaimedProfile.company,
        location:   currentUser?.location   || unclaimedProfile.location,
        gstNumber:  currentUser?.gstNumber  || unclaimedProfile.gstNumber,
        role:       'SUPPLIER',
        // Merge preferences
        preferences: {
          ...(prefs || {}),
          onboardingComplete: false,
        },
        // Boost trust score by what unclaimed profile had
        trustScore: Math.min(100, (currentUser?.trustScore || 0) + Math.min(unclaimedProfile.trustScore, 20)),
      },
    });

    // Mark unclaimed profile as claimed
    await prisma.user.update({
      where: { id: claimId },
      data: { isClaimed: true, claimedAt: new Date(), isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile claimed! Your business data has been transferred.',
    });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json({ success: false, error: 'Claim failed' }, { status: 500 });
  }
}
