/**
 * Regression test for src/app/sitemap.ts's category filtering (GSC
 * "Discovered - currently not indexed" remediation, 2026-10-26).
 *
 * Before this fix, every active category (454 in production) was submitted
 * to the sitemap unconditionally. A random sample confirmed ~100% of a
 * 19-URL spread render an identical, empty "be the first to post an RFQ"
 * template with no noindex of their own -- diluting crawl priority for the
 * rest of the site. Fix: always include top-level (parentId === null)
 * categories (mirrors src/app/categories/page.tsx's own hub-page rule for
 * which categories it links directly); only include a child category once
 * it has at least one real RFQ.
 */
import { test, mock, before } from 'node:test';
import assert from 'node:assert/strict';

const categoryRows = [
  { slug: 'automotive', parentId: null, _count: { rfqs: 0 } }, // top-level, no activity -- still included
  { slug: 'steel-metal', parentId: null, _count: { rfqs: 5 } }, // top-level, with activity -- included
  { slug: 'action-figures', parentId: 7, _count: { rfqs: 0 } }, // child, zero activity -- excluded
  { slug: 'engine-parts', parentId: 7, _count: { rfqs: 3 } }, // child, real activity -- included
];

mock.module('@/src/lib/prisma', {
  namedExports: {
    prisma: {
      category: { findMany: async () => categoryRows },
      rFQ: { findMany: async () => [] },
      user: { findMany: async () => [] },
    },
  },
});

let sitemap: () => Promise<{ url: string }[]>;

before(async () => {
  ({ default: sitemap } = await import('../../src/app/sitemap.ts'));
});

test('top-level categories are always included, regardless of activity', async () => {
  const entries = await sitemap();
  const urls = entries.map((e) => e.url);
  assert.ok(urls.some((u) => u.endsWith('/categories/automotive')), 'top-level, zero-activity category must still be included');
  assert.ok(urls.some((u) => u.endsWith('/categories/steel-metal')), 'top-level, active category must be included');
});

test('child categories are only included once they have real activity', async () => {
  const entries = await sitemap();
  const urls = entries.map((e) => e.url);
  assert.ok(!urls.some((u) => u.endsWith('/categories/action-figures')), 'thin child category must be excluded from the sitemap');
  assert.ok(urls.some((u) => u.endsWith('/categories/engine-parts')), 'active child category must be included');
});
