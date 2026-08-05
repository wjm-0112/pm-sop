'use client';

import { useState, useEffect } from 'react';
import { Input, Textarea, Select, Button } from '@/components/ui';
import { TagInput } from '@/components/common/TagInput';
import {
  REQUIREMENT_STATUS,
  REQUIREMENT_PRIORITY,
  REQUIREMENT_TYPE,
  REQUIREMENT_SOURCE,
} from '@/lib/constants';
import type { Requirement } from '@/lib/types';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useRequirementStore } from '@/stores/useRequirementStore';

export interface RequirementFormValues {
  title: string;
  description: string;
  type: Requirement['type'];
  priority: Requirement['priority'];
  status: Requirement['status'];
  source: Requirement['source'];
  sourceDetail: string;
  assignee: string;
  reviewer: string;
  tags: string[];
  parentId: string | null;
  versionId: string | null;
  dueDate: string;
  estimatedEffort: string;
  businessValue: string;
}

const emptyValues: RequirementFormValues = {
  title: '',
  description: '',
  type: 'feature',
  priority: 'P1',
  status: 'draft',
  source: 'internal',
  sourceDetail: '',
  assignee: '',
  reviewer: '',
  tags: [],
  parentId: null,
  versionId: null,
  dueDate: '',
  estimatedEffort: '',
  businessValue: '',
};

export function RequirementForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<RequirementFormValues>;
  onSubmit: (values: RequirementFormValues) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<RequirementFormValues>({ ...emptyValues, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const versions = usePlanningStore((s) => s.versions);
  const requirements = useRequirementStore((s) => s.items);
  const loadVersions = usePlanningStore((s) => s.loadVersions);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const set = <K extends keyof RequirementFormValues>(k: K, v: RequirementFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!values.title.trim()) e.title = '请填写需求标题';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit(values);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">标题 *</label>
        <Input
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="一句话描述需求"
        />
        {errors.title && <p className="mt-1 text-xs text-error">{errors.title}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">描述</label>
        <Textarea
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          placeholder="需求背景、详细内容…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">类型</label>
          <Select
            value={values.type}
            onChange={(e) => set('type', e.target.value as RequirementFormValues['type'])}
            options={Object.entries(REQUIREMENT_TYPE).map(([v, l]) => ({ value: v, label: l }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">优先级</label>
          <Select
            value={values.priority}
            onChange={(e) => set('priority', e.target.value as RequirementFormValues['priority'])}
            options={Object.entries(REQUIREMENT_PRIORITY).map(([v, l]) => ({ value: v, label: l }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">状态</label>
          <Select
            value={values.status}
            onChange={(e) => set('status', e.target.value as RequirementFormValues['status'])}
            options={Object.entries(REQUIREMENT_STATUS).map(([v, l]) => ({ value: v, label: l }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">来源</label>
          <Select
            value={values.source}
            onChange={(e) => set('source', e.target.value as RequirementFormValues['source'])}
            options={Object.entries(REQUIREMENT_SOURCE).map(([v, l]) => ({ value: v, label: l }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">负责人</label>
          <Input value={values.assignee} onChange={(e) => set('assignee', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">审核人</label>
          <Input value={values.reviewer} onChange={(e) => set('reviewer', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">截止日期</label>
          <Input
            type="date"
            value={values.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">预估工作量(人天)</label>
          <Input
            type="number"
            value={values.estimatedEffort}
            onChange={(e) => set('estimatedEffort', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">业务价值(1-10)</label>
          <Input
            type="number"
            value={values.businessValue}
            onChange={(e) => set('businessValue', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">关联版本</label>
          <Select
            value={values.versionId ?? ''}
            onChange={(e) => set('versionId', e.target.value || null)}
            placeholder="未关联"
            options={versions.map((v) => ({ value: v.id, label: v.name }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">父需求</label>
          <Select
            value={values.parentId ?? ''}
            onChange={(e) => set('parentId', e.target.value || null)}
            placeholder="无（顶级需求）"
            options={requirements
              .filter((r) => r.id !== initial?.title)
              .map((r) => ({ value: r.id, label: r.title }))}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">标签</label>
        <TagInput value={values.tags} onChange={(t) => set('tags', t)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button onClick={handleSubmit}>保存</Button>
      </div>
    </div>
  );
}
