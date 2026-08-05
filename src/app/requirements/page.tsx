'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, LayoutGrid, List, Download } from 'lucide-react';
import { useRequirementStore } from '@/stores/useRequirementStore';
import { StatusBadge, PriorityBadge } from '@/components/requirements/StatusBadge';
import { Button, Card, EmptyState, LoadingSpinner } from '@/components/ui';
import { SearchInput } from '@/components/common/SearchInput';
import { Select } from '@/components/ui/Select';
import { Tag } from '@/components/ui';
import { ExportMenu } from '@/components/common/ExportMenu';
import {
  REQUIREMENT_STATUS,
  REQUIREMENT_PRIORITY,
  REQUIREMENT_TYPE,
} from '@/lib/constants';
import { formatDate, truncate } from '@/lib/utils';
import type { Requirement } from '@/lib/types';

export default function RequirementsPage() {
  const { items, isLoading, load, viewMode, setViewMode, filters, setFilters, searchQuery, setSearch } =
    useRequirementStore();

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.priority !== 'all' && r.priority !== filters.priority) return false;
      if (filters.type !== 'all' && r.type !== filters.type) return false;
      if (filters.tag && !r.tags.includes(filters.tag)) return false;
      if (filters.assignee && r.assignee !== filters.assignee) return false;
      if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [items, filters, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">需求管理</h1>
          <p className="text-sm text-slate-500">共 {filtered.length} 条需求</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            module="requirements"
            data={items}
            filename="requirements"
          />
          <div className="flex rounded-md border border-border">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-primary-50 text-primary' : 'text-slate-500'}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary' : 'text-slate-500'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <Link href="/requirements/new">
            <Button>
              <Plus size={16} /> 新建需求
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={searchQuery} onChange={setSearch} className="w-full sm:w-64" />
        <Select
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value as Requirement['status'] | 'all' })}
          options={[
            { value: 'all', label: '全部状态' },
            ...Object.entries(REQUIREMENT_STATUS).map(([v, l]) => ({ value: v, label: l })),
          ]}
          className="w-32"
        />
        <Select
          value={filters.priority}
          onChange={(e) =>
            setFilters({ priority: e.target.value as Requirement['priority'] | 'all' })
          }
          options={[
            { value: 'all', label: '全部优先级' },
            ...Object.entries(REQUIREMENT_PRIORITY).map(([v, l]) => ({ value: v, label: l })),
          ]}
          className="w-32"
        />
        <Select
          value={filters.type}
          onChange={(e) => setFilters({ type: e.target.value as Requirement['type'] | 'all' })}
          options={[
            { value: 'all', label: '全部类型' },
            ...Object.entries(REQUIREMENT_TYPE).map(([v, l]) => ({ value: v, label: l })),
          ]}
          className="w-32"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="暂无需求"
          description="点击右上角新建需求，开始管理你的产品需求"
          action={
            <Link href="/requirements/new">
              <Button>
                <Plus size={16} /> 新建需求
              </Button>
            </Link>
          }
        />
      ) : viewMode === 'table' ? (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-slate-400">
                <th className="px-4 py-3">标题</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">优先级</th>
                <th className="px-4 py-3">类型</th>
                <th className="px-4 py-3">负责人</th>
                <th className="px-4 py-3">截止</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/requirements/detail?id=${r.id}`} className="font-medium text-slate-800 hover:text-primary">
                      {truncate(r.title, 50)}
                    </Link>
                    <div className="mt-1 flex gap-1">
                      {r.tags.slice(0, 3).map((t) => (
                        <Tag key={t} label={t} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.type}</td>
                  <td className="px-4 py-3 text-slate-600">{r.assignee || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(r.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Link key={r.id} href={`/requirements/detail?id=${r.id}`}>
              <Card className="h-full">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="font-medium text-slate-800">{truncate(r.title, 40)}</span>
                  <PriorityBadge priority={r.priority} />
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                  {truncate(r.description || '暂无描述', 80)}
                </p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={r.status} />
                  <span className="text-xs text-slate-400">{r.assignee || '未分配'}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
