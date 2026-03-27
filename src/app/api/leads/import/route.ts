import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { classifyLead } from '@/lib/demand-engine';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/import
 * Accepts leads from any external source (Apify, PhantomBuster, manual CSV, webhook).
 * Each lead is classified by AI and stored in external_leads for processing.
 *
 * Body: { leads: Array<{ rawText, source, name?, company?, phone?, email?, location? }> }
 * OR single: { rawText, source, name?, company?, phone?, email?, location? }
 *
 * Protected by CRON_SECRET or internal-use header.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth — accept CRON_SECRET or x-internal-key header
    const secret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization') || request.headers.get('x-internal-key');
    if (secret && authHeader !== `Bearer ${secret}` && authHeader !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const rawLeads = Array.isArray(body.leads) ? body.leads : [body];

    if (rawLeads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads provided' }, { status: 400 });
    }

    const results = { imported: 0, skipped: 0, errors: 0 };

    for (const lead of rawLeads.slice(0, 100)) { // max 100 per batch
      if (!lead.rawText || lead.rawText.trim().length < 10) {
        results.skipped++;
        continue;
      }

      try {
        // AI classification (fast, non-blocking for large batches)
        const classified = await classifyLead(lead.rawText);

        await prisma.externalLead.create({
          data: {
            source: lead.source ?? 'manual',
            rawText: lead.rawText.trim().slice(0, 2000),
            name: lead.name ?? null,
            company: lead.company ?? null,
            phone: lead.phone ?? null,
            email: lead.email ?? null,
            location: classified.location ?? lead.location ?? null,
            category: classified.category,
            requirement: classified.requirement,
            budgetHint: classified.budgetHint,
            status: 'new',
          },
        });

        results.imported++;
      } catch (e) {
        console.error('[Leads] Import error:', e);
        results.errors++;
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('[Leads] Import failed:', error);
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
}

/**
 * GET /api/leads/import — returns pipeline status
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [total, pending, converted, today] = await Promise.all([
    prisma.externalLead.count(),
    prisma.externalLead.count({ where: { status: 'new' } }),
    prisma.externalLead.count({ where: { status: 'converted' } }),
    prisma.externalLead.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
  ]);

  const bySource = await prisma.externalLead.groupBy({
    by: ['source'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  return NextResponse.json({
    success: true,
    pipeline: { total, pending, converted, today },
    bySource: bySource.map(s => ({ source: s.source, count: s._count.id })),
  });
}
