'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { Select } from '@/components/ui';
import { countImportable, importData, type ImportStrategy } from '@/services/import.service';
import { useUIStore } from '@/stores/useUIStore';

export function ImportDialog({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const [strategy, setStrategy] = useState<ImportStrategy>('merge');
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [content, setContent] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const addToast = useUIStore((s) => s.addToast);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      setContent(text);
      setCounts(countImportable(text));
    } catch {
      addToast('error', '文件解析失败，请检查 JSON 格式');
    }
  };

  const handleImport = async () => {
    try {
      await importData(content, strategy);
      addToast('success', '数据导入成功');
      onImported();
      onClose();
      setContent('');
      setCounts(null);
    } catch (err) {
      addToast('error', '导入失败：' + (err as Error).message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="导入数据"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleImport} disabled={!content}>
            开始导入
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            选择 JSON 备份文件
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onFile}
          />
          <p className="mt-2 text-xs text-slate-400">仅支持本应用导出的 JSON 格式</p>
        </div>

        {counts && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">将导入以下数据：</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(counts).map(([k, v]) => (
                <span key={k} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">导入策略</label>
          <Select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as ImportStrategy)}
            options={[
              { value: 'merge', label: '合并（按 ID 覆盖）' },
              { value: 'replace', label: '全量替换（先清空）' },
              { value: 'append', label: '仅追加新数据' },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
}
