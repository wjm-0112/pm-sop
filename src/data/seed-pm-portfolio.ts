// 种子数据：将 docs/ 下的三份 PM-portfolios 文档，转化为 pm-sop 系统内
// 的「pm-portfolio」项目结构化数据（需求 / 版本 / PRD / 任务 / 里程碑 / 风险）。
// 幂等：项目已存在则跳过。仅在浏览器端（IndexedDB 就绪后）执行。

import { db, isBrowser } from '@/db/index';
import { requirementOps } from '@/db/operations/requirements';
import { versionOps } from '@/db/operations/versions';
import { prdOps } from '@/db/operations/prdDocuments';
import { milestoneOps } from '@/db/operations/milestones';
import { taskOps } from '@/db/operations/tasks';
import { riskOps } from '@/db/operations/risks';
import { SETTINGS_ID } from '@/db/operations/settings';
import type {
  Requirement,
  Version,
  PRDDocument,
  Milestone,
  Task,
  Risk,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementSource,
  TaskStatus,
} from '@/lib/types';

type RiskCategoryT = 'technical' | 'resource' | 'schedule' | 'scope' | 'dependency' | 'other';
type RiskStatusT = 'identified' | 'monitoring' | 'mitigating' | 'resolved' | 'closed';
type MilestoneStatusT = 'pending' | 'in_progress' | 'completed' | 'delayed';

const PID = 'pm-portfolio';
const OWNER = 'wjm';

function d(s: string): Date {
  return new Date(`${s}T00:00:00`);
}

