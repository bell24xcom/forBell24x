/**
 * POST /api/admin/seed-suppliers
 * Seeds 30 realistic Indian suppliers (isClaimed=true, phone set)
 * so the outreach generator has data to work with.
 * Protected by CRON_SECRET. Run ONCE.
 *
 * GET /api/admin/seed-suppliers — count by category
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // no secret configured → deny (fail closed, never open by default)
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

const SUPPLIERS = [
  // ── Textiles (10) ──────────────────────────────────────────────
  { name: 'Rajesh Sharma', company: 'Sharma Textile Mills',         phone: '9876501001', email: 'rajesh@sharmatextiles.com',    location: 'Surat, Gujarat',        category: 'Textiles',                  trustScore: 72, gst: '24AABCS1429B1ZB' },
  { name: 'Priya Mehta',   company: 'Mehta Fabrics Pvt Ltd',        phone: '9876501002', email: 'priya@mehtafabrics.com',       location: 'Surat, Gujarat',        category: 'Textiles',                  trustScore: 65, gst: '24AADCM8732F1ZP' },
  { name: 'Amit Patel',    company: 'Patel Weaving Industries',     phone: '9876501003', email: 'amit@patelweaving.com',        location: 'Ahmedabad, Gujarat',    category: 'Textiles',                  trustScore: 58, gst: '24AAICM7345K1ZA' },
  { name: 'Sunita Gupta',  company: 'Gupta Cotton House',           phone: '9876501004', email: 'sunita@guptacotton.com',      location: 'Coimbatore, Tamil Nadu', category: 'Textiles',                  trustScore: 80, gst: '33AABCG1234M1ZS' },
  { name: 'Vikram Singh',  company: 'Singh Hosiery Works',          phone: '9876501005', email: 'vikram@singhhosiery.com',     location: 'Ludhiana, Punjab',      category: 'Textiles',                  trustScore: 55, gst: '03AABCS4567N1ZV' },
  { name: 'Kavita Joshi',  company: 'Joshi Dyeing & Printing',      phone: '9876501006', email: 'kavita@joshidyeing.com',      location: 'Bhilwara, Rajasthan',   category: 'Textiles',                  trustScore: 63, gst: '08AABCJ8901O1ZK' },
  { name: 'Deepak Verma',  company: 'Verma Silk Exports',           phone: '9876501007', email: 'deepak@vermasilk.com',        location: 'Varanasi, UP',          category: 'Textiles',                  trustScore: 70, gst: '09AABCV2345P1ZD' },
  { name: 'Anita Reddy',   company: 'Reddy Handloom Corporation',   phone: '9876501008', email: 'anita@reddyhandloom.com',     location: 'Hyderabad, Telangana',  category: 'Textiles',                  trustScore: 45, gst: '36AABCR6789Q1ZA' },
  { name: 'Suresh Kumar',  company: 'Kumar Garment Exports',        phone: '9876501009', email: 'suresh@kumargarments.com',    location: 'Tirupur, Tamil Nadu',   category: 'Textiles',                  trustScore: 85, gst: '33AABCK3456R1ZS' },
  { name: 'Neha Agarwal',  company: 'Agarwal Synthetic Fibres',     phone: '9876501010', email: 'neha@agarwalsynthetic.com',   location: 'Mumbai, Maharashtra',   category: 'Textiles',                  trustScore: 60, gst: '27AABCA7890S1ZN' },

  // ── Packaging & Paper (5) ──────────────────────────────────────
  { name: 'Rohit Bhatia',  company: 'Bhatia Packaging Solutions',   phone: '9876501011', email: 'rohit@bhatiapackaging.com',   location: 'Delhi, NCR',            category: 'Packaging & Paper',         trustScore: 68, gst: '07AABCB1234T1ZR' },
  { name: 'Meena Shah',    company: 'Shah Paper Mills',             phone: '9876501012', email: 'meena@shahpaper.com',         location: 'Vapi, Gujarat',         category: 'Packaging & Paper',         trustScore: 73, gst: '24AABCS5678U1ZM' },
  { name: 'Arun Nair',     company: 'Nair Corrugated Boxes',        phone: '9876501013', email: 'arun@naircorrugated.com',     location: 'Pune, Maharashtra',     category: 'Packaging & Paper',         trustScore: 50, gst: '27AABCN9012V1ZA' },
  { name: 'Pooja Iyer',    company: 'Iyer Flexible Packaging',      phone: '9876501014', email: 'pooja@iyerflexible.com',      location: 'Chennai, Tamil Nadu',   category: 'Packaging & Paper',         trustScore: 62, gst: '33AABCI3456W1ZP' },
  { name: 'Mahesh Tiwari', company: 'Tiwari Bag Manufacturers',     phone: '9876501015', email: 'mahesh@tiwaribags.com',       location: 'Indore, MP',            category: 'Packaging & Paper',         trustScore: 40, gst: '23AABCT7890X1ZM' },

  // ── Industrial Machinery (5) ───────────────────────────────────
  { name: 'Sanjay Desai',  company: 'Desai Engineering Works',      phone: '9876501016', email: 'sanjay@desaiengineering.com', location: 'Rajkot, Gujarat',       category: 'Industrial Machinery',      trustScore: 78, gst: '24AABCD1234Y1ZS' },
  { name: 'Lata Patil',    company: 'Patil Machine Tools',          phone: '9876501017', email: 'lata@patilmachine.com',       location: 'Kolhapur, Maharashtra', category: 'Industrial Machinery',      trustScore: 55, gst: '27AABCP5678Z1ZL' },
  { name: 'Kiran Bhatt',   company: 'Bhatt Industrial Equipment',   phone: '9876501018', email: 'kiran@bhattindustrial.com',   location: 'Pune, Maharashtra',     category: 'Industrial Machinery',      trustScore: 67, gst: '27AABCB9012A1ZK' },
  { name: 'Ravi Choudhary','company': 'Choudhary Hydraulics Pvt Ltd', phone: '9876501019', email: 'ravi@choudharyhydraulics.com', location: 'Ahmedabad, Gujarat',  category: 'Industrial Machinery',      trustScore: 82, gst: '24AABCC3456B1ZR' },
  { name: 'Shobha Mishra', company: 'Mishra Pneumatic Systems',     phone: '9876501020', email: 'shobha@mishrapneumatic.com',  location: 'Kanpur, UP',            category: 'Industrial Machinery',      trustScore: 48, gst: '09AABCM7890C1ZS' },

  // ── Chemical (3) ──────────────────────────────────────────────
  { name: 'Farhan Qureshi', company: 'Qureshi Chemicals Ltd',        phone: '9876501021', email: 'farhan@qureshichem.com',      location: 'Vapi, Gujarat',         category: 'Chemical',                  trustScore: 75, gst: '24AABCQ1234D1ZF' },
  { name: 'Divya Nambiar',  company: 'Nambiar Specialty Chemicals',  phone: '9876501022', email: 'divya@nambiarchemicals.com',  location: 'Navi Mumbai, Maharashtra', category: 'Chemical',               trustScore: 61, gst: '27AABCN5678E1ZD' },
  { name: 'Harish Pillai',  company: 'Pillai Agrochem Industries',   phone: '9876501023', email: 'harish@pillaichem.com',       location: 'Coimbatore, Tamil Nadu', category: 'Chemical',                 trustScore: 53, gst: '33AABCP9012F1ZH' },

  // ── Electronics & Electrical (4) ──────────────────────────────
  { name: 'Vinod Kapoor',  company: 'Kapoor Electronics Trading',   phone: '9876501024', email: 'vinod@kapoorelectronics.com', location: 'Delhi, NCR',            category: 'Electronics & Electrical',  trustScore: 70, gst: '07AABCK1234G1ZV' },
  { name: 'Smita Rao',     company: 'Rao Electricals & Controls',   phone: '9876501025', email: 'smita@raoelectricals.com',    location: 'Bengaluru, Karnataka',  category: 'Electronics & Electrical',  trustScore: 66, gst: '29AABCR5678H1ZS' },
  { name: 'Girish Hegde',  company: 'Hegde Power Solutions',        phone: '9876501026', email: 'girish@hegdepower.com',       location: 'Bengaluru, Karnataka',  category: 'Electronics & Electrical',  trustScore: 74, gst: '29AABCH9012I1ZG' },
  { name: 'Tanvi Kulkarni','company': 'Kulkarni LED Systems',        phone: '9876501027', email: 'tanvi@kulkarniled.com',       location: 'Pune, Maharashtra',     category: 'Electronics & Electrical',  trustScore: 44, gst: '27AABCK3456J1ZT' },

  // ── Food Products & Beverage (3) ──────────────────────────────
  { name: 'Bharat Jain',   company: 'Jain Food Industries',         phone: '9876501028', email: 'bharat@jainfood.com',         location: 'Indore, MP',            category: 'Food Products & Beverage',  trustScore: 59, gst: '23AABCJ7890K1ZB' },
  { name: 'Archana Shetty', company: 'Shetty Agro Processors',      phone: '9876501029', email: 'archana@shettyagro.com',      location: 'Mangalore, Karnataka',  category: 'Food Products & Beverage',  trustScore: 71, gst: '29AABCS1234L1ZA' },
  { name: 'Manish Tripathi','company': 'Tripathi Spices & Masala',   phone: '9876501030', email: 'manish@tripathimasala.com',   location: 'Kanpur, UP',            category: 'Food Products & Beverage',  trustScore: 47, gst: '09AABCT5678M1ZM' },
];

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let inserted = 0, skipped = 0;
  const errors: string[] = [];

  for (const s of SUPPLIERS) {
    try {
      const exists = await prisma.user.findFirst({
        where: { OR: [{ phone: s.phone }, { email: s.email }] },
      });
      if (exists) { skipped++; continue; }

      await prisma.user.create({
        data: {
          name: s.name,
          company: s.company,
          phone: s.phone,
          email: s.email,
          location: s.location,
          role: 'SUPPLIER',
          isActive: true,
          isVerified: true,
          isClaimed: true,
          trustScore: s.trustScore,
          gstNumber: s.gst,
          importedFrom: 'admin_seed',
          preferences: {
            categories: [s.category],
            onboardingComplete: true,
          },
        },
      });
      inserted++;
    } catch (e) {
      errors.push(`${s.company}: ${e instanceof Error ? e.message : 'error'}`);
      skipped++;
    }
  }

  console.log(`[seed-suppliers] inserted=${inserted} skipped=${skipped}`);
  return NextResponse.json({
    success: true,
    inserted,
    skipped,
    errors,
    message: `Seeded ${inserted} suppliers. ${skipped} skipped (already exist).`,
  });
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const suppliers = await prisma.user.findMany({
    where: { role: 'SUPPLIER', isClaimed: true, isActive: true },
    select: { preferences: true, trustScore: true, phone: true, email: true },
  });

  const byCat: Record<string, number> = {};
  let withPhone = 0, withEmail = 0;

  for (const s of suppliers) {
    const prefs = s.preferences as any;
    const cats: string[] = prefs?.categories || [];
    cats.forEach(c => { byCat[c] = (byCat[c] || 0) + 1; });
    if (s.phone) withPhone++;
    if (s.email) withEmail++;
  }

  return NextResponse.json({
    success: true,
    total: suppliers.length,
    withPhone,
    withEmail,
    byCategory: byCat,
  });
}
