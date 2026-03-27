import type { Metadata } from 'next';
import HeroRFQDemo from '@/components/homepage/HeroRFQDemo';
import TrustIndicators from '@/components/homepage/TrustIndicators';
import CategoryGrid from '@/components/homepage/CategoryGrid';
import LiveRFQFeed from '@/components/homepage/LiveRFQFeed';
import RFQTypeShowcase from '@/components/homepage/RFQTypeShowcase';
import FeaturedDemoCarousel from '@/components/homepage/FeaturedDemoCarousel';
import AIFeaturesSection from '@/components/homepage/AIFeaturesSection';
import HowItWorks from '@/components/homepage/HowItWorks';
import FinalCTA from '@/components/homepage/FinalCTA';

export const metadata: Metadata = {
  title: "Bell24H - India's #1 AI-Powered Voice & Video RFQ Marketplace | B2B Procurement Platform",
  description: 'Transform your B2B procurement with Bell24H. Post RFQs via voice, video, or text in 12+ Indian languages. Get competitive bids from 10,000+ verified suppliers in 24 hours. AI-powered RFQ system for faster, smarter B2B transactions.',
  keywords: [
    'RFQ marketplace India',
    'B2B procurement platform',
    'voice RFQ',
    'video RFQ',
    'AI-powered RFQ',
    'supplier marketplace',
    'B2B e-commerce India',
    'procurement automation',
    'request for quotation',
    'Indian suppliers',
    'business marketplace',
    'industrial procurement',
    'voice to RFQ',
    'video to RFQ',
    'multilingual RFQ',
  ],
  authors: [{ name: 'Bell24H' }],
  creator: 'Bell24H',
  publisher: 'Bell24H',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bell24h.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Bell24H - India's #1 AI-Powered Voice & Video RFQ Marketplace",
    description: 'Post RFQs via voice, video, or text. Get bids from 10,000+ verified suppliers in 24 hours. AI-powered B2B procurement platform.',
    url: 'https://bell24h.com',
    siteName: 'Bell24H',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bell24H - AI-Powered RFQ Marketplace',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bell24H - India's #1 AI-Powered RFQ Marketplace",
    description: 'Post RFQs via voice, video, or text. Get bids from 10,000+ verified suppliers in 24 hours.',
    images: ['/og-image.jpg'],
    creator: '@bell24h',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function HomePage() {
  // Structured Data for SEO (JSON-LD)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bell24H',
    url: 'https://bell24h.com',
    logo: 'https://bell24h.com/logo.png',
    description: "India's #1 AI-Powered Voice & Video RFQ Marketplace for B2B Procurement",
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Punjabi', 'Odia', 'Assamese'],
    },
    sameAs: [
      'https://www.linkedin.com/company/bell24h',
      'https://twitter.com/bell24h',
      'https://www.facebook.com/bell24h',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bell24H',
    url: 'https://bell24h.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://bell24h.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'B2B Marketplace',
    provider: {
      '@type': 'Organization',
      name: 'Bell24H',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    description: 'AI-powered RFQ marketplace supporting voice, video, and text-based request for quotations. Connect with 10,000+ verified suppliers across India.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: 'Free to start, no credit card required',
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <div className="min-h-screen bg-[#0a1128]">
        {/* Hero Section - Interactive RFQ Demo */}
        <HeroRFQDemo />

      {/* Trust Indicators - Stats Bar */}
      <TrustIndicators />

      {/* Main Content - 3 Column Layout */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <CategoryGrid />
            </div>
          </aside>

          {/* Main Feed - Live RFQs */}
          <main className="lg:col-span-6">
            <LiveRFQFeed />
          </main>

          {/* Right Sidebar - Stats & Featured */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Quick Stats */}
              <div className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-4 text-white">Platform Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">10,000+</p>
                    <p className="text-sm text-gray-400">Verified Suppliers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">₹500Cr+</p>
                    <p className="text-sm text-gray-400">Transaction Value</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">2,500+</p>
                    <p className="text-sm text-gray-400">Demo RFQs Available</p>
                  </div>
                </div>
              </div>

              {/* Featured Categories */}
              <div className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-4 text-white">Trending This Week</h3>
                <div className="space-y-2">
                  <a href="/categories/steel" className="block p-3 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                    <p className="font-medium text-white">Steel & Metal</p>
                    <p className="text-sm text-gray-400">50+ active RFQs</p>
                  </a>
                  <a href="/categories/electronics" className="block p-3 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                    <p className="font-medium text-white">Electronics</p>
                    <p className="text-sm text-gray-400">35+ active RFQs</p>
                  </a>
                  <a href="/categories/textiles" className="block p-3 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                    <p className="font-medium text-white">Textiles</p>
                    <p className="text-sm text-gray-400">28+ active RFQs</p>
                  </a>
                </div>
              </div>
        </div>
          </aside>
        </div>
      </div>

      {/* RFQ Type Showcase */}
      <RFQTypeShowcase />

      {/* Featured Demo Carousel */}
      <FeaturedDemoCarousel />

      {/* AI Features Section */}
      <AIFeaturesSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Final CTA */}
      <FinalCTA />
      </div>
    </>
  );
}
