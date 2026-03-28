import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { DashboardProvider } from '@/contexts/DashboardContext'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bell24h.com'),
  title: {
    default: 'Bell24h — B2B Marketplace | Voice & Video RFQs',
    template: '%s | Bell24h',
  },
  description: "India's #1 B2B supplier marketplace. Post RFQs via voice, video, or text. AI-powered matching across 450+ categories.",
  keywords: ['B2B marketplace India', 'voice RFQ', 'video RFQ', 'supplier marketplace', 'procurement platform', 'AI supplier matching', 'verified suppliers India', 'B2B procurement'],
  authors: [{ name: 'Digitex Studio' }],
  formatDetection: { email: false, telephone: false },
  alternates: { canonical: '/' },
  openGraph: {
    title: "Bell24h — India's B2B Marketplace",
    description: "Post RFQs via voice, video, or text. AI-powered matching across 450+ categories.",
    url: 'https://www.bell24h.com',
    siteName: 'Bell24h',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bell24h - B2B Supplier Marketplace',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bell24h — India's B2B Marketplace",
    description: "Post RFQs via voice, video, or text. AI-powered matching across 450+ categories.",
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
      <body className="font-sans bg-[#0F172A] text-white antialiased">
        <DashboardProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </DashboardProvider>
      </body>
    </html>
  )
}
