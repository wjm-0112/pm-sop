'use client';

import { WifiOff } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

export function OfflineIndicator() {
  const isOffline = useUIStore((s) => s.isOffline);
  if (!isOffline) return null;
  return (
    <div className="flex items-center justify-center gap-2 bg-warning/10 py-1.5 text-sm text-warning">
      <WifiOff size={16} />
      当前处于离线状态，数据已保存在本地，联网后可继续同步。
    </div>
  );
}
