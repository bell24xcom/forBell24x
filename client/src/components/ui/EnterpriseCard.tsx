'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface EnterpriseCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  gradient?: boolean;
}

const EnterpriseCard: React.FC<EnterpriseCardProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  interactive = false,
  gradient = false,
}) => {
  const baseClasses = ['rounded-2xl', 'border', 'transition-all', 'duration-300'];

  const variantClasses = {
    default: [
      'bg-gradient-card',
      'dark:bg-gray-800',
      'border-gray-200',
      'dark:border-gray-700',
      'shadow-enterprise',
    ],
    primary: [
      'bg-gradient-to-br',
      'from-primary-50',
      'to-primary-100',
      'dark:from-primary-900/20',
      'dark:to-primary-800/20',
      'border-primary-200',
      'dark:border-primary-800',
      'shadow-enterprise',
    ],
    success: [
      'bg-gradient-to-br',
      'from-success-50',
      'to-success-100',
      'dark:from-success-900/20',
      'dark:to-success-800/20',
      'border-success-200',
      'dark:border-success-800',
      'shadow-enterprise',
    ],
    secondary: [
      'bg-gradient-to-br',
      'from-secondary-50',
      'to-secondary-100',
      'dark:from-secondary-900/20',
      'dark:to-secondary-800/20',
      'border-secondary-200',
      'dark:border-secondary-800',
      'shadow-enterprise',
    ],
    accent: [
      'bg-gradient-to-br',
      'from-accent-50',
      'to-accent-100',
      'dark:from-accent-900/20',
      'dark:to-accent-800/20',
      'border-accent-200',
      'dark:border-accent-800',
      'shadow-enterprise',
    ],
  };

  const sizeClasses = {
    sm: ['p-4'],
    md: ['p-6'],
    lg: ['p-8'],
  };

  const interactiveClasses = interactive
    ? ['hover:shadow-enterprise-hover', 'hover:-translate-y-1', 'cursor-pointer', 'group']
    : [];

  const gradientOverlay =
    gradient && interactive ? (
      <div className='absolute inset-0 bg-gradient-enterprise rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300' />
    ) : null;

  const allClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    interactiveClasses,
    className
  );

  return (
    <div className={cn('relative', interactive && 'group')}>
      <div className={allClasses}>
        {gradientOverlay}
        <div
          className={cn(
            'relative z-10',
            interactive && 'group-hover:scale-[1.01] transition-transform duration-300'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export { EnterpriseCard };
export default EnterpriseCard;
