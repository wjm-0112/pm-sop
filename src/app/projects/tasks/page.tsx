'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { Card, Button, EmptyState, LoadingSpinner } from '@/components/ui';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/ui';
import { TASK_STATUS, STATUS_COLOR, PRIORITY_COLOR } from '@/lib/constants';
import { formatDate, truncate } from '@/lib/utils';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const { tasks, isLoading, loadAll } = useProjectStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = tasks.filter((t) =>
    search ? t.title.toLowerCase().includes(search.toLowerCase()) : true,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">任务列表</h1>
          <p className="text-sm text-slate-500">共 {filtered.length} 个任务</p>
        </div>
        <Link href="/projects/tasks/new">
          <Button>
            <Plus size={16} /> 新建任务
          </Button>
        </Link>
      </div>

      <SearchInput value={search} onChange={setSearch} className="w-full sm:w-64" />

      {filtered.length === 0 ? (
        <EmptyState
          title="暂无任务"
          action={
            <Link href="/projects/tasks/new">
              <Button>
                <Plus size={16} /> 新建任务
              </Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-slate-400">
                <th className="px-4 py-3">标题</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">优先级</th>
                <th className="px-4 py-3">负责人</th>
                <th className="px-4 py-3">故事点</th>
                <th className="px-4 py-3">截止</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t: Task) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/projects/tasks/${t.id}`} className="font-medium text-slate-800 hover:text-primary">
                      {truncate(t.title, 50)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLOR[t.status]}>{TASK_STATUS[t.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${PRIORITY_COLOR[t.priority]}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.assignee || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.storyPoints ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(t.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

