'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useRequirementStore } from '@/stores/useRequirementStore';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { Card, Button, LoadingSpinner, ConfirmDialog, EmptyState, Tag } from '@/components/ui';
import { StatusBadge, PriorityBadge } from '@/components/requirements/StatusBadge';
import { useUIStore } from '@/stores/useUIStore';
import { formatDate, fromNow } from '@/lib/utils';
import {
  REQUIREMENT_TYPE,
  REQUIREMENT_SOURCE,
  REQUIREMENT_STATUS,
} from '@/lib/constants';
import type { Requirement } from '@/lib/types';

function RequirementDetailPage() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { items, load, remove } = useRequirementStore();
  const versions = usePlanningStore((s) => s.versions);
  const loadVersions = usePlanningStore((s) => s.loadVersions);
  const addToast = useUIStore((s) => s.addToast);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    load();
    loadVersions();
  }, [load, loadVersions]);

  const req = items.find((r) => r.id === id);

  if (!req && items.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!req) {
    return (
      <EmptyState
        title="需求不存在"
        description="该需求可能已被删除"
        action={
          <Link href="/requirements">
            <Button>返回需求列表</Button>
          </Link>
        }
      />
    );
  }

  const handleDelete = async () => {
    await remove(req.id);
    addToast('success', '需求已删除');
    router.push('/requirements');
  };

  const version = versions.find((v) => v.id === req.versionId);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/requirements" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> 返回
        </Link>
        <div className="flex gap-2">
          <Link href={`/requirements/edit?id=${req.id}`}>
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
          <StatusBadge status={req.status} />
          <PriorityBadge priority={req.priority} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{req.title}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
          <span>类型：{REQUIREMENT_TYPE[req.type]}</span>
          <span>来源：{REQUIREMENT_SOURCE[req.source]}</span>
          <span>负责人：{req.assignee || '-'}</span>
          <span>审核人：{req.reviewer || '-'}</span>
          <span>截止：{formatDate(req.dueDate)}</span>
        </div>
      </div>

      {req.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {req.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      )}

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">描述</h3>
        <p className="whitespace-pre-wrap text-sm text-slate-600">
          {req.description || '暂无描述'}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <div className="text-xs text-slate-400">关联版本</div>
          <div className="mt-1 text-sm font-medium">{version?.name || '未关联'}</div>
        </Card>
        <Card>
          <div className="text-xs text-slate-400">预估工作量</div>
          <div className="mt-1 text-sm font-medium">{req.estimatedEffort ?? '-'} 人天</div>
        </Card>
        <Card>
          <div className="text-xs text-slate-400">业务价值</div>
          <div className="mt-1 text-sm font-medium">{req.businessValue ?? '-'} / 10</div>
        </Card>
        <Card>
          <div className="text-xs text-slate-400">更新时间</div>
          <div className="mt-1 text-sm font-medium">{fromNow(req.updatedAt)}</div>
        </Card>
      </div>

      {req.changeLog.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">变更日志</h3>
          <ul className="space-y-2">
            {req.changeLog.map((c) => (
              <li key={c.id} className="border-b border-border pb-2 text-sm last:border-0">
                <span className="font-medium text-slate-700">{c.field}</span>
                <span className="text-slate-400"> : {c.oldValue} → {c.newValue}</span>
                <div className="text-xs text-slate-400">
                  {c.changedBy} · {fromNow(c.changedAt)} {c.reason && `· ${c.reason}`}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        open={confirm}
        title="删除需求"
        message="确定要删除这条需求吗？此操作不可撤销。"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}


export default function RequirementDetailPageWrap() {
  return (
    <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
      <RequirementDetailPage />
    </Suspense>
  );
}
