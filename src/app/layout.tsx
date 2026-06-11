import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/src/components/legal/CookieBanner'
import { DashboardProvider } from '@/contexts/DashboardContext'
import { AuthProvider } from '@/src/app/contexts/AuthContext'
import { SITE_URL } from '@/lib/site-url'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VyaparSethu — Protected Trade Infrastructure',
    template: '%s | VyaparSethu',
  },
  description: "VyaparSethu — Verified suppliers, protected payments, faster quotations for Indian MSMEs.",
  keywords: ['B2B marketplace India', 'voice RFQ', 'video RFQ', 'supplier marketplace', 'procurement platform', 'AI supplier matching', 'verified suppliers India', 'B2B procurement'],
  authors: [{ name: 'Digitex Studio' }],
  formatDetection: { email: false, telephone: false },
  alternates: { canonical: '/' },
  openGraph: {
    title: "VyaparSethu — Protected Trade Infrastructure",
    description: "Verified suppliers, protected payments, faster quotations for Indian MSMEs.",
    url: SITE_URL,
    siteName: 'VyaparSethu',
    images: [
      {
        url: 'https://www.vyaparsethu.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VyaparSethu — Protected Trade Infrastructure',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "VyaparSethu — Protected Trade Infrastructure",
    description: "Verified suppliers, protected payments, faster quotations for Indian MSMEs.",
    images: ['https://www.vyaparsethu.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "VyaparSethu",
              "alternateName": "Bell24h",
              "url": SITE_URL,
              "logo": `${SITE_URL}/og-image.png`,
              "description": "Protected Trade Infrastructure for Indian MSMEs — Verified Suppliers, Protected Payments, Faster Quotations.",
              "foundingDate": "2026",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-90049-62871",
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": ["English", "Hindi"]
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Flat No. 1204, 12th Floor, Casa Sereno B1, Mankoli Road, Off Mumbai-Nashik Highway, Anjur, Bhiwandi",
                "addressLocality": "Thane",
                "postalCode": "421302",
                "addressRegion": "Maharashtra",
                "addressCountry": "IN"
              },
              "sameAs": [
                "https://www.linkedin.com/company/vyaparsethu",
                "https://twitter.com/vyaparsethu",
                "https://instagram.com/vyaparsethu"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "VyaparSethu",
              "url": SITE_URL,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${SITE_URL}/marketplace?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="font-sans bg-[#0F172A] text-white antialiased">
        <AuthProvider>
          <DashboardProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <CookieBanner />
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
