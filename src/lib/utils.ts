import { v4 as uuidv4 } from 'uuid';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function generateId(): string {
  return uuidv4();
}

// 日期格式化
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, 'yyyy-MM-dd');
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, 'yyyy-MM-dd HH:mm');
}

export function fromNow(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
}

// 解析可能为字符串的日期（JSON 导入后）
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = parseISO(value);
    return isValid(d) ? d : null;
  }
  return null;
}

// 安全解析（用于 IndexedDB 返回的对象，Date 已是 Date 实例）
export function reviveDates<T>(obj: T): T {
  return obj;
}

// 文件大小格式化
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// 防抖
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// 数组按字段排序
export function sortBy<T>(arr: T[], key: keyof T, dir: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    let cmp = 0;
    if (av instanceof Date && bv instanceof Date) cmp = av.getTime() - bv.getTime();
    else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
    else cmp = String(av).localeCompare(String(bv), 'zh');
    return dir === 'asc' ? cmp : -cmp;
  });
}

// 截断文本
export function truncate(text: string, len: number): string {
  if (text.length <= len) return text;
  return text.slice(0, len) + '…';
}

// 下载文本/JSON 为文件
export function downloadFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
