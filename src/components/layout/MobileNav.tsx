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
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 border-t border-border bg-surface lg:hidden">
      {navItems.map((item) => {
        const active =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-2 text-[10px]',
              active ? 'text-primary' : 'text-slate-500',
            )}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
