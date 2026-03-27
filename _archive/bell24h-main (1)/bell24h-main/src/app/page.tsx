import HeroRFQDemo from '@/components/homepage/HeroRFQDemo'
import TrustIndicators from '@/components/homepage/TrustIndicators'
import CategorySidebar from '@/components/homepage/CategorySidebar'
import LiveRFQFeedCompact from '@/components/homepage/LiveRFQFeedCompact'
import StatsSidebar from '@/components/homepage/StatsSidebar'
import CategoryGrid from '@/components/homepage/CategoryGrid'
import RFQTypeShowcase from '@/components/homepage/RFQTypeShowcase'
import FeaturedDemoCarousel from '@/components/homepage/FeaturedDemoCarousel'
import AIFeaturesSection from '@/components/homepage/AIFeaturesSection'
import HowItWorks from '@/components/homepage/HowItWorks'
import FinalCTA from '@/components/homepage/FinalCTA'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1128]">
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

      {/* Featured Demo Carousel */}
      <FeaturedDemoCarousel />

      {/* AI Features Section */}
      <AIFeaturesSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  )
}
