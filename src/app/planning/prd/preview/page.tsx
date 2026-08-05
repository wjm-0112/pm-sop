'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { Card, Button, LoadingSpinner, EmptyState, Badge } from '@/components/ui';
import { PRD_STATUS, STATUS_COLOR } from '@/lib/constants';
import { fromNow } from '@/lib/utils';

function PRDPreviewPage() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { prds, loadPrds } = usePlanningStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPrds().then(() => setLoaded(true));
  }, [loadPrds]);

  const prd = prds.find((p) => p.id === id);

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

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/planning/prd" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> 返回
        </Link>
        <Link href={`/planning/prd/edit?id=${prd.id}`}>
          <Button variant="outline" size="sm">
            <Edit size={16} /> 编辑
          </Button>
        </Link>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Badge className={STATUS_COLOR[prd.status]}>{PRD_STATUS[prd.status]}</Badge>
          <span className="text-sm text-slate-500">v{prd.version} · 更新于 {fromNow(prd.updatedAt)}</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{prd.title}</h1>
      </div>

      <Card>
        <div className="prose-content" dangerouslySetInnerHTML={{ __html: prd.content }} />
      </Card>
    </div>
  );
}


export default function PRDPreviewPageWrap() {
  return (
    <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
      <PRDPreviewPage />
    </Suspense>
  );
}
