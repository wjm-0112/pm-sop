import type {
  Requirement,
  Version,
  PRDDocument,
  Task,
  Milestone,
  Risk,
  Competitor,
  MarketResearch,
  Persona,
} from '@/lib/types';
import { requirementOps } from '@/db/operations/requirements';
import { versionOps } from '@/db/operations/versions';
import { prdOps } from '@/db/operations/prdDocuments';
import { taskOps } from '@/db/operations/tasks';
import { milestoneOps } from '@/db/operations/milestones';
import { riskOps } from '@/db/operations/risks';
import { competitorOps } from '@/db/operations/competitors';
import { marketResearchOps } from '@/db/operations/marketResearch';
import { personaOps } from '@/db/operations/personas';
import { toDate } from '@/lib/utils';

export type ImportStrategy = 'replace' | 'merge' | 'append';

interface ParsedBackup {
  meta?: { type?: string };
  data?:
    | Record<string, unknown[]>
    | { requirements?: Requirement[] };
  requirements?: Requirement[];
  versions?: Version[];
  prds?: PRDDocument[];
  tasks?: Task[];
  milestones?: Milestone[];
  risks?: Risk[];
  competitors?: Competitor[];
  marketResearch?: MarketResearch[];
  personas?: Persona[];
}

// 校验并解析导入文件
export function parseImport(content: string): ParsedBackup {
  const parsed = JSON.parse(content);
  if (!parsed || typeof parsed !== 'object') throw new Error('文件格式无效');
  return parsed as ParsedBackup;
}

// 提取各模块数据（兼容全量备份与单模块导出）
function extractCollections(obj: ParsedBackup): ParsedBackup {
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    return obj.data as ParsedBackup;
  }
  return obj;
}

// Date 字段名集合（JSON 导入后需从 ISO 字符串还原为 Date 实例）
const DATE_FIELDS = new Set([
  'createdAt', 'updatedAt', 'dueDate', 'startedAt', 'completedAt',
  'releasedAt', 'startDate', 'endDate', 'researchDate', 'identifiedAt',
  'resolvedAt', 'closedAt', 'lastBackupAt', 'lastUpdated', 'exportedAt',
  'changedAt',
]);

function reviveDatesRecursive(obj: unknown): void {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) reviveDatesRecursive(item);
    return;
  }
  const record = obj as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const val = record[key];
    if (DATE_FIELDS.has(key) && typeof val === 'string') {
      const d = toDate(val);
      if (d) record[key] = d;
    } else if (typeof val === 'object' && val !== null) {
      reviveDatesRecursive(val);
    }
  }
}

async function reviveArray<T extends { id: string }>(arr: unknown[]): Promise<T[]> {
  const items = (arr ?? []) as Record<string, unknown>[];
  for (const item of items) reviveDatesRecursive(item);
  return items as T[];
}

export async function importData(content: string, strategy: ImportStrategy) {
  const parsed = parseImport(content);
  const collections = extractCollections(parsed);

  const ops: Record<string, { bulkPut: (items: unknown[]) => Promise<void>; clear?: () => Promise<void> }> = {
    requirements: requirementOps,
    versions: versionOps,
    prds: prdOps,
    tasks: taskOps,
    milestones: milestoneOps,
    risks: riskOps,
    competitors: competitorOps,
    marketResearch: marketResearchOps,
    personas: personaOps,
  };

  const moduleKeys: Record<string, string> = {
    requirements: 'requirements',
    versions: 'versions',
    prds: 'prds',
    tasks: 'tasks',
    milestones: 'milestones',
    risks: 'risks',
    competitors: 'competitors',
    marketResearch: 'marketResearch',
    personas: 'personas',
  };

  for (const [key, opKey] of Object.entries(moduleKeys)) {
    const raw = (collections as Record<string, unknown[]>)[opKey];
    if (!raw || !Array.isArray(raw)) continue;
    const items = await reviveArray(raw);
    if (strategy === 'replace' && ops[key].clear) {
      await ops[key].clear!();
      await ops[key].bulkPut(items);
    } else if (strategy === 'merge' || strategy === 'append') {
      await ops[key].bulkPut(items);
    }
  }
  return true;
}

// 统计可导入数量（用于预览）
export function countImportable(content: string): Record<string, number> {
  const parsed = parseImport(content);
  const collections = extractCollections(parsed);
  const result: Record<string, number> = {};
  for (const key of ['requirements', 'versions', 'prds', 'tasks', 'milestones', 'risks', 'competitors', 'marketResearch', 'personas']) {
    const arr = (collections as Record<string, unknown[]>)[key];
    if (Array.isArray(arr)) result[key] = arr.length;
  }
  return result;
}

export { toDate };
