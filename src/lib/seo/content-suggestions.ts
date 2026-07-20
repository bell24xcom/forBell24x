/**
 * Content-gap analysis and generation for thin pages. FAQ/description
 * copy here only states mechanics that are actually true of the product
 * (the Three Pillars from CLAUDE.md) — no invented counts, testimonials,
 * or "trusted by N businesses" claims, since none of that data exists yet.
 */

import { PageType } from './internal-linking';
import { checkWordCount } from './page-quality-auditor';

export interface FAQ {
  question: string;
  answer: string;
}

export interface ContentGap {
  gap: string;
  wordCountImpact: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

const CATEGORY_FAQS: FAQ[] = [
  {
    question: 'Are suppliers on VyaparSethu verified?',
    answer: 'Yes — every supplier is GST and Udyam verified before their profile goes live, so buyers only see registered businesses.',
  },
  {
    question: 'How fast can I get a quotation?',
    answer: 'Most requirements posted on VyaparSethu receive quotations within 24 hours from matched, verified suppliers.',
  },
  {
    question: 'Is payment protected?',
    answer: 'Yes — payment is held in a Protected Payment arrangement until both the buyer and supplier confirm the order is fulfilled.',
  },
  {
    question: 'How do I post a requirement in this category?',
    answer: 'Use the "Post a Requirement" button on this page — you can describe it by voice, video, or text, and suppliers in this category will be notified.',
  },
];

export function generateFAQSection(pageType: PageType): FAQ[] {
  if (pageType === 'category') return CATEGORY_FAQS;
  if (pageType === 'requirement') {
    return [
      CATEGORY_FAQS[0],
      CATEGORY_FAQS[2],
      {
        question: 'Can I edit this requirement after posting?',
        answer: 'Yes — requirements can be updated any time before a quotation is accepted.',
      },
    ];
  }
  if (pageType === 'supplier') {
    return [
      CATEGORY_FAQS[0],
      {
        question: 'How do I request a quotation from this supplier?',
        answer: 'Post a requirement and tag this supplier, or use the "Get a quotation" action on their profile.',
      },
      CATEGORY_FAQS[2],
    ];
  }
  return CATEGORY_FAQS.slice(0, 2);
}

export function generateCategoryDescription(name: string, openRequirementCount?: number): string {
  const countLine =
    typeof openRequirementCount === 'number' && openRequirementCount > 0
      ? ` There are currently ${openRequirementCount} open requirements in this category.`
      : '';
  return (
    `${name} is one of the trade categories on VyaparSethu's Trade Network, connecting buyers with ` +
    `GST and Udyam verified suppliers.${countLine} Buyers can post a requirement by voice, video, or text ` +
    `and typically receive quotations within 24 hours. Payment is held in a Protected Payment arrangement ` +
    `until both sides confirm the order, and orders in this category are targeted to close within 48 hours ` +
    `of an accepted quotation.`
  );
}

/**
 * Compares current word count against the per-page-type minimum and
 * returns what's missing — doesn't invent content, just sizes the gap.
 */
export function analyzeContentGaps(content: string, pageType: PageType): ContentGap[] {
  const minimums: Record<PageType, number> = {
    category: 500,
    requirement: 200,
    supplier: 300,
    landing: 400,
  };
  const { count } = checkWordCount(content);
  const min = minimums[pageType];
  const gaps: ContentGap[] = [];

  if (count < min) {
    gaps.push({
      gap: `Word count is ${count}, below the ${min}-word floor for ${pageType} pages.`,
      wordCountImpact: min - count,
      priority: 'CRITICAL',
    });
  }
  if (!/faq|frequently asked/i.test(content)) {
    gaps.push({ gap: 'No FAQ section detected.', wordCountImpact: 200, priority: 'HIGH' });
  }
  if (pageType === 'category' && !/verified|GST|Udyam/i.test(content)) {
    gaps.push({ gap: 'No trust-signal language (GST/Udyam verification) found.', wordCountImpact: 40, priority: 'MEDIUM' });
  }

  return gaps;
}
