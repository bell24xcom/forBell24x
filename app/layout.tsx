import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bell24h - India\'s Fastest B2B Marketplace',
  description: 'Connect with verified suppliers and buyers across India with AI-powered matching and secure escrow payments.',
  keywords: 'B2B marketplace, suppliers, buyers, India, RFQ, escrow, AI matching',
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
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}