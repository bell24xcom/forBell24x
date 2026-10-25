/**
 * Regression test for /help/* sub-pages (SEO indexing fix, 2026-10-26).
 *
 * Before this fix, none of these 5 pages exported `metadata`, so each
 * silently inherited the root layout's `alternates: { canonical: '/' }` --
 * telling Google every one of these pages was a duplicate of the homepage.
 * Confirmed as the cause of /help/how-to-buy's "Crawled - currently not
 * indexed" Search Console status.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const PAGES: { module: string; path: string }[] = [
  { module: '../../src/app/help/how-to-buy/page.tsx', path: '/help/how-to-buy' },
  { module: '../../src/app/help/how-to-sell/page.tsx', path: '/help/how-to-sell' },
  { module: '../../src/app/help/faq/page.tsx', path: '/help/faq' },
  { module: '../../src/app/help/payment/page.tsx', path: '/help/payment' },
  { module: '../../src/app/help/safety/page.tsx', path: '/help/safety' },
];

for (const { module: modulePath, path } of PAGES) {
  test(`${path} exports a self-referencing canonical, not the homepage`, async () => {
    const mod = await import(modulePath);
    assert.ok(mod.metadata, `${path} must export \`metadata\``);
    const canonical = mod.metadata.alternates?.canonical;
    assert.ok(canonical, `${path} must set alternates.canonical`);
    assert.ok(
      canonical.endsWith(path),
      `${path}'s canonical (${canonical}) must point to itself, not the homepage`,
    );
    assert.ok(mod.metadata.title && mod.metadata.title.length > 0, `${path} must have a page-specific title`);
  });
}
