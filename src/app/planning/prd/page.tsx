'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { Card, Button, EmptyState, LoadingSpinner, Badge } from '@/components/ui';
import { PRD_STATUS, STATUS_COLOR } from '@/lib/constants';
import { fromNow, truncate } from '@/lib/utils';

export default function PRDListPage() {
  const { prds, isLoading, loadPrds } = usePlanningStore();

  useEffect(() => {
    loadPrds();
  }, [loadPrds]);

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
          <h1 className="text-2xl font-bold text-slate-900">PRD 文档</h1>
          <p className="text-sm text-slate-500">共 {prds.length} 篇</p>
        </div>
        <Link href="/planning/prd/new">
          <Button>
            <Plus size={16} /> 新建 PRD
          </Button>
        </Link>
      </div>

      {prds.length === 0 ? (
        <EmptyState
          title="暂无 PRD"
          description="创建第一篇产品需求文档"
          action={
            <Link href="/planning/prd/new">
              <Button>
                <Plus size={16} /> 新建 PRD
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prds.map((p) => (
            <Link key={p.id} href={`/planning/prd/${p.id}`}>
              <Card className="h-full">
                <div className="mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  <Badge className={STATUS_COLOR[p.status]}>{PRD_STATUS[p.status]}</Badge>
                </div>
                <div className="font-semibold text-slate-900">{p.title}</div>
                <div className="mt-2 text-xs text-slate-400">
                  v{p.version} · 更新于 {fromNow(p.updatedAt)}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
