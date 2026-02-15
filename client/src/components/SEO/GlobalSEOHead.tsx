/**
 * Global SEO Head Component
 *
 * Generates country-specific SEO meta tags, structured data, and hreflang tags
 * for all 75+ target countries - Now router-independent for SSR safety
 */

import React from 'react';
import Head from 'next/head';
import {
  GLOBAL_SEO_CONFIG,
  GLOBAL_META_TEMPLATES,
  HREFLANG_CONFIG,
  STRUCTURED_DATA_TEMPLATES,
  generateLocalBusinessSchema,
  CountrySEO,
} from '@/data/global-seo-config';

interface GlobalSEOHeadProps {
  countryCode?: string;
  pageType?: 'homepage' | 'category' | 'supplier' | 'search' | 'about';
  category?: string;
  supplierName?: string;
  city?: string;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string[];
  structuredData?: any;
  noindex?: boolean;
  canonicalUrl?: string;
  currentPath?: string; // Now passed as prop instead of using router
}

export default function GlobalSEOHead({
  countryCode = 'IN',
  pageType = 'homepage',
  category,
  supplierName,
  city,
  customTitle,
  customDescription,
  customKeywords = [],
  structuredData,
  noindex = false,
  canonicalUrl,
  currentPath = '/',
}: GlobalSEOHeadProps) {
  const country = GLOBAL_SEO_CONFIG[countryCode] || GLOBAL_SEO_CONFIG['IN'];

  // Generate dynamic meta content
  const generateMetaContent = () => {
    const templates = GLOBAL_META_TEMPLATES[pageType];

    if (customTitle && customDescription) {
      return {
        title: customTitle,
        description: customDescription,
        keywords: customKeywords.join(', '),
      };
    }

    let title = templates.title;
    let description = templates.description;
    let keywords = templates.keywords;

    // Replace placeholders
    const replacements = {
      '{country}': country.name,
      '{localSuppliers}': country.localSuppliers.toLocaleString(),
      '{category}': category || 'Products',
      '{supplierCount}': country.localSuppliers.toLocaleString(),
      '{topIndustry}': country.topIndustries[0],
      '{companyName}': supplierName || 'Company',
      '{city}': city || 'City',
      '{rating}': '8.5',
      '{certifications}': country.certifications.join(', '),
      '{products}': category || 'products',
    };

    Object.entries(replacements).forEach(([key, value]) => {
      title = title.replace(new RegExp(key, 'g'), value);
      description = description.replace(new RegExp(key, 'g'), value);
      keywords = keywords.replace(new RegExp(key, 'g'), value);
    });

    return { title, description, keywords };
  };

  const metaContent = generateMetaContent();
  const currentUrl = `https://${country.domain}${currentPath}`;

  // Generate structured data
  const generateStructuredData = () => {
    const baseSchemas = [
      STRUCTURED_DATA_TEMPLATES.organization(country),
      STRUCTURED_DATA_TEMPLATES.marketplace(country),
      generateLocalBusinessSchema(country),
    ];

    if (structuredData) {
      baseSchemas.push(structuredData);
    }

    // Add breadcrumb schema
    if (pageType === 'category' && category) {
      baseSchemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `https://${country.domain}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Categories',
            item: `https://${country.domain}/categories`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category,
            item: `https://${country.domain}/categories/${category.toLowerCase()}`,
          },
        ],
      } as any);
    }

    return baseSchemas;
  };

  const schemas = generateStructuredData();

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaContent.title}</title>
      <meta name='description' content={metaContent.description} />
      <meta name='keywords' content={metaContent.keywords} />

      {/* Robots */}
      <meta name='robots' content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name='googlebot' content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      <link rel='canonical' href={canonicalUrl || currentUrl} />

      {/* Language and Regional */}
      <meta name='language' content={country.language} />
      <meta name='geo.region' content={country.code} />
      <meta name='geo.placename' content={country.name} />

      {/* Currency and Business */}
      <meta name='currency' content={country.currency} />
      <meta name='business.hours' content={country.localBusinessHours} />

      {/* Hreflang Tags for All Countries */}
      {HREFLANG_CONFIG.map(hreflang => (
        <link
          key={hreflang.hreflang}
          rel='alternate'
          hrefLang={hreflang.hreflang}
          href={`${hreflang.href}${currentPath}`}
        />
      ))}

      {/* Self-referencing hreflang */}
      <link rel='alternate' hrefLang='x-default' href={`https://bell24h.com${currentPath}`} />

      {/* Open Graph Tags */}
      <meta property='og:type' content='website' />
      <meta property='og:title' content={metaContent.title} />
      <meta property='og:description' content={metaContent.description} />
      <meta property='og:url' content={currentUrl} />
      <meta property='og:site_name' content={`Bell24H ${country.name}`} />
      <meta
        property='og:image'
        content={`https://${country.domain}/images/og-bell24h-${country.code.toLowerCase()}.jpg`}
      />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt' content={`Bell24H ${country.name} B2B Marketplace`} />
      <meta property='og:locale' content={country.hreflang} />

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={metaContent.title} />
      <meta name='twitter:description' content={metaContent.description} />
      <meta
        name='twitter:image'
        content={`https://${
          country.domain
        }/images/twitter-bell24h-${country.code.toLowerCase()}.jpg`}
      />
      <meta name='twitter:site' content='@bell24h' />
      <meta name='twitter:creator' content='@bell24h' />

      {/* Business-specific Meta Tags */}
      <meta
        name='business:contact_data:street_address'
        content={`Bell24H ${country.name} Office`}
      />
      <meta name='business:contact_data:locality' content={country.name} />
      <meta name='business:contact_data:region' content={country.name} />
      <meta name='business:contact_data:postal_code' content='00000' />
      <meta name='business:contact_data:country_name' content={country.name} />
      <meta name='business:contact_data:phone_number' content='+91-80-4040-7000' />
      <meta name='business:contact_data:website' content={`https://${country.domain}`} />

      {/* Structured Data JSON-LD */}
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Additional Meta Tags for SEO */}
      <meta name='author' content='Bell24H Global' />
      <meta name='publisher' content='Bell24H Global' />
      <meta name='copyright' content='© 2024 Bell24H Global' />
      <meta name='rating' content='general' />
      <meta name='distribution' content='global' />
      <meta name='revisit-after' content='7 days' />
      <meta name='expires' content='never' />

      {/* Mobile Optimization */}
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta name='mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />

      {/* Preconnect for Performance */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
      <link rel='preconnect' href='https://www.google-analytics.com' />

      {/* Favicon and Icons */}
      <link rel='icon' href='/favicon.ico' />
      <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
      <link rel='manifest' href='/manifest.json' />

      {/* DNS Prefetch */}
      <link rel='dns-prefetch' href='//www.google.com' />
      <link rel='dns-prefetch' href='//www.googletagmanager.com' />
      <link rel='dns-prefetch' href='//fonts.googleapis.com' />
    </Head>
  );
}

// Safe hook for using global SEO configuration in pages (not in Head component)
export const useGlobalSEO = (countryCode: string = 'IN') => {
  const country = GLOBAL_SEO_CONFIG[countryCode] || GLOBAL_SEO_CONFIG['IN'];

  return {
    country,
    generateMetaTitle: (template: string, replacements: Record<string, string>) => {
      let title = template;
      Object.entries(replacements).forEach(([key, value]) => {
        title = title.replace(new RegExp(`{${key}}`, 'g'), value);
      });
      return title;
    },
    generateCanonicalUrl: (path: string = '/') => {
      return `https://${country.domain}${path}`;
    },
  };
};

// Export types for TypeScript
export type { GlobalSEOHeadProps, CountrySEO };
