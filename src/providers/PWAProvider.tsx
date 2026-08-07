'use client';

import { useEffect, type ReactNode } from 'react';
import { useUIStore } from '@/stores/useUIStore';

export function PWAProvider({ children }: { children: ReactNode }) {
  const setOffline = useUIStore((s) => s.setOffline);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    setOffline(!navigator.onLine);

    // 注册 Service Worker（兼容 GitHub Pages 的 /pm-sop/ 子路径部署）
    const base =
      typeof window !== 'undefined' && window.location.pathname.startsWith('/pm-sop')
        ? '/pm-sop'
        : '';
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${base}/sw.js`, { scope: `${base}/` })
        .catch(() => undefined);
    }

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [setOffline]);

  return <>{children}</>;
}
