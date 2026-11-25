const SHELL = 'lm-shell-v1';
const VIDS = 'lm-videos';
const SHELL_FILES = ['./', 'jungle.html', 'prison.html', 'app.js', 'config.js', 'style.css',
  'manifest-jungle.json', 'manifest-prison.json',
  'img/gorille.jpg', 'img/gardien.jpg', 'img/aventuriere.jpg', 'img/soldat.jpg',
  'img/icon-jungle-180.png', 'img/icon-prison-180.png', 'img/icon-jungle-512.png', 'img/icon-prison-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

async function fromVideoCache(req) {
  const cache = await caches.open(VIDS);
  const url = new URL(req.url); url.search = '';
  const hit = await cache.match(url.href);
  if (!hit) return null;
  const range = req.headers.get('range');
  const blob = await hit.blob();
  const type = hit.headers.get('Content-Type') || 'video/mp4';
  if (!range) {
    return new Response(blob, { status: 200, headers: { 'Content-Type': type, 'Content-Length': blob.size, 'Accept-Ranges': 'bytes' } });
  }
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  let start = m && m[1] ? parseInt(m[1], 10) : 0;
  let end = m && m[2] ? parseInt(m[2], 10) : blob.size - 1;
  if (!m[1] && m[2]) { start = blob.size - parseInt(m[2], 10); end = blob.size - 1; }
  end = Math.min(end, blob.size - 1);
  return new Response(blob.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': type, 'Content-Length': end - start + 1,
    'Content-Range': `bytes ${start}-${end}/${blob.size}`, 'Accept-Ranges': 'bytes' } });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.includes('/videos/')) {
    e.respondWith(fromVideoCache(req).then(r => r || fetch(req)));
    return;
  }
  // Pages et fichiers de l'appli : réseau d'abord (pour les mises à jour), sinon la copie sur l'iPad.
  e.respondWith(fetch(req).then(res => {
    if (res.ok && url.origin === location.origin) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true })));
});
