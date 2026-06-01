const CACHE = 'app-v6';

// The injectManifest plugin requires this reference:
self.__WB_MANIFEST;

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    e.request.mode === 'navigate' ? navHandler(e) : assetHandler(e)
  );
});

async function navHandler(e) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(e.request, { ignoreSearch: true });
  if (cached) return cached;
  const idx = await cache.match('/index.html', { ignoreSearch: true });
  if (idx) return idx;
  try {
    const resp = await fetch(e.request);
    if (resp.ok) { cache.put(e.request, resp.clone()); cache.put('/index.html', resp.clone()); }
    return resp;
  } catch {
    const keys = await cache.keys();
    for (const key of keys) {
      if (key.url.endsWith('.html')) return cache.match(key);
    }
    return new Response('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f0f4f0;color:#2d6a4f}</style></head><body><h2>Offline</h2><p style="color:#666">Please connect to the internet first, then try again.</p></body></html>', {
      status: 200, headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function assetHandler(e) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(e.request);
  if (cached) return cached;
  try {
    const resp = await fetch(e.request);
    if (resp.ok) cache.put(e.request, resp.clone());
    return resp;
  } catch {
    return new Response('', { status: 404 });
  }
}
