'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

// 根据当前路由决定 FAB 的「新建」目标（按最长前缀匹配）
const fabMap: { prefix: string; href: string; label: string }[] = [
  { prefix: '/requirements', href: '/requirements/new', label: '新建需求' },
  { prefix: '/planning/versions', href: '/planning/versions/new', label: '新建版本' },
  { prefix: '/planning/prd', href: '/planning/prd/new', label: '新建 PRD' },
  { prefix: '/planning', href: '/planning/versions/new', label: '新建版本' },
  { prefix: '/projects/tasks', href: '/projects/tasks/new', label: '新建任务' },
  { prefix: '/projects/milestones', href: '/projects/milestones/new', label: '新建里程碑' },
  { prefix: '/projects/risks', href: '/projects/risks/new', label: '新建风险' },
  { prefix: '/projects', href: '/projects/tasks/new', label: '新建任务' },
  { prefix: '/analysis/competitors', href: '/analysis/competitors/new', label: '新建竞品' },
  { prefix: '/analysis/market-research', href: '/analysis/market-research/new', label: '新建调研' },
  { prefix: '/analysis/personas', href: '/analysis/personas/new', label: '新建画像' },
  { prefix: '/analysis', href: '/analysis/competitors/new', label: '新建竞品' },
];

export function Fab() {
  const pathname = usePathname();
  const match = [...fabMap].reverse().find((m) => pathname.startsWith(m.prefix));
  if (!match) return null;

  return (
    <Link
      href={match.href}
      aria-label={match.label}
      className="tap-active fixed left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-90 lg:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 4.5rem)' }}
    >
      <Plus size={26} strokeWidth={2.5} />
    </Link>
  );
}
