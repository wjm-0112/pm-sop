'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useRequirementStore } from '@/stores/useRequirementStore';
import { Card, Button, LoadingSpinner, ConfirmDialog, EmptyState, Badge, Tag } from '@/components/ui';
import { StatusBadge } from '@/components/requirements/StatusBadge';
import { useUIStore } from '@/stores/useUIStore';
import { VERSION_STATUS, STATUS_COLOR } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function VersionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { versions, loadVersions, removeVersion } = usePlanningStore();
  const { items: requirements, load: loadReq } = useRequirementStore();
  const addToast = useUIStore((s) => s.addToast);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    loadVersions();
    loadReq();
  }, [loadVersions, loadReq]);

  const version = versions.find((v) => v.id === id);

  if (!version && versions.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }
  if (!version) {
    return (
      <EmptyState
        title="版本不存在"
        action={
          <Link href="/planning/versions">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const reqs = requirements.filter((r) => version.requirementIds.includes(r.id));

  const handleDelete = async () => {
    await removeVersion(version.id);
    addToast('success', '版本已删除');
    router.push('/planning/versions');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/planning/versions" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> 返回
        </Link>
        <div className="flex gap-2">
          <Link href={`/planning/versions/${version.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit size={16} /> 编辑
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
            <Trash2 size={16} /> 删除
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Badge className={STATUS_COLOR[version.status]}>{VERSION_STATUS[version.status]}</Badge>
          <span className="text-sm text-slate-500">{version.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{version.title}</h1>
      </div>

      <Card>
        <p className="whitespace-pre-wrap text-sm text-slate-600">
          {version.description || '暂无描述'}
        </p>
        <div className="mt-3 text-sm text-slate-500">
          {formatDate(version.startDate)} ~ {formatDate(version.endDate)}
          {version.releaseDate && ` · 发布于 ${formatDate(version.releaseDate)}`}
        </div>
      </Card>

      {version.goals.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">版本目标</h3>
          <div className="flex flex-wrap gap-2">
            {version.goals.map((g) => (
              <Tag key={g} label={g} />
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          关联需求（{reqs.length}）
        </h3>
        {reqs.length === 0 ? (
          <p className="text-sm text-slate-400">暂无关联需求</p>
        ) : (
          <ul className="divide-y divide-border">
            {reqs.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <Link href={`/requirements/${r.id}`} className="text-sm text-slate-700 hover:text-primary">
                  {r.title}
                </Link>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={confirm}
        title="删除版本"
        message="确定删除该版本吗？"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