// 读取 public/seed-docs 下的文档全文；失败则回退到内置摘要。
async function fetchDoc(file: string, fallback: string): Promise<string> {
  try {
    const candidates = [`/pm-sop/seed-docs/${file}`, `/seed-docs/${file}`];
    for (const url of candidates) {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 50) return text;
      }
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

const PRD_FALLBACK = `# PM Portfolio 作品展示站 — 产品需求文档 (PRD)

> 版本：v2.0.0 ｜ 状态：已交付

## 核心内容
- 前台展示（V1.0）：个人主页、作品列表、作品详情、时间线视图
- 管理后台（V2.0）：若依风格后台、仪表盘、资料管理、作品管理、文件管理、云同步
- 非功能需求：性能 / 类型安全 / 响应式 / 数据安全（端到端加密）
- 用户故事与验收标准（详见系统「需求管理 / 产品规划」模块）
`;

const TECH_FALLBACK = `# PM Portfolio 作品展示站 — 技术架构文档

> 版本：v2.0.0

## 技术选型
React 18 + TypeScript 5 + Vite 5（前端 SPA）；Express 4（后端 API）；
react-markdown + remark-gfm（Markdown 渲染）；Ant Design 5（后台）；
@uiw/react-md-editor（MD 编辑器）；multer（文件上传）；crypto-js（AES 加密）。

## 架构
前后端分离：前端 React SPA + 管理后台；Express 提供 /api/profile、/api/portfolios、
/api/upload、/api/sync 等接口，fileStore 读写 JSON/MD，githubSync 推送至 GitHub。
`;

const PROGRESS_FALLBACK = `# PM Portfolio 作品展示站 — 项目推进记录

## 里程碑
- V1.0 前台展示站：✅ 已完成（2026-08-07）
- V2.0 管理后台：✅ 已完成（2026-08-07）
- V2.1 云同步增强：⏳ 待规划
- V3.0 部署上线：⏳ 待规划

## 技术债务
- TD-01 antd 打包体积过大（P2）
- TD-02 管理后台无权限控制（P1）
- TD-03 云同步无历史记录（P1）
- TD-04 无访问统计（P3）
- TD-05 数据量增大后性能（P2）
`;

const req = (
  id: string,
  title: string,
  description: string,
  type: RequirementType,
  priority: RequirementPriority,
  status: RequirementStatus,
  source: RequirementSource,
  versionId: string | null,
  tags: string[],
): Requirement => ({
  id,
  projectId: PID,
  title,
  description,
  type,
  priority,
  status,
  source,
  sourceDetail: '',
  assignee: OWNER,
  reviewer: OWNER,
  tags,
  attachments: [],
  parentId: null,
  versionId,
  changeLog: [],
  createdAt: d('2026-08-07'),
  updatedAt: d('2026-08-07'),
  dueDate: null,
  closedAt: status === 'closed' ? d('2026-08-07') : null,
  estimatedEffort: null,
  businessValue: null,
});

export async function seedPmPortfolio(): Promise<void> {
  if (!isBrowser) return;
  const existing = await db.projects.get(PID);
  if (existing) return; // 已种子，跳过

  const now = new Date();

  // ---- 项目 ----
  const project = {
    id: PID,
    name: 'PM-portfolios 作品展示站',
    description:
      '产品经理专属作品集展示站（React SPA + Express 后端）：前台作品展示 + 若依风格管理后台 + 端到端加密云同步。',
    status: 'active' as const,
    color: '#8B5CF6',
    createdAt: now,
    updatedAt: now,
  };

  // ---- 文档全文 ----
  const [prdText, techText, progressText] = await Promise.all([
    fetchDoc('pm-portfolios-prd.md', PRD_FALLBACK),
    fetchDoc('pm-portfolios-tech.md', TECH_FALLBACK),
    fetchDoc('pm-portfolios-progress.md', PROGRESS_FALLBACK),
  ]);

  // ---- 需求 ----
  const requirements: Requirement[] = [
    req('pmp-req-01', '前台-个人主页与精选展示', '头像/姓名/职称/Bio/技能标签/工作经历 + 精选作品卡片，快速建立专业第一印象。', 'feature', 'P0', 'approved', 'internal', 'pmp-ver-1', ['前台', 'V1.0']),
    req('pmp-req-02', '前台-作品列表页', '响应式卡片网格，支持分类/状态筛选、关键词搜索、多维排序。', 'feature', 'P0', 'approved', 'internal', 'pmp-ver-1', ['前台', 'V1.0']),
    req('pmp-req-03', '前台-作品详情页', '面包屑 + 结构化元数据 + Markdown 正文渲染（GFM 表格/代码/任务列表）。', 'feature', 'P0', 'approved', 'internal', 'pmp-ver-1', ['前台', 'V1.0']),
    req('pmp-req-04', '前台-时间线视图', '按创建年份自动分组，蓝色圆点 + 连接线，点击跳转详情，呈现成长轨迹。', 'feature', 'P2', 'approved', 'internal', 'pmp-ver-1', ['前台', 'V1.0']),
    req('pmp-req-05', '管理后台-若依风格框架', '左侧菜单 + 顶部面包屑 + 内容区，支持侧边栏折叠与返回前台。', 'feature', 'P1', 'approved', 'internal', 'pmp-ver-2', ['后台', 'V2.0']),
    req('pmp-req-06', '管理后台-在线 Markdown 编辑器', '@uiw/react-md-editor 分屏实时预览，封面图上传与管理。', 'feature', 'P1', 'approved', 'internal', 'pmp-ver-2', ['后台', 'V2.0']),
    req('pmp-req-07', '云同步-端到端加密', 'GitHub Token + 仓库配置，AES 端到端加密，一键推送/拉取解密，密码仅用于加解密。', 'feature', 'P1', 'approved', 'internal', 'pmp-ver-2', ['后台', '云同步', 'V2.0']),
    req('pmp-req-08', '文件管理', 'multer 后端上传（≤50MB），列表浏览、预览、复制 URL 供 Markdown 引用。', 'feature', 'P2', 'approved', 'internal', 'pmp-ver-2', ['后台', 'V2.0']),
    req('pmp-req-09', '管理后台权限控制', '为管理后台增加简单密码验证，避免未授权访问（技术债务 TD-02）。', 'technical', 'P1', 'reviewing', 'internal', 'pmp-ver-3', ['后台', '安全', 'V2.1']),
    req('pmp-req-10', '云同步历史与回滚', '增加同步日志表，支持历史记录查看与回滚（技术债务 TD-03）。', 'technical', 'P1', 'reviewing', 'internal', 'pmp-ver-3', ['云同步', 'V2.1']),
    req('pmp-req-11', '前端性能优化', 'antd 按需加载 / 拆分 chunk，降低首屏体积（技术债务 TD-01）。', 'optimization', 'P2', 'draft', 'internal', 'pmp-ver-3', ['性能', 'V2.1']),
    req('pmp-req-12', '访问统计埋点', '接入简单埋点，了解访客行为（技术债务 TD-04）。', 'feature', 'P3', 'draft', 'internal', null, ['分析', 'V3.0']),
    req('pmp-req-13', 'SSG/SSR 演进', '数据量增大后考虑迁移到 SSG/SSR 方案（技术债务 TD-05）。', 'technical', 'P2', 'draft', 'internal', null, ['架构', 'V3.0']),
  ];

  // ---- 版本 ----
  const versions: Version[] = [
    {
      id: 'pmp-ver-1',
      projectId: PID,
      name: 'v1.0',
      title: 'V1.0 前台展示站',
      description: '个人资料 + 作品列表/详情 + 时间线，面向面试/述职/分享的专业作品展示。',
      status: 'released',
      startDate: d('2026-08-01'),
      endDate: d('2026-08-07'),
      releaseDate: d('2026-08-07'),
      goals: ['个人主页', '作品列表', '作品详情', '时间线视图'],
      requirementIds: ['pmp-req-01', 'pmp-req-02', 'pmp-req-03', 'pmp-req-04'],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
    {
      id: 'pmp-ver-2',
      projectId: PID,
      name: 'v2.0',
      title: 'V2.0 管理后台',
      description: '若依风格后台 + 在线编辑 + 文件管理 + 端到端加密云同步。',
      status: 'released',
      startDate: d('2026-08-07'),
      endDate: d('2026-08-07'),
      releaseDate: d('2026-08-07'),
      goals: ['仪表盘', '资料管理', '作品管理', '文件管理', '云同步'],
      requirementIds: ['pmp-req-05', 'pmp-req-06', 'pmp-req-07', 'pmp-req-08'],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
    {
      id: 'pmp-ver-3',
      projectId: PID,
      name: 'v2.1',
      title: 'V2.1 云同步增强',
      description: '完善同步历史与自动备份，提供本地 vs 远程差异对比。',
      status: 'planned',
      startDate: d('2026-08-08'),
      endDate: null,
      releaseDate: null,
      goals: ['同步历史', '自动备份', '差异对比'],
      requirementIds: ['pmp-req-09', 'pmp-req-10', 'pmp-req-11'],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
    {
      id: 'pmp-ver-4',
      projectId: PID,
      name: 'v3.0',
      title: 'V3.0 部署上线',
      description: '正式部署至生产环境：GitHub Pages 部署前台 + 云服务器部署后端 + 域名 + CI/CD。',
      status: 'planned',
      startDate: d('2026-08-15'),
      endDate: null,
      releaseDate: null,
      goals: ['Pages 部署前台', '云服务器部署后端', '域名配置', 'CI/CD 自动化'],
      requirementIds: ['pmp-req-12', 'pmp-req-13'],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
  ];

  // ---- PRD 文档（含文档全文）----
  const prds: PRDDocument[] = [
    {
      id: 'pmp-prd-01',
      projectId: PID,
      title: 'PM Portfolio 作品展示站 PRD v2.0',
      content: prdText,
      version: '2.0',
      status: 'approved',
      relatedRequirementIds: ['pmp-req-01', 'pmp-req-02', 'pmp-req-03', 'pmp-req-04', 'pmp-req-05', 'pmp-req-06', 'pmp-req-07', 'pmp-req-08'],
      relatedVersionId: 'pmp-ver-2',
      attachments: [],
      author: OWNER,
      reviewers: [OWNER],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
    {
      id: 'pmp-prd-02',
      projectId: PID,
      title: 'PM Portfolio 技术架构文档',
      content: techText,
      version: '2.0',
      status: 'approved',
      relatedRequirementIds: ['pmp-req-05', 'pmp-req-06', 'pmp-req-07', 'pmp-req-08'],
      relatedVersionId: 'pmp-ver-2',
      attachments: [],
      author: OWNER,
      reviewers: [OWNER],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
    {
      id: 'pmp-prd-03',
      projectId: PID,
      title: 'PM Portfolio 项目推进记录',
      content: progressText,
      version: '1.0',
      status: 'archived',
      relatedRequirementIds: [],
      relatedVersionId: 'pmp-ver-1',
      attachments: [],
      author: OWNER,
      reviewers: [OWNER],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
  ];

  // ---- 里程碑 ----
  const milestones: Milestone[] = [
    {
      id: 'pmp-ms-1',
      projectId: PID,
      title: 'V1.0 前台展示站',
      description: '个人资料 + 作品列表/详情 + 时间线，达成可交付的前台展示。',
      dueDate: d('2026-08-07'),
      completedDate: d('2026-08-07'),
      status: 'completed' as MilestoneStatusT,
      versionId: 'pmp-ver-1',
      taskIds: ['pmp-task-01', 'pmp-task-02', 'pmp-task-03', 'pmp-task-04', 'pmp-task-05', 'pmp-task-06', 'pmp-task-07', 'pmp-task-08'],
      deliverables: ['脚手架', '设计令牌', '数据层', 'UI 组件库', '布局组件', '5 个前台页面', '响应式适配', '文档'],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
    {
      id: 'pmp-ms-2',
      projectId: PID,
      title: 'V2.0 管理后台',
      description: '若依风格后台 + 在线编辑 + 文件管理 + 端到端加密云同步。',
      dueDate: d('2026-08-07'),
      completedDate: d('2026-08-07'),
      status: 'completed' as MilestoneStatusT,
      versionId: 'pmp-ver-2',
      taskIds: ['pmp-task-09', 'pmp-task-10', 'pmp-task-11', 'pmp-task-12', 'pmp-task-13'],
      deliverables: ['后端服务', 'API 路由', '后台布局', '6 个管理页面', '配置整合'],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
    {
      id: 'pmp-ms-3',
      projectId: PID,
      title: 'V2.1 云同步增强',
      description: '同步历史与回滚、自动定时备份、本地 vs 远程差异对比。',
      dueDate: d('2026-09-30'),
      completedDate: null,
      status: 'in_progress' as MilestoneStatusT,
      versionId: 'pmp-ver-3',
      taskIds: ['pmp-task-14', 'pmp-task-15', 'pmp-task-16'],
      deliverables: ['同步历史', '自动备份', '差异对比'],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
    {
      id: 'pmp-ms-4',
      projectId: PID,
      title: 'V3.0 部署上线',
      description: 'GitHub Pages 部署前台 + 云服务器部署后端 + 域名 + CI/CD。',
      dueDate: d('2026-10-31'),
      completedDate: null,
      status: 'pending' as MilestoneStatusT,
      versionId: 'pmp-ver-4',
      taskIds: ['pmp-task-17', 'pmp-task-18', 'pmp-task-19', 'pmp-task-20'],
      deliverables: ['Pages 部署', '后端部署', '域名', 'CI/CD'],
      createdAt: d('2026-08-07'),
      updatedAt: d('2026-08-07'),
    },
  ];

  // ---- 任务 ----
  const task = (
    id: string,
    title: string,
    description: string,
    status: TaskStatus,
    priority: RequirementPriority,
    milestoneId: string | null,
    sortOrder: number,
  ): Task => ({
    id,
    projectId: PID,
    title,
    description,
    status,
    priority,
    assignee: OWNER,
    requirementId: null,
    versionId: null,
    milestoneId,
    storyPoints: null,
    estimatedHours: null,
    actualHours: null,
    tags: [],
    attachments: [],
    dependencies: [],
    sortOrder,
    startedAt: status === 'done' || status === 'in_progress' || status === 'review' ? d('2026-08-07') : null,
    completedAt: status === 'done' ? d('2026-08-07') : null,
    dueDate: null,
    createdAt: d('2026-08-07'),
    updatedAt: d('2026-08-07'),
  });

  const tasks: Task[] = [
    // V1.0 已完成
    task('pmp-task-01', 'Vite + React18 + TS 脚手架', '初始化项目、依赖安装、Git 仓库。', 'done', 'P0', 'pmp-ms-1', 0),
    task('pmp-task-02', 'CSS Variables 设计令牌', '色板 / 间距 / 圆角 / 阴影设计系统。', 'done', 'P1', 'pmp-ms-1', 1),
    task('pmp-task-03', '数据层 loader 与示例数据', 'JSON/Markdown 通用加载器 + 示例数据。', 'done', 'P1', 'pmp-ms-1', 2),
    task('pmp-task-04', '通用 UI 组件库（9 个）', 'Card/Tag/Badge/Loading/Empty/Error/Markdown/Search/FilterBar。', 'done', 'P1', 'pmp-ms-1', 3),
    task('pmp-task-05', '布局组件 Header/Footer/Layout', '固定导航 + 汉堡菜单 + 主布局。', 'done', 'P1', 'pmp-ms-1', 4),
    task('pmp-task-06', '5 个前台页面', '首页 / 列表 / 详情 / 时间线 / 404。', 'done', 'P0', 'pmp-ms-1', 5),
    task('pmp-task-07', '响应式三端适配', 'Mobile/Tablet/Desktop 三档断点。', 'done', 'P2', 'pmp-ms-1', 6),
    task('pmp-task-08', '编写 PRD/UI_SPEC/TECH_PLAN/CHANGELOG', '完善项目文档。', 'done', 'P3', 'pmp-ms-1', 7),
    // V2.0 已完成
    task('pmp-task-09', 'Express 后端 + fileStore + crypto', '后端入口、JSON/MD 读写、AES 加解密。', 'done', 'P0', 'pmp-ms-2', 0),
    task('pmp-task-10', '4 组 API 路由', '/api/profile /api/portfolios /api/upload /api/sync。', 'done', 'P0', 'pmp-ms-2', 1),
    task('pmp-task-11', '管理后台布局（若依风格）', '侧边栏 + 面包屑 + 内容区 + 折叠。', 'done', 'P1', 'pmp-ms-2', 2),
    task('pmp-task-12', '6 个管理页面', '仪表盘 / 资料 / 作品管理 / 编辑器 / 文件 / 同步。', 'done', 'P1', 'pmp-ms-2', 3),
    task('pmp-task-13', 'Vite proxy + Router 整合', 'dev:all 脚本、前后台路由合并。', 'done', 'P2', 'pmp-ms-2', 4),
    // V2.1 进行中 / 待办
    task('pmp-task-14', '同步历史记录与回滚', '增加同步日志表，支持查看与回滚。', 'todo', 'P1', 'pmp-ms-3', 0),
    task('pmp-task-15', '自动定时备份', '定时加密备份至 GitHub。', 'backlog', 'P2', 'pmp-ms-3', 1),
    task('pmp-task-16', '本地 vs 远程差异对比', '提供差异对比视图。', 'backlog', 'P2', 'pmp-ms-3', 2),
    // V3.0 部署
    task('pmp-task-17', 'GitHub Pages 部署前台', '静态构建 + Pages 发布。', 'todo', 'P1', 'pmp-ms-4', 0),
    task('pmp-task-18', '云服务器部署后端', 'Express 后端生产部署。', 'backlog', 'P2', 'pmp-ms-4', 1),
    task('pmp-task-19', '域名配置', '绑定自定义域名 + HTTPS。', 'backlog', 'P3', 'pmp-ms-4', 2),
    task('pmp-task-20', 'CI/CD 自动化', '提交触发的自动构建与部署。', 'backlog', 'P2', 'pmp-ms-4', 3),
  ];

  // ---- 风险（技术债务转化）----
  const risk = (
    id: string,
    title: string,
    description: string,
    category: RiskCategoryT,
    probability: 'low' | 'medium' | 'high' | 'critical',
    impact: 'low' | 'medium' | 'high' | 'critical',
    status: RiskStatusT,
    mitigation: string,
  ): Risk => ({
    id,
    projectId: PID,
    title,
    description,
    category,
    probability,
    impact,
    status,
    mitigation,
    contingency: '必要时回退到手动维护 JSON/MD 文件。',
    owner: OWNER,
    relatedTaskIds: [],
    relatedRequirementIds: [],
    identifiedAt: d('2026-08-07'),
    resolvedAt: null,
    createdAt: d('2026-08-07'),
    updatedAt: d('2026-08-07'),
  });

  const risks: Risk[] = [
    risk('pmp-risk-01', 'antd 打包体积过大', '管理后台 antd 导致 chunk > 500KB，影响首屏。', 'technical', 'medium', 'medium', 'monitoring', '按需加载 / 拆分 chunk。'),
    risk('pmp-risk-02', '管理后台无权限控制', '管理后台可直接访问，存在未授权修改风险。', 'other', 'high', 'high', 'identified', '增加简单密码验证（pmp-req-09）。'),
    risk('pmp-risk-03', '云同步无历史记录', '无法追溯同步历史与回滚。', 'technical', 'medium', 'medium', 'identified', '增加同步日志表（pmp-req-10）。'),
    risk('pmp-risk-04', '无访问统计', '无法了解访客行为，难以优化。', 'other', 'low', 'low', 'identified', '接入简单埋点（pmp-req-12）。'),
    risk('pmp-risk-05', '数据量增大后性能', '作品增多后纯前端 JSON 读取可能变慢。', 'technical', 'medium', 'medium', 'monitoring', '考虑迁移 SSG/SSR（pmp-req-13）。'),
  ];

  // ---- 写入（单事务批量）----
  await db.transaction(
    'rw',
    [
      db.projects,
      db.requirements,
      db.versions,
      db.prdDocuments,
      db.milestones,
      db.tasks,
      db.risks,
    ],
    async () => {
      await db.projects.put(project);
      await requirementOps.bulkAdd(requirements);
      await versionOps.bulkAdd(versions);
      await prdOps.bulkAdd(prds);
      await milestoneOps.bulkAdd(milestones);
      await taskOps.bulkAdd(tasks);
      await riskOps.bulkAdd(risks);
    },
  );

  // 首次种子：设为默认激活项目，使内容在前端直接可见
  await db.settings.update(SETTINGS_ID, { activeProjectId: PID }).catch(() => {});
}
