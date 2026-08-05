'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { Card, Button, EmptyState, LoadingSpinner, Tag } from '@/components/ui';
import { SearchInput } from '@/components/common/SearchInput';
import { useUIStore } from '@/stores/useUIStore';
import { formatDate, fromNow } from '@/lib/utils';

export default function MarketResearchListPage() {
  const { marketResearch, isLoading, loadAll } = useAnalysisStore();
  const addToast = useUIStore((s) => s.addToast);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...marketResearch].sort((a, b) => b.researchDate.getTime() - a.researchDate.getTime());
    if (!q) return list;
    return list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [marketResearch, query]);

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
          <h1 className="text-2xl font-bold text-slate-900">市场调研</h1>
          <p className="text-sm text-slate-500">共 {marketResearch.length} 条记录</p>
        </div>
        <Link href="/analysis/market-research/new">
          <Button>
            <Plus size={16} /> 新增调研
          </Button>
        </Link>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="搜索标题 / 分类 / 标签" />

      {filtered.length === 0 ? (
        <EmptyState
          title={marketResearch.length === 0 ? '暂无调研记录' : '未找到匹配项'}
          description={marketResearch.length === 0 ? '记录行业洞察与用户研究' : '尝试调整搜索关键词'}
          action={
            marketResearch.length === 0 ? (
              <Link href="/analysis/market-research/new">
                <Button>
                  <Plus size={16} /> 新增调研
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Link key={m.id} href={`/analysis/market-research/detail?id=${m.id}`}>
              <Card className="h-full">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{m.title}</span>
                  {m.category && <Tag label={m.category} />}
                </div>
                <p className="mb-2 line-clamp-2 text-sm text-slate-500">{m.content || '暂无内容'}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{formatDate(m.researchDate)}</span>
                  <span>{fromNow(m.updatedAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
