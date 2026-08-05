'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

export function SearchInput({
  value,
  onChange,
  placeholder = '搜索…',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
