import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: "Bell24H - India's #1 Voice & Video RFQ Marketplace",
  description: 'Post RFQs via voice, video, or text. Get bids in 24 hours. AI-powered matching with verified suppliers.',
  keywords: 'B2B marketplace, suppliers, buyers, India, RFQ, voice RFQ, video RFQ, escrow, AI matching',
  authors: [{ name: 'Bell24h Team' }],
  openGraph: {
    title: 'Bell24h - India\'s Fastest B2B Marketplace',
    description: 'Connect with verified suppliers and buyers across India',
    url: 'https://www.bell24h.com',
    siteName: 'Bell24h',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bell24h B2B Marketplace',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bell24h - India\'s Fastest B2B Marketplace',
    description: 'Connect with verified suppliers and buyers across India',
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
      <body className="font-sans bg-[#0a1128] text-white antialiased">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}