'use client';
import { useState } from 'react';

interface MarketingCampaignProps {
  onEmailCapture: (email: string) => void;
}

export default function MarketingCampaign({ onEmailCapture }: MarketingCampaignProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onEmailCapture(email);
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Error submitting email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialProof = [
    { metric: '2M+', label: 'Global Suppliers' },
    { metric: '₹500Cr', label: 'Daily Volume' },
    { metric: '50K+', label: 'Enterprise Buyers' },
    { metric: '99.99%', label: 'Uptime SLA' },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'Tata Steel',
      role: 'Head of Procurement',
      content:
        'Bell24H transformed our procurement process. 40% cost reduction and 60% faster supplier onboarding.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      company: 'Reliance Industries',
      role: 'Supply Chain Director',
      content: 'The AI-powered matching is incredible. We found 3 new suppliers in under 24 hours.',
      rating: 5,
    },
    {
      name: 'Amit Patel',
      company: 'Larsen & Toubro',
      role: 'Operations Manager',
      content:
        'Seamless ERP integration and real-time analytics. Game-changer for enterprise procurement.',
      rating: 5,
    },
  ];

  if (isSubmitted) {
    return (
      <div className='bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 text-center'>
        <span>✅</span>
        <h3 className='text-2xl font-bold text-white mb-2'>Welcome to Bell24H!</h3>
        <p className='text-slate-300 mb-4'>
          Thank you for joining the future of B2B procurement. We'll be in touch with exclusive
          early access.
        </p>
        <div className='flex items-center justify-center space-x-4 text-sm text-slate-400'>
          <div className='flex items-center'>
            <span>✅</span>
            <span>Early Access Granted</span>
          </div>
          <div className='flex items-center'>
            <span>✅</span>
            <span>Priority Support</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>Join the B2B Revolution</h2>
        <p className='text-xl text-slate-300 mb-6'>
          Get early access to the world's most advanced procurement platform
        </p>

        {/* Social Proof Metrics */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
          {socialProof.map((item, index) => (
            <div key={index} className='text-center'>
              <div className='text-2xl font-bold text-amber-400'>{item.metric}</div>
              <div className='text-sm text-slate-400'>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Capture Form */}
      <form onSubmit={handleSubmit} className='mb-8'>
        <div className='flex flex-col sm:flex-row gap-4 max-w-md mx-auto'>
          <div className='flex-1 relative'>
            <span>📧</span>
            <input
              type='email'
              placeholder='Enter your work email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none'
              required
            />
          </div>
          <button
            type='submit'
            disabled={isSubmitting}
            className='bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
          >
            {isSubmitting ? (
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
            ) : (
              <>
                Get Early Access
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Benefits */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='text-center'>
          <div className='bg-amber-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
            <span>📈</span>
          </div>
          <h3 className='text-lg font-semibold text-white mb-2'>40% Cost Reduction</h3>
          <p className='text-slate-400 text-sm'>Average savings across enterprise clients</p>
        </div>
        <div className='text-center'>
          <div className='bg-amber-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
            <span>👤</span>
          </div>
          <h3 className='text-lg font-semibold text-white mb-2'>2M+ Suppliers</h3>
          <p className='text-slate-400 text-sm'>Global network of verified suppliers</p>
        </div>
        <div className='text-center'>
          <div className='bg-amber-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
            <span>✅</span>
          </div>
          <h3 className='text-lg font-semibold text-white mb-2'>60% Faster</h3>
          <p className='text-slate-400 text-sm'>Procurement cycle optimization</p>
        </div>
      </div>

      {/* Testimonials */}
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold text-white text-center mb-6'>
          Trusted by Industry Leaders
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {testimonials.map((testimonial, index) => (
            <div key={index} className='bg-slate-700/30 border border-slate-600 rounded-xl p-4'>
              <div className='flex items-center mb-3'>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span>⭐</span>
                ))}
              </div>
              <p className='text-slate-300 text-sm mb-3'>"{testimonial.content}"</p>
              <div>
                <div className='font-semibold text-white text-sm'>{testimonial.name}</div>
                <div className='text-slate-400 text-xs'>{testimonial.role}</div>
                <div className='text-amber-400 text-xs'>{testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className='text-center mt-8'>
        <p className='text-slate-400 text-sm mb-4'>
          Join 500+ Fortune 500 companies already using Bell24H
        </p>
        <div className='flex items-center justify-center space-x-6 text-xs text-slate-500'>
          <span>✓ No credit card required</span>
          <span>✓ Free 30-day trial</span>
          <span>✓ Enterprise support</span>
        </div>
      </div>
    </div>
  );
}
