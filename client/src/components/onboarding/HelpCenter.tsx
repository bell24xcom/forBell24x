'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  category: string;
  thumbnail: string;
}

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqData: FAQItem[] = [
  {
    id: 'voice-rfq-how',
    question: 'How does Voice RFQ work?',
    answer:
      'Voice RFQ uses advanced AI to convert your spoken requirements into detailed RFQs. Simply click the microphone button, speak your requirements clearly, and our AI will create a comprehensive RFQ with all necessary details.',
    category: 'Voice RFQ',
    tags: ['voice', 'rfq', 'ai', 'speech'],
  },
  {
    id: 'ai-search-accuracy',
    question: 'How accurate is the AI search?',
    answer:
      'Our AI search has 98.5% accuracy in finding relevant suppliers. It understands context, industry terminology, and business requirements to match you with the best suppliers for your needs.',
    category: 'AI Search',
    tags: ['ai', 'search', 'accuracy', 'suppliers'],
  },
  {
    id: 'trial-limits',
    question: 'What are my trial limits?',
    answer:
      'Free trial includes: 5 Voice RFQ requests, 20 supplier contacts, 100 AI searches, basic analytics, and email support. Upgrade to unlock unlimited access.',
    category: 'Trial & Billing',
    tags: ['trial', 'limits', 'upgrade', 'billing'],
  },
  {
    id: 'supplier-verification',
    question: 'How do you verify suppliers?',
    answer:
      'All suppliers undergo rigorous verification including business registration, GST verification, quality certifications, and customer reviews. We maintain a 99.9% verification success rate.',
    category: 'Suppliers',
    tags: ['verification', 'quality', 'certification', 'reviews'],
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. All payments are processed securely through Razorpay with 256-bit encryption.',
    category: 'Billing',
    tags: ['payment', 'razorpay', 'security', 'cards'],
  },
  {
    id: 'upgrade-process',
    question: 'How do I upgrade my plan?',
    answer:
      'Click the "Upgrade" button in your dashboard or visit the subscription page. Choose your plan, complete payment, and your account will be upgraded immediately.',
    category: 'Billing',
    tags: ['upgrade', 'subscription', 'payment', 'plans'],
  },
  {
    id: 'data-security',
    question: 'How secure is my data?',
    answer:
      'We use enterprise-grade security with 256-bit encryption, SOC 2 compliance, regular security audits, and GDPR compliance. Your data is never shared with third parties.',
    category: 'Security',
    tags: ['security', 'encryption', 'gdpr', 'compliance'],
  },
  {
    id: 'support-contact',
    question: 'How can I contact support?',
    answer:
      '24/7 support available via: Email (support@bell24h.com), Phone (+91-98765-43210), Live Chat, or WhatsApp. Average response time is under 5 minutes.',
    category: 'Support',
    tags: ['support', 'contact', 'help', 'assistance'],
  },
];

const videoTutorials: VideoTutorial[] = [
  {
    id: 'voice-rfq-tutorial',
    title: 'Getting Started with Voice RFQ',
    description:
      'Learn how to use our revolutionary voice-based RFQ system to create detailed requests instantly.',
    videoUrl: 'https://www.youtube.com/embed/voice-rfq-demo',
    duration: '3:45',
    category: 'Voice RFQ',
    thumbnail: '/images/tutorials/voice-rfq-thumb.jpg',
  },
  {
    id: 'ai-search-guide',
    title: 'Mastering AI-Powered Search',
    description:
      'Discover how to use our 98.5% accurate AI search to find the perfect suppliers for your business.',
    videoUrl: 'https://www.youtube.com/embed/ai-search-guide',
    duration: '5:20',
    category: 'AI Search',
    thumbnail: '/images/tutorials/ai-search-thumb.jpg',
  },
  {
    id: 'dashboard-overview',
    title: 'Dashboard Walkthrough',
    description: 'Complete guide to your Bell24H dashboard and analytics features.',
    videoUrl: 'https://www.youtube.com/embed/dashboard-tour',
    duration: '4:15',
    category: 'Dashboard',
    thumbnail: '/images/tutorials/dashboard-thumb.jpg',
  },
  {
    id: 'supplier-management',
    title: 'Managing Supplier Contacts',
    description: 'Learn how to effectively manage and track your supplier relationships.',
    videoUrl: 'https://www.youtube.com/embed/supplier-management',
    duration: '6:30',
    category: 'Suppliers',
    thumbnail: '/images/tutorials/suppliers-thumb.jpg',
  },
];

