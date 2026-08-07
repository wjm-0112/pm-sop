# PM Portfolio 作品展示站 — 技术架构文档

> 版本：v2.0.0 ｜ 最后更新：2026-08-07

---

## 1. 整体架构

采用**前后端分离架构**，前端 React SPA + Express API 后端：

```
┌─────────────────────────────────────────────────────────┐
│                   前端 (React 18 + Vite 5)               │
│                                                         │
│  ┌───────────────────┐  ┌───────────────────────────┐   │
│  │    前台展示层       │  │      管理后台层             │   │
│  │  / (首页)          │  │  /admin (若依风格)          │   │
│  │  /portfolios       │  │  /admin/dashboard          │   │
│  │  /timeline         │  │  /admin/profile             │   │
│  │                     │  │  /admin/portfolios          │   │
│  │  CSS Variables     │  │  Ant Design 5               │   │
│  │  CSS Modules       │  │  @uiw/react-md-editor       │   │
│  └────────┬──────────┘  └───────────┬───────────────┘   │
│           │                         │                    │
└───────────┼─────────────────────────┼────────────────────┘
            │        HTTP API         │
            └───────────┬─────────────┘
                        │
┌───────────────────────┴─────────────────────────────────┐
│                后端 (Express 4, :3001)                    │
│                                                         │
│  /api/profile       /api/portfolios    /api/upload       │
│  /api/files          /api/sync                            │
│                                                         │
│  ┌───────────────────┐  ┌────────────────────────────┐   │
│  │  fileStore.ts     │  │  githubSync.ts + crypto.ts  │   │
│  │  JSON/MD 读写     │  │  AES 加密 + GitHub API       │   │
│  └────────┬──────────┘  └────────────────────────────┘   │
│           │                                               │
│  ┌────────▼──────────────────────────────────────────┐   │
│  │  public/data/          server/uploads/              │   │
│  │  profile.json          用户上传文件                  │   │
│  │  portfolios.json                                     │   │
│  │  markdown/*.md                                       │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**数据流：**

```
浏览器 → fetch(/api/xxx) → Express Router → fileStore 读写 JSON/MD → 返回数据
                                                                   ↓
用户编辑 → API PUT/POST → 文件更新 → 前台刷新后拉取最新数据
```

---

## 2. 技术选型

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| React | 18.3 | UI 框架 | 组件化、Hooks、生态成熟 |
| TypeScript | 5.5 | 类型安全 | 大型项目类型保障 |
| Vite | 5.4 | 构建工具 | 极速 HMR、原生 ESM、配置简洁 |
| React Router | 6.26 | 客户端路由 | 嵌套路由、声明式配置 |
| react-markdown | 9.0 | Markdown 渲染 | GFM 支持、React 组件化 |
| remark-gfm | 4.0 | GFM 扩展 | 表格、任务列表、删除线 |
| Ant Design | 5.x | 管理后台 UI | 企业级组件库、若依风格适配 |
| @uiw/react-md-editor | 4.x | Markdown 编辑器 | 分屏预览、开箱即用 |
| Express | 4.x | 后端服务 | 轻量、中间件生态 |
| multer | 1.x | 文件上传 | Express 标准文件上传中间件 |
| crypto-js | 4.x | AES 加解密 | 浏览器+Node 通用 |
| CSS Modules | - | 样式方案 | 组件级隔离、无运行时开销 |

---

## 3. 路由设计

### 前台路由（5 个）

| 路径 | 页面组件 | 说明 |
|------|---------|------|
| `/` | HomePage | 首页：个人资料 + 精选作品 |
| `/portfolios` | PortfolioListPage | 作品列表 + 筛选/搜索 |
| `/portfolios/:id` | PortfolioDetailPage | 作品详情 + Markdown 渲染 |
| `/timeline` | TimelinePage | 时间线视图 |
| `*` | NotFoundPage | 404 页面 |

### 管理后台路由（6 个）

| 路径 | 页面组件 | 说明 |
|------|---------|------|
| `/admin` | Dashboard | 仪表盘（统计 + 最近更新） |
| `/admin/profile` | ProfileManager | 个人资料管理 |
| `/admin/portfolios` | PortfolioManager | 作品列表管理 |
| `/admin/portfolios/:id` | PortfolioEditor | Markdown 编辑器 |
| `/admin/files` | FileManager | 文件管理 |
| `/admin/sync` | SyncSettings | 云同步配置 |

### 后端 API 路由（12 个）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/profile | 获取个人资料 |
| PUT | /api/profile | 更新个人资料 |
| GET | /api/portfolios | 获取作品列表 |
| POST | /api/portfolios | 新增作品 |
| PUT | /api/portfolios/:id | 更新作品元数据 |
| GET | /api/portfolios/:id/content | 获取作品 Markdown 内容 |
| PUT | /api/portfolios/:id/content | 保存作品 Markdown 内容 |
| DELETE | /api/portfolios/:id | 删除作品 |
| POST | /api/upload | 上传文件 |
| DELETE | /api/upload/:filename | 删除文件 |
| GET | /api/files | 文件列表 |
| POST | /api/sync/push | 加密推送至 GitHub |
| POST | /api/sync/pull | 从 GitHub 拉取并解密 |

---

## 4. 组件层级

### 前台组件树

```
<App>
  <Layout>
    <Header>                   导航栏（响应式汉堡菜单）
      └── Navigation           {首页, 作品列表, 时间线}
    </Header>
    <Outlet />                 React Router 渲染区域
    <Footer />
  </Layout>
