'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TaskForm, type TaskFormValues } from '@/components/projects/TaskForm';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { EmptyState, Button, LoadingSpinner } from '@/components/ui';
import { toDate } from '@/lib/utils';
import type { Task } from '@/lib/types';

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tasks, loadAll, updateTask } = useProjectStore();
  const addToast = useUIStore((s) => s.addToast);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAll().then(() => setLoaded(true));
  }, [loadAll]);

  const task = tasks.find((t) => t.id === id);

  if (!loaded) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }
  if (!task) {
    return (
      <EmptyState
        title="任务不存在"
        action={
          <Link href="/projects/tasks">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const initial: Partial<TaskFormValues> = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    requirementId: task.requirementId,
    versionId: task.versionId,
    milestoneId: task.milestoneId,
    storyPoints: task.storyPoints?.toString() ?? '',
    estimatedHours: task.estimatedHours?.toString() ?? '',
    dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : '',
    tags: task.tags,
  };

  const submit = async (v: TaskFormValues) => {
    await updateTask(task.id, {
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
      dueDate: toDate(v.dueDate),
      tags: v.tags,
    } as Partial<Task>);
    addToast('success', '任务已更新');
    router.push(`/projects/tasks/${task.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">编辑任务</h1>
      <TaskForm
        initial={initial}
        onSubmit={submit}
        onCancel={() => router.push(`/projects/tasks/${task.id}`)}
      />
    </div>
  );
}
