'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { Card, Button, LoadingSpinner, ConfirmDialog, EmptyState, Badge, Tag } from '@/components/ui';
import { useUIStore } from '@/stores/useUIStore';
import { TASK_STATUS, STATUS_COLOR, PRIORITY_COLOR } from '@/lib/constants';
import { formatDate, fromNow } from '@/lib/utils';

function TaskDetailPage() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { tasks, loadAll, removeTask } = useProjectStore();
  const addToast = useUIStore((s) => s.addToast);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const task = tasks.find((t) => t.id === id);

  if (!task && tasks.length === 0) {
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

  const handleDelete = async () => {
    await removeTask(task.id);
    addToast('success', '任务已删除');
    router.push('/projects/tasks');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/projects/tasks" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> 返回
        </Link>
        <div className="flex gap-2">
          <Link href={`/projects/tasks/edit?id=${task.id}`}>
            <Button variant="outline" size="sm">
              <Edit size={16} /> 编辑
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
            <Trash2 size={16} /> 删除
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Badge className={STATUS_COLOR[task.status]}>{TASK_STATUS[task.status]}</Badge>
          <span className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${PRIORITY_COLOR[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {task.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      )}

      <Card>
        <p className="whitespace-pre-wrap text-sm text-slate-600">
          {task.description || '暂无描述'}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <div className="text-xs text-slate-400">负责人</div>
          <div className="mt-1 text-sm font-medium">{task.assignee || '-'}</div>
        </Card>
        <Card>
          <div className="text-xs text-slate-400">故事点</div>
          <div className="mt-1 text-sm font-medium">{task.storyPoints ?? '-'}</div>
        </Card>
        <Card>
          <div className="text-xs text-slate-400">预估工时</div>
          <div className="mt-1 text-sm font-medium">{task.estimatedHours ?? '-'}</div>
        </Card>
        <Card>
          <div className="text-xs text-slate-400">截止</div>
          <div className="mt-1 text-sm font-medium">{formatDate(task.dueDate)}</div>
        </Card>
      </div>

      <p className="text-xs text-slate-400">更新于 {fromNow(task.updatedAt)}</p>

      <ConfirmDialog
        open={confirm}
        title="删除任务"
        message="确定删除该任务吗？"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}


export default function TaskDetailPageWrap() {
  return (
    <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
      <TaskDetailPage />
    </Suspense>
  );
}
