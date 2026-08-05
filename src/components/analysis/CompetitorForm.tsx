'use client';

import { useState } from 'react';
import { Input, Textarea, Select, Button } from '@/components/ui';
import { TagInput } from '@/components/common/TagInput';
import { COMPETITOR_TYPE } from '@/lib/constants';
import type { Competitor } from '@/lib/types';

export interface CompetitorFormValues {
  name: string;
  description: string;
  website: string;
  type: Competitor['type'];
  targetUsers: string;
  pricing: string;
  fundingStage: string;
  foundedYear: string;
  marketShare: string;
  strengths: string[];
  weaknesses: string[];
  tags: string[];
  notes: string;
}

const empty: CompetitorFormValues = {
  name: '',
  description: '',
  website: '',
  type: 'direct',
  targetUsers: '',
  pricing: '',
  fundingStage: '',
  foundedYear: '',
  marketShare: '',
  strengths: [],
  weaknesses: [],
  tags: [],
  notes: '',
};

export function CompetitorForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<CompetitorFormValues>;
  onSubmit: (v: CompetitorFormValues) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<CompetitorFormValues>({ ...empty, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof CompetitorFormValues>(k: K, val: CompetitorFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!v.name.trim()) e.name = '请填写竞品名称';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit(v);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">名称 *</label>
          <Input value={v.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">类型</label>
          <Select
            value={v.type}
            onChange={(e) => set('type', e.target.value as Competitor['type'])}
            options={Object.entries(COMPETITOR_TYPE).map(([val, lbl]) => ({ value: val, label: lbl }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">官网</label>
          <Input value={v.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">目标用户</label>
          <Input value={v.targetUsers} onChange={(e) => set('targetUsers', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">定价</label>
          <Input value={v.pricing} onChange={(e) => set('pricing', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">融资阶段</label>
          <Input value={v.fundingStage} onChange={(e) => set('fundingStage', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">成立年份</label>
          <Input type="number" value={v.foundedYear} onChange={(e) => set('foundedYear', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">市场份额(%)</label>
          <Input type="number" value={v.marketShare} onChange={(e) => set('marketShare', e.target.value)} />
        </div>
      </div>

      <Textarea value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="竞品描述" rows={2} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">优势</label>
          <TagInput value={v.strengths} onChange={(s) => set('strengths', s)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">劣势</label>
          <TagInput value={v.weaknesses} onChange={(w) => set('weaknesses', w)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">标签</label>
        <TagInput value={v.tags} onChange={(t) => set('tags', t)} />
      </div>

      <Textarea value={v.notes} onChange={(e) => set('notes', e.target.value)} placeholder="备注" rows={2} />

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
