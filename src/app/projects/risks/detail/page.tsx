'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { Card, Button, LoadingSpinner, ConfirmDialog, EmptyState, Badge } from '@/components/ui';
import { useUIStore } from '@/stores/useUIStore';
import { RISK_CATEGORY, RISK_LEVEL, RISK_LEVEL_COLOR, RISK_STATUS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

function RiskDetailPage() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { risks, loadAll, removeRisk } = useProjectStore();
  const addToast = useUIStore((s) => s.addToast);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const r = risks.find((x) => x.id === id);

  if (!r && risks.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }
  if (!r) {
    return (
      <EmptyState
        title="风险不存在"
        action={
          <Link href="/projects/risks">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const handleDelete = async () => {
    await removeRisk(r.id);
    addToast('success', '风险已删除');
    router.push('/projects/risks');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/projects/risks" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> 返回
        </Link>
        <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
          <Trash2 size={16} /> 删除
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{r.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge className={RISK_LEVEL_COLOR[r.probability]}>概率 {RISK_LEVEL[r.probability]}</Badge>
          <Badge className={RISK_LEVEL_COLOR[r.impact]}>影响 {RISK_LEVEL[r.impact]}</Badge>
          <Badge className="bg-slate-100 text-slate-600">{RISK_CATEGORY[r.category]}</Badge>
          <Badge className="bg-slate-100 text-slate-600">{RISK_STATUS[r.status]}</Badge>
        </div>
      </div>

      <Card>
        <p className="whitespace-pre-wrap text-sm text-slate-600">{r.description || '暂无描述'}</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-700">缓解措施</h3>
          <p className="text-sm text-slate-600">{r.mitigation || '未填写'}</p>
        </Card>
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-700">应急预案</h3>
          <p className="text-sm text-slate-600">{r.contingency || '未填写'}</p>
        </Card>
      </div>

      <p className="text-xs text-slate-400">
        负责人 {r.owner || '-'} · 识别于 {formatDate(r.identifiedAt)}
      </p>

      <ConfirmDialog
        open={confirm}
        title="删除风险"
        message="确定删除该风险吗？"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}


export default function RiskDetailPageWrap() {
  return (
    <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
      <RiskDetailPage />
    </Suspense>
  );
}
