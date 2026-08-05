/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages 项目页部署在 /pm-sop/ 子路径下，必须设置 basePath，否则 _next/ 资源与 manifest/sw 会 404
  basePath: '/pm-sop',
  // 静态导出：构建出纯静态 out/ 目录，可托管到任意静态服务器 / 对象存储 + CDN（国内访问友好）
  output: 'export',
  // 静态导出下图片优化不可用，关闭
  images: {
    unoptimized: true,
  },
  // 静态托管对尾斜杠更友好，并避免某些 CDN 的路由丢失
  trailingSlash: true,
};

export default nextConfig;
