'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileJson, FileText, Sheet } from 'lucide-react';
import { exportJSON, exportCSV, exportExcel } from '@/services/export.service';
import { Button } from '@/components/ui';

export function ExportMenu({
  module,
  data,
  filename,
}: {
  module: string;
  data: Record<string, unknown>[] | unknown[];
  filename: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const arr = data as Record<string, unknown>[];

  const handle = (type: 'json' | 'csv' | 'excel') => {
    if (type === 'json') exportJSON(arr, filename, module);
    else if (type === 'csv') exportCSV(arr, filename);
    else exportExcel([{ name: module, data: arr }], filename);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        <Download size={16} /> 导出
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          <button
            onClick={() => handle('json')}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <FileJson size={16} /> JSON
          </button>
          <button
            onClick={() => handle('csv')}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <FileText size={16} /> CSV
          </button>
          <button
            onClick={() => handle('excel')}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <Sheet size={16} /> Excel
          </button>
        </div>
      )}
    </div>
  );
}
