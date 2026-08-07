'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Eye, FileText, CheckCircle2, Circle } from 'lucide-react';
import { Input, Select, Button, Card, Badge } from '@/components/ui';
import { PRDEditor } from '@/components/planning/PRDEditor';
import { usePlanningStore } from '@/stores/usePlanningStore';
import { useUIStore } from '@/stores/useUIStore';
import { PRD_STATUS } from '@/lib/constants';
import { DEFAULT_TEMPLATES, type PRDTemplate, type PRDTemplateNode } from '@/lib/prd-templates';
import type { PRDDocument } from '@/lib/types';

type Step = 'template' | 'fill' | 'preview';

export default function NewPRDPage() {
  const router = useRouter();
  const create = usePlanningStore((s) => s.createPrd);
  const versions = usePlanningStore((s) => s.versions);
  const loadVersions = usePlanningStore((s) => s.loadVersions);
  const addToast = useUIStore((s) => s.addToast);

  const [step, setStep] = useState<Step>('template');
  const [template, setTemplate] = useState<PRDTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<PRDDocument['status']>('draft');
  const [versionId, setVersionId] = useState('');
  const [nodeIndex, setNodeIndex] = useState(0);
  // 每个节点的内容（key=node.id, value=HTML string）
  const [nodeContents, setNodeContents] = useState<Record<string, string>>({});

  useState(() => {
    loadVersions();
  });

  const nodes = template?.nodes || [];
  const currentNode = nodes[nodeIndex] || null;

  // 拼接完整 PRD 内容
  const fullContent = useMemo(() => {
    if (!template) return '';
    return template.nodes
      .map((n) => {
        const content = nodeContents[n.id] || '';
        const nodeTitle = `<h2>${n.order}. ${n.label}</h2>`;
        return content ? `${nodeTitle}\n${content}` : `${nodeTitle}\n<p><em>（未填写）</em></p>`;
      })
      .join('\n<hr/>\n');
  }, [template, nodeContents]);

  // 选模板
  const selectTemplate = (t: PRDTemplate) => {
    setTemplate(t);
    setStep('fill');
    setNodeIndex(0);
  };

  // 下一步
  const nextNode = () => {
    if (nodeIndex < nodes.length - 1) {
      setNodeIndex(nodeIndex + 1);
    } else {
      setStep('preview');
    }
  };

  // 上一步
  const prevNode = () => {
    if (nodeIndex > 0) setNodeIndex(nodeIndex - 1);
  };

  // 保存
  const submit = async () => {
    if (!title.trim()) {
      addToast('error', '请填写 PRD 标题');
      return;
    }
    const id = await create({
      title,
      content: fullContent,
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

  const doneCount = nodes.filter((n) => nodeContents[n.id]?.trim()).length;

  // ---- Step 1: 选模板 ----
  if (step === 'template') {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">新建 PRD · 选择模板</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DEFAULT_TEMPLATES.map((t) => (
            <Card
              key={t.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => selectTemplate(t)}
            >
              <div className="flex items-start gap-3">
                <FileText size={24} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{t.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {t.nodes.map((n) => (
                      <Badge key={n.id} className="bg-slate-100 text-slate-500">
                        {n.order}. {n.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => router.push('/planning/prd')}>取消</Button>
        </div>
      </div>
    );
  }

  // ---- Step 2: 逐节点填写 ----
  if (step === 'fill' && currentNode) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">新建 PRD · {template?.name}</h1>
          <Badge>{doneCount}/{nodes.length} 已完成</Badge>
        </div>

        {/* 标题 + 状态 */}
        <Card className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">PRD 标题</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：SaaS 后台 v2.0 用户权限体系" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">状态</label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as PRDDocument['status'])}
                options={Object.entries(PRD_STATUS).map(([v, l]) => ({ value: v, label: l }))}
              />
            </div>
          </div>
        </Card>

        {/* 节点填写区 */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* 左侧节点树 */}
          <div className="lg:w-48 shrink-0">
            <div className="space-y-0.5 rounded-lg border border-border p-2">
              {nodes.map((n, i) => {
                const filled = !!nodeContents[n.id]?.trim();
                const isCurrent = i === nodeIndex;
                return (
                  <button
                    key={n.id}
                    onClick={() => setNodeIndex(i)}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors ${
                      isCurrent
                        ? 'bg-primary-50 text-primary font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {filled ? (
                      <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    ) : (
                      <Circle size={14} className="text-slate-300 shrink-0" />
                    )}
                    <span className="truncate">{n.order}. {n.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右侧编辑器 */}
          <div className="flex-1 min-w-0">
            <Card className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {currentNode.order}. {currentNode.label}
                  {currentNode.required && <span className="ml-1 text-red-400">*</span>}
                </h3>
                <p className="mt-1 text-xs text-slate-400">{currentNode.hint}</p>
              </div>
              <PRDEditor
                value={nodeContents[currentNode.id] || ''}
                onChange={(v) =>
                  setNodeContents((prev) => ({ ...prev, [currentNode.id]: v }))
                }
              />
            </Card>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep('template')}>
            <ChevronLeft size={16} /> 返回选模板
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/planning/prd')}>取消</Button>
            <Button variant="outline" onClick={prevNode} disabled={nodeIndex === 0}>
              <ChevronLeft size={16} /> 上一步
            </Button>
            <Button onClick={nextNode}>
              {nodeIndex < nodes.length - 1 ? (
                <>下一步 <ChevronRight size={16} /></>
              ) : (
                <><Eye size={16} /> 预览</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Step 3: 预览 ----
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">预览 PRD</h1>
        <Badge>基于「{template?.name}」模板</Badge>
      </div>
      <Card className="p-6">
        {title && (
          <h2 className="mb-4 text-xl font-bold text-slate-900 border-b border-border pb-3">{title}</h2>
        )}
        <div
          className="prose prose-slate max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: fullContent }}
        />
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { setStep('fill'); setNodeIndex(nodes.length - 1); }}>
          返回编辑
        </Button>
        <Button variant="outline" onClick={() => router.push('/planning/prd')}>取消</Button>
        <Button onClick={submit}>保存草稿</Button>
      </div>
    </div>
  );
}
