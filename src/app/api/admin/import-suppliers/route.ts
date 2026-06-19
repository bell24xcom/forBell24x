/**
 * POST /api/admin/import-suppliers
 * Bulk import unclaimed supplier profiles for marketplace seeding.
 * Admin only. Max 500 per import.
 */
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

interface SupplierInput {
  company: string;
  category: string;
  city: string;
  state?: string;
  gstNumber?: string;
  phone?: string;
  email?: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json();
    const suppliers: SupplierInput[] = body.suppliers || [];

    if (!Array.isArray(suppliers) || suppliers.length === 0) {
      return NextResponse.json({ success: false, error: 'suppliers array is required' }, { status: 400 });
    }

    if (suppliers.length > 500) {
      return NextResponse.json({ success: false, error: 'Maximum 500 suppliers per import' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const s of suppliers) {
      if (!s.company?.trim() || !s.category?.trim() || !s.city?.trim()) {
        skipped++;
        continue;
      }

      try {
        // Check for duplicate by company name + city
        const existing = await prisma.user.findFirst({
          where: {
            company: s.company.trim(),
            location: { contains: s.city.trim() },
          },
        });

        if (existing) { skipped++; continue; }

        await prisma.user.create({
          data: {
            name: s.company.trim(),
            company: s.company.trim(),
            role: 'SUPPLIER',
            location: s.state ? `${s.city.trim()}, ${s.state.trim()}` : s.city.trim(),
            gstNumber: s.gstNumber?.trim() || null,
            phone: s.phone?.trim() || null,
            email: s.email?.trim() || null,
            isActive: true,
            isVerified: false,
            isClaimed: false,
            trustScore: 0,
            claimToken: randomUUID(),
            importedFrom: 'admin_import',
            preferences: {
              categories: [s.category.trim()],
              description: s.description || null,
              onboardingComplete: false,
            },
          },
        });
        imported++;
      } catch (e) {
        errors.push(`${s.company}: ${e instanceof Error ? e.message : 'unknown error'}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.slice(0, 10), // return first 10 errors
      message: `Imported ${imported} suppliers. ${skipped} skipped (duplicates or invalid).`,
    });
  } catch (error) {
    console.error('Import suppliers error:', error);
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const count = await prisma.user.count({ where: { isClaimed: false } });
  return NextResponse.json({ success: true, unclaimedCount: count });
}
