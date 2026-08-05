import { create } from 'zustand';
import { getSettings, updateSettings, SETTINGS_ID } from '@/db/operations/settings';
import type { AppSettings } from '@/lib/types';

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  load: () => Promise<void>;
  update: (changes: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    const settings = await getSettings();
    set({ settings, isLoading: false });
  },
  update: async (changes) => {
    await updateSettings(changes);
    const current = get().settings;
    if (current) {
      set({ settings: { ...current, ...changes } });
    } else {
      const updated = await getSettings();
      set({ settings: updated });
    }
  },
}));

export { SETTINGS_ID };
