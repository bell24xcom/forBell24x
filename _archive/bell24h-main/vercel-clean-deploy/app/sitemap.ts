import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bell24h.com'

  const staticPages = [
    '',
    '/marketplace',
    '/suppliers',
    '/rfq/create',
    '/register',
    '/login',
    '/dashboard/ai-features',
    '/fintech',
    '/wallet',
    '/voice-rfq',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/help'
  ]

  const categoryPages = [
    'textiles-garments',
    'pharmaceuticals',
    'agricultural-products',
    'automotive-parts',
    'it-services',
    'gems-jewelry',
    'handicrafts',
    'machinery-equipment',
    'chemicals',
    'food-processing',
    'construction',
    'metals-steel',
    'plastics',
    'paper-packaging',
    'rubber',
    'ceramics',
    'glass',
    'wood',
    'leather'
  ]

  const sitemap: MetadataRoute.Sitemap = [
    // Static pages
    ...staticPages.map(page => ({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1.0 : 0.8,
    })),

    // Category pages
    ...categoryPages.map(category => ({
      url: `${baseUrl}/categories/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  ]

  return sitemap
}
