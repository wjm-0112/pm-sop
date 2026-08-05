'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus, MapPin } from 'lucide-react';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { Card, Button, EmptyState, LoadingSpinner, Badge } from '@/components/ui';
import { VERSION_STATUS, STATUS_COLOR } from '@/lib/constants';
import { formatDate, truncate } from '@/lib/utils';

export default function RoadmapPage() {
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

  const sorted = [...versions].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">产品路线图</h1>
          <p className="text-sm text-slate-500">按时间线展示产品版本规划</p>
        </div>
        <div className="flex gap-2">
          <Link href="/planning/prd">
            <Button variant="outline">PRD 文档</Button>
          </Link>
          <Link href="/planning/versions/new">
            <Button>
              <Plus size={16} /> 新建版本
            </Button>
          </Link>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="暂无版本规划"
          description="创建第一个版本，开始规划产品路线图"
          action={
            <Link href="/planning/versions/new">
              <Button>
                <Plus size={16} /> 新建版本
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-max gap-4">
            {sorted.map((v, i) => (
              <Link key={v.id} href={`/planning/versions/detail?id=${v.id}`} className="w-64 shrink-0">
                <Card className="h-full">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <span className="text-xs text-slate-400">#{i + 1}</span>
                  </div>
                  <div className="mb-1 font-semibold text-slate-900">{v.title}</div>
                  <div className="mb-2 text-sm text-slate-500">{v.name}</div>
                  <div className="mb-3 flex items-center gap-2">
                    <Badge className={STATUS_COLOR[v.status]}>{VERSION_STATUS[v.status]}</Badge>
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDate(v.startDate)} ~ {formatDate(v.endDate)}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                    {truncate(v.description || '暂无描述', 60)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
