'use client';

import { motion } from 'framer-motion';

interface Client {
  name: string;
  logo: string;
  industry: string;
  tier: 'Fortune500' | 'Unicorn' | 'Enterprise' | 'Government';
  description: string;
}

const ENTERPRISE_CLIENTS: Client[] = [
  // Indian Industrial Giants
  {
    name: 'Tata Steel',
    logo: '🏗️',
    industry: 'Steel & Metals',
    tier: 'Fortune500',
    description: "India's largest steel producer",
  },
  {
    name: 'Reliance Industries',
    logo: '⛽',
    industry: 'Petrochemicals',
    tier: 'Fortune500',
    description: "India's largest private company",
  },
  {
    name: 'Mahindra Group',
    logo: '🚜',
    industry: 'Automotive',
    tier: 'Fortune500',
    description: 'Leading automotive manufacturer',
  },
  {
    name: 'Larsen & Toubro',
    logo: '🏢',
    industry: 'Construction',
    tier: 'Fortune500',
    description: 'Engineering & construction giant',
  },
  {
    name: 'Bajaj Auto',
    logo: '🏍️',
    industry: 'Automotive',
    tier: 'Enterprise',
    description: 'Leading two-wheeler manufacturer',
  },
  {
    name: 'UltraTech Cement',
    logo: '🏗️',
    industry: 'Construction',
    tier: 'Enterprise',
    description: "India's largest cement company",
  },
  {
    name: 'Godrej Group',
    logo: '🏠',
    industry: 'Consumer Goods',
    tier: 'Enterprise',
    description: 'Diversified conglomerate',
  },
  {
    name: 'ITC Limited',
    logo: '🏭',
    industry: 'FMCG',
    tier: 'Fortune500',
    description: 'Leading FMCG company',
  },

  // Global Enterprises
  {
    name: 'Siemens',
    logo: '⚡',
    industry: 'Industrial Tech',
    tier: 'Fortune500',
    description: 'Global technology powerhouse',
  },
  {
    name: 'Schneider Electric',
    logo: '🔌',
    industry: 'Energy Management',
    tier: 'Fortune500',
    description: 'Energy management specialist',
  },
  {
    name: 'ABB Group',
    logo: '🤖',
    industry: 'Robotics',
    tier: 'Fortune500',
    description: 'Industrial automation leader',
  },
  {
    name: 'Honeywell',
    logo: '🏭',
    industry: 'Industrial Solutions',
    tier: 'Fortune500',
    description: 'Aerospace & industrial tech',
  },

  // Government & PSUs
  {
    name: 'ONGC',
    logo: '🛢️',
    industry: 'Oil & Gas',
    tier: 'Government',
    description: "India's largest oil company",
  },
  {
    name: 'SAIL',
    logo: '🔩',
    industry: 'Steel',
    tier: 'Government',
    description: 'Steel Authority of India',
  },
  {
    name: 'BHEL',
    logo: '⚙️',
    industry: 'Heavy Engineering',
    tier: 'Government',
    description: 'Heavy electrical equipment',
  },
  {
    name: 'Coal India',
    logo: '⛏️',
    industry: 'Mining',
    tier: 'Government',
    description: "World's largest coal producer",
  },

  // Tech & Unicorns
  {
    name: 'Flipkart',
    logo: '📦',
    industry: 'E-commerce',
    tier: 'Unicorn',
    description: 'Leading e-commerce platform',
  },
  {
    name: 'Paytm',
    logo: '💳',
    industry: 'FinTech',
    tier: 'Unicorn',
    description: 'Digital payments leader',
  },
  {
    name: 'Ola',
    logo: '🚗',
    industry: 'Mobility',
    tier: 'Unicorn',
    description: 'Mobility platform',
  },
  {
    name: 'Zomato',
    logo: '🍽️',
    industry: 'Food Tech',
    tier: 'Unicorn',
    description: 'Food delivery platform',
  },
];

