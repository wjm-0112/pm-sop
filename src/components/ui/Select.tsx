import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'h-10 w-full rounded border border-border bg-surface px-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  },
);
Select.displayName = 'Select';
