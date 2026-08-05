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

本项目已改造为**纯静态导出**（`next.config.mjs` 中 `output: 'export'`），构建产物为 `out/` 目录，可托管到任意静态服务器 / 对象存储 + CDN：

```bash
# 构建纯静态产物
npm run build
# 生成的 out/ 即为可部署的静态站点

# 本地预览静态产物（output:'export' 下 npm run start 不可用，改用静态服务器）
npx serve out
# 浏览器打开 http://localhost:3000
```

> 开发调试仍可用 `npm run dev`（热更新）。

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

本项目是**纯静态导出**（`next.config.mjs` 中 `output: 'export'` + `basePath: '/pm-sop'`），构建产物为 `out/`。两种部署方式任选其一。

### 方式一：GitHub Pages（零成本，推荐）

项目已配置 `basePath: '/pm-sop'`，可直接托管到 `https://<用户名>.github.io/pm-sop/`，手机/电脑均可访问，无需域名。

```bash
# 1. 构建静态产物（生成 out/）
npm run build

# 2. 推送到 GitHub（首次需先 push 源码到 main 分支）
git push origin main

# 3. 将 out/ 部署到 gh-pages 分支（需带 repo 权限的 Token）
#    下面命令会把 out/ 推到 gh-pages 分支；-t 会带上 .nojekyll（防止 GitHub 的 Jekyll 删掉 _next/）
GITHUB_TOKEN=你的Token npm run deploy:pages
# 或显式指定带 Token 的仓库地址：
# npx gh-pages -d out -b gh-pages -t -r https://<TOKEN>@github.com/<用户名>/pm-sop.git
```

部署完成后，在仓库 **Settings → Pages → Source** 选择 **Deploy from a branch**，分支选 `gh-pages`、目录选 `/root`，保存即可。
稍等 1–2 分钟，访问 `https://<用户名>.github.io/pm-sop/`。

> ⚠️ 注意：本项目已自动在 `out/` 中加入 `.nojekyll`，**切勿删除**，否则 GitHub Pages 的 Jekyll 会忽略 `_next/` 目录导致页面样式/脚本全部 404。

### 方式二：国内对象存储 + CDN（国内访问更快更稳）

> Vercel 的 `*.vercel.app` 国内访问不稳定；若 GitHub Pages 在国内访问也慢，可改用此方案。

1. 构建：`npm run build`（生成 `out/`）。
2. 将 `out/` 全部文件上传到 **腾讯云 COS / 阿里云 OSS / 七牛云**（开启静态网站 + 绑定域名）。
3. 通过 **CDN 开启 HTTPS**（PWA「添加到主屏」必须 HTTPS）。
4. 手机浏览器打开站点 → 「添加到主屏」，即获得接近原生 App 的体验（底部 Tab + 悬浮新建 + 底部抽屉弹窗 + 离线可用）。

详细的 COS/OSS 上传步骤、MIME 配置、HTTPS 与离线说明见 `docs/06-domestic-deploy.md`。

## 💡 数据存储说明

所有业务数据保存在**当前浏览器**的 IndexedDB 中（数据库名 `PMSOPDatabase`）。更换设备、清理站点数据或使用隐私模式会导致数据丢失，请务必通过「设置 → 数据管理」定期导出备份。

## 📝 文档

- `docs/01-prd.md` — 产品需求文档
- `docs/02-tech-architecture.md` — 技术架构
- `docs/03-database-schema.md` — 数据库表结构
- `docs/04-ui-design-guide.md` — UI 设计规范
- `docs/05-deployment-guide.md` — 部署指南（GitHub 推送 / Vercel 备选）
- `docs/06-domestic-deploy.md` — 国内托管部署指南（静态导出 + 对象存储 + CDN）
