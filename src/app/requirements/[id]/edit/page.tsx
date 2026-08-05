'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RequirementForm, type RequirementFormValues } from '@/components/requirements/RequirementForm';
import { useRequirementStore } from '@/stores/useRequirementStore';
import { useUIStore } from '@/stores/useUIStore';
import { EmptyState, Button, LoadingSpinner } from '@/components/ui';
import { toDate, generateId } from '@/lib/utils';
import type { ChangeEntry, Requirement } from '@/lib/types';

const fieldLabels: Record<string, string> = {
  title: '标题',
  description: '描述',
  type: '类型',
  priority: '优先级',
  status: '状态',
  source: '来源',
  sourceDetail: '来源详情',
  assignee: '负责人',
  reviewer: '审核人',
  tags: '标签',
  versionId: '关联版本',
  parentId: '父需求',
  dueDate: '截止日期',
  estimatedEffort: '预估工作量',
  businessValue: '业务价值',
};

export default function EditRequirementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { items, load, update } = useRequirementStore();
  const addToast = useUIStore((s) => s.addToast);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load().then(() => setLoaded(true));
  }, [load]);

  const req = items.find((r) => r.id === id);

  if (!loaded) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!req) {
    return (
      <EmptyState
        title="需求不存在"
        action={
          <Link href="/requirements">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const initial: Partial<RequirementFormValues> = {
    title: req.title,
    description: req.description,
    type: req.type,
    priority: req.priority,
    status: req.status,
    source: req.source,
    sourceDetail: req.sourceDetail,
    assignee: req.assignee,
    reviewer: req.reviewer,
    tags: req.tags,
    parentId: req.parentId,
    versionId: req.versionId,
    dueDate: req.dueDate ? req.dueDate.toISOString().slice(0, 10) : '',
    estimatedEffort: req.estimatedEffort?.toString() ?? '',
    businessValue: req.businessValue?.toString() ?? '',
  };

  const handleSubmit = async (v: RequirementFormValues) => {
    const changes: Partial<Requirement> = {
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
      parentId: v.parentId,
      versionId: v.versionId,
      dueDate: toDate(v.dueDate),
      estimatedEffort: v.estimatedEffort ? Number(v.estimatedEffort) : null,
      businessValue: v.businessValue ? Number(v.businessValue) : null,
    };

    // 生成变更日志
    const newLog: ChangeEntry[] = [...req.changeLog];
    for (const [k, label] of Object.entries(fieldLabels)) {
      const oldV = (req as unknown as Record<string, unknown>)[k];
      const newV = (changes as Record<string, unknown>)[k];
      const oldStr = Array.isArray(oldV) ? oldV.join(',') : String(oldV ?? '');
      const newStr = Array.isArray(newV) ? (newV as unknown[]).join(',') : String(newV ?? '');
      if (oldStr !== newStr) {
        newLog.unshift({
          id: generateId(),
          field: label,
          oldValue: oldStr || '空',
          newValue: newStr || '空',
          changedBy: '我',
          changedAt: new Date(),
          reason: '编辑更新',
        });
      }
    }

    await update(req.id, { ...changes, changeLog: newLog });
    addToast('success', '需求已更新');
    router.push(`/requirements/${req.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">编辑需求</h1>
      <RequirementForm
        initial={initial}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/requirements/${req.id}`)}
      />
    </div>
  );
}
