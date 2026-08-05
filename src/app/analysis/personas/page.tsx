'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, User } from 'lucide-react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { Card, Button, EmptyState, LoadingSpinner, Tag } from '@/components/ui';
import { SearchInput } from '@/components/common/SearchInput';
import { fromNow } from '@/lib/utils';

export default function PersonasListPage() {
  const { personas, isLoading, loadAll } = useAnalysisStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...personas].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.goals.some((g) => g.toLowerCase().includes(q)),
    );
  }, [personas, query]);

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
          <h1 className="text-2xl font-bold text-slate-900">用户画像</h1>
          <p className="text-sm text-slate-500">共 {personas.length} 个画像</p>
        </div>
        <Link href="/analysis/personas/new">
          <Button>
            <Plus size={16} /> 新增画像
          </Button>
        </Link>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="搜索名称 / 角色 / 目标" />

      {filtered.length === 0 ? (
        <EmptyState
          title={personas.length === 0 ? '暂无用户画像' : '未找到匹配项'}
          description={personas.length === 0 ? '构建目标用户的画像与旅程地图' : '尝试调整搜索关键词'}
          action={
            personas.length === 0 ? (
              <Link href="/analysis/personas/new">
                <Button>
                  <Plus size={16} /> 新增画像
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/analysis/personas/${p.id}`}>
              <Card className="h-full">
                <div className="mb-2 flex items-center gap-3">
                  {p.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.avatar} alt={p.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary">
                      <User size={18} />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.role || '未设角色'}</div>
                  </div>
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                  {p.goals.slice(0, 3).map((g) => (
                    <Tag key={g} label={g} />
                  ))}
                  {p.goals.length > 3 && <span className="text-xs text-slate-400">+{p.goals.length - 3}</span>}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>旅程 {p.journeyMap.length} 阶段</span>
                  <span>{fromNow(p.updatedAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
