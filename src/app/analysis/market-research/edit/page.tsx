'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MarketResearchForm, type MarketResearchFormValues } from '@/components/analysis/MarketResearchForm';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { useUIStore } from '@/stores/useUIStore';
import { EmptyState, Button, LoadingSpinner } from '@/components/ui';
import { toDate } from '@/lib/utils';
import type { MarketResearch } from '@/lib/types';

function EditMarketResearchPage() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { marketResearch, loadAll, updateMarketResearch } = useAnalysisStore();
  const addToast = useUIStore((s) => s.addToast);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAll().then(() => setLoaded(true));
  }, [loadAll]);

  const m = marketResearch.find((x) => x.id === id);

  if (!loaded) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!m) {
    return (
      <EmptyState
        title="调研记录不存在"
        action={
          <Link href="/analysis/market-research">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const initial: Partial<MarketResearchFormValues> = {
    title: m.title,
    category: m.category,
    author: m.author,
    source: m.source ?? '',
    sourceUrl: m.sourceUrl ?? '',
    researchDate: m.researchDate.toISOString().slice(0, 10),
    keyFindings: m.keyFindings,
    tags: m.tags,
    content: m.content,
  };

  const submit = async (v: MarketResearchFormValues) => {
    const changes: Partial<MarketResearch> = {
      title: v.title,
      content: v.content,
      category: v.category,
      source: v.source || null,
      sourceUrl: v.sourceUrl || null,
      keyFindings: v.keyFindings,
      tags: v.tags,
      author: v.author,
      researchDate: toDate(v.researchDate) ?? m.researchDate,
    };
    await updateMarketResearch(m.id, changes);
    addToast('success', '调研记录已更新');
    router.push(`/analysis/market-research/detail?id=${m.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">编辑调研记录</h1>
      <MarketResearchForm
        initial={initial}
        onSubmit={submit}
        onCancel={() => router.push(`/analysis/market-research/detail?id=${m.id}`)}
      />
    </div>
  );
}


export default function EditMarketResearchPageWrap() {
  return (
    <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
      <EditMarketResearchPage />
    </Suspense>
  );
}
