# PM SOP 技术架构文档

> 版本：v1.0.0 ｜ 最后更新：2026-08-05

---

## 1. 整体架构

采用**前端分层架构**（无后端），三层职责清晰：

```
┌─────────────────────────────────────────────────────────┐
│                      表现层 (Presentation)                │
│   Next.js App Router Pages + React Components + Tailwind  │
│   - 页面路由 (26 个路由)                                   │
│   - UI 组件库 (原子组件 + 业务组件)                         │
└───────────────────────────┬─────────────────────────────┘
                            │ 调用
┌───────────────────────────┴─────────────────────────────┐
│                   业务逻辑层 (Business Logic)              │
│   Zustand Stores + Service Layer                          │
│   - 状态管理 (6 个 Store)                                  │
│   - 导出/导入/备份服务                                      │
│   - 校验与业务规则                                          │
└───────────────────────────┬─────────────────────────────┘
                            │ 读写
┌───────────────────────────┴─────────────────────────────┐
│                      数据层 (Data)                         │
│   Dexie.js (IndexedDB) + localStorage                     │
│   - 10 张表存储业务数据                                    │
│   - localStorage 存储 UI/设置状态                          │
└─────────────────────────────────────────────────────────┘
```

**数据流：**

```
用户交互 → React 组件 → Zustand Store (乐观更新) → Dexie CRUD → IndexedDB
                                                              ↓
数据变更 ← React 重渲染 ← Store 更新 ← 异步操作结果 ←──────────┘
```

---

## 2. 技术选型

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| Next.js | 14.x | 前端框架 | App Router、SSG/SSR、文件路由、Vercel 一键部署 |
| React | 18.x | UI 框架 | 组件化、生态成熟、并发特性 |
| TypeScript | 5.x | 类型安全 | 大型应用类型保障，减少运行时错误 |
| Tailwind CSS | 3.x | 样式方案 | 原子化 CSS、开发快、易于统一设计系统 |
| Dexie.js | 4.x | IndexedDB 封装 | 简洁 API、TypeScript 一流支持、索引灵活 |
| Zustand | 4.x | 状态管理 | 轻量无 boilerplate、支持 persist 中间件 |
| next-pwa | 5.x | PWA 支持 | 开箱即用 Service Worker 与 manifest 集成 |
| @dnd-kit | 6.x | 看板拖拽 | React 18 兼容（react-beautiful-dnd 已废弃）、无障碍好 |
| @tiptap/react | 2.x | 富文本编辑 | 基于 ProseMirror、可扩展、React 友好 |
| recharts | 2.x | 图表可视化 | 声明式 React 图表，竞品雷达图/风险矩阵 |
| date-fns | 3.x | 日期处理 | 轻量、tree-shakeable、无时区副作用 |
| uuid | 9.x | ID 生成 | 标准 UUID v4 |
| xlsx (SheetJS) | 0.18.x | Excel/CSV | 多 Sheet 导出、CSV 兼容 |
| file-saver | 2.x | 文件下载 | 浏览器端触发下载 |
| clsx + tailwind-merge | 2.x/2.x | 类名合并 | 变体系统与条件样式 |
| lucide-react | 0.35x | 图标库 | 轻量、开源、样式统一 |

---

## 3. 路由设计

