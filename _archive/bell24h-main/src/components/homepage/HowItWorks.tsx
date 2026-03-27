'use client';

import { FileText, Users, CheckCircle, ArrowRight, Mic, Video } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const buyerSteps = [
    {
      icon: FileText,
      title: 'Post RFQ',
      description: 'Create your RFQ in text, voice, or video format',
      types: ['Text', 'Voice', 'Video'],
    },
    {
      icon: Users,
      title: 'Get AI Matches',
      description: 'Our AI automatically finds the best suppliers for your requirements',
      types: [],
    },
    {
      icon: CheckCircle,
      title: 'Compare Quotes',
      description: 'Review quotes from verified suppliers and choose the best offer',
      types: [],
    },
  ];

  const supplierSteps = [
    {
      icon: FileText,
      title: 'Browse RFQs',
      description: 'Explore active RFQs in your categories or let AI match you',
      types: [],
    },
    {
      icon: Users,
      title: 'Submit Quotes',
      description: 'Send competitive quotes with pricing and delivery terms',
      types: [],
    },
    {
      icon: CheckCircle,
      title: 'Win Business',
      description: 'Get selected by buyers and grow your business',
      types: [],
    },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Simple, fast, and secure B2B marketplace for buyers and suppliers
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* For Buyers */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                For Buyers
              </h3>
            </div>

            <div className="space-y-6">
              {buyerSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          Step {index + 1}
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {step.description}
                      </p>
                      {step.types.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {step.types.map((type, typeIndex) => (
                            <span
                              key={typeIndex}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {type === 'Voice' && <Mic className="w-3 h-3 inline mr-1" />}
                              {type === 'Video' && <Video className="w-3 h-3 inline mr-1" />}
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/rfq/create" className="w-full block mt-8 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg text-center hover:bg-blue-700 transition">Post an RFQ</Link>
          </div>

          {/* For Suppliers */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                For Suppliers
              </h3>
            </div>

            <div className="space-y-6">
              {supplierSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          Step {index + 1}
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/rfq" className="w-full block mt-8 bg-green-600 text-white font-semibold px-6 py-3 rounded-lg text-center hover:bg-green-700 transition">Browse RFQs</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

