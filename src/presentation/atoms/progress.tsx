'use client';

import * as React from 'react';

import { cn } from '@application/utils/cn';

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
    max?: number;
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  }
>(({ className, value, max = 100, color = 'default', ...props }, ref) => {
  const percentage = value != null ? Math.min(Math.max(0, value), max) : null;

  const colorClasses = {
    default: 'bg-primary',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-muted',
        className
      )}
      {...props}
    >
      {percentage != null && (
        <div
          className={cn('h-full transition-all', colorClasses[color])}
          style={{ width: `${(percentage / max) * 100}%` }}
        />
      )}
    </div>
  );
});
Progress.displayName = 'Progress';

export { Progress };
