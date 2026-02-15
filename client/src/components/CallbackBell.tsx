'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CallbackRequest {
  phone: string;
  name?: string;
  company?: string;
  preferredTime?: string;
  message?: string;
}

interface CallbackBellProps {
  soundOn?: boolean;
  className?: string;
  variant?: 'compact' | 'expanded';
}

export default function CallbackBell({
  soundOn = false,
  className = '',
  variant = 'compact',
}: CallbackBellProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isExpanded, setIsExpanded] = useState(variant === 'expanded');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const successAudioRef = useRef<HTMLAudioElement>(null);

  // Phone number validation
  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
  };

  const playBellSound = () => {
    if (soundOn && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently fail if audio can't play
      });
    }
  };

  const playSuccessSound = () => {
    if (soundOn && successAudioRef.current) {
      successAudioRef.current.currentTime = 0;
      successAudioRef.current.play().catch(() => {
        // Silently fail if audio can't play
      });
    }
  };

  const handleSubmit = async () => {
    if (!phone.trim()) {
      setErrorMessage('Phone number is required');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage('Please enter a valid phone number');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsSubmitting(true);
    playBellSound();

    try {
      // Simulate API call
      const requestData: CallbackRequest = {
        phone: phone.trim(),
        name: name.trim() || undefined,
        company: company.trim() || undefined,
        preferredTime: 'ASAP',
        message: 'Callback request from Bell24H homepage',
      };

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, you would call your API here
      // const response = await fetch('/api/callback-request', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(requestData)
      // });

      console.log('Callback request:', requestData);

      setShowSuccess(true);
      playSuccessSound();

      // Reset form
      setPhone('');
      setName('');
      setCompany('');
      setIsExpanded(false);

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      setErrorMessage('Failed to submit request. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneDisplay = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    return phoneNumber;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Compact Version */}
      {!isExpanded && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className='flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 max-w-md mx-auto'
        >
          <div className='flex items-center gap-3 flex-1'>
            <span>📞</span>
            <input
              type='tel'
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder='Enter phone number'
              className='flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500'
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  if (phone.trim()) {
                    handleSubmit();
                  } else {
                    setIsExpanded(true);
                  }
                }
              }}
            />
          </div>

          <motion.button
            onClick={() => (phone.trim() ? handleSubmit() : setIsExpanded(true))}
            disabled={isSubmitting}
            className='relative'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className='w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group'>
              {isSubmitting ? (
                <Loader2 className='w-6 h-6 text-white animate-spin' />
              ) : (
                <span>🔔</span>
              )}
            </div>

            {/* Ripple effect */}
            <motion.div
              className='absolute inset-0 bg-amber-400 rounded-xl opacity-30'
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        </motion.div>
      )}

      {/* Expanded Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-lg mx-auto'
          >
            {/* Header */}
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center'>
                  <span>🔔</span>
                </div>
                <div>
                  <h3 className='font-bold text-gray-900'>Request Callback</h3>
                  <p className='text-sm text-gray-600'>We'll call you within 30 minutes</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className='text-gray-400 hover:text-gray-600 transition-colors'
              >
                <span>❌</span>
              </button>
            </div>

            {/* Form Fields */}
            <div className='space-y-4 mb-6'>
              {/* Phone Number */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Phone Number *
                </label>
                <div className='relative'>
                  <span>📞</span>
                  <input
                    type='tel'
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder='+91 98765 43210'
                    className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Your Name</label>
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder='Enter your full name'
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                />
              </div>

              {/* Company */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Company Name
                </label>
                <input
                  type='text'
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder='Enter company name'
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                />
              </div>
            </div>

            {/* Trust Indicators */}
            <div className='bg-blue-50 rounded-xl p-4 mb-6'>
              <div className='flex items-center gap-3 text-sm text-blue-800'>
                <div className='flex items-center gap-2'>
                  <span>🕐</span>
                  <span>30 min response</span>
                </div>
                <div className='w-px h-4 bg-blue-300' />
                <div className='flex items-center gap-2'>
                  <span>🌍</span>
                  <span>Available 24/7</span>
                </div>
                <div className='w-px h-4 bg-blue-300' />
                <span>Free consultation</span>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting || !phone.trim()}
              className='w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Submitting Request...
                </>
              ) : (
                <>
                  <span>🔔</span>
                  Request Callback Now
                </>
              )}
            </motion.button>

            {/* Privacy Note */}
            <p className='text-xs text-gray-500 text-center mt-4'>
              Your information is secure and will only be used to contact you about Bell24H
              services.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className='fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50'
          >
            <div className='bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3'>
              <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                <span>✅</span>
              </div>
              <div>
                <h4 className='font-semibold'>Callback Requested!</h4>
                <p className='text-sm text-green-100'>
                  We'll call you within 30 minutes at {formatPhoneDisplay(phone)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className='fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50'
          >
            <div className='bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3'>
              <div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center'>
                <span>❌</span>
              </div>
              <div>
                <h4 className='font-semibold'>Error</h4>
                <p className='text-sm text-red-100'>{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Elements */}
      <audio ref={audioRef} src='/sounds/temple-bell.mp3' preload='auto' />
      <audio ref={successAudioRef} src='/sounds/success-chime.mp3' preload='auto' />
    </div>
  );
}
