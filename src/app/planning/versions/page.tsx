'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { Card, Button, EmptyState, LoadingSpinner, Badge } from '@/components/ui';
import { VERSION_STATUS, STATUS_COLOR } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function VersionsPage() {
  const { versions, isLoading, loadVersions } = usePlanningStore();

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

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
          <h1 className="text-2xl font-bold text-slate-900">版本管理</h1>
          <p className="text-sm text-slate-500">共 {versions.length} 个版本</p>
        </div>
        <Link href="/planning/versions/new">
          <Button>
            <Plus size={16} /> 新建版本
          </Button>
        </Link>
      </div>

      {versions.length === 0 ? (
        <EmptyState
          title="暂无版本"
          action={
            <Link href="/planning/versions/new">
              <Button>
                <Plus size={16} /> 新建版本
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {versions.map((v) => (
            <Link key={v.id} href={`/planning/versions/detail?id=${v.id}`}>
              <Card className="h-full">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{v.title}</span>
                  <Badge className={STATUS_COLOR[v.status]}>{VERSION_STATUS[v.status]}</Badge>
                </div>
                <div className="text-sm text-slate-500">{v.name}</div>
                <div className="mt-3 text-xs text-slate-400">
                  {formatDate(v.startDate)} ~ {formatDate(v.endDate)}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  目标 {v.goals.length} 项 · 关联需求 {v.requirementIds.length} 条
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
