'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSyncStore } from '@/stores/useSyncStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useRequirementStore } from '@/stores/useRequirementStore';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { seedPmPortfolio } from '@/data/seed-pm-portfolio';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AppInit() {
  const load = useSettingsStore((s) => s.load);
  const updateSettings = useSettingsStore((s) => s.update);
  const settings = useSettingsStore((s) => s.settings);
  const { autoPullIfConfigured } = useSyncStore();
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const [syncPassword, setSyncPassword] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const hasPromptedRef = useRef(false); // 防止组件反复挂载时重复弹窗

  // 当激活项目变化时，重新加载各模块（按项目过滤）
  const reloadModules = useCallback(() => {
    useRequirementStore.getState().load();
    usePlanningStore.getState().loadVersions();
    usePlanningStore.getState().loadPrds();
    useAnalysisStore.getState().loadAll();
    useProjectStore.getState().loadAll();
  }, []);

  useEffect(() => {
    load().then(() => setSettingsLoaded(true));
    loadProjects().then(() => {
      // 首次启动：写入 pm-portfolio 示例项目数据（幂等）
      return seedPmPortfolio().then(() => {
        loadProjects();
        reloadModules();
      });
    });
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* do nothing */
      });
    }
  }, [load]);

  // 切换项目后重新加载模块数据
  useEffect(() => {
    reloadModules();
  }, [activeProjectId, reloadModules]);

  // 设置加载完毕后，若云端同步已启用且未拒绝过，弹出密码输入框
  useEffect(() => {
    if (!settingsLoaded || !settings) return;
    if (hasPromptedRef.current) return;
    if (settings.syncEnabled && settings.syncToken && !settings.syncPromptDismissed) {
      hasPromptedRef.current = true;
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
    updateSettings({ syncPromptDismissed: true });
  }, [updateSettings]);

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
