// One-time data repair: assign Category.slug for the 13 HIGH-confidence
// suppliers identified in the 338-supplier category-recovery audit (29
// empty + 309 echo-bug suppliers with no usable preferences.categories).
//
// These 13 all came from the original 29-empty bucket - the "{City}
// {Industry}" seed batch (e.g. "Steel India Works", "Delhi Textiles Co")
// already validated as a reliable signal earlier this session, cross-checked
// against Category rows at every level (not just top-level), with an
// automated keyword matcher whose output was manually reviewed row-by-row
// before trusting it (several coincidental single-word matches - e.g.
// "Investment"->mining-investment, "Gear"->outdoor-gear - were caught and
// discarded during that review; these 13 survived it).
//
// The other 325 suppliers from that audit (27 medium, 86 low, 212
// unknown/no-fit) are explicitly NOT touched here - see the separate
// medium-confidence review file for the next tier.
//
// Usage: DATABASE_URL=<connection-string> node scripts/backfill-supplier-category-slugs-recovery-batch.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const ASSIGNMENTS = [
  { id: 'cmm62umxa0008vjk85323zq5z', company: 'Hyderabad Pharmaceuticals', slug: 'pharmaceutical-chemicals' },
  { id: 'cmm62umi00001vjk8hm11s4ie', company: 'Steel India Works', slug: 'steel-metal' },
  { id: 'cmm62umlp0002vjk8sryqvz0t', company: 'Delhi Textiles Co', slug: 'textiles' },
  { id: 'cmm62umnl0003vjk8qaypkjos', company: 'Surat Chemical Industries', slug: 'chemical' },
  { id: 'cmm62umtj0006vjk8rju6wvx7', company: 'Ahmedabad Machinery', slug: 'industrial-machinery' },
  { id: 'cmm62umz50009vjk8nnzt4km6', company: 'Bangalore Plastics Ltd', slug: 'plastics' },
  { id: 'cmm62un0y000avjk8ashddllv', company: 'Cochin Food Products', slug: 'food-beverage' },
  { id: 'cmm62un2u000bvjk8artee893', company: 'Delhi Construction Materials', slug: 'construction-materials' },
  { id: 'cmm62un8d000evjk8kf77c9zu', company: 'Surat Furniture Exports', slug: 'furniture-carpentry' },
  { id: 'cmm62unee000hvjk8sfzsrdq8', company: 'Indore Metal Works', slug: 'steel-metal' },
  { id: 'cmm62ungb000ivjk81gdsdtou', company: 'Mumbai Cosmetics Ltd', slug: 'cosmetics-personal-care' },
  { id: 'cmm62uni7000jvjk8ki2rzphx', company: 'Kerala Spices Export', slug: 'spices-seasonings' },
  { id: 'cmm62unki000kvjk873xf6040', company: 'Punjab Agriculture Supplies', slug: 'agriculture' },
];

async function main() {
  const targetSlugs = [...new Set(ASSIGNMENTS.map((a) => a.slug))];
  const categoryRows = await prisma.category.findMany({
    where: { slug: { in: targetSlugs } },
    select: { slug: true, isActive: true },
  });
  const foundSlugs = new Set(categoryRows.map((c) => c.slug));
  for (const slug of targetSlugs) {
    if (!foundSlugs.has(slug)) throw new Error(`Aborting: target slug "${slug}" not found in Category table`);
  }
  const inactive = categoryRows.filter((c) => !c.isActive);
  if (inactive.length) throw new Error(`Aborting: inactive target categories: ${inactive.map((c) => c.slug).join(', ')}`);
  console.log('Slug check passed:', targetSlugs.join(', '));

  const record = { runAt: new Date().toISOString(), suppliers: [] };
  let totalUpdated = 0;

  for (const a of ASSIGNMENTS) {
    const s = await prisma.user.findUnique({ where: { id: a.id }, select: { id: true, company: true, preferences: true } });
    if (!s) throw new Error(`Aborting: supplier ${a.id} (${a.company}) not found`);
    if (s.company !== a.company) throw new Error(`Aborting: supplier ${a.id} company mismatch - expected "${a.company}", found "${s.company}"`);

    const before = s.preferences ?? {};
    const beforeCategories = Array.isArray(before.categories) ? before.categories : [];
    const after = { ...before, categories: [a.slug] };

    await prisma.user.update({
      where: { id: s.id },
      data: { preferences: after },
    });

    record.suppliers.push({ id: s.id, company: s.company, before: beforeCategories, after: [a.slug] });
    totalUpdated++;
    console.log(`${s.company}: ${JSON.stringify(beforeCategories)} -> ${JSON.stringify([a.slug])}`);
  }

  const outPath = path.join(__dirname, '..', 'docs', `supplier-category-recovery-batch-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(record, null, 2));
  console.log('Total suppliers updated:', totalUpdated);
  console.log('Before/after record written to:', outPath);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
