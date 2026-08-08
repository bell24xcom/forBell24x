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
          // Auth-gated in middleware.ts (PROTECTED_USER_PATHS) but not
          // previously listed here — not linked anywhere public, but
          // disallowing keeps crawl budget off login-redirect churn.
          '/checkout',
          '/wallet',
          '/messages',
          '/notifications',
          '/negotiation',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
