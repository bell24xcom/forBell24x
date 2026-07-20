/**
 * schema.org JSON-LD generation for category, requirement, and supplier pages.
 *
 * Two corrections versus a generic template approach, both load-bearing:
 *
 * 1. A requirement (RFQ) is modeled as `schema.org/Demand` — "the seeking
 *    for an object/service" — not `Product`. `Product` is for things being
 *    sold; marking a want-ad as a Product misrepresents it to Google and is
 *    the kind of structured-data mismatch its spam policies target.
 *
 * 2. No `aggregateRating` is generated anywhere in this file. There is no
 *    Review model in prisma/schema.prisma, so a real ratingValue/reviewCount
 *    doesn't exist yet — inventing one would be fabricated structured data,
 *    which risks a manual action. Wire this in later only once real review
 *    data exists.
 */

import { SITE_URL } from '@/lib/site-url';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface CategorySchemaInput {
  slug: string;
  name: string;
  description: string;
  /** Real count from the DB — omit rather than guess. */
  openRequirementCount?: number;
}

export function generateCategorySchema(input: CategorySchemaInput) {
  const url = `${SITE_URL}/categories/${input.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${input.name} Suppliers`,
    description: input.description,
    url,
    ...(typeof input.openRequirementCount === 'number'
      ? { mainEntity: { '@type': 'ItemList', numberOfItems: input.openRequirementCount } }
      : {}),
    breadcrumb: generateBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: input.name, url },
    ]),
  };
}

export interface RequirementSchemaInput {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity?: string | null;
  location?: string | null;
}

/** `Demand` — schema.org's type for "seeking" something, the inverse of `Offer`. */
export function generateRequirementSchema(input: RequirementSchemaInput) {
  const url = `${SITE_URL}/rfq/${input.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Demand',
    name: input.title,
    description: input.description,
    category: input.category,
    url,
    ...(input.quantity ? { eligibleQuantity: { '@type': 'QuantitativeValue', value: input.quantity } } : {}),
    ...(input.location ? { areaServed: input.location } : {}),
  };
}

export interface SupplierSchemaInput {
  id: string;
  companyName: string;
  description: string;
  location?: string | null;
  gstVerified: boolean;
  udyamVerified: boolean;
}

export function generateSupplierSchema(input: SupplierSchemaInput) {
  const url = `${SITE_URL}/supplier/${input.id}`;
  const verifications = [
    input.gstVerified && 'GST Verified',
    input.udyamVerified && 'Udyam Verified',
  ].filter(Boolean) as string[];

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Organization'],
    name: input.companyName,
    description: input.description,
    url,
    ...(input.location ? { address: { '@type': 'PostalAddress', addressLocality: input.location, addressCountry: 'IN' } } : {}),
    ...(verifications.length ? { additionalType: verifications } : {}),
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** Serializes a schema object to a `<script type="application/ld+json">`-ready string. */
export function toJsonLdString(schema: object): string {
  return JSON.stringify(schema);
}
