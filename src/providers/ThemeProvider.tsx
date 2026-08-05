'use client';

import { useEffect, type ReactNode } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    const apply = (theme: string) => {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // system
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        root.classList.toggle('dark', mq.matches);
      }
    };
    apply(settings?.theme ?? 'system');
  }, [settings?.theme]);

  return <>{children}</>;
}
