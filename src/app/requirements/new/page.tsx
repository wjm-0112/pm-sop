'use client';

import { useRouter } from 'next/navigation';
import { RequirementForm, type RequirementFormValues } from '@/components/requirements/RequirementForm';
import { useRequirementStore } from '@/stores/useRequirementStore';
import { useUIStore } from '@/stores/useUIStore';
import { toDate } from '@/lib/utils';
import type { Requirement } from '@/lib/types';

export default function NewRequirementPage() {
  const router = useRouter();
  const create = useRequirementStore((s) => s.create);
  const addToast = useUIStore((s) => s.addToast);

  const handleSubmit = async (v: RequirementFormValues) => {
    const id = await create({
      title: v.title,
      description: v.description,
      type: v.type,
      priority: v.priority,
      status: v.status,
      source: v.source,
      sourceDetail: v.sourceDetail,
      assignee: v.assignee,
      reviewer: v.reviewer,
      tags: v.tags,
      attachments: [],
      parentId: v.parentId,
      versionId: v.versionId,
      dueDate: toDate(v.dueDate),
      closedAt: null,
      estimatedEffort: v.estimatedEffort ? Number(v.estimatedEffort) : null,
      businessValue: v.businessValue ? Number(v.businessValue) : null,
    } as Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'changeLog'>);
    addToast('success', '需求创建成功');
    router.push(`/requirements/${id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">新建需求</h1>
      <RequirementForm onSubmit={handleSubmit} onCancel={() => router.push('/requirements')} />
    </div>
  );
}
