/**
 * Regression test for unsupported commercial claims in blog posts (SEO
 * remediation, 2026-10-26). "200+ verified steel suppliers... 4.2 quotes
 * in 18 hours" and "80+ verified adhesive and sealant suppliers" were
 * hardcoded, unsupported marketing figures with no backing data source --
 * the same class of defect already corrected on the categories page (PR
 * #80). This guards against the exact numbers reappearing, while
 * confirming the surrounding real content survived the edit.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BLOG_POSTS } from '../../src/data/blog-posts.ts';

function bodyOf(slug: string): string {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  assert.ok(post, `expected a blog post with slug "${slug}"`);
  return post!.body;
}

test('steel-procurement-guide-india no longer claims a specific unsupported supplier count or response time', () => {
  const body = bodyOf('steel-procurement-guide-india');
  assert.doesNotMatch(body, /200\+\s*verified/i);
  assert.doesNotMatch(body, /4\.2 quotes/i);
  // The real, substantive content (cluster names) must still be present --
  // this is a claim correction, not a content deletion.
  assert.match(body, /Kalamboli/);
  assert.match(body, /Bhiwandi/);
});

test('industrial-adhesives-guide-india no longer claims a specific unsupported supplier count', () => {
  const body = bodyOf('industrial-adhesives-guide-india');
  assert.doesNotMatch(body, /80\+\s*verified/i);
  assert.match(body, /Navi Mumbai/);
});
