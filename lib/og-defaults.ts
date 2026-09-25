import { SITE_URL } from '@/lib/site-url'

/**
 * Shared Open Graph defaults.
 *
 * Next.js does NOT deep-merge `openGraph` — a page-level `openGraph` object
 * fully replaces the root layout's one. Pages that set only title/description/url
 * were therefore shipping without og:image, og:type and og:site_name
 * (flagged by Ahrefs as "Open Graph tags incomplete").
 *
 * Spread this FIRST in every page-level openGraph block so page values still win:
 *   openGraph: { ...OG_DEFAULTS, title, description, url }
 */
export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: 'VyaparSethu — Protected Trade Infrastructure',
}

export const OG_DEFAULTS = {
  siteName: 'VyaparSethu',
  locale: 'en_IN',
  type: 'website' as const,
  images: [OG_IMAGE],
}
