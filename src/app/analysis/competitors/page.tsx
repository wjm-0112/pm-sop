'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, ExternalLink } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { Card, Button, EmptyState, LoadingSpinner, Badge } from '@/components/ui';
import { COMPETITOR_TYPE, STATUS_COLOR } from '@/lib/constants';
import { useUIStore } from '@/stores/useUIStore';
import type { Competitor } from '@/lib/types';

const chartColors = ['#3B82F6', '#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];

export default function CompetitorsPage() {
  const { competitors, isLoading, loadAll } = useAnalysisStore();
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // 雷达图数据：按功能分类聚合各竞品平均评分
  const radarData = useMemo(() => {
    const categories = new Set<string>();
    competitors.forEach((c) => c.features.forEach((f) => categories.add(f.category)));
    const catList = Array.from(categories);
    return catList.map((cat) => {
      const row: Record<string, number | string> = { category: cat };
      competitors.forEach((c) => {
        const feats = c.features.filter((f) => f.category === cat);
        if (feats.length) {
          row[c.name] = Math.round(
            (feats.reduce((s, f) => s + f.rating, 0) / feats.length) * 10,
          ) / 10;
        }
      });
      return row;
    });
  }, [competitors]);

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
          <h1 className="text-2xl font-bold text-slate-900">竞品分析</h1>
          <p className="text-sm text-slate-500">共 {competitors.length} 个竞品</p>
        </div>
        <Link href="/analysis/competitors/new">
          <Button>
            <Plus size={16} /> 新增竞品
          </Button>
        </Link>
      </div>

      {competitors.length === 0 ? (
        <EmptyState
          title="暂无竞品"
          description="添加竞品并对比功能覆盖"
          action={
            <Link href="/analysis/competitors/new">
              <Button>
                <Plus size={16} /> 新增竞品
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {radarData.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">功能对比雷达图</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    {competitors.map((c, i) => (
                      <Radar
                        key={c.id}
                        name={c.name}
                        dataKey={c.name}
                        stroke={chartColors[i % chartColors.length]}
                        fill={chartColors[i % chartColors.length]}
                        fillOpacity={0.1}
                      />
                    ))}
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competitors.map((c) => (
              <Link key={c.id} href={`/analysis/competitors/detail?id=${c.id}`}>
                <Card className="h-full">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{c.name}</span>
                    <Badge className={STATUS_COLOR[c.type]}>{COMPETITOR_TYPE[c.type]}</Badge>
                  </div>
                  <p className="mb-2 line-clamp-2 text-sm text-slate-500">
                    {c.description || '暂无描述'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>优势 {c.strengths.length}</span>
                    <span>功能 {c.features.length}</span>
                    {c.website && (
                      <span className="flex items-center gap-1">
                        <ExternalLink size={12} /> 官网
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
