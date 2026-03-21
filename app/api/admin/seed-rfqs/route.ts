import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

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
 * 40 curated realistic Indian B2B seed RFQs.
 * 8 categories × 5 RFQs. Varied cities, budgets, urgencies.
 */
function buildSeedTargets(): Array<{ title: string; category: string; priority: number }> {
  return [
    // Textiles
    { title: 'Cotton Fabric — Bulk Supply Required',           category: 'Textiles',     priority: 5 },
    { title: 'Polyester Yarn — Export Quality Needed',         category: 'Textiles',     priority: 4 },
    { title: 'Dyed Fabric Rolls — Wholesale Buyer',            category: 'Textiles',     priority: 4 },
    { title: 'Ready-Made Garments — Private Label Production', category: 'Textiles',     priority: 5 },
    { title: 'Technical Textiles for Industrial Use',          category: 'Textiles',     priority: 3 },
    // Steel & Metals
    { title: 'MS Steel Rods — Fe500 Construction Grade',       category: 'Steel',        priority: 5 },
    { title: 'Stainless Steel Sheets — Food Grade 304',        category: 'Steel',        priority: 4 },
    { title: 'Aluminium Extrusion Profiles — Bulk Order',      category: 'Metals',       priority: 4 },
    { title: 'Hot Rolled Steel Coils — Bulk Requirement',      category: 'Steel',        priority: 5 },
    { title: 'Copper Wire and Cables — Electrical Grade',      category: 'Metals',       priority: 3 },
    // Packaging
    { title: 'Corrugated Boxes — 5-Ply Export Quality',        category: 'Packaging',    priority: 5 },
    { title: 'HDPE Woven Bags — Agricultural Grade',           category: 'Packaging',    priority: 4 },
    { title: 'PET Bottles — Food Grade 500ml',                 category: 'Packaging',    priority: 4 },
    { title: 'Flexible Laminate Pouches — FMCG Packaging',    category: 'Packaging',    priority: 5 },
    { title: 'Kraft Paper — 200 GSM Industrial Grade',         category: 'Packaging',    priority: 3 },
    // Electronics
    { title: 'PCB Assembly — SMT Contract Manufacturing',      category: 'Electronics',  priority: 5 },
    { title: 'LED Drivers — Bulk Component Sourcing',          category: 'Electronics',  priority: 4 },
    { title: 'Industrial Sensors — Temperature and Pressure',  category: 'Electronics',  priority: 4 },
    { title: 'Power Supply Units — 12V DC Industrial',         category: 'Electronics',  priority: 3 },
    { title: 'Wire Harness Assembly — Automotive Grade',       category: 'Electronics',  priority: 5 },
    // Machinery
    { title: 'CNC Turning Machine — 500mm Bed Capacity',       category: 'Machinery',    priority: 4 },
    { title: 'Industrial Air Compressor — 100 CFM',            category: 'Machinery',    priority: 5 },
    { title: 'Hydraulic Press Machine — 50 Ton',               category: 'Machinery',    priority: 4 },
    { title: 'Conveyor Belt System — Modular Design',          category: 'Machinery',    priority: 3 },
    { title: 'Industrial Pumps — Centrifugal 3HP',             category: 'Machinery',    priority: 4 },
    // Chemicals
    { title: 'Caustic Soda Flakes — Industrial Grade Bulk',    category: 'Chemicals',    priority: 5 },
    { title: 'Titanium Dioxide — Coating and Paint Grade',     category: 'Chemicals',    priority: 4 },
    { title: 'Sodium Silicate — Liquid Form Industrial',       category: 'Chemicals',    priority: 3 },
    { title: 'HDPE Granules — Virgin Grade Supplier',          category: 'Chemicals',    priority: 5 },
    { title: 'Industrial Solvents — Bulk Drum Requirement',    category: 'Chemicals',    priority: 4 },
    // Construction
    { title: 'TMT Steel Bars — Fe550 Grade Urgent',            category: 'Construction', priority: 5 },
    { title: 'AAC Blocks — Lightweight 600x200x200mm',         category: 'Construction', priority: 4 },
    { title: 'Waterproofing Chemicals — Crystalline Type',     category: 'Construction', priority: 4 },
    { title: 'CPVC Pipes — SDR 11 Pressure Class',             category: 'Construction', priority: 3 },
    { title: 'Superplasticizer Admixture for Concrete',        category: 'Construction', priority: 4 },
    // Agriculture
    { title: 'Drip Irrigation System — 5 Acre Setup',          category: 'Agriculture',  priority: 4 },
    { title: 'Agricultural Pesticides — WHO Class II',         category: 'Agriculture',  priority: 5 },
    { title: 'Rotavator 7 Ft — Tractor Mounted',               category: 'Agriculture',  priority: 4 },
    { title: 'Organic Fertilizers — NPK Granulated',           category: 'Agriculture',  priority: 5 },
    { title: 'Cold Storage Equipment — Potato Grade',          category: 'Agriculture',  priority: 3 },
  ];
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
