import { create } from 'zustand';
import { versionOps } from '@/db/operations/versions';
import { prdOps } from '@/db/operations/prdDocuments';
import { generateId } from '@/lib/utils';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Version, PRDDocument } from '@/lib/types';

interface PlanningState {
  versions: Version[];
  prds: PRDDocument[];
  isLoading: boolean;
  loadVersions: () => Promise<void>;
  loadPrds: () => Promise<void>;
  createVersion: (data: Omit<Version, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateVersion: (id: string, data: Partial<Version>) => Promise<void>;
  removeVersion: (id: string) => Promise<void>;
  createPrd: (data: Omit<PRDDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePrd: (id: string, data: Partial<PRDDocument>) => Promise<void>;
  removePrd: (id: string) => Promise<void>;
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  versions: [],
  prds: [],
  isLoading: false,
  loadVersions: async () => {
    set({ isLoading: true });
    const all = await versionOps.getAll();
    const pid = useProjectStore.getState().activeProjectId;
    const versions = pid ? all.filter((v) => !v.projectId || v.projectId === pid) : all;
    set({ versions, isLoading: false });
  },
  loadPrds: async () => {
    set({ isLoading: true });
    const all = await prdOps.getAll();
    const pid = useProjectStore.getState().activeProjectId;
    const prds = pid ? all.filter((p) => !p.projectId || p.projectId === pid) : all;
    set({ prds, isLoading: false });
  },
  createVersion: async (data) => {
    const now = new Date();
    const pid = useProjectStore.getState().activeProjectId ?? 'default-project';
    const item: Version = { ...data, id: generateId(), projectId: pid, createdAt: now, updatedAt: now };
    await versionOps.add(item);
    set({ versions: [...get().versions, item] });
    return item.id;
  },
  updateVersion: async (id, data) => {
    await versionOps.update(id, { ...data, updatedAt: new Date() });
    set({ versions: get().versions.map((v) => (v.id === id ? { ...v, ...data } : v)) });
  },
  removeVersion: async (id) => {
    await versionOps.remove(id);
    set({ versions: get().versions.filter((v) => v.id !== id) });
  },
  createPrd: async (data) => {
    const now = new Date();
    const pid = useProjectStore.getState().activeProjectId ?? 'default-project';
    const item: PRDDocument = { ...data, id: generateId(), projectId: pid, createdAt: now, updatedAt: now };
    await prdOps.add(item);
    set({ prds: [...get().prds, item] });
    return item.id;
  },
  updatePrd: async (id, data) => {
    await prdOps.update(id, { ...data, updatedAt: new Date() });
    set({ prds: get().prds.map((p) => (p.id === id ? { ...p, ...data } : p)) });
  },
  removePrd: async (id) => {
    await prdOps.remove(id);
    set({ prds: get().prds.filter((p) => p.id !== id) });
  },
}));
