const C = 'plus-v1', FILES = ['./', 'index.html', 'style.css', 'app.js', 'icon.svg', 'manifest.webmanifest'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(C).then((c) => c.addAll(FILES))));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x))))));
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/')) return; // الحالة دايماً من السيرفر
  e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
