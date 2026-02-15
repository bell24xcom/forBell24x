import { Metadata } from 'next'

interface SeoProps {
  title?: string
  description?: string
  noIndex?: boolean
  canonical?: string
  ogImage?: string
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bell24h.com'
const defaultTitle = 'Bell24h - India\'s Fastest B2B Match-Making Engine'
const defaultDescription = 'Post RFQ. Get 3 Verified Quotes in 24 Hours. Bell24h uses 200 live data signals to match you with pre-qualified Indian suppliers.'

export function generateMetadata({
  title,
  description,
  noIndex = false,
  canonical,
  ogImage
}: SeoProps): Metadata {
  const finalTitle = title ? `${title} | Bell24h` : defaultTitle
  const finalDescription = description || defaultDescription
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl

  return {
    title: finalTitle,
    description: finalDescription,
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: canonicalUrl,
      images: [
        {
          url: ogImage || `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [ogImage || `${siteUrl}/og-image.jpg`],
    },
  }
}

export default generateMetadata
