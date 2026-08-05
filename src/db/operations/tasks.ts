import { db } from '@/db/index';
import { createCrud } from './crud';
import type { Task, TaskStatus } from '@/lib/types';

export const taskOps = createCrud<Task>(db.tasks);

export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  return db.tasks.where('status').equals(status).toArray();
}

export async function getTasksByMilestone(milestoneId: string): Promise<Task[]> {
  return db.tasks.where('milestoneId').equals(milestoneId).toArray();
}

export async function getTasksByRequirement(requirementId: string): Promise<Task[]> {
  return db.tasks.where('requirementId').equals(requirementId).toArray();
}

// 批量更新排序与状态（看板拖拽）
export async function reorderTasks(tasks: { id: string; status: TaskStatus; sortOrder: number }[]) {
  await db.transaction('rw', db.tasks, async () => {
    for (const t of tasks) {
      await db.tasks.update(t.id, { status: t.status, sortOrder: t.sortOrder });
    }
  });
}
