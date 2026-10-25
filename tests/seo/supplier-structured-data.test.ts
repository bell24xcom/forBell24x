/**
 * Regression test for the /suppliers/[city]/[category] JSON-LD
 * `numberOfItems` field (SEO remediation, 2026-10-26). Was
 * `suppliers.length || 10` -- `||` falls through to the hardcoded 10
 * whenever the real count is 0 (falsy), so a page with zero suppliers
 * claimed 10 in its structured data while the rendered page simultaneously
 * showed an honest "be the first supplier" empty state (confirmed on
 * /suppliers/agra/apparel-fashion).
 *
 * This page is an async Server Component with a real Prisma call and no
 * existing component-render test harness in this repo (every other test
 * in tests/security and lib/*.test.ts tests pure functions or route
 * handlers via mock.module, not rendered React components) -- introducing
 * a new rendering test dependency for one arithmetic fix isn't justified.
 * This asserts the exact source pattern instead: the dangerous `|| 10`
 * fallback is gone, and the real count is used unconditionally.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('/suppliers/[city]/[category] numberOfItems uses the real supplier count, not a hardcoded fallback', () => {
  const source = readFileSync(
    join(__dirname, '../../src/app/suppliers/[city]/[category]/page.tsx'),
    'utf8',
  );
  assert.doesNotMatch(source, /numberOfItems:\s*suppliers\.length\s*\|\|\s*10/);
  assert.match(source, /numberOfItems:\s*suppliers\.length\s*,/);
});
