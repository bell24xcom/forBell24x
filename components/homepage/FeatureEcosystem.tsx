'use client';

import { useState } from 'react';

interface Feature {
  name: string;
  description: string;
  icon: string;
  category: 'buyer' | 'supplier' | 'platform';
  benefits: string[];
}

const features: Feature[] = [
  // Buyer Features
  {
    name: "AI-Powered Supplier Matching",
    description: "Intelligent matching algorithm connects you with the best suppliers based on your requirements",
    icon: "🤖",
    category: "buyer",
    benefits: ["Instant supplier recommendations", "Quality-based matching", "Price optimization", "Lead time analysis"]
  },
  {
    name: "Voice RFQ Creation",
    description: "Create detailed RFQs using voice commands for faster, more efficient procurement",
    icon: "🎤",
    category: "buyer",
    benefits: ["Hands-free operation", "Natural language processing", "Multi-language support", "Real-time transcription"]
  },
  {
    name: "Real-time Analytics",
    description: "Comprehensive dashboards with live insights into your procurement performance",
    icon: "📊",
    category: "buyer",
    benefits: ["Spend analysis", "Supplier performance tracking", "Cost optimization insights", "Market trends"]
  },
  {
    name: "Escrow Payments",
    description: "Secure payment system with built-in escrow for risk-free transactions",
    icon: "🔒",
    category: "buyer",
    benefits: ["Payment protection", "Quality assurance", "Dispute resolution", "Secure transactions"]
  },
  {
    name: "Order Tracking",
    description: "End-to-end visibility of your orders from placement to delivery",
    icon: "📦",
    category: "buyer",
    benefits: ["Real-time updates", "Delivery notifications", "Quality inspection", "Documentation"]
  },
  {
    name: "GST Compliance",
    description: "Automated GST calculation and compliance for all transactions",
    icon: "📋",
    category: "buyer",
    benefits: ["Automatic tax calculation", "Compliance reporting", "Invoice generation", "Audit trails"]
  },

  // Supplier Features
  {
    name: "Digital Storefront",
    description: "Professional online presence with customizable product catalogs",
    icon: "🏪",
    category: "supplier",
    benefits: ["Brand customization", "Product showcase", "Lead generation", "Market reach"]
  },
  {
    name: "Quote Management",
    description: "Efficient system to respond to RFQs and manage customer inquiries",
    icon: "💼",
    category: "supplier",
    benefits: ["Quick response tools", "Pricing optimization", "Customer communication", "Order management"]
  },
  {
    name: "Inventory Management",
    description: "Real-time inventory tracking and automated stock management",
    icon: "📦",
    category: "supplier",
    benefits: ["Stock monitoring", "Automated alerts", "Demand forecasting", "Warehouse optimization"]
  },
  {
    name: "KYC Verification",
    description: "Streamlined verification process for trusted business relationships",
    icon: "✅",
    category: "supplier",
    benefits: ["Trust building", "Faster onboarding", "Compliance assurance", "Credibility enhancement"]
  },
  {
    name: "MSME Support",
    description: "Specialized features and support for Micro, Small & Medium Enterprises",
    icon: "🏢",
    category: "supplier",
    benefits: ["Government schemes", "Financial assistance", "Training programs", "Market access"]
  },
  {
    name: "Export Documentation",
    description: "Complete export documentation and compliance management",
    icon: "🌍",
    category: "supplier",
    benefits: ["Document automation", "Compliance tracking", "Customs clearance", "International shipping"]
  },

  // Platform Features
  {
    name: "Multi-language Support",
    description: "Platform available in multiple Indian languages for wider accessibility",
    icon: "🌐",
    category: "platform",
    benefits: ["Hindi, English, Tamil", "Regional language support", "Cultural adaptation", "Wider reach"]
  },
  {
    name: "Mobile Optimization",
    description: "Fully responsive design optimized for mobile devices",
    icon: "📱",
    category: "platform",
    benefits: ["Mobile-first design", "Offline capabilities", "Push notifications", "App-like experience"]
  },
  {
    name: "Advanced Search",
    description: "Powerful search with filters, sorting, and intelligent recommendations",
    icon: "🔍",
    category: "platform",
    benefits: ["Smart filters", "Price comparison", "Quality ratings", "Supplier reviews"]
  },
  {
    name: "Predictive Analytics",
    description: "AI-driven insights for market trends and business opportunities",
    icon: "📈",
    category: "platform",
    benefits: ["Market predictions", "Demand forecasting", "Price trends", "Opportunity alerts"]
  },
  {
    name: "24/7 Support",
    description: "Round-the-clock customer support in multiple languages",
    icon: "🛟",
    category: "platform",
    benefits: ["Live chat support", "Phone assistance", "Email support", "Video consultations"]
  },
  {
    name: "Security & Compliance",
    description: "Enterprise-grade security with full regulatory compliance",
    icon: "🛡️",
    category: "platform",
    benefits: ["Data encryption", "GDPR compliance", "ISO certification", "Regular audits"]
  }
];

