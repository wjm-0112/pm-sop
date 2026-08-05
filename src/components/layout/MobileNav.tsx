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
  { href: '/', label: '首页', icon: LayoutDashboard },
  { href: '/requirements', label: '需求', icon: ListChecks },
  { href: '/planning', label: '规划', icon: Map },
  { href: '/projects', label: '项目', icon: KanbanSquare },
  { href: '/analysis', label: '分析', icon: BarChart3 },
  { href: '/settings', label: '设置', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {navItems.map((item) => {
        const active =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'tap-active flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors active:scale-95',
              active ? 'text-primary' : 'text-slate-500',
            )}
          >
            <span
              className={cn(
                'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                active ? 'bg-primary-50' : '',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
