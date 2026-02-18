import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bell24h.com'),
  title: "Bell24H - India's #1 B2B Supplier Marketplace | Voice, Video & Text RFQs",
  description: 'Connect with 10,000+ verified suppliers across 450+ categories. Post RFQs via voice, video, or text. AI-powered matching for Indian businesses.',
  keywords: 'B2B marketplace, suppliers India, RFQ, voice RFQ, video RFQ, AI matching, procurement, verified suppliers, 450 categories',
  authors: [{ name: 'BELL Technology Pvt. Ltd.' }],
  openGraph: {
    title: "Bell24H - India's #1 B2B Supplier Marketplace",
    description: 'Connect with 10,000+ verified suppliers. Post RFQs via voice, video, or text.',
    url: 'https://www.bell24h.com',
    siteName: 'Bell24H',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bell24H - B2B Supplier Marketplace',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bell24H - India's #1 B2B Supplier Marketplace",
    description: 'Connect with 10,000+ verified suppliers. Post RFQs via voice, video, or text.',
    images: ['/og-image.jpg'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans bg-[#0F172A] text-white antialiased">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
