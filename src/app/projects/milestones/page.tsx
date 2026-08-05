'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Flag } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { Card, Button, EmptyState, LoadingSpinner, Modal, Input, Textarea, Select, Badge } from '@/components/ui';
import { TagInput } from '@/components/common/TagInput';
import { MILESTONE_STATUS, STATUS_COLOR } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';
import type { Milestone } from '@/lib/types';

export default function MilestonesPage() {
  const { milestones, isLoading, loadAll, createMilestone } = useProjectStore();
  const addToast = useUIStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', status: 'pending', deliverables: [] as string[] });

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  const sorted = [...milestones].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const submit = async () => {
    if (!form.title.trim()) {
      addToast('error', '请填写里程碑标题');
      return;
    }
    await createMilestone({
      title: form.title,
      description: form.description,
      dueDate: form.dueDate ? new Date(form.dueDate) : new Date(),
      completedDate: null,
      status: form.status as Milestone['status'],
      versionId: null,
      taskIds: [],
      deliverables: form.deliverables,
    });
    addToast('success', '里程碑创建成功');
    setOpen(false);
    setForm({ title: '', description: '', dueDate: '', status: 'pending', deliverables: [] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">里程碑</h1>
          <p className="text-sm text-slate-500">共 {milestones.length} 个里程碑</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> 新建里程碑
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="暂无里程碑"
          description="创建里程碑以跟踪关键节点"
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> 新建里程碑
            </Button>
          }
        />
      ) : (
        <div className="relative space-y-4 pl-6">
          <div className="absolute bottom-0 left-[11px] top-2 w-0.5 bg-border" />
          {sorted.map((m) => (
            <Link key={m.id} href={`/projects/milestones/detail?id=${m.id}`}>
              <div className="relative">
                <div className="absolute -left-[23px] top-4 h-3 w-3 rounded-full border-2 border-primary bg-surface" />
                <Card className="hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{m.title}</span>
                    <Badge className={STATUS_COLOR[m.status]}>{MILESTONE_STATUS[m.status]}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{formatDate(m.dueDate)}</div>
                  {m.deliverables.length > 0 && (
                    <div className="mt-2 text-xs text-slate-400">
                      交付物 {m.deliverables.length} 项
                    </div>
                  )}
                </Card>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="新建里程碑"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={submit}>保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="里程碑标题"
          />
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="描述"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-700">截止日期</label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">状态</label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={Object.entries(MILESTONE_STATUS).map(([v, l]) => ({ value: v, label: l }))}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">交付物</label>
            <TagInput value={form.deliverables} onChange={(d) => setForm({ ...form, deliverables: d })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
