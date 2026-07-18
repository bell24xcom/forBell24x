/**
 * Product Intelligence SEO — JSON-LD and metadata (no LLM).
 */

import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';
import { getProductRecord } from '@/src/data/product-intelligence-catalog';
import type { ProductIntelligenceRecord } from './types';

export async function buildProductIntelligenceMetadata(slug: string): Promise<Metadata> {
  const p = await getProductRecord(slug);
  if (!p) return { title: 'Product Not Found | VyaparSethu' };

  const title = p.seo.metaTitle ?? `${p.name} — Product Intelligence | VyaparSethu`;
  const description =
    p.seo.metaDescription ?? p.description.slice(0, 160);
  const canonical = p.seo.canonicalPath
    ? `${SITE_URL}${p.seo.canonicalPath}`
    : `${SITE_URL}/product-intelligence/${slug}`;

  return {
    title: { absolute: title },
    description,
    keywords: p.seo.keywords,
    openGraph: { title, description, url: canonical, siteName: 'VyaparSethu', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical },
  };
}

export function buildProductJsonLd(p: ProductIntelligenceRecord) {
  const url = p.seo.canonicalPath
    ? `${SITE_URL}${p.seo.canonicalPath}`
    : `${SITE_URL}/product-intelligence/${p.slug}`;

  const faqSchema =
    p.knowledge.faqs && p.knowledge.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: p.knowledge.faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    category: p.category,
    url,
    ...(p.commercial.hsCode ? { productID: p.commercial.hsCode } : {}),
    ...(p.commercial.priceRange
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            description: p.commercial.priceRange,
          },
        }
      : {}),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Product Intelligence', item: `${SITE_URL}/product-intelligence` },
      { '@type': 'ListItem', position: 3, name: p.name, item: url },
    ],
  };

  return { productSchema, faqSchema, breadcrumb };
}
