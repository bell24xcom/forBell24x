'use client';

import React, { useState } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Building2, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Upload, 
  Search, 
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  TrendingUp,
  Camera,
  Globe,
  Shield,
  Cpu,
  Brain,
  FileImage,
  PieChart,
  Image,
  Download,
  Wallet,
  CreditCard,
  Database,
  Server,
  Lock,
  Eye,
  Settings,
  Target,
  Award,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Activity,
  Layers,
  Palette,
  Video,
  Mic,
  Phone,
  Mail,
  MapPin,
  Truck,
  Package,
  Factory,
  Wrench,
  Cog,
  Zap as Lightning
} from 'lucide-react';

const Bell24hComprehensiveAssessment = () => {
  const [selectedTab, setSelectedTab] = useState('current-status');
  const [selectedRole, setSelectedRole] = useState<keyof typeof userRoles | null>(null);

  // Current Bell24h Status Assessment
  const currentFeatures = {
    implemented: [
      { 
        feature: 'User Authentication System', 
        status: 'complete', 
        description: 'Multi-role login with Google OAuth and credentials',
        icon: <Shield className="w-5 h-5" />,
        url: '/auth/login'
      },
      { 
        feature: 'Digital Wallet System', 
        status: 'complete', 
        description: 'RazorpayX integration with fund management and transactions',
        icon: <Wallet className="w-5 h-5" />,
        url: '/dashboard/wallet'
      },
      { 
        feature: 'Database Schema', 
        status: 'complete', 
        description: 'Railway PostgreSQL with user/transaction/wallet tables',
        icon: <Database className="w-5 h-5" />,
        url: '/api/wallet'
      },
      { 
        feature: 'Payment Processing', 
        status: 'complete', 
        description: 'Multiple payment methods via Razorpay integration',
        icon: <CreditCard className="w-5 h-5" />,
        url: '/api/payment'
      },
      { 
        feature: 'API Infrastructure', 
        status: 'complete', 
        description: 'RESTful APIs for wallet, user management, and authentication',
        icon: <Server className="w-5 h-5" />,
        url: '/api'
      },
      { 
        feature: 'Compliance Documents', 
        status: 'complete', 
        description: 'RBI-compliant terms, privacy policy, and AML documentation',
        icon: <FileText className="w-5 h-5" />,
        url: '/legal'
      },
      { 
        feature: 'Production Deployment', 
        status: 'complete', 
        description: '169 pages deployed on Vercel with SSL and CDN',
        icon: <Globe className="w-5 h-5" />,
        url: 'https://bell24h-v1-f3b8ux7pm-vishaals-projects-892b178d.vercel.app'
      }
    ],
    missing: [
      { 
        feature: 'Product Showcase System', 
        status: 'missing', 
        priority: 'critical', 
        description: 'Multi-media product displays with 360° views, videos, and AR',
        icon: <Image className="w-5 h-5" />,
        impact: 'High user engagement and conversion rates'
      },
      { 
        feature: 'Company Profile Management', 
        status: 'missing', 
        priority: 'critical', 
        description: 'Comprehensive company branding, certifications, and virtual showrooms',
        icon: <Building2 className="w-5 h-5" />,
        impact: 'Professional credibility and trust building'
      },
      { 
        feature: 'RFQ System with AI', 
        status: 'missing', 
        priority: 'high', 
        description: 'Request for Quote with AI-powered negotiation and supplier matching',
        icon: <Brain className="w-5 h-5" />,
        impact: 'Automated procurement and cost optimization'
      },
      { 
        feature: 'Traffic-Based Pricing Plans', 
        status: 'missing', 
        priority: 'high', 
        description: 'Tiered pricing based on user activity, features, and AI credits',
        icon: <TrendingUp className="w-5 h-5" />,
        impact: 'Revenue generation and business model sustainability'
      },
      { 
        feature: 'Advanced Analytics Dashboard', 
        status: 'missing', 
        priority: 'medium', 
        description: 'Business intelligence, performance metrics, and predictive analytics',
        icon: <BarChart3 className="w-5 h-5" />,
        impact: 'Data-driven decision making and insights'
      },
      { 
        feature: 'AI Visual Generation', 
        status: 'missing', 
        priority: 'medium', 
        description: 'Napkin.ai-like chart and graph generation for reports',
        icon: <PieChart className="w-5 h-5" />,
        impact: 'Professional reporting and visual communication'
      }
    ]
  };

  // Multi-Role User System Requirements
  interface RoleDetails {
    icon: React.ReactNode;
    color: string;
    features: string[];
    dashboard: string[];
  }

  const userRoles: { [key: string]: RoleDetails } = {
    buyer: {
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'bg-blue-500',
      features: [
        'Browse product catalogs with advanced search and filters',
        'Create and manage RFQs with AI assistance and templates',
        'Compare suppliers with side-by-side analysis tools',
        'Negotiate terms with AI-powered price optimization',
        'Track orders and manage payments through integrated wallet',
        'Access purchase analytics and supplier performance reports',
        'Maintain supplier relationship dashboard with ratings'
      ],
      dashboard: [
        'RFQ Management Center with AI insights',
        'Supplier Performance Analytics',
        'Purchase History & Trend Analysis',
        'Budget Tracking & Forecasting',
        'AI-Powered Procurement Recommendations',
        'Contract Management & Compliance'
      ]
    },
    supplier: {
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-green-500',
      features: [
        'Comprehensive product showcase with multimedia support',
        'Company profile with branding elements and certifications',
        'RFQ response management with AI insights and templates',
        'Inventory management and dynamic pricing tools',
        'Performance analytics and lead tracking dashboard',
        'Customer relationship management with communication tools',
        'Marketing and promotion tools with analytics'
      ],
      dashboard: [
        'Product Management Studio with multimedia',
        'RFQ Response Center with AI assistance',
        'Sales Analytics & Performance Metrics',
        'Customer Insights Dashboard',
        'Inventory & Dynamic Pricing Control',
        'Marketing & Promotion Tools'
      ]
    },
    msme: {
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      features: [
        'MSME certification verification and display',
        'Government scheme integration and application tracking',
        'Simplified compliance management dashboard',
        'Bulk order management with volume discounts',
        'Export/import documentation and assistance',
        'Financial assistance tracking and application support',
        'Growth analytics and market opportunity insights'
      ],
      dashboard: [
        'MSME Compliance Center',
        'Government Scheme Portal',
        'Export/Import Management',
        'Financial Assistance Tracker',
        'Certification Management',
        'Growth Analytics & Opportunities'
      ]
    },
    manufacturer: {
      icon: <Factory className="w-6 h-6" />,
      color: 'bg-orange-500',
      features: [
        'Production capacity showcasing with real-time updates',
        'Custom manufacturing RFQs with technical specifications',
        'Quality certification display and verification',
        'Supply chain management and optimization',
        'OEM/ODM service offerings with customization',
        'Technical specification management and version control',
        'Capacity planning and scheduling tools'
      ],
      dashboard: [
        'Production Management Center',
        'Custom Order Processing',
        'Quality Control Dashboard',
        'Supply Chain Analytics',
        'Technical Documentation Hub',
        'Capacity Planning Tools'
      ]
    }
  };

  // Product Showcase Requirements
  const productShowcaseFeatures = [
    {
      category: 'Visual Content Management',
      features: [
        'High-resolution image galleries (up to 20 images per product)',
        '360-degree product view capabilities with interactive controls',
        'Video demonstrations and tutorial content',
        'AR/VR product visualization for immersive experience',
        'Technical drawings and specification documents',
        'Certification and compliance document uploads'
      ],
      implementation: 'Cloud storage with CDN, AR.js integration, video transcoding',
      priority: 'Critical'
    },
    {
      category: 'Detailed Product Information',
      features: [
        'Comprehensive product descriptions with rich text editor',
        'Technical specifications with customizable fields and validation',
        'Pricing tiers with quantity-based discounts and bulk pricing',
        'Availability and lead time information with real-time updates',
        'Shipping and logistics details with tracking integration',
        'Related products and cross-selling suggestions with AI'
      ],
      implementation: 'Dynamic form builder, AI-powered content suggestions, real-time sync',
      priority: 'Critical'
    },
    {
      category: 'Interactive Features',
      features: [
        'Live chat integration for product inquiries and support',
        'Virtual showroom experiences with 3D product displays',
        'Product comparison tools with side-by-side analysis',
        'Sample request functionality with approval workflows',
        'Customization options and configurators for complex products',
        'Real-time inventory updates and availability notifications'
      ],
      implementation: 'WebRTC, Three.js, real-time database sync, WebSocket connections',
      priority: 'High'
    }
  ];

  // AI-Powered RFQ System Requirements
  const rfqSystemFeatures = [
    {
      stage: 'RFQ Creation',
      aiFeatures: [
        'Smart form auto-completion based on past RFQs and patterns',
        'AI-suggested specifications and requirements optimization',
        'Automatic supplier matching based on capabilities and ratings',
        'Cost estimation using market data and AI algorithms',
        'Timeline prediction for delivery and production schedules'
      ],
      napkinLikeFeatures: [
        'Visual requirement specification builder with drag-and-drop',
        'Interactive charts for quantity vs. pricing analysis',
        'Timeline visualizations for project milestones and deadlines',
        'Comparison matrices with visual elements and scoring'
      ]
    },
    {
      stage: 'Negotiation Process',
      aiFeatures: [
        'AI-powered price optimization suggestions with market analysis',
        'Market trend analysis and competitive intelligence',
        'Negotiation strategy assistance with scenario planning',
        'Risk assessment and mitigation advice with scoring',
        'Contract term optimization with legal compliance checks'
      ],
      napkinLikeFeatures: [
        'Real-time pricing charts and graphs with trend lines',
        'Negotiation progress visualizations with milestones',
        'Savings potential infographics with ROI calculations',
        'Risk assessment heat maps with color-coded indicators'
      ]
    },
    {
      stage: 'PDF Report Generation',
      aiFeatures: [
        'Comprehensive RFQ analysis reports with executive summary',
        'Supplier comparison with AI scoring and recommendations',
        'Market analysis and benchmarking with industry insights',
        'Risk assessment and mitigation strategies with probability',
        'ROI projections and cost-benefit analysis with scenarios'
      ],
      napkinLikeFeatures: [
        'Professional charts and graphs with customizable branding',
        'Interactive data visualizations with drill-down capabilities',
        'Branded report templates with company-specific designs',
        'Executive summary infographics with key insights',
        'Decision-making flowcharts with process visualization'
      ]
    }
  ];

  // Traffic-Based Pricing Plans
  const pricingPlans = [
    {
      name: 'Starter',
      price: '₹2,999/month',
      targetUsers: 'Small businesses, individual suppliers',
      features: [
        'Up to 50 products listed with basic multimedia',
        '100 RFQs per month with standard templates',
        'Basic analytics dashboard with key metrics',
        'Standard email support with 24-hour response',
        '5GB storage for images and documents',
        'Basic AI assistance for RFQ creation'
      ],
      limits: {
        products: 50,
        rfqs: 100,
        users: 5,
        storage: '5GB',
        aiCredits: 1000
      }
    },
    {
      name: 'Professional',
      price: '₹9,999/month',
      targetUsers: 'Growing businesses, established suppliers',
      features: [
        'Up to 500 products listed with advanced multimedia',
        '1,000 RFQs per month with AI-powered templates',
        'Advanced analytics with AI insights and predictions',
        'Priority support with dedicated account manager',
        '50GB storage with CDN optimization',
        'Advanced AI features with Napkin-like visual generation'
      ],
      limits: {
        products: 500,
        rfqs: 1000,
        users: 50,
        storage: '50GB',
        aiCredits: 10000
      }
    },
    {
      name: 'Enterprise',
      price: '₹29,999/month',
      targetUsers: 'Large manufacturers, MSMEs, enterprise buyers',
      features: [
        'Unlimited products with premium multimedia features',
        'Unlimited RFQs with custom AI models',
        'Complete AI suite with custom integrations',
        'Dedicated account manager with 24/7 support',
        'Unlimited storage with enterprise-grade security',
        'Custom integrations and white-labeling options'
      ],
      limits: {
        products: 'Unlimited',
        rfqs: 'Unlimited',
        users: 'Unlimited',
        storage: 'Unlimited',
        aiCredits: 'Unlimited'
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bell24h Comprehensive Feature Assessment</h1>
          <p className="text-xl text-gray-600 mb-6">Multi-role B2B marketplace with AI-powered RFQ system and advanced analytics</p>
          
          {/* Status Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-bold text-green-700">Core Systems</h3>
                  <p className="text-green-600">✅ Production Ready</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <h3 className="font-bold text-red-700">Advanced Features</h3>
                  <p className="text-red-600">❌ Need Implementation</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-500" />
                <div>
                  <h3 className="font-bold text-blue-700">AI Integration</h3>
                  <p className="text-blue-600">🤖 Planned Features</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div>
                  <h3 className="font-bold text-purple-700">Revenue Model</h3>
                  <p className="text-purple-600">💰 Tiered Pricing</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl mb-8 shadow-lg overflow-x-auto">
          {[
            { id: 'current-status', label: 'Current Status', icon: <CheckCircle className="w-4 h-4" /> },
            { id: 'user-roles', label: 'Multi-Role System', icon: <Users className="w-4 h-4" /> },
            { id: 'product-showcase', label: 'Product Showcase', icon: <Image className="w-4 h-4" /> },
            { id: 'rfq-system', label: 'AI RFQ System', icon: <Brain className="w-4 h-4" /> },
            { id: 'pricing-plans', label: 'Pricing Plans', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'implementation', label: 'Implementation', icon: <Cpu className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'current-status' && (
          <div className="space-y-8">
            {/* Implemented Features */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                Currently Implemented Features (Production Ready)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentFeatures.implemented.map((feature, index) => (
                  <div key={index} className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center gap-3 mb-2">
                      {feature.icon}
                      <h4 className="font-semibold text-green-900">{feature.feature}</h4>
                    </div>
                    <p className="text-green-700 text-sm mb-2">{feature.description}</p>
                    <a 
                      href={feature.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 text-xs hover:underline"
                    >
                      View Live → {feature.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Features */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                Missing Critical Features (Need Implementation)
              </h3>
              <div className="space-y-4">
                {currentFeatures.missing.map((feature, index) => (
                  <div key={index} className={`p-4 border-2 rounded-lg ${getPriorityColor(feature.priority)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {feature.icon}
                        <h4 className="font-semibold text-gray-900">{feature.feature}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        feature.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        feature.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {feature.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{feature.description}</p>
                    <p className="text-gray-600 text-xs"><strong>Business Impact:</strong> {feature.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Priority */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Implementation Priority Timeline</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-red-500 pl-6">
                  <h4 className="font-semibold text-red-700 mb-2">Phase 1: Critical Features (Months 1-3)</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Product Showcase System with multimedia support</li>
                    <li>• Company Profile Management with branding</li>
                    <li>• Basic RFQ system implementation</li>
                    <li>• User role management enhancement</li>
                  </ul>
                </div>
                <div className="border-l-4 border-orange-500 pl-6">
                  <h4 className="font-semibold text-orange-700 mb-2">Phase 2: Advanced Features (Months 4-6)</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• AI-powered RFQ negotiation system</li>
                    <li>• Traffic-based pricing plans implementation</li>
                    <li>• Advanced analytics dashboard</li>
                    <li>• Basic visual generation (charts/graphs)</li>
                  </ul>
                </div>
                <div className="border-l-4 border-yellow-500 pl-6">
                  <h4 className="font-semibold text-yellow-700 mb-2">Phase 3: Premium Features (Months 7-9)</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Napkin.ai-like visual generation</li>
                    <li>• Advanced AI analytics and insights</li>
                    <li>• PDF report generation with charts</li>
                    <li>• Custom integrations and API</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'user-roles' && (
          <div className="space-y-8">
            {/* Role Selection */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Multi-Role User System</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(userRoles).map(([roleKey, role]) => (
                  <button
                    key={roleKey}
                    onClick={() => setSelectedRole(roleKey)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedRole === roleKey
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`${role.color} text-white p-3 rounded-lg w-fit mx-auto mb-3`}>
                      {role.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900 capitalize">{roleKey}</h4>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Role Details */}
            {selectedRole && (
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 capitalize">
                  {selectedRole} Dashboard & Features
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Core Features */}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Core Features</h4>
                    <div className="space-y-3">
                      {userRoles[selectedRole].features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dashboard Components */}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Components</h4>
                    <div className="space-y-3">
                      {userRoles[selectedRole].dashboard.map((component, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          <span className="text-blue-700">{component}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'product-showcase' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Product Showcase System Requirements</h3>
              
              <div className="space-y-8">
                {productShowcaseFeatures.map((category, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-gray-900">{category.category}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        category.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {category.priority}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <h5 className="font-medium text-gray-900 mb-3">Features Required:</h5>
                        <div className="space-y-2">
                          {category.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Technical Implementation:</h5>
                        <p className="text-blue-700 text-sm">{category.implementation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'rfq-system' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">AI-Powered RFQ System with Napkin.ai-like Features</h3>
              
              <div className="space-y-8">
                {rfqSystemFeatures.map((stage, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">{stage.stage}</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* AI Features */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-blue-500" />
                          AI-Powered Features
                        </h5>
                        <div className="space-y-2">
                          {stage.aiFeatures.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                              <Cpu className="w-4 h-4 text-blue-500 mt-1" />
                              <span className="text-sm text-blue-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Napkin-like Visual Features */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <PieChart className="w-5 h-5 text-green-500" />
                          Visual Generation Features
                        </h5>
                        <div className="space-y-2">
                          {stage.napkinLikeFeatures.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                              <BarChart3 className="w-4 h-4 text-green-500 mt-1" />
                              <span className="text-sm text-green-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample RFQ Flow */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">RFQ Processing Flow</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: '1', title: 'Create RFQ', desc: 'AI-assisted form completion', icon: <FileText className="w-6 h-6" /> },
                  { step: '2', title: 'Auto-Match', desc: 'AI finds suitable suppliers', icon: <Search className="w-6 h-6" /> },
                  { step: '3', title: 'Negotiate', desc: 'AI-powered price optimization', icon: <TrendingUp className="w-6 h-6" /> },
                  { step: '4', title: 'Generate Report', desc: 'PDF with charts & insights', icon: <Download className="w-6 h-6" /> }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                      {item.step}
                    </div>
                    <div className="mb-3 text-blue-500 flex justify-center">
                      {item.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'pricing-plans' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Traffic-Based Pricing Plans</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {pricingPlans.map((plan, index) => (
                  <div key={index} className={`border-2 rounded-xl p-6 ${
                    plan.name === 'Professional' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">{plan.price}</div>
                      <p className="text-gray-600 text-sm">{plan.targetUsers}</p>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <h5 className="font-semibold text-gray-900">Features:</h5>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Usage Limits:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Products: <span className="font-medium">{plan.limits.products}</span></div>
                        <div>RFQs: <span className="font-medium">{plan.limits.rfqs}</span></div>
                        <div>Users: <span className="font-medium">{plan.limits.users}</span></div>
                        <div>Storage: <span className="font-medium">{plan.limits.storage}</span></div>
                        <div>AI Credits: <span className="font-medium">{plan.limits.aiCredits}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'implementation' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Implementation Roadmap & Cost Estimate</h3>
              
              {/* Development Timeline */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Development Timeline (9 Months)</h4>
                <div className="space-y-6">
                  {[
                    {
                      phase: 'Phase 1: Foundation (Months 1-3)',
                      cost: '₹15-20 Lakhs',
                      features: [
                        'Product Showcase System Development',
                        'Company Profile Management',
                        'Basic RFQ System',
                        'User Role Management Enhancement',
                        'Upload & Media Management'
                      ]
                    },
                    {
                      phase: 'Phase 2: Intelligence (Months 4-6)',
                      cost: '₹25-30 Lakhs',
                      features: [
                        'AI-Powered RFQ Matching',
                        'Smart Negotiation Assistant',
                        'Advanced Analytics Dashboard',
                        'Traffic-Based Pricing Implementation',
                        'Basic Visual Generation (Charts/Graphs)'
                      ]
                    },
                    {
                      phase: 'Phase 3: Advanced AI (Months 7-9)',
                      cost: '₹20-25 Lakhs',
                      features: [
                        'Napkin.ai-like Visual Generation',
                        'Advanced AI Analytics',
                        'PDF Report Generation with Charts',
                        'Custom API Development',
                        'Performance Optimization'
                      ]
                    }
                  ].map((phase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="font-semibold text-gray-900">{phase.phase}</h5>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {phase.cost}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {phase.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technology Stack */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Required Technology Stack</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">Frontend Enhancements</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• React Three.js for 3D product views</li>
                      <li>• Chart.js/D3.js for data visualization</li>
                      <li>• WebRTC for live chat</li>
                      <li>• Canvas API for drawing tools</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">AI & ML Services</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• OpenAI GPT-4 for AI assistance</li>
                      <li>• TensorFlow.js for client-side ML</li>
                      <li>• Google Vision API for image analysis</li>
                      <li>• Custom ML models for RFQ matching</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">Backend Extensions</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Redis for caching and sessions</li>
                      <li>• Elasticsearch for product search</li>
                      <li>• AWS S3 for media storage</li>
                      <li>• Queue system for background jobs</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ROI Projection */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-green-900 mb-4">ROI Projection</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">₹60-75 Lakhs</div>
                    <div className="text-green-600">Total Investment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">18-24 Months</div>
                    <div className="text-green-600">Break-even Timeline</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">3-5x</div>
                    <div className="text-green-600">Expected ROI (3 Years)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bell24hComprehensiveAssessment;
