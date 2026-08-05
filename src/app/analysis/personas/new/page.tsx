'use client';

import { useRouter } from 'next/navigation';
import { PersonaForm, type PersonaFormValues } from '@/components/analysis/PersonaForm';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { useUIStore } from '@/stores/useUIStore';
import type { Persona } from '@/lib/types';

export default function NewPersonaPage() {
  const router = useRouter();
  const create = useAnalysisStore((s) => s.createPersona);
  const addToast = useUIStore((s) => s.addToast);

  const submit = async (v: PersonaFormValues) => {
    await create({
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
    } as Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>);
    addToast('success', '用户画像已创建');
    router.push('/analysis/personas');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">新增用户画像</h1>
      <PersonaForm onSubmit={submit} onCancel={() => router.push('/analysis/personas')} />
    </div>
  );
}
