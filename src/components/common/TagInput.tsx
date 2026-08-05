'use client';

import { useState, type KeyboardEvent } from 'react';
import { Tag } from '@/components/ui';
import { Input } from '@/components/ui/Input';

export function TagInput({
  value,
  onChange,
  placeholder = '输入后回车添加',
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const t = input.trim();
    if (t && !value.includes(t)) {
      onChange([...value, t]);
    }
    setInput('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-border bg-surface p-2">
      {value.map((t) => (
        <Tag key={t} label={t} onRemove={() => onChange(value.filter((x) => x !== t))} />
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
        className="h-8 flex-1 border-0 p-0 focus:ring-0"
      />
    </div>
  );
}
