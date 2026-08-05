'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input, Select, Button, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { PRDEditor } from '@/components/planning/PRDEditor';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useUIStore } from '@/stores/useUIStore';
import { PRD_STATUS } from '@/lib/constants';
import type { PRDDocument } from '@/lib/types';

function EditPRDPage() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { prds, loadPrds, updatePrd, versions, loadVersions } = usePlanningStore();
  const addToast = useUIStore((s) => s.addToast);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<PRDDocument['status']>('draft');
  const [content, setContent] = useState('');
  const [versionId, setVersionId] = useState('');

  useEffect(() => {
    Promise.all([loadPrds(), loadVersions()]).then(() => setLoaded(true));
  }, [loadPrds, loadVersions]);

  const prd = prds.find((p) => p.id === id);

  useEffect(() => {
    if (prd) {
      setTitle(prd.title);
      setStatus(prd.status);
      setContent(prd.content);
      setVersionId(prd.relatedVersionId ?? '');
    }
  }, [prd]);

  if (!loaded) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }
  if (!prd) {
    return (
      <EmptyState
        title="PRD 不存在"
        action={
          <Link href="/planning/prd">
            <Button>返回</Button>
          </Link>
        }
      />
    );
  }

  const submit = async () => {
    await updatePrd(prd.id, {
      title,
      status,
      content,
      relatedVersionId: versionId || null,
    } as Partial<PRDDocument>);
    addToast('success', 'PRD 已保存');
    router.push(`/planning/prd/edit?id=${prd.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">编辑 PRD</h1>
        <Link href={`/planning/prd/preview?id=${prd.id}`} className="text-sm text-primary">
          预览
        </Link>
      </div>
      <Card className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="PRD 标题" />
          </div>
          <div>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as PRDDocument['status'])}
              options={Object.entries(PRD_STATUS).map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              value={versionId}
              onChange={(e) => setVersionId(e.target.value)}
              placeholder="未关联版本"
              options={versions.map((v) => ({ value: v.id, label: v.name }))}
            />
          </div>
        </div>
      </Card>
      <PRDEditor value={content} onChange={setContent} />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/planning/prd')}>
          取消
        </Button>
        <Button onClick={submit}>保存</Button>
      </div>
    </div>
  );
}


export default function EditPRDPageWrap() {
  return (
    <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
      <EditPRDPage />
    </Suspense>
  );
}
