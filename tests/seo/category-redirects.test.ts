/**
 * Regression test for next.config.js's category redirects (SEO indexing
 * fix, 2026-10-26). /categories/agriculture-farming is a genuine 404 in
 * production -- seeded as an intended category and still referenced live
 * from src/data/city-category-seo.ts, but absent from the production
 * Category table. Search Console flagged it "Crawled - currently not
 * indexed". This confirms the redirect exists and targets a real page.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('next.config.js redirects /categories/agriculture-farming to a real category, permanently', async () => {
  const nextConfig = require('../../next.config.js');
  const redirects: { source: string; destination: string; permanent: boolean }[] = await nextConfig.redirects();

  const entry = redirects.find((r) => r.source === '/categories/agriculture-farming');
  assert.ok(entry, 'expected a redirect entry for /categories/agriculture-farming');
  assert.equal(entry!.destination, '/categories/agriculture');
  assert.equal(entry!.permanent, true);
});

test('the three pre-existing dead-slug redirects are still present (no regression)', async () => {
  const nextConfig = require('../../next.config.js');
  const redirects: { source: string; destination: string }[] = await nextConfig.redirects();
  const sources = redirects.map((r) => r.source);

  assert.ok(sources.includes('/categories/pipes-fittings'));
  assert.ok(sources.includes('/categories/leather-footwear'));
  assert.ok(sources.includes('/categories/chemicals-petrochemicals'));
});
