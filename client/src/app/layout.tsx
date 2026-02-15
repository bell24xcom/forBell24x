import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
<<<<<<< HEAD
import { AuthProvider } from '../contexts/AuthContext'
// ErrorBoundary removed - using built-in error handling
=======
import { AuthProvider } from '@/contexts/AuthContext'
import { RoleProvider } from '@/contexts/RoleContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'Bell24H - AI-Powered B2B Marketplace',
  description: 'India\'s premier B2B marketplace connecting suppliers and buyers with AI-powered matching and analytics.',
=======
  title: "Bell24H - India's #1 Voice & Video RFQ Marketplace",
  description: 'Post RFQs via voice, video, or text. Get bids in 24 hours.',
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
<<<<<<< HEAD
    <html lang="en">
      <head>
        {/* Razorpay Script for Payment Integration */}
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
=======
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
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
        </AuthProvider>
      </body>
    </html>
  )
}
