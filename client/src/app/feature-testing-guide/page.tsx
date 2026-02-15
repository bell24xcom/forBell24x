'use client';

import React, { useState } from 'react';
import { MessageSquare, Upload, TrendingUp, PlayCircle, Code, User, DollarSign, BarChart3, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const FeatureTestingGuide = () => {
  const [activeFeature, setActiveFeature] = useState('rfq');

  const features = {
    rfq: {
      title: "AI-Powered RFQ Negotiation",
      icon: <MessageSquare className="w-5 h-5" />,
      description: "Smart negotiation with AI-powered market analysis and counter-proposals",
      steps: [
        {
          step: "1. Access RFQ Creation",
          action: "Navigate to /rfq/create or click 'Create RFQ' in dashboard",
          demo: "Login as buyer → Dashboard → Create New RFQ",
          expected: "RFQ creation form with voice input option"
        },
        {
          step: "2. Create RFQ with AI",
          action: "Fill product details and let AI suggest specifications",
          demo: "Product: 'Steel Bars' → AI suggests grade, quantity, delivery terms",
          expected: "AI-generated specifications and market price estimates"
        },
        {
          step: "3. Receive AI Analysis", 
          action: "System analyzes market conditions and suggests negotiation strategy",
          demo: "AI provides: Current market price ₹45,000/ton, 3 qualified suppliers",
          expected: "Comprehensive market intelligence report"
        },
        {
          step: "4. Review Supplier Responses",
          action: "AI scores and ranks supplier proposals",
          demo: "Supplier A: 95% match, ₹42,000/ton, 15-day delivery",
          expected: "AI-powered supplier ranking with negotiation recommendations"
        },
        {
          step: "5. AI-Assisted Negotiation",
          action: "Use AI suggestions for counter-proposals",
          demo: "AI suggests: 'Counter with ₹40,000/ton for bulk order'",
          expected: "Smart negotiation messages with success probability"
        },
        {
          step: "6. Generate PDF Report",
          action: "AI creates comprehensive negotiation report",
          demo: "Napkin-style PDF with charts, supplier comparison, ROI analysis",
          expected: "Professional PDF with visual analytics and recommendations"
        }
      ],
      apiTest: `# Test AI RFQ Creation
curl -X POST "https://bell24h-v1-mojahtaej-vishaals-projects-892b178d.vercel.app/api/rfq/create" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Steel Bars for Construction",
    "category": "METALS",
    "quantity": 100,
    "unit": "tons",
    "specifications": {
      "grade": "Fe415",
      "diameter": "12mm-25mm",
      "length": "12m"
    },
    "budget": 4500000,
    "deliveryDate": "2025-09-15",
    "location": "Mumbai, Maharashtra"
  }'

# Expected Response:
{
  "rfqId": "RFQ-2025-001",
  "aiAnalysis": {
    "marketPrice": { "min": 42000, "max": 48000, "avg": 45000 },
    "recommendations": ["Consider bulk discount", "Negotiate delivery terms"],
    "riskAssessment": "Low risk - stable market conditions"
  },
  "matchedSuppliers": 5,
  "status": "active"
}`,
      demoCredentials: {
        buyer: "demo.buyer@bell24h.com / buyer123",
        supplier: "demo.supplier@bell24h.com / supplier123"
      }
    },
    
    upload: {
      title: "Product Upload Process",
      icon: <Upload className="w-5 h-5" />,
      description: "Complete supplier onboarding with AI-enhanced product showcase",
      steps: [
        {
          step: "1. Supplier Registration",
          action: "Register as supplier and complete KYC verification",
          demo: "Sign up → Select 'Supplier' role → Upload GST certificate, PAN",
          expected: "Verified supplier account with upload permissions"
        },
        {
          step: "2. Access Product Upload",
          action: "Navigate to supplier dashboard and click 'Add Products'",
          demo: "/supplier/dashboard → Add New Product → Upload form opens",
          expected: "Multi-step product upload wizard"
        },
        {
          step: "3. Basic Product Information",
          action: "Enter product name, category, and basic specifications",
          demo: "Name: 'MS Steel Bars', Category: 'Metals', Grade: 'Fe415'",
          expected: "AI suggests additional specifications and categories"
        },
        {
          step: "4. AI-Enhanced Description",
          action: "Let AI generate professional product description",
          demo: "AI creates: 'High-grade Fe415 MS steel bars manufactured to IS 1786 standards...'",
          expected: "SEO-optimized, technical product description"
        },
        {
          step: "5. Image & Document Upload",
          action: "Upload product images, certificates, and technical sheets",
          demo: "Drag & drop: product photos, test certificates, compliance docs",
          expected: "Optimized images with automatic compression and watermarking"
        },
        {
          step: "6. Traffic-Based Pricing Setup",
          action: "Configure pricing tiers based on visibility levels",
          demo: "Basic: ₹2,999/month, Premium: ₹9,999/month, Featured: ₹29,999/month",
          expected: "Dynamic pricing calculator with ROI projections"
        },
        {
          step: "7. Preview & Publish",
          action: "Review AI-generated showcase and publish product",
          demo: "Preview shows: Professional layout, technical specs, contact form",
          expected: "Live product page with traffic tracking enabled"
        }
      ],
      apiTest: `# Test Product Upload
curl -X POST "https://bell24h-v1-mojahtaej-vishaals-projects-892b178d.vercel.app/api/products/upload" \\
  -H "Authorization: Bearer SUPPLIER_JWT_TOKEN" \\
  -H "Content-Type: multipart/form-data" \\
  -F "name=MS Steel Bars Grade Fe415" \\
  -F "category=METALS" \\
  -F "specifications={\\"grade\\":\\"Fe415\\",\\"diameter\\":\\"12mm-25mm\\"}" \\
  -F "basePrice=45000" \\
  -F "unit=ton" \\
  -F "minQuantity=10" \\
  -F "images=@product1.jpg" \\
  -F "images=@product2.jpg" \\
  -F "certificates=@test_certificate.pdf" \\
  -F "pricingTier=premium"

# Expected Response:
{
  "productId": "PROD-2025-001",
  "status": "published",
  "aiDescription": "Professional AI-generated description...",
  "optimizedImages": ["https://cdn.bell24h.com/prod-001-1.webp"],
  "trafficPricing": {
    "tier": "premium",
    "monthlyFee": 9999,
    "estimatedImpressions": 50000,
    "projectedLeads": 500
  }
}`,
      requiredDocuments: [
        "GST Registration Certificate",
        "PAN Card", 
        "Company Registration Certificate",
        "Product Test Certificates",
        "Quality Compliance Documents",
        "Bank Account Details"
      ]
    },
    
    pricing: {
      title: "Traffic-Based Pricing Engine",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Fair, performance-based pricing model with real-time optimization",
      steps: [
        {
          step: "1. Pricing Tier Selection",
          action: "Choose visibility level based on business goals",
          demo: "Starter (₹2,999): 5K impressions, Basic (₹9,999): 50K impressions",
          expected: "Clear ROI projections for each tier"
        },
        {
          step: "2. Real-Time Traffic Tracking",
          action: "System monitors product page views and engagement",
          demo: "Dashboard shows: 1,247 views today, 89 inquiries, 12 RFQs",
          expected: "Live analytics with conversion tracking"
        },
        {
          step: "3. AI-Powered Optimization",
          action: "Algorithm optimizes placement based on performance",
          demo: "High-performing products get better search visibility",
          expected: "Automatic bid optimization and placement adjustment"
        },
        {
          step: "4. Dynamic Pricing Adjustment",
          action: "Prices adjust based on demand and competition",
          demo: "High-demand categories: +20% pricing, Low competition: -10%",
          expected: "Fair market-based pricing with transparency"
        },
        {
          step: "5. Performance Reports",
          action: "Detailed analytics on traffic and conversion",
          demo: "Monthly report: CTR 3.2%, Inquiry rate 7.1%, ROI 340%",
          expected: "Napkin-style visual reports with actionable insights"
        }
      ],
      pricingTiers: [
        {
          name: "Starter",
          price: "₹2,999/month",
          impressions: "5,000",
          features: ["Basic listing", "Email support", "Basic analytics"],
          bestFor: "Small suppliers, testing platform"
        },
        {
          name: "Professional", 
          price: "₹9,999/month",
          impressions: "50,000",
          features: ["Premium placement", "AI descriptions", "Advanced analytics", "Priority support"],
          bestFor: "Growing businesses, serious suppliers"
        },
        {
          name: "Enterprise",
          price: "₹29,999/month", 
          impressions: "Unlimited",
          features: ["Top placement", "Custom AI models", "Dedicated manager", "API access"],
          bestFor: "Large manufacturers, high-volume suppliers"
        }
      ],
      algorithmFactors: [
        { factor: "Click-through Rate (CTR)", weight: "25%", description: "How often users click on your product" },
        { factor: "Inquiry Conversion", weight: "20%", description: "Percentage of views that become inquiries" }, 
        { factor: "Response Time", weight: "15%", description: "How quickly you respond to RFQs" },
        { factor: "Customer Ratings", weight: "15%", description: "Buyer feedback and ratings" },
        { factor: "Profile Completeness", weight: "10%", description: "How complete your supplier profile is" },
        { factor: "Payment History", weight: "10%", description: "Timely payment of platform fees" },
        { factor: "Market Demand", weight: "5%", description: "Current demand for your product category" }
      ]
    }
  };

  const testScenarios = [
    {
      scenario: "Complete Buyer Journey",
      steps: [
        "1. Register as buyer (demo.buyer@bell24h.com)",
        "2. Create RFQ for steel bars",
        "3. Review AI market analysis",
        "4. Negotiate with suppliers using AI suggestions",
        "5. Download PDF negotiation report"
      ],
      expectedOutcome: "Complete RFQ process with AI assistance",
      testTime: "15 minutes"
    },
    {
      scenario: "Supplier Onboarding", 
      steps: [
        "1. Register as supplier (demo.supplier@bell24h.com)",
        "2. Complete KYC verification",
        "3. Upload first product with images",
        "4. Set traffic-based pricing tier", 
        "5. Monitor traffic and inquiries"
      ],
      expectedOutcome: "Live product with traffic tracking",
      testTime: "10 minutes"
    },
    {
      scenario: "AI Negotiation Flow",
      steps: [
        "1. Create RFQ as buyer",
        "2. Respond as supplier",
        "3. Use AI counter-proposal suggestions",
        "4. Complete negotiation cycle",
        "5. Generate final agreement PDF"
      ],
      expectedOutcome: "AI-assisted successful negotiation",
      testTime: "20 minutes"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bell24h Feature Testing Guide</h1>
        <p className="text-xl text-gray-600">Complete guide to testing AI RFQ, product upload, and pricing features</p>
        <div className="mt-4">
          <a 
            href="https://bell24h-v1-mojahtaej-vishaals-projects-892b178d.vercel.app" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            Test Live Platform
          </a>
        </div>
      </div>

      {/* Feature Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(features).map(([key, feature]) => (
          <button
            key={key}
            onClick={() => setActiveFeature(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFeature === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {feature.icon}
            {feature.title}
          </button>
        ))}
      </div>

      {/* Active Feature Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          {features[activeFeature as keyof typeof features].icon}
          <h2 className="text-2xl font-bold">{features[activeFeature as keyof typeof features].title}</h2>
        </div>
        <p className="text-gray-600 mb-6">{features[activeFeature as keyof typeof features].description}</p>
        
        <div className="space-y-6">
          {/* Step-by-step Guide */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Step-by-Step Testing Process</h3>
            <div className="space-y-4">
              {features[activeFeature as keyof typeof features].steps.map((step, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{step.step}</h4>
                    <p className="text-gray-600 mt-1">{step.action}</p>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Demo: {step.demo}</span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">✅ Expected: {step.expected}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Testing */}
          <div>
            <h3 className="text-lg font-semibold mb-4">API Testing Commands</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">{features[activeFeature as keyof typeof features].apiTest}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers (for pricing feature) */}
      {activeFeature === 'pricing' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5" />
            <h2 className="text-2xl font-bold">Traffic-Based Pricing Tiers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.pricing.pricingTiers.map((tier, index) => (
              <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">{tier.price}</div>
                <p className="text-gray-600 mb-4">{tier.impressions} impressions/month</p>
                <ul className="space-y-2 mb-4">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 italic">{tier.bestFor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Algorithm Factors (for pricing feature) */}
      {activeFeature === 'pricing' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-2xl font-bold">Pricing Algorithm Factors</h2>
          </div>
          <div className="space-y-4">
            {features.pricing.algorithmFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{factor.factor}</h4>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{factor.weight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Scenarios */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <PlayCircle className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Complete Test Scenarios</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testScenarios.map((scenario, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">{scenario.scenario}</h3>
              <ol className="space-y-2 mb-4">
                {scenario.steps.map((step, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">{step.split('.')[0]}.</span>
                    <span>{step.split('.').slice(1).join('.')}</span>
                  </li>
                ))}
              </ol>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{scenario.testTime}</span>
                <span className="text-sm text-green-600">✅ {scenario.expectedOutcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-green-800" />
          <h2 className="text-2xl font-bold text-green-800">Demo Credentials for Testing</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Buyer Account:</h4>
            <p className="font-mono text-sm bg-white p-2 rounded">demo.buyer@bell24h.com / buyer123</p>
            <p className="text-sm text-gray-600 mt-1">Full RFQ creation and negotiation access</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Supplier Account:</h4>
            <p className="font-mono text-sm bg-white p-2 rounded">demo.supplier@bell24h.com / supplier123</p>
            <p className="text-sm text-gray-600 mt-1">Product upload and RFQ response capabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureTestingGuide; 
