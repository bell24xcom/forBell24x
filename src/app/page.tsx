import { Metadata } from 'next';
import HeroRFQDemo from '@/components/homepage/HeroRFQDemo'

export const metadata: Metadata = {
  title: { absolute: "VyaparSethu — India's B2B Marketplace" },
  description: "VyaparSethu — India's verified B2B marketplace. Post requirements via voice, video or text. GST & Udyam verified suppliers. Protected payments. 24h quotations.",
  alternates: { canonical: 'https://www.vyaparsethu.com' },
  openGraph: {
    title: "VyaparSethu — India's B2B Marketplace",
    description: "VyaparSethu — India's verified B2B marketplace. Post requirements via voice, video or text. GST & Udyam verified suppliers. Protected payments. 24h quotations.",
    url: 'https://www.vyaparsethu.com',
    images: [{ url: 'https://www.vyaparsethu.com/og-image.png', width: 1200, height: 630, alt: "VyaparSethu — India's B2B Marketplace" }],
  },
};
import TrustIndicators from '@/components/homepage/TrustIndicators'
import CategorySidebar from '@/src/components/homepage/CategorySidebar'
import LiveRFQFeedCompact from '@/src/components/homepage/LiveRFQFeedCompact'
import StatsSidebar from '@/src/components/homepage/StatsSidebar'
import RFQTypeShowcase from '@/components/homepage/RFQTypeShowcase'
// import FeaturedDemoCarousel from '@/components/homepage/FeaturedDemoCarousel' // disabled — no real video source; was black screen + stuck spinner on prod
import AIFeaturesSection from '@/components/homepage/AIFeaturesSection'
import HowItWorks from '@/components/homepage/HowItWorks'
import FinalCTA from '@/components/homepage/FinalCTA'
import BrandVideoSection from '@/src/components/marketing/BrandVideoSection'

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I post a requirement on VyaparSethu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can post a requirement in text, voice, or video format directly from your dashboard. AI-matched supplier quotes arrive within 24 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I submit requirements by voice or video?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. VyaparSethu supports Text Requirement, Speak Requirement (voice), and Video Requirement formats. Our AI transcribes and processes all three.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does AI supplier matching work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After you post a requirement, our AI analyses your category, location, and budget to rank verified suppliers by match score and surfaces the best-fit options for you to compare.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do suppliers submit quotes on VyaparSethu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Verified suppliers browse active requirements in their product categories and submit competitive quotes with pricing and delivery terms directly on the platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is VyaparSethu free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, the Free plan lets you post up to 2 requirements per month and receive up to 5 quotes per requirement at no cost. Pro and Enterprise plans unlock unlimited quotes, AI matching, and contact unlocks.',
      },
    },
  ],
};

const speakableLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'url': 'https://www.vyaparsethu.com',
  'name': "VyaparSethu — India's B2B Marketplace",
  'speakable': {
    '@type': 'SpeakableSpecification',
    'cssSelector': ['h1', 'h2'],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1128]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableLd) }} />
      {/* 1. Hero Section - Interactive RFQ Demo */}
      <HeroRFQDemo />

      {/* 2. Trust Indicators - Stats Bar */}
      <TrustIndicators />

      {/* 3. Main Content - 3 Column Layout */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <CategorySidebar />
            </div>
          </aside>

          {/* Main Feed - Live RFQs */}
          <main className="lg:col-span-6">
            <LiveRFQFeedCompact />
          </main>

          {/* Right Sidebar - Stats & Featured */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <StatsSidebar />
            </div>
          </aside>
        </div>
      </div>

      {/* RFQ Type Showcase */}
      <RFQTypeShowcase />

      {/* Featured Demo Carousel — disabled pending real demo content */}

      {/* AI Features Section */}
      <AIFeaturesSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Brand Video */}
      <BrandVideoSection />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  )
}
