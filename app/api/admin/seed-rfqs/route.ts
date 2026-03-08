import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  'Steel & Metals', 'Industrial Machinery', 'Textiles & Fabrics',
  'Packaging Materials', 'Electrical Components', 'Chemicals',
  'Construction Materials', 'Auto Parts & Components',
  'Plastics & Polymers', 'Food Processing Equipment',
  'Pharma & Healthcare', 'Electronics & Semiconductors',
  'Paper & Printing', 'Agriculture Equipment', 'Rubber Products',
  'Glass & Ceramics', 'Wood & Furniture', 'Leather Products',
  'Office Supplies', 'Safety Equipment',
];

const CITIES = [
  'Mumbai', 'Pune', 'Thane', 'Delhi', 'Bangalore',
  'Chennai', 'Hyderabad', 'Ahmedabad', 'Surat', 'Jaipur',
  'Kolkata', 'Indore', 'Lucknow', 'Nagpur', 'Coimbatore',
];

const URGENCIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

const TEMPLATES = [
  'Looking for reliable {category} supplier for regular orders. Delivery to {city}. Competitive pricing expected. Budget approx ₹{budget}.',
  'Require high-quality {category} products for manufacturing unit. Monthly supply needed in {city}. Timeline: {days} days.',
  'Need {category} urgently for ongoing project in {city}. Please quote best price. Budget up to ₹{budget}.',
  'Sourcing {category} for export-quality production. Supplier must be GST-registered. Delivery: {city} within {days} days.',
  'Bulk requirement of {category} for {city} facility. Looking for long-term vendor. Estimated annual value ₹{budget}.',
  'Request for {category} quotation — factory in {city}. Minimum 3 months contract. Urgency: immediate response needed.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillTemplate(tpl: string, category: string, city: string): string {
  const budget = (rand(10, 900) * 1000).toLocaleString('en-IN');
  const days = pick([7, 10, 14, 21, 30]);
  return tpl
    .replace(/{category}/g, category)
    .replace(/{city}/g, city)
    .replace(/{budget}/g, budget)
    .replace(/{days}/g, String(days));
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const seeded = await prisma.rFQ.count({ where: { isSeeded: true } });
  const real   = await prisma.rFQ.count({ where: { isSeeded: false } });

  return NextResponse.json({ success: true, seeded, real });
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const { action } = await request.json();

  if (action === 'clear_all') {
    const { count } = await prisma.rFQ.deleteMany({ where: { isSeeded: true } });
    return NextResponse.json({ success: true, cleared: count });
  }

  if (action === 'seed_all') {
    // Find admin user as the "creator" for seeded RFQs
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const createdBy = adminUser?.id ?? null;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 86400000); // 30 days

    const rfqsToCreate = CATEGORIES.flatMap(category => [
      // RFQ 1 for this category
      {
        title: `${category} — Bulk Order Request`,
        description: fillTemplate(pick(TEMPLATES), category, pick(CITIES)),
        category,
        quantity: String(rand(100, 5000)),
        unit: pick(['pieces', 'kg', 'tons', 'meters', 'units', 'boxes']),
        status: 'ACTIVE' as const,
        urgency: pick(URGENCIES),
        minBudget: rand(10, 200) * 1000,
        maxBudget: rand(200, 900) * 1000,
        location: pick(CITIES),
        timeline: `${rand(7, 30)} days`,
        isPublic: true,
        isSeeded: true,
        priority: 3,
        createdBy,
        expiresAt,
        tags: [category.split(' ')[0].toLowerCase(), 'bulk', 'b2b'],
      },
      // RFQ 2 for this category (different city/urgency)
      {
        title: `${category} Supplier Required — Urgent`,
        description: fillTemplate(pick(TEMPLATES), category, pick(CITIES)),
        category,
        quantity: String(rand(50, 2000)),
        unit: pick(['pieces', 'kg', 'tons', 'liters', 'units']),
        status: 'ACTIVE' as const,
        urgency: pick(['HIGH', 'URGENT'] as const),
        minBudget: rand(50, 500) * 1000,
        maxBudget: rand(500, 2000) * 1000,
        location: pick(CITIES),
        timeline: `${rand(3, 14)} days`,
        isPublic: true,
        isSeeded: true,
        priority: 5,
        createdBy,
        expiresAt,
        tags: [category.split(' ')[0].toLowerCase(), 'urgent', 'india'],
      },
    ]);

    await prisma.rFQ.createMany({ data: rfqsToCreate, skipDuplicates: false });

    const seeded = await prisma.rFQ.count({ where: { isSeeded: true } });
    return NextResponse.json({
      success: true,
      created: rfqsToCreate.length,
      seeded,
    });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}
