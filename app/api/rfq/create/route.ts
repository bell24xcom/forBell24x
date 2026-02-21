import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { onRFQCreated, checkDailyLimit } from '@/lib/orchestration';
import { sanitizeString, sanitizeText, safePositiveFloat } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const rfqData = await request.json();

    if (!rfqData || !rfqData.title || !rfqData.category) {
      return NextResponse.json(
        { success: false, error: 'Title and category are required' },
        { status: 400 }
      );
    }

    // Authenticate user from cookie or Authorization header
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Rate limit: max 10 RFQs per buyer per day
    const limitCheck = await checkDailyLimit(userId, 'rfq', 10);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Daily RFQ limit reached (${limitCheck.count}/${limitCheck.limit}). Try again tomorrow.` },
        { status: 429 }
      );
    }

    // Sanitize all string inputs
    const title        = sanitizeString(rfqData.title, 200);
    const description  = sanitizeText(rfqData.description, 2000);
    const category     = sanitizeString(rfqData.category, 100);
    const requirements = sanitizeText(rfqData.requirements, 3000);
    const location     = sanitizeString(rfqData.location || 'India', 100);
    const unit         = sanitizeString(rfqData.unit || 'units', 50);
    const timeline     = sanitizeString(rfqData.timeline || '30 days', 100);

    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Title and category are required' },
        { status: 400 }
      );
    }

    // Compute derived fields
    const tags           = extractTags(title, description);
    const expiresAt      = calculateExpiryDate(timeline);
    const priority       = calculatePriority(rfqData.urgency || 'normal', timeline);
    const minBudget      = safePositiveFloat(rfqData.minBudget);
    const maxBudget      = safePositiveFloat(rfqData.maxBudget);
    const estimatedValue = calculateEstimatedValue(
      String(rfqData.minBudget || 0),
      String(rfqData.maxBudget || 0)
    );

    const urgencyMap: Record<string, 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'> = {
      low: 'LOW', normal: 'NORMAL', high: 'HIGH', urgent: 'URGENT',
    };
    const urgency = urgencyMap[(rfqData.urgency || 'normal').toLowerCase()] ?? 'NORMAL';

    // Save to database
    const rfq = await prisma.rFQ.create({
      data: {
        title,
        description,
        category,
        quantity: sanitizeString(String(rfqData.quantity || '1'), 50),
        unit,
        minBudget,
        maxBudget,
        timeline,
        requirements,
        urgency,
        status: 'ACTIVE',
        location,
        tags,
        isPublic: true,
        expiresAt,
        priority,
        estimatedValue,
        createdBy: userId,
      },
    });

    // Fire orchestration in background — never blocks the response
    const buyer = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    }).catch(() => null);

    onRFQCreated(
      { id: rfq.id, title: rfq.title, category: rfq.category, location: rfq.location },
      { id: userId, name: buyer?.name ?? null, email: buyer?.email ?? null }
    ).catch(err => console.error('[Orchestration] onRFQCreated error:', err));

    return NextResponse.json({
      success: true,
      rfq: {
        id: rfq.id,
        title: rfq.title,
        category: rfq.category,
        status: rfq.status,
        createdAt: rfq.createdAt.toISOString(),
        expiresAt: rfq.expiresAt?.toISOString(),
        priority: rfq.priority,
        estimatedValue: rfq.estimatedValue,
        tags: rfq.tags,
      },
      message: 'RFQ created successfully',
    });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    const { errorLogger } = await import('@/lib/errorLogger');
    errorLogger.critical(error, { route: '/api/rfq/create' });
    return NextResponse.json(
      { success: false, error: 'Failed to create RFQ' },
      { status: 500 }
    );
  }
}

function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const knownTags = [
    'urgent', 'bulk', 'custom', 'quality', 'certified', 'branded',
    'steel', 'cotton', 'electronic', 'construction', 'chemical',
    'machinery', 'packaging', 'automotive', 'pharmaceutical',
  ];
  return knownTags.filter(tag => text.includes(tag));
}

function calculateExpiryDate(timeline: string): Date {
  const now = new Date();
  let days = 30;
  if (timeline.includes('week')) {
    days = parseInt(timeline.match(/\d+/)?.[0] || '2') * 7;
  } else if (timeline.includes('month')) {
    days = parseInt(timeline.match(/\d+/)?.[0] || '1') * 30;
  } else if (timeline.includes('day')) {
    days = parseInt(timeline.match(/\d+/)?.[0] || '30');
  }
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

function calculatePriority(urgency: string, timeline: string): number {
  const base: Record<string, number> = { urgent: 5, high: 4, normal: 3, low: 2 };
  let priority = base[urgency.toLowerCase()] ?? 3;
  if (timeline.includes('day') && parseInt(timeline) <= 7) priority = Math.min(priority + 1, 5);
  if (timeline.includes('week') && parseInt(timeline) <= 2) priority = Math.min(priority + 1, 5);
  return priority;
}

function calculateEstimatedValue(minBudget: string, maxBudget: string): number {
  const min = parseFloat(minBudget) || 0;
  const max = parseFloat(maxBudget) || 0;
  if (min > 0 && max > 0) return (min + max) / 2;
  if (min > 0) return min * 1.5;
  if (max > 0) return max * 0.7;
  return 0;
}
