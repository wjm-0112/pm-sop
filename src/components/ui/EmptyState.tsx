import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <div className="mb-3 text-slate-300">{icon ?? <Inbox size={48} />}</div>
      <h3 className="text-base font-medium text-slate-700">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
