import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { RoleProvider } from '@/contexts/RoleContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Bell24H - India's #1 Voice & Video RFQ Marketplace",
  description: 'Post RFQs via voice, video, or text. Get bids in 24 hours.',
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
          <RoleProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
