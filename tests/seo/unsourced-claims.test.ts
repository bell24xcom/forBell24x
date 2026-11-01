/**
 * Regression test for unsourced/inconsistent numeric claims found while
 * auditing the growth-tracked blog posts and the IndiaMART comparison page
 * (GSC remediation, 2026-10-26). "500 verified suppliers" was VyaparSethu's
 * own fabricated self-claim (same pattern already fixed in PR #80/#84).
 * "100M+ listings" / "15.3 million supplier listings" / "8M+ suppliers" /
 * "8M suppliers" were four different, mutually-contradictory figures for
 * the SAME external fact (IndiaMART's scale) across three live pages --
 * an internal-consistency bug independent of whether any one number is
 * itself accurate.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BLOG_POSTS } from '../../src/data/blog-posts.ts';

function bodyOf(slug: string): string {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  assert.ok(post, `expected a blog post with slug "${slug}"`);
  return post!.body;
}

test('VyaparSethu no longer claims a specific, unsupported self-reported supplier count', () => {
  const body = bodyOf('india-b2b-market-guide-2026');
  assert.doesNotMatch(body, /\b500 verified suppliers\b/i);
});

test('blog posts no longer state a specific IndiaMART listing/supplier count', () => {
  assert.doesNotMatch(bodyOf('india-b2b-market-guide-2026'), /100M\+?\s*listings/i);
  assert.doesNotMatch(bodyOf('top-10-b2b-portals-india-2026'), /15\.3 million/i);
});

test('the IndiaMART comparison page no longer states a specific supplier count', () => {
  const source = readFileSync(
    join(__dirname, '../../src/app/compare/vyaparsethu-vs-indiamart/page.tsx'),
    'utf8',
  );
  assert.doesNotMatch(source, /8M\+?\s*suppliers/i);
});
