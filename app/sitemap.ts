import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bell24h.com'

  const pages: Array<{ route: string; freq: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
    { route: '',              freq: 'daily',   priority: 1.0 },
    { route: '/marketplace',  freq: 'daily',   priority: 0.95 },
    { route: '/voice-rfq',    freq: 'weekly',  priority: 0.9 },
    { route: '/video-rfq',    freq: 'weekly',  priority: 0.9 },
    { route: '/rfq/create',   freq: 'weekly',  priority: 0.9 },
    { route: '/suppliers',    freq: 'weekly',  priority: 0.85 },
    { route: '/services',     freq: 'monthly', priority: 0.7 },
    { route: '/about',        freq: 'monthly', priority: 0.6 },
    { route: '/pricing',      freq: 'monthly', priority: 0.7 },
    { route: '/contact',      freq: 'monthly', priority: 0.6 },
    { route: '/help',         freq: 'monthly', priority: 0.5 },
    { route: '/legal/privacy-policy',              freq: 'yearly', priority: 0.3 },
    { route: '/legal/terms-of-service',            freq: 'yearly', priority: 0.3 },
    { route: '/legal/cancellation-refund-policy',  freq: 'yearly', priority: 0.3 },
    { route: '/legal/escrow-terms',                freq: 'yearly', priority: 0.3 },
    { route: '/legal/wallet-terms',                freq: 'yearly', priority: 0.3 },
  ]

  return pages.map(({ route, freq, priority }) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }))
}