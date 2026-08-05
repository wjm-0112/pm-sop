import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
        className ?? 'bg-slate-100 text-slate-600',
      )}
    >
      {children}
    </span>
  );
}
