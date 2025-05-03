// src/components/ui/label.tsx
// Implementation for testing only
import React from 'react';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, children, ...props }, ref) => {
  return (
    <label ref={ref} className={className} {...props}>
      {children}
    </label>
  );
});
