'use client';

import { motion } from 'framer-motion';

export default function SolutionsTrio() {
  const solutions = [
    {
      title: 'Mitigate Supply Chain Risk',
      description:
        'AI-powered risk assessment and multi-supplier sourcing strategies to ensure business continuity.',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100',
      metrics: '87% risk reduction',
      detail:
        'Advanced algorithms predict and prevent supply disruptions before they impact your operations.',
    },
    {
      title: 'Eradicate Inefficiency',
      description:
        'Streamline procurement processes with intelligent automation and real-time optimization.',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-50 to-orange-100',
      metrics: '97% time saved',
      detail:
        'Eliminate manual bottlenecks and accelerate decision-making with AI-driven insights.',
    },
    {
      title: 'Achieve Unprecedented Scale',
      description:
        'Scale your procurement operations globally with enterprise-grade infrastructure.',
      icon: Globe,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-100',
      metrics: '10x capacity growth',
      detail: 'Built for enterprises processing ₹100Cr+ volumes with Fortune 500 reliability.',
    },
  ];

  return (
    <section className='bg-gradient-to-br from-slate-50 to-blue-50 py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl font-bold text-gray-900 mb-6'>
            Enterprise Procurement Solutions
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Trusted by industry leaders including Tata Steel, Reliance, and Mahindra to transform
            procurement at enterprise scale.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className='group relative'
              >
                <div
                  className={`bg-gradient-to-br ${solution.bgColor} rounded-2xl p-8 h-full border border-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2`}
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${solution.color} mb-6 shadow-lg`}
                  >
                    <Icon className='w-8 h-8 text-white' />
                  </div>

                  {/* Content */}
                  <h3 className='text-2xl font-bold text-gray-900 mb-4'>{solution.title}</h3>

                  <p className='text-gray-700 mb-6 leading-relaxed'>{solution.description}</p>

                  {/* Metrics */}
                  <div className='mb-4'>
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${solution.color} text-white font-bold text-sm shadow-md`}
                    >
                      {solution.metrics}
                    </div>
                  </div>

                  {/* Detail */}
                  <p className='text-sm text-gray-600 italic'>{solution.detail}</p>

                  {/* Hover Effect */}
                  <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className='text-center mt-16'
        >
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-4xl mx-auto'>
            <h3 className='text-2xl font-bold text-gray-900 mb-4'>
              Ready to Transform Your Procurement?
            </h3>
            <p className='text-gray-600 mb-6'>
              Join C-level executives at leading enterprises who trust Bell24H for strategic
              procurement.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg'>
                Schedule Executive Demo
              </button>
              <button className='bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg transition-colors'>
                Download Enterprise Guide
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
