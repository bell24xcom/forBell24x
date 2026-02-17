'use client';

import HeroRFQDemo from '@/components/homepage/HeroRFQDemo';
import FeaturedDemoCarousel from '@/components/homepage/FeaturedDemoCarousel';
import AIFeaturesSection from '@/components/homepage/AIFeaturesSection';
import HowItWorks from '@/components/homepage/HowItWorks';
import RFQTypeShowcase from '@/components/homepage/RFQTypeShowcase';
import LiveRFQFeed from '@/components/homepage/LiveRFQFeed';
import FinalCTA from '@/components/homepage/FinalCTA';

export default function HomePage() {
  return (
    <div className="bg-[#0a1128] min-h-screen">
      {/* Hero Section with Voice/Video/Text RFQ Demo */}
      <HeroRFQDemo />

      {/* Featured Demo RFQs Carousel */}
      <FeaturedDemoCarousel />

      {/* AI-Powered Features */}
      <AIFeaturesSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Try Different RFQ Types */}
      <RFQTypeShowcase />

      {/* Live RFQ Feed */}
      <LiveRFQFeed />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
}