</App>

--- 前台页面 ---

<HomePage>
  <ProfileSection>             个人资料区块
    <ProfileCard />            头像 + 姓名 + 职称 + Bio
    <SkillSection />           技能标签（按类别分组）
    <ExperienceSection />      工作经历时间线
  </ProfileSection>
  <PortfolioGrid>              精选作品网格
    <PortfolioCard /> × N      作品卡片
  </PortfolioGrid>
</HomePage>

<PortfolioListPage>
  <FilterBar>                  筛选栏
    <SearchInput />            关键词搜索
    <CategoryTabs />           分类选择
    <StatusFilter />           状态过滤
    <SortSelect />             排序选择
  </FilterBar>
  <PortfolioGrid>
    <PortfolioCard /> × N
  </PortfolioGrid>
</PortfolioListPage>

<PortfolioDetailPage>
  <Breadcrumb />               面包屑导航
  <PortfolioDetail>
    <PortfolioMeta />          元数据（分类/状态/日期/标签）
    <PortfolioContent>
      <MarkdownRenderer />     Markdown 正文渲染
    </PortfolioContent>
  </PortfolioDetail>
</PortfolioDetailPage>

<TimelinePage>
  <TimelineView>               时间线容器
    <TimelineCore>
      <TimelineItem /> × N    按年份分组的节点
    </TimelineCore>
  </TimelineView>
</TimelinePage>
```

### 管理后台组件树

```
<AdminLayout>                  若依风格布局
  <Sider>                      固定侧边栏
    <Logo />
    <Menu />                   菜单栏
  </Sider>
  <Layout>
    <Header>
      <CollapseButton />
      <BackToFrontendButton />
    </Header>
    <Breadcrumb />             动态面包屑
    <Content>
      <Outlet />              6 个管理页面
    </Content>
  </Layout>
</AdminLayout>
```

---

## 5. 数据架构

### 存储方案

```
public/data/
├── profile.json               # 个人资料 JSON
├── portfolios.json            # 作品列表 JSON（元数据索引）
├── markdown/
│   ├── prd-001.md             # 作品详情 Markdown
│   ├── prototype-001.md
│   └── ...
└── sync-config.json           # GitHub 同步配置（不提交）

server/uploads/                # 用户上传文件
├── 1691398000-abc123.png
└── ...
```

### 核心数据模型

```typescript
// 个人资料
interface Profile {
  id, name, title, avatar, bio, about, skills[], experiences[], contacts[], updatedAt
}

// 作品元数据
interface PortfolioMeta {
  id, title, category('prd'|'prototype'|'retrospective'),
  status('draft'|'completed'|'archived'),
  summary, thumbnail?, tags[], createdAt, updatedAt, featured, markdownFile
}

// 作品详情
interface PortfolioDetail {
  meta: PortfolioMeta,
  content: string,       // Markdown 文本
  attachments?: { type, url, label }[]
}
```

---

## 6. 构建与部署

### 本地开发

```bash
# 终端 1：启动 Express API 后端
npm run server          # → http://localhost:3001

# 终端 2：启动 Vite 前端
npm run dev             # → http://localhost:3000 (proxy /api → :3001)
```

### 生产构建

```bash
npm run build           # tsc + vite build → dist/
```

### 部署方案

```
本地构建 (npm run build)
        │
        ▼ git push
GitHub 仓库 wjm-0112/PM-portfolios
        │
        ├── GitHub Pages (静态部署 dist/)
        └── 需单独启动 Express 后端 (server/)
```

> 纯静态部署仅支持前台展示。管理后台需要 Express 后端运行。

---

## 7. 安全考虑

1. 业务数据存于本地 JSON 文件，无数据库暴露风险
2. 管理后台 API 本地运行（:3001），不暴露公网
3. 云同步使用 AES 端到端加密，GitHub Token 仅作传输凭证
4. 上传文件限制 50MB，文件名校验防止路径遍历
5. Vite 生产构建自动压缩与 hash 文件名
