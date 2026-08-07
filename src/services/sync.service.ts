/**
 * 云端同步服务
 *
 * 数据流：
 *   IndexedDB ──序列化──▶ JSON ──encrypt──▶ base64 密文 ──PUT──▶ GitHub
 *   GitHub ──GET──▶ base64 密文 ──decrypt──▶ JSON ──importData(merge)──▶ IndexedDB
 *
 * 安全边界：明文从不出浏览器；PAT 仅作 GitHub 传输凭证。
 */

import { db } from '@/db/index';
import { importData } from './import.service';
import { serializeForSync } from './export.service';
import { encryptPayload, decryptPayload } from '@/lib/crypto';

// ---- types ----

export interface SyncConfig {
  token: string;
  owner: string;
  repo: string;
  filePath: string;
}

export interface PullResult {
  sha: string;
  stats: Record<string, number> | null;
}

export enum SyncErrorKind {
  NETWORK = 'network',
  AUTH = 'auth',
  NOT_FOUND = 'not_found',
  DECRYPT = 'decrypt',
  IMPORT = 'import',
  UNKNOWN = 'unknown',
}

export class SyncError extends Error {
  kind: SyncErrorKind;
  constructor(message: string, kind: SyncErrorKind) {
    super(message);
    this.name = 'SyncError';
    this.kind = kind;
  }
}

// ---- GitHub Contents API ----

function apiUrl(config: SyncConfig): string {
  return `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`;
}

function apiHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/** 从 GitHub 拉取文件内容与 sha */
export async function pullFromGithub(
  config: SyncConfig,
): Promise<{ content: string; sha: string } | null> {
  let resp: Response;
  try {
    resp = await fetch(apiUrl(config), { headers: apiHeaders(config.token) });
  } catch {
    throw new SyncError('网络连接失败，请检查网络后重试', SyncErrorKind.NETWORK);
  }

  if (resp.status === 401 || resp.status === 403) {
    throw new SyncError('GitHub 令牌无效或已过期，请重新设置', SyncErrorKind.AUTH);
  }
  if (resp.status === 404) {
    // 云端文件尚未创建 — 正常情况（首次使用或从未上传）
    return null;
  }
  if (!resp.ok) {
    throw new SyncError(
      `服务器错误 (${resp.status})，请稍后重试`,
      SyncErrorKind.UNKNOWN,
    );
  }

  const data = await resp.json();
  const content = data.content as string | undefined;
  const sha = data.sha as string | undefined;
  if (!content || !sha) {
    throw new SyncError('云端文件格式异常', SyncErrorKind.UNKNOWN);
  }

  // GitHub Contents API 返回 base64，解码为原始字符串
  const decoded = atob(content.replace(/\s/g, ''));
  return { content: decoded, sha };
}

/** 将密文推送至 GitHub（如已存在文件需要传 sha） */
export async function pushToGithub(
  config: SyncConfig,
  contentBase64: string,
  sha?: string,
): Promise<string> {
  const body: Record<string, string> = {
    message: 'chore: sync encrypted backup [pm-sop]',
    content: contentBase64,
  };
  if (sha) body.sha = sha;

  let resp: Response;
  try {
    resp = await fetch(apiUrl(config), {
      method: 'PUT',
      headers: {
        ...apiHeaders(config.token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new SyncError('网络连接失败，请检查网络后重试', SyncErrorKind.NETWORK);
  }

  if (resp.status === 401 || resp.status === 403) {
    throw new SyncError('GitHub 令牌无效或已过期，请重新设置', SyncErrorKind.AUTH);
  }
  if (resp.status === 409) {
    throw new SyncError(
      '云端文件版本冲突（可能被其他设备同时上传），请先拉取后再试',
      SyncErrorKind.UNKNOWN,
    );
  }
  if (!resp.ok) {
    throw new SyncError(
      `上传失败 (${resp.status})，请稍后重试`,
      SyncErrorKind.UNKNOWN,
    );
  }

  const data = await resp.json();
  return data.content?.sha ?? '';
}

// ---- 全量序列化（与 settings page loadAllData 同构） ----

export async function loadAllData(): Promise<Record<string, unknown[]>> {
  const [requirements, versions, prds, tasks, milestones, risks, competitors, marketResearch, personas] =
    await Promise.all([
      db.requirements.toArray(),
      db.versions.toArray(),
      db.prdDocuments.toArray(),
      db.tasks.toArray(),
      db.milestones.toArray(),
      db.risks.toArray(),
      db.competitors.toArray(),
      db.marketResearch.toArray(),
      db.personas.toArray(),
    ]);

  return {
    requirements,
    versions,
    prds,            // ← key 是 prds，非 prdDocuments
    tasks,
    milestones,
    risks,
    competitors,
    marketResearch,
    personas,
  };
}

// ---- 同步操作 ----

/** 上传：序列化 → 加密 → 推送到 GitHub */
export async function syncUpload(
  config: SyncConfig,
  password: string,
  remoteSha?: string,
): Promise<string> {
  // 1. 序列化全量数据
  const allData = await loadAllData();
  const json = serializeForSync(allData);

  // 2. 加密
  const encrypted = await encryptPayload(json, password);

  // 3. base64 编码（GitHub Contents API 要求 base64）
  const contentBase64 = btoa(unescape(encodeURIComponent(encrypted)));

  // 4. 推送
  const newSha = await pushToGithub(config, contentBase64, remoteSha);
  return newSha;
}

/** 拉取：从 GitHub 获取 → 解密 → 智能合并到本地 IndexedDB */
export async function syncPull(
  config: SyncConfig,
  password: string,
): Promise<{ sha: string; stats: Record<string, number> | null }> {
  // 1. 拉取
  const pulled = await pullFromGithub(config);
  if (!pulled) {
    throw new SyncError(
      '云端尚未有备份文件，请先上传一次',
      SyncErrorKind.NOT_FOUND,
    );
  }

  // 2. 解密
  let decrypted: string;
  try {
    decrypted = await decryptPayload(pulled.content, password);
  } catch {
    throw new SyncError(
      '解密失败 — 密码可能不正确，或云端文件已损坏',
      SyncErrorKind.DECRYPT,
    );
  }

  // 3. 还原到 IndexedDB（智能合并）
  try {
    await importData(decrypted, 'merge');
  } catch {
    throw new SyncError('数据导入失败，文件格式可能不兼容', SyncErrorKind.IMPORT);
  }

  // 4. 统计各模块条数
  let stats: Record<string, number> | null = null;
  try {
    const parsed = JSON.parse(decrypted);
    if (parsed.data) {
      stats = {};
      for (const [k, v] of Object.entries(parsed.data)) {
        stats[k] = Array.isArray(v) ? v.length : 0;
      }
    }
  } catch { /* ignore parse error */ }

  return { sha: pulled.sha, stats };
}

/** 便捷：从 AppSettings 构建 SyncConfig */
export function buildConfig(settings: {
  syncToken?: string;
  syncRepoOwner?: string;
  syncRepoName?: string;
  syncFilePath?: string;
}): SyncConfig {
  return {
    token: settings.syncToken || '',
    owner: settings.syncRepoOwner || 'wjm-0112',
    repo: settings.syncRepoName || 'pm-sop',
    filePath: settings.syncFilePath || 'sync/pm-sop-backup.enc.json',
  };
}
