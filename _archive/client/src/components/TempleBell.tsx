'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TempleBellProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  soundEnabled?: boolean;
}

export default function TempleBell({
  size = 'md',
  className = '',
  soundEnabled = true,
}: TempleBellProps) {
  const [isRinging, setIsRinging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // Create audio element for bell sound
    if (typeof window !== 'undefined' && soundEnabled) {
      audioRef.current = new Audio('/sounds/temple-bell.mp3');
      audioRef.current.preload = 'auto';
    }
  }, [soundEnabled]);

  const playBellSound = () => {
    if (!mounted || !soundEnabled || !audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } catch (error) {
      console.log('Could not play bell sound:', error);
    }
  };

  const handleClick = () => {
    if (isRinging) return;

    setIsRinging(true);
    playBellSound();

    // Stop animation after 2 seconds
    setTimeout(() => {
      setIsRinging(false);
    }, 2000);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const bellSize = sizeClasses[size];

  if (!mounted) {
    return (
      <div className={`${bellSize} ${className}`}>
        <span>🔔</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={isRinging}
        className={`
          relative group cursor-pointer transition-all duration-200 
          ${isRinging ? 'animate-pulse' : 'hover:scale-110'}
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 rounded-full
        `}
        title='Click to ring the temple bell'
      >
        <div
          className={`
            relative ${bellSize} transition-all duration-200
            ${isRinging ? 'animate-swing' : ''}
          `}
        >
          {/* Bell Shadow */}
          <div
            className={`
              absolute top-2 left-2 ${bellSize} 
              bg-amber-800 opacity-20 rounded-full filter blur-sm
            `}
          />

          {/* Bell Body */}
          <div
            className={`
              relative ${bellSize} rounded-full 
              bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600
              shadow-lg group-hover:shadow-xl transition-all duration-200
              ${isRinging ? 'shadow-2xl shadow-amber-400/50' : ''}
            `}
          >
            <span>🔔</span>

            {/* Bell Highlight */}
            <div
              className={`
                absolute top-1 left-1 ${
                  bellSize === 'h-8 w-8'
                    ? 'h-2 w-2'
                    : bellSize === 'h-12 w-12'
                    ? 'h-3 w-3'
                    : 'h-4 w-4'
                } 
                bg-amber-200 rounded-full opacity-60
              `}
            />
          </div>

          {/* Sound Waves Animation */}
          {isRinging && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='absolute animate-ping h-8 w-8 rounded-full bg-amber-400 opacity-30'></div>
              <div className='absolute animate-ping h-12 w-12 rounded-full bg-amber-400 opacity-20 animation-delay-200'></div>
              <div className='absolute animate-ping h-16 w-16 rounded-full bg-amber-400 opacity-10 animation-delay-400'></div>
            </div>
          )}
        </div>

        {/* Sound Indicator */}
        <div className='absolute -bottom-1 -right-1'>
          {soundEnabled ? (
            <span>🔊</span>
          ) : (
            <span>🔊</span>
          )}
        </div>
      </button>

      {/* Ripple Effect */}
      {isRinging && (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
          <div className='absolute h-20 w-20 rounded-full border-2 border-amber-400 animate-ping opacity-50'></div>
          <div className='absolute h-24 w-24 rounded-full border border-amber-300 animate-ping opacity-30 animation-delay-300'></div>
        </div>
      )}
    </div>
  );
}

// Custom CSS for bell swing animation (add to global CSS)
const bellAnimationCSS = `
@keyframes swing {
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
}

.animate-swing {
  animation: swing 1s ease-in-out;
  transform-origin: top center;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}
`;

// Export CSS for injection
export const templeBellCSS = bellAnimationCSS;
