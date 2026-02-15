import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bell24h.com'
  
  const routes = [
    '',
    '/suppliers',
    '/rfq',
    '/services',
    '/about',
    '/pricing',
    '/contact',
    '/help',
    '/legal/privacy-policy',
    '/legal/terms-of-service',
    '/legal/cancellation-refund-policy',
    '/legal/escrow-terms',
    '/legal/wallet-terms',
    '/legal/shipping-policy',
    '/legal/pricing-policy',
    '/legal/aml-policy',
    '/legal/escrow-services',
    '/upload-invoice',
  ]

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}