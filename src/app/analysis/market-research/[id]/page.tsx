'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { Card, Button, LoadingSpinner, ConfirmDialog, EmptyState, Tag } from '@/components/ui';
import { useUIStore } from '@/stores/useUIStore';
import { formatDate, fromNow } from '@/lib/utils';

export default function MarketResearchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { marketResearch, loadAll, removeMarketResearch } = useAnalysisStore();
  const addToast = useUIStore((s) => s.addToast);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const m = marketResearch.find((x) => x.id === id);

  if (!m && marketResearch.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!m) {
    return (
      <EmptyState
        title="调研记录不存在"
        action={
          <Link href="/analysis/market-research">
            <Button>返回列表</Button>
          </Link>
        }
      />
    );
  }

  const handleDelete = async () => {
    await removeMarketResearch(m.id);
    addToast('success', '调研记录已删除');
    router.push('/analysis/market-research');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/analysis/market-research"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} /> 返回
        </Link>
        <div className="flex gap-2">
          <Link href={`/analysis/market-research/${m.id}/edit`}>
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
          <h1 className="text-2xl font-bold text-slate-900">{m.title}</h1>
          {m.category && <Tag label={m.category} />}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          {m.author && <span>作者：{m.author}</span>}
          {m.source && <span>来源：{m.source}</span>}
          <span>调研日期：{formatDate(m.researchDate)}</span>
          {m.sourceUrl && (
            <a
              href={m.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink size={14} /> 来源链接
            </a>
          )}
        </div>
      </div>

      {m.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {m.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      )}

      {m.keyFindings.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">关键发现</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            {m.keyFindings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">详情</h3>
        <p className="whitespace-pre-wrap text-sm text-slate-600">{m.content || '暂无内容'}</p>
      </Card>

      <div className="text-xs text-slate-400">
        创建于 {formatDate(m.createdAt)} · 更新于 {fromNow(m.updatedAt)}
      </div>

      <ConfirmDialog
        open={confirm}
        title="删除调研记录"
        message="确定要删除该调研记录吗？此操作不可撤销。"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
