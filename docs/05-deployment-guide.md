# PM SOP 部署指南

> 版本：v1.0.0 ｜ 最后更新：2026-08-05

---

## 1. 部署目标

| 目标 | 方式 |
|------|------|
| 网页端访问 | Vercel 部署（`https://pm-sop.vercel.app`） |
| 移动端访问 | PWA 安装到主屏幕（同一套代码，响应式 + 离线） |
| 代码托管 | GitHub 私有仓库 `wjm-0112/pm-sop` |

---

## 2. GitHub 仓库创建与推送

### 2.1 创建私有仓库

1. 登录 GitHub → New repository
2. Repository name：`pm-sop`
3. Visibility：**Private**
4. 不勾选 Initialize with README（代码已含 README）
5. 点击 Create repository

### 2.2 创建 Personal Access Token

> 用户需自行创建 Token 用于推送认证（机器人无法代创建）。

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. 权限勾选：`repo`（完整私有仓库读写）；如需 Actions 再加 `workflow`
4. Expiration：建议 30 天
5. 生成后**立即复制保存**（仅显示一次）

### 2.3 本地初始化并推送

```bash
cd C:/Work_Product/PM_wjm/pm_sop
git init
git add .
git commit -m "feat: initial PM SOP application"
git branch -M main
git remote add origin https://github.com/wjm-0112/pm-sop.git
```

**使用 Token 推送（二选一）：**

方式 A — 命令行内联（一次性）：
```bash
git push https://wjm-0112:<YOUR_TOKEN>@github.com/wjm-0112/pm-sop.git -u origin main
```

方式 B — 配置凭据助手（推荐，避免明文）：
```bash
git config --global credential.helper manager-core
git push -u origin main   # 首次弹窗输入用户名+Token，后续记住
```

> **安全提示**：请勿将 Token 写入脚本文件或提交到仓库；用毕及时撤销。

---

## 3. Vercel 部署

### 3.1 关联仓库

1. 登录 [vercel.com](https://vercel.com)（可用 GitHub 账号授权登录）
2. Add New → Project → 导入 `wjm-0112/pm-sop`
3. Framework Preset 自动识别为 **Next.js**

### 3.2 构建设置（通常默认即可）

| 项 | 值 |
|----|-----|
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node Version | 18.x 或 20.x |

### 3.3 环境变量

当前阶段无需特殊环境变量。若后续接入后端，将对应变量填入 Vercel Dashboard → Project → Settings → Environment Variables。

### 3.4 域名

- 默认分配：`https://pm-sop.vercel.app`
- 可选：Settings → Domains 绑定自定义域名

### 3.5 自动部署

- 推送到 `main` 分支自动触发生产部署
- 开 PR 自动生成 Preview Deployment 预览链接
- 部署失败可在 Deployments 页查看构建日志

---

## 4. PWA 配置要点

### 4.1 文件清单

```
public/manifest.json      PWA 清单
public/sw.js              Service Worker (由 next-pwa 生成/维护)
public/icons/icon-*.png   8 个尺寸图标 (72/96/128/144/152/192/384/512)
```

### 4.2 manifest.json 示例

```json
{
  "name": "PM SOP - 产品经理工作台",
  "short_name": "PM SOP",
  "description": "产品经理标准化工作流程管理工具",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#3B82F6",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 4.3 next.config.mjs 集成

```js
import withPWA from 'next-pwa';

const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default withPWAConfig({ /* next config */ });
```

---

## 5. 移动端验证清单

1. 手机浏览器打开 `https://pm-sop.vercel.app`
2. **安装**：
   - Android Chrome：地址栏出现"安装应用"图标，或菜单 → 安装应用
   - iOS Safari：分享 → 添加到主屏幕
3. **离线验证**：
   - 首次在线加载后开启飞行模式
   - 刷新页面，应用正常加载
   - 新建/编辑数据正常，关闭飞行模式后数据仍在
4. **Service Worker**：Chrome DevTools → Application → Service Workers 显示 active

---

## 6. 回滚与维护

- **代码回滚**：Vercel 部署历史可一键回退到任意版本
- **数据备份**：应用内设置页可导出 JSON；建议定期备份
- **依赖升级**：`npm update` 后本地 `npm run build` 验证再推送
