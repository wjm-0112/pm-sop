'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { VersionForm, type VersionFormValues } from '@/components/planning/VersionForm';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useUIStore } from '@/stores/useUIStore';
import { EmptyState, Button, LoadingSpinner } from '@/components/ui';
import { toDate } from '@/lib/utils';
import type { Version } from '@/lib/types';

export default function EditVersionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { versions, loadVersions, updateVersion } = usePlanningStore();
  const addToast = useUIStore((s) => s.addToast);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadVersions().then(() => setLoaded(true));
  }, [loadVersions]);

  const version = versions.find((v) => v.id === id);

  if (!loaded) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }
  if (!version) {
    return (
      <EmptyState
        title="版本不存在"
        action={
          <Link href="/planning/versions">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const initial: Partial<VersionFormValues> = {
    name: version.name,
    title: version.title,
    description: version.description,
    status: version.status,
    startDate: version.startDate.toISOString().slice(0, 10),
    endDate: version.endDate ? version.endDate.toISOString().slice(0, 10) : '',
    releaseDate: version.releaseDate ? version.releaseDate.toISOString().slice(0, 10) : '',
    goals: version.goals,
  };

  const submit = async (v: VersionFormValues) => {
    await updateVersion(version.id, {
      name: v.name,
      title: v.title,
      description: v.description,
      status: v.status,
      startDate: toDate(v.startDate) ?? version.startDate,
      endDate: toDate(v.endDate),
      releaseDate: toDate(v.releaseDate),
      goals: v.goals,
    } as Partial<Version>);
    addToast('success', '版本已更新');
    router.push(`/planning/versions/${version.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">编辑版本</h1>
      <VersionForm
        initial={initial}
        onSubmit={submit}
        onCancel={() => router.push(`/planning/versions/${version.id}`)}
      />
    </div>
  );
}
