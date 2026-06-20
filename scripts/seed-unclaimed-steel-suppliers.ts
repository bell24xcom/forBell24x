/**
 * One-time seed: unclaimed steel-cluster supplier shell profiles
 * Kalamboli / Navi Mumbai — Mineral & Metals vertical
 *
 * Run:  npx tsx scripts/seed-unclaimed-steel-suppliers.ts
 *
 * Rules enforced:
 *   - isVerified: false  (hard — these are public-search leads, not confirmed)
 *   - isClaimed:  false  (owner has not yet authenticated)
 *   - trustScore: 0      (never set on unclaimed profiles)
 *   - claimToken: auto   (generates the /claim/<token> URL for manual outreach)
 *   - gstNumber stored as-is — display layer reads isVerified to choose label
 *   - No messages sent here — WhatsApp invitations stay fully manual
 *
 * Skipped from original table:
 *   MS Paper Roll — wrong vertical (packaging/Surat, not steel)
 *   JSW Ddvn Steel GST — flagged as conflicting; stored null pending confirmation
 *   Laxmi Metal GST — masked in source; stored null
 */

import { config } from 'dotenv';
config({ path: '.env.local' });   // load Neon credentials before PrismaClient initialises

import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vyaparsethu.com';

interface ShellSupplier {
  company: string;
  phone: string | null;
  email: string | null;
  gstNumber: string | null;
  location: string;
}

const SUPPLIERS: ShellSupplier[] = [
  {
    company:   'JSW Shoppe - Ddvn Steel',
    phone:     '8291970347',
    email:     'support.steel@jsw.in',
    gstNumber: null,                    // conflicting with prior data — omitted pending confirmation
    location:  'Kalamboli, Navi Mumbai, Maharashtra',
  },
  {
    company:   'SBK Steel Traders',
    phone:     null,
    email:     null,
    gstNumber: '27AFFFS6967Q1ZU',
    location:  'Kalamboli, Navi Mumbai, Maharashtra',
  },
  {
    company:   'Shivam Metal Industries',
    phone:     '9324549699',
    email:     'smiindia2020@gmail.com',
    gstNumber: null,
    location:  'Kalamboli, Navi Mumbai, Maharashtra',
  },
  {
    company:   'Shreeji Steel Tubes Pvt Ltd',
    phone:     '2241718888',            // landline (022-41718888) — claim URL valid, WA link will not resolve
    email:     'sales@shreejisteeltubes.com',
    gstNumber: null,
    location:  'Mumbai, Maharashtra',
  },
  {
    company:   'JSW Shoppe - Shubh M L Shah & Sons',
    phone:     '9619981806',
    email:     'shubhml.shah@gmail.com',
    gstNumber: null,
    location:  'Kalamboli, Navi Mumbai, Maharashtra',
  },
  {
    company:   'Dinesh Metal Industries',
    phone:     '7666005709',
    email:     'sales@dmitube.com',
    gstNumber: null,
    location:  'Kalamboli, Navi Mumbai, Maharashtra',
  },
  {
    company:   'K S Metal Corporation',
    phone:     null,
    email:     'ksmetalcorp@gmail.com',
    gstNumber: null,
    location:  'Kalamboli, Navi Mumbai, Maharashtra',
  },
  {
    company:   'Fortran Steel (Works)',
    phone:     '9167622536',
    email:     'sales@fortran.in',
    gstNumber: null,
    location:  'Kalamboli, Navi Mumbai, Maharashtra',
  },
  {
    company:   'Gopani Metal Industries Pvt Ltd',
    phone:     '7971405453',              // confirmed: Shri Udya Singh Negi (Prabhadevi office; factory at Taloja — confirm on first call)
    email:     null,
    gstNumber: '27AABCB1392G1ZV',
    location:  'Kalamboli, Navi Mumbai, Maharashtra',
  },
  {
    company:   'Laxmi Metal Industries',
    phone:     '8047642860',
    email:     null,
    gstNumber: null,                    // masked in source — omitted
    location:  'Kalamboli, Navi Mumbai, Maharashtra',
  },
  {
    company:   'Kalamboli Iron And Steel Yard Private Limited',
    phone:     null,
    email:     null,
    gstNumber: '27AAGCK7708Q1ZS',      // confirmed via KnowYourGST / government registry
    location:  'Borivali West, Mumbai, Maharashtra',
  },
  {
    company:   'Anuradha Iron And Steel Private Limited',
    phone:     '7947137292',             // confirmed via directory lookup
    email:     null,
    gstNumber: '27AASCA6797P1ZD',       // confirmed via KnowYourGST / government registry
    location:  'Kalamboli, Panvel, Maharashtra',
  },
];

// Patch confirmed phones onto records that may already exist with phone=null
async function patchPhones(updates: Array<{ company: string; phone: string }>) {
  for (const u of updates) {
    const rec = await prisma.user.findFirst({ where: { company: u.company }, select: { id: true, phone: true } });
    if (!rec) { console.log(`  [patch] ${u.company} not yet in DB — phone will be set on create`); continue; }
    if (rec.phone === u.phone) { console.log(`  [patch] ${u.company} phone already current`); continue; }
    await prisma.user.update({ where: { id: rec.id }, data: { phone: u.phone } });
    console.log(`  [patch] ${u.company} → phone set to ${u.phone}`);
  }
}

async function main() {
  console.log('\nPhase 0: patching confirmed phones on existing records...');
  await patchPhones([
    { company: 'Anuradha Iron And Steel Private Limited', phone: '7947137292' },
    { company: 'Gopani Metal Industries Pvt Ltd',         phone: '7971405453' },
  ]);

  console.log(`\nSeeding ${SUPPLIERS.length} unclaimed steel supplier profiles...\n`);

  let created = 0;
  let skipped = 0;

  const results: Array<{ company: string; status: string; claimUrl: string }> = [];

  for (const s of SUPPLIERS) {
    const existing = await prisma.user.findFirst({
      where: { company: s.company },
      select: { id: true, claimToken: true },
    });

    if (existing) {
      skipped++;
      results.push({
        company:  s.company,
        status:   'SKIPPED (already exists)',
        claimUrl: existing.claimToken
          ? `${SITE_URL}/claim/${existing.claimToken}`
          : '(no claim token — run fix)',
      });
      continue;
    }

    const claimToken = randomUUID();

    await prisma.user.create({
      data: {
        name:         s.company,
        company:      s.company,
        phone:        s.phone,
        email:        s.email,
        gstNumber:    s.gstNumber,
        location:     s.location,
        role:         'SUPPLIER',
        isActive:     true,
        isVerified:   false,
        isClaimed:    false,
        trustScore:   0,
        claimToken,
        importedFrom: 'public_search',
        preferences: {
          categories:         ['Mineral & Metals'],
          onboardingComplete: false,
        },
      },
    });

    created++;
    results.push({
      company:  s.company,
      status:   'CREATED',
      claimUrl: `${SITE_URL}/claim/${claimToken}`,
    });
  }

  console.log('─'.repeat(80));
  console.log('Company'.padEnd(46) + 'Status'.padEnd(10) + 'Claim URL');
  console.log('─'.repeat(80));
  for (const r of results) {
    console.log(r.company.padEnd(46) + r.status.padEnd(10) + r.claimUrl);
  }
  console.log('─'.repeat(80));
  console.log(`\nDone. Created: ${created}  Skipped: ${skipped}\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
