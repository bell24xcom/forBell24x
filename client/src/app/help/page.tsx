'use client';

import { useEffect, useState } from 'react';

export default function HelpPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const faqs = [
    {
      question: 'How do I create my first RFQ?',
      answer:
        'To create your first RFQ, navigate to the Voice RFQ page and click the microphone button. Speak clearly about your requirements, and our AI will process your request and match you with relevant suppliers.',
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We accept all major credit cards, bank transfers, and digital wallets. All payments are processed securely through PCI DSS compliant payment gateways with 256-bit SSL encryption.',
    },
    {
      question: 'How does the AI matching work?',
      answer:
        'Our AI analyzes your requirements using natural language processing and matches you with suppliers based on product specifications, location, pricing, and supplier ratings. The system learns from each interaction to improve accuracy.',
    },
    {
      question: 'Can I cancel my subscription?',
      answer:
        "Yes, you can cancel your subscription at any time through your account settings. There are no long-term contracts or hidden fees. You'll continue to have access until the end of your current billing period.",
    },
    {
      question: 'Is my data secure?',
      answer:
        'Absolutely. We use enterprise-grade encryption (AES-256) for all data in transit and at rest. Our platform is GDPR compliant and we follow strict security protocols to protect your information.',
    },
    {
      question: 'How do I contact customer support?',
      answer:
        'You can reach our support team 24/7 through live chat, email at digitex.studio@gmail.com, or phone at +91 9004962871. We typically respond within 2 hours.',
    },
  ];

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!hasMounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading Help Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-12'>
            <h1 className='text-5xl font-bold text-gray-900 mb-6'>Help Center - BELL24H</h1>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Find answers to your questions and get the support you need
            </p>
          </div>

          {/* Search Section */}
          <div className='bg-white rounded-2xl shadow-xl p-8 mb-8'>
            <div className='max-w-2xl mx-auto'>
              <div className='relative'>
                <span>🔍</span>
                <input
                  type='text'
                  placeholder='Search for help articles, FAQs, or guides...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg'
                />
              </div>
            </div>
          </div>

          <div className='grid lg:grid-cols-3 gap-8'>
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Quick Start Guide */}
              <div className='bg-white rounded-2xl shadow-xl p-8'>
                <h2 className='text-2xl font-bold text-gray-900 mb-6'>Quick Start Guide</h2>

                <div className='space-y-6'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm'>
                      1
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>Create Your Account</h3>
                      <p className='text-gray-600'>
                        Sign up with your business email and complete your company profile. This
                        helps our AI match you with the right suppliers.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-4'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm'>
                      2
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>Browse Categories</h3>
                      <p className='text-gray-600'>
                        Explore our extensive category directory to find suppliers in your industry.
                        Use filters to narrow down your search.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-4'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm'>
                      3
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>Create Voice RFQ</h3>
                      <p className='text-gray-600'>
                        Use our Voice RFQ feature to speak your requirements. Our AI will process
                        your request and find matching suppliers.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-4'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm'>
                      4
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>Connect & Trade</h3>
                      <p className='text-gray-600'>
                        Review supplier profiles, compare quotes, and connect directly with
                        suppliers through our secure messaging system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className='bg-white rounded-2xl shadow-xl p-8'>
                <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                  Frequently Asked Questions
                </h2>

                <div className='space-y-4'>
                  {filteredFaqs.map((faq, index) => (
                    <div key={index} className='border border-gray-200 rounded-lg'>
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className='w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors'
                      >
                        <span className='font-medium text-gray-900'>{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className='w-5 h-5 text-gray-500' />
                        ) : (
                          <ChevronDown className='w-5 h-5 text-gray-500' />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className='px-6 pb-4'>
                          <p className='text-gray-600'>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Tutorials */}
              <div className='bg-white rounded-2xl shadow-xl p-8'>
                <h2 className='text-2xl font-bold text-gray-900 mb-6'>Video Tutorials</h2>

                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='bg-gray-100 rounded-lg p-6'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <span>🎥</span>
                      <h3 className='font-semibold text-gray-900'>Getting Started</h3>
                    </div>
                    <p className='text-gray-600 text-sm mb-4'>
                      Learn the basics of using BELL24H platform
                    </p>
                    <button className='text-blue-600 hover:text-blue-700 font-medium'>
                      Watch Video →
                    </button>
                  </div>

                  <div className='bg-gray-100 rounded-lg p-6'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <span>🎥</span>
                      <h3 className='font-semibold text-gray-900'>Voice RFQ Guide</h3>
                    </div>
                    <p className='text-gray-600 text-sm mb-4'>
                      Master the Voice RFQ feature for better results
                    </p>
                    <button className='text-green-600 hover:text-green-700 font-medium'>
                      Watch Video →
                    </button>
                  </div>

                  <div className='bg-gray-100 rounded-lg p-6'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <span>🎥</span>
                      <h3 className='font-semibold text-gray-900'>AI Dashboard</h3>
                    </div>
                    <p className='text-gray-600 text-sm mb-4'>
                      Understand your AI-powered analytics dashboard
                    </p>
                    <button className='text-purple-600 hover:text-purple-700 font-medium'>
                      Watch Video →
                    </button>
                  </div>

                  <div className='bg-gray-100 rounded-lg p-6'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <span>🎥</span>
                      <h3 className='font-semibold text-gray-900'>Payment & Security</h3>
                    </div>
                    <p className='text-gray-600 text-sm mb-4'>
                      Learn about secure payments and data protection
                    </p>
                    <button className='text-orange-600 hover:text-orange-700 font-medium'>
                      Watch Video →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-8'>
              {/* Contact Support */}
              <div className='bg-white rounded-2xl shadow-xl p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>Contact Support</h3>

                <div className='space-y-4'>
                  <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg'>
                    <MessageSquare className='w-5 h-5 text-blue-600' />
                    <div>
                      <p className='font-medium text-gray-900'>Live Chat</p>
                      <p className='text-sm text-gray-600'>Available 24/7</p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3 p-3 bg-green-50 rounded-lg'>
                    <span>📞</span>
                    <div>
                      <p className='font-medium text-gray-900'>Phone Support</p>
                      <p className='text-sm text-gray-600'>+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3 p-3 bg-purple-50 rounded-lg'>
                    <span>📧</span>
                    <div>
                      <p className='font-medium text-gray-900'>Email Support</p>
                      <p className='text-sm text-gray-600'>support@bell24h.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className='bg-white rounded-2xl shadow-xl p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>Resources</h3>

                <div className='space-y-3'>
                  <a
                    href='/docs/user-guide'
                    className='flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors'
                  >
                    <BookOpen className='w-5 h-5 text-blue-600' />
                    <span className='text-gray-700'>User Guide</span>
                  </a>

                  <a
                    href='/docs/api'
                    className='flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors'
                  >
                    <span>📄</span>
                    <span className='text-gray-700'>API Documentation</span>
                  </a>

                  <a
                    href='/community'
                    className='flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors'
                  >
                    <span>👤</span>
                    <span className='text-gray-700'>Community Forum</span>
                  </a>

                  <a
                    href='/feedback'
                    className='flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors'
                  >
                    <span>⭐</span>
                    <span className='text-gray-700'>Feature Requests</span>
                  </a>
                </div>
              </div>

              {/* System Status */}
              <div className='bg-white rounded-2xl shadow-xl p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>System Status</h3>

                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Platform</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-sm font-medium text-green-600'>Operational</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>AI Services</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-sm font-medium text-green-600'>Operational</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Payment System</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-sm font-medium text-green-600'>Operational</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Voice RFQ</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-sm font-medium text-green-600'>Operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className='bg-white rounded-2xl shadow-xl p-8 mt-8'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>Was this helpful?</h2>
              <p className='text-gray-600 mb-6'>
                Help us improve our help center by providing feedback
              </p>
              <div className='flex justify-center space-x-4'>
                <button className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
                  Yes, it helped
                </button>
                <button className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
                  No, I need more help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
