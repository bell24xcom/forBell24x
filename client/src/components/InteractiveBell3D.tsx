import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface InteractiveBell3DProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  animated?: boolean;
  onClick?: () => void;
}

const InteractiveBell3D: React.FC<InteractiveBell3DProps> = ({
  className = '',
  size = 'medium',
  color = '#F59E0B',
  animated = true,
  onClick,
}) => {
  const bellRef = useRef<HTMLDivElement>(null);
  const [isRinging, setIsRinging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setMousePosition({
        x: ((e.clientX - centerX) / rect.width) * 20,
        y: ((e.clientY - centerY) / rect.height) * 20,
      });
    }
  };

  const handleClick = () => {
    setIsRinging(true);
    setTimeout(() => setIsRinging(false), 1000);
    if (onClick) onClick();
  };

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setIsRinging(true);
        setTimeout(() => setIsRinging(false), 500);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [animated]);

  return (
    <div
      ref={bellRef}
      className={`relative ${sizeClasses[size]} ${className} cursor-pointer`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* 3D Bell SVG */}
      <motion.svg
        className='w-full h-full'
        viewBox='0 0 100 100'
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          transform: `perspective(200px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
        }}
        animate={
          isRinging
            ? {
                rotate: [-5, 5, -5, 5, 0],
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Bell Shadow */}
        <ellipse cx='50' cy='85' rx='25' ry='8' fill='rgba(0,0,0,0.2)' opacity='0.6' />

        {/* Bell Body - Main */}
        <motion.path
          d='M 25 45 Q 25 25 50 25 Q 75 25 75 45 L 75 65 Q 75 75 65 75 L 35 75 Q 25 75 25 65 Z'
          fill={color}
          stroke='rgba(0,0,0,0.1)'
          strokeWidth='1'
          animate={isRinging ? { fill: [color, '#FCD34D', color] } : {}}
          transition={{ duration: 0.5 }}
        />

        {/* Bell Body - Highlight */}
        <motion.path
          d='M 30 30 Q 35 28 45 30 Q 40 35 35 40 Q 32 35 30 30 Z'
          fill='rgba(255,255,255,0.3)'
          animate={isRinging ? { opacity: [0.3, 0.6, 0.3] } : {}}
        />

        {/* Bell Body - Shadow */}
        <path
          d='M 65 45 Q 70 50 70 60 L 70 65 Q 70 72 65 74 L 60 74 Q 68 72 68 65 L 68 50 Q 65 45 65 45 Z'
          fill='rgba(0,0,0,0.1)'
        />

        {/* Bell Top */}
        <motion.rect
          x='47'
          y='20'
          width='6'
          height='8'
          rx='3'
          fill={color}
          stroke='rgba(0,0,0,0.1)'
          strokeWidth='0.5'
          animate={isRinging ? { y: [20, 18, 20] } : {}}
          transition={{ duration: 0.5 }}
        />

        {/* Bell Clapper */}
        <motion.circle
          cx='50'
          cy='60'
          r='3'
          fill='#8B4513'
          stroke='rgba(0,0,0,0.2)'
          strokeWidth='0.5'
          animate={
            isRinging
              ? {
                  cx: [50, 48, 52, 50],
                  cy: [60, 58, 62, 60],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
        />

        {/* Bell Clapper String */}
        <motion.line
          x1='50'
          y1='35'
          x2='50'
          y2='57'
          stroke='#8B4513'
          strokeWidth='1'
          animate={
            isRinging
              ? {
                  x2: [50, 48, 52, 50],
                  y2: [57, 55, 59, 57],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
        />

        {/* Bell Opening */}
        <ellipse cx='50' cy='75' rx='25' ry='4' fill='rgba(0,0,0,0.3)' />

        {/* Sound Waves */}
        {isRinging && (
          <>
            <motion.circle
              cx='50'
              cy='50'
              r='30'
              fill='none'
              stroke={color}
              strokeWidth='2'
              opacity='0.6'
              initial={{ r: 30, opacity: 0.6 }}
              animate={{ r: 50, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <motion.circle
              cx='50'
              cy='50'
              r='35'
              fill='none'
              stroke={color}
              strokeWidth='1.5'
              opacity='0.4'
              initial={{ r: 35, opacity: 0.4 }}
              animate={{ r: 60, opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
            />
            <motion.circle
              cx='50'
              cy='50'
              r='40'
              fill='none'
              stroke={color}
              strokeWidth='1'
              opacity='0.2'
              initial={{ r: 40, opacity: 0.2 }}
              animate={{ r: 70, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            />
          </>
        )}
      </motion.svg>

      {/* Notification Badge */}
      {animated && (
        <motion.div
          className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center'
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            className='text-white text-xs font-bold'
            animate={isRinging ? { scale: [1, 1.2, 1] } : {}}
          >
            !
          </motion.span>
        </motion.div>
      )}

      {/* Hover Effect */}
      <motion.div
        className='absolute inset-0 rounded-full'
        whileHover={{
          boxShadow: `0 0 20px ${color}40`,
          scale: 1.05,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Click Ripple Effect */}
      {isRinging && (
        <motion.div
          className='absolute inset-0 rounded-full border-2'
          style={{ borderColor: color }}
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
    </div>
  );
};

export default InteractiveBell3D;
