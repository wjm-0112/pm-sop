'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus, ListChecks, Flag, AlertTriangle } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { KanbanBoard } from '@/components/projects/KanbanBoard';
import { Button, LoadingSpinner } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { TaskStatus } from '@/lib/types';

export default function ProjectsPage() {
  const { tasks, isLoading, loadAll, applyTaskOrder } = useProjectStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">项目推进</h1>
          <p className="text-sm text-slate-500">
            共 {tasks.length} 个任务 · 完成度 {progress}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/projects/tasks" className="text-sm text-slate-500 hover:text-slate-700">
            <span className="flex items-center gap-1">
              <ListChecks size={16} /> 列表视图
            </span>
          </Link>
          <Link href="/projects/milestones" className="text-sm text-slate-500 hover:text-slate-700">
            <span className="flex items-center gap-1">
              <Flag size={16} /> 里程碑
            </span>
          </Link>
          <Link href="/projects/risks" className="text-sm text-slate-500 hover:text-slate-700">
            <span className="flex items-center gap-1">
              <AlertTriangle size={16} /> 风险
            </span>
          </Link>
          <Link href="/projects/tasks/new">
            <Button>
              <Plus size={16} /> 新建任务
            </Button>
          </Link>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-success transition-all" style={{ width: `${progress}%` }} />
      </div>

      <KanbanBoard tasks={tasks} onReorder={applyTaskOrder} />
    </div>
  );
}
