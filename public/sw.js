// Offline shell for tablets on the factory floor: cache app files, serve them when Wi-Fi drops.
const CACHE = 'wf-eqms-v1';
const SHELL = ['/', '/css/app.css', '/js/app.js', '/js/core.js', '/js/charts.js', '/js/pages/dashboard.js', '/js/pages/documents.js', '/js/pages/module.js', '/js/pages/org.js', '/js/pages/reports.js', '/js/pages/tools.js', '/img/logo.png', '/manifest.json'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(CACHE).then((ch) => ch.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then((m) => m || caches.match('/'))));
});
