// 全局常量与枚举标签

export const APP_NAME = 'PM SOP';
export const APP_FULL_NAME = 'PM SOP - 产品经理工作台';

// ===== 需求 =====
export const REQUIREMENT_STATUS = {
  draft: '草稿',
  reviewing: '评审中',
  approved: '已通过',
  rejected: '已拒绝',
  implemented: '已实现',
  closed: '已关闭',
} as const;

export const REQUIREMENT_PRIORITY = {
  P0: 'P0 紧急',
  P1: 'P1 高',
  P2: 'P2 中',
  P3: 'P3 低',
} as const;

export const REQUIREMENT_TYPE = {
  feature: '功能需求',
  bug: '缺陷',
  optimization: '优化',
  technical: '技术需求',
} as const;

export const REQUIREMENT_SOURCE = {
  user: '用户反馈',
  internal: '内部',
  competitive: '竞品',
  market: '市场',
  leadership: '管理层',
} as const;

// ===== 版本 =====
export const VERSION_STATUS = {
  planned: '规划中',
  in_progress: '进行中',
  released: '已发布',
  cancelled: '已取消',
} as const;

// ===== 任务 =====
export const TASK_STATUS = {
  backlog: '待办池',
  todo: '待开始',
  in_progress: '进行中',
  review: '评审中',
  done: '已完成',
  cancelled: '已取消',
} as const;

export const TASK_STATUS_ORDER: (keyof typeof TASK_STATUS)[] = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done',
  'cancelled',
];

// ===== 里程碑 =====
export const MILESTONE_STATUS = {
  pending: '未开始',
  in_progress: '进行中',
  completed: '已完成',
  delayed: '已延期',
} as const;

// ===== 风险 =====
export const RISK_CATEGORY = {
  technical: '技术',
  resource: '资源',
  schedule: '进度',
  scope: '范围',
  dependency: '依赖',
  other: '其他',
} as const;

export const RISK_LEVEL = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '严重',
} as const;

export const RISK_STATUS = {
  identified: '已识别',
  monitoring: '监控中',
  mitigating: '缓解中',
  resolved: '已解决',
  closed: '已关闭',
} as const;

// ===== 竞品 =====
export const COMPETITOR_TYPE = {
  direct: '直接竞品',
  indirect: '间接竞品',
  potential: '潜在竞品',
} as const;

// ===== PRD =====
export const PRD_STATUS = {
  draft: '草稿',
  review: '评审中',
  approved: '已通过',
  archived: '已归档',
} as const;

// ===== 颜色映射（语义色） =====
export const STATUS_COLOR: Record<string, string> = {
  // 需求
  draft: 'bg-slate-100 text-slate-600',
  reviewing: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  implemented: 'bg-indigo-100 text-indigo-700',
  closed: 'bg-slate-200 text-slate-500',
  // 版本
  planned: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  released: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  // 任务
  backlog: 'bg-slate-100 text-slate-600',
  todo: 'bg-slate-100 text-slate-700',
  done: 'bg-green-100 text-green-700',
  // 里程碑
  pending: 'bg-slate-100 text-slate-600',
  delayed: 'bg-red-100 text-red-700',
  // 风险
  identified: 'bg-slate-100 text-slate-600',
  monitoring: 'bg-yellow-100 text-yellow-700',
  mitigating: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
  // 竞品
  direct: 'bg-red-100 text-red-700',
  indirect: 'bg-yellow-100 text-yellow-700',
  potential: 'bg-blue-100 text-blue-700',
  // PRD
  archived: 'bg-slate-200 text-slate-500',
};

export const PRIORITY_COLOR: Record<string, string> = {
  P0: 'bg-red-100 text-red-700',
  P1: 'bg-orange-100 text-orange-700',
  P2: 'bg-yellow-100 text-yellow-700',
  P3: 'bg-slate-100 text-slate-600',
};

export const RISK_LEVEL_COLOR: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};
