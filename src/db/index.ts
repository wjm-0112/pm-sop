import Dexie, { type Table } from 'dexie';
import type {
  Project,
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
  projects!: Table<Project, string>;
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

    // v2: 新增 projects 表 + 所有业务表增加 projectId 索引
    this.version(2).stores({
      projects: 'id, status, createdAt',
      requirements:
        'id, status, priority, type, assignee, createdAt, updatedAt, versionId, parentId, projectId',
      versions: 'id, status, startDate, endDate, createdAt, updatedAt, projectId',
      prdDocuments: 'id, status, version, createdAt, updatedAt, projectId',
      tasks:
        'id, status, priority, assignee, requirementId, versionId, milestoneId, createdAt, sortOrder, projectId',
      milestones: 'id, status, dueDate, versionId, createdAt, projectId',
      risks: 'id, status, probability, impact, owner, createdAt, projectId',
      competitors: 'id, type, lastUpdated, createdAt, projectId',
      marketResearch: 'id, category, researchDate, createdAt, projectId',
      personas: 'id, role, createdAt, projectId',
      settings: 'id',
    }).upgrade(async (tx) => {
      // 创建默认项目
      const defaultProject: Project = {
        id: 'default-project',
        name: '我的项目',
        description: '默认项目',
        status: 'active',
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await tx.table('projects').put(defaultProject);

      // 为所有已有数据回填 projectId
      const tables = [
        'requirements', 'versions', 'prdDocuments', 'tasks',
        'milestones', 'risks', 'competitors', 'marketResearch', 'personas',
      ];
      for (const t of tables) {
        const records = await tx.table(t).toArray();
        for (const r of records) {
          if (!r.projectId) {
            await tx.table(t).update(r.id, { projectId: defaultProject.id });
          }
        }
      }
    });

    this.on('ready', async () => {
      // 确保默认项目存在
      const pCount = await this.projects.count();
      if (pCount === 0) {
        await this.projects.put({
          id: 'default-project',
          name: '我的项目',
          description: '默认项目',
          status: 'active',
          color: '#3B82F6',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
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
