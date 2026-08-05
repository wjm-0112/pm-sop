'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { Card, Button, LoadingSpinner, ConfirmDialog, EmptyState, Badge, Tag } from '@/components/ui';
import { useUIStore } from '@/stores/useUIStore';
import { MILESTONE_STATUS, STATUS_COLOR } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

function MilestoneDetailPage() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { milestones, loadAll, removeMilestone } = useProjectStore();
  const addToast = useUIStore((s) => s.addToast);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const m = milestones.find((x) => x.id === id);

  if (!m && milestones.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }
  if (!m) {
    return (
      <EmptyState
        title="里程碑不存在"
        action={
          <Link href="/projects/milestones">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const handleDelete = async () => {
    await removeMilestone(m.id);
    addToast('success', '里程碑已删除');
    router.push('/projects/milestones');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/projects/milestones" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> 返回
        </Link>
        <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
          <Trash2 size={16} /> 删除
        </Button>
      </div>

      <div>
        <div className="mb-2">
          <Badge className={STATUS_COLOR[m.status]}>{MILESTONE_STATUS[m.status]}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{m.title}</h1>
        <div className="mt-1 text-sm text-slate-500">截止 {formatDate(m.dueDate)}</div>
      </div>

      <Card>
        <p className="whitespace-pre-wrap text-sm text-slate-600">{m.description || '暂无描述'}</p>
      </Card>

      {m.deliverables.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">交付物</h3>
          <div className="flex flex-wrap gap-2">
            {m.deliverables.map((d) => (
              <Tag key={d} label={d} />
            ))}
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirm}
        title="删除里程碑"
        message="确定删除该里程碑吗？"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}


export default function MilestoneDetailPageWrap() {
  return (
    <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
      <MilestoneDetailPage />
    </Suspense>
  );
}
