/* PM SOP Service Worker — 离线优先（App Shell 预缓存 + 导航 network-first 兜底）
 * 兼容子路径部署（如 GitHub Pages 的 /pm-sop/）：从自身 URL 推导 base。 */
const BASE = self.location.pathname.replace(/\/sw\.js$/, '') || '/';
const CACHE = 'pm-sop-v2';
const PRECACHE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon.svg',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png',
  BASE + '/icons/icon-maskable-512.png',
  BASE + '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 导航请求：优先网络，失败回退到缓存页面，再回退到首页 App Shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const shell = await caches.match(BASE + '/index.html');
          return shell || caches.match(BASE + '/');
        })
    );
    return;
  }

  // 静态资源（_next/static、图标、字体）：cache-first，缺失时网络拉取并缓存
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
