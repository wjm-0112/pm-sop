'use client';

import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import { ToastContainer } from '@/components/ui';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <OfflineIndicator />
        <Header />
        <main className="flex-1 px-4 pb-20 pt-4 sm:px-6 lg:pb-6">{children}</main>
      </div>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}
