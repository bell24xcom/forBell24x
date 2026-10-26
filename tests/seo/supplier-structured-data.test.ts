/**
 * Regression test for the /suppliers/[city]/[category] JSON-LD
 * `numberOfItems` field (SEO remediation, 2026-10-26). Was
 * `suppliers.length || 10` -- `||` falls through to the hardcoded 10
 * whenever the real count is 0 (falsy), so a page with zero suppliers
 * claimed 10 in its structured data while the rendered page simultaneously
 * showed an honest "be the first supplier" empty state (confirmed on
 * /suppliers/agra/apparel-fashion).
 *
 * Strengthened (independent review, 2026-10-26) from a source-text-only
 * check to a genuine runtime one: `CityCategory` is an async Server
 * Component -- calling it directly returns a plain, inspectable React
 * element tree (no react-dom render needed, since `jsonLd` is already a
 * finished plain object by the time it's embedded as a <script>'s
 * dangerouslySetInnerHTML). Mocking @/lib/prisma lets this exercise the
 * real component function with a real (empty) supplier result, not just
 * grep the source for a pattern.
 */
import { test, mock, before } from 'node:test';
import assert from 'node:assert/strict';

mock.module('@/lib/prisma', {
  namedExports: {
    prisma: {
      user: { findMany: async () => [] },
    },
  },
});

let CityCategory: (props: { params: { city: string; category: string } }) => Promise<any>;

before(async () => {
  ({ default: CityCategory } = await import('../../src/app/suppliers/[city]/[category]/page.tsx'));
});

test('a city/category page with zero real suppliers reports numberOfItems: 0 in its JSON-LD, not a hardcoded 10', async () => {
  const element = await CityCategory({ params: { city: 'agra', category: 'apparel-fashion' } });
  // The component returns <>{jsonLdScript}{breadcrumbsScript}{...}</> -- the
  // first child is the jsonLd <script dangerouslySetInnerHTML>.
  const jsonLdScript = element.props.children[0];
  assert.equal(jsonLdScript.type, 'script');
  const jsonLd = JSON.parse(jsonLdScript.props.dangerouslySetInnerHTML.__html);
  assert.equal(jsonLd.numberOfItems, 0, 'zero real suppliers must report 0, never a hardcoded fallback');
});
