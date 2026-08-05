import { create } from 'zustand';
import { taskOps, reorderTasks } from '@/db/operations/tasks';
import { milestoneOps } from '@/db/operations/milestones';
import { riskOps } from '@/db/operations/risks';
import { generateId } from '@/lib/utils';
import type { Task, Milestone, Risk, TaskStatus } from '@/lib/types';

interface ProjectState {
  tasks: Task[];
  milestones: Milestone[];
  risks: Risk[];
  isLoading: boolean;
  loadAll: () => Promise<void>;
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  applyTaskOrder: (
    updates: { id: string; status: TaskStatus; sortOrder: number }[],
  ) => Promise<void>;
  createMilestone: (data: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateMilestone: (id: string, data: Partial<Milestone>) => Promise<void>;
  removeMilestone: (id: string) => Promise<void>;
  createRisk: (data: Omit<Risk, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateRisk: (id: string, data: Partial<Risk>) => Promise<void>;
  removeRisk: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  tasks: [],
  milestones: [],
  risks: [],
  isLoading: false,
  loadAll: async () => {
    set({ isLoading: true });
    const [tasks, milestones, risks] = await Promise.all([
      taskOps.getAll(),
      milestoneOps.getAll(),
      riskOps.getAll(),
    ]);
    set({ tasks, milestones, risks, isLoading: false });
  },
  createTask: async (data) => {
    const now = new Date();
    const item: Task = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await taskOps.add(item);
    set({ tasks: [...get().tasks, item] });
    return item.id;
  },
  updateTask: async (id, data) => {
    await taskOps.update(id, { ...data, updatedAt: new Date() });
    set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) });
  },
  removeTask: async (id) => {
    await taskOps.remove(id);
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },
  applyTaskOrder: async (updates) => {
    await reorderTasks(updates);
    const map = new Map(updates.map((u) => [u.id, u]));
    set({
      tasks: get().tasks.map((t) => {
        const u = map.get(t.id);
        return u ? { ...t, status: u.status, sortOrder: u.sortOrder } : t;
      }),
    });
  },
  createMilestone: async (data) => {
    const now = new Date();
    const item: Milestone = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    await milestoneOps.add(item);
    set({ milestones: [...get().milestones, item] });
    return item.id;
  },
  updateMilestone: async (id, data) => {
    await milestoneOps.update(id, { ...data, updatedAt: new Date() });
    set({ milestones: get().milestones.map((m) => (m.id === id ? { ...m, ...data } : m)) });
  },
  removeMilestone: async (id) => {
    await milestoneOps.remove(id);
    set({ milestones: get().milestones.filter((m) => m.id !== id) });
  },
  createRisk: async (data) => {
    const now = new Date();
    const item: Risk = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    await riskOps.add(item);
    set({ risks: [...get().risks, item] });
    return item.id;
  },
  updateRisk: async (id, data) => {
    await riskOps.update(id, { ...data, updatedAt: new Date() });
    set({ risks: get().risks.map((r) => (r.id === id ? { ...r, ...data } : r)) });
  },
  removeRisk: async (id) => {
    await riskOps.remove(id);
    set({ risks: get().risks.filter((r) => r.id !== id) });
  },
}));
