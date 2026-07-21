import { MetadataRoute } from 'next'
import { prisma } from '@/src/lib/prisma'
import { SITE_URL } from '@/lib/site-url'
import { BLOG_POSTS } from '@/src/data/blog-posts'
import { getAllCityCategoryPairs, CITIES } from '@/src/data/city-category-seo'
import { GLOSSARY_TERMS } from '@/src/data/glossary'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

// Build-time-DB-unavailable fallback only — verified against the real
// Category table (36 of the previous 43 static slugs didn't exist in the
// DB at all, which was submitting nonexistent category URLs to Google
// and causing Soft 404s). The real, current category list always comes
// from the DB query below; this is only used if that query throws.
const CATEGORY_SLUGS = [
  'packaging-materials', 'fire-safety', 'medical-devices', 'welding-equipment',
  'office-supplies', 'toys-games', 'apparel-fashion',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl,                                  lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0  },
    { url: `${siteUrl}/marketplace`,                 lastModified: new Date(), changeFrequency: 'daily',   priority: 0.95 },
    { url: `${siteUrl}/how-it-works`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9  },
    { url: `${siteUrl}/founding-suppliers`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${siteUrl}/how-payment-works`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
    { url: `${siteUrl}/how-verification-works`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
    { url: `${siteUrl}/voice-rfq`,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${siteUrl}/video-rfq`,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${siteUrl}/rfq/create`,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${siteUrl}/suppliers`,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${siteUrl}/location`,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.86 },
    { url: `${siteUrl}/industrial-cluster`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.87 },
    // INTELLIGENCE_LAYER — excluded from sitemap until Phase D gate opens
    { url: `${siteUrl}/blog`,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${siteUrl}/pricing`,                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7  },
    { url: `${siteUrl}/about`,                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${siteUrl}/contact`,                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6  },
    { url: `${siteUrl}/press`,                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6  },
    { url: `${siteUrl}/media-kit`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6  },
    { url: `${siteUrl}/help`,                        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5  },
    { url: `${siteUrl}/terms`,                       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${siteUrl}/refund-policy`,               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${siteUrl}/cookies`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${siteUrl}/privacy`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
  ]

  // Blog posts — static data, always available
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  // Category pages — high SEO value
  let categorySlugs = CATEGORY_SLUGS
  try {
    const dbCategories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    categorySlugs = Array.from(new Set([...CATEGORY_SLUGS, ...dbCategories.map(c => c.slug)]))
  } catch {
    // DB unavailable at build time — fall back to the static list
  }

  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map(slug => ({
    url: `${siteUrl}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic: active public RFQs
  let rfqPages: MetadataRoute.Sitemap = []
  try {
    const rfqs = await prisma.rFQ.findMany({
      where: { status: 'ACTIVE', isPublic: true, isSeeded: false },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    })
    rfqPages = rfqs.map(rfq => ({
      url: `${siteUrl}/rfq/${rfq.id}`,
      lastModified: rfq.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {
    // DB unavailable at build time — skip
  }

  // Dynamic: claimed supplier profiles + product pages
  let supplierPages: MetadataRoute.Sitemap = []
  let productPages: MetadataRoute.Sitemap = []
  try {
    const suppliers = await prisma.user.findMany({
      where: { role: 'SUPPLIER', isClaimed: true, isActive: true },
      select: { id: true, updatedAt: true, preferences: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    })
    supplierPages = suppliers.map(s => ({
      url: `${siteUrl}/supplier/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    }))

    const { normalizeProducts } = await import('@/src/lib/supplier-products')
    for (const s of suppliers) {
      const prefs = (s.preferences ?? {}) as { products?: unknown }
      for (const p of normalizeProducts(prefs.products)) {
        productPages.push({
          url: `${siteUrl}/supplier/${s.id}/products/${p.slug}`,
          lastModified: s.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })
      }
    }
  } catch {
    // DB unavailable at build time — skip
  }

  // FAQ, compare, tools hub, and individual tool pages
  const contentPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/faq`,                                              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${siteUrl}/compare/vyaparsethu-vs-indiamart`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.80 },
    { url: `${siteUrl}/tools`,                                            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.80 },
    { url: `${siteUrl}/tools/hsn-lookup`,                                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/tools/gst-calculator`,                             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/tools/packaging-calculator`,                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
  ]

  // Glossary index + individual term pages
  const glossaryPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/glossary`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.80 },
    ...GLOSSARY_TERMS.map(t => ({
      url: `${siteUrl}/glossary/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.78,
    })),
  ]

  // City hub pages (/suppliers/[city])
  const cityPages: MetadataRoute.Sitemap = Object.keys(CITIES).map(citySlug => ({
    url: `${siteUrl}/suppliers/${citySlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.82,
  }))

  // Location intelligence pages (/location/[area]) — Business Pulse SEO
  const locationPages: MetadataRoute.Sitemap = Object.keys(CITIES).map(areaSlug => ({
    url: `${siteUrl}/location/${areaSlug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.84,
  }))

  // INTELLIGENCE_LAYER — excluded from sitemap until Phase D gate opens

  // City×Category landing pages (/suppliers/[city]/[category])
  const cityCategoryPages: MetadataRoute.Sitemap = getAllCityCategoryPairs().map(({ city, category }) => ({
    url: `${siteUrl}/suppliers/${city}/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.88,
  }))

  return [...staticPages, ...blogPages, ...categoryPages, ...contentPages, ...glossaryPages, ...cityPages, ...locationPages, ...cityCategoryPages, ...rfqPages, ...supplierPages, ...productPages]
}
