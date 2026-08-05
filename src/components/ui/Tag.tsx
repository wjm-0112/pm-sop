'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Tag({
  label,
  onRemove,
  className,
}: {
  label: string;
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700',
        className,
      )}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-primary-600" type="button">
          <X size={12} />
        </button>
      )}
    </span>
  );
}
