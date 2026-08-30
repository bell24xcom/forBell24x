/**
 * First 10 Supplier Dashboard — /api/admin/first10
 *
 * Returns a founder-facing dashboard view of the first 10 suppliers in the
 * onboarding cohort. Tracks: registration, profile completion, verification
 * status, credit balance, RFQs viewed, and quotes submitted.
 *
 * GET  /api/admin/first10          — full dashboard with per-supplier rows + summary
 * GET  /api/admin/first10?limit=N  — first N suppliers by registration date
 *
 * Auth: ADMIN role required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)));

  // Fetch earliest registered SUPPLIER users
  const suppliers = await prisma.user.findMany({
    where: { role: 'SUPPLIER' },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: {
      id: true,
      name: true,
      phone: true,
      company: true,
      location: true,
      gstNumber: true,
      udyamNumber: true,
      isVerified: true,
      verificationStatus: true,
      trustScore: true,
      createdAt: true,
      lastLoginAt: true,
      preferences: true,
      _count: {
        select: {
          quotes: true,
          rfqs: true,
        },
      },
    },
  });

  // Fetch credit balances for all supplier IDs in one query
  const supplierIds = suppliers.map(s => s.id);
  const creditRows = await prisma.userCredits.findMany({
    where: { userId: { in: supplierIds } },
    select: { userId: true, credits: true, spent: true },
  });
  const creditMap = Object.fromEntries(creditRows.map(c => [c.userId, c]));

  // Build dashboard rows
  const rows = suppliers.map(s => {
    const prefs = (s.preferences as Record<string, unknown>) ?? {};
    const profileComplete = !!(
      s.company?.trim() &&
      s.location?.trim() &&
      (prefs.categories as unknown[])?.length > 0
    );
    const hasGst     = !!(s.gstNumber?.trim() || s.udyamNumber?.trim());
    const credits    = creditMap[s.id];

    return {
      id:                  s.id,
      name:                s.name ?? '—',
      phone:               s.phone ?? '—',
      company:             s.company ?? '—',
      location:            s.location ?? '—',
      registeredAt:        s.createdAt.toISOString(),
      lastActiveAt:        s.lastLoginAt?.toISOString() ?? null,
      profileComplete,
      hasGstOrUdyam:       hasGst,
      gstNumber:           s.gstNumber ?? null,
      udyamNumber:         s.udyamNumber ?? null,
      verificationStatus:  s.verificationStatus,
      trustScore:          s.trustScore,
      credits:             credits?.credits ?? 0,
      creditsSpent:        credits?.spent ?? 0,
      rfqsPosted:          s._count.rfqs,
      quotesSubmitted:     s._count.quotes,
      // Completion checklist
      steps: {
        registered:       true,
        profileComplete,
        documentsSubmitted: hasGst,
        verified:          ['GST_VERIFIED', 'MANUAL_VERIFIED'].includes(s.verificationStatus),
        hasCredits:        (credits?.credits ?? 0) > 0,
        quotedAtLeastOnce: s._count.quotes > 0,
      },
    };
  });

  // Summary counts
  const summary = {
    total:             rows.length,
    profileComplete:   rows.filter(r => r.profileComplete).length,
    documentsSubmitted: rows.filter(r => r.hasGstOrUdyam).length,
    pendingReview:     rows.filter(r => r.verificationStatus === 'GST_PENDING').length,
    verified:          rows.filter(r => ['GST_VERIFIED', 'MANUAL_VERIFIED'].includes(r.verificationStatus)).length,
    rejected:          rows.filter(r => r.verificationStatus === 'REJECTED').length,
    withCredits:       rows.filter(r => r.credits > 0).length,
    quotedAtLeastOnce: rows.filter(r => r.quotesSubmitted > 0).length,
  };

  return NextResponse.json({
    success:     true,
    generatedAt: new Date().toISOString(),
    summary,
    suppliers:   rows,
  });
}
