'use client';

import { useState } from 'react';
import { Input, Select, Button, Card } from '@/components/ui';
import { TagInput } from '@/components/common/TagInput';
import { generateId } from '@/lib/utils';
import type { JourneyStage, Persona } from '@/lib/types';

export interface PersonaFormValues {
  name: string;
  role: string;
  avatar: string;
  demographics: {
    age: string;
    gender: string;
    occupation: string;
    education: string;
    location: string;
    income: string;
    techLevel: string;
  };
  goals: string[];
  painPoints: string[];
  behaviors: string[];
  motivations: string[];
  scenarios: string[];
  quotes: string[];
  journeyMap: JourneyStage[];
}

const emptyDemographics = {
  age: '',
  gender: '',
  occupation: '',
  education: '',
  location: '',
  income: '',
  techLevel: '',
};

const empty: PersonaFormValues = {
  name: '',
  role: '',
  avatar: '',
  demographics: { ...emptyDemographics },
  goals: [],
  painPoints: [],
  behaviors: [],
  motivations: [],
  scenarios: [],
  quotes: [],
  journeyMap: [],
};

const EMOTION_OPTIONS = [
  { value: 'positive', label: '😊 正向' },
  { value: 'neutral', label: '😐 中性' },
  { value: 'negative', label: '😟 负向' },
];

function newStage(sortOrder: number): JourneyStage {
  return {
    id: generateId(),
    stage: '',
    actions: [],
    thoughts: [],
    emotions: 'neutral',
    painPoints: [],
    opportunities: [],
    touchpoints: [],
    sortOrder,
  };
}

export function PersonaForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<PersonaFormValues>;
  onSubmit: (v: PersonaFormValues) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<PersonaFormValues>({ ...empty, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof PersonaFormValues>(k: K, val: PersonaFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const setDemo = (k: keyof PersonaFormValues['demographics'], val: string) =>
    setV((p) => ({ ...p, demographics: { ...p.demographics, [k]: val } }));

  const updateStage = (idx: number, patch: Partial<JourneyStage>) =>
    setV((p) => ({
      ...p,
      journeyMap: p.journeyMap.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));

  const setStageArray = (idx: number, key: keyof JourneyStage, val: string[]) =>
    updateStage(idx, { [key]: val } as Partial<JourneyStage>);

  const addStage = () => setV((p) => ({ ...p, journeyMap: [...p.journeyMap, newStage(p.journeyMap.length)] }));

  const removeStage = (idx: number) =>
    setV((p) => ({ ...p, journeyMap: p.journeyMap.filter((_, i) => i !== idx) }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!v.name.trim()) e.name = '请填写画像名称';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit(v);
  };

  const demoFields: { key: keyof PersonaFormValues['demographics']; label: string; placeholder?: string }[] = [
    { key: 'age', label: '年龄', placeholder: '如 25-34' },
    { key: 'gender', label: '性别' },
    { key: 'occupation', label: '职业' },
    { key: 'education', label: '学历' },
    { key: 'location', label: '所在地' },
    { key: 'income', label: '收入' },
    { key: 'techLevel', label: '技术水平', placeholder: '如 熟练 / 入门' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">名称 *</label>
          <Input value={v.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">角色</label>
          <Input value={v.role} onChange={(e) => set('role', e.target.value)} placeholder="如 决策者" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">头像链接</label>
          <Input value={v.avatar} onChange={(e) => set('avatar', e.target.value)} placeholder="https://" />
        </div>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">人口统计</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demoFields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
              <Input
                value={v.demographics[f.key]}
                onChange={(e) => setDemo(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <label className="mb-2 block text-sm font-medium text-slate-700">目标</label>
          <TagInput value={v.goals} onChange={(s) => set('goals', s)} />
        </Card>
        <Card>
          <label className="mb-2 block text-sm font-medium text-slate-700">痛点</label>
          <TagInput value={v.painPoints} onChange={(s) => set('painPoints', s)} />
        </Card>
        <Card>
          <label className="mb-2 block text-sm font-medium text-slate-700">行为</label>
          <TagInput value={v.behaviors} onChange={(s) => set('behaviors', s)} />
        </Card>
        <Card>
          <label className="mb-2 block text-sm font-medium text-slate-700">动机</label>
          <TagInput value={v.motivations} onChange={(s) => set('motivations', s)} />
        </Card>
        <Card>
          <label className="mb-2 block text-sm font-medium text-slate-700">场景</label>
          <TagInput value={v.scenarios} onChange={(s) => set('scenarios', s)} />
        </Card>
        <Card>
          <label className="mb-2 block text-sm font-medium text-slate-700">金句</label>
          <TagInput value={v.quotes} onChange={(s) => set('quotes', s)} />
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">用户旅程地图</h3>
          <Button variant="outline" size="sm" onClick={addStage}>
            + 添加阶段
          </Button>
        </div>
        {v.journeyMap.length === 0 ? (
          <p className="text-sm text-slate-400">尚未添加旅程阶段，点击右上角添加。</p>
        ) : (
          <div className="space-y-4">
            {v.journeyMap.map((stage, idx) => (
              <div key={stage.id} className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Input
                    value={stage.stage}
                    onChange={(e) => updateStage(idx, { stage: e.target.value })}
                    placeholder={`阶段 ${idx + 1} 名称`}
                    className="max-w-xs"
                  />
                  <Select
                    value={stage.emotions}
                    onChange={(e) => updateStage(idx, { emotions: e.target.value as JourneyStage['emotions'] })}
                    options={EMOTION_OPTIONS}
                  />
                  <Button variant="danger" size="sm" onClick={() => removeStage(idx)}>
                    删除
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">行为</label>
                    <TagInput value={stage.actions} onChange={(s) => setStageArray(idx, 'actions', s)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">想法</label>
                    <TagInput value={stage.thoughts} onChange={(s) => setStageArray(idx, 'thoughts', s)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">痛点</label>
                    <TagInput value={stage.painPoints} onChange={(s) => setStageArray(idx, 'painPoints', s)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">机会点</label>
                    <TagInput value={stage.opportunities} onChange={(s) => setStageArray(idx, 'opportunities', s)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">触点</label>
                    <TagInput value={stage.touchpoints} onChange={(s) => setStageArray(idx, 'touchpoints', s)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

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
