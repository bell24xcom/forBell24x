'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SupportTier {
  name: string;
  icon: any;
  price: string;
  popular?: boolean;
  features: string[];
  responseTime: string;
  availability: string;
  channels: string[];
  benefits: string[];
  color: string;
}

interface ConciergeService {
  name: string;
  icon: any;
  description: string;
  features: string[];
  category: 'procurement' | 'strategic' | 'operational' | 'compliance';
}

interface SupportAgent {
  name: string;
  role: string;
  expertise: string[];
  experience: string;
  languages: string[];
  rating: number;
  avatar: string;
  status: 'online' | 'busy' | 'away';
}

export default function PremiumSupportConcierge() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTier, setSelectedTier] = useState<SupportTier | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<SupportAgent | null>(null);

  const supportTiers: SupportTier[] = [
    {
      name: 'Essential',
      icon: Shield,
      price: 'Included',
      features: [
        'Email support',
        'Knowledge base access',
        'Community forum',
        'Basic onboarding',
        'Standard documentation',
      ],
      responseTime: '24-48 hours',
      availability: 'Business hours',
      channels: ['Email', 'Chat'],
      benefits: ['Platform tutorials', 'Basic troubleshooting', 'Account setup assistance'],
      color: 'blue',
    },
    {
      name: 'Professional',
      icon: Star,
      price: '₹25,000/month',
      popular: true,
      features: [
        'Priority email & chat support',
        'Phone support',
        'Dedicated success manager',
        'Advanced onboarding',
        'Custom training sessions',
        'Quarterly business reviews',
      ],
      responseTime: '4-8 hours',
      availability: '12 hours/day',
      channels: ['Email', 'Chat', 'Phone', 'Video'],
      benefits: [
        'Procurement strategy consultation',
        'Performance optimization',
        'Custom integrations support',
        'Priority feature requests',
      ],
      color: 'emerald',
    },
    {
      name: 'Enterprise',
      icon: Crown,
      price: '₹75,000/month',
      features: [
        'White-glove concierge service',
        '24/7 dedicated support',
        'Named account team',
        'Custom implementation',
        'Executive escalation path',
        'SLA guarantees',
        'On-site support available',
      ],
      responseTime: '< 2 hours',
      availability: '24/7',
      channels: ['All channels', 'Direct line', 'Emergency escalation'],
      benefits: [
        'Strategic procurement consulting',
        'Market intelligence reports',
        'Supplier network expansion',
        'Custom feature development',
        'Industry best practices',
        'Executive advisory sessions',
      ],
      color: 'purple',
    },
  ];

  const conciergeServices: ConciergeService[] = [
    {
      name: 'Procurement Strategy Consulting',
      icon: Target,
      description:
        'Expert guidance on procurement strategy, supplier selection, and cost optimization',
      features: [
        'Category management strategy',
        'Supplier rationalization',
        'Cost reduction initiatives',
        'Risk mitigation planning',
        'Market analysis and insights',
      ],
      category: 'strategic',
    },
    {
      name: 'Supplier Onboarding & Management',
      icon: Users,
      description: 'End-to-end supplier lifecycle management with dedicated support',
      features: [
        'Supplier vetting and verification',
        'Onboarding process management',
        'Performance monitoring',
        'Relationship management',
        'Compliance tracking',
      ],
      category: 'operational',
    },
    {
      name: 'RFQ Optimization Service',
      icon: FileText,
      description: 'Professional RFQ creation, management, and optimization for better outcomes',
      features: [
        'RFQ template creation',
        'Specification optimization',
        'Supplier matching',
        'Bid evaluation assistance',
        'Negotiation support',
      ],
      category: 'procurement',
    },
    {
      name: 'Compliance & Risk Management',
      icon: Shield,
      description: 'Comprehensive compliance monitoring and risk assessment services',
      features: [
        'Regulatory compliance monitoring',
        'Risk assessment and scoring',
        'Audit preparation',
        'Documentation management',
        'Incident response support',
      ],
      category: 'compliance',
    },
    {
      name: 'Market Intelligence & Analytics',
      icon: TrendingUp,
      description: 'Custom market research, trend analysis, and business intelligence',
      features: [
        'Market trend analysis',
        'Competitive intelligence',
        'Price benchmarking',
        'Supplier market mapping',
        'Custom research reports',
      ],
      category: 'strategic',
    },
    {
      name: 'Executive Advisory Services',
      icon: Crown,
      description: 'C-level advisory and strategic planning for procurement transformation',
      features: [
        'Executive strategy sessions',
        'Digital transformation roadmap',
        'Change management support',
        'Best practice implementation',
        'Industry networking',
      ],
      category: 'strategic',
    },
  ];

  const supportAgents: SupportAgent[] = [
    {
      name: 'Dr. Priya Sharma',
      role: 'Senior Procurement Strategist',
      expertise: ['Strategic Sourcing', 'Category Management', 'Supplier Development'],
      experience: '15+ years',
      languages: ['English', 'Hindi', 'Gujarati'],
      rating: 4.9,
      avatar: '👩‍💼',
      status: 'online',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Technical Integration Specialist',
      expertise: ['API Integration', 'System Implementation', 'Data Migration'],
      experience: '12+ years',
      languages: ['English', 'Hindi', 'Tamil'],
      rating: 4.8,
      avatar: '👨‍💻',
      status: 'online',
    },
    {
      name: 'Sarah Johnson',
      role: 'Global Trade Advisor',
      expertise: ['International Trade', 'Compliance', 'Risk Management'],
      experience: '18+ years',
      languages: ['English', 'French', 'Spanish'],
      rating: 4.9,
      avatar: '👩‍🏫',
      status: 'busy',
    },
    {
      name: 'Amit Patel',
      role: 'Industry Specialist - Manufacturing',
      expertise: ['Manufacturing Procurement', 'Quality Management', 'Lean Operations'],
      experience: '20+ years',
      languages: ['English', 'Hindi', 'Marathi'],
      rating: 4.9,
      avatar: '👨‍🔧',
      status: 'online',
    },
  ];

  const getTierColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'emerald':
        return 'from-emerald-500 to-emerald-600';
      case 'purple':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strategic':
        return 'bg-purple-100 text-purple-700';
      case 'procurement':
        return 'bg-blue-100 text-blue-700';
      case 'operational':
        return 'bg-emerald-100 text-emerald-700';
      case 'compliance':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'busy':
        return 'bg-amber-500';
      case 'away':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <section className='bg-gradient-to-br from-indigo-50 to-purple-50 py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-full mb-4'>
            <Crown className='w-4 h-4 text-purple-600' />
            <span className='text-sm font-semibold text-purple-700'>WHITE-GLOVE SUPPORT</span>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Premium Support & Concierge
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Enterprise-grade support with dedicated experts, strategic consulting, and white-glove
            concierge services for your procurement transformation.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className='flex flex-wrap justify-center gap-3 mb-12'
        >
          {[
            { id: 'overview', label: 'Support Tiers', icon: Star },
            { id: 'concierge', label: 'Concierge Services', icon: Crown },
            { id: 'experts', label: 'Expert Team', icon: Users },
            { id: 'success', label: 'Success Stories', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode='wait'>
          {activeTab === 'overview' && (
            <motion.div
              key='overview'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='grid grid-cols-1 lg:grid-cols-3 gap-8'
            >
              {supportTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative bg-white rounded-3xl p-8 shadow-lg border-2 transition-all hover:shadow-xl cursor-pointer ${
                    tier.popular ? 'border-purple-200 ring-2 ring-purple-100' : 'border-gray-100'
                  }`}
                  onClick={() => setSelectedTier(tier)}
                >
                  {tier.popular && (
                    <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                      <span className='bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold'>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className='text-center mb-8'>
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${getTierColor(
                        tier.color
                      )} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    >
                      <tier.icon className='w-8 h-8 text-white' />
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>{tier.name}</h3>
                    <div className='text-3xl font-bold text-gray-900 mb-1'>{tier.price}</div>
                    <p className='text-gray-600'>per month</p>
                  </div>

                  <div className='space-y-6'>
                    <div>
                      <h4 className='font-semibold text-gray-900 mb-3'>Features</h4>
                      <ul className='space-y-2'>
                        {tier.features.map((feature, i) => (
                          <li key={i} className='flex items-start gap-2 text-sm text-gray-600'>
                            <span>✅</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className='grid grid-cols-2 gap-4 text-center'>
                      <div className='p-3 bg-gray-50 rounded-xl'>
                        <div className='text-sm font-semibold text-gray-900'>
                          {tier.responseTime}
                        </div>
                        <div className='text-xs text-gray-600'>Response Time</div>
                      </div>
                      <div className='p-3 bg-gray-50 rounded-xl'>
                        <div className='text-sm font-semibold text-gray-900'>
                          {tier.availability}
                        </div>
                        <div className='text-xs text-gray-600'>Availability</div>
                      </div>
                    </div>
                  </div>

                  <button
                    className={`w-full mt-8 bg-gradient-to-r ${getTierColor(
                      tier.color
                    )} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all`}
                  >
                    {tier.name === 'Essential' ? 'Get Started' : 'Contact Sales'}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'concierge' && (
            <motion.div
              key='concierge'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='grid grid-cols-1 lg:grid-cols-2 gap-8'
            >
              {conciergeServices.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all'
                >
                  <div className='flex items-start gap-4 mb-6'>
                    <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0'>
                      <service.icon className='w-6 h-6 text-white' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='text-xl font-bold text-gray-900'>{service.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            service.category
                          )}`}
                        >
                          {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                        </span>
                      </div>
                      <p className='text-gray-600 mb-4'>{service.description}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className='font-semibold text-gray-900 mb-3'>Service Includes</h4>
                    <ul className='space-y-2'>
                      {service.features.map((feature, i) => (
                        <li key={i} className='flex items-start gap-2 text-sm text-gray-600'>
                          <span>✅</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className='w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all'>
                    Learn More
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'experts' && (
            <motion.div
              key='experts'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='space-y-8'
            >
              <div className='text-center mb-8'>
                <h3 className='text-2xl font-bold text-gray-900 mb-4'>Meet Your Expert Team</h3>
                <p className='text-gray-600 max-w-2xl mx-auto'>
                  Our world-class team of procurement experts, industry specialists, and technical
                  consultants are here to ensure your success.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {supportAgents.map((agent, index) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className='bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer'
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className='text-center mb-4'>
                      <div className='relative inline-block mb-3'>
                        <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl'>
                          {agent.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(
                            agent.status
                          )} rounded-full border-2 border-white`}
                        ></div>
                      </div>
                      <h4 className='font-bold text-gray-900 mb-1'>{agent.name}</h4>
                      <p className='text-sm text-gray-600 mb-2'>{agent.role}</p>
                      <div className='flex items-center justify-center gap-1 mb-3'>
                        {[...Array(5)].map((_, i) => (
                          <span>⭐</span>
                        ))}
                        <span className='text-sm text-gray-600 ml-1'>{agent.rating}</span>
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <div>
                        <h5 className='text-xs font-semibold text-gray-700 mb-1'>EXPERTISE</h5>
                        <div className='flex flex-wrap gap-1'>
                          {agent.expertise.slice(0, 2).map((skill, i) => (
                            <span
                              key={i}
                              className='px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs'
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className='text-xs font-semibold text-gray-700 mb-1'>EXPERIENCE</h5>
                        <p className='text-sm text-gray-600'>{agent.experience}</p>
                      </div>
                      <div>
                        <h5 className='text-xs font-semibold text-gray-700 mb-1'>LANGUAGES</h5>
                        <p className='text-sm text-gray-600'>{agent.languages.join(', ')}</p>
                      </div>
                    </div>

                    <button className='w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-4 rounded-xl text-sm font-medium hover:shadow-lg transition-all'>
                      Schedule Consultation
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'success' && (
            <motion.div
              key='success'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='space-y-8'
            >
              <div className='text-center mb-8'>
                <h3 className='text-2xl font-bold text-gray-900 mb-4'>Client Success Stories</h3>
                <p className='text-gray-600 max-w-2xl mx-auto'>
                  See how our premium support and concierge services have transformed procurement
                  operations for leading enterprises.
                </p>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {[
                  {
                    company: 'TechCorp Industries',
                    industry: 'Manufacturing',
                    challenge: 'Complex multi-location procurement with 500+ suppliers',
                    solution: 'Enterprise tier with dedicated account team and custom integrations',
                    results: [
                      '60% reduction in procurement cycle time',
                      '₹12 Cr annual savings',
                      '95% supplier satisfaction',
                    ],
                    testimonial:
                      "Bell24H's concierge service transformed our procurement. The dedicated team understood our complex needs and delivered beyond expectations.",
                    avatar: '👨‍💼',
                    name: 'Rajesh Kumar, CPO',
                  },
                  {
                    company: 'Global Pharmaceuticals',
                    industry: 'Healthcare',
                    challenge: 'Regulatory compliance across 15 countries',
                    solution: 'Compliance & Risk Management concierge with 24/7 support',
                    results: [
                      '100% regulatory compliance',
                      '40% faster audit processes',
                      'Zero compliance incidents',
                    ],
                    testimonial:
                      'The expertise and proactive support helped us navigate complex international regulations seamlessly.',
                    avatar: '👩‍⚕️',
                    name: 'Dr. Sarah Patel, Head of Procurement',
                  },
                ].map((story, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'
                  >
                    <div className='flex items-center gap-4 mb-6'>
                      <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center'>
                        <Building className='w-6 h-6 text-white' />
                      </div>
                      <div>
                        <h4 className='text-lg font-bold text-gray-900'>{story.company}</h4>
                        <p className='text-gray-600'>{story.industry}</p>
                      </div>
                    </div>

                    <div className='space-y-4 mb-6'>
                      <div>
                        <h5 className='font-semibold text-gray-900 mb-2'>Challenge</h5>
                        <p className='text-gray-600 text-sm'>{story.challenge}</p>
                      </div>
                      <div>
                        <h5 className='font-semibold text-gray-900 mb-2'>Solution</h5>
                        <p className='text-gray-600 text-sm'>{story.solution}</p>
                      </div>
                      <div>
                        <h5 className='font-semibold text-gray-900 mb-2'>Results</h5>
                        <ul className='space-y-1'>
                          {story.results.map((result, i) => (
                            <li key={i} className='flex items-center gap-2 text-sm text-gray-600'>
                              <span>✅</span>
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className='bg-gray-50 rounded-2xl p-4'>
                      <p className='text-gray-700 italic mb-3'>"{story.testimonial}"</p>
                      <div className='flex items-center gap-3'>
                        <span className='text-2xl'>{story.avatar}</span>
                        <div>
                          <div className='font-semibold text-gray-900'>{story.name}</div>
                          <div className='text-sm text-gray-600'>{story.company}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className='text-center mt-16'
        >
          <div className='bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-8 text-white'>
            <h3 className='text-2xl font-bold mb-4'>Ready for White-Glove Support?</h3>
            <p className='text-purple-100 mb-6 max-w-2xl mx-auto'>
              Experience the difference of having dedicated procurement experts by your side.
              Schedule a consultation to discuss your enterprise needs.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors'>
                Schedule Consultation
              </button>
              <button className='border border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors'>
                Contact Sales Team
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
