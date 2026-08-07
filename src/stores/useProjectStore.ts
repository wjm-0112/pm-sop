import { create } from 'zustand';
import { db } from '@/db/index';
import { taskOps, reorderTasks } from '@/db/operations/tasks';
import { milestoneOps } from '@/db/operations/milestones';
import { riskOps } from '@/db/operations/risks';
import { SETTINGS_ID } from '@/db/operations/settings';
import { generateId } from '@/lib/utils';
import type { Project, Task, Milestone, Risk, TaskStatus } from '@/lib/types';

interface ProjectState {
  // 项目管理
  projects: Project[];
  activeProjectId: string | null;
  // 任务/里程碑/风险（按当前项目过滤）
  tasks: Task[];
  milestones: Milestone[];
  risks: Risk[];
  isLoading: boolean;

  // project CRUD
  loadProjects: () => Promise<void>;
  createProject: (data: { name: string; description: string; color: string }) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  switchProject: (id: string) => void;

  // task CRUD
  loadAll: () => Promise<void>;
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => Promise<string>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  applyTaskOrder: (
    updates: { id: string; status: TaskStatus; sortOrder: number }[],
  ) => Promise<void>;
  createMilestone: (data: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => Promise<string>;
  updateMilestone: (id: string, data: Partial<Milestone>) => Promise<void>;
  removeMilestone: (id: string) => Promise<void>;
  createRisk: (data: Omit<Risk, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => Promise<string>;
  updateRisk: (id: string, data: Partial<Risk>) => Promise<void>;
  removeRisk: (id: string) => Promise<void>;
}

function filter<T extends { projectId?: string }>(items: T[], pid: string | null): T[] {
  if (!pid) return items;
  return items.filter((i) => !i.projectId || i.projectId === pid);
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  tasks: [],
  milestones: [],
  risks: [],
  isLoading: false,

  // ---- 项目管理 ----
  loadProjects: async () => {
    const projects = await db.projects.toArray();
    let pid = get().activeProjectId || projects[0]?.id || null;
    // 读取持久化的默认项目（跨刷新保留）
    try {
      const settings = await db.settings.get(SETTINGS_ID);
      if (settings?.activeProjectId && projects.some((p) => p.id === settings.activeProjectId)) {
        pid = settings.activeProjectId;
      }
    } catch {
      /* ignore */
    }
    set({ projects, activeProjectId: pid });
  },
  createProject: async (data) => {
    const now = new Date();
    const project: Project = {
      id: generateId(),
      name: data.name,
      description: data.description,
      status: 'active',
      color: data.color,
      createdAt: now,
      updatedAt: now,
    };
    await db.projects.put(project);
    const projects = [...get().projects, project];
    set({ projects, activeProjectId: project.id });
    return project.id;
  },
  deleteProject: async (id) => {
    await db.projects.delete(id);
    const projects = get().projects.filter((p) => p.id !== id);
    const pid = get().activeProjectId === id ? (projects[0]?.id || null) : get().activeProjectId;
    set({ projects, activeProjectId: pid });
  },
  switchProject: (id) => {
    set({ activeProjectId: id });
    // 持久化当前激活项目
    db.settings.update(SETTINGS_ID, { activeProjectId: id }).catch(() => {});
  },

  // ---- 任务/里程碑/风险 ----
  loadAll: async () => {
    set({ isLoading: true });
    const [tasks, milestones, risks] = await Promise.all([
      taskOps.getAll(),
      milestoneOps.getAll(),
      riskOps.getAll(),
    ]);
    const pid = get().activeProjectId;
    set({
      tasks: filter(tasks, pid),
      milestones: filter(milestones, pid),
      risks: filter(risks, pid),
      isLoading: false,
    });
  },
  createTask: async (data) => {
    const now = new Date();
    const pid = get().activeProjectId || 'default-project';
    const item: Task = { ...data, id: generateId(), projectId: pid, createdAt: now, updatedAt: now };
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
    const pid = get().activeProjectId || 'default-project';
    const item: Milestone = { ...data, id: generateId(), projectId: pid, createdAt: now, updatedAt: now };
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
    const pid = get().activeProjectId || 'default-project';
    const item: Risk = { ...data, id: generateId(), projectId: pid, createdAt: now, updatedAt: now };
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
