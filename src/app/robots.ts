import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt'],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/supplier/dashboard',
          '/supplier/profile/edit',
          '/settings',
          '/profile',
          '/api/auth',
          '/api/private',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
