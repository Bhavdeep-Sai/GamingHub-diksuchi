/**
 * Badge Component
 * Small label component for tags, ranks, etc.
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'error' | 'info';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-muted text-foreground',
      secondary: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      destructive: 'bg-red-50 text-red-700 border-red-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      error: 'bg-red-50 text-red-700 border-red-200',
      info: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
