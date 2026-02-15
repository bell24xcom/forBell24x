import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://bell24h.com'),
  title: {
    default: 'BELL - India\'s #1 Voice & Video B2B Platform',
    template: '%s | BELL'
  },
  description: 'Speak your RFQ in Hindi, Tamil, Telugu. Get quotes from 10K+ verified suppliers in 24 hours.',
  openGraph: {
    title: 'BELL',
    description: 'India\'s fastest AI-powered B2B marketplace',
    url: 'https://bell24h.com',
    siteName: 'BELL',
    images: ['https://bell24h.com/og.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
