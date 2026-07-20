/**
 * Page quality / indexability auditor. Operates on already-fetched HTML —
 * it does not crawl the site itself. Pair with a list of URLs (e.g. a GSC
 * "not indexed" export) to audit real pages in bulk.
 */

import * as cheerio from 'cheerio';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AuditIssue {
  type: string;
  severity: Severity;
  currentValue: unknown;
  requiredValue: unknown;
  impact: string;
}

export interface AuditResult {
  pageUrl: string;
  overallScore: number;
  wordCount: number;
  issues: AuditIssue[];
  indexabilityLevel: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

const SEVERITY_PENALTY: Record<Severity, number> = {
  CRITICAL: 30,
  HIGH: 15,
  MEDIUM: 5,
  LOW: 2,
};

const MIN_WORD_COUNT = 300;
const MIN_INTERNAL_LINKS = 5;
const META_MIN = 150;
const META_MAX = 160;

function extractVisibleText($: cheerio.CheerioAPI): string {
  const $body = $('body').clone();
  $body.find('script, style, noscript').remove();
  return $body.text().replace(/\s+/g, ' ').trim();
}

export interface WordCountReport {
  count: number;
  pass: boolean;
  suggestion?: string;
}

export function checkWordCount(content: string): WordCountReport {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const count = words.length;
  return {
    count,
    pass: count >= MIN_WORD_COUNT,
    suggestion: count < MIN_WORD_COUNT ? `Add ${MIN_WORD_COUNT - count} more words of real content.` : undefined,
  };
}

export interface HeadingReport {
  h1Count: number;
  h2Count: number;
  pass: boolean;
  issues: string[];
}

export function checkHeadingStructure(html: string): HeadingReport {
  const $ = cheerio.load(html);
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const issues: string[] = [];
  if (h1Count === 0) issues.push('No H1 found.');
  if (h1Count > 1) issues.push(`${h1Count} H1 tags found — should be exactly 1.`);
  if (h2Count < 2) issues.push(`Only ${h2Count} H2 tags — aim for 3-5 to structure the content.`);
  return { h1Count, h2Count, pass: h1Count === 1 && h2Count >= 2, issues };
}

export interface LinkReport {
  internalLinkCount: number;
  pass: boolean;
}

export function checkInternalLinks(html: string, baseUrl: string): LinkReport {
  const $ = cheerio.load(html);
  const host = new URL(baseUrl).host;
  let internalLinkCount = 0;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('/')) {
      internalLinkCount++;
      return;
    }
    try {
      if (new URL(href, baseUrl).host === host) internalLinkCount++;
    } catch {
      // not a parseable absolute URL — ignore (mailto:, tel:, etc.)
    }
  });
  return { internalLinkCount, pass: internalLinkCount >= MIN_INTERNAL_LINKS };
}

export interface MetaReport {
  length: number;
  pass: boolean;
  issues: string[];
}

export function checkMetaDescription(metaDesc: string | null): MetaReport {
  if (!metaDesc) return { length: 0, pass: false, issues: ['No meta description found.'] };
  const issues: string[] = [];
  if (metaDesc.length < META_MIN) issues.push(`Too short (${metaDesc.length} chars).`);
  if (metaDesc.length > META_MAX) issues.push(`Too long (${metaDesc.length} chars) — will be truncated in SERPs.`);
  return { length: metaDesc.length, pass: issues.length === 0, issues };
}

export interface ImageReport {
  totalImages: number;
  missingAlt: number;
  pass: boolean;
}

export function checkImages(html: string): ImageReport {
  const $ = cheerio.load(html);
  const images = $('img');
  let missingAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (!alt || !alt.trim()) missingAlt++;
  });
  return { totalImages: images.length, missingAlt, pass: missingAlt === 0 };
}

function levelFromScore(score: number): AuditResult['indexabilityLevel'] {
  if (score >= 85) return 'EXCELLENT';
  if (score >= 65) return 'GOOD';
  if (score >= 40) return 'FAIR';
  return 'POOR';
}

export function auditPage(html: string, pageUrl: string): AuditResult {
  const $ = cheerio.load(html);
  const visibleText = extractVisibleText($);
  const metaDesc = $('meta[name="description"]').attr('content') || null;

  const wordCountReport = checkWordCount(visibleText);
  const headingReport = checkHeadingStructure(html);
  const linkReport = checkInternalLinks(html, pageUrl);
  const metaReport = checkMetaDescription(metaDesc);
  const imageReport = checkImages(html);

  const issues: AuditIssue[] = [];

  if (!wordCountReport.pass) {
    issues.push({
      type: 'THIN_CONTENT',
      severity: 'CRITICAL',
      currentValue: wordCountReport.count,
      requiredValue: MIN_WORD_COUNT,
      impact: 'Google frequently excludes thin-content pages from the index entirely ("Discovered but not indexed").',
    });
  }
  if (headingReport.h1Count === 0) {
    issues.push({
      type: 'MISSING_H1',
      severity: 'HIGH',
      currentValue: 0,
      requiredValue: 1,
      impact: 'No clear page topic signal for crawlers.',
    });
  } else if (headingReport.h1Count > 1) {
    issues.push({
      type: 'MULTIPLE_H1',
      severity: 'MEDIUM',
      currentValue: headingReport.h1Count,
      requiredValue: 1,
      impact: 'Dilutes the page-topic signal.',
    });
  }
  if (headingReport.h2Count < 2) {
    issues.push({
      type: 'WEAK_HEADING_STRUCTURE',
      severity: 'LOW',
      currentValue: headingReport.h2Count,
      requiredValue: '3-5',
      impact: 'Poorly structured content is harder for crawlers and readers to parse.',
    });
  }
  if (!linkReport.pass) {
    issues.push({
      type: 'INSUFFICIENT_INTERNAL_LINKS',
      severity: 'HIGH',
      currentValue: linkReport.internalLinkCount,
      requiredValue: MIN_INTERNAL_LINKS,
      impact: 'Orphaned or weakly-linked pages get less crawl budget and pass less authority.',
    });
  }
  if (!metaReport.pass) {
    issues.push({
      type: 'META_DESCRIPTION_ISSUE',
      severity: 'MEDIUM',
      currentValue: metaReport.length,
      requiredValue: `${META_MIN}-${META_MAX}`,
      impact: 'Poor meta descriptions reduce click-through rate from search results.',
    });
  }
  if (imageReport.missingAlt > 0) {
    issues.push({
      type: 'MISSING_ALT_TEXT',
      severity: 'LOW',
      currentValue: imageReport.missingAlt,
      requiredValue: 0,
      impact: 'Missing alt text loses image-search visibility and hurts accessibility.',
    });
  }

  const overallScore = Math.max(
    0,
    100 - issues.reduce((sum, issue) => sum + SEVERITY_PENALTY[issue.severity], 0),
  );

  return {
    pageUrl,
    overallScore,
    wordCount: wordCountReport.count,
    issues,
    indexabilityLevel: levelFromScore(overallScore),
  };
}
