'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, AlertTriangle } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { Card, Button, EmptyState, LoadingSpinner, Modal, Input, Textarea, Select } from '@/components/ui';
import { useUIStore } from '@/stores/useUIStore';
import { RISK_CATEGORY, RISK_LEVEL, RISK_LEVEL_COLOR, RISK_STATUS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Risk } from '@/lib/types';

const PROB_ORDER = ['low', 'medium', 'high', 'critical'];
const IMPACT_ORDER = ['low', 'medium', 'high', 'critical'];

// 风险等级 = 概率 × 影响 的综合评分
function riskScore(p: string, i: string): number {
  return (PROB_ORDER.indexOf(p) + 1) * (IMPACT_ORDER.indexOf(i) + 1);
}
function scoreColor(score: number): string {
  if (score >= 12) return 'bg-red-100 border-red-400 text-red-700';
  if (score >= 6) return 'bg-orange-100 border-orange-400 text-orange-700';
  if (score >= 3) return 'bg-yellow-100 border-yellow-400 text-yellow-700';
  return 'bg-green-100 border-green-400 text-green-700';
}

export default function RisksPage() {
  const { risks, isLoading, loadAll, createRisk } = useProjectStore();
  const addToast = useUIStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'technical',
    probability: 'medium',
    impact: 'medium',
    mitigation: '',
    contingency: '',
    owner: '',
  });

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  const submit = async () => {
    if (!form.title.trim()) {
      addToast('error', '请填写风险标题');
      return;
    }
    await createRisk({
      title: form.title,
      description: form.description,
      category: form.category as Risk['category'],
      probability: form.probability as Risk['probability'],
      impact: form.impact as Risk['impact'],
      status: 'identified',
      mitigation: form.mitigation,
      contingency: form.contingency,
      owner: form.owner,
      relatedTaskIds: [],
      relatedRequirementIds: [],
      identifiedAt: new Date(),
      resolvedAt: null,
    });
    addToast('success', '风险已登记');
    setOpen(false);
    setForm({
      title: '',
      description: '',
      category: 'technical',
      probability: 'medium',
      impact: 'medium',
      mitigation: '',
      contingency: '',
      owner: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">风险矩阵</h1>
          <p className="text-sm text-slate-500">共 {risks.length} 个风险</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> 登记风险
        </Button>
      </div>

      {risks.length === 0 ? (
        <EmptyState
          title="暂无风险"
          description="登记项目风险并进行评估"
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> 登记风险
            </Button>
          }
        />
      ) : (
        <>
          {/* 二维矩阵 */}
          <Card className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs text-slate-400">概率 \ 影响</th>
                  {IMPACT_ORDER.map((imp) => (
                    <th key={imp} className="p-2 text-center text-xs font-medium text-slate-600">
                      {RISK_LEVEL[imp as keyof typeof RISK_LEVEL]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROB_ORDER.map((prob) => (
                  <tr key={prob}>
                    <td className="p-2 text-xs font-medium text-slate-600">
                      {RISK_LEVEL[prob as keyof typeof RISK_LEVEL]}
                    </td>
                    {IMPACT_ORDER.map((imp) => {
                      const cellRisks = risks.filter((r) => r.probability === prob && r.impact === imp);
                      const score = riskScore(prob, imp);
                      return (
                        <td key={imp} className="border border-border p-1">
                          <div
                            className={`flex min-h-[56px] flex-col items-center justify-center rounded border p-1 text-xs ${scoreColor(score)}`}
                          >
                            <span className="font-bold">{cellRisks.length}</span>
                            {cellRisks.slice(0, 1).map((r) => (
                              <Link key={r.id} href={`/projects/risks/${r.id}`} className="truncate text-[10px] underline">
                                {r.title.slice(0, 8)}
                              </Link>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* 风险列表 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {risks.map((r) => (
              <Link key={r.id} href={`/projects/risks/${r.id}`}>
                <Card className="h-full">
                  <div className="mb-1 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-warning" />
                    <span className="truncate font-medium text-slate-800">{r.title}</span>
                  </div>
                  <div className="flex gap-1">
                    <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${RISK_LEVEL_COLOR[r.probability]}`}>
                      概率:{RISK_LEVEL[r.probability]}
                    </span>
                    <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${RISK_LEVEL_COLOR[r.impact]}`}>
                      影响:{RISK_LEVEL[r.impact]}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="登记风险"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={submit}>保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="风险标题" />
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="风险描述" rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={Object.entries(RISK_CATEGORY).map(([v, l]) => ({ value: v, label: l }))}
            />
            <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="负责人" />
            <Select
              value={form.probability}
              onChange={(e) => setForm({ ...form, probability: e.target.value })}
              options={PROB_ORDER.map((p) => ({ value: p, label: '概率:' + RISK_LEVEL[p as keyof typeof RISK_LEVEL] }))}
            />
            <Select
              value={form.impact}
              onChange={(e) => setForm({ ...form, impact: e.target.value })}
              options={IMPACT_ORDER.map((i) => ({ value: i, label: '影响:' + RISK_LEVEL[i as keyof typeof RISK_LEVEL] }))}
            />
          </div>
          <Textarea value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })} placeholder="缓解措施" rows={2} />
          <Textarea value={form.contingency} onChange={(e) => setForm({ ...form, contingency: e.target.value })} placeholder="应急预案" rows={2} />
        </div>
      </Modal>
    </div>
  );
}
