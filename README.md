# PM SOP — 产品经理业务工作台

一款**贯穿产品经理完整业务 SOP** 的本地优先（Local-First）业务型软件，覆盖从需求、规划、项目推进到竞品与市场分析的四大核心模块。数据默认存储于浏览器本地（IndexedDB），无需后端服务器即可在网页端与移动端使用，并支持安装为 PWA 离线应用。

## ✨ 功能概览

| 模块 | 说明 |
| --- | --- |
| **需求管理** | 需求全生命周期：草稿 → 评审 → 通过/拒绝 → 实现 → 关闭；支持优先级、来源、标签、变更日志 |
| **产品规划** | 版本规划（Roadmap 时间线）、PRD 富文本编辑与预览 |
| **项目推进** | 看板（Kanban）任务跟踪、里程碑、风险管理 |
| **竞品与市场分析** | 竞品能力矩阵 + 功能对比雷达图、市场调研、用户画像与用户旅程地图 |

通用能力：

- 🌗 浅色 / 深色 / 跟随系统 主题切换
- 📦 数据导出：JSON / CSV / Excel（按模块或全量备份）
- 📥 数据导入：合并 / 全量替换 / 仅追加（兼容本应用导出的 JSON）
- 📱 响应式布局 + PWA（可安装到桌面 / 手机主屏，支持离线）
- 🔒 数据仅存于本机浏览器，隐私优先

## 🧱 技术栈

- **框架**：[Next.js 14](https://nextjs.org/)（App Router）+ React 18 + TypeScript
- **样式**：Tailwind CSS 3（自定义设计令牌，现代简约风格，参考 Notion / Linear）
- **本地存储**：[Dexie.js](https://dexie.org/)（IndexedDB 封装）
- **状态管理**：Zustand
- **富文本**：TipTap
- **拖拽**：@dnd-kit（看板）
- **图表**：Recharts（雷达图）
- **导出**：SheetJS（xlsx）
- **PWA**：Manifest + Service Worker（离线缓存）

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

## 🏗️ 生产构建

```bash
npm run build
npm run start
```

## 📁 目录结构

```
src/
├── app/                 # 页面（路由）
│   ├── analysis/        # 竞品与市场分析（竞品 / 市场调研 / 用户画像）
│   ├── planning/        # 产品规划（版本 / PRD）
│   ├── projects/        # 项目推进（看板 / 任务 / 里程碑 / 风险）
│   ├── requirements/    # 需求管理
│   └── settings/        # 设置（主题 / 备份 / 导入导出）
├── components/          # UI 组件与业务组件
├── db/                  # Dexie 数据库与 CRUD 工厂
├── stores/              # Zustand 状态
├── services/            # 导出 / 导入服务
├── lib/                 # 类型、常量、工具函数
└── providers/           # 主题 / PWA Provider
docs/                    # 需求与技术方案文档（PRD / 架构 / 数据库 / UI / 部署）
public/                  # 静态资源（manifest.json / sw.js / icon.svg）
```

## ☁️ 部署

本项目为纯静态前端，可一键部署到 [Vercel](https://vercel.com/)：

1. 将仓库推送到 GitHub（见下方说明）。
2. 在 Vercel 导入该仓库，框架选择 **Next.js**（默认配置即可）。
3. 构建命令 `npm run build`、输出目录由 Vercel 自动处理。
4. 部署完成后，手机端浏览器访问站点即可「添加到主屏」安装为 App。

详细的仓库创建、令牌推送与 Vercel 配置步骤见 `docs/05-deployment-guide.md`。

## 💡 数据存储说明

所有业务数据保存在**当前浏览器**的 IndexedDB 中（数据库名 `PMSOPDatabase`）。更换设备、清理站点数据或使用隐私模式会导致数据丢失，请务必通过「设置 → 数据管理」定期导出备份。

## 📝 文档

- `docs/01-prd.md` — 产品需求文档
- `docs/02-tech-architecture.md` — 技术架构
- `docs/03-database-schema.md` — 数据库表结构
- `docs/04-ui-design-guide.md` — UI 设计规范
- `docs/05-deployment-guide.md` — 部署指南
