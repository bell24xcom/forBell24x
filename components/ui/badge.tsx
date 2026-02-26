import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-blue-500 text-white': variant === 'default',
          'bg-slate-700 text-slate-200': variant === 'secondary',
          'border border-slate-600 text-slate-300': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
