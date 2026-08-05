'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

// 移动端顶部栏标题（按最长前缀匹配）
const titleMap: { prefix: string; title: string }[] = [
  { prefix: '/requirements', title: '需求管理' },
  { prefix: '/planning/versions', title: '版本规划' },
  { prefix: '/planning/prd', title: 'PRD 文档' },
  { prefix: '/planning', title: '产品规划' },
  { prefix: '/projects/tasks', title: '任务' },
  { prefix: '/projects/milestones', title: '里程碑' },
  { prefix: '/projects/risks', title: '风险管理' },
  { prefix: '/projects', title: '项目推进' },
  { prefix: '/analysis/competitors', title: '竞品分析' },
  { prefix: '/analysis/market-research', title: '市场调研' },
  { prefix: '/analysis/personas', title: '用户画像' },
  { prefix: '/analysis', title: '竞品与市场分析' },
  { prefix: '/settings', title: '设置' },
  { prefix: '/', title: '仪表盘' },
];

export function Header() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const titleEntry = [...titleMap].reverse().find((t) => pathname.startsWith(t.prefix));
  const title = titleEntry?.title ?? 'PM SOP';
  const canBack = segments.length >= 2;
  const parentHref = '/' + segments.slice(0, -1).join('/');

  return (
    <header className="safe-top sticky top-0 z-30 flex h-14 items-center border-b border-border bg-surface/90 px-4 backdrop-blur lg:h-16 lg:px-6">
      {/* 移动端：返回 + 标题 */}
      <div className="flex items-center gap-1 lg:hidden">
        {canBack && (
          <Link
            href={parentHref}
            aria-label="返回"
            className="tap-active -ml-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-600 active:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <span className="text-base font-semibold text-slate-900">{title}</span>
      </div>
      {/* 桌面端：面包屑 */}
      <div className="hidden lg:block">
        <Breadcrumb />
      </div>
    </header>
  );
}
