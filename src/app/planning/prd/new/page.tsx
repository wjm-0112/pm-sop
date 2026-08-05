'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select, Button, Card } from '@/components/ui';
import { PRDEditor } from '@/components/planning/PRDEditor';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useUIStore } from '@/stores/useUIStore';
import { PRD_STATUS } from '@/lib/constants';
import type { PRDDocument } from '@/lib/types';

export default function NewPRDPage() {
  const router = useRouter();
  const create = usePlanningStore((s) => s.createPrd);
  const versions = usePlanningStore((s) => s.versions);
  const loadVersions = usePlanningStore((s) => s.loadVersions);
  const addToast = useUIStore((s) => s.addToast);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<PRDDocument['status']>('draft');
  const [content, setContent] = useState('');
  const [versionId, setVersionId] = useState('');

  useState(() => {
    loadVersions();
  });

  const submit = async () => {
    if (!title.trim()) {
      addToast('error', '请填写 PRD 标题');
      return;
    }
    const id = await create({
      title,
      content,
      version: '1.0',
      status,
      relatedRequirementIds: [],
      relatedVersionId: versionId || null,
      attachments: [],
      author: '我',
      reviewers: [],
    } as Omit<PRDDocument, 'id' | 'createdAt' | 'updatedAt'>);
    addToast('success', 'PRD 创建成功');
    router.push(`/planning/prd/edit?id=${id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">新建 PRD</h1>
      <Card className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">标题</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="PRD 标题" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">状态</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as PRDDocument['status'])}
              options={Object.entries(PRD_STATUS).map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">关联版本</label>
            <Select
              value={versionId}
              onChange={(e) => setVersionId(e.target.value)}
              placeholder="未关联"
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
