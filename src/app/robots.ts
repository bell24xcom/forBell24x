import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/supplier/dashboard',
          '/supplier/profile/edit',
          '/settings',
          '/profile',
          '/_next',
          '/api/auth',
          '/api/private',
        ],
      },
    ],
    sitemap: 'https://www.bell24h.com/sitemap.xml',
  }
}
