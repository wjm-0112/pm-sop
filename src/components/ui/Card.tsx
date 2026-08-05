import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-4 shadow-sm',
        onClick && 'cursor-pointer transition-shadow hover:shadow-md',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
