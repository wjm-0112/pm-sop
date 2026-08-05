/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
