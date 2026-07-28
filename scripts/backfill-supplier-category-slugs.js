// One-time data repair: normalize preferences.categories to Category.slug
// for the 4 homogeneous legacy import batches (mjp, wagle_estate, mpcb,
// public_search — 278 suppliers total). Each batch stamped a fixed,
// internally-consistent set of free-text values on every row it touched;
// this script replaces those free-text values with the real Category.slug
// they map to, so RFQ<->supplier matching (which compares on Category.slug
// via exact string equality) can actually succeed for these suppliers.
//
// Scope: ONLY these 4 importedFrom batches. Does not touch admin_import,
// admin_seed, real onboarding, or empty/echo-bug suppliers — those are
// separate, unresolved buckets (see docs/supplier-category-taxonomy-audit
// conversation history for the full audit).
//
// "Pipes & Irrigation Equipment" (half of the mjp batch's pair) is
// deliberately left unmapped: no Category row matches it (checked at every
// level, not just top-level), and the only textual near-match found
// (`pipes-fittings`, `metals-alloys`, `fasteners-bolts` in
// src/data/industrial-clusters.ts) turned out to be a hand-maintained
// free-text array with no corresponding Category rows at all - the same
// unvalidated-list bug class fixed elsewhere this session, just not here.
// Storing an approximate slug would misrepresent these suppliers in future
// matching, which is the exact bug this script exists to fix.
//
// Usage: DATABASE_URL=<connection-string> node scripts/backfill-supplier-category-slugs.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const BATCH_MAPPING = {
  public_search: ['mineral-metals'],
  mpcb: ['iron-steel'],
  wagle_estate: ['iron-steel', 'mineral-metals'],
  mjp: ['industrial-supplies'],
};

async function main() {
  // Safety check: every target slug must exist and be active before writing anything.
  const allSlugs = [...new Set(Object.values(BATCH_MAPPING).flat())];
  const categoryRows = await prisma.category.findMany({
    where: { slug: { in: allSlugs } },
    select: { slug: true, isActive: true },
  });
  const foundSlugs = new Set(categoryRows.map((c) => c.slug));
  for (const slug of allSlugs) {
    if (!foundSlugs.has(slug)) throw new Error(`Aborting: target slug "${slug}" not found in Category table`);
  }
  const inactive = categoryRows.filter((c) => !c.isActive);
  if (inactive.length) throw new Error(`Aborting: inactive target categories: ${inactive.map((c) => c.slug).join(', ')}`);
  console.log('Slug check passed:', allSlugs.join(', '));

  const record = { runAt: new Date().toISOString(), batches: {} };
  let totalUpdated = 0;

  for (const [batch, newCategories] of Object.entries(BATCH_MAPPING)) {
    const suppliers = await prisma.user.findMany({
      where: { role: 'SUPPLIER', importedFrom: batch },
      select: { id: true, company: true, preferences: true },
    });

    record.batches[batch] = { targetSlugs: newCategories, suppliers: [] };

    for (const s of suppliers) {
      const before = s.preferences ?? {};
      const beforeCategories = Array.isArray(before.categories) ? before.categories : [];
      const after = { ...before, categories: newCategories };

      await prisma.user.update({
        where: { id: s.id },
        data: { preferences: after },
      });

      record.batches[batch].suppliers.push({
        id: s.id,
        company: s.company,
        before: beforeCategories,
        after: newCategories,
      });
      totalUpdated++;
    }

    console.log(`${batch}: updated ${suppliers.length} suppliers -> ${JSON.stringify(newCategories)}`);
  }

  const outPath = path.join(__dirname, '..', 'docs', `supplier-category-backfill-${Date.now()}.json`);
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
