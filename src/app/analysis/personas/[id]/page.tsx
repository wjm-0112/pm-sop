'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, ArrowLeft, User } from 'lucide-react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { Card, Button, LoadingSpinner, ConfirmDialog, EmptyState, Tag } from '@/components/ui';
import { useUIStore } from '@/stores/useUIStore';
import { formatDate, fromNow } from '@/lib/utils';
import type { JourneyStage } from '@/lib/types';

const EMOTION_LABEL: Record<JourneyStage['emotions'], { label: string; color: string }> = {
  positive: { label: '正向', color: 'bg-green-100 text-green-700' },
  neutral: { label: '中性', color: 'bg-slate-100 text-slate-600' },
  negative: { label: '负向', color: 'bg-red-100 text-red-700' },
};

export default function PersonaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { personas, loadAll, removePersona } = useAnalysisStore();
  const addToast = useUIStore((s) => s.addToast);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const p = personas.find((x) => x.id === id);

  if (!p && personas.length === 0) {
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
            <Button>返回列表</Button>
          </Link>
        }
      />
    );
  }

  const handleDelete = async () => {
    await removePersona(p.id);
    addToast('success', '用户画像已删除');
    router.push('/analysis/personas');
  };

  const demoEntries = Object.entries(p.demographics).filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/analysis/personas"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} /> 返回
        </Link>
        <div className="flex gap-2">
          <Link href={`/analysis/personas/${p.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit size={16} /> 编辑
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
            <Trash2 size={16} /> 删除
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {p.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatar} alt={p.name} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary">
            <User size={24} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
          <p className="text-sm text-slate-500">{p.role || '未设角色'}</p>
        </div>
      </div>

      {demoEntries.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">人口统计</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {demoEntries.map(([k, v]) => (
              <div key={k}>
                <div className="text-xs text-slate-400">{k}</div>
                <div className="text-sm font-medium capitalize text-slate-700">{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">目标</h3>
          <TagList items={p.goals} />
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">痛点</h3>
          <TagList items={p.painPoints} />
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">行为</h3>
          <TagList items={p.behaviors} />
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">动机</h3>
          <TagList items={p.motivations} />
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">场景</h3>
          <TagList items={p.scenarios} />
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">金句</h3>
          <TagList items={p.quotes} />
        </Card>
      </div>

      {p.journeyMap.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">用户旅程地图</h3>
          <div className="space-y-3">
            {p.journeyMap.map((stage, idx) => (
              <div key={stage.id} className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    {idx + 1}. {stage.stage || '未命名阶段'}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-xs ${EMOTION_LABEL[stage.emotions].color}`}>
                    {EMOTION_LABEL[stage.emotions].label}
                  </span>
                </div>
                <JourneySection title="行为" items={stage.actions} />
                <JourneySection title="想法" items={stage.thoughts} />
                <JourneySection title="痛点" items={stage.painPoints} />
                <JourneySection title="机会点" items={stage.opportunities} />
                <JourneySection title="触点" items={stage.touchpoints} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="text-xs text-slate-400">
        创建于 {formatDate(p.createdAt)} · 更新于 {fromNow(p.updatedAt)}
      </div>

      <ConfirmDialog
        open={confirm}
        title="删除用户画像"
        message="确定要删除该用户画像吗？此操作不可撤销。"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-slate-400">暂无</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <Tag key={t} label={t} />
      ))}
    </div>
  );
}

function JourneySection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-2">
      <span className="text-xs text-slate-400">{title}：</span>
      <span className="text-sm text-slate-600">{items.join('、')}</span>
    </div>
  );
}
