import { Badge } from '@/components/ui';
import { STATUS_COLOR } from '@/lib/constants';

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={STATUS_COLOR[status] ?? 'bg-slate-100 text-slate-600'}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge className={STATUS_COLOR[priority] ?? 'bg-slate-100 text-slate-600'}>{priority}</Badge>
  );
}
