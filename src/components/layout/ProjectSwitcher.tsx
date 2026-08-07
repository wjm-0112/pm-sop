'use client';

import { useState } from 'react';
import { FolderKanban, Plus, Check } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export function ProjectSwitcher() {
  const {
    projects,
    activeProjectId,
    switchProject,
    createProject,
    deleteProject,
    loadProjects,
  } = useProjectStore();

  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);

  const active = projects.find((p) => p.id === activeProjectId);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createProject({ name: newName.trim(), description: newDesc.trim(), color: newColor });
    setNewName('');
    setNewDesc('');
    setNewColor(COLORS[0]);
    setCreateOpen(false);
  };

  return (
    <>
      {/* 项目切换器 */}
      <button
        onClick={() => { loadProjects(); setOpen(true); }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
      >
        <div
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: active?.color || '#94A3B8' }}
        />
        <span className="truncate">{active?.name || '选择项目'}</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="切换项目">
        <div className="space-y-2">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { switchProject(p.id); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:bg-slate-50"
            >
              <div
                className="h-4 w-4 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                {p.description && <p className="text-xs text-slate-400 truncate">{p.description}</p>}
              </div>
              {p.id === activeProjectId && <Check size={16} className="text-primary shrink-0" />}
              {projects.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`确定删除项目「${p.name}」？项目下的数据不会被删除。`)) {
                      deleteProject(p.id);
                      loadProjects();
                    }
                  }}
                  className="ml-1 text-xs text-slate-300 hover:text-red-500 shrink-0"
                >
                  删除
                </button>
              )}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Button variant="outline" onClick={() => { setCreateOpen(true); setOpen(false); }} className="w-full">
            <Plus size={16} /> 新建项目
          </Button>
        </div>
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="新建项目">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">项目名称</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="如：SaaS 后台" onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">项目描述（可选）</label>
            <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="简要描述项目" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">标识色</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: c,
                    borderColor: newColor === c ? '#0F172A' : 'transparent',
                    transform: newColor === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>创建</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
