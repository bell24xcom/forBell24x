import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const v2Url = process.env.BELL24H_V2_URL || '';
  return NextResponse.json({
    success: true,
    configured: !!v2Url,
    v2Url: v2Url || null,
  });
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const v2Url  = (body.v2Url  || process.env.BELL24H_V2_URL           || '').replace(/\/$/, '');
    const apiKey =  body.apiKey || process.env.BELL24H_V2_EXPORT_KEY     || '';

    if (!v2Url) {
      return NextResponse.json(
        { success: false, error: 'bell24h-v2 URL not set. Add BELL24H_V2_URL to environment variables.' },
        { status: 400 },
      );
    }

    let imported = 0;
    let skipped  = 0;
    const errors: string[] = [];
    let page     = 1;
    let hasMore  = true;

    while (hasMore) {
      const endpoint = new URL(`${v2Url}/api/neon/suppliers`);
      endpoint.searchParams.set('page',  String(page));
      endpoint.searchParams.set('limit', '100');

      let res: Response;
      try {
        res = await fetch(endpoint.toString(), {
          headers: {
            ...(apiKey ? { 'x-api-key': apiKey, Authorization: `Bearer ${apiKey}` } : {}),
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(20_000),
        });
      } catch (fetchErr) {
        errors.push(`Network error on page ${page}: ${fetchErr instanceof Error ? fetchErr.message : 'timeout'}`);
        break;
      }

      if (!res.ok) {
        errors.push(`bell24h-v2 returned HTTP ${res.status} on page ${page}`);
        break;
      }

      const json = await res.json();
      const suppliers: Record<string, unknown>[] = json.suppliers || json.users || [];

      if (suppliers.length === 0) break;

      for (const s of suppliers) {
        const company = String(s.company || s.name || '').trim();
        if (!company) { skipped++; continue; }

        const location = String(s.location || '');
        const city     = location.split(',')[0].trim();

        try {
          const exists = await prisma.user.findFirst({
            where: {
              company: company,
              ...(city ? { location: { contains: city } } : {}),
            },
          });

          if (exists) { skipped++; continue; }

          const prefs = (s.preferences ?? {}) as Record<string, unknown>;
          const cats: string[] = Array.isArray(prefs.categories)
            ? (prefs.categories as string[])
            : s.category ? [String(s.category)] : [];

          const rawPhone = String(s.phone || '').replace(/\D/g, '');
          const phone    = rawPhone.length >= 10 ? rawPhone.slice(-10) : null;

          await prisma.user.create({
            data: {
              name:         String(s.name || company),
              company,
              email:        s.email   ? String(s.email)   : null,
              phone,
              role:         'SUPPLIER',
              location:     location  || null,
              gstNumber:    s.gstNumber ? String(s.gstNumber) : null,
              isActive:     true,
              isVerified:   false,
              isClaimed:    false,
              importedFrom: 'bell24h_v2',
              trustScore:   s.gstNumber ? 20 : 10,
              preferences:  cats.length > 0 ? { categories: cats } : undefined,
            },
          });
          imported++;
        } catch (e) {
          errors.push(`${company}: ${e instanceof Error ? e.message : 'unknown'}`);
          skipped++;
        }
      }

      const pg     = json.pagination || {};
      const pages  = Number(pg.pages || 1);
      hasMore      = page < pages && suppliers.length >= 100;
      page++;
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.slice(0, 10),
      message: `Pulled ${imported} new contacts from bell24h-v2. ${skipped} skipped (duplicates).`,
    });
  } catch (error) {
    console.error('[pull-v2]', error);
    return NextResponse.json(
      { success: false, error: 'Pull failed: ' + (error instanceof Error ? error.message : 'unknown') },
      { status: 500 },
    );
  }
}
