import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  toasts: Toast[];
  isOffline: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setMobileNavOpen: (v: boolean) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  setOffline: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  toasts: [],
  isOffline: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setOffline: (v) => set({ isOffline: v }),
}));
