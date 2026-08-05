'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VersionForm, type VersionFormValues } from '@/components/planning/VersionForm';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useUIStore } from '@/stores/useUIStore';
import { toDate } from '@/lib/utils';
import type { Version } from '@/lib/types';

export default function NewVersionPage() {
  const router = useRouter();
  const create = usePlanningStore((s) => s.createVersion);
  const addToast = useUIStore((s) => s.addToast);

  const submit = async (v: VersionFormValues) => {
    const id = await create({
      name: v.name,
      title: v.title,
      description: v.description,
      status: v.status,
      startDate: toDate(v.startDate) ?? new Date(),
      endDate: toDate(v.endDate),
      releaseDate: toDate(v.releaseDate),
      goals: v.goals,
      requirementIds: [],
    } as Omit<Version, 'id' | 'createdAt' | 'updatedAt'>);
    addToast('success', '版本创建成功');
    router.push(`/planning/versions/${id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">新建版本</h1>
      <VersionForm onSubmit={submit} onCancel={() => router.push('/planning/versions')} />
    </div>
  );
}
