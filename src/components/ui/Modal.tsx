'use client';

import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** bottom-sheet：移动端从底部滑出（默认，更贴近原生 App）；center：桌面居中弹窗 */
  variant?: 'center' | 'bottom-sheet';
}

const centerSizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// 底部抽屉在桌面端（lg）回到居中宽度
const sheetLgSizeMap = {
  sm: 'lg:max-w-md',
  md: 'lg:max-w-lg',
  lg: 'lg:max-w-2xl',
  xl: 'lg:max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  variant = 'bottom-sheet',
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isSheet = variant === 'bottom-sheet';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-center p-0',
        isSheet ? 'items-end lg:items-center lg:p-4' : 'items-center p-4',
      )}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 flex w-full flex-col bg-surface shadow-xl',
          isSheet
            ? cn(
                'max-h-[92vh] rounded-t-2xl animate-sheet-up pb-[env(safe-area-inset-bottom)]',
                sheetLgSizeMap[size],
                'lg:rounded-xl lg:max-h-[90vh]',
              )
            : cn('max-h-[90vh] rounded-xl animate-fade-in', centerSizeMap[size]),
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900 lg:text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="rounded-md p-2 text-slate-400 active:bg-slate-100 active:text-slate-600 lg:hover:bg-slate-100 lg:hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
