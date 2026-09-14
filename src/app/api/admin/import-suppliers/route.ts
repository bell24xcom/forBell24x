/**
 * POST /api/admin/import-suppliers
 * Bulk import unclaimed supplier profiles for marketplace seeding.
 * Admin only. Max 500 per import.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { importDiscoverySuppliers } from '@/src/lib/discovery/ingest';
import type { SupplierImportInput } from '@/src/lib/discovery/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json();
    const suppliers: SupplierImportInput[] = body.suppliers || [];

    if (!Array.isArray(suppliers) || suppliers.length === 0) {
      return NextResponse.json({ success: false, error: 'suppliers array is required' }, { status: 400 });
    }

    if (suppliers.length > 500) {
      return NextResponse.json({ success: false, error: 'Maximum 500 suppliers per import' }, { status: 400 });
    }

    const result = await importDiscoverySuppliers(suppliers, { source: 'import' });

    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors.slice(0, 10),
      message: `Imported ${result.imported} suppliers. ${result.skipped} skipped (duplicates or invalid).`,
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
