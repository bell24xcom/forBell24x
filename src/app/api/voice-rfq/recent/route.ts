import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatBudget(minBudget: number | null, maxBudget: number | null): string {
  if (minBudget && maxBudget) return `₹${minBudget.toLocaleString('en-IN')} - ₹${maxBudget.toLocaleString('en-IN')}`;
  if (minBudget) return `₹${minBudget.toLocaleString('en-IN')}+`;
  return 'To be discussed';
}

function toDisplayStatus(status: string): 'draft' | 'active' | 'quoted' | 'completed' {
  if (status === 'OPEN' || status === 'ACTIVE') return 'active';
  if (status === 'QUOTED') return 'quoted';
  if (status === 'COMPLETED' || status === 'ACCEPTED') return 'completed';
  return 'draft';
}

// Get recent voice-generated RFQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '10'));

    const rows = await prisma.rFQ.findMany({
      where: { type: 'voice' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        quantity: true,
        location: true,
        requirements: true,
        timeline: true,
        minBudget: true,
        maxBudget: true,
        status: true,
        createdAt: true,
      },
    });

    const rfqs = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      category: r.category,
      quantity: r.quantity,
      location: r.location,
      specifications: r.requirements ? [r.requirements] : [],
      timeline: r.timeline || 'flexible',
      budget: formatBudget(r.minBudget, r.maxBudget),
      status: toDisplayStatus(r.status),
      createdAt: r.createdAt.toISOString(),
      createdVia: 'voice' as const,
    }));

    return NextResponse.json({
      success: true,
      rfqs,
      total: rfqs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching recent voice RFQs:', error);
    // Never fall back to fabricated data — an empty list is the honest answer
    // when the database is unavailable.
    return NextResponse.json({
      success: true,
      rfqs: [],
      total: 0,
      timestamp: new Date().toISOString(),
    });
  }
}
