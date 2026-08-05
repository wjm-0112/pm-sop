'use client';

import { useRouter } from 'next/navigation';
import { TaskForm, type TaskFormValues } from '@/components/projects/TaskForm';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { toDate } from '@/lib/utils';
import type { Task } from '@/lib/types';

export default function NewTaskPage() {
  const router = useRouter();
  const create = useProjectStore((s) => s.createTask);
  const addToast = useUIStore((s) => s.addToast);

  const submit = async (v: TaskFormValues) => {
    const maxOrder = 0;
    const id = await create({
      title: v.title,
      description: v.description,
      status: v.status,
      priority: v.priority,
      assignee: v.assignee,
      requirementId: v.requirementId,
      versionId: v.versionId,
      milestoneId: v.milestoneId,
      storyPoints: v.storyPoints ? Number(v.storyPoints) : null,
      estimatedHours: v.estimatedHours ? Number(v.estimatedHours) : null,
      actualHours: null,
      tags: v.tags,
      attachments: [],
      dependencies: [],
      sortOrder: maxOrder,
      startedAt: null,
      completedAt: null,
      dueDate: toDate(v.dueDate),
    } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
    addToast('success', '任务创建成功');
    router.push(`/projects/tasks/${id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">新建任务</h1>
      <TaskForm onSubmit={submit} onCancel={() => router.push('/projects/tasks')} />
    </div>
  );
}
