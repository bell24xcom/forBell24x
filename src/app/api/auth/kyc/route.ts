import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// ─── KYC Completeness Score (informational only) ─────────────────────────────
// This is NOT the Trade Confidence Score / `User.trustScore`. That field is
// computed exclusively by the nightly batch job (src/lib/trust-batch.ts, via
// the daily Vercel Cron) per CLAUDE.md's hard rule: "Never compute Trust Score
// real-time (use daily cron only)". This function only estimates how complete
// a submitted KYC profile is, for immediate UI feedback to the user — it must
// never be written to `User.trustScore`.
//
// Base 30  → phone OTP verified (set at login)
// +10      → company name provided
// +5       → location / city provided
// +5       → profile name updated from default
// +25      → GST number provided  (key business credential)
// +20      → Udyam Aadhar number provided  (MSME registration)
// +5       → both GST + Udyam together (bonus)
// ─────────────────────────────────────────────────────────────────────────────
function calculateKycCompletenessScore(user: {
  name?: string | null;
  company?: string | null;
  location?: string | null;
  gstNumber?: string | null;
  udyamNumber?: string | null;
}): number {
  let score = 30; // base: phone verified

  if (user.name && !user.name.startsWith('User ')) score += 5;
  if (user.company && user.company.trim()) score += 10;
  if (user.location && user.location.trim()) score += 5;

  const hasGST = !!(user.gstNumber && user.gstNumber.trim());
  const hasUdyam = !!(user.udyamNumber && user.udyamNumber.trim());

  if (hasGST) score += 25;
  if (hasUdyam) score += 20;
  if (hasGST && hasUdyam) score += 5; // both together bonus

  return Math.min(score, 100);
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(
      request.headers.get('authorization'),
      request.cookies.get('auth-token')?.value
    );

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { kycData } = body;

    if (!kycData) {
      return NextResponse.json(
        { success: false, message: 'KYC data is required' },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Merge incoming KYC fields — all optional, user only provides what they have
    const updatedName    = kycData.name        || currentUser.name;
    const updatedCompany = kycData.companyName || kycData.company || currentUser.company;
    const updatedGST     = kycData.gstNumber   || currentUser.gstNumber;
    const updatedUdyam   = kycData.udyamNumber || currentUser.udyamNumber;
    const updatedLocation = kycData.location   || currentUser.location;

    // Informational only — see calculateKycCompletenessScore doc comment.
    // Must NOT be written to User.trustScore (that's cron-only).
    const kycCompletenessScore = calculateKycCompletenessScore({
      name: updatedName,
      company: updatedCompany,
      location: updatedLocation,
      gstNumber: updatedGST,
      udyamNumber: updatedUdyam,
    });

    const existingPrefs = (currentUser.preferences as Record<string, unknown>) ?? {};

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: updatedName,
        company: updatedCompany,
        gstNumber: updatedGST,
        udyamNumber: updatedUdyam,
        location: updatedLocation,
        // trustScore is intentionally NOT written here — it is recomputed
        // exclusively by the nightly batch cron (src/lib/trust-batch.ts).
        // isVerified stays false until admin explicitly approves KYC
        isVerified: false,
        preferences: {
          ...existingPrefs,
          kyc: {
            ...kycData,
            submittedAt: new Date().toISOString(),
            status: 'pending', // pending | approved | rejected
          },
          kycCompleted: true,
        },
      },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        company: true,
        gstNumber: true,
        udyamNumber: true,
        trustScore: true,
        location: true,
        isVerified: true,
        preferences: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'KYC submitted. Your Trade Confidence Score will update in the next nightly recalculation.',
      user: updatedUser,
      kycCompletenessScore,
      scoreBreakdown: {
        phoneVerified: 30,
        nameUpdated:   (updatedName && !updatedName.startsWith('User ')) ? 5 : 0,
        companyAdded:  (updatedCompany && updatedCompany.trim()) ? 10 : 0,
        locationAdded: (updatedLocation && updatedLocation.trim()) ? 5 : 0,
        gstProvided:   (updatedGST && updatedGST.trim()) ? 25 : 0,
        udyamProvided: (updatedUdyam && updatedUdyam.trim()) ? 20 : 0,
        bothBonus:     (updatedGST && updatedUdyam) ? 5 : 0,
      },
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
