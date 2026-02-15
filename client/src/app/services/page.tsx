'use client';
import { useState } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  popular?: boolean;
}

const services: Service[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Perfect for small businesses starting their procurement journey',
    features: [
      'Up to 100 RFQs per month',
      'Basic supplier matching',
      'Email support',
      'Standard analytics',
      'Mobile app access',
    ],
    price: '₹9,999/month',
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    description: 'Ideal for growing enterprises with advanced procurement needs',
    features: [
      'Unlimited RFQs',
      'AI-powered supplier matching',
      'Priority support',
      'Advanced analytics & reporting',
      'Oracle ERP integration',
      'Custom workflows',
      'API access',
    ],
    price: '₹29,999/month',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'Complete solution for large organizations with complex requirements',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security features',
      'White-label options',
      'On-premise deployment',
      '24/7 phone support',
      'Custom training',
    ],
    price: '₹99,999/month',
  },
];

export default function ServicesPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');

  return (
    <div className='min-h-screen bg-slate-900 text-white'>
      <div className='max-w-7xl mx-auto px-4 py-16'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-6xl font-bold mb-6'>Choose Your Plan</h1>
          <p className='text-xl text-slate-400 max-w-3xl mx-auto'>
            Scale your procurement operations with our flexible pricing plans designed for
            businesses of all sizes
          </p>
        </div>

        {/* Pricing Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
          {services.map(service => (
            <div
              key={service.id}
              className={`relative bg-slate-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                service.popular
                  ? 'border-amber-500 shadow-2xl shadow-amber-500/20'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {service.popular && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-amber-500 text-black px-4 py-2 rounded-full text-sm font-semibold'>
                    Most Popular
                  </span>
                </div>
              )}

              <div className='text-center mb-8'>
                <h3 className='text-2xl font-bold mb-2'>{service.name}</h3>
                <p className='text-slate-400 mb-6'>{service.description}</p>
                <div className='text-4xl font-bold text-amber-400 mb-2'>{service.price}</div>
                <p className='text-slate-500 text-sm'>per month</p>
              </div>

              <ul className='space-y-4 mb-8'>
                {service.features.map((feature, index) => (
                  <li key={index} className='flex items-start space-x-3'>
                    <span>✅</span>
                    <span className='text-slate-300'>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  service.popular
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
                onClick={() => setSelectedPlan(service.id)}
              >
                {selectedPlan === service.id ? 'Current Plan' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className='bg-slate-800 rounded-2xl p-8 border border-slate-700'>
          <h2 className='text-3xl font-bold text-center mb-8'>Feature Comparison</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='bg-amber-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                <span>👤</span>
              </div>
              <h3 className='text-lg font-semibold mb-2'>User Management</h3>
              <p className='text-slate-400 text-sm'>
                Role-based access control and team collaboration features
              </p>
            </div>
            <div className='text-center'>
              <div className='bg-amber-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                <span>⚡</span>
              </div>
              <h3 className='text-lg font-semibold mb-2'>AI Integration</h3>
              <p className='text-slate-400 text-sm'>
                Smart supplier matching and automated workflow optimization
              </p>
            </div>
            <div className='text-center'>
              <div className='bg-amber-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                <span>🛡️</span>
              </div>
              <h3 className='text-lg font-semibold mb-2'>Security</h3>
              <p className='text-slate-400 text-sm'>
                Enterprise-grade security with encryption and compliance
              </p>
            </div>
            <div className='text-center'>
              <div className='bg-amber-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                <span>🌍</span>
              </div>
              <h3 className='text-lg font-semibold mb-2'>Global Reach</h3>
              <p className='text-slate-400 text-sm'>
                Access to 2M+ suppliers across 150+ countries
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='text-center mt-16'>
          <h2 className='text-3xl font-bold mb-4'>Ready to Transform Your Procurement?</h2>
          <p className='text-slate-400 mb-8 max-w-2xl mx-auto'>
            Join thousands of enterprises already using Bell24H to streamline their procurement
            processes
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button className='bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200'>
              Start Free Trial
            </button>
            <button className='border border-slate-600 text-white px-8 py-4 rounded-xl font-semibold hover:border-slate-500 transition-all duration-200'>
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
