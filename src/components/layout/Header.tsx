'use client';

import { Breadcrumb } from './Breadcrumb';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur">
      <Breadcrumb />
    </header>
  );
}
