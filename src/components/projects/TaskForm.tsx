'use client';

import { useState, useEffect } from 'react';
import { Input, Textarea, Select, Button } from '@/components/ui';
import { TagInput } from '@/components/common/TagInput';
import { TASK_STATUS, TASK_STATUS_ORDER, REQUIREMENT_PRIORITY } from '@/lib/constants';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useRequirementStore } from '@/stores/useRequirementStore';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Task } from '@/lib/types';

export interface TaskFormValues {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  assignee: string;
  requirementId: string | null;
  versionId: string | null;
  milestoneId: string | null;
  storyPoints: string;
  estimatedHours: string;
  dueDate: string;
  tags: string[];
}

const empty: TaskFormValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'P1',
  assignee: '',
  requirementId: null,
  versionId: null,
  milestoneId: null,
  storyPoints: '',
  estimatedHours: '',
  dueDate: '',
  tags: [],
};

export function TaskForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<TaskFormValues>;
  onSubmit: (v: TaskFormValues) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<TaskFormValues>({ ...empty, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const versions = usePlanningStore((s) => s.versions);
  const requirements = useRequirementStore((s) => s.items);
  const milestones = useProjectStore((s) => s.milestones);
  const loadVersions = usePlanningStore((s) => s.loadVersions);
  const loadReq = useRequirementStore((s) => s.load);
  const loadMilestones = useProjectStore((s) => s.loadAll);

  useEffect(() => {
    loadVersions();
    loadReq();
    loadMilestones();
  }, [loadVersions, loadReq, loadMilestones]);

  const set = <K extends keyof TaskFormValues>(k: K, val: TaskFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!v.title.trim()) e.title = '请填写任务标题';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit(v);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">标题 *</label>
        <Input value={v.title} onChange={(e) => set('title', e.target.value)} />
        {errors.title && <p className="mt-1 text-xs text-error">{errors.title}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">描述</label>
        <Textarea value={v.description} onChange={(e) => set('description', e.target.value)} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">状态</label>
          <Select
            value={v.status}
            onChange={(e) => set('status', e.target.value as Task['status'])}
            options={TASK_STATUS_ORDER.map((s) => ({ value: s, label: TASK_STATUS[s] }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">优先级</label>
          <Select
            value={v.priority}
            onChange={(e) => set('priority', e.target.value as Task['priority'])}
            options={Object.entries(REQUIREMENT_PRIORITY).map(([val, lbl]) => ({ value: val, label: lbl }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">负责人</label>
          <Input value={v.assignee} onChange={(e) => set('assignee', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">关联需求</label>
          <Select
            value={v.requirementId ?? ''}
            onChange={(e) => set('requirementId', e.target.value || null)}
            placeholder="无"
            options={requirements.map((r) => ({ value: r.id, label: r.title }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">关联版本</label>
          <Select
            value={v.versionId ?? ''}
            onChange={(e) => set('versionId', e.target.value || null)}
            placeholder="无"
            options={versions.map((ver) => ({ value: ver.id, label: ver.name }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">关联里程碑</label>
          <Select
            value={v.milestoneId ?? ''}
            onChange={(e) => set('milestoneId', e.target.value || null)}
            placeholder="无"
            options={milestones.map((m) => ({ value: m.id, label: m.title }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">故事点</label>
          <Input type="number" value={v.storyPoints} onChange={(e) => set('storyPoints', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">预估工时</label>
          <Input type="number" value={v.estimatedHours} onChange={(e) => set('estimatedHours', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">截止日期</label>
          <Input type="date" value={v.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">标签</label>
        <TagInput value={v.tags} onChange={(t) => set('tags', t)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button onClick={submit}>保存</Button>
      </div>
    </div>
  );
}
