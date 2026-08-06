'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSyncStore } from '@/stores/useSyncStore';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AppInit() {
  const load = useSettingsStore((s) => s.load);
  const settings = useSettingsStore((s) => s.settings);
  const { autoPullIfConfigured } = useSyncStore();
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const [syncPassword, setSyncPassword] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    load().then(() => setSettingsLoaded(true));
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* do nothing */
      });
    }
  }, [load]);

  // 设置加载完毕后，若云端同步已启用，弹出密码输入框
  useEffect(() => {
    if (!settingsLoaded || !settings) return;
    if (settings.syncEnabled && settings.syncToken) {
      setShowSyncPrompt(true);
    }
  }, [settingsLoaded, settings]);

  const handleSyncConfirm = useCallback(async () => {
    setShowSyncPrompt(false);
    const pw = syncPassword.trim();
    if (!pw) return;
    await autoPullIfConfigured(() => Promise.resolve(pw));
  }, [syncPassword, autoPullIfConfigured]);

  const handleSyncSkip = useCallback(() => {
    setShowSyncPrompt(false);
  }, []);

  return (
    <>
      {showSyncPrompt && (
        <Modal open onClose={handleSyncSkip} title="云端同步">
          <p className="mb-3 text-sm text-slate-600">
            已配置云端同步，请输入加密密码以加载云端数据：
          </p>
          <Input
            type="password"
            value={syncPassword}
            onChange={(e) => setSyncPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSyncConfirm()}
            placeholder="输入加密密码"
            autoFocus
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleSyncSkip}>跳过</Button>
            <Button onClick={handleSyncConfirm} disabled={!syncPassword.trim()}>确认同步</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
