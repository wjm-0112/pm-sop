'use client';

import { useRouter } from 'next/navigation';
import { MarketResearchForm, type MarketResearchFormValues } from '@/components/analysis/MarketResearchForm';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { useUIStore } from '@/stores/useUIStore';
import { toDate } from '@/lib/utils';
import type { MarketResearch } from '@/lib/types';

export default function NewMarketResearchPage() {
  const router = useRouter();
  const create = useAnalysisStore((s) => s.createMarketResearch);
  const addToast = useUIStore((s) => s.addToast);

  const submit = async (v: MarketResearchFormValues) => {
    await create({
      title: v.title,
      content: v.content,
      category: v.category,
      source: v.source || null,
      sourceUrl: v.sourceUrl || null,
      keyFindings: v.keyFindings,
      tags: v.tags,
      attachments: [],
      author: v.author,
      researchDate: toDate(v.researchDate) ?? new Date(),
    } as Omit<MarketResearch, 'id' | 'createdAt' | 'updatedAt'>);
    addToast('success', '调研记录已创建');
    router.push('/analysis/market-research');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">新增市场调研</h1>
      <MarketResearchForm
        onSubmit={submit}
        onCancel={() => router.push('/analysis/market-research')}
      />
    </div>
  );
}
