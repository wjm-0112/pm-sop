'use client';

import Link from 'next/link';
import { BarChart3, Search, Users, GitBranch, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui';

const modules = [
  {
    href: '/analysis/competitors',
    title: '竞品分析',
    desc: '记录竞品能力矩阵，生成功能对比雷达图',
    icon: BarChart3,
  },
  {
    href: '/analysis/market-research',
    title: '市场调研',
    desc: '沉淀行业洞察、用户研究与关键发现',
    icon: Search,
  },
  {
    href: '/analysis/personas',
    title: '用户画像',
    desc: '构建目标用户画像与用户旅程地图',
    icon: Users,
  },
];

export default function AnalysisOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">竞品与市场分析</h1>
        <p className="mt-1 text-sm text-slate-500">
          围绕竞争格局、市场洞察与目标用户，沉淀决策依据
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.href} href={m.href}>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{m.title}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-500">{m.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  进入 <ArrowRight size={14} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <GitBranch size={18} className="mt-0.5 text-slate-400" />
          <div className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">用户旅程地图</span>{' '}
            作为用户画像的一部分进行维护，在「用户画像」的详情与编辑中可视化各阶段情绪、痛点与机会点。
          </div>
        </div>
      </Card>
    </div>
  );
}
