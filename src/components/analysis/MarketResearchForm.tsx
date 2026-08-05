'use client';

import { useState } from 'react';
import { Input, Textarea, Button } from '@/components/ui';
import { TagInput } from '@/components/common/TagInput';
import type { MarketResearch } from '@/lib/types';

export interface MarketResearchFormValues {
  title: string;
  category: string;
  author: string;
  source: string;
  sourceUrl: string;
  researchDate: string;
  keyFindings: string[];
  tags: string[];
  content: string;
}

const empty: MarketResearchFormValues = {
  title: '',
  category: '',
  author: '',
  source: '',
  sourceUrl: '',
  researchDate: new Date().toISOString().slice(0, 10),
  keyFindings: [],
  tags: [],
  content: '',
};

export function MarketResearchForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<MarketResearchFormValues>;
  onSubmit: (v: MarketResearchFormValues) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<MarketResearchFormValues>({ ...empty, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof MarketResearchFormValues>(k: K, val: MarketResearchFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!v.title.trim()) e.title = '请填写标题';
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">分类</label>
          <Input
            value={v.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="如：行业趋势 / 用户研究"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">作者</label>
          <Input value={v.author} onChange={(e) => set('author', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">来源</label>
          <Input value={v.source} onChange={(e) => set('source', e.target.value)} placeholder="机构 / 报告名" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">来源链接</label>
          <Input value={v.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} placeholder="https://" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">调研日期</label>
          <Input type="date" value={v.researchDate} onChange={(e) => set('researchDate', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">关键发现</label>
        <TagInput value={v.keyFindings} onChange={(s) => set('keyFindings', s)} placeholder="逐条添加关键结论" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">标签</label>
        <TagInput value={v.tags} onChange={(t) => set('tags', t)} />
      </div>

      <Textarea
        value={v.content}
        onChange={(e) => set('content', e.target.value)}
        placeholder="调研详情、方法与结论"
        rows={6}
      />

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
