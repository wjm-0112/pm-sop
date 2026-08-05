'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListChecks,
  Map,
  KanbanSquare,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/requirements', label: '需求管理', icon: ListChecks },
  { href: '/planning', label: '产品规划', icon: Map },
  { href: '/projects', label: '项目推进', icon: KanbanSquare },
  { href: '/analysis', label: '竞品分析', icon: BarChart3 },
  { href: '/settings', label: '设置', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          PM
        </div>
        <span className="text-lg font-semibold text-slate-900">PM SOP</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4 text-xs text-slate-400">
        本地优先 · 数据存于浏览器
      </div>
    </aside>
  );
}
