'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  ListChecks,
  KanbanSquare,
  Map,
  BarChart3,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useRequirementStore } from '@/stores/useRequirementStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { Card } from '@/components/ui';
import { formatDate, fromNow } from '@/lib/utils';
import { REQUIREMENT_STATUS, TASK_STATUS } from '@/lib/constants';

function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-4 hover:shadow-md">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const req = useRequirementStore();
  const proj = useProjectStore();
  const plan = usePlanningStore();
  const analysis = useAnalysisStore();

  useEffect(() => {
    req.load();
    proj.loadAll();
    plan.loadVersions();
    plan.loadPrds();
    analysis.loadAll();
  }, []);

  const reqTotal = req.items.length;
  const reqApproved = req.items.filter((r) => r.status === 'approved').length;
  const tasksDone = proj.tasks.filter((t) => t.status === 'done').length;
  const tasksTotal = proj.tasks.length;
  const activeMilestones = proj.milestones.filter(
    (m) => m.status === 'in_progress' || m.status === 'pending',
  ).length;
  const competitors = analysis.competitors.length;

  const recentRequirements = [...req.items]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);
  const recentTasks = [...proj.tasks]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const quickActions = [
    { label: '新建需求', href: '/requirements/new', icon: <ListChecks size={18} /> },
    { label: '新建任务', href: '/projects/tasks/new', icon: <KanbanSquare size={18} /> },
    { label: '新建版本', href: '/planning/versions/new', icon: <Map size={18} /> },
    { label: '新增竞品', href: '/analysis/competitors/new', icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
        <p className="mt-1 text-sm text-slate-500">产品经理标准化工作流程总览</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="需求总数"
          value={reqTotal}
          icon={<ListChecks size={24} className="text-primary" />}
          color="bg-primary-50"
          href="/requirements"
        />
        <StatCard
          label="任务进度"
          value={`${tasksDone}/${tasksTotal}`}
          icon={<KanbanSquare size={24} className="text-secondary" />}
          color="bg-indigo-50"
          href="/projects"
        />
        <StatCard
          label="进行中里程碑"
          value={activeMilestones}
          icon={<Map size={24} className="text-warning" />}
          color="bg-amber-50"
          href="/projects/milestones"
        />
        <StatCard
          label="竞品数量"
          value={competitors}
          icon={<BarChart3 size={24} className="text-success" />}
          color="bg-green-50"
          href="/analysis/competitors"
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">快速操作</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href}>
              <Card className="flex items-center gap-3">
                <span className="text-primary">{a.icon}</span>
                <span className="text-sm font-medium text-slate-700">{a.label}</span>
                <Plus size={16} className="ml-auto text-slate-400" />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">最近需求</h2>
            <Link href="/requirements" className="flex items-center gap-1 text-sm text-primary">
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <Card>
            {recentRequirements.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">暂无需求</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentRequirements.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2.5">
                    <Link href={`/requirements/detail?id=${r.id}`} className="truncate text-sm text-slate-700 hover:text-primary">
                      {r.title}
                    </Link>
                    <span className="ml-2 shrink-0 text-xs text-slate-400">
                      {REQUIREMENT_STATUS[r.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">最近任务</h2>
            <Link href="/projects/tasks" className="flex items-center gap-1 text-sm text-primary">
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <Card>
            {recentTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">暂无任务</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentTasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2.5">
                    <Link href={`/projects/tasks/detail?id=${t.id}`} className="truncate text-sm text-slate-700 hover:text-primary">
                      {t.title}
                    </Link>
                    <span className="ml-2 shrink-0 text-xs text-slate-400">
                      {TASK_STATUS[t.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        数据更新于本地 · 需求 {reqApproved} 条已通过 · 最后同步 {fromNow(new Date())}
      </p>
    </div>
  );
}
