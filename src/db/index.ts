import Dexie, { type Table } from 'dexie';
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
  AppSettings,
} from '@/lib/types';

export class PMDatabase extends Dexie {
  requirements!: Table<Requirement, string>;
  versions!: Table<Version, string>;
  prdDocuments!: Table<PRDDocument, string>;
  tasks!: Table<Task, string>;
  milestones!: Table<Milestone, string>;
  risks!: Table<Risk, string>;
  competitors!: Table<Competitor, string>;
  marketResearch!: Table<MarketResearch, string>;
  personas!: Table<Persona, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('PMSOPDatabase');
    this.version(1).stores({
      requirements:
        'id, status, priority, type, assignee, createdAt, updatedAt, versionId, parentId',
      versions: 'id, status, startDate, endDate, createdAt, updatedAt',
      prdDocuments: 'id, status, version, createdAt, updatedAt',
      tasks:
        'id, status, priority, assignee, requirementId, versionId, milestoneId, createdAt, sortOrder',
      milestones: 'id, status, dueDate, versionId, createdAt',
      risks: 'id, status, probability, impact, owner, createdAt',
      competitors: 'id, type, lastUpdated, createdAt',
      marketResearch: 'id, category, researchDate, createdAt',
      personas: 'id, role, createdAt',
      settings: 'id',
    });

    this.on('ready', async () => {
      const existing = await this.settings.get('app-settings');
      if (!existing) {
        await this.settings.put({
          id: 'app-settings',
          theme: 'system',
          language: 'zh-CN',
          sidebarCollapsed: false,
          defaultAssignee: '',
          autoBackupEnabled: false,
          autoBackupInterval: 24,
          lastBackupAt: null,
          lastBackupSize: null,
          defaultView: {
            requirements: 'table',
            projects: 'kanban',
          },
          shortcuts: {},
        });
      }
    });
  }
}

// 单例
export const db = new PMDatabase();

// SSR 安全：服务端渲染时不访问 indexedDB
export const isBrowser = typeof window !== 'undefined';
