// src/components/ui/select.tsx
// Implementation for testing only
import React from 'react';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<'select'> & { onValueChange?: (value: string) => void; value?: string }
>(({ children, className, onValueChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange?.(e.target.value);
  };

  return (
    <select ref={ref} className={className} onChange={handleChange} {...props}>
      {children}
    </select>
  );
});

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

export const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ children, className, ...props }, ref) => {
  return (
    <option ref={ref} className={className} {...props}>
      {children}
    </option>
  );
});

export const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

export const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ children, className, placeholder, ...props }, ref) => {
  return (
    <span ref={ref} className={className} {...props}>
      {children || placeholder}
    </span>
  );
});