export default function FeatureEcosystem() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'buyer' | 'supplier' | 'platform'>('all');

  const filteredFeatures = activeCategory === 'all' 
    ? features 
    : features.filter(f => f.category === activeCategory);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Platform Ecosystem
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every feature designed to streamline your B2B operations and drive growth
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All Features', count: features.length },
              { key: 'buyer', label: 'Buyer Tools', count: features.filter(f => f.category === 'buyer').length },
              { key: 'supplier', label: 'Supplier Tools', count: features.filter(f => f.category === 'supplier').length },
              { key: 'platform', label: 'Platform Features', count: features.filter(f => f.category === 'platform').length }
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredFeatures.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start mb-4">
                <span className="text-3xl mr-4">{feature.icon}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Key Benefits:</h4>
                <ul className="space-y-1">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="text-xs text-gray-600 flex items-center">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  feature.category === 'buyer' ? 'bg-blue-100 text-blue-800' :
                  feature.category === 'supplier' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {feature.category === 'buyer' ? 'Buyer Tool' :
                   feature.category === 'supplier' ? 'Supplier Tool' : 'Platform Feature'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* User Journey Visualization */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Complete User Journey
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buyer Journey */}
            <div className="bg-white rounded-xl p-6">
              <h4 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                <span className="mr-2">👤</span>
                Buyer Journey
              </h4>
              <div className="space-y-3">
                {[
                  "1. Voice RFQ Creation → AI matches with suppliers",
                  "2. Receive competitive quotes → Compare prices & quality",
                  "3. Place order with escrow protection",
                  "4. Track delivery → Quality inspection",
                  "5. Release payment → Rate supplier experience"
                ].map((step, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Journey */}
            <div className="bg-white rounded-xl p-6">
              <h4 className="text-xl font-semibold text-green-600 mb-4 flex items-center">
                <span className="mr-2">🏭</span>
                Supplier Journey
              </h4>
              <div className="space-y-3">
                {[
                  "1. Complete KYC verification → Build trust",
                  "2. Create digital storefront → Showcase products",
                  "3. Receive RFQ notifications → Submit quotes",
                  "4. Win orders → Manage inventory & delivery",
                  "5. Receive payments → Build reputation"
                ].map((step, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center bg-blue-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-600">95%</div>
            <div className="text-gray-600">Faster RFQ Processing</div>
          </div>
          <div className="text-center bg-green-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-600">40%</div>
            <div className="text-gray-600">Cost Reduction</div>
          </div>
          <div className="text-center bg-purple-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-600">24/7</div>
            <div className="text-gray-600">Platform Availability</div>
          </div>
          <div className="text-center bg-orange-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-orange-600">99.9%</div>
            <div className="text-gray-600">Uptime Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
} 
