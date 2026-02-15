/**
 * Local Business Schema Component
 *
 * Generates country-specific local business schema markup for improved local SEO
 */

import React from 'react';
import { GLOBAL_SEO_CONFIG } from '@/data/global-seo-config';

interface LocalBusinessSchemaProps {
  countryCode: string;
  category?: string;
  supplierName?: string;
  address?: string;
  phone?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  openingHours?: string[];
  services?: string[];
  certifications?: string[];
}

export default function LocalBusinessSchema({
  countryCode,
  category,
  supplierName,
  address,
  phone,
  email,
  rating = 4.8,
  reviewCount = 5000,
  priceRange = '$$',
  openingHours,
  services,
  certifications,
}: LocalBusinessSchemaProps) {
  const country = GLOBAL_SEO_CONFIG[countryCode] || GLOBAL_SEO_CONFIG['IN'];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: supplierName || `Bell24H ${country.name}`,
    image: [
      `https://${country.domain}/images/business-1x1.jpg`,
      `https://${country.domain}/images/business-4x3.jpg`,
      `https://${country.domain}/images/business-16x9.jpg`,
    ],
    priceRange: priceRange,
    telephone: phone || '+91-80-4040-7000',
    email: email || 'support@bell24h.com',
    url: `https://${country.domain}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address || `Bell24H ${country.name} Office`,
      addressLocality: country.name,
      addressRegion: country.name,
      postalCode: '000000',
      addressCountry: country.code,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: getCountryCoordinates(country.code).lat,
      longitude: getCountryCoordinates(country.code).lng,
    },
    openingHoursSpecification: generateOpeningHours(
      openingHours || [
        'Monday 09:00-18:00',
        'Tuesday 09:00-18:00',
        'Wednesday 09:00-18:00',
        'Thursday 09:00-18:00',
        'Friday 09:00-18:00',
        'Saturday 09:00-16:00',
      ]
    ),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    currenciesAccepted: country.currency,
    paymentAccepted: country.paymentMethods,
    areaServed: {
      '@type': 'Country',
      name: country.name,
      sameAs: `https://en.wikipedia.org/wiki/${country.name.replace(/\s+/g, '_')}`,
    },
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: getCountryCoordinates(country.code).lat,
        longitude: getCountryCoordinates(country.code).lng,
      },
      geoRadius: '1000000', // 1000km radius
    },
    knowsAbout: [
      'B2B Marketplace',
      'Supplier Verification',
      'International Trade',
      'Procurement Solutions',
      ...(services || country.topIndustries),
    ],
    memberOf: {
      '@type': 'Organization',
      name: 'Bell24H Global Network',
      url: 'https://bell24h.com',
    },
    sameAs: [
      `https://www.linkedin.com/company/bell24h-${country.code.toLowerCase()}`,
      `https://twitter.com/bell24h_${country.code.toLowerCase()}`,
      `https://facebook.com/bell24h${country.code.toLowerCase()}`,
    ],
    hasCredential:
      certifications ||
      country.certifications.map(cert => ({
        '@type': 'EducationalOccupationalCredential',
        name: cert,
        credentialCategory: 'Professional Certification',
      })),
  };

  // Add category-specific schema if category is provided
  if (category) {
    (schema as any)['@type'] = ['LocalBusiness', 'Store'];
    (schema as any)[
      'description'
    ] = `Leading ${category} supplier in ${country.name} with verified products and services`;
    (schema as any)['brand'] = {
      '@type': 'Brand',
      name: `Bell24H ${category}`,
      logo: `https://${country.domain}/logo.png`,
    };
    (schema as any)['makesOffer'] = {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: `${category} Products`,
        category: category,
      },
      priceCurrency: country.currency,
      seller: {
        '@type': 'Organization',
        name: supplierName || `Bell24H ${country.name}`,
      },
    };
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
}

// Helper function to get country coordinates
function getCountryCoordinates(countryCode: string): { lat: number; lng: number } {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    IN: { lat: 20.5937, lng: 78.9629 },
    US: { lat: 39.8283, lng: -98.5795 },
    GB: { lat: 55.3781, lng: -3.436 },
    DE: { lat: 51.1657, lng: 10.4515 },
    FR: { lat: 46.6034, lng: 1.8883 },
    JP: { lat: 36.2048, lng: 138.2529 },
    AU: { lat: -25.2744, lng: 133.7751 },
    CA: { lat: 56.1304, lng: -106.3468 },
    SG: { lat: 1.3521, lng: 103.8198 },
    AE: { lat: 23.4241, lng: 53.8478 },
    SA: { lat: 23.8859, lng: 45.0792 },
    BR: { lat: -14.235, lng: -51.9253 },
    KR: { lat: 35.9078, lng: 127.7669 },
    CH: { lat: 46.8182, lng: 8.2275 },
    SE: { lat: 60.1282, lng: 18.6435 },
    OM: { lat: 21.4735, lng: 55.9754 },
  };

  return coordinates[countryCode] || coordinates['IN'];
}

// Helper function to generate opening hours schema
function generateOpeningHours(hours: string[]) {
  return hours.map(hour => {
    const [day, time] = hour.split(' ');
    const [opens, closes] = time.split('-');

    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day,
      opens: opens,
      closes: closes,
    };
  });
}

// Hook for generating multiple business schemas
export function useLocalBusinessSchemas(countryCode: string) {
  const country = GLOBAL_SEO_CONFIG[countryCode] || GLOBAL_SEO_CONFIG['IN'];

  const generateSupplierSchema = (supplierData: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: supplierData.name,
    description: `Verified ${supplierData.category} supplier in ${country.name}`,
    url: `https://${country.domain}/suppliers/${supplierData.id}`,
    logo: supplierData.logo,
    address: {
      '@type': 'PostalAddress',
      addressCountry: country.code,
      addressLocality: supplierData.city || country.name,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: supplierData.phone,
      contactType: 'Sales',
      areaServed: country.code,
      availableLanguage: country.language,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: supplierData.rating,
      reviewCount: supplierData.reviewCount,
      bestRating: 10,
      worstRating: 1,
    },
    foundingDate: supplierData.foundedYear,
    numberOfEmployees: supplierData.employeeCount,
    knowsAbout: [supplierData.category, ...supplierData.specializations],
    memberOf: {
      '@type': 'Organization',
      name: 'Bell24H Verified Suppliers',
      url: `https://${country.domain}/verified-suppliers`,
    },
    hasCredential:
      supplierData.certifications?.map((cert: string) => ({
        '@type': 'EducationalOccupationalCredential',
        name: cert,
        credentialCategory: 'Industry Certification',
      })) || [],
  });

  const generateCategorySchema = (categoryData: any) => ({
    '@context': 'https://schema.org',
    '@type': 'CategoryCode',
    name: categoryData.name,
    description: `${categoryData.name} suppliers and manufacturers in ${country.name}`,
    url: `https://${country.domain}/categories/${categoryData.id}`,
    inCodeSet: {
      '@type': 'CategoryCodeSet',
      name: 'Bell24H Categories',
      url: `https://${country.domain}/categories`,
    },
    codeValue: categoryData.id,
    about: categoryData.description,
    hasCategoryCode:
      categoryData.subcategories?.map((sub: any) => ({
        '@type': 'CategoryCode',
        name: sub.name,
        codeValue: sub.id,
        url: `https://${country.domain}/categories/${categoryData.id}/${sub.id}`,
      })) || [],
  });

  return {
    generateSupplierSchema,
    generateCategorySchema,
    country,
  };
}
