'use client';

import { useState } from 'react';
import { Input, Textarea, Select, Button } from '@/components/ui';
import { TagInput } from '@/components/common/TagInput';
import { VERSION_STATUS } from '@/lib/constants';
import type { Version } from '@/lib/types';

export interface VersionFormValues {
  name: string;
  title: string;
  description: string;
  status: Version['status'];
  startDate: string;
  endDate: string;
  releaseDate: string;
  goals: string[];
}

const empty: VersionFormValues = {
  name: '',
  title: '',
  description: '',
  status: 'planned',
  startDate: '',
  endDate: '',
  releaseDate: '',
  goals: [],
};

export function VersionForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<VersionFormValues>;
  onSubmit: (v: VersionFormValues) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<VersionFormValues>({ ...empty, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof VersionFormValues>(k: K, val: VersionFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!v.name.trim()) e.name = '请填写版本号';
    if (!v.title.trim()) e.title = '请填写版本名称';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit(v);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">版本号 *</label>
          <Input value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="v2.1.0" />
          {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">版本名称 *</label>
          <Input value={v.title} onChange={(e) => set('title', e.target.value)} />
          {errors.title && <p className="mt-1 text-xs text-error">{errors.title}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">状态</label>
          <Select
            value={v.status}
            onChange={(e) => set('status', e.target.value as Version['status'])}
            options={Object.entries(VERSION_STATUS).map(([val, lbl]) => ({ value: val, label: lbl }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">开始日期</label>
          <Input type="date" value={v.startDate} onChange={(e) => set('startDate', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">结束日期</label>
          <Input type="date" value={v.endDate} onChange={(e) => set('endDate', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">实际发布日期</label>
          <Input type="date" value={v.releaseDate} onChange={(e) => set('releaseDate', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">描述</label>
        <Textarea value={v.description} onChange={(e) => set('description', e.target.value)} rows={3} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">版本目标</label>
        <TagInput value={v.goals} onChange={(g) => set('goals', g)} placeholder="输入目标后回车" />
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
