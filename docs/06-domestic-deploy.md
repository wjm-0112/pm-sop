# 06 · 国内托管部署指南（静态导出 + 对象存储 + CDN）

> 适用场景：Vercel 在国内访问不稳定/被墙，导致「一直跳转不出页面」。
> 本应用已改造为 **纯静态导出**（`next.config.mjs` 中 `output: 'export'`），
> 构建产物是 `out/` 目录，可托管到任意静态服务器 / 对象存储 + CDN，**国内访问极快、近乎零成本**。

---

## 一、本地构建与预览

```bash
# 1) 构建纯静态产物（生成 out/ 目录）
npm run build

# 2) 本地预览静态产物（output:'export' 下 npm run start 不可用，改用静态服务器）
npx serve out          # 或 python3 -m http.server 静态服务 out/
# 浏览器打开 http://localhost:3000

# 开发调试（热更新）仍然可用：
npm run dev            # 打开 http://localhost:3000
```

> 注意：`output: 'export'` 仅影响 `next build` / `next start`；
> `next dev` 不受影响，本地改代码调试照常。

---

## 二、托管到国内对象存储（任选其一）

### 方案 1：腾讯云 COS（推荐，国内最快）

1. 登录 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos) → 新建存储桶
   - 名称随意，地域选离你近的（如「广州」）
   - **访问权限：公有读私有写**（静态网站需要公开读取）
2. 将本地 `out/` 目录**全部文件**上传到存储桶根目录
   - 可用 COSBrowser 客户端拖拽，或用命令行工具 `coscli`
3. 开启「静态网站」功能
   - 索引文档：`index.html`
   - 错误文档：`404.html`
4. 绑定自定义域名（可选但推荐）+ 开启 **CDN 加速**
   - CDN 默认提供 HTTPS，PWA「添加到主屏幕」**必须 HTTPS**
5. 访问你的域名即可，手机浏览器打开 → 「添加到主屏幕」即变成可离线 App

### 方案 2：阿里云 OSS

1. 登录 [OSS 控制台](https://oss.console.aliyun.com) → 新建 Bucket
   - 读写权限：**公共读**
2. 上传 `out/` 全部文件到 Bucket 根目录
3. 开通「静态页面」：默认首页 `index.html`，404 页 `404.html`
4. 绑定域名 + 开启「CDN 加速」（HTTPS 必需）
5. 访问域名

### 方案 3：七牛云 Kodo / 又拍云
流程类似：上传 `out/` → 开启静态网站 → 绑域名 + CDN（HTTPS）。

---

## 三、关键注意事项

### 1. MIME 类型（重要）
静态托管需正确返回以下类型，否则 PWA 安装/资源加载会失败：

| 文件 | Content-Type |
|---|---|
| `*.json`（manifest） | `application/manifest+json` 或 `application/json` |
| `*.webmanifest` | `application/manifest+json` |
| `*.js` | `application/javascript` |
| `*.svg` | `image/svg+xml` |
| `*.png` | `image/png` |

腾讯云/阿里云一般已自动识别，若安装 PWA 失败，先排查 manifest 的 MIME。

### 2. `trailingSlash: true`
`next.config.mjs` 已开启，生成的路由形如 `/requirements/detail/index.html`，
对对象存储的「目录式」访问更友好，避免 CDN 路由丢失。

### 3. HTTPS 是 PWA 安装的前提
「添加到主屏幕」「可离线」要求页面在 **HTTPS 或 localhost** 下打开。
纯 HTTP 域名无法安装 PWA。务必通过 CDN 开启 HTTPS。

### 4. Service Worker 与离线
`public/sw.js` 在首次访问后缓存 App Shell（HTML/JS/CSS/图标）。
已访问过的页面在断网后仍可打开；首次访问的新深链需先联网一次。

---

## 四、重新部署流程（改代码后）

```bash
npm run build                 # 重新生成 out/
# 把 out/ 目录重新上传覆盖到 COS/OSS 即可（可配合 CDN 刷新预热）
```

---

## 五、为什么这样最合适本产品

- **本地优先**：数据存在用户各自设备的浏览器 IndexedDB，无需后端、无需数据库。
- **零运维**：对象存储 + CDN 几乎不用维护，成本低（几元/月）。
- **国内可达**：彻底绕开 Vercel 被墙问题。
- **PWA**：手机「添加到主屏幕」即获得接近原生 App 的体验（底部 Tab + 悬浮新建 + 底部抽屉 + 离线可用）。

> 若日后需要「多设备数据云同步」，再引入后端（Supabase/Firebase 等）+ 账号体系，
> 不在本次范围。
