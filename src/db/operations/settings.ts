import { db } from '@/db/index';
import type { AppSettings } from '@/lib/types';

export const SETTINGS_ID = 'app-settings';

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get(SETTINGS_ID);
  if (existing) return existing;
  const defaults: AppSettings = {
    id: SETTINGS_ID,
    theme: 'system',
    language: 'zh-CN',
    sidebarCollapsed: false,
    defaultAssignee: '',
    autoBackupEnabled: false,
    autoBackupInterval: 24,
    lastBackupAt: null,
    lastBackupSize: null,
    defaultView: { requirements: 'table', projects: 'kanban' },
    shortcuts: {},
  };
  await db.settings.put(defaults);
  return defaults;
}

export async function updateSettings(changes: Partial<AppSettings>): Promise<void> {
  await db.settings.update(SETTINGS_ID, changes);
}
