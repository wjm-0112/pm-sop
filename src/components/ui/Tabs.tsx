'use client';

import { cn } from '@/lib/cn';

export interface TabItem {
  key: string;
  label: string;
}

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-border">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            active === item.key
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
