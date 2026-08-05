'use client';

import { useEffect, useState } from 'react';
import { Download, Upload, Database } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Card, Button, LoadingSpinner, Input, Select } from '@/components/ui';
import { ImportDialog } from '@/components/common/ImportDialog';
import { ExportMenu } from '@/components/common/ExportMenu';
import { useUIStore } from '@/stores/useUIStore';
import { db } from '@/db/index';
import { exportFullBackup } from '@/services/export.service';
import type { AppSettings } from '@/lib/types';

const THEME_OPTIONS = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
];

const MODULES: { key: keyof AllData; label: string; filename: string }[] = [
  { key: 'requirements', label: '需求', filename: 'requirements' },
  { key: 'versions', label: '版本', filename: 'versions' },
  { key: 'prds', label: 'PRD', filename: 'prds' },
  { key: 'tasks', label: '任务', filename: 'tasks' },
  { key: 'milestones', label: '里程碑', filename: 'milestones' },
  { key: 'risks', label: '风险', filename: 'risks' },
  { key: 'competitors', label: '竞品', filename: 'competitors' },
  { key: 'marketResearch', label: '市场调研', filename: 'market-research' },
  { key: 'personas', label: '用户画像', filename: 'personas' },
];

interface AllData {
  requirements: unknown[];
  versions: unknown[];
  prds: unknown[];
  tasks: unknown[];
  milestones: unknown[];
  risks: unknown[];
  competitors: unknown[];
  marketResearch: unknown[];
  personas: unknown[];
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { settings, load, update } = useSettingsStore();
  const addToast = useUIStore((s) => s.addToast);
  const [importOpen, setImportOpen] = useState(false);
  const [allData, setAllData] = useState<AllData | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const loadAllData = async () => {
    const data: AllData = {
      requirements: await db.requirements.toArray(),
      versions: await db.versions.toArray(),
      prds: await db.prdDocuments.toArray(),
      tasks: await db.tasks.toArray(),
      milestones: await db.milestones.toArray(),
      risks: await db.risks.toArray(),
      competitors: await db.competitors.toArray(),
      marketResearch: await db.marketResearch.toArray(),
      personas: await db.personas.toArray(),
    };
    setAllData(data);
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!settings) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  const handleFullBackup = () => {
    if (allData) {
      exportFullBackup(allData as unknown as Record<string, unknown[]>);
      addToast('success', '全量备份已导出');
    }
  };

  const theme = (settings as AppSettings).theme;
  const language = (settings as AppSettings).language;
  const defaultAssignee = (settings as AppSettings).defaultAssignee;
  const autoBackupEnabled = (settings as AppSettings).autoBackupEnabled;
  const autoBackupInterval = (settings as AppSettings).autoBackupInterval;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">设置</h1>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">外观</h3>
        <div className="space-y-2">
          <label className="block text-sm text-slate-600">主题</label>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => update({ theme: o.value as AppSettings['theme'] })}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  theme === o.value
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-border text-slate-600 hover:bg-slate-100'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">通用</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">语言</label>
            <Select
              value={language}
              onChange={(e) => update({ language: e.target.value as AppSettings['language'] })}
              options={[
                { value: 'zh-CN', label: '简体中文' },
                { value: 'en-US', label: 'English' },
              ]}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">默认负责人</label>
            <Input
              value={defaultAssignee}
              onChange={(e) => update({ defaultAssignee: e.target.value })}
              placeholder="用于新建需求/任务默认填充"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">自动备份</h3>
          <Toggle
            checked={autoBackupEnabled}
            onChange={(v) => update({ autoBackupEnabled: v })}
          />
        </div>
        <p className="mb-3 text-sm text-slate-500">
          开启后，应用会在本地定期提示导出备份（当前为客户端本地优先存储，建议配合手动导出）。
        </p>
        <div className="max-w-xs">
          <label className="mb-1 block text-sm font-medium text-slate-700">备份间隔（小时）</label>
          <Input
            type="number"
            value={String(autoBackupInterval)}
            onChange={(e) => update({ autoBackupInterval: Number(e.target.value) || 24 })}
          />
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Database size={18} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">数据管理</h3>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          所有数据仅存储于本机浏览器（IndexedDB）。请定期导出备份，避免设备更换或清理缓存导致数据丢失。
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={handleFullBackup}>
            <Download size={16} /> 导出全量备份 (JSON)
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload size={16} /> 导入数据
          </Button>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-medium text-slate-700">按模块导出（JSON / CSV / Excel）</p>
          {!allData ? (
            <LoadingSpinner className="h-6 w-6" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MODULES.map((m) => (
                <div key={m.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-sm text-slate-600">
                    {m.label}
                    <span className="ml-1 text-xs text-slate-400">
                      {(allData[m.key] as unknown[]).length}
                    </span>
                  </span>
                  <ExportMenu
                    module={m.label}
                    filename={m.filename}
                    data={allData[m.key] as Record<string, unknown>[]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => {
          load();
          loadAllData();
        }}
      />
    </div>
  );
}
