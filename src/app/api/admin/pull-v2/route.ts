/**
 * GET  /api/admin/pull-v2  — config check
 * POST /api/admin/pull-v2  — import CRM leads from bell24h-v2
 *
 * Auth mechanism (verified from bell24h-v2/src/middleware/adminGuard.ts):
 *   Header: x-admin-key: <value>   where value === bell24h-v2's ADMIN_API_KEY env var
 *   BELL24H_V2_EXPORT_KEY here must match ADMIN_API_KEY over there.
 *
 * Endpoint: POST {BELL24H_V2_URL}/api/export/crm
 *   Returns: { success: true, data: { count: N, csv: "..." } }
 *   No pagination — returns up to 500 leads in a single response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/** Minimal RFC-4180 CSV parser that handles double-quoted fields. */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    const values: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === ',' && !inQ) {
        values.push(cur); cur = '';
      } else {
        cur += c;
      }
    }
    values.push(cur);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim(); });
    return row;
  });
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const v2Url  = process.env.BELL24H_V2_URL        || '';
  const hasKey = !!process.env.BELL24H_V2_EXPORT_KEY;

  return NextResponse.json({
    success: true,
    configured: !!(v2Url && hasKey),
    v2Url:  v2Url  || null,
    hasKey,
  });
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body   = await req.json().catch(() => ({}));
    const v2Url  = (body.v2Url  || process.env.BELL24H_V2_URL        || '').replace(/\/$/, '');
    const apiKey =  body.apiKey || process.env.BELL24H_V2_EXPORT_KEY || '';

    if (!v2Url) {
      return NextResponse.json(
        { success: false, error: 'bell24h-v2 URL not set. Add BELL24H_V2_URL to Vercel env vars.' },
        { status: 400 },
      );
    }
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Export key not set. Add BELL24H_V2_EXPORT_KEY (must match ADMIN_API_KEY in bell24h-v2 env).' },
        { status: 400 },
      );
    }

    const endpoint = `${v2Url}/api/export/crm`;

    // ── Call bell24h-v2 export endpoint ──────────────────────────────────────
    let res: Response;
    try {
      res = await fetch(endpoint, {
        method:  'POST',
        headers: {
          'x-admin-key':    apiKey,          // required — see adminGuard.ts
          'Content-Type':   'application/json',
          'Accept':         'application/json',
        },
        body:   JSON.stringify({ format: 'csv' }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (fetchErr) {
      return NextResponse.json(
        { success: false, error: `Network error reaching ${endpoint}: ${fetchErr instanceof Error ? fetchErr.message : 'timeout'}` },
        { status: 502 },
      );
    }

    if (res.status === 401) {
      return NextResponse.json(
        { success: false, error: `Authentication failed (401) at ${endpoint}. Check BELL24H_V2_EXPORT_KEY matches bell24h-v2's ADMIN_API_KEY env var.` },
        { status: 401 },
      );
    }
    if (res.status === 403) {
      return NextResponse.json(
        { success: false, error: `Forbidden (403) at ${endpoint} — API key is incorrect.` },
        { status: 403 },
      );
    }
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      return NextResponse.json(
        { success: false, error: `${endpoint} returned HTTP ${res.status}: ${errBody.slice(0, 300)}` },
        { status: 502 },
      );
    }

    const json = await res.json();
    if (!json.success) {
      return NextResponse.json(
        { success: false, error: `Export failed: ${json.error || 'Unknown error from bell24h-v2'}` },
        { status: 502 },
      );
    }

    const csvText  = (json.data?.csv  as string)  ?? '';
    const rowCount = (json.data?.count as number)  ?? 0;

    if (!csvText || rowCount === 0) {
      return NextResponse.json({
        success: true, imported: 0, skipped: 0, errors: [],
        message: 'bell24h-v2 export returned 0 leads. Nothing to import.',
      });
    }

    // ── Parse CSV and upsert into Prisma ─────────────────────────────────────
    // CSV columns: id, company_name, contact_name, phone, whatsapp_number,
    //              email, website, city, category, source, quality_score,
    //              campaign_eligible, outreach_status, lifecycle_state, ...
    const rows = parseCsv(csvText);

    let imported = 0;
    let skipped  = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const company = row.company_name?.trim();
      if (!company) { skipped++; continue; }

      const city       = row.city?.trim() || '';
      const rawPhone   = (row.phone || row.whatsapp_number || '').replace(/\D/g, '').slice(-10);
      const phone      = rawPhone.length === 10 ? rawPhone : null;
      const category   = row.category?.trim() || '';

      try {
        const exists = await prisma.user.findFirst({
          where: {
            company,
            ...(city ? { location: { contains: city } } : {}),
          },
        });

        if (exists) { skipped++; continue; }

        await prisma.user.create({
          data: {
            name:         row.contact_name?.trim() || company,
            company,
            email:        row.email?.trim()  || null,
            phone,
            role:         'SUPPLIER',
            location:     city                || null,
            isActive:     true,
            isVerified:   false,
            isClaimed:    false,
            importedFrom: 'bell24h_v2',
            trustScore:   10,
            preferences:  category ? { categories: [category] } : undefined,
          },
        });
        imported++;
      } catch (e) {
        if (errors.length < 10) {
          errors.push(`${company}: ${e instanceof Error ? e.message : 'unknown'}`);
        }
        skipped++;
      }
    }

    const capNote = rowCount >= 500
      ? ` (bell24h-v2 export is capped at 500 rows — re-run with filters to get remaining leads)`
      : '';

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
      rowCount,
      message: `Pulled ${imported} new contacts from bell24h-v2 (${rowCount} in export). ${skipped} skipped (duplicates or no company name).${capNote}`,
    });
  } catch (error) {
    console.error('[pull-v2]', error);
    return NextResponse.json(
      { success: false, error: 'Pull failed: ' + (error instanceof Error ? error.message : 'unknown') },
      { status: 500 },
    );
  }
}
