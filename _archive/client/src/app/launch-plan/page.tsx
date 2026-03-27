'use client';

import React, { useState } from 'react';
import { CheckCircle, Users, TrendingUp, Share2, MessageSquare, DollarSign, Clock, Target, Globe, Smartphone, BarChart3, Zap, Shield, Award } from 'lucide-react';

const LaunchPlan = () => {
  const [activePhase, setActivePhase] = useState('immediate');

  const launchPhases = {
    immediate: {
      title: "Phase 1: Immediate Launch (24 Hours)",
      icon: <Clock className="w-5 h-5" />,
      color: "bg-red-100 text-red-800",
      tasks: [
        {
          task: "Beta User Acquisition",
          action: "Share URL with 20 target businesses",
          impact: "Initial user feedback & validation",
          priority: "Critical",
          time: "2 hours"
        },
        {
          task: "Demo Account Setup", 
          action: "Create 10 realistic demo profiles",
          impact: "Users can see real marketplace activity",
          priority: "High",
          time: "1 hour"
        },
        {
          task: "Analytics Monitoring",
          action: "Set up real-time user tracking",
          impact: "Monitor user behavior & conversion",
          priority: "High", 
          time: "30 minutes"
        },
        {
          task: "Support System",
          action: "Set up WhatsApp/chat support",
          impact: "Immediate user assistance",
          priority: "Medium",
          time: "1 hour"
        }
      ]
    },
    growth: {
      title: "Phase 2: Growth & Scale (Week 1-2)",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-orange-100 text-orange-800",
      tasks: [
        {
          task: "Content Marketing",
          action: "Publish 5 LinkedIn articles about AI B2B",
          impact: "Thought leadership & organic traffic",
          priority: "High",
          time: "8 hours"
        },
        {
          task: "Partnership Program",
          action: "Reach out to 50 MSME associations",
          impact: "Bulk user acquisition",
          priority: "Critical",
          time: "16 hours"
        },
        {
          task: "Feature Enhancement",
          action: "Implement user feedback improvements",
          impact: "Better user experience & retention",
          priority: "High",
          time: "20 hours"
        },
        {
          task: "SEO Optimization",
          action: "Optimize for B2B marketplace keywords",
          impact: "Organic search traffic",
          priority: "Medium",
          time: "4 hours"
        }
      ]
    },
    scale: {
      title: "Phase 3: Enterprise Scale (Month 1-3)",
      icon: <Globe className="w-5 h-5" />,
      color: "bg-green-100 text-green-800",
      tasks: [
        {
          task: "Enterprise Sales",
          action: "Direct outreach to Fortune 500 companies",
          impact: "High-value enterprise customers",
          priority: "Critical",
          time: "40 hours"
        },
        {
          task: "API Partnerships",
          action: "Integrate with ERP systems",
          impact: "Seamless enterprise adoption",
          priority: "High",
          time: "60 hours"
        },
        {
          task: "International Expansion",
          action: "Add multi-currency & regional features",
          impact: "Global market access",
          priority: "Medium",
          time: "80 hours"
        },
        {
          task: "Advanced AI",
          action: "Machine learning for predictive analytics",
          impact: "Competitive differentiation",
          priority: "High",
          time: "100 hours"
        }
      ]
    }
  };

  const userAcquisitionChannels = [
    {
      channel: "Direct Outreach",
      method: "Personal network + LinkedIn messaging",
      target: "50 businesses in first week",
      cost: "Free",
      expectedROI: "20-30% conversion"
    },
    {
      channel: "MSME Partnerships", 
      method: "Partner with MSME associations",
      target: "5 associations, 500+ members each",
      cost: "₹50,000 partnership fees",
      expectedROI: "5-10% adoption rate"
    },
    {
      channel: "Content Marketing",
      method: "LinkedIn articles + industry blogs",
      target: "10,000 organic reach/month",
      cost: "₹25,000 content creation",
      expectedROI: "2-3% conversion to signups"
    },
    {
      channel: "Google Ads",
      method: "Targeted B2B marketplace keywords",
      target: "1000 clicks/day",
      cost: "₹100,000/month",
      expectedROI: "8-12% conversion rate"
    },
    {
      channel: "Trade Shows",
      method: "Industry exhibitions & conferences",
      target: "500 qualified leads per event",
      cost: "₹200,000 per event",
      expectedROI: "15-25% conversion"
    }
  ];

  const monitoringMetrics = [
    { metric: "Daily Active Users", target: "100 DAU by week 2", current: "0" },
    { metric: "RFQ Creation Rate", target: "50 RFQs/day by month 1", current: "0" },
    { metric: "Transaction Volume", target: "₹10L GMV by month 2", current: "₹0" },
    { metric: "User Retention", target: "70% monthly retention", current: "N/A" },
    { metric: "Conversion Rate", target: "15% visitor to signup", current: "N/A" },
    { metric: "Revenue Per User", target: "₹5,000 ARPU", current: "₹0" }
  ];

  const competitiveAdvantages = [
    {
      feature: "AI-Powered RFQ Negotiation",
      advantage: "First in India to offer automated B2B negotiations",
      impact: "3x faster deal closure"
    },
    {
      feature: "Voice RFQ Creation", 
      advantage: "Revolutionary UX for busy executives",
      impact: "50% more RFQ submissions"
    },
    {
      feature: "Traffic-Based Pricing",
      advantage: "Fair, performance-based supplier fees",
      impact: "Higher supplier satisfaction"
    },
    {
      feature: "Integrated Escrow + Wallet",
      advantage: "Complete payment ecosystem",
      impact: "Reduced transaction friction"
    },
    {
      feature: "Multi-Role Platform",
      advantage: "Users can be buyers AND suppliers",
      impact: "Higher platform stickiness"
    }
  ];

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors = {
      Critical: "bg-red-100 text-red-800",
      High: "bg-orange-100 text-orange-800",
      Medium: "bg-yellow-100 text-yellow-800"
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>{priority}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-600 mb-2">🎉 Bell24h 2.0 Launch Success!</h1>
        <p className="text-xl text-gray-600">177 pages deployed • 0 errors • Ready for enterprise users</p>
        <div className="mt-4">
          <a 
            href="https://bell24h-v1-mojahtaej-vishaals-projects-892b178d.vercel.app" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Globe className="w-5 h-5" />
            Visit Live Platform
          </a>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(launchPhases).map(([key, phase]) => (
          <button
            key={key}
            onClick={() => setActivePhase(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activePhase === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {phase.icon}
            {phase.title.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Active Phase Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          {launchPhases[activePhase as keyof typeof launchPhases].icon}
          <h2 className="text-2xl font-bold">{launchPhases[activePhase as keyof typeof launchPhases].title}</h2>
        </div>
        <div className="grid gap-4">
          {launchPhases[activePhase as keyof typeof launchPhases].tasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{task.task}</h3>
                <p className="text-gray-600">{task.action}</p>
                <p className="text-sm text-blue-600">{task.impact}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-gray-200 rounded text-sm">{task.time}</span>
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Acquisition Strategy */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h2 className="text-2xl font-bold">User Acquisition Channels</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {userAcquisitionChannels.map((channel, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{channel.channel}</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Method:</span> {channel.method}</p>
                <p><span className="font-medium">Target:</span> {channel.target}</p>
                <p><span className="font-medium">Cost:</span> {channel.cost}</p>
                <p><span className="font-medium">Expected ROI:</span> {channel.expectedROI}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Success Metrics & Targets</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {monitoringMetrics.map((metric, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">{metric.metric}</h3>
              <p className="text-2xl font-bold text-blue-600 my-2">{metric.current}</p>
              <p className="text-sm text-gray-600">Target: {metric.target}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Competitive Advantages</h2>
        </div>
        <div className="space-y-4">
          {competitiveAdvantages.map((advantage, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-lg">{advantage.feature}</h3>
                <p className="text-gray-600">{advantage.advantage}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{advantage.impact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-blue-800" />
          <h2 className="text-2xl font-bold text-blue-800">Next 24 Hours - Action Checklist</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3">Immediate Actions (Today):</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Share with 10 target businesses via LinkedIn
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Set up Google Analytics & user tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Create WhatsApp support line
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Post launch announcement on LinkedIn
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">This Week:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Collect feedback from first 50 users
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Reach out to 5 MSME associations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Optimize conversion funnel based on data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Plan enterprise sales strategy
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">🚀 Quick Launch Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a 
            href="https://bell24h-v1-mojahtaej-vishaals-projects-892b178d.vercel.app/dashboard"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Test Dashboard</span>
            </div>
            <p className="text-sm text-gray-600">Try the live platform with demo users</p>
          </a>
          
          <a 
            href="https://bell24h-v1-mojahtaej-vishaals-projects-892b178d.vercel.app/rfq/create"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Create RFQ</span>
            </div>
            <p className="text-sm text-gray-600">Test AI-powered RFQ creation</p>
          </a>
          
          <a 
            href="https://bell24h-v1-mojahtaej-vishaals-projects-892b178d.vercel.app/products/upload"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Upload Products</span>
            </div>
            <p className="text-sm text-gray-600">Test product showcase features</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LaunchPlan; 
