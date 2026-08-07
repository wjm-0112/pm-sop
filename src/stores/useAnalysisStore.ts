import { create } from 'zustand';
import { competitorOps } from '@/db/operations/competitors';
import { marketResearchOps } from '@/db/operations/marketResearch';
import { personaOps } from '@/db/operations/personas';
import { generateId } from '@/lib/utils';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Competitor, MarketResearch, Persona } from '@/lib/types';

interface AnalysisState {
  competitors: Competitor[];
  marketResearch: MarketResearch[];
  personas: Persona[];
  isLoading: boolean;
  loadAll: () => Promise<void>;
  createCompetitor: (data: Omit<Competitor, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>) => Promise<string>;
  updateCompetitor: (id: string, data: Partial<Competitor>) => Promise<void>;
  removeCompetitor: (id: string) => Promise<void>;
  createMarketResearch: (data: Omit<MarketResearch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateMarketResearch: (id: string, data: Partial<MarketResearch>) => Promise<void>;
  removeMarketResearch: (id: string) => Promise<void>;
  createPersona: (data: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePersona: (id: string, data: Partial<Persona>) => Promise<void>;
  removePersona: (id: string) => Promise<void>;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  competitors: [],
  marketResearch: [],
  personas: [],
  isLoading: false,
  loadAll: async () => {
    set({ isLoading: true });
    const pid = useProjectStore.getState().activeProjectId;
    const [allComp, allMr, allPer] = await Promise.all([
      competitorOps.getAll(),
      marketResearchOps.getAll(),
      personaOps.getAll(),
    ]);
    const filterBy = <T extends { projectId?: string }>(arr: T[]): T[] =>
      pid ? arr.filter((i) => !i.projectId || i.projectId === pid) : arr;
    set({
      competitors: filterBy(allComp),
      marketResearch: filterBy(allMr),
      personas: filterBy(allPer),
      isLoading: false,
    });
  },
  createCompetitor: async (data) => {
    const now = new Date();
    const pid = useProjectStore.getState().activeProjectId ?? 'default-project';
    const item: Competitor = {
      ...data,
      id: generateId(),
      projectId: pid,
      createdAt: now,
      updatedAt: now,
      lastUpdated: now,
    };
    await competitorOps.add(item);
    set({ competitors: [...get().competitors, item] });
    return item.id;
  },
  updateCompetitor: async (id, data) => {
    const updatedAt = new Date();
    await competitorOps.update(id, { ...data, updatedAt });
    set({ competitors: get().competitors.map((c) => (c.id === id ? { ...c, ...data, updatedAt } : c)) });
  },
  removeCompetitor: async (id) => {
    await competitorOps.remove(id);
    set({ competitors: get().competitors.filter((c) => c.id !== id) });
  },
  createMarketResearch: async (data) => {
    const now = new Date();
    const pid = useProjectStore.getState().activeProjectId ?? 'default-project';
    const item: MarketResearch = { ...data, id: generateId(), projectId: pid, createdAt: now, updatedAt: now };
    await marketResearchOps.add(item);
    set({ marketResearch: [...get().marketResearch, item] });
    return item.id;
  },
  updateMarketResearch: async (id, data) => {
    await marketResearchOps.update(id, { ...data, updatedAt: new Date() });
    set({
      marketResearch: get().marketResearch.map((m) => (m.id === id ? { ...m, ...data } : m)),
    });
  },
  removeMarketResearch: async (id) => {
    await marketResearchOps.remove(id);
    set({ marketResearch: get().marketResearch.filter((m) => m.id !== id) });
  },
  createPersona: async (data) => {
    const now = new Date();
    const pid = useProjectStore.getState().activeProjectId ?? 'default-project';
    const item: Persona = { ...data, id: generateId(), projectId: pid, createdAt: now, updatedAt: now };
    await personaOps.add(item);
    set({ personas: [...get().personas, item] });
    return item.id;
  },
  updatePersona: async (id, data) => {
    await personaOps.update(id, { ...data, updatedAt: new Date() });
    set({ personas: get().personas.map((p) => (p.id === id ? { ...p, ...data } : p)) });
  },
  removePersona: async (id) => {
    await personaOps.remove(id);
    set({ personas: get().personas.filter((p) => p.id !== id) });
  },
}));
