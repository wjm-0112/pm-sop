/**
 * 云端同步 Zustand Store
 *
 * - 密码仅在 session 内存中（never persisted），页面刷新后需重新输入
 * - syncConfig（token/repo/path）存在 IndexedDB AppSettings 中，由 useSettingsStore 管理
 * - remoteSha 用于 PUT 更新时携带 sha，避免冲突
 */

import { create } from 'zustand';
import {
  syncUpload,
  syncPull,
  buildConfig,
  SyncError,
  type SyncConfig,
} from '@/services/sync.service';
import { useSettingsStore } from './useSettingsStore';
import { useUIStore } from './useUIStore';

export type SyncStatus = 'idle' | 'pushing' | 'pulling' | 'error';

interface SyncState {
  syncStatus: SyncStatus;
  lastSyncAt: string | null;
  remoteSha: string | null;
  sessionPassword: string | null;
  errorMessage: string | null;

  // actions
  setPassword: (pw: string) => void;
  clearPassword: () => void;
  upload: (password?: string) => Promise<boolean>;
  pull: (password?: string) => Promise<boolean>;
  autoPullIfConfigured: (onNeedPassword: () => Promise<string | null>) => Promise<boolean>;
  resetStatus: () => void;
}

function getConfig(): SyncConfig | null {
  const settings = useSettingsStore.getState().settings;
  if (!settings?.syncEnabled || !settings?.syncToken) return null;
  return buildConfig(settings);
}

export const useSyncStore = create<SyncState>((set, get) => ({
  syncStatus: 'idle',
  lastSyncAt: null,
  remoteSha: null,
  sessionPassword: null,
  errorMessage: null,

  setPassword: (pw) => set({ sessionPassword: pw }),

  clearPassword: () => set({ sessionPassword: null }),

  upload: async (password) => {
    const pw = password ?? get().sessionPassword;
    if (!pw) {
      set({ errorMessage: '请先输入加密密码' });
      return false;
    }

    const config = getConfig();
    if (!config) {
      set({ errorMessage: '请先配置 GitHub 令牌并启用同步' });
      return false;
    }

    set({ syncStatus: 'pushing', errorMessage: null });
    try {
      const sha = await syncUpload(config, pw, get().remoteSha ?? undefined);
      const now = new Date().toISOString();
      set({ syncStatus: 'idle', remoteSha: sha, lastSyncAt: now });
      // 回写 lastSyncAt 到 settings
      useSettingsStore.getState().update({ lastSyncAt: now });
      useUIStore.getState().addToast('success', '已上传到云端');
      return true;
    } catch (e) {
      const msg = e instanceof SyncError ? e.message : '上传失败';
      set({ syncStatus: 'error', errorMessage: msg });
      useUIStore.getState().addToast('error', msg);
      return false;
    }
  },

  pull: async (password) => {
    const pw = password ?? get().sessionPassword;
    if (!pw) {
      set({ errorMessage: '请先输入加密密码' });
      return false;
    }

    const config = getConfig();
    if (!config) {
      set({ errorMessage: '请先配置 GitHub 令牌并启用同步' });
      return false;
    }

    set({ syncStatus: 'pulling', errorMessage: null });
    try {
      const { sha, stats } = await syncPull(config, pw);
      const now = new Date().toISOString();
      set({ syncStatus: 'idle', remoteSha: sha, lastSyncAt: now });
      useSettingsStore.getState().update({ lastSyncAt: now });
      const summary = stats
        ? Object.entries(stats)
            .filter(([, n]) => n > 0)
            .map(([k, n]) => `${k}:${n}`)
            .join(', ')
        : '';
      useUIStore.getState().addToast(
        'success',
        `已从云端拉取${summary ? `（${summary}）` : ''}`,
      );
      return true;
    } catch (e) {
      const msg = e instanceof SyncError ? e.message : '拉取失败';
      set({ syncStatus: 'error', errorMessage: msg });
      useUIStore.getState().addToast('error', msg);
      return false;
    }
  },

  /** 应用打开时自动拉取。若需密码会调用 onNeedPassword 回调获取 */
  autoPullIfConfigured: async (onNeedPassword) => {
    const config = getConfig();
    if (!config) return false; // 同步未配置，静默跳过

    const pw = get().sessionPassword ?? (await onNeedPassword());
    if (!pw) return false;

    get().setPassword(pw); // 缓存供后续使用

    set({ syncStatus: 'pulling', errorMessage: null });
    try {
      const { sha, stats } = await syncPull(config, pw);
      const now = new Date().toISOString();
      set({ syncStatus: 'idle', remoteSha: sha, lastSyncAt: now });
      useSettingsStore.getState().update({ lastSyncAt: now });
      if (stats) {
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        if (total > 0) {
          useUIStore.getState().addToast('info', `已从云端同步 ${total} 条数据`);
        }
      }
      return true;
    } catch (e) {
      const msg = e instanceof SyncError
        ? (e.kind === 'not_found' ? null : e.message)
        : '自动同步失败';
      set({ syncStatus: 'idle', errorMessage: msg });
      if (msg) useUIStore.getState().addToast('warning', msg);
      return false;
    }
  },

  resetStatus: () => set({ syncStatus: 'idle', errorMessage: null }),
}));
