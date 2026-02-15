'use client';

import React from 'react';
import EnterpriseCard from './EnterpriseCard';
import { cn } from '@/lib/utils';

interface EnterpriseMetricProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    icon?: LucideIcon;
  };
  variant?: 'primary' | 'success' | 'secondary' | 'accent';
  badge?: {
    text: string;
    variant?: 'default' | 'urgent' | 'success';
  };
}

const EnterpriseMetric: React.FC<EnterpriseMetricProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'primary',
  badge,
}) => {
  const getVariantColors = (variant: string) => {
    const colors = {
      primary: {
        icon: 'text-primary-600 dark:text-primary-400',
        iconBg: 'bg-primary-100 dark:bg-primary-800/30',
        title: 'text-primary-700 dark:text-primary-300',
        value: 'text-primary-800 dark:text-primary-200',
        subtitle: 'text-primary-600 dark:text-primary-400',
      },
      success: {
        icon: 'text-success-600 dark:text-success-400',
        iconBg: 'bg-success-100 dark:bg-success-800/30',
        title: 'text-success-700 dark:text-success-300',
        value: 'text-success-800 dark:text-success-200',
        subtitle: 'text-success-600 dark:text-success-400',
      },
      secondary: {
        icon: 'text-secondary-600 dark:text-secondary-400',
        iconBg: 'bg-secondary-100 dark:bg-secondary-800/30',
        title: 'text-secondary-700 dark:text-secondary-300',
        value: 'text-secondary-800 dark:text-secondary-200',
        subtitle: 'text-secondary-600 dark:text-secondary-400',
      },
      accent: {
        icon: 'text-accent-600 dark:text-accent-400',
        iconBg: 'bg-accent-100 dark:bg-accent-800/30',
        title: 'text-accent-700 dark:text-accent-300',
        value: 'text-accent-800 dark:text-accent-200',
        subtitle: 'text-accent-600 dark:text-accent-400',
      },
    };
    return colors[variant as keyof typeof colors];
  };

  const getTrendColors = (direction: string) => {
    const colors = {
      up: 'text-success-600 dark:text-success-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400',
    };
    return colors[direction as keyof typeof colors];
  };

  const getBadgeColors = (badgeVariant: string) => {
    const colors = {
      default: 'bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200',
      urgent: 'bg-accent-200 dark:bg-accent-800/50 text-accent-800 dark:text-accent-200',
      success: 'bg-success-200 dark:bg-success-800/50 text-success-800 dark:text-success-200',
    };
    return colors[badgeVariant as keyof typeof colors];
  };

  const colors = getVariantColors(variant);

  return (
    <EnterpriseCard
      variant={variant}
      interactive={true}
      gradient={true}
      className='h-full min-h-[140px]'
    >
      <div className='flex items-center justify-between mb-4'>
        <div
          className={cn(
            'p-3 rounded-xl transition-transform duration-300 group-hover:scale-110',
            colors.iconBg
          )}
        >
          <Icon className={cn('h-6 w-6', colors.icon)} />
        </div>

        {/* Trend or Badge */}
        <div className='flex items-center space-x-1'>
          {trend && (
            <div className={cn('flex items-center space-x-1', getTrendColors(trend.direction))}>
              {trend.icon && <trend.icon className='h-4 w-4' />}
              <span className='text-sm font-bold'>{trend.value}</span>
            </div>
          )}

          {badge && (
            <div
              className={cn('px-2 py-1 rounded-full', getBadgeColors(badge.variant || 'default'))}
            >
              <span className='text-xs font-bold'>{badge.text}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className={cn('text-sm font-medium mb-1', colors.title)}>{title}</p>
        <p className={cn('text-3xl font-black mb-2', colors.value)}>{value}</p>
        {subtitle && <p className={cn('text-xs', colors.subtitle)}>{subtitle}</p>}
      </div>
    </EnterpriseCard>
  );
};

export { EnterpriseMetric };
export default EnterpriseMetric;
