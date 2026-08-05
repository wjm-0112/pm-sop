'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const labelMap: Record<string, string> = {
  requirements: '需求管理',
  planning: '产品规划',
  projects: '项目推进',
  analysis: '竞品分析',
  settings: '设置',
  versions: '版本',
  prd: 'PRD',
  tasks: '任务',
  milestones: '里程碑',
  risks: '风险',
  competitors: '竞品',
  market: '市场调研',
  personas: '用户画像',
  journeys: '用户旅程',
  new: '新建',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-400">
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const label = labelMap[seg] ?? seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} />}
            {isLast ? (
              <span className="font-medium text-slate-700">{label}</span>
            ) : (
              <Link href={href} className="hover:text-slate-600">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
