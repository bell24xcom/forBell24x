import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { ALL_CATEGORIES } from '@/app/data/categories';

export const dynamic = 'force-dynamic';

const CITIES = [
  'Mumbai', 'Pune', 'Thane', 'Nashik', 'Aurangabad',
  'Delhi', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad',
  'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum',
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tirupur',
  'Hyderabad', 'Secunderabad', 'Warangal', 'Karimnagar', 'Nizamabad',
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
  'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner',
  'Kolkata', 'Durgapur', 'Siliguri', 'Asansol', 'Howrah',
  'Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain',
  'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut',
  'Nagpur', 'Amravati', 'Akola', 'Latur', 'Solapur',
  'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
  'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga',
  'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
];

const URGENCIES = ['LOW', 'NORMAL', 'NORMAL', 'HIGH', 'HIGH', 'URGENT'] as const;
const UNITS     = ['pieces', 'kg', 'tons', 'meters', 'units', 'boxes', 'liters', 'sets'] as const;
const TIMELINES = ['7 days', '10 days', '14 days', '21 days', '30 days', '45 days', '60 days'];

const TEMPLATES = [
  'Looking for reliable {sub} supplier for regular B2B orders. Delivery to {city}. Competitive pricing expected. Budget approx ₹{budget}.',
  'Require high-quality {sub} products for manufacturing unit in {city}. Monthly supply needed. Timeline: {timeline}.',
  'Need {sub} urgently for ongoing project in {city}. Please quote best price. Budget up to ₹{budget}.',
  'Sourcing {sub} for export-quality production. Supplier must be GST-registered. Delivery: {city} within {timeline}.',
  'Bulk requirement of {sub} for {city} facility. Looking for long-term vendor. Estimated annual value ₹{budget}.',
  'Request for {sub} quotation — factory in {city}. Minimum 3 months contract preferred. Urgency: immediate response needed.',
  'Procurement of {sub} for upcoming {city} project. Need detailed quote with GST invoice and payment terms.',
  'Seeking established {sub} vendors in/near {city}. Quality certification mandatory. Please share catalogue and price list.',
  'We are a {city}-based company seeking {sub} at competitive rates. Immediate purchase order on approval of sample.',
];

function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toSlug(text: string, suffix: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) + '-' + suffix;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillTemplate(sub: string, city: string): string {
  const budget   = (rand(10, 900) * 1000).toLocaleString('en-IN');
  const timeline = pick(TIMELINES);
  return pick(TEMPLATES)
    .replace(/{sub}/g, sub)
    .replace(/{city}/g, city)
    .replace(/{budget}/g, budget)
    .replace(/{timeline}/g, timeline);
}

/**
 * Flatten ALL_CATEGORIES into a list of seed targets.
 * Each entry = { category: parentName, subcategory: subName }
 * We seed 1 RFQ per subcategory + 1 parent-level RFQ per parent category.
 * Total ≈ 325 RFQs covering all 450+ category slots.
 */
function buildSeedTargets(): Array<{ title: string; category: string; priority: number }> {
  const targets: Array<{ title: string; category: string; priority: number }> = [];

  for (const cat of ALL_CATEGORIES) {
    // 1 RFQ at parent category level
    targets.push({
      title: `${cat.name} — Bulk Procurement`,
      category: cat.name,
      priority: cat.trending ? 5 : 3,
    });

    // 1 RFQ per subcategory
    for (const sub of cat.subcategories) {
      targets.push({
        title: `${sub} — Supplier Required`,
        category: sub,
        priority: 3,
      });
    }
  }

  return targets;
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const [seeded, real] = await Promise.all([
    prisma.rFQ.count({ where: { isSeeded: true } }),
    prisma.rFQ.count({ where: { isSeeded: false } }),
  ]);

  const targets = buildSeedTargets();
  return NextResponse.json({ success: true, seeded, real, availableToSeed: targets.length });
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

    const now       = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 86400000); // 30 days

    const targets = buildSeedTargets();

    const rfqsToCreate = targets.map((target, i) => {
      const city = pick(CITIES);
      return {
        title:       target.title,
        slug:        toSlug(target.title, String(i + 1)),
        description: fillTemplate(target.category, city),
        category:    target.category,
        quantity:    String(rand(50, 5000)),
        unit:        pick(UNITS),
        status:      'ACTIVE' as const,
        urgency:     pick(URGENCIES),
        minBudget:   rand(10, 300) * 1000,
        maxBudget:   rand(300, 2000) * 1000,
        location:    city,
        timeline:    pick(TIMELINES),
        isPublic:    true,
        isSeeded:    true,
        priority:    target.priority,
        createdBy,
        expiresAt,
        tags:        [target.category.split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''), 'b2b', 'india'],
      };
    });

    // Batch insert in chunks of 50 to avoid query size limits
    const CHUNK = 50;
    let created = 0;
    for (let i = 0; i < rfqsToCreate.length; i += CHUNK) {
      const chunk = rfqsToCreate.slice(i, i + CHUNK);
      const result = await prisma.rFQ.createMany({ data: chunk, skipDuplicates: false });
      created += result.count;
    }

    const seeded = await prisma.rFQ.count({ where: { isSeeded: true } });
    return NextResponse.json({ success: true, created, seeded });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}
