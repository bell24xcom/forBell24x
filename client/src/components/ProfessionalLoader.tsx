'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProfessionalLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function ProfessionalLoader({
  size = 'md',
  message = 'Loading Bell24H...',
}: ProfessionalLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className='flex flex-col items-center justify-center space-y-4'>
      {/* Animated Bell24H Logo Loader */}
      <div className='relative'>
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-4 border-blue-200 dark:border-blue-800`}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <motion.div
            className={`${sizeClasses[size]} rounded-full border-t-4 border-l-4 border-orange-500`}
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        {/* Center dot */}
        <motion.div
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full'
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Loading Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='text-sm font-medium text-gray-600 dark:text-gray-400'
      >
        {message}
      </motion.p>

      {/* Loading Progress Dots */}
      <div className='flex space-x-1'>
        {[0, 1, 2].map(index => (
          <motion.div
            key={index}
            className='w-2 h-2 bg-blue-500 rounded-full'
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Full-screen loading overlay
export function ProfessionalPageLoader({ message = 'Loading Bell24H...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center'
    >
      <div className='text-center'>
        <ProfessionalLoader size='lg' message={message} />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className='mt-6 h-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full max-w-xs mx-auto'
        />
      </div>
    </motion.div>
  );
}
