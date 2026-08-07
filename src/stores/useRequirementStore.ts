import { create } from 'zustand';
import { requirementOps } from '@/db/operations/requirements';
import { generateId } from '@/lib/utils';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Requirement, RequirementFilter } from '@/lib/types';

interface RequirementState {
  items: Requirement[];
  isLoading: boolean;
  viewMode: 'table' | 'grid';
  filters: RequirementFilter;
  searchQuery: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  load: () => Promise<void>;
  setItems: (items: Requirement[]) => void;
  create: (data: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'changeLog'>) => Promise<string>;
  update: (id: string, data: Partial<Requirement>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setFilters: (f: Partial<RequirementFilter>) => void;
  setSearch: (q: string) => void;
  setViewMode: (m: 'table' | 'grid') => void;
  setSorting: (field: string, direction: 'asc' | 'desc') => void;
}

const emptyFilter: RequirementFilter = {
  status: 'all',
  priority: 'all',
  type: 'all',
  source: 'all',
  assignee: '',
  tag: '',
};

export const useRequirementStore = create<RequirementState>((set, get) => ({
  items: [],
  isLoading: false,
  viewMode: 'table',
  filters: emptyFilter,
  searchQuery: '',
  sortField: 'updatedAt',
  sortDirection: 'desc',
  load: async () => {
    set({ isLoading: true });
    const all = await requirementOps.getAll();
    const pid = useProjectStore.getState().activeProjectId;
    const items = pid ? all.filter((r) => !r.projectId || r.projectId === pid) : all;
    set({ items, isLoading: false });
  },
  setItems: (items) => set({ items }),
  create: async (data) => {
    const now = new Date();
    const pid = useProjectStore.getState().activeProjectId ?? 'default-project';
    const item: Requirement = {
      ...data,
      id: generateId(),
      projectId: pid,
      createdAt: now,
      updatedAt: now,
      changeLog: [],
    };
    await requirementOps.add(item);
    set({ items: [item, ...get().items] });
    return item.id;
  },
  update: async (id, data) => {
    const updatedAt = new Date();
    await requirementOps.update(id, { ...data, updatedAt });
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, ...data, updatedAt } : i,
      ),
    });
  },
  remove: async (id) => {
    await requirementOps.remove(id);
    set({ items: get().items.filter((i) => i.id !== id) });
  },
  setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
  setSearch: (q) => set({ searchQuery: q }),
  setViewMode: (m) => set({ viewMode: m }),
  setSorting: (field, direction) => set({ sortField: field, sortDirection: direction }),
}));
