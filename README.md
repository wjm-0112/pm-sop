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

# 2. 推源码到 main 分支（SSH 协议）
git push origin main

# 3. 推 out/ 到 gh-pages 分支（gh-pages 包自动处理 .nojekyll，SSH 协议）
npm run deploy:pages
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

## 💻 部署到其他电脑

### 前置条件：SSH Key 配置

本项目 Git 远程使用 SSH 协议（`git@github.com:wjm-0112/pm-sop.git`）。如果目标电脑尚未配置 GitHub SSH key，先执行：

```bash
# 生成 ED25519 key（如已有可跳过）
ssh-keygen -t ed25519 -C "your-device" -N "" -f ~/.ssh/id_ed25519

# 查看公钥
cat ~/.ssh/id_ed25519.pub
```

将输出的公钥粘贴到 **GitHub → Settings → SSH and GPG keys → New SSH key**，标题随意（如 `macbook` / `公司台式机`）。

### 方式一：完整源码（推荐，可开发修改）

```bash
# 1. 克隆仓库（SSH 协议，22 端口）
git clone git@github.com:wjm-0112/pm-sop.git
cd pm-sop

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000

# 4. （可选）生产构建 + 部署到 GitHub Pages
npm run build
npm run deploy:pages
```

> 🖥️ **WorkBuddy 用户**：pm-sop 代码和构建产物与 WorkBuddy 账号无关，`git clone` 其他电脑后即可正常开发和部署。但 `.workbuddy/` 目录（会话记忆、技能配置）**不在 Git 版本管理中**（已写入 `.gitignore`），每台电脑的 WorkBuddy 记忆独立。

### 方式二：仅运行（无需 Node.js 开发环境）

如果只想用、不修改代码，直接复制本机 `out/` 目录到目标电脑，然后用任意静态服务器托管：

```bash
# 2a — 最简单
npx serve out

# 2b — Python 内置
python -m http.server 3000 -d out

# 2c — Nginx / Apache
# 将 out/ 内容复制到 web 根目录即可
```

> ⚠️ 仅运行方式无法改源码。需要改代码请用方式一。

## ☁️ 跨设备数据同步

pm-sop 的业务数据存在浏览器 IndexedDB 中，**不会随 Git 自动携带**。跨设备同步数据请用内置的「云端同步」功能：

### 原理

```
[电脑A] IndexedDB ──🔐加密──▶ GitHub 仓库 sync/pm-sop-backup.enc.json
[电脑B] GitHub 仓库 ──🔓解密──▶ IndexedDB（按 ID 覆盖，本地独有保留）
```

数据全程**端到端加密**（Web Crypto API / AES-GCM 256-bit），密码只在你的设备上输入，云端只有乱码密文。PAT 仅作传输凭证，无法解密数据。

### 从旧电脑上传

1. 浏览器打开 https://wjm-0112.github.io/pm-sop/ → 左侧 **「设置」**
2. **云端同步** 卡片中：
   - 开启开关
   - 填入 **GitHub PAT**（需 `repo` 权限，[创建地址](https://github.com/settings/tokens)）
   - 输入一个**加密密码**（自行设定并记住——两电脑需相同）
   - 点击 **「上传到云端」**

### 到新电脑拉取

1. 在新电脑打开同一网址 → **「设置」**
2. 同样开启云端同步 → 填入**同一个 PAT**
3. 输入**与上传时相同的密码**（必须一致，否则解密失败）
4. 点击 **「从云端拉取」**

拉取策略：按 ID 覆盖已有记录，本地独有的保留（`merge` 模式）。

> ⚠️ 密码不保存到任何地方 —— 仅暂存在当前浏览器会话，关闭页面后需重新输入。建议使用密码管理器或记在安全位置。

### 备选：导出 / 导入 JSON

如果不想配置云端同步，也可以在设置中手动导出/导入 JSON 备份文件（通过 U 盘、网盘、微信等传输）：

- **旧电脑**：设置 → 数据管理 → 导出全量备份 (JSON)
- **新电脑**：设置 → 数据管理 → 导入数据 → 选择备份文件

## 💡 数据存储说明

所有业务数据保存在**当前浏览器**的 IndexedDB 中（数据库名 `PMSOPDatabase`）。更换设备、清理站点数据或使用隐私模式会导致数据丢失，请定期导出备份，或使用「设置 → 云端同步」将加密数据同步到 GitHub（详见上方「跨设备数据同步」章节）。

## 📝 文档

- `docs/01-prd.md` — 产品需求文档
- `docs/02-tech-architecture.md` — 技术架构
- `docs/03-database-schema.md` — 数据库表结构
- `docs/04-ui-design-guide.md` — UI 设计规范
- `docs/05-deployment-guide.md` — 部署指南（GitHub 推送 / Vercel 备选）
- `docs/06-domestic-deploy.md` — 国内托管部署指南（静态导出 + 对象存储 + CDN）