const categories = [
  'All',
  'Voice RFQ',
  'AI Search',
  'Dashboard',
  'Suppliers',
  'Trial & Billing',
  'Security',
  'Support',
];

export default function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'videos' | 'contact'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Filter FAQ based on search and category
  const filteredFAQ = faqData.filter(item => {
    const matchesSearch =
      searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Filter videos based on category
  const filteredVideos = videoTutorials.filter(
    video => selectedCategory === 'All' || video.category === selectedCategory
  );

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, send to API
    console.log('Contact form submitted:', contactForm);

    // Track support request
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'support_request', {
        event_category: 'help_center',
        event_label: contactForm.subject,
      });
    }

    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
    alert("Thank you! We'll get back to you within 5 minutes.");
  };

  const handleContactFormChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Help Center</h2>
            <p className='text-gray-600'>Find answers, watch tutorials, or contact support</p>
          </div>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
            <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className='p-6 border-b border-gray-200'>
          <div className='relative'>
            <input
              ref={searchRef}
              type='text'
              placeholder='Search for help topics...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <svg
              className='absolute left-3 top-3.5 w-5 h-5 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex flex-wrap gap-2'>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-200'>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-3 px-6 text-sm font-medium transition-colors ${
              activeTab === 'faq'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            FAQ ({filteredFAQ.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-3 px-6 text-sm font-medium transition-colors ${
              activeTab === 'videos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Video Tutorials ({filteredVideos.length})
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-3 px-6 text-sm font-medium transition-colors ${
              activeTab === 'contact'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Contact Support
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {activeTab === 'faq' && (
            <div className='space-y-4'>
              {filteredFAQ.length === 0 ? (
                <div className='text-center py-8'>
                  <svg
                    className='w-12 h-12 text-gray-400 mx-auto mb-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33'
                    />
                  </svg>
                  <p className='text-gray-500'>No FAQ items found for your search.</p>
                </div>
              ) : (
                filteredFAQ.map(item => (
                  <div key={item.id} className='border border-gray-200 rounded-lg'>
                    <button
                      onClick={() => handleFAQToggle(item.id)}
                      className='w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-medium text-gray-900'>{item.question}</h3>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedFAQ === item.id ? 'rotate-180' : ''
                          }`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </button>
                    {expandedFAQ === item.id && (
                      <div className='px-6 pb-4'>
                        <p className='text-gray-600 leading-relaxed'>{item.answer}</p>
                        <div className='mt-3 flex flex-wrap gap-1'>
                          {item.tags.map(tag => (
                            <span
                              key={tag}
                              className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {filteredVideos.map(video => (
                <div key={video.id} className='border border-gray-200 rounded-lg overflow-hidden'>
                  <div className='aspect-video bg-gray-100 flex items-center justify-center'>
                    <div className='text-center'>
                      <svg
                        className='w-12 h-12 text-gray-400 mx-auto mb-2'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      <p className='text-sm text-gray-500'>Video Tutorial</p>
                    </div>
                  </div>
                  <div className='p-4'>
                    <h3 className='font-medium text-gray-900 mb-2'>{video.title}</h3>
                    <p className='text-sm text-gray-600 mb-3'>{video.description}</p>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-500'>{video.duration}</span>
                      <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className='max-w-2xl mx-auto'>
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>Contact Support</h3>
                <p className='text-gray-600'>
                  Get help from our expert support team. We typically respond within 5 minutes.
                </p>
              </div>

              <form onSubmit={handleContactSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                    <input
                      type='text'
                      required
                      value={contactForm.name}
                      onChange={e => handleContactFormChange('name', e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                    <input
                      type='email'
                      required
                      value={contactForm.email}
                      onChange={e => handleContactFormChange('email', e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
                  <input
                    type='text'
                    required
                    value={contactForm.subject}
                    onChange={e => handleContactFormChange('subject', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={e => handleContactFormChange('message', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Describe your issue or question...'
                  />
                </div>

                <button
                  type='submit'
                  className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Send Message
                </button>
              </form>

              <div className='mt-8 p-4 bg-blue-50 rounded-lg'>
                <h4 className='font-medium text-blue-900 mb-2'>Other Ways to Contact Us</h4>
                <div className='space-y-2 text-sm text-blue-800'>
                  <p>📧 Email: support@bell24h.com</p>
                  <p>📞 Phone: +91-98765-43210</p>
                  <p>💬 Live Chat: Available 24/7</p>
                  <p>📱 WhatsApp: +91-98765-43210</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
