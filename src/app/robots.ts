import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bell24h.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/private',
          '/dashboard',
          '/profile',
          '/settings',
          '/_next',
          '/api/auth'
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}