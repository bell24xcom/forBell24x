'use client';

import React, { useRef, useState } from 'react';

interface ProfessionalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
  className?: string;
  isAdmin?: boolean;
}

export default function ProfessionalLogo({
  size = 'md',
  showText = true,
  onClick,
  className = '',
  isAdmin = false,
}: ProfessionalLogoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sizes = {
    sm: {
      icon: 'h-10 w-10',
      text: 'text-lg',
      container: 'space-x-2',
      emoji: 'text-lg',
    },
    md: {
      icon: 'h-14 w-14',
      text: 'text-2xl',
      container: 'space-x-3',
      emoji: 'text-2xl',
    },
    lg: {
      icon: 'h-16 w-16',
      text: 'text-3xl',
      container: 'space-x-4',
      emoji: 'text-3xl',
    },
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    // Play authentic temple bell sound
    if (audioRef.current) {
      setIsPlaying(true);
      audioRef.current.play().catch(console.error);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div
      className={`flex items-center ${sizes[size].container} cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      {/* Enterprise Dashboard-Style Logo */}
      <div className='relative group'>
        <div
          className={`${
            sizes[size].icon
          } rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 ${
            isPlaying ? 'animate-pulse scale-110' : ''
          }`}
        >
          <img
            src="/bell-logo.jpeg"
            alt="BELL Logo"
            className={`${sizes[size].icon} object-contain rounded-2xl ${
              isPlaying ? 'animate-bounce' : ''
            }`}
          />
        </div>

        {/* Admin Indicator */}
        {isAdmin && (
          <div className='absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg'>
            <span className='text-white text-xs'>⚡</span>
          </div>
        )}
      </div>

      {/* Enhanced Text with Enterprise Typography */}
      {showText && (
        <div>
          <h1
            className={`${sizes[size].text} font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight leading-none`}
          >
            BELL
          </h1>
          {size === 'lg' && (
            <p className='text-sm text-gray-600 font-medium -mt-1'>Enterprise Platform</p>
          )}
        </div>
      )}

      {/* Audio Element for Authentic Temple Bell Sound */}
      <audio ref={audioRef} onEnded={handleAudioEnd} preload='none'>
        <source src='/sounds/temple-bell-authentic.mp3' type='audio/mpeg' />
      </audio>
    </div>
  );
}
