import * as XLSX from 'xlsx';
import { downloadFile, generateId } from '@/lib/utils';

// 将实体数组转为扁平 CSV 行（内嵌数组转 JSON 字符串）
function flattenRows(data: Record<string, unknown>[]): Record<string, unknown>[] {
  return data.map((row) => {
    const flat: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v === null || v === undefined) flat[k] = '';
      else if (v instanceof Date) flat[k] = v.toISOString();
      else if (Array.isArray(v) || typeof v === 'object') flat[k] = JSON.stringify(v);
      else flat[k] = v;
    }
    return flat;
  });
}

export function exportJSON(data: unknown[], filename: string, moduleName: string) {
  const payload = {
    meta: {
      app: 'PM SOP',
      module: moduleName,
      exportedAt: new Date().toISOString(),
      count: Array.isArray(data) ? data.length : 0,
    },
    data,
  };
  downloadFile(`${filename}-${Date.now()}.json`, JSON.stringify(payload, null, 2), 'application/json');
}

export function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const rows = flattenRows(data);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'data');
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadFile(`${filename}-${Date.now()}.csv`, csv, 'text/csv');
}

export function exportExcel(sheets: { name: string; data: Record<string, unknown>[] }[], filename: string) {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const rows = flattenRows(sheet.data);
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  }
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${Date.now()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 全量备份（所有模块）
export async function exportFullBackup(allData: Record<string, unknown[]>) {
  const payload = {
    meta: { app: 'PM SOP', type: 'full-backup', exportedAt: new Date().toISOString() },
    data: allData,
  };
  downloadFile(`pm-sop-backup-${Date.now()}.json`, JSON.stringify(payload, null, 2), 'application/json');
}

/** 序列化为同步用的 JSON 字符串（复用备份格式，不下载） */
export function serializeForSync(allData: Record<string, unknown[]>): string {
  const payload = {
    meta: { app: 'PM SOP', type: 'full-backup', exportedAt: new Date().toISOString() },
    data: allData,
  };
  return JSON.stringify(payload);
}