const getTierColor = (tier: Client['tier']) => {
  switch (tier) {
    case 'Fortune500':
      return 'from-amber-400 to-orange-500';
    case 'Unicorn':
      return 'from-purple-400 to-pink-500';
    case 'Enterprise':
      return 'from-blue-400 to-blue-600';
    case 'Government':
      return 'from-green-400 to-green-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
};

const getTierBadge = (tier: Client['tier']) => {
  switch (tier) {
    case 'Fortune500':
      return { icon: Award, label: 'Fortune 500' };
    case 'Unicorn':
      return { icon: TrendingUp, label: 'Unicorn' };
    case 'Enterprise':
      return { icon: Building2, label: 'Enterprise' };
    case 'Government':
      return { icon: Building2, label: 'Government' };
    default:
      return { icon: Building2, label: 'Enterprise' };
  }
};

export default function ClientMarquee() {
  // Duplicate clients for seamless loop
  const extendedClients = [...ENTERPRISE_CLIENTS, ...ENTERPRISE_CLIENTS];

  return (
    <section className='bg-gradient-to-br from-slate-50 to-blue-50 py-16 overflow-hidden'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>
            Powering Procurement for
            <span className='block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'>
              India's Industrial Giants
            </span>
          </h2>
          <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
            Join Fortune 500 companies, unicorns, and government enterprises who trust Bell24H for
            their critical procurement operations and supply chain management.
          </p>
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-12'
        >
          <div className='text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100'>
            <div className='text-2xl font-bold text-blue-600 mb-1'>10K+</div>
            <div className='text-sm text-gray-600'>Enterprise Clients</div>
          </div>
          <div className='text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100'>
            <div className='text-2xl font-bold text-purple-600 mb-1'>50+</div>
            <div className='text-sm text-gray-600'>Fortune 500 Companies</div>
          </div>
          <div className='text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100'>
            <div className='text-2xl font-bold text-green-600 mb-1'>150+</div>
            <div className='text-sm text-gray-600'>Countries Served</div>
          </div>
          <div className='text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100'>
            <div className='text-2xl font-bold text-orange-600 mb-1'>99.7%</div>
            <div className='text-sm text-gray-600'>Client Satisfaction</div>
          </div>
        </motion.div>

        {/* Primary Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className='relative'
        >
          {/* Gradient Overlays */}
          <div className='absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none' />
          <div className='absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-blue-50 to-transparent z-10 pointer-events-none' />

          {/* Scrolling Container */}
          <div className='overflow-hidden'>
            <motion.div
              className='flex space-x-8'
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {extendedClients.map((client, index) => {
                const Badge = getTierBadge(client.tier);

                return (
                  <motion.div
                    key={`${client.name}-${index}`}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className='flex-shrink-0 group cursor-pointer'
                  >
                    <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 w-80'>
                      {/* Client Header */}
                      <div className='flex items-center gap-4 mb-4'>
                        <div className='w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform'>
                          {client.logo}
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors'>
                            {client.name}
                          </h3>
                          <p className='text-sm text-gray-600'>{client.industry}</p>
                        </div>
                      </div>

                      {/* Tier Badge */}
                      <div className='flex items-center justify-between mb-3'>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getTierColor(
                            client.tier
                          )}`}
                        >
                          <Badge.icon className='w-3 h-3' />
                          {Badge.label}
                        </div>
                        <div className='flex items-center gap-1 text-amber-400'>
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className='w-3 h-3 bg-current rounded-full' />
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <p className='text-sm text-gray-600 mb-4'>{client.description}</p>

                      {/* Metrics */}
                      <div className='grid grid-cols-3 gap-3 text-center'>
                        <div>
                          <div className='text-sm font-bold text-blue-600'>98%</div>
                          <div className='text-xs text-gray-500'>Cost Savings</div>
                        </div>
                        <div>
                          <div className='text-sm font-bold text-green-600'>15x</div>
                          <div className='text-xs text-gray-500'>Faster Process</div>
                        </div>
                        <div>
                          <div className='text-sm font-bold text-purple-600'>24/7</div>
                          <div className='text-xs text-gray-500'>Support</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Secondary Marquee (Opposite Direction) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className='relative mt-8'
        >
          {/* Gradient Overlays */}
          <div className='absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none' />
          <div className='absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-blue-50 to-transparent z-10 pointer-events-none' />

          {/* Scrolling Container (Reverse) */}
          <div className='overflow-hidden'>
            <motion.div
              className='flex space-x-6'
              animate={{ x: ['-50%', '0%'] }}
              transition={{
                duration: 45,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {extendedClients.reverse().map((client, index) => (
                <motion.div
                  key={`reverse-${client.name}-${index}`}
                  whileHover={{ scale: 1.05 }}
                  className='flex-shrink-0 group cursor-pointer'
                >
                  <div className='bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 w-60'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform'>
                        {client.logo}
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                          {client.name}
                        </h4>
                        <p className='text-xs text-gray-500'>{client.industry}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className='text-center mt-12'
        >
          <div className='inline-flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
            <div className='text-left'>
              <h3 className='font-bold text-gray-900 mb-1'>Join the Enterprise Network</h3>
              <p className='text-sm text-gray-600'>Start your procurement transformation today</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300'
            >
              Request Enterprise Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
