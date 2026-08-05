// 共享 TypeScript 类型定义（对应 IndexedDB 表结构）

// ===== 通用内嵌结构 =====
export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'link' | 'image';
  url: string;
  size: number;
  createdAt: Date;
}

export interface ChangeEntry {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: Date;
  reason: string;
}

export interface CompetitorFeature {
  id: string;
  name: string;
  category: string;
  rating: number;
  notes: string;
}

export interface JourneyStage {
  id: string;
  stage: string;
  actions: string[];
  thoughts: string[];
  emotions: 'positive' | 'neutral' | 'negative';
  painPoints: string[];
  opportunities: string[];
  touchpoints: string[];
  sortOrder: number;
}

// ===== 需求 =====
export type RequirementStatus =
  | 'draft'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'closed';
export type RequirementPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type RequirementType = 'feature' | 'bug' | 'optimization' | 'technical';
export type RequirementSource =
  | 'user'
  | 'internal'
  | 'competitive'
  | 'market'
  | 'leadership';

export interface Requirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  source: RequirementSource;
  sourceDetail: string;
  assignee: string;
  reviewer: string;
  tags: string[];
  attachments: Attachment[];
  parentId: string | null;
  versionId: string | null;
  changeLog: ChangeEntry[];
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
  closedAt: Date | null;
  estimatedEffort: number | null;
  businessValue: number | null;
}

// ===== 版本 =====
export interface Version {
  id: string;
  name: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'released' | 'cancelled';
  startDate: Date;
  endDate: Date | null;
  releaseDate: Date | null;
  goals: string[];
  requirementIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== PRD =====
export interface PRDDocument {
  id: string;
  title: string;
  content: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  relatedRequirementIds: string[];
  relatedVersionId: string | null;
  attachments: Attachment[];
  author: string;
  reviewers: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== 任务 =====
export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'done'
  | 'cancelled';
export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  requirementId: string | null;
  versionId: string | null;
  milestoneId: string | null;
  storyPoints: number | null;
  estimatedHours: number | null;
  actualHours: number | null;
  tags: string[];
  attachments: Attachment[];
  dependencies: string[];
  sortOrder: number;
  startedAt: Date | null;
  completedAt: Date | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== 里程碑 =====
export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate: Date | null;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  versionId: string | null;
  taskIds: string[];
  deliverables: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== 风险 =====
export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'resource' | 'schedule' | 'scope' | 'dependency' | 'other';
  probability: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'monitoring' | 'mitigating' | 'resolved' | 'closed';
  mitigation: string;
  contingency: string;
  owner: string;
  relatedTaskIds: string[];
  relatedRequirementIds: string[];
  identifiedAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== 竞品 =====
export interface Competitor {
  id: string;
  name: string;
  logo: string | null;
  description: string;
  website: string | null;
  type: 'direct' | 'indirect' | 'potential';
  strengths: string[];
  weaknesses: string[];
  features: CompetitorFeature[];
  marketShare: number | null;
  targetUsers: string;
  pricing: string | null;
  fundingStage: string | null;
  foundedYear: number | null;
  lastUpdated: Date;
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== 市场调研 =====
export interface MarketResearch {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string | null;
  sourceUrl: string | null;
  keyFindings: string[];
  tags: string[];
  attachments: Attachment[];
  author: string;
  researchDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===== 用户画像 =====
export interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
  demographics: {
    age: string;
    gender: string;
    occupation: string;
    education: string;
    location: string;
    income: string;
    techLevel: string;
  };
  goals: string[];
  painPoints: string[];
  behaviors: string[];
  motivations: string[];
  scenarios: string[];
  quotes: string[];
  journeyMap: JourneyStage[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== 设置 =====
export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  sidebarCollapsed: boolean;
  defaultAssignee: string;
  autoBackupEnabled: boolean;
  autoBackupInterval: number;
  lastBackupAt: Date | null;
  lastBackupSize: number | null;
  defaultView: Record<string, string>;
  shortcuts: Record<string, string>;
}

// ===== 筛选类型 =====
export interface RequirementFilter {
  status: RequirementStatus | 'all';
  priority: RequirementPriority | 'all';
  type: RequirementType | 'all';
  source: RequirementSource | 'all';
  assignee: string;
  tag: string;
}
