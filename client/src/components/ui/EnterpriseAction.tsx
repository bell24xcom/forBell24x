'use client';

import React from 'react';
import { cn, touchTargets } from '@/lib/utils';

interface EnterpriseActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'success' | 'secondary' | 'accent';
  className?: string;
}

const EnterpriseAction: React.FC<EnterpriseActionProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'primary',
  className,
}) => {
  const getVariantClasses = (variant: string) => {
    const variants = {
      primary: {
        container:
          'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800 hover:border-primary-400',
        overlay: 'bg-gradient-enterprise',
        icon: 'text-primary-600 dark:text-primary-400',
        iconBg: 'bg-primary-100 dark:bg-primary-800/50',
        title: 'text-primary-700 dark:text-primary-300',
        description: 'text-primary-600 dark:text-primary-400',
      },
      success: {
        container:
          'bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-800 hover:border-success-400',
        overlay: 'bg-gradient-success',
        icon: 'text-success-600 dark:text-success-400',
        iconBg: 'bg-success-100 dark:bg-success-800/50',
        title: 'text-success-700 dark:text-success-300',
        description: 'text-success-600 dark:text-success-400',
      },
      secondary: {
        container:
          'bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 border-secondary-200 dark:border-secondary-800 hover:border-secondary-400',
        overlay: 'bg-gradient-to-br from-secondary-600 to-secondary-700',
        icon: 'text-secondary-600 dark:text-secondary-400',
        iconBg: 'bg-secondary-100 dark:bg-secondary-800/50',
        title: 'text-secondary-700 dark:text-secondary-300',
        description: 'text-secondary-600 dark:text-secondary-400',
      },
      accent: {
        container:
          'bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 border-accent-200 dark:border-accent-800 hover:border-accent-400',
        overlay: 'bg-gradient-accent',
        icon: 'text-accent-600 dark:text-accent-400',
        iconBg: 'bg-accent-100 dark:bg-accent-800/50',
        title: 'text-accent-700 dark:text-accent-300',
        description: 'text-accent-600 dark:text-accent-400',
      },
    };
    return variants[variant as keyof typeof variants];
  };

  const colors = getVariantClasses(variant);

  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        'group relative flex flex-col items-center justify-center',
        'rounded-xl border-2 hover:shadow-enterprise',
        'transition-all duration-300 hover:-translate-y-1',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',

        // Mobile-friendly touch targets
        touchTargets.comfortable,
        'p-4 sm:p-6',

        // Variant-specific styles
        colors.container,

        // Focus styles
        variant === 'primary' && 'focus:ring-primary-500',
        variant === 'success' && 'focus:ring-success-500',
        variant === 'secondary' && 'focus:ring-secondary-500',
        variant === 'accent' && 'focus:ring-accent-500',

        className
      )}
    >
      {/* Hover overlay */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300',
          colors.overlay
        )}
      />

      {/* Content */}
      <div className='relative z-10 text-center'>
        <div
          className={cn(
            'p-3 rounded-xl mb-3 transition-transform duration-300 group-hover:scale-110',
            colors.iconBg
          )}
        >
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', colors.icon)} />
        </div>
        <span className={cn('font-bold text-sm sm:text-base', colors.title)}>{title}</span>
        <p className={cn('text-xs mt-1', colors.description)}>{description}</p>
      </div>
    </button>
  );
};

export { EnterpriseAction };
export default EnterpriseAction;
