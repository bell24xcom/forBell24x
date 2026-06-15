import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site-url'
import { BLOG_POSTS } from '@/src/data/blog-posts'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

// All category slugs served by /categories/[category]
const CATEGORY_SLUGS = [
  'metals-alloys', 'chemicals-petrochemicals', 'textiles-garments',
  'machinery-equipment', 'electronics-electricals', 'construction-real-estate',
  'food-beverages', 'pharmaceuticals-healthcare', 'automotive-transport',
  'plastics-rubber', 'paper-printing', 'agriculture-farming', 'it-telecom',
  'furniture-wood', 'safety-security', 'packaging-materials', 'industrial-adhesives',
  'fire-safety', 'hvac-refrigeration', 'solar-energy', 'pipes-fittings',
  'valves-actuators', 'bearings-transmission', 'fasteners-bolts', 'paints-coatings',
  'ceramics-refractories', 'laboratory-equipment', 'medical-devices',
  'agricultural-equipment', 'pumps-compressors', 'welding-equipment',
  'rubber-products', 'leather-footwear', 'lighting-fixtures', 'jewellery-gems',
  'mining-minerals', 'office-supplies', 'sports-fitness', 'toys-games',
  'transport-logistics', 'wood-timber', 'tools-hardware', 'apparel-fashion',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl,                                  lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0  },
    { url: `${siteUrl}/marketplace`,                 lastModified: new Date(), changeFrequency: 'daily',   priority: 0.95 },
    { url: `${siteUrl}/voice-rfq`,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${siteUrl}/video-rfq`,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${siteUrl}/rfq/create`,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${siteUrl}/suppliers`,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${siteUrl}/blog`,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${siteUrl}/pricing`,                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7  },
    { url: `${siteUrl}/services`,                    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7  },
    { url: `${siteUrl}/about`,                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${siteUrl}/contact`,                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6  },
    { url: `${siteUrl}/help`,                        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5  },
    { url: `${siteUrl}/terms`,                       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${siteUrl}/refund-policy`,               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${siteUrl}/cookies`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${siteUrl}/privacy`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${siteUrl}/legal/privacy-policy`,        lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${siteUrl}/legal/terms-of-service`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
  ]

  // Blog posts — static data, always available
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  // Category pages — high SEO value
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(slug => ({
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

  // Dynamic: claimed supplier profiles
  let supplierPages: MetadataRoute.Sitemap = []
  try {
    const suppliers = await prisma.user.findMany({
      where: { role: 'SUPPLIER', isClaimed: true, isActive: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    })
    supplierPages = suppliers.map(s => ({
      url: `${siteUrl}/supplier/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    }))
  } catch {
    // DB unavailable at build time — skip
  }

  return [...staticPages, ...blogPages, ...categoryPages, ...rfqPages, ...supplierPages]
}
