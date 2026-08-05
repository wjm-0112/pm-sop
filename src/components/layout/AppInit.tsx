'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function AppInit() {
  const load = useSettingsStore((s) => s.load);

  useEffect(() => {
    load();
    // 注册 Service Worker（PWA 离线）
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* 注册失败不影响主功能 */
      });
    }
  }, [load]);

  return null;
}
