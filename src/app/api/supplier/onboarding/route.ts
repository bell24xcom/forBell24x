import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const body = await req.json();
    const {
      company, businessType, gstNumber, gstVerified,
      udyamNumber, yearsInBusiness, categories,
      city, state, pinCode, description,
    } = body;

    if (!company?.trim()) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    if (!categories?.length) return NextResponse.json({ error: 'Select at least one category' }, { status: 400 });
    if (!city?.trim()) return NextResponse.json({ error: 'City is required' }, { status: 400 });

    // Build existing preferences to merge with new onboarding data
    const existingUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { company: true, gstNumber: true, udyamNumber: true, location: true, preferences: true },
    });
    const existingPrefs = (existingUser?.preferences as Record<string, unknown>) ?? {};

    const newPreferences = {
      ...existingPrefs,
      businessType: businessType || 'Manufacturer',
      categories,
      pinCode: pinCode || null,
      yearsInBusiness: yearsInBusiness || null,
      description,
      onboardingComplete: true,
      onboardingCompletedAt: new Date().toISOString(),
    };

    // Calculate trust score delta
    let trustBonus = 0;
    if (gstNumber && gstVerified) trustBonus += 30;
    else if (gstNumber) trustBonus += 15; // self-reported
    if (udyamNumber) trustBonus += 10;
    if (description && description.length > 50) trustBonus += 10;
    if (categories.length >= 2) trustBonus += 5;

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        company: company.trim(),
        gstNumber: gstNumber?.trim() || undefined,
        udyamNumber: udyamNumber?.trim() || undefined,
        location: `${city.trim()}, ${state}`,
        preferences: newPreferences,
        // Increment trust score (cap at 100)
        trustScore: {
          increment: trustBonus,
        },
        // Role should be SUPPLIER for onboarding
        role: 'SUPPLIER',
      },
      select: { id: true, company: true, trustScore: true },
    });

    // Cap trust score at 100
    if (updatedUser.trustScore > 100) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { trustScore: 100 },
      });
    }

    const { recordProfileLifeEvents } = await import('@/src/lib/bom/profile-events');
    recordProfileLifeEvents(
      user.userId,
      {
        company: existingUser?.company,
        gstNumber: existingUser?.gstNumber,
        udyamNumber: existingUser?.udyamNumber,
        location: existingUser?.location,
        preferences: existingPrefs as import('@/lib/supplier-products').SupplierPreferences,
      },
      {
        company: company.trim(),
        gstNumber: gstNumber?.trim(),
        udyamNumber: udyamNumber?.trim(),
        location: `${city.trim()}, ${state}`,
        preferences: { ...existingPrefs, ...newPreferences, state } as import('@/lib/supplier-products').SupplierPreferences,
      },
    );

    return NextResponse.json({
      success: true,
      message: 'Profile setup complete',
      trustScore: Math.min(updatedUser.trustScore, 100),
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
