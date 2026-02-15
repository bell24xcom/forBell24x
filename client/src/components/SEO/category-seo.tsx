'use client'

import Head from 'next/head'
import { Category } from '@/data/complete-categories'

interface CategorySEOProps {
  category: Category
  subcategory?: {
    id: string
    name: string
    slug: string
    description: string
  }
}

export function CategorySEO({ category, subcategory }: CategorySEOProps) {
  const title = subcategory 
    ? `${subcategory.name} - ${category.name} | Bell24h B2B Marketplace`
    : `${category.name} - Bell24h B2B Marketplace`
  
  const description = subcategory
    ? `Find verified ${subcategory.name.toLowerCase()} suppliers in ${category.name.toLowerCase()} category. ${subcategory.description} 24-hour RFQ response, escrow-secured payments.`
    : category.seo.metaDescription

  const keywords = subcategory
    ? [...category.seo.keywords, subcategory.name.toLowerCase(), subcategory.slug]
    : category.seo.keywords

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bell24h",
    "url": "https://www.bell24h.com",
    "description": "India's Fastest B2B Match-Making Engine for MSMEs",
    "sameAs": [
      "https://www.linkedin.com/company/bell24h",
      "https://twitter.com/bell24h",
      "https://www.facebook.com/bell24h"
    ],
    "offers": {
      "@type": "Offer",
      "description": `${category.name} products and services`,
      "category": category.name,
      "availability": "https://schema.org/InStock"
    }
  }

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.bell24h.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Categories",
        "item": "https://www.bell24h.com/categories"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.name,
        "item": `https://www.bell24h.com/categories/${category.slug}`
      }
    ]
  }

  if (subcategory) {
    breadcrumbStructuredData.itemListElement.push({
      "@type": "ListItem",
      "position": 4,
      "name": subcategory.name,
      "item": `https://www.bell24h.com/categories/${category.slug}/${subcategory.slug}`
    })
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Bell24h" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`https://www.bell24h.com/categories/${category.slug}${subcategory ? `/${subcategory.slug}` : ''}`} />
      <meta property="og:site_name" content="Bell24h" />
      <meta property="og:image" content={`https://www.bell24h.com/images/categories/${category.slug}.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${category.name} - Bell24h B2B Marketplace`} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bell24h" />
      <meta name="twitter:creator" content="@bell24h" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://www.bell24h.com/images/categories/${category.slug}.jpg`} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#2563EB" />
      <meta name="msapplication-TileColor" content="#2563EB" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Bell24h" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://www.bell24h.com/categories/${category.slug}${subcategory ? `/${subcategory.slug}` : ''}`} />
      
      {/* Alternate Language Versions */}
      <link rel="alternate" hrefLang="en" href={`https://www.bell24h.com/categories/${category.slug}${subcategory ? `/${subcategory.slug}` : ''}`} />
      <link rel="alternate" hrefLang="hi" href={`https://www.bell24h.com/hi/categories/${category.slug}${subcategory ? `/${subcategory.slug}` : ''}`} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />
      
      {/* Additional Meta Tags for B2B */}
      <meta name="business:category" content={category.name} />
      <meta name="business:supplier_count" content={category.supplierCount.toString()} />
      <meta name="business:product_count" content={category.productCount.toString()} />
      <meta name="business:rfq_count" content={category.rfqCount.toString()} />
      
      {/* Geo Tags for Indian Market */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      <meta name="geo.placename" content="India" />
      
      {/* Industry Specific Tags */}
      <meta name="industry" content="B2B Marketplace" />
      <meta name="target-audience" content="MSME, Manufacturers, Suppliers, Buyers" />
      <meta name="business-model" content="B2B Marketplace with Escrow" />
      
      {/* Trust and Security Tags */}
      <meta name="trust:escrow" content="ICICI Bank Partner" />
      <meta name="trust:verification" content="GST & PAN Verified" />
      <meta name="trust:ai-scoring" content="AI Trust-Score" />
      <meta name="trust:made-in-india" content="Made in India 🇮🇳" />
    </Head>
  )
}

// SEO Component for Category List Pages
export function CategoryListSEO({ categories }: { categories: Category[] }) {
  const title = "All Categories - Bell24h B2B Marketplace"
  const description = `Explore all ${categories.length} categories on Bell24h B2B marketplace. Find verified suppliers, post RFQs, and get quotes in 24 hours. Escrow-secured payments, GST-verified suppliers.`
  const keywords = [
    'b2b marketplace',
    'categories',
    'suppliers',
    'manufacturers',
    'wholesale',
    'rfq',
    'escrow',
    'verified suppliers',
    'gst verified',
    'ai trust score',
    'made in india'
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "B2B Categories",
    "description": "Complete list of business categories on Bell24h marketplace",
    "numberOfItems": categories.length,
    "itemListElement": categories.map((category, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": category.name,
      "description": category.description,
      "url": `https://www.bell24h.com/categories/${category.slug}`
    }))
  }

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://www.bell24h.com/categories" />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Canonical */}
      <link rel="canonical" href="https://www.bell24h.com/categories" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </Head>
  )
}

// SEO Component for Categories Dashboard
export function CategoriesDashboardSEO() {
  const title = "Categories Dashboard - Bell24h B2B Marketplace"
  const description = "Comprehensive dashboard showing all 50 categories with mock order data, supplier counts, and RFQ statistics. Explore trending categories and business opportunities."
  const keywords = [
    'categories dashboard',
    'b2b dashboard',
    'mock orders',
    'supplier statistics',
    'rfq analytics',
    'trending categories',
    'business insights'
  ]

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://www.bell24h.com/categories-dashboard" />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Canonical */}
      <link rel="canonical" href="https://www.bell24h.com/categories-dashboard" />
    </Head>
  )
}

export default CategorySEO
