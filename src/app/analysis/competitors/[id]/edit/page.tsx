'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CompetitorForm, type CompetitorFormValues } from '@/components/analysis/CompetitorForm';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { useUIStore } from '@/stores/useUIStore';
import { EmptyState, Button, LoadingSpinner } from '@/components/ui';
import type { Competitor } from '@/lib/types';

export default function EditCompetitorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { competitors, loadAll, updateCompetitor } = useAnalysisStore();
  const addToast = useUIStore((s) => s.addToast);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAll().then(() => setLoaded(true));
  }, [loadAll]);

  const c = competitors.find((x) => x.id === id);

  if (!loaded) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!c) {
    return (
      <EmptyState
        title="竞品不存在"
        action={
          <Link href="/analysis/competitors">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const initial: Partial<CompetitorFormValues> = {
    name: c.name,
    description: c.description,
    website: c.website ?? '',
    type: c.type,
    targetUsers: c.targetUsers,
    pricing: c.pricing ?? '',
    fundingStage: c.fundingStage ?? '',
    foundedYear: c.foundedYear != null ? String(c.foundedYear) : '',
    marketShare: c.marketShare != null ? String(c.marketShare) : '',
    strengths: c.strengths,
    weaknesses: c.weaknesses,
    tags: c.tags,
    notes: c.notes,
  };

  const submit = async (v: CompetitorFormValues) => {
    const changes: Partial<Competitor> = {
      name: v.name,
      description: v.description,
      website: v.website || null,
      type: v.type,
      targetUsers: v.targetUsers,
      pricing: v.pricing || null,
      fundingStage: v.fundingStage || null,
      foundedYear: v.foundedYear ? Number(v.foundedYear) : null,
      marketShare: v.marketShare ? Number(v.marketShare) : null,
      strengths: v.strengths,
      weaknesses: v.weaknesses,
      tags: v.tags,
      notes: v.notes,
    };
    await updateCompetitor(c.id, changes);
    addToast('success', '竞品已更新');
    router.push(`/analysis/competitors/${c.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">编辑竞品</h1>
      <CompetitorForm
        initial={initial}
        onSubmit={submit}
        onCancel={() => router.push(`/analysis/competitors/${c.id}`)}
      />
    </div>
  );
}
