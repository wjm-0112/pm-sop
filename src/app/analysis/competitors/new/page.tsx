'use client';

import { useRouter } from 'next/navigation';
import { CompetitorForm, type CompetitorFormValues } from '@/components/analysis/CompetitorForm';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { useUIStore } from '@/stores/useUIStore';
import type { Competitor } from '@/lib/types';

export default function NewCompetitorPage() {
  const router = useRouter();
  const create = useAnalysisStore((s) => s.createCompetitor);
  const addToast = useUIStore((s) => s.addToast);

  const submit = async (v: CompetitorFormValues) => {
    await create({
      name: v.name,
      description: v.description,
      website: v.website || null,
      logo: null,
      type: v.type,
      strengths: v.strengths,
      weaknesses: v.weaknesses,
      features: [],
      marketShare: v.marketShare ? Number(v.marketShare) : null,
      targetUsers: v.targetUsers,
      pricing: v.pricing || null,
      fundingStage: v.fundingStage || null,
      foundedYear: v.foundedYear ? Number(v.foundedYear) : null,
      tags: v.tags,
      notes: v.notes,
    } as Omit<Competitor, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>);
    addToast('success', '竞品创建成功');
    router.push('/analysis/competitors');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">新增竞品</h1>
      <CompetitorForm onSubmit={submit} onCancel={() => router.push('/analysis/competitors')} />
    </div>
  );
}
