'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PersonaForm, type PersonaFormValues } from '@/components/analysis/PersonaForm';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { useUIStore } from '@/stores/useUIStore';
import { EmptyState, Button, LoadingSpinner } from '@/components/ui';
import type { JourneyStage, Persona } from '@/lib/types';

export default function EditPersonaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { personas, loadAll, updatePersona } = useAnalysisStore();
  const addToast = useUIStore((s) => s.addToast);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAll().then(() => setLoaded(true));
  }, [loadAll]);

  const p = personas.find((x) => x.id === id);

  if (!loaded) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!p) {
    return (
      <EmptyState
        title="用户画像不存在"
        action={
          <Link href="/analysis/personas">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const initial: Partial<PersonaFormValues> = {
    name: p.name,
    role: p.role,
    avatar: p.avatar ?? '',
    demographics: { ...p.demographics },
    goals: p.goals,
    painPoints: p.painPoints,
    behaviors: p.behaviors,
    motivations: p.motivations,
    scenarios: p.scenarios,
    quotes: p.quotes,
    journeyMap: p.journeyMap as JourneyStage[],
  };

  const submit = async (v: PersonaFormValues) => {
    const changes: Partial<Persona> = {
      name: v.name,
      role: v.role,
      avatar: v.avatar || null,
      demographics: v.demographics,
      goals: v.goals,
      painPoints: v.painPoints,
      behaviors: v.behaviors,
      motivations: v.motivations,
      scenarios: v.scenarios,
      quotes: v.quotes,
      journeyMap: v.journeyMap,
    };
    await updatePersona(p.id, changes);
    addToast('success', '用户画像已更新');
    router.push(`/analysis/personas/${p.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">编辑用户画像</h1>
      <PersonaForm
        initial={initial}
        onSubmit={submit}
        onCancel={() => router.push(`/analysis/personas/${p.id}`)}
      />
    </div>
  );
}