| 路径 | 页面 | 模块 |
|------|------|------|
| `/` | 仪表盘首页 | 全局 |
| `/requirements` | 需求列表 | 需求管理 |
| `/requirements/new` | 新建需求 | 需求管理 |
| `/requirements/[id]` | 需求详情 | 需求管理 |
| `/requirements/[id]/edit` | 编辑需求 | 需求管理 |
| `/planning` | 产品路线图 | 产品规划 |
| `/planning/versions` | 版本列表 | 产品规划 |
| `/planning/versions/new` | 新建版本 | 产品规划 |
| `/planning/versions/[id]` | 版本详情 | 产品规划 |
| `/planning/versions/[id]/edit` | 编辑版本 | 产品规划 |
| `/planning/prd` | PRD 列表 | 产品规划 |
| `/planning/prd/new` | 新建 PRD | 产品规划 |
| `/planning/prd/[id]` | PRD 编辑 | 产品规划 |
| `/planning/prd/[id]/preview` | PRD 预览 | 产品规划 |
| `/projects` | 看板视图 | 项目推进 |
| `/projects/tasks` | 任务列表 | 项目推进 |
| `/projects/tasks/new` | 新建任务 | 项目推进 |
| `/projects/tasks/[id]` | 任务详情 | 项目推进 |
| `/projects/tasks/[id]/edit` | 编辑任务 | 项目推进 |
| `/projects/milestones` | 里程碑列表 | 项目推进 |
| `/projects/milestones/[id]` | 里程碑详情 | 项目推进 |
| `/projects/risks` | 风险矩阵 | 项目推进 |
| `/projects/risks/[id]` | 风险详情 | 项目推进 |
| `/analysis` | 分析总览 | 竞品分析 |
| `/analysis/competitors` | 竞品列表 | 竞品分析 |
| `/analysis/competitors/new` | 新增竞品 | 竞品分析 |
| `/analysis/competitors/[id]` | 竞品详情 | 竞品分析 |
| `/analysis/competitors/[id]/edit` | 编辑竞品 | 竞品分析 |
| `/analysis/market` | 市场调研列表 | 竞品分析 |
| `/analysis/market/new` | 新增调研 | 竞品分析 |
| `/analysis/market/[id]` | 调研详情 | 竞品分析 |
| `/analysis/market/[id]/edit` | 编辑调研 | 竞品分析 |
| `/analysis/personas` | 用户画像列表 | 竞品分析 |
| `/analysis/personas/new` | 新增画像 | 竞品分析 |
| `/analysis/personas/[id]` | 画像详情 | 竞品分析 |
| `/analysis/personas/[id]/edit` | 编辑画像 | 竞品分析 |
| `/analysis/journeys` | 旅程地图列表 | 竞品分析 |
| `/analysis/journeys/[id]` | 旅程详情 | 竞品分析 |
| `/settings` | 设置页面 | 全局 |

---

## 4. 组件层级

```
AppShell (layout.tsx)
├── OfflineIndicator          离线提示条
├── Sidebar / MobileNav       导航（响应式切换）
└── Main Content
    ├── Header + Breadcrumb   顶部栏 + 面包屑
    └── Page Content
        ├── Dashboard
        │   ├── StatsCard ×4
        │   ├── RecentRequirements
        │   ├── TaskProgress
        │   ├── ActiveMilestones
        │   └── QuickActions
        ├── Requirements
        │   ├── RequirementFilter + SearchInput
        │   ├── RequirementTable / RequirementCard[]
        │   ├── Pagination
        │   └── ExportMenu
        ├── Planning
        │   ├── RoadmapTimeline → VersionCard[]
        │   └── PRDEditor (@tiptap/react)
        ├── Projects
        │   ├── KanbanBoard → KanbanColumn ×5 → KanbanCard[]
        │   ├── MilestoneTimeline
        │   └── RiskMatrix → RiskCard[]
        └── Analysis
            ├── CompetitiveMatrix → FeatureComparison (雷达图)
            └── PersonaCard / JourneyMap
```

---

## 5. 状态管理

- **6 个 Zustand Store**：需求、规划、项目、分析、设置、UI
- **持久化**：UI 状态（主题、侧边栏、筛选条件）通过 `persist` 中间件存 localStorage
- **数据缓存**：业务数据从 IndexedDB 加载到 Store 作为缓存层
- **乐观更新**：先更新 Store 立即渲染，再异步写 DB，失败时回滚

---

## 6. 安全考虑

1. 所有业务数据存于客户端 IndexedDB，**无服务端 API**，无网络传输风险
2. 外链统一 `target="_blank" rel="noopener noreferrer"`
3. 富文本（TipTap HTML）渲染前做 XSS 过滤（DOMPurify 或白名单）
4. 数据导出时 UI 提示用户注意数据敏感性
5. PWA manifest 不含任何敏感信息
6. 附件以 base64 存本地，不上传任何服务器

---

## 7. 部署架构

```
开发者本地 (npm run build)
        │
        ▼ git push (HTTPS + Token)
GitHub 私有仓库 wjm-0112/pm-sop
        │ (push to main 触发)
        ▼
Vercel 自动构建 (next build) → 静态 + Serverless
        │
        ├── Web: https://pm-sop.vercel.app
        └── PWA: 可安装到桌面/移动端主屏幕
```

**构建输出**：Next.js 默认 `.next` 目录；PWA 插件生成 `sw.js` 与预缓存清单。
