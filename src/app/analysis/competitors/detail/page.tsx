'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { Card, Button, LoadingSpinner, ConfirmDialog, EmptyState, Badge, Tag } from '@/components/ui';
import { useUIStore } from '@/stores/useUIStore';
import { COMPETITOR_TYPE, STATUS_COLOR } from '@/lib/constants';
import { formatDate, fromNow } from '@/lib/utils';

function CompetitorDetailPage() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { competitors, loadAll, removeCompetitor } = useAnalysisStore();
  const addToast = useUIStore((s) => s.addToast);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const c = competitors.find((x) => x.id === id);

  if (!c && competitors.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!c) {
    return (
      <EmptyState
        title="竞品不存在"
        description="该竞品可能已被删除"
        action={
          <Link href="/analysis/competitors">
            <Button>返回竞品列表</Button>
          </Link>
        }
      />
    );
  }

  const handleDelete = async () => {
    await removeCompetitor(c.id);
    addToast('success', '竞品已删除');
    router.push('/analysis/competitors');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/analysis/competitors"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} /> 返回
        </Link>
        <div className="flex gap-2">
          <Link href={`/analysis/competitors/edit?id=${c.id}`}>
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
          <h1 className="text-2xl font-bold text-slate-900">{c.name}</h1>
          <Badge className={STATUS_COLOR[c.type]}>{COMPETITOR_TYPE[c.type]}</Badge>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          {c.website && (
            <a
              href={c.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink size={14} /> 官网
            </a>
          )}
          <span>目标用户：{c.targetUsers || '-'}</span>
          <span>定价：{c.pricing || '-'}</span>
          <span>融资：{c.fundingStage || '-'}</span>
          <span>成立：{c.foundedYear ?? '-'}</span>
          <span>份额：{c.marketShare != null ? `${c.marketShare}%` : '-'}</span>
        </div>
      </div>

      {c.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {c.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      )}

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">描述</h3>
        <p className="whitespace-pre-wrap text-sm text-slate-600">{c.description || '暂无描述'}</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">优势</h3>
          {c.strengths.length ? (
            <div className="flex flex-wrap gap-2">
              {c.strengths.map((s) => (
                <Tag key={s} label={s} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">暂无</p>
          )}
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">劣势</h3>
          {c.weaknesses.length ? (
            <div className="flex flex-wrap gap-2">
              {c.weaknesses.map((s) => (
                <Tag key={s} label={s} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">暂无</p>
          )}
        </Card>
      </div>

      {c.features.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">功能评分</h3>
          <div className="space-y-2">
            {c.features.map((f) => (
              <div key={f.id} className="border-b border-border pb-2 last:border-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {f.name}
                    <span className="ml-2 text-xs text-slate-400">{f.category}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Star size={12} className="text-warning" /> {f.rating}/5
                  </span>
                </div>
                {f.notes && <p className="mt-1 text-xs text-slate-400">{f.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {c.notes && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">备注</h3>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{c.notes}</p>
        </Card>
      )}

      <div className="text-xs text-slate-400">
        创建于 {formatDate(c.createdAt)} · 更新于 {fromNow(c.updatedAt)}
      </div>

      <ConfirmDialog
        open={confirm}
        title="删除竞品"
        message="确定要删除该竞品吗？此操作不可撤销。"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}


export default function CompetitorDetailPageWrap() {
  return (
    <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
      <CompetitorDetailPage />
    </Suspense>
  );
}
