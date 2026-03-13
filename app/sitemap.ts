import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { ALL_CATEGORIES } from '@/app/data/categories'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://www.bell24h.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl,                                              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${siteUrl}/marketplace`,                            lastModified: new Date(), changeFrequency: 'daily',   priority: 0.95 },
    { url: `${siteUrl}/voice-rfq`,                              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${siteUrl}/video-rfq`,                              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${siteUrl}/rfq/create`,                             lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${siteUrl}/suppliers`,                              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${siteUrl}/pricing`,                                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/services`,                               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/about`,                                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/contact`,                                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/help`,                                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/legal/privacy-policy`,                   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${siteUrl}/legal/terms-of-service`,                 lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${siteUrl}/legal/cancellation-refund-policy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${siteUrl}/legal/escrow-terms`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${siteUrl}/legal/wallet-terms`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // Category pages (static — from categories data file)
  const categoryPages: MetadataRoute.Sitemap = ALL_CATEGORIES.map(cat => ({
    url: `${siteUrl}/marketplace?category=${encodeURIComponent(cat.name)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Dynamic: active public RFQs (non-seeded, to avoid bloating with fake data)
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
    // DB unavailable at build time — skip dynamic pages
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
    // DB unavailable at build time — skip dynamic pages
  }

  return [...staticPages, ...categoryPages, ...rfqPages, ...supplierPages]
}
