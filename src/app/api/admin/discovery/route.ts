/**
 * Discovery Engine admin API
 * GET  — discovered suppliers, stats, recent events, readiness
 * POST — run discovery (scrape or manual batch) → unclaimed Users
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { importDiscoverySuppliers, mapScrapedToImport } from '@/src/lib/discovery/ingest';
import { scrapePublicWeb } from '@/src/lib/discovery/scrape';
import { logDiscoveryEvent, DISCOVERY_EVENT_TYPES } from '@/src/lib/discovery/events';
import {
  buildDiscoveryReadinessBoard,
  discoveryReadinessScoreFromBoard,
} from '@/src/lib/discovery/readiness-probe';
import { DISCOVERY_IMPORTED_FROM_PREFIX, type SupplierImportInput } from '@/src/lib/discovery/types';
import { addRecipients } from '@/src/lib/outreach/campaignService';

export const dynamic = 'force-dynamic';

function categoryFromPreferences(prefs: unknown): string {
  if (!prefs || typeof prefs !== 'object') return '—';
  const cats = (prefs as { categories?: string[] }).categories;
  return Array.isArray(cats) && cats[0] ? cats[0] : '—';
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '25', 10));
    const skip = (page - 1) * limit;
    const claimedFilter = searchParams.get('claimed'); // 'true' | 'false' | null

    const where: Record<string, unknown> = {
      role: 'SUPPLIER',
      OR: [
        { importedFrom: { startsWith: DISCOVERY_IMPORTED_FROM_PREFIX } },
        { importedFrom: 'admin_import' },
      ],
    };
    if (claimedFilter === 'true') where.isClaimed = true;
    if (claimedFilter === 'false') where.isClaimed = false;

    const [companies, total, claimedCount, unclaimedCount, recentEvents] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          company: true,
          name: true,
          phone: true,
          email: true,
          location: true,
          trustScore: true,
          isClaimed: true,
          claimedAt: true,
          importedFrom: true,
          createdAt: true,
          preferences: true,
          outreachRecipient: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
            select: {
              state: true,
              sentAt: true,
              deliveredAt: true,
              failedAt: true,
              campaign: { select: { id: true, name: true, status: true, channel: true } },
            },
          },
          claimInvitations: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { status: true, createdAt: true, claimedAt: true },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.count({
        where: { ...where, isClaimed: true },
      }),
      prisma.user.count({
        where: { ...where, isClaimed: false },
      }),
      prisma.interactionMemory.findMany({
        where: { actionType: { in: [...DISCOVERY_EVENT_TYPES] } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          actionType: true,
          userId: true,
          metadata: true,
          createdAt: true,
        },
      }),
    ]);

    const rows = companies.map((u) => {
      const recipient = u.outreachRecipient[0];
      const invitation = u.claimInvitations[0];
      let invitationStatus = 'none';
      if (u.isClaimed) invitationStatus = 'claimed';
      else if (recipient?.state === 'SENT' || recipient?.sentAt) invitationStatus = 'sent';
      else if (recipient?.state === 'QUEUED') invitationStatus = 'queued';
      else if (recipient) invitationStatus = recipient.state.toLowerCase();
      else if (invitation) invitationStatus = invitation.status.toLowerCase();

      return {
        id: u.id,
        company: u.company || u.name,
        phone: u.phone,
        email: u.email,
        location: u.location,
        trustScore: u.trustScore,
        isClaimed: u.isClaimed,
        claimedAt: u.claimedAt,
        importedFrom: u.importedFrom,
        category: categoryFromPreferences(u.preferences),
        createdAt: u.createdAt,
        invitationStatus,
        campaign: recipient?.campaign ?? null,
        crmHref: `/admin/crm/${u.id}`,
      };
    });

    const readinessBoard = await buildDiscoveryReadinessBoard();
    const readiness = discoveryReadinessScoreFromBoard(readinessBoard);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        claimed: claimedCount,
        unclaimed: unclaimedCount,
        readinessScore: readiness.score,
      },
      readiness: readinessBoard,
      readinessSummary: readiness,
      companies: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      recentEvents,
    });
  } catch (error) {
    console.error('[Discovery GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load discovery data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const campaignId = typeof body.campaignId === 'string' ? body.campaignId : undefined;
    const manualSuppliers: SupplierImportInput[] = Array.isArray(body.suppliers) ? body.suppliers : [];

    let toImport: SupplierImportInput[] = [];

    if (manualSuppliers.length > 0) {
      toImport = manualSuppliers;
    } else if (query) {
      const scraped = await scrapePublicWeb(query);
      const fallbackCategory = category || 'General';
      for (const row of scraped) {
        const mapped = mapScrapedToImport(
          { ...row, location: row.location || city || undefined },
          fallbackCategory,
        );
        if (mapped) toImport.push(mapped);
      }
    } else if (category && city) {
      const searchQuery = `${category} suppliers ${city} India`;
      const scraped = await scrapePublicWeb(searchQuery);
      for (const row of scraped) {
        const mapped = mapScrapedToImport({ ...row, location: row.location || city }, category);
        if (mapped) toImport.push(mapped);
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide suppliers[], query, or category+city' },
        { status: 400 },
      );
    }

    if (toImport.length > 500) {
      return NextResponse.json({ success: false, error: 'Maximum 500 suppliers per run' }, { status: 400 });
    }

    const result = await importDiscoverySuppliers(toImport, {
      source: manualSuppliers.length > 0 ? 'manual' : 'scrapegraph',
      sourceQuery: query || (category && city ? `${category} ${city}` : undefined),
      dryRun,
      adminUserId: auth.userId,
    });

    let outreachQueued = 0;
    if (!dryRun && campaignId && result.importedIds.length > 0) {
      const addResult = await addRecipients(campaignId, result.importedIds);
      outreachQueued = addResult.added;
      for (const id of result.importedIds) {
        logDiscoveryEvent('outreach_queued', {
          userId: id,
          metadata: { campaignId, source: 'discovery_run' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
      outreachQueued,
      message: dryRun
        ? `Dry run: ${result.imported} would be imported, ${result.skipped} skipped`
        : `Imported ${result.imported} suppliers. ${result.skipped} skipped.`,
    });
  } catch (error) {
    console.error('[Discovery POST]', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Discovery run failed' },
      { status: 500 },
    );
  }
}
